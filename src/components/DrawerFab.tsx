import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDrawerContext } from "../contexts/DrawerContext";
import { useThemeContext } from "./ThemeProvider";

const SETTING_KEY = "setting_showDrawerFab";

export default function DrawerFab() {
  const { openDrawer } = useDrawerContext();
  const { derivedColors } = useThemeContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTING_KEY).then((val) => {
      setVisible(val !== "false");
    });
  }, []);

  if (!visible) return null;

  return (
    <Pressable
      onPress={openDrawer}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: pressed ? derivedColors.primaryContainer : derivedColors.primary },
        pressed && { opacity: 0.8 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Open navigation drawer"
    >
      <MaterialCommunityIcons name="menu" size={18} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -50,
    width: 14,
    height: 100,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 35,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
