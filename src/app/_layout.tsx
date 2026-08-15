import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ThemeProvider from "../components/ThemeProvider";
import DrawerProvider from "../contexts/DrawerContext";
import SideDrawer from "../components/SideDrawer";
import DrawerFab from "../components/DrawerFab";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DrawerProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <SideDrawer />
          <DrawerFab />
        </ThemeProvider>
      </DrawerProvider>
    </GestureHandlerRootView>
  );
}
