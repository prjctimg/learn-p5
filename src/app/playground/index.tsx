import { View, Text } from "react-native";
import Header from "../../components/Header";

export default function Playground() {
  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title="Playground" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl mb-4">🎮</Text>
        <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark">
          Coming Soon
        </Text>
        <Text className="font-body text-base text-text-secondary dark:text-text-secondary-dark mt-2 text-center">
          Experiment with p5.js sketches in a free-form playground.
        </Text>
      </View>
    </View>
  );
}
