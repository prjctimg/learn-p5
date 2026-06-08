import { View, Text, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  return (
    <Pressable
      onPress={onPress}
      className="flex-shrink-0 px-3 py-2 bg-surface-container-high dark:bg-surface-container-high-dark rounded font-mono text-sm border border-outline-variant dark:border-outline-variant-dark active:bg-primary-container active:dark:bg-primary-container-dark"
      accessibilityRole="button"
      accessibilityLabel={`Insert ${label}`}
    >
      <Text className="font-mono text-sm text-primary-fixed-dim dark:text-primary-fixed-dim-dark">
        {label}
      </Text>
    </Pressable>
  );
}

export default function ProgrammingKeyboard({ onInsert }: ProgrammingKeyboardProps) {
  return (
    <View className="bg-surface-container-low dark:bg-surface-container-low-dark border-t border-outline-variant dark:border-outline-variant-dark" style={{ height: 256 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-outline-variant dark:border-outline-variant-dark"
      >
        <Pressable
          onPress={() => {}}
          className="flex-shrink-0 px-4 py-2 bg-primary-container/20 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Keyboard"
        >
          <MaterialCommunityIcons name="keyboard-outline" size={20} color="#ED225D" />
        </Pressable>
        {symbols.map((sym) => (
          <Pressable
            key={sym}
            onPress={() => onInsert(sym)}
            className="flex-shrink-0 px-4 py-2 bg-surface-container dark:bg-surface-container-dark items-center justify-center active:bg-outline-variant dark:active:bg-outline-variant-dark"
            accessibilityRole="button"
            accessibilityLabel={sym}
          >
            <Text className="font-mono text-base text-on-surface-variant dark:text-on-surface-variant-dark">
              {sym}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View className="p-2 flex-row flex-wrap gap-1.5">
        {p5Functions.map((fn) => (
          <Key key={fn} label={fn} onPress={() => onInsert(fn)} />
        ))}
      </View>
    </View>
  );
}
