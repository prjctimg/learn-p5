import { useState, useCallback, useRef, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, GestureResponderEvent } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useThemeContext } from "./ThemeProvider";
import { Colors, KeyboardColors } from "../constants/Colors";
import { pairedSymbols, singleSymbols } from "../data/keyboardLayout";
import {
  DESIGN,
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

// Stitch Virtual Keyboard UI — projects/3964689377051300116/screens/41c14c27e617436dbed6c73430283862
//   .keyboard-container { padding:8px, gap:12px, background:#111111, max-width:500px }
//   .key-row { gap:6px }
//   .key { background:#333333 / #222222 for specials, radius:8px, height:52px, font 22/18/16px, color:#fff }
//   .key:active { background:#444444 }
//   .key-shift svg stroke:#60a5fa
const STITCH_GAP = DESIGN.hGap; // 6
const STITCH_VGAP = DESIGN.vGap; // 12
const STITCH_PAD = DESIGN.outerPadding; // 8
const STITCH_RADIUS = DESIGN.keyRadius; // 8
const STITCH_KEY_HEIGHT = DESIGN.keyHeight; // 52
const MAX_CONTAINER_WIDTH = 500;
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
  const kb = KeyboardColors[colorScheme === "dark" ? "dark" : "light"] as typeof KeyboardColors.dark & {
    keyCapSpecial: string;
    keyCapSpecialPressed: string;
  };
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
  const [popupLayout, setPopupLayout] = useState<{ top: number; left: number } | null>(null);
  const [popupAlternates, setPopupAlternates] = useState<string[]>([]);
  const [popupRowLeftGlobal, setPopupRowLeftGlobal] = useState(0);
  const [popupWidth, setPopupWidth] = useState(ALT_CELL_WIDTH);
  const [shifted, setShifted] = useState(false);
  const [symPage, setSymPage] = useState(false);
  const [popupSelected, setPopupSelected] = useState(0);
  const keyRefs = useRef<Record<string, View | null>>({});
  const containerRef = useRef<View>(null);

  // Stitch is flex-based; we keep a lightweight responsive scale for height / fonts
  // so the 52px Stitch height feels consistent across phones vs tablets.
  const dims = useMemo(() => {
    // For very small screens, shrink slightly to avoid overflow of 10 keys + gaps.
    const expectedW = 10 * 40 + 9 * STITCH_GAP + 2 * STITCH_PAD;
    const fit = screenWidth < expectedW ? screenWidth / expectedW : 1;
    const keyHeight = Math.round(STITCH_KEY_HEIGHT * Math.max(0.9, Math.min(1, fit)));
    return {
      hGap: STITCH_GAP,
      vGap: STITCH_VGAP,
      padH: STITCH_PAD,
      padV: STITCH_PAD,
      keyHeight,
      radius: STITCH_RADIUS,
      // Stitch font system: standard 22px, symbol 18px, space 16px
      keyFont: 22,
      symbolFont: 18,
      spaceFont: 16,
      iconSize: 24,
      containerMaxWidth: MAX_CONTAINER_WIDTH,
    };
  }, [screenWidth]);

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
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono",
                    fontSize: isSelected ? 22 : 20,
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

  // Stitch palette: standard keys #333333/#FFFFFF pressed #444444; specials #222222 pressed #333333; shift accent #60a5fa
  const getCapColors = useCallback(
    (isSpecial: boolean, pressed: boolean, isActive: boolean) => {
      if (isSpecial) {
        return pressed || isActive ? kb.keyCapSpecialPressed : kb.keyCapSpecial;
      }
      return pressed || isActive ? kb.keyCapPressed : kb.keyCap;
    },
    [kb]
  );

  const renderCharKey = useCallback(
    (key: KeySpec) => {
      const isActive = longPressActive && longPressKey.current === key.primary;
      const isPopup = popupKey === key.primary;
      const glyph = resolveGlyph(key);
      const isUpper = glyph !== key.primary && glyph.toLowerCase() === key.primary;
      return (
        <View
          key={key.primary}
          ref={(r) => {
            keyRefs.current[key.primary] = r;
          }}
          style={{ flex: key.widthUnits, maxWidth: 40 * key.widthUnits }}
        >
          <Pressable
            onPressIn={() => handlePressIn(key)}
            onPressOut={() => handlePressOut(key)}
            onTouchMove={handleTouchMove}
            style={({ pressed }) => [
              styles.cap,
              styles.capStandard,
              {
                height: dims.keyHeight,
                borderRadius: dims.radius,
                backgroundColor: getCapColors(false, pressed, isActive || isPopup),
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={key.primary}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                fontSize: dims.keyFont,
                fontWeight: "400",
                color: kb.text,
                textTransform: isUpper ? undefined : undefined,
              }}
            >
              {glyph}
            </Text>
          </Pressable>
        </View>
      );
    },
    [longPressActive, popupKey, kb, dims, getCapColors, handlePressIn, handlePressOut, handleTouchMove, resolveGlyph]
  );

  const renderActionKey = useCallback(
    (key: KeySpec) => {
      const isSpecial = true;
      // Stitch flex values: shift/backspace/symbol/enter = 1.5, space = 5, comma/period handled as char keys
      const flex = key.widthUnits;

      if (key.action === "shift") {
        return (
          <View key={key.primary} style={{ flex, maxWidth: 55 * (flex / 1.5) }}>
            <Pressable
              onPress={handleShiftPress}
              style={({ pressed }) => [
                styles.cap,
                styles.capSpecial,
                {
                  height: dims.keyHeight,
                  borderRadius: dims.radius,
                  backgroundColor: getCapColors(isSpecial, pressed, false),
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={shifted ? "Shift (active)" : "Shift"}
            >
              <ShiftIcon size={dims.iconSize} color={shifted ? kb.accent : kb.text} />
            </Pressable>
          </View>
        );
      }

      if (key.action === "backspace") {
        return (
          <View key={key.primary} style={{ flex, maxWidth: 55 * (flex / 1.5) }}>
            <Pressable
              onPressIn={startBackspaceRepeat}
              onPressOut={clearBackspaceRepeat}
              style={({ pressed }) => [
                styles.cap,
                styles.capSpecial,
                {
                  height: dims.keyHeight,
                  borderRadius: dims.radius,
                  backgroundColor: getCapColors(isSpecial, pressed, false),
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Backspace"
            >
              <BackspaceIcon size={dims.iconSize} color={kb.text} />
            </Pressable>
          </View>
        );
      }

      if (key.action === "enter") {
        return (
          <View key={key.primary} style={{ flex, maxWidth: 60 * (flex / 1.5) }}>
            <Pressable
              onPress={onNewline}
              style={({ pressed }) => [
                styles.cap,
                styles.capSpecial,
                {
                  height: dims.keyHeight,
                  borderRadius: dims.radius,
                  backgroundColor: getCapColors(isSpecial, pressed, false),
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Enter"
            >
              <EnterIcon size={dims.iconSize} color={kb.text} />
            </Pressable>
          </View>
        );
      }

      if (key.action === "space") {
        return (
          <View key={key.primary} style={{ flex, maxWidth: 400 }}>
            <Pressable
              onPress={() => onInsert(" ")}
              style={({ pressed }) => [
                styles.cap,
                {
                  height: dims.keyHeight,
                  borderRadius: dims.radius,
                  backgroundColor: getCapColors(false, pressed, false),
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Space"
            >
              {/* Stitch shows "English (UK)" centered inside space; we keep SpaceIcon for a11y but mimic flex:5 size */}
              <SpaceIcon size={dims.iconSize - 2} color={kb.textMuted} />
            </Pressable>
          </View>
        );
      }

      // symbolToggle (!#1) — Stitch .key-symbol: bg #222222, font 18
      return (
        <View key={key.primary} style={{ flex, maxWidth: 60 * (flex / 1.5) }}>
          <Pressable
            onPress={handleSymToggle}
            style={({ pressed }) => [
              styles.cap,
              styles.capSpecial,
              {
                height: dims.keyHeight,
                borderRadius: dims.radius,
                backgroundColor: getCapColors(isSpecial, pressed, false),
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Symbols"
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                fontSize: dims.symbolFont,
                fontWeight: "400",
                color: kb.text,
              }}
            >
              {key.primary}
            </Text>
          </Pressable>
        </View>
      );
    },
    [
      dims,
      kb,
      shifted,
      getCapColors,
      handleShiftPress,
      handleSymToggle,
      startBackspaceRepeat,
      clearBackspaceRepeat,
      onNewline,
      onInsert,
    ]
  );

  const renderKey = useCallback(
    (key: KeySpec) => {
      if (key.action) return renderActionKey(key);
      return renderCharKey(key);
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
        {
          backgroundColor: kb.background,
          height,
          paddingHorizontal: dims.padH,
          paddingVertical: dims.padV,
          gap: dims.vGap,
        },
      ]}
    >
      {renderPopup()}

      {/* Toolbar — kept for programming keyboard toggle + symbol chips, styled to match Stitch */}
      <View style={styles.toolbarRow}>
        <View style={styles.toolbarFixed}>
          <Pressable
            onPress={onToggleProgramming}
            style={({ pressed }) => [
              styles.toolbarBtn,
              {
                backgroundColor: pressed ? kb.toolbarKeyPressed : kb.toolbarKey,
                borderRadius: dims.radius,
              },
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
              {
                backgroundColor: pressed ? kb.toolbarKeyPressed : kb.toolbarKey,
                borderRadius: dims.radius,
              },
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
          contentContainerStyle={[styles.symbolsContent, { gap: dims.hGap }]}
        >
          {pairedSymbols.map((pair) => (
            <Pressable
              key={pair.display}
              onPress={() => handlePairedInsert(pair.open, pair.close)}
              style={({ pressed }) => [
                styles.symbolButton,
                {
                  backgroundColor: pressed ? kb.toolbarKeyPressed : kb.toolbarKey,
                  borderRadius: dims.radius,
                },
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
                {
                  backgroundColor: pressed ? kb.toolbarKeyPressed : kb.toolbarKey,
                  borderRadius: dims.radius,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={sym}
            >
              <Text style={[styles.symbolText, { color: kb.text }]}>{sym}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.rowsArea, { gap: dims.vGap, maxWidth: dims.containerMaxWidth, alignSelf: "center", width: "100%" }]}>
        {KEYBOARD_ROWS.map((row, rowIdx) => {
          const isMiddleRow = rowIdx === 2;
          return (
            <View
              key={`row-${rowIdx}`}
              style={{
                flexDirection: "row",
                gap: dims.hGap,
                // Stitch: middle row padded 0 10% — approximate with percentage padding
                paddingHorizontal: isMiddleRow ? screenWidth * 0.05 : 0,
                justifyContent: "center",
              }}
            >
              {row.keys.map((key) => renderKey(key))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Stitch: background #111111, padding 8px, gap 12px
    justifyContent: "flex-end",
  },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  },
  symbolsScroll: {
    maxHeight: 44,
    flex: 1,
  },
  symbolsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  symbolButton: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolText: {
    fontFamily: "JetBrainsMono",
    fontSize: 17,
    fontWeight: "400",
  },
  rowsArea: {
    justifyContent: "flex-end",
  },
  cap: {
    alignItems: "center",
    justifyContent: "center",
    // Stitch: box-shadow 0 1px 2px rgba(0,0,0,0.2) — approximated via elevation for Android
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  capStandard: {
    flex: 1,
  },
  capSpecial: {
    flex: 1,
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
