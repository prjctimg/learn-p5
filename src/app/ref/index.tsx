import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import Header from "../../components/Header";
import { P5_SYMBOLS_BY_NAME, P5_SYMBOLS } from "../../data/p5Symbols";
import { P5Symbol } from "../../data/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";

const MODULE_GROUPS = P5_SYMBOLS.reduce<{ module: string; symbols: P5Symbol[] }[]>((acc, sym) => {
  const existing = acc.find((g) => g.module === sym.module);
  if (existing) {
    existing.symbols.push(sym);
  } else {
    acc.push({ module: sym.module, symbols: [sym] });
  }
  return acc;
}, []);

function SymbolDetail({ symbol }: { symbol: string }) {
  const router = useRouter();
  const sym = P5_SYMBOLS_BY_NAME[symbol];
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

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
              { backgroundColor: colors.primary, borderColor: colors.outline, marginTop: 24 },
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

            <Text style={[styles.bodyBase, { color: colors.textSecondary, lineHeight: 24, marginBottom: 24 }]}>
              {sym.description}
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 12 }]}>
              Syntax
            </Text>
            <View style={[styles.syntaxBox, { backgroundColor: colors.surfaceDim, borderColor: colors.outline, marginBottom: 24 }]}>
              <Text style={[styles.syntaxText, { color: colors.onSurface, lineHeight: 24 }]}>
                {sym.syntax}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 12 }]}>
              Parameters
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={[styles.flexRow, styles.paramRow, { borderColor: colors.outlineVariant }]}>
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
                  { borderColor: colors.outlineVariant },
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
    fontFamily: "SpaceGrotesk",
    fontSize: 20,
    fontWeight: "700",
  },
  bodySm: {
    fontFamily: "Inter",
    fontSize: 13,
  },
  bodyBase: {
    fontFamily: "Inter",
    fontSize: 16,
  },
  bodyXs: {
    fontFamily: "Inter",
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
    borderWidth: 2,
  },
  browseButtonText: {
    fontFamily: "SpaceGrotesk",
    fontWeight: "900",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  symbolNameText: {
    fontFamily: "SpaceGrotesk",
    fontSize: 30,
    fontWeight: "900",
  },
  moduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moduleBadgeText: {
    fontFamily: "Inter",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontFamily: "SpaceGrotesk",
    fontSize: 18,
    fontWeight: "700",
  },
  syntaxBox: {
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  syntaxText: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
  },
  paramRow: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  paramNameText: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    fontWeight: "700",
  },
  paramDescText: {
    fontFamily: "Inter",
    fontSize: 13,
  },
  paramTypeText: {
    fontFamily: "Inter",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  refListTitle: {
    fontFamily: "SpaceGrotesk",
    fontSize: 24,
    fontWeight: "700",
  },
  moduleGroupTitle: {
    fontFamily: "SpaceGrotesk",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  symbolRow: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
});
