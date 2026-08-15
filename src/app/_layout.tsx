import { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ThemeProvider from "../components/ThemeProvider";
import StatusBarAccent from "../components/StatusBarAccent";
import DrawerProvider from "../contexts/DrawerContext";
import SideDrawer from "../components/SideDrawer";
import DrawerFab from "../components/DrawerFab";
import { DEFAULTS } from "../constants/Defaults";

export default function RootLayout() {
  const [loaded] = useFonts({
    JetBrainsMono: require("../../assets/fonts/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Bold": require("../../assets/fonts/JetBrainsMono-Bold.ttf"),
    "JetBrainsMono-Italic": require("../../assets/fonts/JetBrainsMono-Italic.ttf"),
    "JetBrainsMono-BoldItalic": require("../../assets/fonts/JetBrainsMono-BoldItalic.ttf"),
  });

  const [accentColor, setAccentColor] = useState(DEFAULTS.ctaColor);

  useEffect(() => {
    AsyncStorage.getItem("setting_ctaColor").then((val) => {
      if (val) setAccentColor(val);
    });
  }, []);

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: accentColor, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DrawerProvider>
        <ThemeProvider>
          <StatusBarAccent />
          <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", animationDuration: 500 }} />
          <SideDrawer />
          <DrawerFab />
        </ThemeProvider>
      </DrawerProvider>
    </GestureHandlerRootView>
  );
}
