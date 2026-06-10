import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../../components/Header";
import ChallengeCard from "../../../components/ChallengeCard";

const courses: Record<
  string,
  { title: string; description: string; lessons: { id: string; title: string; module: string; description: string }[] }
> = {
  shapes: {
    title: "Shapes",
    description: "Master the coordinate system and draw your first primitive shapes using code.",
    lessons: [
      {
        id: "exercise-1",
        title: "The First Circle",
        module: "Shapes",
        description: "Learn how to draw circles and use math to create motion with trigonometric functions.",
      },
    ],
  },
};

export default function CourseDetail() {
  const { course } = useLocalSearchParams<{ course: string }>();
  const router = useRouter();
  const courseData = courses[course ?? ""];

  if (!courseData) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark">
        <Header title="Course" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-headline text-xl font-bold text-on-surface dark:text-on-surface-dark">
            Course not found
          </Text>
          <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-2 text-center">
            The course "{course}" doesn't exist yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title={courseData.title} />
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark">
          {courseData.title}
        </Text>
        <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
          {courseData.description}
        </Text>

        <Text className="font-headline text-lg font-bold text-on-surface dark:text-on-surface-dark mt-8 mb-4">
          Lessons
        </Text>

        {courseData.lessons.map((lesson) => (
          <View key={lesson.id} className="mb-4">
            <ChallengeCard
              title={lesson.title}
              moduleName={lesson.module}
              description={lesson.description}
              onContinue={() =>
                router.push(`/learn/${course}/${lesson.id}`)
              }
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
