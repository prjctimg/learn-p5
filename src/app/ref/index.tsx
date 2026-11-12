import { useLocalSearchParams, useRouter, useIsFocused } from "expo-router";
import { useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, ScrollView, Pressable, StyleSheet, Linking, TextInput } from "react-native";
import Fuse from "fuse.js";

import Header from "../../components/Header";
import Breadcrumbs from "../../components/Breadcrumbs";
import DescriptionContent from "../../components/DescriptionContent";
import ExamplePreview from "../../components/ExamplePreview";
import { getP5Symbols, getP5SymbolsByName } from "../../data/reference";
import type { ContentSymbol } from "../../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import { useShakeDetection } from "../../hooks/useShakeDetection";
import ReportErrorModal from "../../components/ReportErrorModal";
import { useRuntimeAssets } from "../../hooks/useRuntimeAssets";
import { highlightSyntax, sanitizeCode } from "../../utils/referenceRender";
import { extractDescribeCaption, stripDescribe } from "../../utils/describe";

const MODULE_DESCRIPTIONS: Record<string, string> = {
  Shape: "2D primitives and drawing basics for composing sketches.",
  Shapes: "2D primitives and drawing basics for composing sketches.",
  Color: "Set fills, strokes, and color modes for your canvas.",
  Typography: "Load and draw text with fonts and alignment controls.",
  Image: "Load, display, and manipulate images and pixels.",
  Transform: "Translate, rotate, scale, and transform the coordinate system.",
  Environment: "Control canvas size, frame rate, and runtime environment.",
  Rendering: "Create and manage drawing surfaces and renderers.",
  Math: "Math helpers, vectors, noise, and calculations for sketches.",
  Data: "Work with data structures, conversion, and storage helpers.",
  Events: "Respond to mouse, keyboard, touch, and other input events.",
  IO: "Load and save files, data, and external resources.",
  Structure: "Organize sketch structure with setup, draw, and helpers.",
  DOM: "Create and control HTML elements alongside the canvas.",
  Constants: "Built-in constants for angles, modes, and common values.",
  Foundation: "Core p5.js types and foundational utilities.",
  "3D": "3D primitives, materials, lights, and camera controls.",
  Lights: "Lighting functions for 3D scenes.",
  Material: "Materials and surface appearance for 3D geometry.",
  Camera: "Camera controls and perspective for 3D sketches.",
};

function getModuleDescription(name: string): string {
  return MODULE_DESCRIPTIONS[name] || `Symbols in the ${name} module.`;
}

function buildModuleGroups(symbols: ContentSymbol[]) {
  return symbols.reduce<{ module: string; symbols: ContentSymbol[] }[]>((acc, sym) => {
    const existing = acc.find((g) => g.module === sym.module);
    if (existing) {
      existing.symbols.push(sym);
    } else {
      acc.push({ module: sym.module, symbols: [sym] });
    }
    return acc;
  }, []);
}

