import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, FlatList, Pressable } from "react-native";
import Header from "../../components/Header";
import { P5_SYMBOLS_BY_NAME, P5_SYMBOLS } from "../../data/p5Symbols";
import { P5Symbol } from "../../data/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

  if (!sym) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark">
        <Header title="Reference" />
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons name="book-search-outline" size={48} color="#ED225D" />
          <Text className="font-headline text-xl font-bold text-on-surface dark:text-on-surface-dark mt-4">
            Symbol not found
          </Text>
          <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-2 text-center">
            &ldquo;{symbol}&rdquo; isn&apos;t in the reference yet.
          </Text>
          <Pressable
            onPress={() => router.push("/ref")}
            className="bg-primary px-6 py-3 mt-6 border-2 border-outline dark:border-outline-dark active:translate-y-0.5"
            accessibilityRole="button"
            accessibilityLabel="Browse all symbols"
          >
            <Text className="font-headline font-black text-sm uppercase tracking-wider text-on-primary">
              Browse all symbols
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title={sym.name} />
      <FlatList
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 48 }}
        data={sym.parameters}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={
          <>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="font-headline text-3xl font-black text-on-surface dark:text-on-surface-dark">
                {sym.name}()
              </Text>
              <View className="bg-primary/20 px-2 py-0.5 rounded">
                <Text className="font-label text-xs uppercase tracking-wider text-primary">
                  {sym.module}
                </Text>
              </View>
            </View>

            <Text className="font-body text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed mb-6">
              {sym.description}
            </Text>

            <Text className="font-headline text-lg font-bold text-on-surface dark:text-on-surface-dark mb-3">
              Syntax
            </Text>
            <View className="bg-surface-dim dark:bg-surface-dim-dark border-2 border-outline dark:border-outline-dark px-4 py-3 mb-6">
              <Text className="font-mono text-sm text-on-surface dark:text-on-surface-dark leading-relaxed">
                {sym.syntax}
              </Text>
            </View>

            <Text className="font-headline text-lg font-bold text-on-surface dark:text-on-surface-dark mb-3">
              Parameters
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View className="flex-row border-b border-outline-variant dark:border-outline-variant-dark py-3">
            <View className="flex-1">
              <Text className="font-mono text-sm font-bold text-on-surface dark:text-on-surface-dark">
                {item.name}
              </Text>
            </View>
            <View className="flex-[2]">
              <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                {item.description}
              </Text>
              <Text className="font-label text-xs uppercase tracking-wider text-primary mt-0.5">
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

  if (symbol) {
    return <SymbolDetail symbol={symbol} />;
  }

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title="Reference" />
      <FlatList
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark mb-2">
              p5.js Reference
            </Text>
            <Text className="font-body text-base text-text-secondary dark:text-text-secondary-dark mb-6">
              Browse the full p5.js API reference and documentation.
            </Text>
          </>
        }
        data={MODULE_GROUPS}
        keyExtractor={(item) => item.module}
        renderItem={({ item: group }) => (
          <View className="mb-6">
            <Text className="font-headline text-lg font-bold text-on-surface dark:text-on-surface-dark mb-3 uppercase tracking-wider">
              {group.module}
            </Text>
            {group.symbols.map((sym) => (
              <Pressable
                key={sym.name}
                onPress={() => router.push(`/ref?symbol=${sym.name}`)}
                className="flex-row items-center py-3 border-b border-outline-variant dark:border-outline-variant-dark active:opacity-60"
                accessibilityRole="button"
                accessibilityLabel={`View reference for ${sym.name}`}
              >
                <Text className="font-mono text-sm font-bold text-primary flex-1">
                  {sym.name}()
                </Text>
                <Text
                  className="font-body text-xs text-text-secondary dark:text-text-secondary-dark flex-[2]"
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
