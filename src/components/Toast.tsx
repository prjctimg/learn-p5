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
}

export default function Toast({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 4000,
  icon = "check-circle",
  iconColor = "#22C55E",
}: ToastProps) {
 const translateY = useRef(new Animated.Value(-120)).current;
 const insets = useSafeAreaInsets();
 const { colorScheme } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

 useEffect(() => {
 if (visible) {
 Animated.spring(translateY, {
 toValue: 0,
 tension: 80,
 friction: 10,
 useNativeDriver: true,
 }).start();

 const timer = setTimeout(() => {
 Animated.timing(translateY, {
 toValue: -120,
 duration: 200,
 useNativeDriver: true,
 }).start(() => onDismiss?.());
 }, duration);

 return () => clearTimeout(timer);
 } else {
 translateY.setValue(-120);
 }
 }, [visible]);

 const handleAction = () => {
 Animated.timing(translateY, {
 toValue: -120,
 duration: 200,
 useNativeDriver: true,
 }).start(() => {
 onDismiss?.();
 onAction?.();
 });
 };

 if (!visible) return null;

 return (
 <Animated.View
 style={[
 styles.container,
 {
 backgroundColor: colors.surfaceContainerHighest,
 transform: [{ translateY }],
 paddingTop: insets.top + 8,
 },
 ]}
 >
 <View style={styles.content}>
    <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
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
 </Animated.View>
);
}

const styles = StyleSheet.create({
 container: {
 position: "absolute",
 left: 0,
 right: 0,
 top: 0,
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-between",
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
