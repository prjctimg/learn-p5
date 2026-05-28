import { useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import LoadingPage from "../components/LoadingPage";

SplashScreen.setOptions({ duration: 800, fade: true });

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return <LoadingPage onFinish={() => setReady(true)} />;
  }

  return <Stack />;
}
