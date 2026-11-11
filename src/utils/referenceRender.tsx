import { Text } from "react-native";
import { buildP5SymbolPattern } from "../data/reference";
import type { ColorScheme } from "../constants/Colors";
import { getEditorTheme } from "./editor/themes";

const P5_CONSTANTS = [
  "WIDTH", "HEIGHT", "PI", "TWO_PI", "HALF_PI", "QUARTER_PI", "TAU", "EPSILON",
  "CENTER", "CORNER", "LEFT", "RIGHT", "TOP", "BOTTOM", "BASELINE", "TOP_LEFT",
  "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT", "CENTER_CENTER", "LEFT_CENTER",
  "RIGHT_CENTER", "TOP_CENTER", "BOTTOM_CENTER",
  "RGB", "HSB", "HSL", "HSBA", "RGBA", "WEBGL", "P2D", "P3D",
  "NORMAL", "IMAGE", "CLAMP", "REPEAT", "MIRROR",
  "OPEN", "CLOSE", "CHORD", "PIE", "SQUARE", "ROUND", "PROJECT", "MITER", "BEVEL",
  "BLEND", "ADD", "SUBTRACT", "DIFFERENCE", "MULTIPLY", "SCREEN", "REPLACE",
  "EXCLUSION", "DARKEST", "LIGHTEST", "OVERLAY", "HARD_LIGHT", "SOFT_LIGHT",
  "DODGE", "BURN",
  "LINEAR", "QUADRATIC", "CUBIC", "EXPONENTIAL", "SINE", "COSINE",
  "ARROW", "CROSS", "HAND", "MOVE", "TEXT", "WAIT",
  "SHIFT", "CONTROL", "ALT", "OPTION", "BACKSPACE", "DELETE", "ENTER", "RETURN",
  "TAB", "ESCAPE", "UP_ARROW", "DOWN_ARROW", "LEFT_ARROW", "RIGHT_ARROW",
  "AMBIENT", "DIRECTIONAL", "POINT", "SPOT",
  "LINE_LOOP", "LINE_STRIP", "TRIANGLES", "TRIANGLE_FAN", "TRIANGLE_STRIP",
  "QUADS", "QUAD_STRIP", "TESS",
  "POINTS", "LINES",
];

const P5_CONSTANTS_PATTERN = P5_CONSTANTS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

export function highlightSyntax(code: string, colorScheme?: ColorScheme): { text: string; color: string }[] {
  const theme = getEditorTheme("p5-learn", colorScheme || "dark");
  const COMMENT_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
  const STRING_RE = /("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)/g;
  const KEYWORD_RE = /\b(function|if|else|for|while|do|switch|case|break|continue|return|new|delete|typeof|instanceof|in|of|class|extends|super|try|catch|finally|throw)\b/g;
  const DECL_RE = /\b(let|const|var|static)\b/g;
  const LITERAL_RE = /\b(true|false|null|undefined|this|NaN|Infinity)\b/g;
  const P5_RE = buildP5SymbolPattern() ?? /$^/g;
  const CONST_RE = new RegExp(`\\b(${P5_CONSTANTS_PATTERN})\\b`, "g");
  const NUMBER_RE = /\b0[xX][0-9a-fA-F]+\b|\b\d+(\.\d+)?(?:[eE][+-]?\d+)?\b/g;
  const OP_RE = /(=>|<=|>=|===|!==|==|!=|&&|\|\||[-+*/%&|^!<>=]|[{[\]();,.])/g;

  const allMatches: { index: number; text: string; color: string }[] = [];
  const patterns: [RegExp, string][] = [
    [COMMENT_RE, theme.comment],
    [STRING_RE, theme.string],
    [DECL_RE, theme.definitionKeyword || theme.keyword],
    [KEYWORD_RE, theme.keyword],
    [LITERAL_RE, theme.constant || theme.number],
    [CONST_RE, theme.constant || theme.number],
    [NUMBER_RE, theme.number],
    [P5_RE, theme.function],
    [OP_RE, theme.operator],
  ];
  for (const [re, color] of patterns) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(code)) !== null) {
      allMatches.push({ index: match.index, text: match[0], color });
    }
  }
  allMatches.sort((a, b) => a.index - b.index);

  const tokens: { text: string; color: string }[] = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.index < lastEnd) continue;
    if (m.index > lastEnd) {
      tokens.push({ text: code.slice(lastEnd, m.index), color: theme.fg });
    }
    tokens.push({ text: m.text, color: m.color });
    lastEnd = m.index + m.text.length;
  }
  if (lastEnd < code.length) {
    tokens.push({ text: code.slice(lastEnd), color: theme.fg });
  }
  return tokens.length > 0 ? tokens : [{ text: code, color: theme.fg }];
}

export type DescriptionBlock =
  | { type: "text"; text: string }
  | { type: "code"; code: string; language: string; example: boolean };

