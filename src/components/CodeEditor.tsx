import { useRef } from "react";
import { StyleSheet } from "react-native";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
}

const LINE_HEIGHT = 22;

const styles = StyleSheet.create({
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
});

function highlightLine(line: string) {
  const tokens: { text: string; style: string }[] = [];

  if (line.trim().startsWith("//")) {
    tokens.push({ text: line, style: "text-text-secondary dark:text-text-secondary-dark" });
    return tokens;
  }

  const patterns: [RegExp, string][] = [
    [/\b(function|if|else|for|while|return|let|const|var|new|this|class)\b/g, "text-primary"],
    [/\b(setup|draw|createCanvas|background|fill|stroke|noFill|noStroke|strokeWeight|circle|ellipse|rect|line|point|triangle|quad|arc|text|textSize|textAlign|mouseX|mouseY|mousePressed|keyPressed|width|height|frameCount|random|map|sin|cos|PI|TWO_PI|HALF_PI|push|pop|translate|rotate|scale|colorMode|color|red|green|blue|alpha|lerpColor|dist|constrain|millis|second|minute|hour|day|month|year)\b/g, "text-on-surface dark:text-on-surface-dark"],
    [/\b\d+(\.\d+)?\b/g, "text-primary-container"],
    [/("[^"]*"|'[^']*'|`[^`]*`)/g, "text-primary-fixed-dim dark:text-primary-fixed-dim-dark"],
  ];

  const allMatches: { index: number; text: string; style: string }[] = [];
  for (const [re, style] of patterns) {
    let match;
    while ((match = re.exec(line)) !== null) {
      allMatches.push({ index: match.index, text: match[0], style });
    }
  }
  allMatches.sort((a, b) => a.index - b.index);

  let lastEnd = 0;
  for (const m of allMatches) {
    if (m.index < lastEnd) continue;
    if (m.index > lastEnd) {
      tokens.push({ text: line.slice(lastEnd, m.index), style: "" });
    }
    tokens.push({ text: m.text, style: m.style });
    lastEnd = m.index + m.text.length;
  }
  if (lastEnd < line.length) {
    tokens.push({ text: line.slice(lastEnd), style: "" });
  }
  return tokens;
}

export default function CodeEditor({
  code,
  onChange,
  onRun,
  isRunning,
}: CodeEditorProps) {
  const inputRef = useRef<TextInput>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const lines = code.split("\n");

  return (
    <View className="flex-1 bg-surface-container-lowest dark:bg-surface-container-lowest-dark">
      <ScrollView className="flex-1 px-4 py-3" horizontal={false}>
        <View className="flex-row">
          <View className="pr-3 mr-3 border-r border-outline-variant dark:border-outline-variant-dark">
            {lines.map((line, i) => (
              <View
                key={line || `empty-${i}`}
                style={{ height: LINE_HEIGHT }}
                className="flex-row items-center justify-end"
              >
                <Text className="text-[10px] font-mono text-on-surface-variant dark:text-on-surface-variant-dark opacity-40 text-right">
                  {i + 1}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-1">
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

            <View className="py-0" pointerEvents="none">
              {lines.map((line, i) => {
                const tokens = highlightLine(line);
                return (
                  <View
                    key={`${line}-${i}`}
                    style={{ height: LINE_HEIGHT }}
                    className="flex-row items-center"
                  >
                    {tokens.length === 0 ? (
                      <Text className="font-mono text-[13px] text-on-surface dark:text-on-surface-dark leading-none">
                        {" "}
                      </Text>
                    ) : (
                      tokens.map((t, j) => (
                        <Text
                          key={j}
                          className={`font-mono text-[13px] leading-none ${t.style || "text-on-surface dark:text-on-surface-dark"}`}
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
        className="absolute right-4 bottom-4 w-14 h-14 bg-primary rounded-full items-center justify-center active:scale-90 shadow-2xl"
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