function SymbolDetail({ symbol }: { symbol: string }) {
  const router = useRouter();
  const symbolsByName = useMemo(() => getP5SymbolsByName(), []);
  const symbols = useMemo(() => getP5Symbols(), []);
  const sym = symbolsByName[symbol];
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme];
  const runtimeAssets = useRuntimeAssets();
  const currentIndex = sym ? symbols.indexOf(sym) : -1;
  const prevSym = currentIndex > 0 ? symbols[currentIndex - 1] : null;
  const nextSym = currentIndex >= 0 && currentIndex < symbols.length - 1 ? symbols[currentIndex + 1] : null;

  const handleSymbolPress = (name: string) => {
    router.push(`/ref?symbol=${name}`);
  };

 if (!sym) {
  return (
  <View style={[styles.flex1, { backgroundColor: colors.surface }]}>
  <Header title="Reference" onBack={() => router.push("/ref")} />
 <View style={[styles.flex1, { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }]}>
 <MaterialCommunityIcons name="book-search-outline" size={48} color={derivedColors.primary} />
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
 { backgroundColor: derivedColors.primary, marginTop: 24 },
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
   <Header title={sym.name} onBack={() => router.push("/ref")} />
   <Breadcrumbs
     segments={[
       { label: "Reference", href: "/ref" },
       { label: sym.name },
     ]}
   />
<ScrollView
  style={[styles.flex1, { paddingHorizontal: 16, paddingTop: 24 }]}
  contentContainerStyle={{ paddingBottom: 48 }}
  nestedScrollEnabled
>
 <View style={[styles.flexRow, { alignItems: "center", gap: 8, marginBottom: 8 }]}>
 <View style={[styles.symbolNameCode, { backgroundColor: colors.surfaceDim }]}>
 <Text style={[styles.symbolNameText, { color: derivedColors.primary }]}>
 {sym.name}()
 </Text>
 </View>
 <View style={[styles.moduleBadge, { backgroundColor: derivedColors.primary + "33" }]}>
 <Text style={[styles.moduleBadgeText, { color: derivedColors.primary }]}>
 {sym.module}
 </Text>
 </View>
 </View>

 <View style={{ marginBottom: 24 }}>
  <DescriptionContent
    text={sym.description}
    onSymbolPress={handleSymbolPress}
    colorScheme={colorScheme}
    assets={runtimeAssets}
    accentColor={derivedColors.primary}
    textStyle={styles.bodyBase}
    codeFontSize={13}
    codeLineHeight={20}
    previewHeight={260}
    norender={sym.itemtype === "property"}
    previewStyle={styles.exampleWebView}
  />
 </View>

  <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 12 }]}>
  Usage
  </Text>
   <View style={[styles.syntaxBox, { backgroundColor: colors.surfaceDim, marginBottom: 24, borderLeftColor: derivedColors.primary }]}>
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
  {sym.examples.map((ex, i) => {
    const source = sanitizeCode(ex);
    const caption = extractDescribeCaption(source);
    const code = stripDescribe(source);
    return (
  <View key={i} style={{ marginBottom: 16 }}>
  <Text style={[styles.exampleCaption, { color: colors.textSecondary, marginBottom: 6 }]}>
    {caption || `Example ${i + 1}`}
  </Text>
  <ExamplePreview
  code={code}
  previewCode={source}
  colorScheme={colorScheme}
  assets={runtimeAssets}
  norender={sym.itemtype === "property"}
  previewHeight={260}
  delayMs={i * 200}
  codeFontSize={13}
  codeLineHeight={20}
  previewStyle={styles.exampleWebView}
  />
  </View>
  );})}
  </>
)}

 {sym.params.length > 0 && (
 <>
 <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 12 }]}>
 Parameters
 </Text>
 </>
)}

 {sym.params.map((item, i) => (
 <View key={item.name}>
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
 <Text style={[styles.paramTypeText, { color: derivedColors.primary, marginTop: 2 }]}>
 {item.type}
 </Text>
 </View>
 </View>
 {i < sym.params.length - 1 && (
 <View style={{ height: 1, backgroundColor: colors.outlineVariant + "30" }} />
 )}
 </View>
 ))}

 <View style={[styles.flexRow, { alignItems: "center", gap: 12, marginTop: 24, justifyContent: "space-between" }]}>
 {prevSym ? (
 <Pressable
 onPress={() => router.push(`/ref?symbol=${prevSym.name}`)}
 style={({ pressed }) => [
 styles.navButton,
 { backgroundColor: pressed ? derivedColors.primaryContainer : colors.surfaceDim },
 ]}
 accessibilityRole="button"
 accessibilityLabel={`Previous: ${prevSym.name}`}
 >
 <MaterialCommunityIcons name="chevron-left" size={18} color={derivedColors.primary} />
 <Text style={[styles.navButtonText, { color: derivedColors.primary }]} numberOfLines={1}>
 {prevSym.name}
 </Text>
 </Pressable>
) : <View style={{ flex: 1 }} />}
 {nextSym ? (
 <Pressable
 onPress={() => router.push(`/ref?symbol=${nextSym.name}`)}
 style={({ pressed }) => [
 styles.navButton,
 { backgroundColor: pressed ? derivedColors.primaryContainer : colors.surfaceDim },
 ]}
 accessibilityRole="button"
 accessibilityLabel={`Next: ${nextSym.name}`}
 >
 <Text style={[styles.navButtonText, { color: derivedColors.primary }]} numberOfLines={1}>
 {nextSym.name}
 </Text>
 <MaterialCommunityIcons name="chevron-right" size={18} color={derivedColors.primary} />
 </Pressable>
) : <View style={{ flex: 1 }} />}
 </View>

 <Pressable
 onPress={() => Linking.openURL(refUrl)}
 style={({ pressed }) => [
 styles.officialDocsLink,
 { backgroundColor: pressed ? derivedColors.primaryContainer + "33" : colors.surfaceDim },
 ]}
 accessibilityRole="button"
 accessibilityLabel="Open official p5.js documentation"
 >
 <MaterialCommunityIcons name="open-in-new" size={16} color={derivedColors.primary} />
 <Text style={[styles.officialDocsText, { color: derivedColors.primary }]}>
 View on p5js.org
 </Text>
 </Pressable>
