import { View, Text } from "react-native";
import Header from "../../components/Header";

export default function Settings() {
  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <Header title="Settings" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl mb-4">⚙️</Text>
        <Text className="font-headline text-2xl font-bold text-on-surface dark:text-on-surface-dark">
          Coming Soon
        </Text>
        <Text className="font-body text-base text-text-secondary dark:text-text-secondary-dark mt-2 text-center">
          Configure your preferences, theme, and account settings.
        </Text>
      </View>
    </View>
  );
}