const HTML_CODE_BLOCK_RE = /<pre\b[^>]*>\s*<code\b([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;
const HTML_CLASS_RE = /\bclass\s*=\s*(["'])(.*?)\1/i;
const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g, (match, entity: string) => {
    if (entity[0] === "#") {
      const hex = entity[1]?.toLowerCase() === "x";
      const codePoint = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff) {
        return String.fromCodePoint(codePoint);
      }
      return match;
    }
    return HTML_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/**
 * Remove the HTML wrappers that p5.js-website uses around examples. Some
 * examples are malformed (the closing `</code></div>` can appear mid-sketch),
 * so every wrapper tag is removed. Tags such as `<h3>` inside JS strings and
 * comparison operators are left alone.
 */
export function sanitizeCode(raw: string): string {
  let code = String(raw ?? "").replace(/\r\n?/g, "\n").trim();
  const wrapped = /^<(?:div|pre|code)\b/i.test(code) || /<\/?(?:div|code)>/i.test(code);
  if (wrapped) {
    code = code.replace(/<\/?(?:div|pre|code)\b[^>]*>/gi, "");
  }
  return decodeHtmlEntities(code).replace(/^\n+|\n+$/g, "").trimEnd();
}

function fenceInfoFromAttributes(attributes: string): string {
  const classMatch = attributes.match(HTML_CLASS_RE);
  if (!classMatch) return "";
  const tokens = classMatch[2].split(/\s+/).filter(Boolean);
  const language = tokens.find((token) => token.startsWith("language-"))?.slice("language-".length);
  const isExample = tokens.includes("example");
  return [language, isExample ? "example" : ""].filter(Boolean).join(" ");
}

function makeCodeFence(code: string, info: string): string {
  const longestRun = Math.max(0, ...(code.match(/`+/g) ?? []).map((run) => run.length));
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  return `${fence}${info}\n${code}\n${fence}`;
}

function htmlCodeBlocksToFences(text: string): string {
  HTML_CODE_BLOCK_RE.lastIndex = 0;
  return text.replace(HTML_CODE_BLOCK_RE, (_match, attributes: string, code: string) => {
    return `\n\n${makeCodeFence(sanitizeCode(code), fenceInfoFromAttributes(attributes))}\n\n`;
  });
}

function findClosingFence(
  source: string,
  start: number,
  fenceLength: number,
): { start: number; end: number } | null {
  const runs = /`{3,}/g;
  runs.lastIndex = start;
  let match: RegExpExecArray | null;
  while ((match = runs.exec(source)) !== null) {
    if (match[0].length >= fenceLength) {
      return { start: match.index, end: match.index + match[0].length };
    }
  }
  return null;
}

function parseFenceInfo(info: string): { language: string; example: boolean } {
  const tokens = info.trim().split(/\s+/).filter(Boolean);
  return {
    language: tokens.find((token) => token !== "example") ?? "",
    example: tokens.includes("example"),
  };
}

/**
 * Split a reference description into prose and fenced code blocks. Every
 * fenced block is returned, even when it directly touches the previous/next
 * element. A fence with an `example` token in its info string is flagged so the
 * renderer can mount a preview pane; other fences only show highlighted code.
 */
export function parseDescriptionBlocks(text: string): DescriptionBlock[] {
  if (!text) return [];
  const source = htmlCodeBlocksToFences(String(text).replace(/\r\n?/g, "\n"));
  const blocks: DescriptionBlock[] = [];
  let index = 0;

  const pushText = (value: string) => {
    const trimmed = value.replace(/^\n+|\n+$/g, "").trim();
    if (trimmed) blocks.push({ type: "text", text: trimmed });
  };

  while (index < source.length) {
    const open = source.indexOf("```", index);
    if (open === -1) {
      pushText(source.slice(index));
      break;
    }

    let fenceLength = 3;
    while (source[open + fenceLength] === "`") fenceLength++;
    const infoEnd = source.indexOf("\n", open + fenceLength);
    if (infoEnd === -1) {
      pushText(source.slice(index));
      break;
    }

    const close = findClosingFence(source, infoEnd + 1, fenceLength);
    if (!close) {
      pushText(source.slice(index));
      break;
    }

    pushText(source.slice(index, open));
    const code = sanitizeCode(source.slice(infoEnd + 1, close.start));
    if (code) {
      blocks.push({
        type: "code",
        code,
        ...parseFenceInfo(source.slice(open + fenceLength, infoEnd)),
      });
    }
    index = close.end;
  }

  return blocks;
}

export function parseDescription(
  text: string,
  onSymbolPress: (name: string) => void,
  colors: Record<string, string>,
  accentColor?: string,
): React.ReactNode[] {
  if (!text) return [<Text key="empty" style={{ color: colors.textSecondary }} />];

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const seenSymbols = new Set<string>();
  const symbolPattern = buildP5SymbolPattern();

  if (!symbolPattern) {
    return [
      <Text key="full" style={{ color: colors.textSecondary }}>
        {text}
      </Text>,
    ];
  }

  symbolPattern.lastIndex = 0;

  while ((match = symbolPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`txt-${lastIndex}`} style={{ color: colors.textSecondary }}>
          {text.slice(lastIndex, match.index)}
        </Text>
      );
    }
    const symbolName = match[0];
    const isFirst = !seenSymbols.has(symbolName);
    seenSymbols.add(symbolName);
    if (isFirst) {
      parts.push(
        <Text
          key={`sym-${match.index}`}
          style={{ color: accentColor || colors.textSecondary, fontWeight: "700", textDecorationLine: "underline" }}
          onPress={() => onSymbolPress(symbolName)}
        >
          {symbolName}
        </Text>
      );
    } else {
      parts.push(
        <Text key={`sym-${match.index}`} style={{ color: colors.textSecondary }}>
          {symbolName}
        </Text>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <Text key={`txt-${lastIndex}`} style={{ color: colors.textSecondary }}>
        {text.slice(lastIndex)}
      </Text>
    );
  }

  return parts.length > 0 ? parts : [<Text key="full" style={{ color: colors.textSecondary }}>{text}</Text>];
}