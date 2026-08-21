import { useEffect, useRef } from "react";
import { Animated, Text, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

interface ToastProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  duration?: number;
  icon?: string;
  iconColor?: string;
  tone?: "success" | "failure";
}

// Off-screen resting position for the drop-down animation. Must exceed the
// tallest possible toast (status-bar inset + card height).
const HIDDEN_Y = -160;

export default function Toast({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 4000,
  icon = "check-circle",
  iconColor,
  tone,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const insets = useSafeAreaInsets();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const effectiveIconColor =
    iconColor ?? (tone === "failure" ? colors.error : colors.success);
  // Success/info notifications render as a floating rounded card; failures
  // keep the classic full-width banner treatment.
  const isBanner = tone === "failure";

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.spring(translateY, {
          toValue: HIDDEN_Y,
          tension: 200,
          friction: 14,
          useNativeDriver: true,
        }).start(() => onDismiss?.());
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(HIDDEN_Y);
    }
  }, [visible]);

  const handleAction = () => {
    Animated.spring(translateY, {
      toValue: HIDDEN_Y,
      tension: 200,
      friction: 14,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
      onAction?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { transform: [{ translateY }] },
      ]}
    >
      <View
        style={[
          isBanner ? styles.banner : styles.card,
          {
            backgroundColor: colors.surfaceContainerHighest,
            marginTop: insets.top + 8,
            shadowColor: colors.scrim,
          },
          !isBanner && { maxWidth: 480 },
        ]}
      >
        <View style={styles.content}>
          <MaterialCommunityIcons name={icon as any} size={20} color={effectiveIconColor} />
          <Text style={[styles.message, { color: colors.onSurface }]}>
            {message}
          </Text>
        </View>
        {actionLabel && (
          <Pressable onPress={handleAction} style={styles.actionBtn}>
            <Text style={[styles.actionLabel, { color: colors.primary }]}>
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  message: {
    fontFamily: "JetBrainsMono",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  actionBtn: {
    paddingLeft: 12,
  },
  actionLabel: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
