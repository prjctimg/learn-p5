import { useRef, type RefObject } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
  inputRef?: RefObject<TextInput | null>;
}

const LINE_HEIGHT = 22;

type SyntaxColorKey = "textSecondary" | "primary" | "onSurface" | "primaryContainer" | "primaryFixedDim";

const INLINE_COMMENT_RE = /(\/\/.*)/;
const KEYWORD_RE = /\b(function|if|else|for|while|return|let|const|var|new|this|class)\b/g;
const P5_FUNC_RE = /\b(setup|draw|createCanvas|background|fill|stroke|noFill|noStroke|strokeWeight|circle|ellipse|rect|line|point|triangle|quad|arc|text|textSize|textAlign|mouseX|mouseY|mousePressed|keyPressed|width|height|frameCount|random|map|sin|cos|PI|TWO_PI|HALF_PI|push|pop|translate|rotate|scale|colorMode|color|red|green|blue|alpha|lerpColor|dist|constrain|millis|second|minute|hour|day|month|year)\b/g;
const NUMBER_RE = /\b\d+(\.\d+)?\b/g;
const STRING_RE = /("[^"]*"|'[^']*'|`[^`]*`)/g;

interface Token {
  text: string;
  colorKey: SyntaxColorKey | "";
}

function tokenizeCode(codePart: string): Token[] {
  const allMatches: { index: number; text: string; colorKey: SyntaxColorKey }[] = [];
  const patterns: [RegExp, SyntaxColorKey][] = [
    [KEYWORD_RE, "primary"],
    [P5_FUNC_RE, "onSurface"],
    [NUMBER_RE, "primaryContainer"],
    [STRING_RE, "primaryFixedDim"],
  ];
  for (const [re, colorKey] of patterns) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(codePart)) !== null) {
      allMatches.push({ index: match.index, text: match[0], colorKey });
    }
  }
  allMatches.sort((a, b) => a.index - b.index);

  const tokens: Token[] = [];
  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.index < lastEnd) continue;
    if (m.index > lastEnd) {
      tokens.push({ text: codePart.slice(lastEnd, m.index), colorKey: "" });
    }
    tokens.push({ text: m.text, colorKey: m.colorKey });
    lastEnd = m.index + m.text.length;
  }
  if (lastEnd < codePart.length) {
    tokens.push({ text: codePart.slice(lastEnd), colorKey: "" });
  }
  return tokens;
}

function highlightLine(line: string): Token[] {
  const trimmed = line.trim();
  if (trimmed.startsWith("//")) {
    return [{ text: line, colorKey: "textSecondary" }];
  }

  const commentMatch = line.match(INLINE_COMMENT_RE);
  if (commentMatch && commentMatch.index !== undefined && commentMatch.index > 0) {
    const codePart = line.slice(0, commentMatch.index);
    const commentPart = commentMatch[1];
    return [
      ...tokenizeCode(codePart),
      { text: commentPart, colorKey: "textSecondary" },
    ];
  }

  return tokenizeCode(line);
}

const createStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    input: {
      fontFamily: "JetBrainsMono",
      fontSize: 15,
      lineHeight: LINE_HEIGHT,
      color: "transparent",
      paddingHorizontal: 0,
      paddingVertical: 0,
      margin: 0,
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
    contentWrapper: {
      position: "relative",
      flexDirection: "row",
      minHeight: "100%",
    },
    gutter: {
      paddingRight: 12,
      marginRight: 12,
    },
    gutterLine: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      height: LINE_HEIGHT,
    },
    gutterNumber: {
      fontSize: 11,
      fontFamily: "JetBrainsMono",
      color: colors.onSurfaceVariant,
      opacity: 0.4,
      textAlign: "right",
    },
    codeArea: {
      flex: 1,
      position: "relative",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    codeLine: {
      flexDirection: "row",
      alignItems: "center",
      height: LINE_HEIGHT,
    },
    codeText: {
      fontFamily: "JetBrainsMono",
      fontSize: 15,
      lineHeight: LINE_HEIGHT,
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
  inputRef: externalRef,
}: CodeEditorProps) {
  const internalRef = useRef<TextInput>(null);
  const inputRef = externalRef ?? internalRef;
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
      <ScrollView style={styles.scrollView} horizontal={false} keyboardShouldPersistTaps="handled">
        <View style={styles.contentWrapper}>
          <View style={styles.gutter}>
            {lines.map((line, i) => (
              <View key={line || `empty-${i}`} style={styles.gutterLine}>
                <Text style={styles.gutterNumber}>
                  {i + 1}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.codeArea}>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={onChange}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              showSoftInputOnFocus={false}
              style={styles.input}
              accessibilityLabel="Code editor"
            />

            <View style={styles.overlay} pointerEvents="none">
              {lines.map((line, i) => {
                const tokens = highlightLine(line);
                return (
                  <View key={`${line}-${i}`} style={styles.codeLine}>
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
