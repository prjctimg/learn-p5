import { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";

interface ShakeModalProps {
  visible: boolean;
  onDismiss: () => void;
  onHint?: () => void;
  onReset?: () => void;
}

export default function ShakeModal({ visible, onDismiss, onHint, onReset }: ShakeModalProps) {
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
          Shake to...
        </Text>
        <Text style={[styles.subtitle, { color: derivedColors.onPrimaryContainer + "CC" }]}>
          What would you like to do?
        </Text>

        <View style={styles.actions}>
          {onHint && (
            <Pressable
              onPress={onHint}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: derivedColors.primary },
                pressed && styles.actionButtonPressed,
              ]}
            >
              <MaterialCommunityIcons name="lightbulb-outline" size={18} color={derivedColors.onPrimary} />
              <Text style={[styles.actionText, { color: derivedColors.onPrimary }]}>Get Hint</Text>
            </Pressable>
          )}
          {onReset && (
            <Pressable
              onPress={onReset}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: derivedColors.primary + "33" },
                pressed && styles.actionButtonPressed,
              ]}
            >
              <MaterialCommunityIcons name="restart" size={18} color={derivedColors.primary} />
              <Text style={[styles.actionText, { color: derivedColors.primary }]}>Reset Code</Text>
            </Pressable>
          )}
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: derivedColors.primary + "1A" },
              pressed && styles.actionButtonPressed,
            ]}
          >
            <MaterialCommunityIcons name="close" size={18} color={derivedColors.onPrimaryContainer} />
            <Text style={[styles.actionText, { color: derivedColors.onPrimaryContainer }]}>Dismiss</Text>
          </Pressable>
        </View>
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
