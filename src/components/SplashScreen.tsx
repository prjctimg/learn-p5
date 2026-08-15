import { useEffect, useMemo } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { SvgXml } from "react-native-svg";

const P5_ASTERISK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="#ED225D"><path d="M16.909,10.259l8.533-2.576l1.676,5.156l-8.498,2.899l5.275,7.48l-4.447,3.225l-5.553-7.348L8.487,26.25l-4.318-3.289l5.275-7.223L0.88,12.647l1.678-5.16l8.598,2.771V1.364h5.754V10.259z"/></svg>`;

const SNOWFLAKE_COUNT = 20;

interface SnowflakeConfig {
  x: number;
  size: number;
  duration: number;
  wobbleAmount: number;
  wobbleDuration: number;
  initialDelay: number;
  opacity: number;
}

function generateSnowflakes(): SnowflakeConfig[] {
  const { width: screenWidth } = Dimensions.get("window");
  const configs: SnowflakeConfig[] = [];
  for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
    configs.push({
      x: ((i * 137.5 + 53) % screenWidth),
      size: 8 + (i % 5) * 2,
      duration: 8000 + (i % 8) * 1000,
      wobbleAmount: 10 + (i % 4) * 8,
      wobbleDuration: 2000 + (i % 5) * 800,
      initialDelay: i * 300,
      opacity: 0.3 + (i % 7) * 0.08,
    });
  }
  return configs;
}

function Snowflake({ config, screenHeight }: { config: SnowflakeConfig; screenHeight: number }) {
  const translateY = useSharedValue(-config.size);
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      config.initialDelay,
      withRepeat(
        withTiming(screenHeight + config.size, { duration: config.duration }),
        -1,
        false,
      ),
    );

    translateX.value = withRepeat(
      withSequence(
        withTiming(config.wobbleAmount, { duration: config.wobbleDuration / 2 }),
        withTiming(-config.wobbleAmount, { duration: config.wobbleDuration / 2 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: config.x,
          width: config.size,
          height: config.size,
          opacity: config.opacity,
        },
        animatedStyle,
      ]}
    >
      <SvgXml xml={P5_ASTERISK_SVG} width={config.size} height={config.size} />
    </Animated.View>
  );
}

export default function SplashScreen() {
  const { width, height } = Dimensions.get("window");
  const snowflakes = useMemo(() => generateSnowflakes(), []);

  return (
    <View style={[styles.container, { width, height }]}>
      {snowflakes.map((config, i) => (
        <Snowflake key={i} config={config} screenHeight={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
  },
});
