import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, TextInput, Modal, Keyboard, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { P5_SYMBOLS, P5_SYMBOLS_BY_NAME, P5SymbolView } from "../data/reference";
import { getExampleHtml } from "../utils/editor/exampleHtml";
import { highlightSyntax, parseDescription, extractDescribeCaption, stripDescribe } from "../utils/referenceRender";
import Fuse from "fuse.js";

interface SearchOverlayProps {
  visible: boolean;
  onClose: () => void;
  /** Non-inline (default): tapping a result calls onSelectSymbol and closes.
   *  inline: tapping a result reveals the symbol's full reference content
   *  inside this modal (no navigation away from the current screen). */
  inline?: boolean;
  onSelectSymbol?: (name: string) => void;
}

export default function SearchOverlay({ visible, onClose, inline = false, onSelectSymbol }: SearchOverlayProps) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<P5SymbolView | null>(null);
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

  const results = useMemo(() => {
    if (!query.trim()) return P5_SYMBOLS.slice(0, 20);
    return fuse.search(query.trim()).map((r) => r.item);
  }, [query, fuse]);

  const handleClose = useCallback(() => {
    setQuery("");
    setSelected(null);
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((sym: P5SymbolView) => {
    if (inline) {
      setSelected(sym);
      Keyboard.dismiss();
    } else {
      handleClose();
      onSelectSymbol?.(sym.name);
    }
  }, [inline, onSelectSymbol, handleClose]);

  // The Modal is always mounted (only its 'visible' flag flips), so the
  // static 'autoFocus' prop on the TextInput only fires on first render. To
  // make the system keyboard appear reliably on EVERY open — including the
  // Run-button long-press path from [id].tsx — focus the input imperatively
  // whenever the overlay becomes visible. A short delay lets the Modal's
  // fade-in animation start before we focus (focusing on a not-yet-attached
  // node is a no-op on Android).
  useEffect(() => {
    if (!visible) return;
    setQuery("");
    setSelected(null);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [visible]);

  function handleSymbolPress(name: string) {
    const sym = P5_SYMBOLS_BY_NAME[name];
    if (sym) handleSelect(sym);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerHigh }, selected && inline && styles.cardExpanded]}>
          {selected && inline ? (
            <SymbolInlineDetail
              sym={selected}
              colorScheme={colorScheme}
              onBack={() => setSelected(null)}
              onClose={handleClose}
              onSymbolPress={handleSymbolPress}
            />
          ) : (
            <>
              <View style={styles.header}>
                <View style={[styles.searchBar, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
                  <MaterialCommunityIcons name="magnify" size={18} color={colors.onSurfaceVariant} />
                  <TextInput
                    ref={inputRef}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search symbols..."
                    placeholderTextColor={colors.onSurfaceVariant}
                    style={[styles.searchInput, { color: colors.onSurface }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityRole="search"
                    accessibilityLabel="Search p5 reference"
                  />
                  {query.length > 0 && (
                    <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel="Clear search">
                      <MaterialCommunityIcons name="close-circle" size={18} color={colors.onSurfaceVariant} />
                    </Pressable>
                  )}
                </View>
                <Pressable onPress={handleClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close search">
                  <MaterialCommunityIcons name="close" size={22} color={colors.onSurfaceVariant} />
                </Pressable>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />
              <FlatList
                data={results}
                keyExtractor={(item) => item.name}
                style={styles.resultsList}
                contentContainerStyle={{ paddingBottom: 8 }}
                renderItem={({ item: sym }) => (
                  <Pressable
                    onPress={() => handleSelect(sym)}
                    style={({ pressed }) => [
                      styles.resultRow,
                      pressed && { backgroundColor: colors.surfaceContainer },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`View reference for ${sym.name}`}
                  >
                    <View style={styles.flex1}>
                      <Text style={[styles.resultName, { color: derivedColors.primary }]}>
                        {sym.name}()
                      </Text>
                      <Text style={[styles.resultModule, { color: colors.textSecondary }]}>
                        {sym.module}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Lightweight inline detail shown within the modal when inline=true.
function SymbolInlineDetail({
  sym,
  colorScheme,
  onBack,
  onClose,
  onSymbolPress,
}: {
  sym: P5SymbolView;
  colorScheme: "light" | "dark";
  onBack: () => void;
  onClose: () => void;
  onSymbolPress: (name: string) => void;
}) {
  const { derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const syntaxTokens = highlightSyntax(sym.syntax.replace(/\n/g, " "), colorScheme);

  return (
    <View style={styles.detailWrap}>
      <View style={styles.detailHeader}>
        <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back to search">
          <MaterialCommunityIcons name="arrow-left" size={22} color={derivedColors.primary} />
        </Pressable>
        <View style={styles.flex1}>
          <View style={styles.detailTitleRow}>
            <Text style={[styles.detailName, { color: derivedColors.primary }]}>
              {sym.name}()
            </Text>
            <View style={[styles.moduleBadge, { backgroundColor: derivedColors.primary + "33" }]}>
              <Text style={[styles.moduleBadgeText, { color: derivedColors.primary }]}>
                {sym.module}
              </Text>
            </View>
          </View>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
          <MaterialCommunityIcons name="close" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>
      <ScrollView style={styles.detailScroll} contentContainerStyle={{ paddingBottom: 16 }}>
        <Text style={[styles.detailDescription, { color: colors.textSecondary }]}>
          {parseDescription(sym.description, onSymbolPress, colors, derivedColors.primary)}
        </Text>

        <Text style={[styles.detailSection, { color: colors.onSurface }]}>Usage</Text>
        <View style={[styles.syntaxBox, { backgroundColor: colors.surfaceDim, borderLeftColor: derivedColors.primary }]}>
          <Text style={{ fontFamily: "JetBrainsMono", fontSize: 14, lineHeight: 22 }}>
            {syntaxTokens.map((t, i) => (
              <Text key={i} style={{ color: t.color }}>{t.text}</Text>
            ))}
          </Text>
        </View>

        {sym.examples && sym.examples.length > 0 && (
          <>
            <Text style={[styles.detailSection, { color: colors.onSurface }]}>Examples</Text>
            {sym.examples.map((ex, i) => {
              const caption = extractDescribeCaption(ex);
              const code = stripDescribe(ex);
              return (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={[styles.exampleCaption, { color: colors.textSecondary, marginBottom: 6 }]}>
                  {caption || `Example ${i + 1}`}
                </Text>
                {sym.norender ? (
                  <View style={[styles.codeBlock, { backgroundColor: colors.surfaceDim }]}>
                    <Text style={{ fontFamily: "JetBrainsMono", fontSize: 12, lineHeight: 18 }}>
                      {highlightSyntax(code, colorScheme).map((t, j) => (
                        <Text key={j} style={{ color: t.color }}>{t.text}</Text>
                      ))}
                    </Text>
                  </View>
                ) : (
                  <>
                    <WebView
                      source={{ html: getExampleHtml(ex) }}
                      style={[styles.exampleWebView, { backgroundColor: colors.surface }]}
                      scrollEnabled={false}
                      pointerEvents="none"
                      javaScriptEnabled
                      domStorageEnabled
                      bounces={false}
                    />
                    <View style={[styles.codeBlock, { backgroundColor: colors.surfaceDim, marginTop: 8 }]}>
                      <Text style={{ fontFamily: "JetBrainsMono", fontSize: 12, lineHeight: 18 }}>
                        {highlightSyntax(code, colorScheme).map((t, j) => (
                          <Text key={j} style={{ color: t.color }}>{t.text}</Text>
                        ))}
                      </Text>
                    </View>
                  </>
                )}
              </View>
              );
            })}
          </>
        )}

        {sym.parameters.length > 0 && (
          <>
            <Text style={[styles.detailSection, { color: colors.onSurface }]}>Parameters</Text>
            {sym.parameters.map((p) => (
              <View key={p.name} style={styles.paramRow}>
                <Text style={[styles.paramName, { color: colors.onSurface }]}>{p.name}</Text>
                <Text style={[styles.paramDesc, { color: colors.textSecondary }]}>
                  {p.description || "No description"}
                </Text>
                <Text style={[styles.paramType, { color: derivedColors.primary }]}>{p.type}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "92%",
    borderRadius: 16,
    padding: 16,
  },
  cardExpanded: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 44,
    padding: 0,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
    marginBottom: 4,
  },
  resultsList: {
    marginTop: 4,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  resultName: {
    fontFamily: "JetBrainsMono",
    fontSize: 15,
    fontWeight: "700",
  },
  resultModule: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    marginTop: 2,
  },
  flex1: { flex: 1 },
  // Inline detail
  detailWrap: { flex: 1 },
  detailHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  detailTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  detailName: { fontFamily: "JetBrainsMono", fontSize: 18, fontWeight: "900" },
  moduleBadge: { borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 },
  moduleBadgeText: { fontFamily: "JetBrainsMono", fontSize: 10, fontWeight: "700" },
  detailScroll: { flex: 1, flexGrow: 1 },
  detailDescription: { fontFamily: "JetBrainsMono", fontSize: 13, lineHeight: 20, marginBottom: 12 },
  detailSection: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 6,
  },
  syntaxBox: { borderRadius: 8, padding: 12, borderLeftWidth: 3, marginBottom: 12 },
  codeBlock: { borderRadius: 8, padding: 10 },
  exampleCaption: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
  },
  exampleWebView: { height: 200, borderRadius: 8, borderWidth: 1, borderColor: "rgba(128,128,128,0.2)" },
  paramRow: { marginBottom: 8 },
  paramName: { fontFamily: "JetBrainsMono", fontSize: 12, fontWeight: "700" },
  paramDesc: { fontFamily: "JetBrainsMono", fontSize: 12, lineHeight: 18, marginTop: 2 },
  paramType: { fontFamily: "JetBrainsMono", fontSize: 11, marginTop: 2 },
});