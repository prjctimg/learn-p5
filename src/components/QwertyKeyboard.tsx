import { useState, useCallback, useRef, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { pairedSymbols, singleSymbols } from "../data/keyboardLayout";

interface QwertyKeyboardProps {
  onInsert: (text: string, cursorOffset?: number) => void;
  onBackspace?: () => void;
  onNewline?: () => void;
  onCursorMove?: (direction: "left" | "right" | "up" | "down") => void;
  onToggleProgramming?: () => void;
  height?: number;
}

interface QwertyLetterKey {
  type: "letter";
  primary: string;
  secondary?: string;
}

interface QwertyActionKey {
  type: "action";
  action: "backspace" | "enter";
}

type QwertyKey = QwertyLetterKey | QwertyActionKey;

const ROW1: QwertyKey[] = [
  { type: "letter", primary: "q", secondary: "1" },
  { type: "letter", primary: "w", secondary: "2" },
  { type: "letter", primary: "e", secondary: "3" },
  { type: "letter", primary: "r", secondary: "4" },
  { type: "letter", primary: "t", secondary: "5" },
  { type: "letter", primary: "y", secondary: "6" },
  { type: "letter", primary: "u", secondary: "7" },
  { type: "letter", primary: "i", secondary: "8" },
  { type: "letter", primary: "o", secondary: "9" },
  { type: "letter", primary: "p", secondary: "0" },
  { type: "action", action: "backspace" },
];

const ROW2: QwertyKey[] = [
  { type: "letter", primary: "a", secondary: "@" },
  { type: "letter", primary: "s", secondary: "$" },
  { type: "letter", primary: "d" },
  { type: "letter", primary: "f" },
  { type: "letter", primary: "g" },
  { type: "letter", primary: "h", secondary: "#" },
  { type: "letter", primary: "j" },
  { type: "letter", primary: "k" },
  { type: "letter", primary: "l", secondary: ";" },
  { type: "action", action: "enter" },
];

const ROW3: QwertyKey[] = [
  { type: "letter", primary: "z" },
  { type: "letter", primary: "x", secondary: "*" },
  { type: "letter", primary: "c", secondary: "(" },
  { type: "letter", primary: "v", secondary: ")" },
  { type: "letter", primary: "b", secondary: "[" },
  { type: "letter", primary: "n", secondary: "]" },
  { type: "letter", primary: "m", secondary: "-" },
  { type: "letter", primary: ",", secondary: "<" },
  { type: "letter", primary: ".", secondary: ">" },
  { type: "letter", primary: "/", secondary: "?" },
];

const LONG_PRESS_DELAY = 200;
const CONTAINER_PADDING = 8;
const KEY_GAP = 6;
const ACTION_KEY_RATIO = 1.5;
const ROW1_LETTER_COUNT = 10;
const ROW1_UNITS = ROW1_LETTER_COUNT + ACTION_KEY_RATIO;
const TOOLBAR_HEIGHT = 40;
const BOTTOM_EXTRA = 4;

export default function QwertyKeyboard({
  onInsert,
  onBackspace,
  onNewline,
  onCursorMove,
  onToggleProgramming,
  height = 300,
}: QwertyKeyboardProps) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { width: screenWidth } = useWindowDimensions();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressKey = useRef<string | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);

  const dims = useMemo(() => {
    const availWidth = screenWidth - CONTAINER_PADDING * 2;
    const keySize = Math.floor((availWidth - (ROW1_LETTER_COUNT + 1) * KEY_GAP) / ROW1_UNITS * 1.003);
    const rowsArea = height - TOOLBAR_HEIGHT - BOTTOM_EXTRA;
    const keyHeight = Math.max(40, Math.floor((rowsArea - KEY_GAP * 3) / 4 * 1.003));
    return {
      keySize,
      actionKeyWidth: Math.floor(keySize * ACTION_KEY_RATIO),
      keyHeight,
    };
  }, [screenWidth, height]);

  const handlePressIn = useCallback((key: QwertyLetterKey) => {
    longPressKey.current = key.primary;
    longPressTimer.current = setTimeout(() => {
      if (longPressKey.current === key.primary) {
        setLongPressActive(true);
      }
    }, LONG_PRESS_DELAY);
  }, []);

  const handlePressOut = useCallback(
    (key: QwertyLetterKey) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      const isLong = longPressActive && longPressKey.current === key.primary;
      setLongPressActive(false);
      longPressKey.current = null;
      if (isLong && key.secondary) {
        onInsert(key.secondary);
      } else {
        onInsert(key.primary);
      }
    },
    [longPressActive, onInsert]
  );

  const renderLetterKey = useCallback(
    (key: QwertyLetterKey) => {
      const isActive = longPressActive && longPressKey.current === key.primary;
      return (
        <Pressable
          key={key.primary}
          onPressIn={() => handlePressIn(key)}
          onPressOut={() => handlePressOut(key)}
          style={({ pressed }) => [
            {
              width: dims.keySize,
              height: dims.keyHeight,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed || isActive
                ? colors.primaryContainer
                : colors.surfaceContainer,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={key.primary}
        >
          <Text
            style={[
              isActive && key.secondary ? styles.keySecondary : styles.keyPrimary,
              { color: isActive ? colors.primary : colors.onSurface },
            ]}
          >
            {isActive && key.secondary ? key.secondary : key.primary}
          </Text>
        </Pressable>
      );
    },
    [longPressActive, colors, handlePressIn, handlePressOut, dims]
  );

  const renderActionKey = useCallback(
    (key: QwertyActionKey) => {
      const isBackspace = key.action === "backspace";
      const onPress = isBackspace ? onBackspace : onNewline;
      const iconName = isBackspace ? "backspace" : "keyboard-return";
      const label = isBackspace ? "Backspace" : "Enter";
      return (
        <Pressable
          key={key.action}
          onPress={onPress}
          style={({ pressed }) => [
            {
              width: dims.actionKeyWidth,
              height: dims.keyHeight,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed
                ? colors.primaryContainer
                : colors.surfaceContainer,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={22}
            color={colors.onSurfaceVariant}
          />
        </Pressable>
      );
    },
    [onBackspace, onNewline, colors, dims]
  );

  const renderKey = useCallback(
    (key: QwertyKey) => {
      if (key.type === "action") return renderActionKey(key);
      return renderLetterKey(key);
    },
    [renderLetterKey, renderActionKey]
  );

  const handleSymbolInsert = useCallback((sym: string) => {
    onInsert(sym);
  }, [onInsert]);

  const handlePairedInsert = useCallback((open: string, close: string) => {
    onInsert(open + close, 1);
  }, [onInsert]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surfaceContainerLow, height },
      ]}
    >
      <View style={styles.toolbarRow}>
        <View style={styles.toolbarFixed}>
          <Pressable
            onPress={onToggleProgramming}
            style={({ pressed }) => [
              styles.toolbarBtn,
              { backgroundColor: pressed ? colors.primaryContainer : colors.primaryContainer + "33" },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Switch to programming keyboard"
          >
            <MaterialCommunityIcons name="code-tags" size={20} color={colors.primary} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.symbolsScroll}
          contentContainerStyle={styles.symbolsContent}
        >
          {pairedSymbols.map((pair) => (
            <Pressable
              key={pair.display}
              onPress={() => handlePairedInsert(pair.open, pair.close)}
              style={({ pressed }) => [
                styles.symbolButton,
                { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainer },
              ]}
              accessibilityRole="button"
              accessibilityLabel={pair.display}
            >
              <Text style={[styles.symbolText, { color: colors.onSurfaceVariant }]}>
                {pair.display}
              </Text>
            </Pressable>
          ))}
          {singleSymbols.map((sym) => (
            <Pressable
              key={sym}
              onPress={() => handleSymbolInsert(sym)}
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

      <View style={styles.keysContainer}>
        <View style={[styles.row, { gap: KEY_GAP }]}>
          {ROW1.map(renderKey)}
        </View>
        <View style={[styles.row, { gap: KEY_GAP }, { paddingLeft: dims.keySize * 0.5 + KEY_GAP }]}>
          {ROW2.map(renderKey)}
        </View>
        <View style={[styles.row, { gap: KEY_GAP }, { paddingLeft: dims.keySize * 1.2 + KEY_GAP * 2 }]}>
          {ROW3.map(renderKey)}
        </View>

        <View style={[styles.bottomRow, { gap: KEY_GAP }]}>
          <Pressable
            onPress={() => onCursorMove?.("left")}
            style={({ pressed }) => [
              {
                width: dims.keySize + 8,
                height: dims.keyHeight,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed
                  ? colors.primaryContainer
                  : colors.surfaceContainer,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Move cursor left"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={22}
              color={colors.onSurfaceVariant}
            />
          </Pressable>

          <Pressable
            onPress={() => onInsert(" ")}
            style={({ pressed }) => [
              styles.spaceBar,
              {
                height: dims.keyHeight,
                backgroundColor: pressed
                  ? colors.primaryContainer
                  : colors.surfaceContainer,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Space"
          >
            <Text style={[styles.spaceText, { color: colors.onSurfaceVariant }]}>
              space
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onCursorMove?.("right")}
            style={({ pressed }) => [
              {
                width: dims.keySize + 8,
                height: dims.keyHeight,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed
                  ? colors.primaryContainer
                  : colors.surfaceContainer,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Move cursor right"
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  toolbarRow: {
    flexDirection: "row",
    position: "relative",
    alignItems: "stretch",
    marginBottom: 6,
  },
  toolbarFixed: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
    zIndex: 10,
  },
  toolbarBtn: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  symbolsScroll: {
    maxHeight: 44,
    flex: 1,
  },
  symbolsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 6,
  },
  symbolButton: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  symbolText: {
    ...Typography.mono,
    fontSize: 18,
  },
  keysContainer: {
    alignItems: "center",
    paddingHorizontal: CONTAINER_PADDING,
    gap: KEY_GAP,
  },
  row: {
    flexDirection: "row",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 4,
  },
  keyPrimary: {
    ...Typography.mono,
    fontSize: 18,
  },
  keySecondary: {
    ...Typography.mono,
    fontSize: 16,
    fontWeight: "700",
  },
  spaceBar: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  spaceText: {
    ...Typography.mono,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
