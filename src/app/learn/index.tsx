import { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter, useIsFocused } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Header";
import ExerciseCard from "../../components/ExerciseCard";
import { loadAllCourses } from "../../utils/courseLoader";
import { Course } from "../../data/types";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import { STORAGE_KEYS } from "../../constants/StorageKeys";
import { useShakeDetection } from "../../hooks/useShakeDetection";
import ReportErrorModal from "../../components/ReportErrorModal";


export default function Learn() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [shakeModalVisible, setShakeModalVisible] = useState(false);
  const isFocused = useIsFocused();

  useShakeDetection(
    useCallback(() => setShakeModalVisible(true), []),
    { enabled: isFocused }
  );

  useEffect(() => {
    Promise.all([
      loadAllCourses(),
      AsyncStorage.getItem(STORAGE_KEYS.completedLessons),
      AsyncStorage.getItem(STORAGE_KEYS.completedCourses),
    ])
      .then(([loaded, exercisesRaw, coursesRaw]) => {
        setCourses(loaded);
        if (exercisesRaw) {
          try {
            setCompletedExercises(JSON.parse(exercisesRaw));
          } catch {
            setCompletedExercises([]);
          }
        }
        if (coursesRaw) {
          try {
            setCompletedCourses(JSON.parse(coursesRaw));
          } catch {
            setCompletedCourses([]);
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const isCourseCompleted = (course: Course): boolean => {
    if (completedCourses.includes(course.slug)) return true;
    if (course.exercises.length === 0) return false;
    return course.exercises.every((l) =>
      completedExercises.includes(`${course.slug}/${l.id}`)
    );
  };

  const currentSlug = useMemo(() => {
    for (const c of courses) {
      if (!isCourseCompleted(c)) return c.slug;
    }
    return null;
  }, [courses, completedExercises, completedCourses]);

  // The single "current" (first incomplete) course is the blocker for every
  // locked card under the sequential completion model. Surface its title so a
  // locked card can name the exact prior module to finish instead of a generic
  // "complete the current module" message.
  const currentCourse = useMemo(
    () => (currentSlug ? courses.find((c) => c.slug === currentSlug) ?? null : null),
    [currentSlug, courses]
  );

  const orderedCourses = useMemo(() => {
    const active = courses.filter((c) => !isCourseCompleted(c));
    const completed = courses.filter((c) => isCourseCompleted(c));
    return [...active, ...completed];
  }, [courses, completedExercises, completedCourses]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Header title="Learn" />
      <FlatList
        style={styles.flatList}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <Text style={[styles.sectionTitle, { color: derivedColors.primary }]}>
              Courses
            </Text>
          </>
        }
        data={loading ? [] : orderedCourses}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => {
          const completed = isCourseCompleted(item);
          const isCurrent = currentSlug === item.slug;
          const locked = !completed && !isCurrent;
          return (
            <View style={styles.cardWrapper}>
              <ExerciseCard
                title={item.title}
                moduleName={item.moduleName}
                description={`${item.exercises.length} exercise${item.exercises.length > 1 ? "s" : ""} · ${item.description}`}
                slug={item.slug}
                locked={locked}
                completed={completed}
                isCurrent={isCurrent}
                lockHint={locked && currentCourse ? currentCourse.title : undefined}
                onContinue={() => router.push(`/learn/${item.slug}`)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Loading...
              </Text>
            </View>
          ) : error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + "1A" }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                Couldn&apos;t load courses: {error}
              </Text>
            </View>
          ) : null
        }
      />
      <ReportErrorModal
        visible={shakeModalVisible}
        onDismiss={() => setShakeModalVisible(false)}
        route="/learn"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 24,
    fontWeight: "700",
    fontStyle: "italic",
    marginBottom: 20,
  },
  cardWrapper: {
    marginBottom: 24,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
  },
  errorContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  errorText: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    textAlign: "center",
  },
});