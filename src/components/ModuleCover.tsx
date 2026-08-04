import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { Svg, Path, Circle, Line, Rect, Polygon, Ellipse as SvgEllipse } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";

// The p5.js asterisk path (same as ExerciseCard/SplashScreen).
const ASTERISK_PATH =
  "M16.909,10.259l8.533-2.576l1.676,5.156l-8.498,2.899l5.275,7.48l-4.447,3.225l-5.553-7.348L8.487,26.25l-4.318-3.289l5.275-7.223L0.88,12.647l1.678-5.16l8.598,2.771V1.364h5.754V10.259z";

interface ModuleCoverProps {
  slug: string;
  color: string;
  locked?: boolean;
  completed?: boolean;
}

const COVER_SIZE = 96;

export default function ModuleCover({ slug, color, locked, completed }: ModuleCoverProps) {
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // One shared rotation/phase driver — each variant wires its own transforms
  // off these shared values so the whole cover animates as one piece.
  const rotation = useSharedValue(0);
  const phase = useSharedValue(0);
  const breath = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1, false);
    phase.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }), -1, true);
    breath.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.92, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  // Variant selection by slug. Falls back to the rotating asterisk.
  const Variant = useMemo(() => pickVariant(slug), [slug]);

  // Locked/completed states render a static icon instead of the animated loop.
  if (locked) {
    return (
      <CoverShell color={color}>
        <MaterialCommunityIcons name="lock" size={28} color={colors.textSecondary} />
      </CoverShell>
    );
  }
  if (completed) {
    return (
      <CoverShell color={color}>
        <MaterialCommunityIcons name="check-circle" size={28} color={color} />
      </CoverShell>
    );
  }

  return (
    <CoverShell color={color}>
      <Variant color={color} rotation={rotation} phase={phase} breath={breath} />
    </CoverShell>
  );
}

function CoverShell({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <View style={[styles.shell, { backgroundColor: color + "1A" }]}>
      <View style={styles.stage}>{children}</View>
    </View>
  );
}

// ---- Variant type ----
interface VariantProps {
  color: string;
  rotation: SharedValue<number>;
  phase: SharedValue<number>;
  breath: SharedValue<number>;
}
type Variant = (props: VariantProps) => React.ReactNode;

// ---- Helpers ----
function useRotationStyle(rotation: SharedValue<number>) {
  return useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
}

// ---- Variants ----

// Default / generic: rotating asterisk.
function RotatingAsterisk({ color, rotation }: VariantProps) {
  const style = useRotationStyle(rotation);
  return (
    <Animated.View style={style}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 28 28" fill="none">
        <Path d={ASTERISK_PATH} fill={color} />
      </Svg>
    </Animated.View>
  );
}

// transform: pulsing scale + slow rotate.
function PulsingAsterisk({ color, rotation, breath }: VariantProps) {
  const rotStyle = useRotationStyle(rotation);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: breath.value }] }));
  return (
    <Animated.View style={[styles.absolute, scaleStyle]}>
      <Animated.View style={[styles.centered, rotStyle]}>
        <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 28 28" fill="none">
          <Path d={ASTERISK_PATH} fill={color} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

// color: hue-cycling ring of dots (re-rendered via animated rotate of the ring).
function HueRing({ color, rotation }: VariantProps) {
  const style = useRotationStyle(rotation);
  const dotColors = useMemo(() => {
    // Pre-compute a static hue spectrum around the ring. The rotation gives
    // the impression of motion; per-dot hue cycling would need a color driver
    // which Reanimated can't do cheaply on SVG fill here.
    const out: string[] = [];
    for (let i = 0; i < 12; i++) {
      const hue = Math.round((i / 12) * 360);
      out.push(`hsl(${hue}, 70%, 60%)`);
    }
    return out;
  }, []);
  const r = 36;
  return (
    <Animated.View style={[styles.absolute, style]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100">
        {dotColors.map((c, i) => {
          const a = (i / dotColors.length) * Math.PI * 2;
          const cx = 50 + Math.cos(a) * r;
          const cy = 50 + Math.sin(a) * r;
          return <Circle key={i} cx={cx} cy={cy} r={4} fill={c} />;
        })}
        <Path d={ASTERISK_PATH} transform="translate(36 36) scale(0.1)" fill={color} opacity={0.5} />
      </Svg>
    </Animated.View>
  );
}

// shapes: orbiting primitive shapes.
function OrbitShapes({ color, rotation }: VariantProps) {
  const style = useRotationStyle(rotation);
  const r = 34;
  return (
    <Animated.View style={[styles.absolute, style]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100">
        <Circle cx={50 + r} cy={50} r={6} fill={color} />
        <Rect x={50 - r - 6} y={50 - 6} width={12} height={12} fill={color} opacity={0.7} />
        <Polygon points={`50,${50 - r} 56,${50 - r + 10} 44,${50 - r + 10}`} fill={color} opacity={0.55} />
        <Circle cx={50} cy={50} r={4} fill={color} opacity={0.4} />
      </Svg>
    </Animated.View>
  );
}

// curves: bezier path breathing.
function CurvesBreath({ color, breath }: VariantProps) {
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.8 + breath.value * 0.4 }] }));
  return (
    <Animated.View style={[styles.absolute, scaleStyle]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none">
        <Path d="M10,80 Q30,10 50,50 T90,20" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <Path d="M10,60 Q30,90 50,30 T90,70" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      </Svg>
    </Animated.View>
  );
}

