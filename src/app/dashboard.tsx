import { View, Text } from "react-native";
import Header from "../components/Header";

export default function Dashboard() {
  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title="Dashboard" />
      <View className="flex-1 px-6 pt-8">
        <Text className="font-headline text-3xl font-bold text-on-surface dark:text-on-surface-dark">
          Hello, Coder!
        </Text>
        <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
          Level 3 · 84% to next level
        </Text>

        <View className="h-2 bg-surface-dim dark:bg-surface-dim-dark rounded-full mt-4 overflow-hidden">
          <View className="h-full w-[84%] bg-primary rounded-full" />
        </View>

        <View className="flex-row gap-3 mt-6">
          <View className="flex-1 bg-primary/10 rounded-xl px-4 py-4 items-center">
            <Text className="font-headline text-2xl font-bold text-primary">3</Text>
            <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
              Level
            </Text>
          </View>
          <View className="flex-1 bg-primary/10 rounded-xl px-4 py-4 items-center">
            <Text className="font-headline text-2xl font-bold text-primary">
              2.4k
            </Text>
            <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
              XP
            </Text>
          </View>
          <View className="flex-1 bg-primary/10 rounded-xl px-4 py-4 items-center">
            <Text className="font-headline text-2xl font-bold text-primary">7</Text>
            <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
              Streak
            </Text>
          </View>
        </View>

        <View className="mt-10">
          <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark mb-4">
            Quick Actions
          </Text>
          <View className="gap-3">
            <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl px-5 py-4">
              <Text className="font-headline text-lg font-bold text-on-surface dark:text-on-surface-dark">
                Continue Learning
              </Text>
              <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                Pick up where you left off
              </Text>
            </View>
            <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl px-5 py-4">
              <Text className="font-headline text-lg font-bold text-on-surface dark:text-on-surface-dark">
                Up next
              </Text>
              <Text className="font-body text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                Continue your next exercise
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
