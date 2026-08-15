import { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

interface P5FunctionDef {
  label: string;
  insert: string;
  paramTypes: ("string" | "number" | "array" | "color" | "boolean")[];
  disabled?: boolean;
}

const p5Functions: P5FunctionDef[] = [
  { label: "setup", insert: "function setup() {\n  \n}", paramTypes: [] },
  { label: "draw", insert: "function draw() {\n  \n}", paramTypes: [] },
  { label: "createCanvas", insert: "createCanvas()", paramTypes: ["number", "number"] },
  { label: "background", insert: "background()", paramTypes: ["number", "string"] },
  { label: "fill", insert: "fill()", paramTypes: ["number", "string"] },
  { label: "circle", insert: "circle()", paramTypes: ["number", "number", "number"] },
  { label: "stroke", insert: "stroke()", paramTypes: ["number", "string"] },
  { label: "strokeWeight", insert: "strokeWeight()", paramTypes: ["number"] },
  { label: "line", insert: "line()", paramTypes: ["number", "number", "number", "number"] },
  { label: "rect", insert: "rect()", paramTypes: ["number", "number", "number", "number"] },
  { label: "ellipse", insert: "ellipse()", paramTypes: ["number", "number", "number", "number"] },
  { label: "noStroke", insert: "noStroke()", paramTypes: [] },
];

type PairedSymbol = {
  open: string;
  close: string;
  display: string;
  hintTrigger: "string" | "array" | null;
};

const pairedSymbols: PairedSymbol[] = [
  { open: "(", close: ")", display: "( )", hintTrigger: null },
  { open: "{", close: "}", display: "{ }", hintTrigger: null },
  { open: "[", close: "]", display: "[ ]", hintTrigger: "array" },
  { open: "<", close: ">", display: "< >", hintTrigger: null },
  { open: '"', close: '"', display: '" "', hintTrigger: "string" },
];

const singleSymbols = [
  ";", ",", "=", "+", "-", "*", "/", ".",
];

interface ProgrammingKeyboardProps {
  onInsert: (text: string, cursorOffset?: number) => void;
  exerciseSymbols?: string[];
  onToggleKeyboard?: () => void;
  keyboardVisible?: boolean;
  usedFunctions?: string[];
}

export default function ProgrammingKeyboard({ onInsert, exerciseSymbols = [], onToggleKeyboard, keyboardVisible = true, usedFunctions = [] }: ProgrammingKeyboardProps) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [hintType, setHintType] = useState<"string" | "array" | null>(null);

  const handleFunctionPress = useCallback((fn: P5FunctionDef) => {
    const parenIndex = fn.insert.indexOf("()");
    const cursorOffset = parenIndex >= 0 ? parenIndex + 1 : undefined;
    onInsert(fn.insert, cursorOffset);
    const hasString = fn.paramTypes.some((p) => p === "string");
    const hasArray = fn.paramTypes.some((p) => p === "array");
    if (hasString) {
      setHintType("string");
    } else if (hasArray) {
      setHintType("array");
    } else {
      setHintType(null);
    }
  }, [onInsert]);

  const handleSinglePress = useCallback((sym: string) => {
    setHintType(null);
    onInsert(sym);
  }, [onInsert]);

  const handlePairedPress = useCallback((pair: PairedSymbol) => {
    setHintType(null);
    onInsert(pair.open + pair.close, 1);
  }, [onInsert]);

  const handleExercisePress = useCallback((sym: string) => {
    setHintType(null);
    onInsert(sym + "()", 1);
  }, [onInsert]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLow }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.symbolsRow}
        contentContainerStyle={styles.symbolsContent}
      >
        <Pressable
          onPress={onToggleKeyboard}
          style={({ pressed }) => [
            styles.keyboardIcon,
            { backgroundColor: pressed ? colors.primaryContainer : colors.primaryContainer + "33" },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Toggle system keyboard"
        >
          <MaterialCommunityIcons name={keyboardVisible ? "keyboard-outline" : "keyboard-variant"} size={20} color="#ED225D" />
        </Pressable>
        {pairedSymbols.map((pair) => {
          const hinted = pair.hintTrigger && pair.hintTrigger === hintType;
          return (
            <Pressable
              key={pair.display}
              onPress={() => handlePairedPress(pair)}
              style={({ pressed }) => [
                styles.symbolButton,
                {
                  backgroundColor: hinted
                    ? pressed ? colors.primaryContainer : colors.primaryContainer + "4D"
                    : pressed ? colors.outlineVariant : colors.surfaceContainer,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={pair.display}
            >
              <Text style={[styles.symbolText, { color: hinted ? colors.primary : colors.onSurfaceVariant }]}>
                {pair.display}
              </Text>
            </Pressable>
          );
        })}
        {singleSymbols.map((sym) => (
          <Pressable
            key={sym}
            onPress={() => handleSinglePress(sym)}
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

      {exerciseSymbols.length > 0 && (
        <View style={styles.exerciseRow}>
          {exerciseSymbols.map((sym) => (
            <Pressable
              key={sym}
              onPress={() => handleExercisePress(sym)}
              style={({ pressed }) => [
                styles.exerciseKey,
                { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
              ]}
              accessibilityRole="button"
              accessibilityLabel={sym}
            >
              <Text style={[styles.exerciseKeyText, { color: colors.primary }]}>
                {sym}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.functionsContainer}>
        {p5Functions.map((fn) => {
          const isDisabled = fn.disabled || usedFunctions.includes(fn.label);
          return (
            <Pressable
              key={fn.label}
              onPress={isDisabled ? undefined : () => handleFunctionPress(fn)}
              disabled={isDisabled}
              style={({ pressed }) => [
                styles.functionKey,
                {
                  backgroundColor: isDisabled
                    ? colors.surfaceContainerHigh
                    : pressed
                      ? colors.primaryContainer
                      : colors.surfaceContainerHigh,
                  opacity: isDisabled ? 0.4 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={fn.label}
            >
              <Text style={[styles.functionKeyText, { color: isDisabled ? colors.onSurfaceVariant : colors.primaryFixedDim }]}>
                {fn.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
  },
  symbolsRow: {
    maxHeight: 44,
  },
  symbolsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
  keyboardIcon: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  symbolButton: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  symbolText: {
    fontFamily: "JetBrainsMono",
    fontSize: 18,
  },
  exerciseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  exerciseKey: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  exerciseKeyText: {
    fontFamily: "JetBrainsMono",
    fontSize: 15,
    fontWeight: "700",
  },
  functionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  functionKey: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  functionKeyText: {
    fontFamily: "JetBrainsMono",
    fontSize: 15,
  },
});
