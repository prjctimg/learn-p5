import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useOnboarding } from "../hooks/useOnboarding";

export default function Index() {
  const { loading, isOnboardingComplete } = useOnboarding();

  if (loading) {
    return (
      <View className="flex-1 bg-[#2a0516] items-center justify-center">
        <ActivityIndicator color="#ED225D" />
      </View>
    );
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding/1" />;
  }

  return <Redirect href="/dashboard" />;
}
