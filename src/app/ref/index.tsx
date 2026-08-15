import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from "react-native";
import Header from "../../components/Header";
import { P5_SYMBOLS_BY_NAME, P5_SYMBOLS, P5_FUNCTION_NAMES } from "../../data/p5Symbols";
import { P5Symbol } from "../../data/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import { useModuleProgress } from "../../hooks/useModuleProgress";

const MODULE_GROUPS = P5_SYMBOLS.reduce<{ module: string; symbols: P5Symbol[] }[]>((acc, sym) => {
  const existing = acc.find((g) => g.module === sym.module);
  if (existing) {
    existing.symbols.push(sym);
  } else {
    acc.push({ module: sym.module, symbols: [sym] });
  }
  return acc;
}, []);

const SYMBOL_PATTERN = new RegExp(
  `\\b(${P5_FUNCTION_NAMES.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b(?=\\()`,
  "g"
);

function highlightSyntax(code: string): { text: string; color: string }[] {
  const KEYWORD_RE = /\b(function|if|else|for|while|return|let|const|var|new|this|class)\b/g;
  const P5_RE = new RegExp(`\\b(${P5_FUNCTION_NAMES.join("|")})\\b(?=\\()`, "g");
  const NUMBER_RE = /\b\d+(\.\d+)?\b/g;
  const STRING_RE = /("[^"]*"|'[^']*'|`[^']*`)/g;
  const COMMENT_RE = /(\/\/.*)/g;

  const allMatches: { index: number; text: string; colorKey: string }[] = [];
  const patterns: [RegExp, string][] = [
    [COMMENT_RE, "#6B7280"],
    [KEYWORD_RE, "#ED225D"],
    [P5_RE, "#FFB2BB"],
    [NUMBER_RE, "#FF4F75"],
    [STRING_RE, "#22C55E"],
  ];
  for (const [re, colorKey] of patterns) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(code)) !== null) {
      allMatches.push({ index: match.index, text: match[0], colorKey });
    }
  }
  allMatches.sort((a, b) => a.index - b.index);

  const tokens: { text: string; color: string }[] = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.index < lastEnd) continue;
    if (m.index > lastEnd) {
      tokens.push({ text: code.slice(lastEnd, m.index), color: "#E3E2E7" });
    }
    tokens.push({ text: m.text, color: m.colorKey });
    lastEnd = m.index + m.text.length;
  }
  if (lastEnd < code.length) {
    tokens.push({ text: code.slice(lastEnd), color: "#E3E2E7" });
  }
  return tokens.length > 0 ? tokens : [{ text: code, color: "#E3E2E7" }];
}

