import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert, StyleSheet, Linking, TextInput } from "react-native";
import { WebView } from "react-native-webview";
import Header from "../../components/Header";
import { P5_SYMBOLS_BY_NAME, P5_SYMBOLS, P5_FUNCTION_NAMES, P5SymbolView as P5Symbol } from "../../data/reference";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import { useModuleProgress } from "../../hooks/useModuleProgress";
import { getEditorTheme } from "../../utils/editor/themes";
import { getExampleHtml } from "../../utils/editor/exampleHtml";
import Fuse from "fuse.js";

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

function highlightSyntax(code: string, colorScheme?: "light" | "dark"): { text: string; color: string }[] {
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
 const currentIndex = sym ? P5_SYMBOLS.indexOf(sym) : -1;
 const prevSym = currentIndex > 0 ? P5_SYMBOLS[currentIndex - 1] : null;
 const nextSym = currentIndex >= 0 && currentIndex < P5_SYMBOLS.length - 1 ? P5_SYMBOLS[currentIndex + 1] : null;

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
 <MaterialCommunityIcons name="book-search-outline" size={48} color={colors.primary} />
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

 const syntaxTokens = highlightSyntax(sym.syntax.replace(/\n/g, " "), colorScheme);
 const refUrl = `https://p5js.org/reference/p5/${sym.name.toLowerCase()}/`;

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
 <View style={[styles.symbolNameCode, { backgroundColor: colors.surfaceDim }]}>
 <Text style={[styles.symbolNameText, { color: colors.primary }]}>
 {sym.name}()
 </Text>
 </View>
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
 Usage
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

 {sym.examples && sym.examples.length > 0 && (
 <>
 <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 12 }]}>
 Examples
 </Text>
 {sym.examples.map((ex, i) => (
 <View key={i} style={{ marginBottom: 16 }}>
 {sym.norender ? (
 <View style={[styles.codeBlock, { backgroundColor: colors.surfaceDim }]}>
 <Text style={{ fontFamily: "JetBrainsMono", fontSize: 13, lineHeight: 20, color: colors.onSurface }}>
 {ex}
 </Text>
 </View>
) : (
 <>
 <WebView
 source={{ html: getExampleHtml(ex) }}
 style={[styles.exampleWebView, { backgroundColor: colors.surface }]}
 scrollEnabled={false}
 javaScriptEnabled
 domStorageEnabled
 bounces={false}
 />
 <View style={[styles.codeBlock, { backgroundColor: colors.surfaceDim, marginTop: 8 }]}>
 <Text style={{ fontFamily: "JetBrainsMono", fontSize: 13, lineHeight: 20, color: colors.onSurface }}>
 {ex}
 </Text>
 </View>
 </>
)}
 </View>
))}
 </>
)}

 {sym.parameters.length > 0 && (
 <>
 <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 12 }]}>
 Parameters
 </Text>
 </>
)}
 </>
 }
 ItemSeparatorComponent={() => (
 <View style={{ height: 1, backgroundColor: colors.outlineVariant + "30" }} />
)}
  renderItem={({ item }) => (
  <View style={[styles.flexRow, styles.paramRow]}>
  <View style={styles.flex1}>
  <Text style={[styles.paramNameText, { color: colors.onSurface }]}>
  {item.name}
  </Text>
  </View>
  <View style={{ flex: 2 }}>
  <Text style={[styles.paramDescText, { color: colors.textSecondary, lineHeight: 24 }]}>
  {item.description || "No description"}
  </Text>
  <Text style={[styles.paramTypeText, { color: colors.primary, marginTop: 2 }]}>
  {item.type}
  </Text>
  </View>
  </View>
  )}
 ListFooterComponent={
 <>
 <View style={[styles.flexRow, { alignItems: "center", gap: 12, marginTop: 24, justifyContent: "space-between" }]}>
 {prevSym ? (
 <Pressable
 onPress={() => router.push(`/ref?symbol=${prevSym.name}`)}
 style={({ pressed }) => [
 styles.navButton,
 { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceDim },
 ]}
 accessibilityRole="button"
 accessibilityLabel={`Previous: ${prevSym.name}`}
 >
 <MaterialCommunityIcons name="chevron-left" size={18} color={colors.primary} />
 <Text style={[styles.navButtonText, { color: colors.primary }]} numberOfLines={1}>
 {prevSym.name}
 </Text>
 </Pressable>
) : <View style={{ flex: 1 }} />}
 {nextSym ? (
 <Pressable
 onPress={() => router.push(`/ref?symbol=${nextSym.name}`)}
 style={({ pressed }) => [
 styles.navButton,
 { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceDim },
 ]}
 accessibilityRole="button"
 accessibilityLabel={`Next: ${nextSym.name}`}
 >
 <Text style={[styles.navButtonText, { color: colors.primary }]} numberOfLines={1}>
 {nextSym.name}
 </Text>
 <MaterialCommunityIcons name="chevron-right" size={18} color={colors.primary} />
 </Pressable>
) : <View style={{ flex: 1 }} />}
 </View>

 <Pressable
 onPress={() => Linking.openURL(refUrl)}
 style={({ pressed }) => [
 styles.officialDocsLink,
 { backgroundColor: pressed ? colors.primaryContainer + "33" : colors.surfaceDim },
 ]}
 accessibilityRole="button"
 accessibilityLabel="Open official p5.js documentation"
 >
 <MaterialCommunityIcons name="open-in-new" size={16} color={colors.primary} />
 <Text style={[styles.officialDocsText, { color: colors.primary }]}>
 View on p5js.org
 </Text>
 </Pressable>
 </>
 }
 />
 </View>
);
}

