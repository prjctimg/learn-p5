import { View, Text, Pressable } from "react-native";

interface RecentSketchCardProps {
  title: string;
  timeAgo: string;
  thumbnailLabel: string;
  onPress: () => void;
}

export default function RecentSketchCard({
  title,
  timeAgo,
  thumbnailLabel,
  onPress,
}: RecentSketchCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 bg-surface-dim dark:bg-surface-dim-dark rounded-xl px-4 py-3"
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${timeAgo}`}
    >
      <View className="w-12 h-12 rounded-lg bg-primary/20 items-center justify-center">
        <Text className="text-xs font-mono text-primary font-bold text-center leading-tight">
          {thumbnailLabel}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-headline text-base font-bold text-on-surface dark:text-on-surface-dark">
          {title}
        </Text>
        <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark mt-0.5">
          {timeAgo}
        </Text>
      </View>
      <Text className="text-lg text-text-secondary dark:text-text-secondary-dark">
        open_in_new
      </Text>
    </Pressable>
  );
}
