import { Text } from "react-native";
import { P5_FUNCTION_NAMES } from "../data/reference";
import { getEditorTheme } from "./editor/themes";

const SYMBOL_PATTERN = new RegExp(
  `\\b(${P5_FUNCTION_NAMES.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b(?=\\()`,
  "g"
);

export function highlightSyntax(code: string, colorScheme?: "light" | "dark"): { text: string; color: string }[] {
  const theme = getEditorTheme("p5-learn", colorScheme || "dark");
  const KEYWORD_RE = /\b(function|if|else|for|while|return|let|const|var|new|this|class)\b/g;
  const P5_RE = new RegExp(`\\b(${P5_FUNCTION_NAMES.join("|")})\\b(?=\\()`, "g");
  const NUMBER_RE = /\b\d+(\.\d+)?\b/g;
  const STRING_RE = /("[^"]*"|'[^']*'|`[^`]*`)/g;
  const COMMENT_RE = /(\/\/.*)/g;
  const OP_RE = /([{}[\]();,.]|=>|[-+*/%&|^!<>=]=?)/g;

  const allMatches: { index: number; text: string; color: string }[] = [];
  const patterns: [RegExp, string][] = [
    [COMMENT_RE, theme.comment],
    [STRING_RE, theme.string],
    [KEYWORD_RE, theme.keyword],
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