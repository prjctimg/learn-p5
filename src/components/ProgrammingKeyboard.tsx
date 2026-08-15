import { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Modal, StyleSheet, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { Spacing } from "../constants/Spacing";
import { Typography } from "../constants/Typography";
import { P5_SYMBOLS } from "../data/reference";
import { p5Functions, p5FunctionLabels, pairedSymbols, singleSymbols, P5FunctionDef, PairedSymbol } from "../data/keyboardLayout";

interface ProgrammingKeyboardProps {
  onInsert: (text: string, cursorOffset?: number) => void;
  exerciseSymbols?: string[];
  onToggleKeyboard?: () => void;
  onRequestSystemKeyboard?: () => void;
  onBackspace?: () => void;
  onNewline?: () => void;
  onFormat?: () => void;
  onReset?: () => void;
  onCursorMove?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onOpenReference?: (symbol: string) => void;
  keyboardVisible?: boolean;
  usedFunctions?: string[];
  height?: number;
}

const BACKSPACE_DELAY = 300;
const BACKSPACE_INTERVAL = 60;

export default function ProgrammingKeyboard({ onInsert, exerciseSymbols = [], onToggleKeyboard, onRequestSystemKeyboard, onBackspace, onNewline, onFormat, onReset, onCursorMove, onOpenReference, keyboardVisible = true, usedFunctions = [], height = 280 }: ProgrammingKeyboardProps) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const isMediumKeyboard = height === 280;
  const [hintType, setHintType] = useState<"string" | "array" | null>(null);
  const [popupSymbol, setPopupSymbol] = useState<string | null>(null);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const backspaceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backspaceInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const onBackspaceRef = useRef(onBackspace);
  onBackspaceRef.current = onBackspace;

  useEffect(() => {
    return () => {
      if (backspaceTimer.current) clearTimeout(backspaceTimer.current);
      if (backspaceInterval.current) clearInterval(backspaceInterval.current);
    };
  }, []);

  useEffect(() => {
    if (popupSymbol) {
      popupAnim.setValue(0);
      Animated.timing(popupAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [popupSymbol, popupAnim]);

  const clearBackspaceRepeat = useCallback(() => {
    if (backspaceTimer.current) {
      clearTimeout(backspaceTimer.current);
      backspaceTimer.current = null;
    }
    if (backspaceInterval.current) {
      clearInterval(backspaceInterval.current);
      backspaceInterval.current = null;
    }
  }, []);

  const startBackspaceRepeat = useCallback(() => {
    if (!onBackspaceRef.current) return;
    onBackspaceRef.current();
    backspaceTimer.current = setTimeout(() => {
      backspaceInterval.current = setInterval(() => {
        onBackspaceRef.current?.();
      }, BACKSPACE_INTERVAL);
    }, BACKSPACE_DELAY);
  }, []);

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
    onInsert(sym + "()", sym.length + 1);
  }, [onInsert]);

  const handleExerciseLongPress = useCallback((sym: string) => {
    setPopupSymbol(sym);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLow, height }]}>
      <View style={styles.toolbarRow}>
        <View style={styles.toolbarFixed}>
          <Pressable
            onPress={onRequestSystemKeyboard}
            style={({ pressed }) => [
              styles.keyboardIcon,
              { backgroundColor: pressed ? colors.primaryContainer : colors.primaryContainer + "33" },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Toggle system keyboard"
          >
            <MaterialCommunityIcons name="keyboard-outline" size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            onPressIn={startBackspaceRepeat}
            onPressOut={clearBackspaceRepeat}
            style={({ pressed }) => [
              styles.keyboardIcon,
              { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainer },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Backspace"
          >
            <MaterialCommunityIcons name="backspace" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            onPress={onNewline}
            style={({ pressed }) => [
              styles.keyboardIcon,
              { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainer },
            ]}
            accessibilityRole="button"
            accessibilityLabel="New line"
          >
            <MaterialCommunityIcons name="keyboard-return" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            onPress={onReset}
            style={({ pressed }) => [
              styles.keyboardIcon,
              { backgroundColor: pressed ? colors.errorContainer : colors.surfaceContainer },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Reset code"
          >
            <MaterialCommunityIcons name="restore" size={18} color={colors.error} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.symbolsScroll}
          contentContainerStyle={styles.symbolsContent}
        >
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
      </View>

      {exerciseSymbols.length > 0 && (
        <View style={styles.exerciseRow}>
          {exerciseSymbols.filter(sym => !p5FunctionLabels.has(sym)).map((sym) => (
            <Pressable
              key={sym}
              onPress={() => handleExercisePress(sym)}
              onLongPress={() => handleExerciseLongPress(sym)}
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
              onLongPress={() => setPopupSymbol(fn.label)}
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
              <Text style={[styles.functionKeyText, { color: isDisabled ? colors.onSurfaceVariant : colors.primary }]}>
                {fn.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!isMediumKeyboard && (
      <View style={styles.bottomCluster}>
        <View style={styles.dpad}>
          <View style={styles.dpadRow}>
            <Pressable
              onPress={() => onCursorMove?.('up')}
              style={({ pressed }) => [
                styles.dpadBtn,
                { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Move cursor up"
            >
              <MaterialCommunityIcons name="chevron-up" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>
          <View style={styles.dpadRow}>
            <Pressable
              onPress={() => onCursorMove?.('left')}
              style={({ pressed }) => [
                styles.dpadBtn,
                { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Move cursor left"
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
            <View style={styles.dpadCenter} />
            <Pressable
              onPress={() => onCursorMove?.('right')}
              style={({ pressed }) => [
                styles.dpadBtn,
                { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Move cursor right"
            >
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>
          <View style={styles.dpadRow}>
            <Pressable
              onPress={() => onCursorMove?.('down')}
              style={({ pressed }) => [
                styles.dpadBtn,
                { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Move cursor down"
            >
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>
        </View>
      </View>
      )}

      <Modal transparent visible={popupSymbol !== null} onRequestClose={() => setPopupSymbol(null)}>
        <Pressable style={styles.popupOverlay} onPress={() => setPopupSymbol(null)}>
          <Animated.View style={[styles.popupCard, { backgroundColor: colors.surfaceContainerHigh, opacity: popupAnim, transform: [{ scale: popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }]}>
            {popupSymbol && (() => {
              const ref = P5_SYMBOLS.find(s => s.name === popupSymbol);
              return ref ? (
                <>
                  <Text style={[popupTextStyles.popupTitle, { color: colors.onSurface, backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant, fontFamily: "JetBrainsMono" }]}>{ref.syntax}</Text>
                  <Text style={[popupTextStyles.popupDesc, { color: colors.onSurfaceVariant }]}>{ref.description}</Text>
                  {ref.parameters.map(p => (
                    <Text key={p.name} style={[popupTextStyles.popupParam, { color: colors.onSurfaceVariant }]}>
                      <Text style={{ color: colors.primary, fontFamily: "JetBrainsMono", fontWeight: "700" }}>{p.name}</Text>
                      {' '}<Text style={{ fontFamily: "JetBrainsMono", fontSize: 11, color: colors.primary }}>({p.type})</Text>: {p.description}
                    </Text>
                  ))}
                </>
              ) : (
                <Text style={[popupTextStyles.popupTitle, { color: colors.onSurface }]}>{popupSymbol}</Text>
              );
            })()}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const popupTextStyles = StyleSheet.create({
  popupTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    overflow: "hidden",
  },
  popupDesc: {
    fontFamily: "JetBrainsMono",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  popupParam: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    paddingLeft: 8,
  },
  refButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  refButtonText: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#FFFFFF",
  },
});

const styles = StyleSheet.create({
  container: {
  },
  toolbarRow: {
    flexDirection: "row",
    position: "relative",
    alignItems: "stretch",
  },
  toolbarFixed: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Spacing.sm,
    gap: Spacing.xs,
    zIndex: 10,
  },
  symbolsScroll: {
    maxHeight: 44,
    flex: 1,
  },
  symbolsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
    gap: Spacing.xs,
  },
  keyboardIcon: {
    flexShrink: 0,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Spacing.xs,
  },
  bottomCluster: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  dpad: {
    gap: 3,
  },
  dpadRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 3,
  },
  dpadBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  dpadCenter: {
    width: 44,
    height: 44,
  },
  symbolButton: {
    flexShrink: 0,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Spacing.xs,
  },
  symbolText: {
    ...Typography.mono,
    fontSize: 18,
  },
  exerciseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 6,
  },
  exerciseKey: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Spacing.xs,
  },
  exerciseKeyText: {
    ...Typography.monoLabel,
  },
  functionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 6,
  },
  functionKey: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: Spacing.xs,
  },
  functionKeyText: {
    ...Typography.mono,
    fontSize: 15,
  },
  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popupCard: {
    marginHorizontal: Spacing.lg,
    padding: 20,
    borderRadius: 12,
    maxHeight: "60%",
    width: "85%",
  },
});
