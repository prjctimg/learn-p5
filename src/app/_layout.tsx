import { useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LoadingPage from "../components/LoadingPage";
import ThemeProvider from "../components/ThemeProvider";
import DrawerProvider from "../contexts/DrawerContext";
import SideDrawer from "../components/SideDrawer";

SplashScreen.setOptions({ duration: 800, fade: true });

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return <LoadingPage onFinish={() => setReady(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DrawerProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <SideDrawer />
        </ThemeProvider>
      </DrawerProvider>
    </GestureHandlerRootView>
  );
}
