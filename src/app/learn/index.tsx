import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import Button from "../../components/Button";
import ChallengeCard from "../../components/ChallengeCard";
import StatsCard from "../../components/StatsCard";
import RecentSketchCard from "../../components/RecentSketchCard";

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
          Ready to create something amazing today?
        </Text>

        <View className="mt-6">
          <Button
            title="Start Learning"
            onPress={() => router.push("/learn")}
            variant="primary"
            accessibilityLabel="Start learning p5.js"
          />
        </View>

        <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark mt-8 mb-4">
          Daily Challenge
        </Text>

        <ChallengeCard
          title="Sine Wave Harmony"
          level="Beginner"
          duration="15 mins"
          code="sin(angle) * amplitude;"
          comment="// Use math to create motion"
          onTry={() => router.push("/learn/exercise-1")}
        />

        <View className="mt-6">
          <StatsCard
            items={[
              { icon: "🔥", value: "12", label: "Day Streak" },
              { icon: "🧩", value: "45", label: "Projects Done" },
            ]}
          />
        </View>

        <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark mt-8 mb-4">
          Recent Sketches
        </Text>

        <View className="gap-3">
          <RecentSketchCard
            title="Perlin Noise Terrain"
            timeAgo="2 hours ago"
            thumbnailLabel="PN"
            onPress={() => {}}
          />
          <RecentSketchCard
            title="Particle System v2"
            timeAgo="Yesterday"
            thumbnailLabel="PS"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
}