// custom-shapes: recursive tree-ish branches.
function BranchTree({ color, breath }: VariantProps) {
  const rotStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${(breath.value - 0.5) * 20}deg` }] }));
  return (
    <Animated.View style={[styles.absolute, styles.centered, rotStyle]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none">
        <Line x1="50" y1="90" x2="50" y2="60" />
        <Line x1="50" y1="60" x2="30" y2="42" />
        <Line x1="50" y1="60" x2="70" y2="42" />
        <Line x1="30" y1="42" x2="20" y2="28" />
        <Line x1="30" y1="42" x2="38" y2="28" />
        <Line x1="70" y1="42" x2="62" y2="28" />
        <Line x1="70" y1="42" x2="80" y2="28" />
      </Svg>
    </Animated.View>
  );
}

// typography: a "T" glyph pulsing.
function TypeGlyph({ color, breath }: VariantProps) {
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.85 + breath.value * 0.3 }] }));
  return (
    <Animated.View style={[styles.absolute, styles.centered, scaleStyle]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100">
        <Polygon points="20,30 80,30 80,40 55,40 55,80 45,80 45,40 20,40" fill={color} />
        <Rect x="25" y="84" width="50" height="4" fill={color} opacity={0.5} />
      </Svg>
    </Animated.View>
  );
}

// events: concentric pulse rings (ripple).
function RippleRings({ color, phase }: VariantProps) {
  // Three rings staggered by phase.
  const r1 = useAnimatedStyle(() => ({ transform: [{ scale: 0.3 + phase.value * 1.4 }], opacity: 1 - phase.value }));
  const r2 = useAnimatedStyle(() => ({ transform: [{ scale: 0.3 + ((phase.value + 0.33) % 1) * 1.4 }], opacity: 1 - ((phase.value + 0.33) % 1) }));
  const r3 = useAnimatedStyle(() => ({ transform: [{ scale: 0.3 + ((phase.value + 0.66) % 1) * 1.4 }], opacity: 1 - ((phase.value + 0.66) % 1) }));
  const stroke = color;
  return (
    <View style={styles.absolute}>
      <Animated.View style={[styles.centered, r1]}>
        <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="20" stroke={stroke} strokeWidth={2} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.absolute, styles.centered, r2]}>
        <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="20" stroke={stroke} strokeWidth={2} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.absolute, styles.centered, r3]}>
        <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="20" stroke={stroke} strokeWidth={2} />
        </Svg>
      </Animated.View>
    </View>
  );
}

// dom: stacked rectangles (UI-ish).
function DomStack({ color, breath }: VariantProps) {
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -breath.value * 4 }] }));
  return (
    <Animated.View style={[styles.absolute, styles.centered, style]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100">
        <Rect x="22" y="30" width="56" height="10" rx={3} fill={color} opacity={0.85} />
        <Rect x="22" y="46" width="56" height="10" rx={3} fill={color} opacity={0.6} />
        <Rect x="22" y="62" width="56" height="10" rx={3} fill={color} opacity={0.4} />
      </Svg>
    </Animated.View>
  );
}

// math: sine wave tracer.
function SineWave({ color, phase }: VariantProps) {
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: phase.value * 30 - 15 }] }));
  return (
    <Animated.View style={[styles.absolute, styles.centered, style]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none">
        <Path d="M0,50 Q12.5,20 25,50 T50,50 T75,50 T100,50" stroke={color} strokeWidth={2.5} />
        <Circle cx="50" cy="50" r={3} fill={color} />
      </Svg>
    </Animated.View>
  );
}

// vectors: two arrows orbiting.
function VectorsOrbit({ color, rotation }: VariantProps) {
  const style = useRotationStyle(rotation);
  return (
    <Animated.View style={[styles.absolute, style]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
        <Line x1="50" y1="50" x2="80" y2="30" />
        <Polygon points="80,30 74,32 76,38" fill={color} stroke="none" />
        <Line x1="50" y1="50" x2="30" y2="75" opacity={0.6} />
        <Polygon points="30,75 33,68 38,73" fill={color} stroke="none" opacity={0.6} />
        <Circle cx="50" cy="50" r={2.5} fill={color} stroke="none" />
      </Svg>
    </Animated.View>
  );
}

// random-noise: jittered dots.
function NoiseDots({ color, phase }: VariantProps) {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = [];
    let seed = 1;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 18; i++) {
      out.push({ x: 15 + rand() * 70, y: 15 + rand() * 70, r: 1.5 + rand() * 3 });
    }
    return out;
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: (phase.value - 0.5) * 8 }, { translateY: (phase.value - 0.5) * 6 }] }));
  return (
    <Animated.View style={[styles.absolute, style]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100">
        {dots.map((d, i) => (
          <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} opacity={0.4 + (i % 4) * 0.15} />
        ))}
      </Svg>
    </Animated.View>
  );
}

// time: clock hands rotating.
function ClockHands({ color, rotation }: VariantProps) {
  const style = useRotationStyle(rotation);
  const fastStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value * 12}deg` }] }));
  return (
    <View style={[styles.absolute, styles.centered]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none">
        <Circle cx="50" cy="50" r="34" stroke={color} strokeWidth={2} opacity={0.5} />
      </Svg>
      <Animated.View style={[styles.absolute, styles.centered, style]}>
        <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
          <Line x1="50" y1="50" x2="50" y2="30" />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.absolute, styles.centered, fastStyle]}>
        <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.7}>
          <Line x1="50" y1="50" x2="68" y2="50" />
        </Svg>
      </Animated.View>
    </View>
  );
}

