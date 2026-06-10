import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useOnboarding } from "../hooks/useOnboarding";

export default function Index() {
  const { loading, isOnboardingComplete } = useOnboarding();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#ED225D" />
      </View>
    );
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding/1" />;
  }

  return <Redirect href="/dashboard" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#2a0516",
    alignItems: "center",
    justifyContent: "center",
  },
});
