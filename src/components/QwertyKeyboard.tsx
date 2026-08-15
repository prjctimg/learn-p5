import { useState, useCallback, useRef, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, LayoutChangeEvent } from "react-native";
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
  onHideKeyboard?: () => void;
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
const POPUP_DISMISS_DELAY = 800;
const CONTAINER_PADDING = 4;
const KEY_GAP = 3;
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
  onHideKeyboard,
  height = 300,
}: QwertyKeyboardProps) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { width: screenWidth } = useWindowDimensions();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressKey = useRef<string | null>(null);
  const popupDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [longPressActive, setLongPressActive] = useState(false);
  const [popupKey, setPopupKey] = useState<string | null>(null);
  const [popupLayout, setPopupLayout] = useState<{ x: number; y: number } | null>(null);
  const keyLayouts = useRef<Record<string, { x: number; y: number; w: number; h: number }>>({});

  const dims = useMemo(() => {
    const availWidth = screenWidth - CONTAINER_PADDING * 2;
    const keySize = Math.floor((availWidth - (ROW1_LETTER_COUNT + 1) * KEY_GAP) / ROW1_UNITS * 1.003);
    const rowsArea = height - TOOLBAR_HEIGHT - BOTTOM_EXTRA;
    const keyHeight = Math.max(44, Math.floor((rowsArea - KEY_GAP * 3) / 4 * 1.003));
    return {
      keySize,
      actionKeyWidth: Math.floor(keySize * ACTION_KEY_RATIO),
      keyHeight,
    };
  }, [screenWidth, height]);

  const handleKeyLayout = useCallback((key: string, event: LayoutChangeEvent) => {
    const { x, y, width, height: h } = event.nativeEvent.layout;
    keyLayouts.current[key] = { x, y, w: width, h };
  }, []);

  const showPopup = useCallback((key: string) => {
    const layout = keyLayouts.current[key];
    if (layout) {
      setPopupKey(key);
      setPopupLayout({ x: layout.x + layout.w / 2, y: layout.y });
    }
    if (popupDismissTimer.current) clearTimeout(popupDismissTimer.current);
    popupDismissTimer.current = setTimeout(() => {
      setPopupKey(null);
      setPopupLayout(null);
    }, POPUP_DISMISS_DELAY);
  }, []);

  const handlePressIn = useCallback((key: QwertyLetterKey) => {
    longPressKey.current = key.primary;
    longPressTimer.current = setTimeout(() => {
      if (longPressKey.current === key.primary) {
        setLongPressActive(true);
        if (key.secondary) showPopup(key.primary);
      }
    }, LONG_PRESS_DELAY);
  }, [showPopup]);

  const handlePressOut = useCallback(
    (key: QwertyLetterKey) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      const isLong = longPressActive && longPressKey.current === key.primary;
      setLongPressActive(false);
      longPressKey.current = null;
      setPopupKey(null);
      setPopupLayout(null);
      if (popupDismissTimer.current) {
        clearTimeout(popupDismissTimer.current);
        popupDismissTimer.current = null;
      }
      if (isLong && key.secondary) {
        onInsert(key.secondary);
      } else {
        onInsert(key.primary);
      }
    },
    [longPressActive, onInsert]
  );

  const renderPopup = useCallback(() => {
    if (!popupKey || !popupLayout) return null;
    const row1Key = ROW1.find((k) => k.type === "letter" && k.primary === popupKey);
    const row2Key = ROW2.find((k) => k.type === "letter" && k.primary === popupKey);
    const row3Key = ROW3.find((k) => k.type === "letter" && k.primary === popupKey);
    const found = (row1Key ?? row2Key ?? row3Key) as QwertyLetterKey | undefined;
    if (!found?.secondary) return null;

    const popupWidth = 44;
    const popupHeight = 56;
    const halfW = popupWidth / 2;
    let left = popupLayout.x - halfW;
    if (left < 4) left = 4;
    if (left + popupWidth > screenWidth - 4) left = screenWidth - popupWidth - 4;
    const top = popupLayout.y - popupHeight - 4;

    return (
      <View
        style={[
          styles.popup,
          {
            left,
            top: top > 0 ? top : popupLayout.y + dims.keyHeight + 4,
            width: popupWidth,
            height: popupHeight,
            backgroundColor: colors.surfaceContainerHighest,
            borderColor: colors.outlineVariant,
          },
        ]}
        pointerEvents="none"
      >
        <Text style={[styles.popupText, { color: colors.onSurface }]}>
          {found.secondary}
        </Text>
      </View>
    );
  }, [popupKey, popupLayout, screenWidth, dims.keyHeight, colors]);

  const renderLetterKey = useCallback(
    (key: QwertyLetterKey) => {
      const isActive = longPressActive && longPressKey.current === key.primary;
      const isPopup = popupKey === key.primary;
      return (
        <View key={key.primary}>
          <Pressable
            onLayout={(e) => handleKeyLayout(key.primary, e)}
            onPressIn={() => handlePressIn(key)}
            onPressOut={() => handlePressOut(key)}
            style={({ pressed }) => [
              {
                width: dims.keySize,
                height: dims.keyHeight,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed || isActive
                  ? derivedColors.primaryContainer
                  : isPopup
                    ? derivedColors.primaryContainer + "66"
                    : colors.surfaceContainerHigh,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={key.primary}
          >
            {key.secondary ? (
              <View style={styles.keyContent}>
                <Text style={[styles.keySuperscript, { color: colors.textSecondary }]}>
                  {key.secondary}
                </Text>
                <Text
                  style={[
                    styles.keyPrimary,
                    { color: isActive ? derivedColors.primary : colors.onSurface },
                  ]}
                >
                  {key.primary}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.keyPrimary,
                  { color: isActive ? derivedColors.primary : colors.onSurface },
                ]}
              >
                {key.primary}
              </Text>
            )}
          </Pressable>
        </View>
      );
    },
    [longPressActive, popupKey, colors, derivedColors, handlePressIn, handlePressOut, dims, handleKeyLayout]
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
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed
                ? derivedColors.primaryContainer
                : colors.surfaceContainerHigh,
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
    [onBackspace, onNewline, colors, derivedColors, dims]
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
      {renderPopup()}
      <View style={styles.toolbarRow}>
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
                { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainerHigh },
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
                { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceContainerHigh },
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
            onPress={() => onHideKeyboard?.()}
            style={({ pressed }) => [
              {
                width: dims.keySize + 8,
                height: dims.keyHeight,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed
                  ? derivedColors.primaryContainer
                  : colors.surfaceContainerHigh,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Hide keyboard"
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={22}
              color={derivedColors.primary}
            />
          </Pressable>

          <Pressable
            onPress={() => onInsert(" ")}
            style={({ pressed }) => [
              styles.spaceBar,
              {
                height: dims.keyHeight,
                backgroundColor: pressed
                  ? derivedColors.primaryContainer
                  : colors.surfaceContainerHigh,
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
            onPress={onToggleProgramming}
            style={({ pressed }) => [
              {
                width: dims.keySize + 8,
                height: dims.keyHeight,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed
                  ? derivedColors.primaryContainer
                  : derivedColors.primaryContainer + "33",
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Switch to programming keyboard"
          >
            <MaterialCommunityIcons
              name="code-tags"
              size={20}
              color={derivedColors.primary}
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
    borderRadius: 8,
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
    borderRadius: 8,
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
  keyContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  keySuperscript: {
    fontFamily: "JetBrainsMono",
    fontSize: 9,
    fontWeight: "600",
    lineHeight: 11,
    marginBottom: -2,
  },
  keyPrimary: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    fontWeight: "500",
  },
  keySecondary: {
    ...Typography.mono,
    fontSize: 16,
    fontWeight: "700",
  },
  spaceBar: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  spaceText: {
    ...Typography.mono,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  popup: {
    position: "absolute",
    zIndex: 100,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  popupText: {
    fontFamily: "JetBrainsMono",
    fontSize: 24,
    fontWeight: "700",
  },
});
