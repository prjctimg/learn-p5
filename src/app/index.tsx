import { useState } from "react";
import { Redirect } from "expo-router";
import { useOnboarding } from "../hooks/useOnboarding";
import SplashScreen from "../components/SplashScreen";

export default function Index() {
  const { loading, isOnboardingComplete } = useOnboarding();
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen loading={loading} onFinish={() => setSplashDone(true)} />;
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding/1" />;
  }

  return <Redirect href="/dashboard" />;
}
