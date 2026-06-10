import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

const symbols = [
  "(", ")", "{", "}", "[", "]", ";", ",", "<", ">", "=", "+", "-", "*", "/", ".",
];

const p5Functions = [
  "setup", "draw", "createCanvas", "background", "fill",
  "circle", "stroke", "line", "rect", "ellipse",
];

interface ProgrammingKeyboardProps {
  onInsert: (text: string) => void;
}

function Key({ label, onPress }: { label: string; onPress: () => void }) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainerHigh, borderColor: colors.outlineVariant },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Insert ${label}`}
    >
      <Text style={[styles.keyText, { color: colors.primaryFixedDim }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ProgrammingKeyboard({ onInsert }: ProgrammingKeyboardProps) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLow, borderTopColor: colors.outlineVariant }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.scrollView, { borderBottomColor: colors.outlineVariant }]}
      >
        <Pressable
          onPress={() => {}}
          style={[styles.keyboardIconButton, { backgroundColor: colors.primaryContainer + "33" }]}
          accessibilityRole="button"
          accessibilityLabel="Keyboard"
        >
          <MaterialCommunityIcons name="keyboard-outline" size={20} color="#ED225D" />
        </Pressable>
        {symbols.map((sym) => (
          <Pressable
            key={sym}
            onPress={() => onInsert(sym)}
            style={({ pressed }) => [
              styles.symbolButton,
              { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainer },
            ]}
            accessibilityRole="button"
            accessibilityLabel={sym}
          >
            <Text style={[styles.symbolText, { color: colors.onSurfaceVariant }]}>
              {sym}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.functionsContainer}>
        {p5Functions.map((fn) => (
          <Key key={fn} label={fn} onPress={() => onInsert(fn)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 256,
    borderTopWidth: 1,
  },
  scrollView: {
    borderBottomWidth: 1,
  },
  keyboardIconButton: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolButton: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolText: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
  },
  key: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  keyText: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
  },
  functionsContainer: {
    padding: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
});
