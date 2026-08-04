import { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

interface TaskCompletePulseProps {
  visible: boolean;
  message: string;
  onDone: () => void;
  /** Duration of the full pulse in ms before onDone fires. */
  duration?: number;
}

export default function TaskCompletePulse({
  visible,
  message,
  onDone,
  duration = 1100,
}: TaskCompletePulseProps) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    scale.value = 0.6;
    opacity.value = 0;
    // Spring-like entry, hold, then fade out.
    scale.value = withSequence(
      withTiming(1.08, { duration: 220, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 120 }),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 160 }),
      withDelay(duration - 260, withTiming(0, { duration: 260 })),
    );
    const t = setTimeout(() => runOnJS(onDone)(), duration);
    return () => clearTimeout(t);
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.surfaceContainerHighest },
            cardStyle,
          ]}
        >
          <MaterialCommunityIcons name="check-circle" size={40} color={derivedColors.primary} />
          <Text style={[styles.message, { color: colors.onSurface }]}>{message}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  message: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    fontWeight: "700",
  },
});
