import { useState, useCallback, useRef, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, GestureResponderEvent } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useThemeContext } from "./ThemeProvider";
import { Colors, KeyboardColors } from "../constants/Colors";
import { pairedSymbols, singleSymbols } from "../data/keyboardLayout";
import {
  KEYBOARD_ROWS,
  LONG_PRESS_DELAY,
  POPUP_DISMISS_DELAY,
  ALT_CELL_WIDTH,
  ALT_CELL_HEIGHT,
  POPUP_TOP_OFFSET,
  KeySpec,
} from "../data/keyboardRedesignLayout";
import { ShiftIcon, BackspaceIcon, EnterIcon, SpaceIcon } from "./KeyboardIcons";

interface QwertyKeyboardProps {
  onInsert: (text: string, cursorOffset?: number) => void;
  onBackspace?: () => void;
  onNewline?: () => void;
  onCursorMove?: (direction: "left" | "right" | "up" | "down") => void;
  onToggleProgramming?: () => void;
  onHideKeyboard?: () => void;
  height?: number;
}

// Design-space ratios relative to 1U (= 90px on the 1000px reference canvas).
const GAP_RATIO = 8 / 90;
const VGAP_RATIO = 10 / 90;
const PAD_RATIO = 12 / 90;
const ROWS_HEIGHT_UNITS = KEYBOARD_ROWS.reduce((acc, r) => acc + r.keyHeight / 90, 0);
const TOOLBAR_RESERVE = 58;

const BACKSPACE_DELAY = 300;
const BACKSPACE_INTERVAL = 60;

function getAlternates(key: KeySpec): string[] {
  return key.secondary ?? [];
}

function isLetter(primary: string) {
  return /^[a-z]$/.test(primary);
}