export default function Reference() {
 const { symbol } = useLocalSearchParams<{ symbol?: string }>();
 const router = useRouter();
 const { colorScheme } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
 const [searchQuery, setSearchQuery] = useState("");
 const inputRef = useRef<TextInput>(null);

 const fuse = useMemo(
 () =>
 new Fuse(P5_SYMBOLS, {
 keys: [
 { name: "name", weight: 2 },
 { name: "description", weight: 1 },
 { name: "module", weight: 1 },
 ],
 threshold: 0.4,
 includeScore: true,
 }),
 []
);

 const filteredSymbols = useMemo(() => {
 if (!searchQuery.trim()) return null;
 return fuse.search(searchQuery.trim()).map((r) => r.item);
 }, [searchQuery, fuse]);

 const handleClearSearch = useCallback(() => {
 setSearchQuery("");
 inputRef.current?.blur();
 }, []);

 if (symbol) {
 return <SymbolDetail symbol={symbol} />;
 }

 return (
 <View style={[styles.flex1, { backgroundColor: colors.surface }]}>
 <Header title="Reference" />
 <View
 style={[
 styles.searchContainer,
 { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant },
 ]}
 >
 <MaterialCommunityIcons name="magnify" size={18} color={colors.onSurfaceVariant} />
 <TextInput
 ref={inputRef}
 value={searchQuery}
 onChangeText={setSearchQuery}
 placeholder="Search symbols..."
 placeholderTextColor={colors.onSurfaceVariant}
 style={[styles.searchInput, { color: colors.onSurface }]}
 autoCapitalize="none"
 autoCorrect={false}
 />
 {searchQuery.length > 0 && (
 <Pressable onPress={handleClearSearch} accessibilityRole="button" accessibilityLabel="Clear search">
 <MaterialCommunityIcons name="close" size={18} color={colors.onSurfaceVariant} />
 </Pressable>
)}
 </View>
 <FlatList
 style={[styles.flex1, { paddingHorizontal: 16 }]}
 contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
 ListHeaderComponent={
 !filteredSymbols ? (
 <Text style={[styles.bodyBase, { color: colors.textSecondary, marginBottom: 24 }]}>
 Browse the full p5.js API reference and documentation.
 </Text>
) : null
 }
 data={filteredSymbols || MODULE_GROUPS}
 keyExtractor={filteredSymbols ? (item) => item.name : (item) => item.module}
 renderItem={
 filteredSymbols
 ? ({ item: sym }) => (
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
  <MaterialCommunityIcons
  name="chevron-right"
  size={18}
  color={colors.onSurfaceVariant}
  />
  </Pressable>
)
  : ({ item: group }) => (
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
  <MaterialCommunityIcons
  name="chevron-right"
  size={18}
  color={colors.onSurfaceVariant}
  />
  </Pressable>
))}
  </View>
)
 }
 />
 </View>
);
}

const styles = StyleSheet.create({
 flex1: { flex: 1 },
 flexRow: { flexDirection: "row" },
 searchContainer: {
 flexDirection: "row",
 alignItems: "center",
 marginHorizontal: 16,
 marginTop: 12,
 paddingHorizontal: 12,
 height: 40,
 borderRadius: 10,
 borderWidth: 1,
 gap: 8,
 },
 searchInput: {
 flex: 1,
 fontSize: 14,
 height: 40,
 padding: 0,
 },
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
 fontSize: 12,
 },
 monoSm: {
 fontFamily: "JetBrainsMono",
 fontSize: 13,
 fontWeight: "700",
 },
  browseButton: {
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 12,
  },
  browseButtonText: {
 fontFamily: "JetBrainsMono",
 fontWeight: "900",
 fontSize: 13,
 textTransform: "uppercase",
 letterSpacing: 0.5,
 },
 symbolNameCode: {
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 6,
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
 fontSize: 12,
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
  borderLeftWidth: 3,
  borderLeftColor: "#FF69B4",
  },
 syntaxText: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 },
 codeBlock: {
 paddingHorizontal: 16,
 paddingVertical: 12,
 borderRadius: 8,
 },
 exampleWebView: {
 height: 260,
 borderRadius: 8,
 overflow: "hidden",
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
 fontSize: 12,
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
 navButton: {
 flex: 1,
 flexDirection: "row",
 alignItems: "center",
 gap: 4,
 paddingHorizontal: 12,
 paddingVertical: 10,
 borderRadius: 8,
 maxWidth: "45%",
 },
 navButtonText: {
 fontFamily: "JetBrainsMono",
 fontSize: 12,
 fontWeight: "700",
 },
 officialDocsLink: {
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "center",
 gap: 6,
 marginTop: 24,
 paddingHorizontal: 16,
 paddingVertical: 12,
 borderRadius: 8,
 },
 officialDocsText: {
 fontFamily: "JetBrainsMono",
 fontSize: 13,
 fontWeight: "700",
 },
});
