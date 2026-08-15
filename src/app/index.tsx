import { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOnboarding } from "../hooks/useOnboarding";
import SplashScreen from "../components/SplashScreen";
import Toast from "../components/Toast";

export default function Index() {
  const { loading, isOnboardingComplete } = useOnboarding();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    const run = async () => {
      const done = await AsyncStorage.getItem("assets_prefetched");
      if (done === "true") return;
      setToastVisible(true);
      await new Promise((r) => setTimeout(r, 2000));
      await AsyncStorage.setItem("assets_prefetched", "true");
      setNeedsReload(true);
      await Updates.reloadAsync();
    };
    run();
  }, [loading]);

  if (loading || !minTimePassed) {
    return <SplashScreen />;
  }

  if (needsReload) {
    return (
      <View style={{ flex: 1, backgroundColor: "#2a0516", alignItems: "center", justifyContent: "center" }}>
        <Toast
          visible={toastVisible}
          message="Loading app assets — refreshing..."
          duration={4000}
          onDismiss={() => {}}
        />
      </View>
    );
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding/1" />;
  }

  return <Redirect href="/dashboard" />;
}
