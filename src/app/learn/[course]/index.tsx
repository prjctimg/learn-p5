import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../../components/Header";
import ChallengeCard from "../../../components/ChallengeCard";
import { loadCourse } from "../../../utils/courseLoader";
import { Course } from "../../../data/types";

export default function CourseDetail() {
  const { course } = useLocalSearchParams<{ course: string }>();
  const router = useRouter();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!course) return;
    loadCourse(course)
      .then(setCourseData)
      .finally(() => setLoading(false));
  }, [course]);

  if (loading) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark">
        <Header title="Course" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ED225D" />
        </View>
      </View>
    );
  }

  if (!courseData) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark">
        <Header title="Course" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-headline text-xl font-bold text-on-surface dark:text-on-surface-dark">
            Course not found
          </Text>
          <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-2 text-center">
            The course &ldquo;{course}&rdquo; doesn&apos;t exist yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title={courseData.title} />
      <FlatList
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark">
              {courseData.title}
            </Text>
            <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
              {courseData.description}
            </Text>
            <Text className="font-headline text-lg font-bold text-on-surface dark:text-on-surface-dark mt-8 mb-4">
              Lessons
            </Text>
          </>
        }
        data={courseData.lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-4">
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
