import { Text, Pressable, StyleSheet } from "react-native";
import { useThemeContext } from "../components/ThemeProvider";
import { Colors } from "../constants/Colors";

type Variant = "primary" | "outline";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  accessibilityLabel,
}: ButtonProps) {
  const { colorScheme, ctaColor } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        variant === "primary"
          ? {
              backgroundColor: ctaColor,
            }
          : {
              backgroundColor: colorScheme === "dark" ? colors.surfaceContainerHigh : "#FFFFFF",
            },
        pressed && !disabled && { opacity: 0.9 },
        pressed && variant === "primary" && {
          transform: [{ translateY: 2 }],
        },
        pressed && variant === "outline" && {
          transform: [{ translateY: 1 }],
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={[
          variant === "primary" ? styles.primaryText : styles.outlineText,
          { color: variant === "primary" ? colors.onPrimary : colors.primary },
          disabled && { opacity: 0.5 },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    minHeight: 48,
  },
  primaryText: {
    fontFamily: "JetBrainsMono",
    fontWeight: "900",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  outlineText: {
    fontFamily: "JetBrainsMono",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
