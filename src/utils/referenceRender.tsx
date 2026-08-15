import { Text } from "react-native";
import { P5_FUNCTION_NAMES } from "../data/reference";
import { getEditorTheme } from "./editor/themes";

const SYMBOL_PATTERN = new RegExp(
  `\\b(${P5_FUNCTION_NAMES.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b(?=\\()`,
  "g"
);

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
  "MITER", "BEVEL", "ROUND",
  "ARROW", "CROSS", "HAND", "MOVE", "TEXT", "WAIT",
  "SHIFT", "CONTROL", "ALT", "OPTION", "BACKSPACE", "DELETE", "ENTER", "RETURN",
  "TAB", "ESCAPE", "UP_ARROW", "DOWN_ARROW", "LEFT_ARROW", "RIGHT_ARROW",
  "AMBIENT", "DIRECTIONAL", "POINT", "SPOT",
  "LINE_LOOP", "LINE_STRIP", "TRIANGLES", "TRIANGLE_FAN", "TRIANGLE_STRIP",
  "QUADS", "QUAD_STRIP", "TESS",
  "POINTS", "LINES",
];

const P5_CONSTANTS_PATTERN = P5_CONSTANTS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

export function highlightSyntax(code: string, colorScheme?: "light" | "dark"): { text: string; color: string }[] {
  const theme = getEditorTheme("p5-learn", colorScheme || "dark");
  const COMMENT_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
  const STRING_RE = /("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)/g;
  const KEYWORD_RE = /\b(function|if|else|for|while|do|switch|case|break|continue|return|new|delete|typeof|instanceof|in|of|class|extends|super|try|catch|finally|throw)\b/g;
  const DECL_RE = /\b(let|const|var|static)\b/g;
  const LITERAL_RE = /\b(true|false|null|undefined|this|NaN|Infinity)\b/g;
  const P5_RE = new RegExp(`\\b(${P5_FUNCTION_NAMES.join("|")})\\b(?=\\s*\\()`, "g");
  const P5_DOT_RE = new RegExp(`(?<=\\.)(${P5_FUNCTION_NAMES.join("|")})\\b(?=\\s*\\()`, "g");
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
    [P5_DOT_RE, theme.function],
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

const DESCRIBE_RE = /describe\s*\(\s*(["'])((?:(?!\1).)*)\1\s*\)\s*;?\s*/g;

export function extractDescribeCaption(code: string): string | null {
  DESCRIBE_RE.lastIndex = 0;
  const match = DESCRIBE_RE.exec(code);
  return match ? match[2] : null;
}

export function stripDescribe(code: string): string {
  return code.replace(DESCRIBE_RE, "").trim();
}

export function renderHighlightedCode(
  code: string,
  colorScheme: "light" | "dark",
  style: object = {},
): React.ReactNode {
  const tokens = highlightSyntax(code, colorScheme);
  return tokens.map((t, i) => (
    <Text key={i} style={{ ...style, color: t.color }}>
      {t.text}
    </Text>
  ));
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

  SYMBOL_PATTERN.lastIndex = 0;

  while ((match = SYMBOL_PATTERN.exec(text)) !== null) {
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