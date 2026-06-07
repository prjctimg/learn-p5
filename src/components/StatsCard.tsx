import { View, Text } from "react-native";

interface StatItem {
  icon: string;
  value: string;
  label: string;
}

interface StatsCardProps {
  items: StatItem[];
}

export default function StatsCard({ items }: StatsCardProps) {
  return (
    <View className="flex-row gap-4">
      {items.map((item, i) => (
        <View
          key={i}
          className="flex-1 flex-row items-center gap-2 bg-surface-dim dark:bg-surface-dim-dark rounded-xl px-4 py-3"
        >
          <Text className="text-lg">{item.icon}</Text>
          <View>
            <Text className="font-headline text-lg font-bold text-on-surface dark:text-on-surface-dark">
              {item.value}
            </Text>
            <Text className="font-body text-xs text-text-secondary dark:text-text-secondary-dark">
              {item.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
