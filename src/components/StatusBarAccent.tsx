import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "./ThemeProvider";
import { luminance } from "../utils/colorUtils";

export default function StatusBarAccent() {
  const { ctaColor, colorScheme } = useThemeContext();
  const [showStatusBar, setShowStatusBar] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("setting_showStatusBar").then((val) => {
      setShowStatusBar(val !== "false");
    });
  }, []);

  if (!showStatusBar) {
    return <StatusBar style="hidden" hidden />;
  }

  const r = parseInt(ctaColor.slice(1, 3), 16);
  const g = parseInt(ctaColor.slice(3, 5), 16);
  const b = parseInt(ctaColor.slice(5, 7), 16);
  const isLight = luminance(r, g, b) > 0.4;

  return (
    <StatusBar
      style={isLight ? "dark" : "light"}
      backgroundColor={colorScheme === "dark" ? "#121317" : ctaColor}
    />
  );
}
