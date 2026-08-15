import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { Text, View } from "react-native";
import ThemeProvider from "../components/ThemeProvider";
import DrawerProvider from "../contexts/DrawerContext";
import SideDrawer from "../components/SideDrawer";
import DrawerFab from "../components/DrawerFab";

export default function RootLayout() {
  const [loaded] = useFonts({
    JetBrainsMono: require("../../assets/fonts/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Bold": require("../../assets/fonts/JetBrainsMono-Bold.ttf"),
    "JetBrainsMono-Italic": require("../../assets/fonts/JetBrainsMono-Italic.ttf"),
    "JetBrainsMono-BoldItalic": require("../../assets/fonts/JetBrainsMono-BoldItalic.ttf"),
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#121317", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#ED225D", fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DrawerProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", animationDuration: 500 }} />
          <SideDrawer />
          <DrawerFab />
        </ThemeProvider>
      </DrawerProvider>
    </GestureHandlerRootView>
  );
}
