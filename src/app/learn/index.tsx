import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import ChallengeCard from "../../components/ChallengeCard";
import { loadAllCourses } from "../../utils/courseLoader";
import { Course } from "../../data/types";

export default function Learn() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllCourses()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title="p5.js Learn" right={
        <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-full px-3 py-1">
          <Text className="font-mono text-xs text-text-secondary dark:text-text-secondary-dark">
            v4.0.2
          </Text>
        </View>
      } />
      <FlatList
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <Text className="font-headline text-5xl font-black tracking-tighter text-on-surface dark:text-on-surface-dark">
              Hello, Coder!
            </Text>
            <Text className="font-body text-base text-text-secondary dark:text-text-secondary-dark mt-2">
              Choose a course to begin your creative coding journey.
            </Text>
            <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark mt-8 mb-4">
              Available Courses
            </Text>
          </>
        }
        data={loading ? [] : courses}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <View className="mb-4">
            <ChallengeCard
              title={item.title}
              moduleName={item.moduleName}
              description={`${item.lessons.length} lesson${item.lessons.length > 1 ? "s" : ""} · ${item.description}`}
              onContinue={() => router.push(`/learn/${item.slug}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark">
                Loading...
              </Text>
            </View>
          ) : error ? (
            <View className="bg-error/10 border border-error/30 rounded-xl px-4 py-6 items-center">
              <Text className="font-body text-sm text-error text-center">
                Couldn&apos;t load courses: {error}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
