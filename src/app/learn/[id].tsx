import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../components/Header";
import Button from "../../components/Button";

const exercises: Record<string, { title: string; module: string; instruction: string }> = {
  "exercise-1": {
    title: "Exercise 1: The First Circle",
    module: "Shapes",
    instruction:
      'Modify the circle() function parameters to draw a circle at the exact center of the canvas.',
  },
};

export default function Exercise() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exercise = exercises[id ?? ""];

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header
        title="P5.LEARN"
        subtitle="Exercise View"
      />
      <View className="flex-1 px-4 pt-6">
        {exercise ? (
          <>
            <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark">
              {exercise.title}
            </Text>
            <Text className="font-body text-base text-text-secondary dark:text-text-secondary-dark mt-3">
              {exercise.instruction}
            </Text>
            <View className="flex-1 items-center justify-center">
              <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark">
                Code editor coming soon...
              </Text>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="font-headline text-xl font-bold text-on-surface dark:text-on-surface-dark">
              Exercise not found
            </Text>
            <View className="mt-4">
              <Button
                title="Back to Learn"
                onPress={() => router.push("/learn")}
                variant="outline"
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
