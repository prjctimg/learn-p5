import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import ChallengeCard from "../../components/ChallengeCard";

const courses = [
  {
    slug: "shapes",
    title: "Shapes",
    moduleName: "Fundamentals",
    description:
      "Master the coordinate system and draw your first primitive shapes using code.",
    lessonCount: 1,
  },
];

export default function Learn() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title="p5.js Learn" right={
        <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-full px-3 py-1">
          <Text className="font-mono text-xs text-text-secondary dark:text-text-secondary-dark">
            v4.0.2
          </Text>
        </View>
      } />
      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="font-headline text-5xl font-black tracking-tighter text-on-surface dark:text-on-surface-dark">
          Hello, Coder!
        </Text>
        <Text className="font-body text-base text-text-secondary dark:text-text-secondary-dark mt-2">
          Choose a course to begin your creative coding journey.
        </Text>

        <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark mt-8 mb-4">
          Available Courses
        </Text>

        {courses.map((course) => (
          <View key={course.slug} className="mb-4">
            <ChallengeCard
              title={course.title}
              moduleName={course.moduleName}
              description={`${course.lessonCount} lesson${course.lessonCount > 1 ? "s" : ""} · ${course.description}`}
              onContinue={() => router.push(`/learn/${course.slug}`)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
