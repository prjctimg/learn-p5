import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { fontFamily, fontSize, fontWeight } from "../styles/typography";
import { spacing, borderRadius } from "../styles/spacing";

const commonSymbols = [
  "(",
  ")",
  "{",
  "}",
  "[",
  "]",
  ";",
  "=",
  "+",
  "-",
  "*",
  "/",
  ",",
  ".",
  "'",
  '"',
  ":",
  "!",
  "&&",
  "||",
];

interface CodeKeyboardProps {
  tokens: string[];
  onInsert: (text: string) => void;
}

export default function CodeKeyboard({ tokens, onInsert }: CodeKeyboardProps) {
  const surface = useThemeColor("surface");
  const onSurface = useThemeColor("onSurface");
  const surfaceContainerHigh = useThemeColor("surfaceContainerHigh");
  const primary = useThemeColor("primary");
  const outlineVariant = useThemeColor("outlineVariant");

  return (
    <View style={[styles.container, { backgroundColor: surface, borderTopColor: outlineVariant }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: onSurface }]}>
            Symbols
          </Text>
          <View style={styles.chips}>
            {commonSymbols.map((sym) => (
              <Pressable
                key={sym}
                onPress={() => onInsert(sym)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: surfaceContainerHigh, borderColor: outlineVariant },
                  pressed && styles.chipPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Insert ${sym}`}
              >
                <Text style={[styles.chipText, { color: onSurface }]}>
                  {sym}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {tokens.length > 0 && (
          <View style={styles.divider} />
        )}

        {tokens.length > 0 && (
          <View style={styles.group}>
            <Text style={[styles.groupLabel, { color: onSurface }]}>
              Exercise
            </Text>
            <View style={styles.chips}>
              {tokens.map((token) => (
                <Pressable
                  key={token}
                  onPress={() => onInsert(token)}
                  style={({ pressed }) => [
                    styles.chip,
                    styles.tokenChip,
                    { backgroundColor: primary + "18", borderColor: primary + "40" },
                    pressed && styles.chipPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Insert ${token}`}
                >
                  <Text style={[styles.chipText, { color: primary }]}>
                    {token}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: spacing[2],
    maxHeight: 80,
  },
  scroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  group: {
    flexShrink: 0,
  },
  groupLabel: {
    fontFamily: fontFamily.label,
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontFamily: fontFamily.mono,
    fontSize: 13,
  },
  tokenChip: {},
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
});
