import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../../components/Header";
import ChallengeCard from "../../../components/ChallengeCard";
import { loadCourse } from "../../../utils/courseLoader";
import { Course } from "../../../data/types";
import { useThemeContext } from "../../../components/ThemeProvider";
import { Colors } from "../../../constants/Colors";

export default function CourseDetail() {
  const { course } = useLocalSearchParams<{ course: string }>();
  const router = useRouter();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const loadData = useCallback(async () => {
    if (!course) return;
    const data = await loadCourse(course);
    setCourseData(data);
    try {
      const val = await AsyncStorage.getItem("completedLessons");
      if (val) setCompletedLessons(JSON.parse(val));
    } catch {}
    setLoading(false);
  }, [course]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Header title="Course" />
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#ED225D" />
        </View>
      </View>
    );
  }

  if (!courseData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Header title="Course" />
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundTitle, { color: colors.onSurface }]}>
            Course not found
          </Text>
          <Text style={[styles.notFoundSubtitle, { color: colors.textSecondary }]}>
            The course &ldquo;{course}&rdquo; doesn&apos;t exist yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Header title={courseData.title} />
      <FlatList
        style={styles.flatList}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <Text style={[styles.courseTitle, { color: colors.onSurface }]}>
              {courseData.title}
            </Text>
            <Text style={[styles.courseDescription, { color: colors.textSecondary }]}>
              {courseData.description}
            </Text>
            <Text style={[styles.lessonsHeader, { color: colors.onSurface }]}>
              Lessons
            </Text>
          </>
        }
        data={courseData.lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          let isLocked = false;
          for (let j = 0; j < index; j++) {
            const prevLesson = courseData.lessons[j];
            if (!completedLessons.includes(`${course}/${prevLesson.id}`)) {
              isLocked = true;
              break;
            }
          }
          return (
            <View style={styles.cardWrapper}>
              <ChallengeCard
                title={item.title}
                moduleName={item.module}
                description={item.description}
                locked={isLocked}
                onContinue={
                  isLocked
                    ? undefined
                    : () => router.push(`/learn/${course}/${item.id}`)
                }
              />
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  notFoundTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 20,
    fontWeight: "700",
  },
  notFoundSubtitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  courseTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 24,
    fontWeight: "700",
  },
  courseDescription: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
    marginTop: 8,
  },
  lessonsHeader: {
    fontFamily: "JetBrainsMono",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 32,
    marginBottom: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
});
