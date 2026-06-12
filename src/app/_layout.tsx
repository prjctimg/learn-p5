import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ThemeProvider from "../components/ThemeProvider";
import DrawerProvider from "../contexts/DrawerContext";
import SideDrawer from "../components/SideDrawer";

export default function RootLayout() {
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
