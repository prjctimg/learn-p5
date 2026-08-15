import { useMemo, useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "../components/ThemeProvider";
import { Colors } from "../constants/Colors";
import Header from "../components/Header";
import { loadAllCourses } from "../utils/courseLoader";
import { Lesson, Course } from "../data/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
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
  }, []);

  const nextExercise: (Lesson & { courseSlug: string; courseTitle: string }) | null = useMemo(() => {
    if (courses.length === 0) return null;
    const flat = courses.flatMap((c) =>
      c.lessons.map((l) => ({ ...l, courseSlug: c.slug, courseTitle: c.title }))
    );
    return flat.find((l) => !completedLessons.includes(`${l.courseSlug}/${l.id}`)) ?? null;
  }, [courses, completedLessons]);

  const upcomingExercises = useMemo(() => {
    if (courses.length === 0 || !nextExercise) return [];
    const flat = courses.flatMap((c) =>
      c.lessons.map((l) => ({ ...l, courseSlug: c.slug, courseTitle: c.title }))
    );
    const startIndex = flat.findIndex(
      (l) => l.courseSlug === nextExercise.courseSlug && l.id === nextExercise.id
    );
    if (startIndex === -1) return [];
    return flat.slice(startIndex + 1, startIndex + 6);
  }, [courses, nextExercise]);

  const greeting = useMemo(() => getGreeting(), []);

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
        greeting: {
          fontFamily: "JetBrainsMono",
          fontSize: 32,
          fontWeight: "700",
          color: colors.onSurface,
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
          width: "84%",
          backgroundColor: colors.primary,
          borderRadius: 9999,
        },
        statsRow: {
          flexDirection: "row",
          gap: 12,
          marginTop: 24,
        },
        statCard: {
          flex: 1,
          backgroundColor: colors.primary + "1A",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 16,
          alignItems: "center",
        },
        statValue: {
          fontFamily: "JetBrainsMono",
          fontSize: 24,
          fontWeight: "700",
          color: colors.primary,
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
          borderRadius: 12,
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
          color: colors.primary,
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
          backgroundColor: colors.primary,
          borderRadius: 8,
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
          fontSize: 16,
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
          borderRadius: 8,
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
        listItemMeta: {
          fontFamily: "JetBrainsMono",
          fontSize: 11,
          color: colors.textSecondary,
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
      <Header title="Dashboard" />
      <ScrollView
        style={styles.inner}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text style={styles.greeting}>
          {greeting}, Coder!
        </Text>
        <Text style={styles.subtitle}>
          Level 3 · 84% to next level
        </Text>

        <View style={styles.progressBarOuter}>
          <View style={styles.progressBarInner} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>
              Level
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              2.4k
            </Text>
            <Text style={styles.statLabel}>
              XP
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>
              Streak
            </Text>
          </View>
        </View>

        <View style={styles.continueSection}>
          <Text style={styles.sectionTitle}>
            Continue Learning
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
                {nextExercise.courseTitle} · {nextExercise.module}
              </Text>
              <Text style={styles.nextCardDescription} numberOfLines={2}>
                {nextExercise.description}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.nextCardButton,
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
              {upcomingExercises.map((ex) => (
                <Pressable
                  key={`${ex.courseSlug}/${ex.id}`}
                  onPress={() =>
                    router.push(`/learn/${ex.courseSlug}/${ex.id}`)
                  }
                  style={({ pressed }) => [
                    styles.listItem,
                    pressed && styles.listItemPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={ex.title}
                >
                  <Text style={styles.listItemNumber}>
                    {ex.id.replace("exercise-", "#")}
                  </Text>
                  <Text style={styles.listItemTitle} numberOfLines={1}>
                    {ex.title}
                  </Text>
                  <Text style={styles.listItemMeta}>
                    {ex.module}
                  </Text>
                </Pressable>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
