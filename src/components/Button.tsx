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
 const { colorScheme } = useThemeContext();
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
 backgroundColor: colors.primary,
 }
 : {
 backgroundColor: colorScheme === "dark" ? colors.surfaceContainerHigh : "#FFFFFF",
 },
 pressed && !disabled && { opacity: 0.9 },
 pressed && variant === "primary" && {
 transform: [{ translateY: 4 }, { translateX: 4 }],
 },
 pressed && variant === "outline" && {
 transform: [{ translateY: 2 }],
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
 width: "100%",
 paddingVertical: 16,
 paddingHorizontal: 24,
 alignItems: "center",
 justifyContent: "center",
 borderRadius: 0,
 minHeight: 52,
 },
 primaryText: {
 fontWeight: "900",
 fontSize: 20,
 textTransform: "uppercase",
 letterSpacing: 0.5,
 },
 outlineText: {
 fontWeight: "700",
 fontSize: 20,
 textTransform: "uppercase",
 letterSpacing: 1,
 },
});
