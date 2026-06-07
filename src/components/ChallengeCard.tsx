import { View, Text } from "react-native";
import Button from "./Button";

interface ChallengeCardProps {
  title: string;
  level: string;
  duration: string;
  code: string;
  comment: string;
  onTry: () => void;
}

export default function ChallengeCard({
  title,
  level,
  duration,
  code,
  comment,
  onTry,
}: ChallengeCardProps) {
  return (
    <View className="bg-surface-dim dark:bg-surface-dim-dark rounded-xl overflow-hidden border-2 border-outline dark:border-outline-dark">
      <View className="flex-row items-center gap-2 px-4 pt-3 pb-1">
        <View className="bg-primary px-2.5 py-0.5 rounded">
          <Text className="font-label text-xs text-on-primary uppercase tracking-wider">
            LIVE NOW
          </Text>
        </View>
        <Text className="font-mono text-xs text-text-secondary dark:text-text-secondary-dark">
          sketch.js
        </Text>
      </View>

      <View className="px-4 py-2">
        <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark">
          {title}
        </Text>
        <View className="flex-row items-center gap-3 mt-1">
          <Text className="font-label text-xs uppercase tracking-wider text-primary">
            {level}
          </Text>
          <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark">
            {duration}
          </Text>
        </View>
      </View>

      <View className="mx-4 mb-2 bg-surface dark:bg-surface-dark rounded-lg px-4 py-3 border border-outline/20 dark:border-outline-dark/20">
        <Text className="font-mono text-sm text-on-surface dark:text-on-surface-dark">
          {code}
        </Text>
        <Text className="font-mono text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
          {comment}
        </Text>
      </View>

      <View className="px-4 pb-4">
        <Button title="Try it" onPress={onTry} variant="primary" />
      </View>
    </View>
  );
}
