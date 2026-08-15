import { useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LoadingPage from "../components/LoadingPage";
import ThemeProvider from "../components/ThemeProvider";
import DrawerProvider from "../contexts/DrawerContext";
import SideDrawer from "../components/SideDrawer";

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
