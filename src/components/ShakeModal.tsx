import { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";

export interface ShakeAction {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
}

interface ShakeModalProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  subtitle?: string;
  actions: ShakeAction[];
}

const VARIANT_STYLES = {
  primary: (bg: string) => ({ backgroundColor: bg }),
  secondary: (bg: string) => ({ backgroundColor: bg + "33" }),
  ghost: (_bg: string) => ({ backgroundColor: "transparent" }),
} as const;

export default function ShakeModal({
  visible,
  onDismiss,
  title = "Quick Actions",
  subtitle = "What would you like to do?",
  actions,
}: ShakeModalProps) {
  const { derivedColors } = useThemeContext();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: derivedColors.primaryContainer,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="vibrate"
            size={32}
            color={derivedColors.onPrimaryContainer}
          />
        </View>
        <Text style={[styles.title, { color: derivedColors.onPrimaryContainer }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: derivedColors.onPrimaryContainer + "CC" }]}>
          {subtitle}
        </Text>

        <ScrollView style={styles.actionsScroll} contentContainerStyle={styles.actions}>
          {actions.map((action, i) => {
            const variant = action.variant ?? (i === 0 ? "primary" : "secondary");
            const bg = variant === "primary" ? derivedColors.primary : derivedColors.onPrimaryContainer;
            const textColor = variant === "primary" ? derivedColors.onPrimary : derivedColors.onPrimaryContainer;
            const variantStyle = VARIANT_STYLES[variant](bg);

            return (
              <Pressable
                key={`${action.label}-${i}`}
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.actionButton,
                  variantStyle,
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name={action.icon as any}
                  size={18}
                  color={textColor}
                />
                <Text style={[styles.actionText, { color: textColor }]}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    width: "80%",
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "JetBrainsMono",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    marginBottom: 20,
  },
  actions: {
    width: "100%",
    gap: 8,
  },
  actionsScroll: {
    width: "100%",
    maxHeight: 300,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionText: {
    fontFamily: "JetBrainsMono",
    fontSize: 14,
    fontWeight: "600",
  },
});
