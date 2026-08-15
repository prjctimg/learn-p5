import { useEffect, useRef, useState, useCallback } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import { STREAK_TIERS } from "../hooks/useStreak";

interface StreakToastProps {
 visible: boolean;
 streakCount: number;
 tierProgress: number;
 nextTier: number;
 onDismiss: () => void;
}

function getMilestoneText(count: number): string {
 const idx = STREAK_TIERS.indexOf(count);
 if (idx >= 0) {
 const tier = STREAK_TIERS[idx];
 if (tier === 7) return "1 week";
 if (tier === 14) return "2 weeks";
 if (tier === 30) return "1 month";
 if (tier === 365) return "1 year";
 return `${tier} days`;
 }
 return `${count}-day`;
}

function getMilestoneTitle(count: number): string {
 const idx = STREAK_TIERS.indexOf(count);
 if (idx >= 0) {
 return `${getMilestoneText(count)} streak!`;
 }
 return `${count}-day streak!`;
}

export default function StreakToast({
 visible,
 streakCount,
 tierProgress,
 nextTier,
 onDismiss,
}: StreakToastProps) {
 const translateY = useRef(new Animated.Value(-200)).current;
 const opacity = useRef(new Animated.Value(0)).current;
 const progressAnim = useRef(new Animated.Value(0)).current;
 const countAnim = useRef(new Animated.Value(0)).current;
 const [displayCount, setDisplayCount] = useState(streakCount - 1);
 const insets = useSafeAreaInsets();
 const { colorScheme } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

 const animateIn = useCallback(() => {
 translateY.setValue(-200);
 opacity.setValue(0);
 progressAnim.setValue(0);
 countAnim.setValue(streakCount - 1);

 Animated.parallel([
 Animated.spring(translateY, {
 toValue: 0,
 tension: 120,
 friction: 7,
 useNativeDriver: true,
 }),
 Animated.timing(opacity, {
 toValue: 1,
 duration: 200,
 useNativeDriver: true,
 }),
 ]).start();

 const listener = countAnim.addListener(({ value }) => {
 setDisplayCount(Math.round(value));
 });

 Animated.sequence([
 Animated.timing(countAnim, {
 toValue: streakCount,
 duration: 1000,
 useNativeDriver: false,
 }),
 Animated.spring(progressAnim, {
 toValue: tierProgress,
 tension: 40,
 friction: 8,
 useNativeDriver: false,
 }),
 ]).start();

 return listener;
 }, [streakCount, tierProgress, translateY, opacity, progressAnim, countAnim]);

 const animateOut = useCallback(() => {
 Animated.parallel([
 Animated.spring(translateY, {
 toValue: -200,
 tension: 180,
 friction: 10,
 useNativeDriver: true,
 }),
 Animated.timing(opacity, {
 toValue: 0,
 duration: 150,
 useNativeDriver: true,
 }),
 ]).start(() => onDismiss());
 }, [translateY, opacity, onDismiss]);

 useEffect(() => {
 if (!visible) return;

 const listener = animateIn();

 const timer = setTimeout(() => {
 if (countAnim) countAnim.removeListener(listener);
 animateOut();
 }, 5000);

 return () => {
 clearTimeout(timer);
 countAnim.removeListener(listener);
 };
 }, [visible]);

 const progressWidth = progressAnim.interpolate({
 inputRange: [0, 1],
 outputRange: ["0%", "100%"],
 });

 if (!visible) return null;

 const tierIdx = STREAK_TIERS.indexOf(nextTier);
 const prevTier = tierIdx > 0 ? STREAK_TIERS[tierIdx - 1] : 0;
 const isMilestone = STREAK_TIERS.includes(streakCount);

 return (
 <Animated.View
 style={[
 styles.container,
 {
 backgroundColor: colors.surfaceContainerHighest,
 transform: [{ translateY }],
 opacity,
 paddingTop: insets.top + 8,
 },
 ]}
 >
 <View style={styles.content}>
 <MaterialCommunityIcons
 name={isMilestone ? "trophy" : "fire"}
 size={22}
 color={isMilestone ? "#FFD700" : "#FF6B35"}
 />
 <View style={styles.textWrap}>
 <Text style={[styles.title, { color: colors.onSurface }]}>
 {getMilestoneTitle(streakCount)}
 </Text>
 <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
 {prevTier > 0 ? `${prevTier}+ days` : "Getting started"} ·{" "}
 <Text style={[styles.count, { color: colors.primary }]}>
 {displayCount}
 </Text>
 {isMilestone && (
 <Text style={{ color: colors.primary, fontWeight: "700" }}>
 {" "}✓
 </Text>
)}
 </Text>
 </View>
 </View>
 <View style={[styles.progressOuter, { backgroundColor: colors.surfaceDim }]}>
 <Animated.View
 style={[
 styles.progressInner,
 { backgroundColor: colors.primary, width: progressWidth },
 ]}
 />
 </View>
 </Animated.View>
);
}

const styles = StyleSheet.create({
 container: {
 position: "absolute",
 left: 0,
 right: 0,
 top: 0,
 flexDirection: "column",
 paddingHorizontal: 16,
 paddingBottom: 12,
 shadowColor: "#000",
 shadowOffset: { width: 0, height: 8 },
 shadowOpacity: 0.15,
 shadowRadius: 16,
 elevation: 8,
 zIndex: 1000,
 },
 content: {
 flexDirection: "row",
 alignItems: "center",
 gap: 10,
 },
 textWrap: {
 flex: 1,
 },
 title: {
 fontSize: 15,
 fontWeight: "700",
 },
 subtitle: {
 fontSize: 12,
 marginTop: 1,
 },
 count: {
 fontSize: 13,
 fontWeight: "700",
 },
 progressOuter: {
 height: 8,
 borderRadius: 9999,
 marginTop: 8,
 overflow: "hidden",
 },
 progressInner: {
 height: "100%",
 borderRadius: 9999,
 },
});
