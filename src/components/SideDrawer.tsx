import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDrawerContext } from "../contexts/DrawerContext";
import DrawerContent from "./DrawerContent";

const DRAWER_WIDTH = 288;

export default function SideDrawer() {
  const { isOpen, openDrawer, closeDrawer } = useDrawerContext();
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.set(withTiming(isOpen ? 0 : -DRAWER_WIDTH, {
      duration: 300,
    }));
    backdropOpacity.set(withTiming(isOpen ? 0.5 : 0, { duration: 300 }));
  }, [isOpen]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const closeGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.max(-DRAWER_WIDTH, Math.min(0, e.translationX));
      backdropOpacity.value =
        0.5 * (1 + translateX.value / DRAWER_WIDTH);
    })
    .onEnd((e) => {
      if (e.translationX < -DRAWER_WIDTH * 0.3 || e.velocityX < -500) {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(closeDrawer)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(0.5, { duration: 200 });
      }
    });

  const openGesture = Gesture.Pan()
    .activateAfterLongPress(150)
    .onUpdate((e) => {
      if (e.translationX > 0) {
        translateX.value = Math.min(0, -DRAWER_WIDTH + e.translationX);
        backdropOpacity.value =
          0.5 * (1 + translateX.value / DRAWER_WIDTH);
      }
    })
    .onEnd((e) => {
      if (e.translationX > DRAWER_WIDTH * 0.3 || e.velocityX > 500) {
        translateX.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(0.5, { duration: 200 });
        runOnJS(openDrawer)();
      } else {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
      }
    });

  return (
    <>
      <Animated.View
        className="absolute inset-0 bg-black z-40"
        style={backdropStyle}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable onPress={closeDrawer} className="flex-1" />
      </Animated.View>

      <GestureDetector gesture={closeGesture}>
        <Animated.View
          className="absolute left-0 top-0 bottom-0 z-50 w-72 shadow-2xl"
          style={drawerStyle}
        >
          <DrawerContent onClose={closeDrawer} />
        </Animated.View>
      </GestureDetector>

      {!isOpen && (
        <GestureDetector gesture={openGesture}>
          <View className="absolute left-0 top-0 bottom-0 w-6 z-30" />
        </GestureDetector>
      )}
    </>
  );
}
