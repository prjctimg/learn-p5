import { Redirect } from "expo-router";
import { useOnboarding } from "../hooks/useOnboarding";

export default function Index() {
  const { isOnboardingComplete } = useOnboarding();

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding/1" />;
  }

  return <Redirect href="/dashboard" />;
}
