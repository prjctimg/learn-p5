import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "../components/ThemeProvider";
import { Colors } from "../constants/Colors";
import Header from "../components/Header";
import Toast from "../components/Toast";
import StreakToast from "../components/StreakToast";
import { loadAllCourses } from "../utils/courseLoader";
import { Exercise, Course } from "../data/types";
import { isExerciseLocked as checkExerciseLocked } from "../utils/isExerciseLocked";
import { getStreakFromStorage, useStreak } from "../hooks/useStreak";

const LAST_GREETING_KEY = "last_greeting_period";

function getPeriodKey(): string {
 const hour = new Date().getHours();
 if (hour < 12) return "morning";
 if (hour < 18) return "afternoon";
 return "evening";
}

function getGreeting(): string {
 const hour = new Date().getHours();
 if (hour < 12) return "Good morning";
 if (hour < 18) return "Good afternoon";
 return "Good evening";
}

export default function Dashboard() {
 const router = useRouter();
 const { colorScheme, ctaColor, derivedColors } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
 const [completedLessons, setCompletedLessons] = useState<string[]>([]);
 const [courses, setCourses] = useState<Course[]>([]);
 const [streakCount, setStreakCount] = useState(0);
 const [streakLongest, setStreakLongest] = useState(0);
 const streak = useStreak();
 const [streakToastVisible, setStreakToastVisible] = useState(false);
 const [greetingToastVisible, setGreetingToastVisible] = useState(false);
 const [greetingMessage, setGreetingMessage] = useState("");
 const levelAnim = useRef(new Animated.Value(0)).current;
 const completedAnim = useRef(new Animated.Value(0)).current;
 const streakAnim = useRef(new Animated.Value(0)).current;
 const [animatedLevel, setAnimatedLevel] = useState(1);
 const [animatedCompleted, setAnimatedCompleted] = useState(0);
 const [animatedStreak, setAnimatedStreak] = useState(0);

 useFocusEffect(
 useCallback(() => {
 AsyncStorage.getItem("completedLessons").then((val) => {
 if (val) {
 try {
 setCompletedLessons(JSON.parse(val));
 } catch {
 setCompletedLessons([]);
 }
 }
 });
 loadAllCourses().then(setCourses);
 getStreakFromStorage().then(({ count, longest }) => {
 setStreakCount(count);
 setStreakLongest(longest);
 });
 }, [])
);

 useEffect(() => {
 streak.consumePendingToast().then((data) => {
 if (data) {
 setStreakToastVisible(true);
 }
 });
 }, []);

 useEffect(() => {
 const timer = setTimeout(async () => {
 const period = getPeriodKey();
 const lastPeriod = await AsyncStorage.getItem(LAST_GREETING_KEY);
 if (lastPeriod === period) return;
 const onboardingRaw = await AsyncStorage.getItem("onboardingData");
 let name = "";
 if (onboardingRaw) {
 try {
 const data = JSON.parse(onboardingRaw);
 name = data.displayName || "";
 } catch {}
 }
 setGreetingMessage(`${getGreeting()}${name ? `, ${name}` : "!"}`);
 setGreetingToastVisible(true);
 await AsyncStorage.setItem(LAST_GREETING_KEY, period);
 }, 1000);
 return () => clearTimeout(timer);
 }, []);

 const nextExercise: (Exercise & { courseSlug: string; courseTitle: string }) | null = useMemo(() => {
 if (courses.length === 0) return null;
 const flat = courses.flatMap((c) =>
 c.exercises.map((l) => ({ ...l, courseSlug: c.slug, courseTitle: c.title }))
 );
 return flat.find((l) => !completedLessons.includes(`${l.courseSlug}/${l.id}`)) ?? null;
 }, [courses, completedLessons]);

 const upcomingExercises = useMemo(() => {
 if (courses.length === 0 || !nextExercise) return [];
 const flat = courses.flatMap((c) =>
 c.exercises.map((l) => ({ ...l, courseSlug: c.slug, courseTitle: c.title }))
 );
 const startIndex = flat.findIndex(
 (l) => l.courseSlug === nextExercise.courseSlug && l.id === nextExercise.id
);
 if (startIndex === -1) return [];
 return flat.slice(startIndex + 1, startIndex + 6);
 }, [courses, nextExercise]);

  function isExerciseLocked(lessonId: string, courseSlug: string): boolean {
    const course = courses.find((c) => c.slug === courseSlug);
    if (!course) return true;
    return checkExerciseLocked(completedLessons, courseSlug, lessonId, course.exercises);
  }

 const progressAnim = useRef(new Animated.Value(0)).current;

 const totalLessons = useMemo(() => {
 return courses.reduce((sum, c) => sum + c.exercises.length, 0);
 }, [courses]);

 const progress = totalLessons > 0 ? completedLessons.length / totalLessons : 0;

 useEffect(() => {
 Animated.timing(progressAnim, {
 toValue: progress,
 duration: 800,
 useNativeDriver: false,
 }).start();
 }, [progress, progressAnim]);

 const progressWidth = progressAnim.interpolate({
 inputRange: [0, 1],
 outputRange: ["0%", "100%"],
 });

 const level = Math.min(10, Math.max(1, Math.floor(progress * 10) + 1));
 const completedCount = completedLessons.length;

 useEffect(() => {
 levelAnim.setValue(0);
 completedAnim.setValue(0);
 streakAnim.setValue(0);

 const levelListener = levelAnim.addListener(({ value }) => {
 setAnimatedLevel(Math.round(value));
 });
 const completedListener = completedAnim.addListener(({ value }) => {
 setAnimatedCompleted(Math.round(value));
 });
 const streakListener = streakAnim.addListener(({ value }) => {
 setAnimatedStreak(Math.round(value));
 });

 Animated.parallel([
 Animated.timing(levelAnim, {
 toValue: level,
 duration: 800,
 useNativeDriver: false,
 }),
 Animated.timing(completedAnim, {
 toValue: completedCount,
 duration: 800,
 useNativeDriver: false,
 }),
 Animated.timing(streakAnim, {
 toValue: streakCount,
 duration: 800,
 useNativeDriver: false,
 }),
 ]).start();

 return () => {
 levelAnim.removeListener(levelListener);
 completedAnim.removeListener(completedListener);
 streakAnim.removeListener(streakListener);
 };
 }, [level, completedCount, streakCount]);

 const styles = useMemo(
 () =>
 StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: colors.surface,
 },
 inner: {
 flex: 1,
 paddingHorizontal: 24,
 paddingTop: 32,
 },
 subtitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 color: colors.textSecondary,
 marginTop: 4,
 },
 progressBarOuter: {
 height: 8,
 backgroundColor: colors.surfaceDim,
 borderRadius: 9999,
 marginTop: 16,
 overflow: "hidden",
 },
 progressBarInner: {
 height: "100%",
 backgroundColor: derivedColors.primary,
 borderRadius: 9999,
 },
 statsRow: {
 flexDirection: "row",
 gap: 12,
 marginTop: 24,
 },
  statCard: {
  flex: 1,
   backgroundColor: derivedColors.primary + "26",
  borderRadius: 16,
  paddingHorizontal: 16,
  paddingVertical: 16,
  alignItems: "center",
  },
 statValue: {
 fontFamily: "JetBrainsMono",
 fontSize: 24,
 fontWeight: "700",
 color: derivedColors.primary,
 },
 statLabel: {
 fontFamily: "JetBrainsMono",
 fontSize: 11,
 color: colors.textSecondary,
 marginTop: 4,
 },
 continueSection: {
 marginTop: 40,
 },
 sectionTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 24,
 fontWeight: "700",
 color: colors.onSurface,
 marginBottom: 16,
 },
  nextCard: {
  backgroundColor: colors.surfaceDim,
  borderRadius: 16,
  paddingHorizontal: 20,
  paddingVertical: 20,
  marginBottom: 12,
  },
 nextCardPressed: {
 opacity: 0.8,
 },
 nextCardTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 20,
 fontWeight: "700",
 color: colors.onSurface,
 },
 nextCardModule: {
 fontFamily: "JetBrainsMono",
 fontSize: 11,
 color: derivedColors.primary,
 textTransform: "uppercase",
 letterSpacing: 1,
 marginTop: 4,
 },
 nextCardDescription: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 color: colors.textSecondary,
 marginTop: 8,
 },
  nextCardButton: {
  borderRadius: 12,
  paddingHorizontal: 20,
  paddingVertical: 10,
  alignSelf: "flex-start",
  marginTop: 16,
  },
 nextCardButtonPressed: {
 transform: [{ translateY: 2 }],
 },
 nextCardButtonText: {
 fontFamily: "JetBrainsMono",
 fontWeight: "900",
 fontSize: 13,
 textTransform: "uppercase",
 letterSpacing: 0.5,
 color: colors.onPrimary,
 },
 listTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 20,
 fontWeight: "700",
 color: colors.onSurface,
 marginBottom: 12,
 },
  listItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.surfaceDim,
  borderRadius: 12,
  marginBottom: 8,
  },
 listItemPressed: {
 opacity: 0.8,
 },
 listItemNumber: {
 fontFamily: "JetBrainsMono",
 fontSize: 13,
 fontWeight: "700",
 color: colors.textSecondary,
 width: 28,
 },
 listItemTitle: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 fontWeight: "700",
 color: colors.onSurface,
 flex: 1,
 },
 allCompleteContainer: {
 alignItems: "center",
 paddingVertical: 32,
 },
 allCompleteText: {
 fontFamily: "JetBrainsMono",
 fontSize: 16,
 color: colors.textSecondary,
 textAlign: "center",
 },
 }),
 [colorScheme]
);

 return (
 <View style={styles.container}>
 <Header title="Dashboard" showBack={false} />
 <ScrollView
 style={styles.inner}
 contentContainerStyle={{ paddingBottom: 32 }}
 >
 <Text style={styles.subtitle}>
 {Math.round(progress * 100)}% complete
 </Text>

 <View style={styles.progressBarOuter}>
 <Animated.View style={[styles.progressBarInner, { width: progressWidth }]} />
 </View>

 <View style={styles.statsRow}>
 <View style={styles.statCard}>
 <Text style={styles.statValue}>{animatedLevel}</Text>
 <Text style={styles.statLabel}>
 Level
 </Text>
 </View>
 <View style={styles.statCard}>
 <Text style={styles.statValue}>
 {animatedCompleted}
 </Text>
 <Text style={styles.statLabel}>
 Completed
 </Text>
 </View>
 <View style={styles.statCard}>
 <Text style={styles.statValue}>{animatedStreak}</Text>
 <Text style={styles.statLabel}>
 Streak
 </Text>
 </View>
 </View>

 <View style={styles.continueSection}>
 <Text style={styles.sectionTitle}>
 Pick up where you left off
 </Text>

 {nextExercise ? (
 <Pressable
 onPress={() =>
 router.push(`/learn/${nextExercise.courseSlug}/${nextExercise.id}`)
 }
 style={({ pressed }) => [
 styles.nextCard,
 pressed && styles.nextCardPressed,
 ]}
 accessibilityRole="button"
 accessibilityLabel={`Continue with ${nextExercise.title}`}
 >
 <Text style={styles.nextCardTitle}>
 {nextExercise.title}
 </Text>
 <Text style={styles.nextCardModule}>
  {nextExercise.courseTitle}
 </Text>
 <Text style={styles.nextCardDescription} numberOfLines={2}>
 {nextExercise.description}
 </Text>
 <Pressable
 onPress={() =>
 router.push(`/learn/${nextExercise.courseSlug}/${nextExercise.id}`)
 }
 style={({ pressed }) => [
 styles.nextCardButton,
 { backgroundColor: ctaColor },
 pressed && styles.nextCardButtonPressed,
 ]}
 accessibilityRole="button"
 accessibilityLabel="Continue"
 >
 <Text style={styles.nextCardButtonText}>
 Continue
 </Text>
 </Pressable>
 </Pressable>
) : (
 <View style={styles.allCompleteContainer}>
 <Text style={styles.allCompleteText}>
 All exercises complete! 🎉
 </Text>
 </View>
)}

 {upcomingExercises.length > 0 && (
 <>
 <Text style={[styles.listTitle, { marginTop: 24 }]}>
 Up Next
 </Text>
 {upcomingExercises.map((ex) => {
 const locked = isExerciseLocked(ex.id, ex.courseSlug);
 return (
 <Pressable
 key={`${ex.courseSlug}/${ex.id}`}
 disabled={locked}
 onPress={() =>
 router.push(`/learn/${ex.courseSlug}/${ex.id}`)
 }
 style={({ pressed }) => [
 styles.listItem,
 pressed && !locked && styles.listItemPressed,
 ]}
 accessibilityRole="button"
 accessibilityLabel={locked ? `${ex.title} (locked)` : ex.title}
 >
 {locked ? (
 <MaterialCommunityIcons
 name="lock"
 size={18}
 color={colors.textSecondary}
 style={styles.listItemNumber}
 />
) : (
 <Text style={styles.listItemNumber}>
 {ex.id.replace("exercise-", "#")}
 </Text>
)}
 <Text
 style={[
 styles.listItemTitle,
 locked && { color: colors.textSecondary },
 ]}
 numberOfLines={1}
 >
 {ex.title}
 </Text>
 </Pressable>
);
 })}
 </>
)}
 </View>
 </ScrollView>

 <Toast
 visible={greetingToastVisible}
 message={greetingMessage}
 duration={3000}
 icon="weather-sunny"
 onDismiss={() => setGreetingToastVisible(false)}
 />
 <StreakToast
 visible={streakToastVisible}
 streakCount={streak.count}
 tierProgress={streak.tierProgress}
 nextTier={streak.nextTier}
 onDismiss={() => setStreakToastVisible(false)}
 />
 </View>
);
}
