import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { Spacing } from "../constants/Spacing";
import { Typography } from "../constants/Typography";
import { pairedSymbols, singleSymbols } from "../data/keyboardLayout";

const RUN_BUTTON_WIDTH = 72;

interface SystemKeyboardToolbarProps {
  onInsert: (text: string, cursorOffset?: number) => void;
  onCursorMove?: (direction: "left" | "right" | "up" | "down") => void;
  onBackspace?: () => void;
  onNewline?: () => void;
  onRun?: () => void;
  height: number;
}

export default function SystemKeyboardToolbar({
  onInsert,
  onCursorMove,
  onBackspace,
  onNewline,
  onRun,
  height,
}: SystemKeyboardToolbarProps) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLow, height }]}>
      <View style={styles.row}>
        <View style={styles.symbolsRowWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.symbolsScroll}
            contentContainerStyle={[styles.symbolsContent, { paddingRight: RUN_BUTTON_WIDTH + Spacing.sm }]}
          >
            {pairedSymbols.map((pair) => (
              <Pressable
                key={pair.display}
                onPress={() => onInsert(pair.open + pair.close, 1)}
                style={({ pressed }) => [
                  styles.symbolBtn,
                  { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainer },
                ]}
              >
                <Text style={[styles.symbolText, { color: colors.onSurfaceVariant }]}>
                  {pair.display}
                </Text>
              </Pressable>
            ))}
            {singleSymbols.map((sym) => (
              <Pressable
                key={sym}
                onPress={() => onInsert(sym)}
                style={({ pressed }) => [
                  styles.symbolBtn,
                  { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainer },
                ]}
              >
                <Text style={[styles.symbolText, { color: colors.onSurfaceVariant }]}>
                  {sym}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          {onRun && (
            <Pressable
              onPress={onRun}
              style={({ pressed }) => [
                styles.runButton,
                { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
              ]}
            >
              <MaterialCommunityIcons name="play" size={16} color={colors.primary} />
              <Text style={[styles.runButtonText, { color: colors.primary }]}>
                Run
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      <View style={[styles.row, styles.controlRow]}>
        <Pressable
          onPress={onBackspace}
          style={({ pressed }) => [
            styles.controlBtn,
            { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainer },
          ]}
        >
          <MaterialCommunityIcons name="backspace" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          onPress={onNewline}
          style={({ pressed }) => [
            styles.controlBtn,
            { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainer },
          ]}
        >
          <MaterialCommunityIcons name="keyboard-return" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
        <View style={styles.spacer} />
        <View style={styles.dpad}>
          <Pressable
            onPress={() => onCursorMove?.("up")}
            style={({ pressed }) => [
              styles.dpadBtn,
              { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
            ]}
          >
            <MaterialCommunityIcons name="chevron-up" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
          <View style={styles.dpadRow}>
            <Pressable
              onPress={() => onCursorMove?.("left")}
              style={({ pressed }) => [
                styles.dpadBtn,
                { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
              ]}
            >
              <MaterialCommunityIcons name="chevron-left" size={18} color={colors.onSurfaceVariant} />
            </Pressable>
            <View style={styles.dpadCenter} />
            <Pressable
              onPress={() => onCursorMove?.("right")}
              style={({ pressed }) => [
                styles.dpadBtn,
                { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
              ]}
            >
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>
          <Pressable
            onPress={() => onCursorMove?.("down")}
            style={({ pressed }) => [
              styles.dpadBtn,
              { backgroundColor: pressed ? colors.primaryContainer : colors.surfaceContainer },
            ]}
          >
            <MaterialCommunityIcons name="chevron-down" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
  },
  controlRow: {
    marginTop: 4,
  },
  symbolsRowWrapper: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
  },
  symbolsScroll: {
    maxHeight: 36,
  },
  symbolsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  runButton: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  runButtonText: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  symbolBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  symbolText: {
    ...Typography.mono,
    fontSize: 16,
  },
  controlBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  spacer: {
    flex: 1,
  },
  dpad: {
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  dpadRow: {
    flexDirection: "row",
    gap: 2,
  },
  dpadBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  dpadCenter: {
    width: 36,
    height: 36,
  },
});
