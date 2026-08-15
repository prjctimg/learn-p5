import { Redirect } from "expo-router";
import { useOnboarding } from "../hooks/useOnboarding";
import SplashScreen from "../components/SplashScreen";

export default function Index() {
  const { loading, isOnboardingComplete } = useOnboarding();

  if (loading) {
    return <SplashScreen />;
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding/1" />;
  }

  return <Redirect href="/dashboard" />;
}
