import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  useEffect(() => {
    if (!course) return;
    loadCourse(course)
      .then(setCourseData)
      .finally(() => setLoading(false));
  }, [course]);

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
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ChallengeCard
              title={item.title}
              moduleName={item.module}
              description={item.description}
              onContinue={() =>
                router.push(`/learn/${course}/${item.id}`)
              }
            />
          </View>
        )}
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