export default function QwertyKeyboard({
  onInsert,
  onBackspace,
  onNewline,
  onCursorMove,
  onToggleProgramming,
  onHideKeyboard,
  height = 300,
}: QwertyKeyboardProps) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const kb = KeyboardColors[colorScheme === "dark" ? "dark" : "light"];
  const { width: screenWidth } = useWindowDimensions();

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressKey = useRef<string | null>(null);
  const popupDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backspaceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backspaceInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const onBackspaceRef = useRef(onBackspace);
  onBackspaceRef.current = onBackspace;

  const [longPressActive, setLongPressActive] = useState(false);
  const [popupKey, setPopupKey] = useState<string | null>(null);
  // Container-relative top/left used to render the popup, plus the global
  // page-space left edge used to map finger position → alternate index.
  const [popupLayout, setPopupLayout] = useState<{ top: number; left: number } | null>(null);
  const [popupAlternates, setPopupAlternates] = useState<string[]>([]);
  const [popupRowLeftGlobal, setPopupRowLeftGlobal] = useState(0);
  const [popupWidth, setPopupWidth] = useState(ALT_CELL_WIDTH);
  const [shifted, setShifted] = useState(false);
  const [symPage, setSymPage] = useState(false);
  const [popupSelected, setPopupSelected] = useState(0);
  const keyRefs = useRef<Record<string, View | null>>({});
  const containerRef = useRef<View>(null);

  // All key dimensions scale linearly from the horizontal fit (10 units plus
  // outer padding and 9 inter-key gaps span the full width), then shrink
  // uniformly if the allotted height cannot fit the natural stack.
  const dims = useMemo(() => {
    const rawUnit = screenWidth / (10 + 2 * PAD_RATIO + 9 * GAP_RATIO);
    const naturalRows = rawUnit * (ROWS_HEIGHT_UNITS + 4 * VGAP_RATIO);
    const fit = Math.max(0.7, Math.min(1, (height - TOOLBAR_RESERVE) / naturalRows));
    const u = rawUnit * fit;
    const hGap = u * GAP_RATIO;
    const vGap = u * VGAP_RATIO;
    const padH = u * PAD_RATIO;
    const contentW = screenWidth - 2 * padH;
    const rowHeights = KEYBOARD_ROWS.map((r) => (r.keyHeight / 90) * u);
    const sideActionW = (contentW - 7 * u - 8 * hGap) / 2;
    const spaceW = contentW - 4 * hGap - (1.44 + 0.89 + 0.89 + 1.44) * u;
    return {
      u,
      hGap,
      vGap,
      padH,
      rowHeights,
      sideActionW,
      spaceW,
      midInset: 0.5 * (u + hGap),
      radius: Math.max(3, Math.min(14, u * 0.115)),
      keyFont: Math.max(13, Math.min(26, Math.round(u * 0.42))),
      iconSize: Math.max(18, Math.min(34, Math.round(u * 0.5))),
      smallFont: Math.max(11, Math.min(20, Math.round(u * 0.3))),
    };
  }, [screenWidth, height]);

  const findKeySpec = useCallback((primary: string): KeySpec | undefined => {
    for (const row of KEYBOARD_ROWS) {
      const found = row.keys.find((k) => k.primary === primary);
      if (found) return found;
    }
    return undefined;
  }, []);

  const clearBackspaceRepeat = useCallback(() => {
    if (backspaceTimer.current) clearTimeout(backspaceTimer.current);
    if (backspaceInterval.current) clearInterval(backspaceInterval.current);
    backspaceTimer.current = null;
    backspaceInterval.current = null;
  }, []);

  const startBackspaceRepeat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onBackspaceRef.current?.();
    backspaceTimer.current = setTimeout(() => {
      backspaceInterval.current = setInterval(() => {
        onBackspaceRef.current?.();
      }, BACKSPACE_INTERVAL);
    }, BACKSPACE_DELAY);
  }, []);

  const showPopup = useCallback(
    (key: string) => {
      const found = findKeySpec(key);
      const alts = found ? getAlternates(found) : [];
      if (!found || alts.length === 0) return;
      const keyRef = keyRefs.current[key];
      const container = containerRef.current;
      if (!keyRef || !container) return;

      const popupW = Math.min(screenWidth - 8, Math.max(ALT_CELL_WIDTH, alts.length * ALT_CELL_WIDTH));

      // Measure both views in window space so the popup can be placed
      // directly above the pressed key regardless of where the keyboard is
      // inset on screen. If there is no room above (key already near the top
      // of the screen), fall back to below the key.
      container.measureInWindow((cx, cy) => {
        keyRef.measureInWindow((kx, ky, kw, kh) => {
          const centerX = kx + kw / 2;
          let leftGlobal = centerX - popupW / 2;
          if (leftGlobal < 4) leftGlobal = 4;
          if (leftGlobal + popupW > screenWidth - 4) leftGlobal = screenWidth - popupW - 4;

          const roomAbove = ky - ALT_CELL_HEIGHT - POPUP_TOP_OFFSET >= 8;
          const top = roomAbove
            ? ky - cy - ALT_CELL_HEIGHT - POPUP_TOP_OFFSET
            : ky - cy + kh + POPUP_TOP_OFFSET;

          setPopupKey(key);
          setPopupLayout({ top, left: leftGlobal - cx });
          setPopupAlternates(alts);
          setPopupRowLeftGlobal(leftGlobal);
          setPopupWidth(popupW);
          setPopupSelected(0);
          if (popupDismissTimer.current) clearTimeout(popupDismissTimer.current);
          popupDismissTimer.current = setTimeout(() => {
            setPopupKey(null);
            setPopupLayout(null);
            setPopupAlternates([]);
          }, POPUP_DISMISS_DELAY);
        });
      });
    },
    [findKeySpec, screenWidth]
  );

  const handlePressIn = useCallback(
    (key: KeySpec) => {
      longPressKey.current = key.primary;
      longPressTimer.current = setTimeout(() => {
        if (longPressKey.current === key.primary) {
          const alts = getAlternates(key);
          if (alts.length > 0) {
            setLongPressActive(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            showPopup(key.primary);
          }
        }
      }, LONG_PRESS_DELAY);
    },
    [showPopup]
  );

  const handleTouchMove = useCallback(
    (e: GestureResponderEvent) => {
      if (!popupKey || popupAlternates.length <= 1) return;
      const idx = Math.floor((e.nativeEvent.pageX - popupRowLeftGlobal) / ALT_CELL_WIDTH);
      const clamped = Math.max(0, Math.min(popupAlternates.length - 1, idx));
      if (clamped !== popupSelected) {
        Haptics.selectionAsync().catch(() => {});
        setPopupSelected(clamped);
      }
    },
    [popupKey, popupAlternates, popupRowLeftGlobal, popupSelected]
  );

  // Resolve the glyph a character key produces given the current modifiers.
  const resolveGlyph = useCallback(
    (key: KeySpec) => {
      const alt = key.secondary?.[0];
      if (isLetter(key.primary)) {
        if (symPage && alt) return alt;
        return shifted ? key.primary.toUpperCase() : key.primary;
      }
      if ((shifted || symPage) && alt) return alt;
      return key.primary;
    },
    [shifted, symPage]
  );

  const commitModifiers = useCallback(() => {
    if (shifted) setShifted(false);
    if (symPage) setSymPage(false);
  }, [shifted, symPage]);

  const handlePressOut = useCallback(
    (key: KeySpec) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      const isLong = longPressActive && longPressKey.current === key.primary;
      const alts = getAlternates(key);
      const selectedIdx = popupSelected;
      setLongPressActive(false);
      longPressKey.current = null;
      setPopupKey(null);
      setPopupLayout(null);
      setPopupAlternates([]);
      if (popupDismissTimer.current) {
        clearTimeout(popupDismissTimer.current);
        popupDismissTimer.current = null;
      }
      if (isLong && alts.length > 0) {
        onInsert(alts[Math.min(selectedIdx, alts.length - 1)] ?? key.primary);
      } else {
        onInsert(resolveGlyph(key));
      }
      commitModifiers();
    },
    [longPressActive, onInsert, popupSelected, resolveGlyph, commitModifiers]
  );

  const handleShiftPress = useCallback(() => {
    setShifted((s) => !s);
    setSymPage(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const handleSymToggle = useCallback(() => {
    setSymPage((s) => !s);
    setShifted(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const renderPopup = useCallback(() => {
    if (!popupKey || !popupLayout || popupAlternates.length === 0) return null;

    return (
      <View
        style={[
          styles.popup,
          {
            left: popupLayout.left,
            top: popupLayout.top,
            width: popupWidth,
            height: ALT_CELL_HEIGHT,
            backgroundColor: kb.keyCapPressed,
            borderColor: colors.outlineVariant,
          },
        ]}
        pointerEvents="none"
      >
        <View style={{ flexDirection: "row", width: popupWidth, height: ALT_CELL_HEIGHT }}>
          {popupAlternates.map((alt, i) => {
            const isSelected = i === popupSelected;
            return (
              <View
                key={`${alt}-${i}`}
                style={{
                  width: ALT_CELL_WIDTH,
                  height: ALT_CELL_HEIGHT,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isSelected ? kb.accent : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono",
                    fontSize: isSelected ? 26 : 22,
                    fontWeight: "700",
                    color: isSelected ? "#FFFFFF" : kb.text,
                  }}
                >
                  {alt}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }, [popupKey, popupLayout, popupAlternates, popupWidth, popupSelected, kb, colors.outlineVariant]);

  const capStyle = useCallback(
    (pressed: boolean, isActive: boolean) => ({
      backgroundColor: pressed || isActive ? kb.keyCapPressed : kb.keyCap,
    }),
    [kb]
  );

  const renderCharKey = useCallback(
    (key: KeySpec, rowHeight: number) => {
      const isActive = longPressActive && longPressKey.current === key.primary;
      const isPopup = popupKey === key.primary;
      const glyph = resolveGlyph(key);
      return (
        <View
          key={key.primary}
          ref={(r) => {
            keyRefs.current[key.primary] = r;
          }}
        >
          <Pressable
            onPressIn={() => handlePressIn(key)}
            onPressOut={() => handlePressOut(key)}
            onTouchMove={handleTouchMove}
            style={({ pressed }) => [
              styles.cap,
              {
                width: key.widthUnits * dims.u,
                height: rowHeight,
                borderRadius: dims.radius,
                ...capStyle(pressed, isActive || isPopup),
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={key.primary}
          >
            <Text style={{ fontFamily: "JetBrainsMono", fontSize: dims.keyFont, fontWeight: "400", color: kb.text }}>
              {glyph}
            </Text>
          </Pressable>
        </View>
      );
    },
    [longPressActive, popupKey, kb, dims, capStyle, handlePressIn, handlePressOut, handleTouchMove, resolveGlyph]
  );

  const renderActionKey = useCallback(
    (key: KeySpec, rowHeight: number) => {
      const width =
        key.action === "space"
          ? dims.spaceW
          : key.action === "enter" || key.action === "symbolToggle"
            ? 1.44 * dims.u
            : dims.sideActionW;

      if (key.action === "shift") {
        return (
          <Pressable
            key={key.primary}
            onPress={handleShiftPress}
            style={({ pressed }) => [
              styles.cap,
              { width, height: rowHeight, borderRadius: dims.radius, ...capStyle(pressed, false) },
            ]}
            accessibilityRole="button"
            accessibilityLabel={shifted ? "Shift (active)" : "Shift"}
          >
            <ShiftIcon size={dims.iconSize} color={shifted ? kb.accent : kb.textMuted} />
          </Pressable>
        );
      }

      if (key.action === "backspace") {
        return (
          <Pressable
            key={key.primary}
            onPressIn={startBackspaceRepeat}
            onPressOut={clearBackspaceRepeat}
            style={({ pressed }) => [
              styles.cap,
              { width, height: rowHeight, borderRadius: dims.radius, ...capStyle(pressed, false) },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Backspace"
          >
            <BackspaceIcon size={dims.iconSize} color={kb.text} />
          </Pressable>
        );
      }

      if (key.action === "enter") {
        return (
          <Pressable
            key={key.primary}
            onPress={onNewline}
            style={({ pressed }) => [
              styles.cap,
              { width, height: rowHeight, borderRadius: dims.radius, ...capStyle(pressed, false) },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Enter"
          >
            <EnterIcon size={dims.iconSize} color={kb.text} />
          </Pressable>
        );
      }

      if (key.action === "space") {
        return (
          <Pressable
            key={key.primary}
            onPress={() => onInsert(" ")}
            style={({ pressed }) => [
              styles.cap,
              { width, height: rowHeight, borderRadius: dims.radius, ...capStyle(pressed, false) },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Space"
          >
            <SpaceIcon size={dims.iconSize - 2} color={kb.textMuted} />
          </Pressable>
        );
      }

      // symbolToggle (!#1)
      return (
        <Pressable
          key={key.primary}
          onPress={handleSymToggle}
          style={({ pressed }) => [
            styles.cap,
            { width, height: rowHeight, borderRadius: dims.radius, ...capStyle(pressed, false) },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Symbols"
        >
          <Text style={{ fontFamily: "JetBrainsMono", fontSize: dims.smallFont, fontWeight: "400", color: kb.text }}>
            {key.primary}
          </Text>
        </Pressable>
      );
    },
    [dims, kb, shifted, capStyle, handleShiftPress, handleSymToggle, startBackspaceRepeat, clearBackspaceRepeat, onNewline, onInsert]
  );

  const renderKey = useCallback(
    (key: KeySpec, rowHeight: number) => {
      if (key.action) return renderActionKey(key, rowHeight);
      return renderCharKey(key, rowHeight);
    },
    [renderCharKey, renderActionKey]
  );

  const handleSymbolInsert = useCallback(
    (sym: string) => {
      onInsert(sym);
    },
    [onInsert]
  );

  const handlePairedInsert = useCallback(
    (open: string, close: string) => {
      onInsert(open + close, 1);
    },
    [onInsert]
  );

  return (
    <View
      ref={containerRef}
      style={[
        styles.container,
        { backgroundColor: kb.background, height, paddingHorizontal: dims.padH, gap: dims.vGap },
      ]}
    >
      {renderPopup()}

      <View style={[styles.toolbarRow, { marginTop: 4 }]}>
        <View style={styles.toolbarFixed}>
          <Pressable
            onPress={onToggleProgramming}
            style={({ pressed }) => [
              styles.toolbarBtn,
              { backgroundColor: pressed ? kb.toolbarKeyPressed : kb.toolbarKey },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Switch to programming keyboard"
          >
            <MaterialCommunityIcons name="code-tags" size={20} color={kb.accent} />
          </Pressable>
          <Pressable
            onPress={() => onHideKeyboard?.()}
            style={({ pressed }) => [
              styles.toolbarBtn,
              { backgroundColor: pressed ? kb.toolbarKeyPressed : kb.toolbarKey },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Hide keyboard"
          >
            <MaterialCommunityIcons name="chevron-down" size={20} color={kb.textMuted} />
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
                { backgroundColor: pressed ? kb.toolbarKeyPressed : kb.toolbarKey },
              ]}
              accessibilityRole="button"
              accessibilityLabel={pair.display}
            >
              <Text style={[styles.symbolText, { color: kb.text }]}>{pair.display}</Text>
            </Pressable>
          ))}
          {singleSymbols.map((sym) => (
            <Pressable
              key={sym}
              onPress={() => handleSymbolInsert(sym)}
              style={({ pressed }) => [
                styles.symbolButton,
                { backgroundColor: pressed ? kb.toolbarKeyPressed : kb.toolbarKey },
              ]}
              accessibilityRole="button"
              accessibilityLabel={sym}
            >
              <Text style={[styles.symbolText, { color: kb.text }]}>{sym}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.rowsArea, { gap: dims.vGap }]}>
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <View
            key={`row-${rowIdx}`}
            style={{
              flexDirection: "row",
              gap: dims.hGap,
              paddingLeft: row.insetUnits ? row.insetUnits * dims.u + dims.hGap / 2 : undefined,
            }}
          >
            {row.keys.map((key) => renderKey(key, dims.rowHeights[rowIdx]))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    paddingBottom: 6,
  },
  toolbarRow: {
    flexDirection: "row",
    position: "relative",
    alignItems: "stretch",
  },
  toolbarFixed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    fontFamily: "JetBrainsMono",
    fontSize: 17,
    fontWeight: "400",
  },
  rowsArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cap: {
    alignItems: "center",
    justifyContent: "center",
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
});
