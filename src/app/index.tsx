import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useOnboarding } from "../hooks/useOnboarding";
import SplashScreen from "../components/SplashScreen";

export default function Index() {
  const { loading, isOnboardingComplete } = useOnboarding();
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !minTimePassed) {
    return <SplashScreen />;
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding/1" />;
  }

  return <Redirect href="/dashboard" />;
}
