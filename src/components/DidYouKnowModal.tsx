import { useMemo } from "react";
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { P5Symbol } from "../data/reference";
import { highlightSyntax } from "../utils/referenceRender";
import { getExampleHtml } from "../utils/editor/exampleHtml";

interface DidYouKnowModalProps {
  visible: boolean;
  symbol: P5Symbol | null;
  onNext: () => void;
  onDismiss: () => void;
}

// Reference descriptions often append runnable example code after the prose.
// Trim at the first line that looks like code so only the explanation shows.
function trimDescription(description: string): string {
  const codeStarters = /^(function\s|let\s|const\s|var\s|\/\/|createCanvas|describe\()/;
  const lines: string[] = [];
  for (const line of description.split("\n")) {
    if (lines.length > 0 && (codeStarters.test(line.trim()) || line.trim() === "}")) break;
    if (line.trim().length === 0 && lines.length > 0) break;
    lines.push(line);
  }
  return lines.join(" ").trim();
}

export default function DidYouKnowModal({
  visible,
  symbol,
  onNext,
  onDismiss,
}: DidYouKnowModalProps) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const scheme = colorScheme === "dark" ? "dark" : "light";

  const description = useMemo(() => (symbol ? trimDescription(symbol.description) : ""), [symbol]);
  const exampleCode = useMemo(() => symbol?.examples?.[0] ?? "", [symbol]);
  const canRender = Boolean(symbol && !symbol.norender && exampleCode);

  if (!visible || !symbol) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerHigh }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <MaterialCommunityIcons name="lightbulb-on" size={22} color={derivedColors.primary} />
              <Text style={[styles.headerText, { color: colors.onSurface }]}>Did you know?</Text>
            </View>

            <View style={styles.titleRow}>
              <Text style={[styles.symbolName, { color: colors.onSurface }]}>{symbol.name}</Text>
              <View style={[styles.moduleBadge, { backgroundColor: derivedColors.primary + "26" }]}>
                <Text style={[styles.moduleBadgeText, { color: derivedColors.primary }]}>
                  {symbol.module}
                </Text>
              </View>
            </View>

            <View style={[styles.syntaxBox, { backgroundColor: colors.surfaceDim, borderLeftColor: derivedColors.primary }]}>
              <Text style={[styles.syntaxText, { color: derivedColors.primary }]}>{symbol.syntax}</Text>
            </View>

            {description.length > 0 && (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
            )}

            {canRender ? (
              <>
                <WebView
                  source={{ html: getExampleHtml(exampleCode, scheme) }}
                  style={[styles.preview, { backgroundColor: colors.surface }]}
                  scrollEnabled={false}
                  pointerEvents="none"
                  javaScriptEnabled
                  domStorageEnabled
                  bounces={false}
                />
                <View style={[styles.codeBlock, { backgroundColor: colors.surfaceDim, marginTop: 8 }]}>
                  <Text style={styles.codeText}>
                    {highlightSyntax(exampleCode, scheme).map((t, j) => (
                      <Text key={j} style={{ color: t.color }}>{t.text}</Text>
                    ))}
                  </Text>
                </View>
              </>
            ) : (
              <View style={[styles.codeBlock, { backgroundColor: colors.surfaceDim }]}>
                <Text style={styles.codeText}>{exampleCode}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onNext}
              style={({ pressed }) => [
                styles.button,
                styles.secondaryButton,
                { backgroundColor: pressed ? colors.outlineVariant : colors.surfaceDim },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Show another symbol"
            >
              <Text style={[styles.secondaryButtonText, { color: colors.onSurface }]}>Another</Text>
            </Pressable>
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? derivedColors.primary + "CC" : derivedColors.primary },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close did you know"
            >
              <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "88%",
    borderRadius: 20,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  headerText: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    fontWeight: "700",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  symbolName: {
    fontFamily: "JetBrainsMono",
    fontSize: 24,
    fontWeight: "900",
  },
  moduleBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  moduleBadgeText: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  syntaxBox: {
    borderLeftWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  syntaxText: {
    fontFamily: "JetBrainsMono",
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  preview: {
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.2)",
    marginTop: 12,
  },
  codeBlock: {
    borderRadius: 8,
    padding: 10,
  },
  codeText: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  secondaryButton: {},
  primaryButtonText: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