// image: pixel grid.
function PixelGrid({ color, breath }: VariantProps) {
  const opacityStyle = useAnimatedStyle(() => ({ opacity: 0.5 + breath.value * 0.5 }));
  return (
    <Animated.View style={[styles.absolute, styles.centered, opacityStyle]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100">
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <Rect
              key={`${r}-${c}`}
              x={20 + c * 16}
              y={20 + r * 16}
              width={12}
              height={12}
              fill={color}
              opacity={0.3 + ((r + c) % 3) * 0.25}
            />
          ))
        )}
      </Svg>
    </Animated.View>
  );
}

// io: bidirectional arrows.
function IoArrows({ color, phase }: VariantProps) {
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: (phase.value - 0.5) * 16 }] }));
  return (
    <Animated.View style={[styles.absolute, styles.centered, style]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
        <Line x1="20" y1="40" x2="75" y2="40" />
        <Polygon points="75,40 68,36 68,44" fill={color} stroke="none" />
        <Line x1="80" y1="60" x2="25" y2="60" opacity={0.6} />
        <Polygon points="25,60 32,56 32,64" fill={color} stroke="none" opacity={0.6} />
      </Svg>
    </Animated.View>
  );
}

// data: stacked database disks breathing.
function DataStack({ color, breath }: VariantProps) {
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 0.9 + breath.value * 0.2 }] }));
  return (
    <Animated.View style={[styles.absolute, styles.centered, style]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={2}>
        <SvgEllipse cx={50} cy={30} rx={26} ry={8} />
        <Path d="M24,30 V50 A26,8 0 0 0 76,50 V30" />
        <Path d="M24,50 V70 A26,8 0 0 0 76,70 V50" opacity={0.6} />
      </Svg>
    </Animated.View>
  );
}

// webgl: rotating cube wireframe.
function CubeWire({ color, rotation }: VariantProps) {
  const style = useRotationStyle(rotation);
  const tiltStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  return (
    <Animated.View style={[styles.absolute, styles.centered, style, tiltStyle]}>
      <Svg width={COVER_SIZE} height={COVER_SIZE} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round">
        <Polygon points="30,30 70,30 70,70 30,70" />
        <Polygon points="20,40 60,40 60,80 20,80" opacity={0.6} />
        <Line x1="30" y1="30" x2="20" y2="40" />
        <Line x1="70" y1="30" x2="60" y2="40" />
        <Line x1="70" y1="70" x2="60" y2="80" />
        <Line x1="30" y1="70" x2="20" y2="80" />
      </Svg>
    </Animated.View>
  );
}

const SLUG_VARIANTS: Record<string, Variant> = {
  shapes: OrbitShapes,
  color: HueRing,
  transform: PulsingAsterisk,
  "custom-shapes": BranchTree,
  curves: CurvesBreath,
  typography: TypeGlyph,
  image: PixelGrid,
  math: SineWave,
  vectors: VectorsOrbit,
  "random-noise": NoiseDots,
  dom: DomStack,
  events: RippleRings,
  time: ClockHands,
  io: IoArrows,
  data: DataStack,
  webgl: CubeWire,
};

function pickVariant(slug: string): Variant {
  return SLUG_VARIANTS[slug] ?? RotatingAsterisk;
}

const styles = StyleSheet.create({
  shell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  stage: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  absolute: {
    position: "absolute",
    width: COVER_SIZE,
    height: COVER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});
