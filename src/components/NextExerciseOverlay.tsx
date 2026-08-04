import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Svg, Circle } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

interface NextExerciseOverlayProps {
  visible: boolean;
  /** Title of the next exercise (or null if the module is complete). */
  nextTitle: string | null;
  /** Seconds to count down before auto-advancing. */
  countdownSeconds?: number;
  onCancel: () => void;
  onAdvance: () => void;
}

const RING_SIZE = 64;
const RING_STROKE = 5;
const { width: screenWidth } = Dimensions.get("window");
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function NextExerciseOverlay({
  visible,
  nextTitle,
  countdownSeconds = 3,
  onCancel,
  onAdvance,
}: NextExerciseOverlayProps) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [remaining, setRemaining] = useState(countdownSeconds);
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  // Animated stroke-dashoffset drives the countdown ring.
  const dashOffset = useSharedValue(RING_CIRCUMFERENCE);

  useEffect(() => {
    if (!visible) return;
    setRemaining(countdownSeconds);
    overlayOpacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    cardScale.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
    // Sweep the ring from full → empty over the countdown window.
    dashOffset.value = withTiming(0, {
      duration: countdownSeconds * 1000,
      easing: Easing.linear,
    });

    let left = countdownSeconds;
    const tick = setInterval(() => {
      left -= 1;
      if (left >= 0) setRemaining(left);
      if (left <= 0) {
        clearInterval(tick);
        runOnJS(onAdvance)();
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [visible]);

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));

  if (!visible) return null;

  const isModuleComplete = nextTitle === null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceContainerHighest },
          cardAnimStyle,
        ]}
      >
        <View style={styles.headerRow}>
          <MaterialCommunityIcons
            name={isModuleComplete ? "trophy" : "check-circle"}
            size={32}
            color={derivedColors.primary}
          />
          <Text style={[styles.eyebrow, { color: colors.onSurfaceVariant }]}>
            {isModuleComplete ? "Module complete" : "Exercise complete"}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.onSurface }]}>
          {isModuleComplete
            ? "You finished the module!"
            : `Next: ${nextTitle}`}
        </Text>

        {isModuleComplete ? (
          <Pressable
            onPress={onAdvance}
            style={[styles.button, { backgroundColor: derivedColors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Back to modules"
          >
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
              Back to modules
            </Text>
          </Pressable>
        ) : (
          <View style={styles.countdownRow}>
            <View style={styles.ringWrap}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke={colors.outlineVariant}
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <AnimatedCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke={derivedColors.primary}
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  animatedProps={ringAnimatedProps}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </Svg>
              <Text style={[styles.ringNumber, { color: colors.onSurface }]}>
                {remaining}
              </Text>
            </View>
            <Pressable
              onPress={onCancel}
              style={[styles.button, { backgroundColor: colors.surfaceDim }]}
              accessibilityRole="button"
              accessibilityLabel="Stay here"
            >
              <Text style={[styles.buttonText, { color: colors.onSurface }]}>
                Stay here
              </Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

// react-native-svg's <Circle> needs to be wrapped in Animated.createAnimatedComponent
// to accept an animated style (for strokeDashoffset).
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 2000,
  },
  card: {
    width: Math.min(360, screenWidth - 48),
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 22,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eyebrow: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: "JetBrainsMono",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 4,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ringNumber: {
    position: "absolute",
    fontFamily: "JetBrainsMono",
    fontSize: 22,
    fontWeight: "800",
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "JetBrainsMono",
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
