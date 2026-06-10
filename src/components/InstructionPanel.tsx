import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { fontFamily, fontSize, fontWeight } from "../styles/typography";
import { spacing, borderRadius } from "../styles/spacing";
import PreviewImage from "./PreviewImage";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InstructionPanelProps {
  title: string;
  description: string;
  previewImage?: string;
  onRun: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export default function InstructionPanel({
  title,
  description,
  previewImage,
  onRun,
  onReset,
  disabled,
}: InstructionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const primary = useThemeColor("primary");
  const onPrimary = useThemeColor("onPrimary");
  const onSurface = useThemeColor("onSurface");
  const onSurfaceVariant = useThemeColor("onSurfaceVariant");
  const surfaceDim = useThemeColor("surfaceDim");
  const outlineVariant = useThemeColor("outlineVariant");

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={[styles.container, { borderBottomColor: outlineVariant }]}>
      <Pressable
        onPress={toggle}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse instructions" : "Expand instructions"}
      >
        <Text style={[styles.chevron, { color: onSurfaceVariant }]}>
          {expanded ? "▼" : "▶"}
        </Text>
        <Text style={[styles.headerTitle, { color: onSurface }]}>
          Instructions
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.body}>
          <Text style={[styles.title, { color: onSurface }]}>{title}</Text>
          <Text style={[styles.description, { color: onSurfaceVariant }]}>
            {description}
          </Text>

          <PreviewImage imageUrl={previewImage} />

          <View style={styles.actions}>
            <Pressable
              onPress={onRun}
              disabled={disabled}
              style={({ pressed }) => [
                styles.runButton,
                { backgroundColor: primary },
                pressed && styles.pressed,
                disabled && styles.disabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Run code"
            >
              <Text style={[styles.runText, { color: onPrimary }]}>
                Run Code
              </Text>
            </Pressable>

            <Pressable
              onPress={onReset}
              disabled={disabled}
              style={({ pressed }) => [
                styles.resetButton,
                { backgroundColor: surfaceDim, borderColor: outlineVariant },
                pressed && styles.pressed,
                disabled && styles.disabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Reset code"
            >
              <Text style={[styles.resetText, { color: onSurfaceVariant }]}>
                Reset
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  chevron: {
    fontSize: fontSize.sm,
    marginRight: spacing[2],
    width: 16,
  },
  headerTitle: {
    fontFamily: fontFamily.headline,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  body: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  title: {
    fontFamily: fontFamily.headline,
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: 24,
    marginTop: spacing[2],
  },
  actions: {
    flexDirection: "row",
    gap: spacing[3],
    marginTop: spacing[4],
  },
  runButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.lg,
  },
  runText: {
    fontFamily: fontFamily.label,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  resetButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  resetText: {
    fontFamily: fontFamily.label,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
