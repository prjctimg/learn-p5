import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useMemo, useState, useCallback } from "react";
import { View, Text, FlatList, ScrollView, Pressable, Alert, StyleSheet, Linking } from "react-native";
import { WebView } from "react-native-webview";
import Header from "../../components/Header";
import Breadcrumbs from "../../components/Breadcrumbs";
import { P5_SYMBOLS_BY_NAME, P5_SYMBOLS, P5SymbolView as P5Symbol } from "../../data/reference";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import { useModuleProgress } from "../../hooks/useModuleProgress";
import { useShakeDetection } from "../../hooks/useShakeDetection";
import ShakeModal from "../../components/ShakeModal";
import SearchOverlay from "../../components/SearchOverlay";
import { getExampleHtml } from "../../utils/editor/exampleHtml";
import { highlightSyntax, parseDescription } from "../../utils/referenceRender";

const MODULE_GROUPS = P5_SYMBOLS.reduce<{ module: string; symbols: P5Symbol[] }[]>((acc, sym) => {
  const existing = acc.find((g) => g.module === sym.module);
  if (existing) {
  existing.symbols.push(sym);
  } else {
  acc.push({ module: sym.module, symbols: [sym] });
  }
  return acc;
}, []);

function SymbolDetail({ symbol, onOpenSearch }: { symbol: string; onOpenSearch: () => void }) {
 const router = useRouter();
 const sym = P5_SYMBOLS_BY_NAME[symbol];
 const { colorScheme, derivedColors } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
 const { getLockedCourseName } = useModuleProgress();
 const currentIndex = sym ? P5_SYMBOLS.indexOf(sym) : -1;
 const prevSym = currentIndex > 0 ? P5_SYMBOLS[currentIndex - 1] : null;
 const nextSym = currentIndex >= 0 && currentIndex < P5_SYMBOLS.length - 1 ? P5_SYMBOLS[currentIndex + 1] : null;

 const handleSymbolPress = (name: string) => {
 const lockedCourse = getLockedCourseName(P5_SYMBOLS_BY_NAME[name]?.module ?? "");
 if (lockedCourse) {
 Alert.alert(
 "Course Locked",
 `Complete the "${lockedCourse}" course to unlock this reference.`
 );
 return;
 }
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

 <Text style={[styles.bodyBase, { lineHeight: 24, marginBottom: 24 }]}>
  {parseDescription(sym.description, handleSymbolPress, colors, derivedColors.primary)}
 </Text>

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
 {sym.examples.map((ex, i) => (
 <View key={i} style={{ marginBottom: 16 }}>
 {sym.norender ? (
 <View style={[styles.codeBlock, { backgroundColor: colors.surfaceDim }]}>
 <Text style={{ fontFamily: "JetBrainsMono", fontSize: 13, lineHeight: 20 }}>
 {highlightSyntax(ex, colorScheme).map((t, i) => (
 <Text key={i} style={{ color: t.color }}>{t.text}</Text>
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
 <Text style={{ fontFamily: "JetBrainsMono", fontSize: 13, lineHeight: 20 }}>
 {highlightSyntax(ex, colorScheme).map((t, i) => (
 <Text key={i} style={{ color: t.color }}>{t.text}</Text>
 ))}
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

 {sym.parameters.map((item, i) => (
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
 {i < sym.parameters.length - 1 && (
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
 <Pressable
   onPress={onOpenSearch}
   style={[styles.searchFab, { backgroundColor: derivedColors.primary }]}
   accessibilityRole="button"
   accessibilityLabel="Search symbols"
 >
   <MaterialCommunityIcons name="magnify" size={24} color={colors.onPrimary} />
 </Pressable>
 </View>
 );
}

export default function Reference() {
  const { symbol } = useLocalSearchParams<{ symbol?: string }>();
  const router = useRouter();
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
   const [searchVisible, setSearchVisible] = useState(false);
   const [shakeModalVisible, setShakeModalVisible] = useState(false);
   const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

   const toggleModule = useCallback((module: string) => {
     setExpandedModules((prev) => ({ ...prev, [module]: !prev[module] }));
   }, []);

   useShakeDetection(
     useCallback(() => setShakeModalVisible(true), []),
     { enabled: true, haptic: true }
   );

  const handleSelectSymbol = useCallback((name: string) => {
    router.push(`/ref?symbol=${name}`);
  }, [router]);

   if (symbol) {
     return (
       <>
         <SymbolDetail symbol={symbol} onOpenSearch={() => setSearchVisible(true)} />
         <SearchOverlay
           visible={searchVisible}
           onClose={() => setSearchVisible(false)}
           onSelectSymbol={handleSelectSymbol}
         />
         <ShakeModal
           visible={shakeModalVisible}
           onDismiss={() => setShakeModalVisible(false)}
           title="Reference"
           subtitle="What would you like to do?"
           actions={[
             {
               icon: "magnify",
               label: "Search Symbols",
               variant: "primary",
               onPress: () => {
                 setShakeModalVisible(false);
                 setSearchVisible(true);
               },
             },
             {
               icon: "book-open-variant",
               label: "Browse All",
               variant: "secondary",
               onPress: () => {
                 setShakeModalVisible(false);
                 router.push("/ref");
               },
             },
             {
               icon: "close",
               label: "Dismiss",
               variant: "ghost",
               onPress: () => setShakeModalVisible(false),
             },
           ]}
         />
       </>
     );
   }

   return (
   <View style={[styles.flex1, { backgroundColor: colors.surface }]}>
   <Header title="Reference" showBack={false} />
   <Breadcrumbs segments={[{ label: "Reference" }]} />
   <FlatList
   style={[styles.flex1, { paddingHorizontal: 16 }]}
   contentContainerStyle={{ paddingTop: 12, paddingBottom: 80 }}
     ListHeaderComponent={
       <View style={{ marginBottom: 12 }} />
     }
   data={MODULE_GROUPS}
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
   {isExpanded && group.symbols.map((sym) => (
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
     <Text style={[styles.monoSm, { color: derivedColors.primary, flex: 1 }]}>
     {sym.name}()
     </Text>
     </Pressable>
))}
     </View>
   );}}
   />
  <Pressable
    onPress={() => setSearchVisible(true)}
    style={[styles.searchFab, { backgroundColor: derivedColors.primary }]}
    accessibilityRole="button"
    accessibilityLabel="Search symbols"
  >
    <MaterialCommunityIcons name="magnify" size={24} color={colors.onPrimary} />
  </Pressable>
  <SearchOverlay
    visible={searchVisible}
    onClose={() => setSearchVisible(false)}
    onSelectSymbol={handleSelectSymbol}
  />
  <ShakeModal
    visible={shakeModalVisible}
    onDismiss={() => setShakeModalVisible(false)}
    title="Reference"
    subtitle="What would you like to do?"
    actions={[
      {
        icon: "magnify",
        label: "Search Symbols",
        variant: "primary",
        onPress: () => {
          setShakeModalVisible(false);
          setSearchVisible(true);
        },
      },
      {
        icon: "book-open-variant",
        label: "Browse All",
        variant: "secondary",
        onPress: () => {
          setShakeModalVisible(false);
          router.push("/ref");
        },
      },
      {
        icon: "close",
        label: "Dismiss",
        variant: "ghost",
        onPress: () => setShakeModalVisible(false),
      },
    ]}
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
 searchFab: {
   position: "absolute",
   right: 20,
   bottom: 24,
   width: 56,
   height: 56,
   borderRadius: 28,
   alignItems: "center",
   justifyContent: "center",
   elevation: 4,
   shadowColor: "#000",
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.25,
   shadowRadius: 4,
 },
});
