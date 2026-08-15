import { useEffect } from "react";
import { Pressable, View, StyleSheet } from "react-native";
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
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable onPress={closeDrawer} style={styles.backdropPressable} />
      </Animated.View>

      <GestureDetector gesture={closeGesture}>
        <Animated.View
          style={[styles.drawer, drawerStyle]}
        >
          <DrawerContent onClose={closeDrawer} />
        </Animated.View>
      </GestureDetector>

      {!isOpen && (
        <GestureDetector gesture={openGesture}>
          <View style={styles.openEdge} />
        </GestureDetector>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#000000",
    zIndex: 40,
  },
  backdropPressable: {
    flex: 1,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 50,
    width: DRAWER_WIDTH,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
  },
  openEdge: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    zIndex: 30,
  },
});
