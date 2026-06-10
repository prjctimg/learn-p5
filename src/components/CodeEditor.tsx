import { useRef } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
}

const LINE_HEIGHT = 22;

type SyntaxColorKey = "textSecondary" | "primary" | "onSurface" | "primaryContainer" | "primaryFixedDim";

function highlightLine(line: string) {
  const tokens: { text: string; colorKey: SyntaxColorKey | "" }[] = [];

  if (line.trim().startsWith("//")) {
    tokens.push({ text: line, colorKey: "textSecondary" });
    return tokens;
  }

  const patterns: [RegExp, SyntaxColorKey][] = [
    [/\b(function|if|else|for|while|return|let|const|var|new|this|class)\b/g, "primary"],
    [/\b(setup|draw|createCanvas|background|fill|stroke|noFill|noStroke|strokeWeight|circle|ellipse|rect|line|point|triangle|quad|arc|text|textSize|textAlign|mouseX|mouseY|mousePressed|keyPressed|width|height|frameCount|random|map|sin|cos|PI|TWO_PI|HALF_PI|push|pop|translate|rotate|scale|colorMode|color|red|green|blue|alpha|lerpColor|dist|constrain|millis|second|minute|hour|day|month|year)\b/g, "onSurface"],
    [/\b\d+(\.\d+)?\b/g, "primaryContainer"],
    [/("[^"]*"|'[^']*'|`[^`]*`)/g, "primaryFixedDim"],
  ];

  const allMatches: { index: number; text: string; colorKey: SyntaxColorKey }[] = [];
  for (const [re, colorKey] of patterns) {
    let match;
    while ((match = re.exec(line)) !== null) {
      allMatches.push({ index: match.index, text: match[0], colorKey });
    }
  }
  allMatches.sort((a, b) => a.index - b.index);

  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.index < lastEnd) continue;
    if (m.index > lastEnd) {
      tokens.push({ text: line.slice(lastEnd, m.index), colorKey: "" });
    }
    tokens.push({ text: m.text, colorKey: m.colorKey });
    lastEnd = m.index + m.text.length;
  }
  if (lastEnd < line.length) {
    tokens.push({ text: line.slice(lastEnd), colorKey: "" });
  }
  return tokens;
}

const createStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    hiddenInput: {
      fontFamily: "JetBrainsMono, monospace",
      fontSize: 13,
      lineHeight: LINE_HEIGHT,
      color: "transparent",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
    },
    container: {
      flex: 1,
      backgroundColor: colors.surfaceContainerLowest,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    flexRow: {
      flexDirection: "row",
    },
    gutter: {
      paddingRight: 12,
      marginRight: 12,
      borderRightWidth: 1,
      borderColor: colors.outlineVariant,
    },
    gutterLine: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    gutterNumber: {
      fontSize: 10,
      fontFamily: "JetBrainsMono",
      color: colors.onSurfaceVariant,
      opacity: 0.4,
      textAlign: "right",
    },
    codeContainer: {
      flex: 1,
    },
    overlay: {
      paddingVertical: 0,
    },
    codeLine: {
      flexDirection: "row",
      alignItems: "center",
    },
    codeText: {
      fontFamily: "JetBrainsMono",
      fontSize: 13,
      lineHeight: 13,
    },
    runButton: {
      position: "absolute",
      right: 16,
      bottom: 16,
      width: 56,
      height: 56,
      backgroundColor: colors.primary,
      borderRadius: 9999,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 12,
    },
    runButtonPressed: {
      transform: [{ scale: 0.9 }],
    },
  });

export default function CodeEditor({
  code,
  onChange,
  onRun,
  isRunning,
}: CodeEditorProps) {
  const inputRef = useRef<TextInput>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const lines = code.split("\n");
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const styles = createStyles(colors);

  const syntaxColors: Record<string, string> = {
    textSecondary: colors.textSecondary,
    primary: colors.primary,
    onSurface: colors.onSurface,
    primaryContainer: colors.primaryContainer,
    primaryFixedDim: colors.primaryFixedDim,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} horizontal={false}>
        <View style={styles.flexRow}>
          <View style={styles.gutter}>
            {lines.map((line, i) => (
              <View
                key={line || `empty-${i}`}
                style={{ height: LINE_HEIGHT }}
              >
                <View style={styles.gutterLine}>
                  <Text style={styles.gutterNumber}>
                    {i + 1}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.codeContainer}>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={onChange}
              onSelectionChange={(e) => { selectionRef.current = e.nativeEvent.selection; }}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              style={styles.hiddenInput}
              accessibilityLabel="Code editor"
            />

            <View style={styles.overlay} pointerEvents="none">
              {lines.map((line, i) => {
                const tokens = highlightLine(line);
                return (
                  <View
                    key={`${line}-${i}`}
                    style={{ height: LINE_HEIGHT }}
                  >
                    <View style={styles.codeLine}>
                      {tokens.length === 0 ? (
                        <Text style={[styles.codeText, { color: colors.onSurface }]}>
                          {" "}
                        </Text>
                      ) : (
                        tokens.map((t, j) => (
                          <Text
                            key={j}
                            style={[
                              styles.codeText,
                              { color: t.colorKey ? syntaxColors[t.colorKey] : colors.onSurface },
                            ]}
                          >
                            {t.text}
                          </Text>
                        ))
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={onRun}
        disabled={isRunning}
        style={({ pressed }) => [
          styles.runButton,
          pressed && styles.runButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Run sketch"
        accessibilityState={{ disabled: isRunning }}
      >
        <MaterialCommunityIcons
          name={isRunning ? "reload" : "play"}
          size={28}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}