</ScrollView>
  </View>
  );
}

export default function Reference() {
  const { symbol } = useLocalSearchParams<{ symbol?: string }>();
  const router = useRouter();
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme];
  const symbols = useMemo(() => getP5Symbols(), []);
  const moduleGroups = useMemo(() => buildModuleGroups(symbols), [symbols]);
  const [shakeModalVisible, setShakeModalVisible] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState("");
  const isFocused = useIsFocused();

  const toggleModule = useCallback((module: string) => {
    setExpandedModules((prev) => ({ ...prev, [module]: !prev[module] }));
  }, []);

  useShakeDetection(
    useCallback(() => setShakeModalVisible(true), []),
    { enabled: isFocused, haptic: true }
  );

  const fuse = useMemo(
    () =>
      new Fuse(symbols, {
        keys: [
          { name: "name", weight: 2 },
          { name: "description", weight: 1 },
          { name: "module", weight: 1 },
        ],
        threshold: 0.4,
      }),
    [symbols]
  );

  const filteredSymbols = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    return fuse.search(q).map((r) => r.item);
  }, [query, fuse]);

  if (symbol) {
    return (
      <>
        <SymbolDetail symbol={symbol} />
        <ReportErrorModal
          visible={shakeModalVisible}
          onDismiss={() => setShakeModalVisible(false)}
          route="/ref"
          context={symbol}
        />
      </>
    );
  }

  const renderListModules = () => (
    <FlatList
      style={[styles.flex1, { paddingHorizontal: 16 }]}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
      data={moduleGroups}
      keyExtractor={(item) => item.module}
      renderItem={({ item: group }) => {
        const isExpanded = expandedModules[group.module] ?? false;
        return (
          <View style={{ marginBottom: 16 }}>
            <Pressable
              onPress={() => toggleModule(group.module)}
              style={({ pressed }) => [
                styles.flexRow,
                { alignItems: "center", paddingVertical: 10, opacity: pressed ? 0.6 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={isExpanded ? `Collapse ${group.module}` : `Expand ${group.module}`}
            >
              <MaterialCommunityIcons
                name={isExpanded ? "chevron-down" : "chevron-right"}
                size={18}
                color={colors.onSurface}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.moduleGroupTitle, { color: colors.onSurface }]}>
                {group.module}
              </Text>
            </Pressable>
            {isExpanded &&
              group.symbols.map((sym) => (
                <Pressable
                  key={sym.name}
                  onPress={() => router.push(`/ref?symbol=${sym.name}`)}
                  style={({ pressed }) => [styles.flexRow, styles.symbolRow, pressed && { opacity: 0.6 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`View reference for ${sym.name}`}
                >
                  <Text style={[styles.monoSm, { color: derivedColors.primary, flex: 1 }]}>
                    {sym.name}()
                  </Text>
                </Pressable>
              ))}
          </View>
        );
      }}
    />
  );

  const renderGridModules = () => (
    <FlatList
      style={[styles.flex1, { paddingHorizontal: 16 }]}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
      data={moduleGroups}
      keyExtractor={(item) => item.module}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      renderItem={({ item: group }) => (
        <Pressable
          onPress={() => {
            setViewMode("list");
            setExpandedModules((prev) => ({ ...prev, [group.module]: true }));
          }}
          style={({ pressed }) => [
            styles.gridCard,
            { backgroundColor: colors.surfaceDim, opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${group.module} module, ${group.symbols.length} symbols`}
        >
          <Text style={[styles.gridModuleTitle, { color: colors.onSurface }]} numberOfLines={1}>
            {group.module}
          </Text>
          <Text style={[styles.gridCount, { color: derivedColors.primary }]}>
            {group.symbols.length} symbol{group.symbols.length === 1 ? "" : "s"}
          </Text>
          <Text style={[styles.gridDescription, { color: colors.textSecondary }]} numberOfLines={3}>
            {getModuleDescription(group.module)}
          </Text>
        </Pressable>
      )}
    />
  );

  const renderSearchResults = () => (
    <FlatList
      style={[styles.flex1, { paddingHorizontal: 16 }]}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
      data={filteredSymbols ?? []}
      keyExtractor={(item) => item.name}
      ListEmptyComponent={
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <Text style={[styles.bodySm, { color: colors.textSecondary }]}>No symbols found.</Text>
        </View>
      }
      renderItem={({ item: sym }) => (
        <Pressable
          onPress={() => router.push(`/ref?symbol=${sym.name}`)}
          style={({ pressed }) => [styles.flexRow, styles.symbolRow, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel={`View reference for ${sym.name}`}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.monoSm, { color: derivedColors.primary }]}>{sym.name}()</Text>
            <Text style={[styles.resultModule, { color: colors.textSecondary }]}>{sym.module}</Text>
          </View>
        </Pressable>
      )}
    />
  );

  return (
    <View style={[styles.flex1, { backgroundColor: colors.surface }]}>
      <Header title="Reference" showBack={false} />
      <View style={styles.breadcrumbRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.breadcrumbInner}>
            <Text style={[styles.breadcrumbLabel, { color: colors.onSurface }]}>Reference</Text>
          </View>
        </View>
        <View style={styles.viewToggle}>
          <Pressable
            onPress={() => setViewMode("list")}
            style={({ pressed }) => [
              styles.toggleBtn,
              viewMode === "list" && { backgroundColor: derivedColors.primary + "22" },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="List view"
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={18}
              color={viewMode === "list" ? derivedColors.primary : colors.textSecondary}
            />
          </Pressable>
          <Pressable
            onPress={() => setViewMode("grid")}
            style={({ pressed }) => [
              styles.toggleBtn,
              viewMode === "grid" && { backgroundColor: derivedColors.primary + "22" },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Grid view"
          >
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={18}
              color={viewMode === "grid" ? derivedColors.primary : colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={[styles.inlineSearch, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search symbols..."
            placeholderTextColor={colors.onSurfaceVariant}
            style={[styles.inlineSearchInput, { color: colors.onSurface }]}
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
      </View>

      {filteredSymbols ? renderSearchResults() : viewMode === "grid" ? renderGridModules() : renderListModules()}

      <ReportErrorModal
        visible={shakeModalVisible}
        onDismiss={() => setShakeModalVisible(false)}
        route="/ref"
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
  fontSize: 12,
 },
 monoSm: {
  fontFamily: "JetBrainsMono",
  fontSize: 16,
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
  exampleCaption: {
  fontFamily: "JetBrainsMono",
  fontSize: 12,
  lineHeight: 18,
  fontStyle: "italic",
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
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  breadcrumbInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  breadcrumbLabel: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    fontWeight: "700",
  },
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineSearch: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  inlineSearchInput: {
    flex: 1,
    fontSize: 14,
    height: 40,
    padding: 0,
  },
  gridCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    minHeight: 120,
  },
  gridModuleTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  gridCount: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  gridDescription: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    lineHeight: 17,
  },
  resultModule: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    marginTop: 2,
  },
});