function parseDescription(
  text: string,
  onSymbolPress: (name: string) => void,
  colors: Record<string, string>
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
          style={{ color: colors.primary, fontWeight: "700", textDecorationLine: "underline" }}
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

function SymbolDetail({ symbol }: { symbol: string }) {
  const router = useRouter();
  const sym = P5_SYMBOLS_BY_NAME[symbol];
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { getLockedCourseName } = useModuleProgress();

  const handleSymbolPress = (name: string) => {
    const lockedCourse = getLockedCourseName(P5_SYMBOLS_BY_NAME[name]?.module ?? "");
    if (lockedCourse) {
      Alert.alert(
        "Module Locked",
        `Complete the "${lockedCourse}" course to unlock this reference.`
      );
      return;
    }
    router.push(`/ref?symbol=${name}`);
  };

  if (!sym) {
    return (
      <View style={[styles.flex1, { backgroundColor: colors.surface }]}>
        <Header title="Reference" />
        <View style={[styles.flex1, { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }]}>
          <MaterialCommunityIcons name="book-search-outline" size={48} color="#ED225D" />
          <Text style={[styles.headlineXl, { color: colors.onSurface, marginTop: 16 }]}>
            Symbol not found
          </Text>
          <Text style={[styles.bodySm, { color: colors.textSecondary, marginTop: 8, textAlign: "center" }]}>
            &ldquo;{symbol}&rdquo; isn&apos;t in the reference yet.
          </Text>
          <Pressable
            onPress={() => router.push("/ref")}
            style={({ pressed }) => [
              styles.browseButton,
              { backgroundColor: colors.primary, marginTop: 24 },
              pressed && { transform: [{ translateY: 2 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Browse all symbols"
          >
            <Text style={[styles.browseButtonText, { color: colors.onPrimary }]}>
              Browse all symbols
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const syntaxTokens = highlightSyntax(sym.syntax);

  return (
    <View style={[styles.flex1, { backgroundColor: colors.surface }]}>
      <Header title={sym.name} />
      <FlatList
        style={[styles.flex1, { paddingHorizontal: 16, paddingTop: 24 }]}
        contentContainerStyle={{ paddingBottom: 48 }}
        data={sym.parameters}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={
          <>
            <View style={[styles.flexRow, { alignItems: "center", gap: 8, marginBottom: 8 }]}>
              <Text style={[styles.symbolNameText, { color: colors.onSurface }]}>
                {sym.name}()
              </Text>
              <View style={[styles.moduleBadge, { backgroundColor: colors.primary + "33" }]}>
                <Text style={[styles.moduleBadgeText, { color: colors.primary }]}>
                  {sym.module}
                </Text>
              </View>
            </View>

            <Text style={[styles.bodyBase, { lineHeight: 24, marginBottom: 24 }]}>
              {parseDescription(sym.description, handleSymbolPress, colors)}
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 12 }]}>
              Syntax
            </Text>
            <View style={[styles.syntaxBox, { backgroundColor: colors.surfaceDim, marginBottom: 24 }]}>
              <Text style={{ fontFamily: "JetBrainsMono", fontSize: 16, lineHeight: 24 }}>
                {syntaxTokens.map((t, i) => (
                  <Text key={i} style={{ color: t.color, fontFamily: "JetBrainsMono", fontSize: 16 }}>
                    {t.text}
                  </Text>
                ))}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 12 }]}>
              Parameters
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={[styles.flexRow, styles.paramRow]}>
            <View style={styles.flex1}>
              <Text style={[styles.paramNameText, { color: colors.onSurface }]}>
                {item.name}
              </Text>
            </View>
            <View style={{ flex: 2 }}>
              <Text style={[styles.paramDescText, { color: colors.textSecondary, lineHeight: 24 }]}>
                {item.description}
              </Text>
              <Text style={[styles.paramTypeText, { color: colors.primary, marginTop: 2 }]}>
                {item.type}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

export default function Reference() {
  const { symbol } = useLocalSearchParams<{ symbol?: string }>();
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  if (symbol) {
    return <SymbolDetail symbol={symbol} />;
  }

  return (
    <View style={[styles.flex1, { backgroundColor: colors.surface }]}>
      <Header title="Reference" />
      <FlatList
        style={[styles.flex1, { paddingHorizontal: 16, paddingTop: 24 }]}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <Text style={[styles.refListTitle, { color: colors.onSurface, marginBottom: 8 }]}>
              p5.js Reference
            </Text>
            <Text style={[styles.bodyBase, { color: colors.textSecondary, marginBottom: 24 }]}>
              Browse the full p5.js API reference and documentation.
            </Text>
          </>
        }
        data={MODULE_GROUPS}
        keyExtractor={(item) => item.module}
        renderItem={({ item: group }) => (
          <View style={{ marginBottom: 24 }}>
            <Text style={[styles.moduleGroupTitle, { color: colors.onSurface, marginBottom: 12 }]}>
              {group.module}
            </Text>
            {group.symbols.map((sym) => (
              <Pressable
                key={sym.name}
                onPress={() => router.push(`/ref?symbol=${sym.name}`)}
                style={({ pressed }) => [
                  styles.flexRow,
                  styles.symbolRow,
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`View reference for ${sym.name}`}
              >
                <Text style={[styles.monoSm, { color: colors.primary, flex: 1 }]}>
                  {sym.name}()
                </Text>
                <Text
                  style={[styles.bodyXs, { color: colors.textSecondary, flex: 2 }]}
                  numberOfLines={1}
                >
                  {sym.description}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={18}
                  color="#E4BDC0"
                />
              </Pressable>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flexRow: { flexDirection: "row" },
  headlineXl: {
    fontFamily: "JetBrainsMono",
    fontSize: 20,
    fontWeight: "700",
  },
  bodySm: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
  },
  bodyBase: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
  },
  bodyXs: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
  },
  monoSm: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    fontWeight: "700",
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseButtonText: {
    fontFamily: "JetBrainsMono",
    fontWeight: "900",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  symbolNameText: {
    fontFamily: "JetBrainsMono",
    fontSize: 30,
    fontWeight: "900",
  },
  moduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moduleBadgeText: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 18,
    fontWeight: "700",
  },
  syntaxBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  syntaxText: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
  },
  paramRow: {
    paddingVertical: 12,
  },
  paramNameText: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    fontWeight: "700",
  },
  paramDescText: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
  },
  paramTypeText: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  refListTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 24,
    fontWeight: "700",
  },
  moduleGroupTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  symbolRow: {
    alignItems: "center",
    paddingVertical: 12,
  },
});
