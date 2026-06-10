import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "hasCompletedOnboarding";
const ONBOARDING_DATA_KEY = "onboardingData";

interface OnboardingData {
  experience: string | null;
  path: string | null;
}

export function useOnboarding() {
  const [loading, setLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    experience: null,
    path: null,
  });

  useEffect(() => {
    AsyncStorage.multiGet([ONBOARDING_KEY, ONBOARDING_DATA_KEY])
      .then(([completeEntry, dataEntry]) => {
        const completed = completeEntry[1] === "true";
        setIsOnboardingComplete(completed);
        if (dataEntry[1]) {
          setData(JSON.parse(dataEntry[1]));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completeOnboarding = async (onboardingData?: OnboardingData) => {
    const finalData = onboardingData ?? data;
    await AsyncStorage.multiSet([
      [ONBOARDING_KEY, "true"],
      [ONBOARDING_DATA_KEY, JSON.stringify(finalData)],
    ]);
    setData(finalData);
    setIsOnboardingComplete(true);
  };

  const updateData = async (updates: Partial<OnboardingData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    await AsyncStorage.setItem(
      ONBOARDING_DATA_KEY,
      JSON.stringify(newData)
    );
  };

  const resetOnboarding = async () => {
    await AsyncStorage.multiSet([
      [ONBOARDING_KEY, "false"],
      [ONBOARDING_DATA_KEY, JSON.stringify({ experience: null, path: null })],
    ]);
    setIsOnboardingComplete(false);
    setData({ experience: null, path: null });
  };

  return {
    loading,
    isOnboardingComplete,
    data,
    completeOnboarding,
    updateData,
    resetOnboarding,
  };
}
