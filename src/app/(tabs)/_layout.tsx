import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../components/ThemeProvider";
import { useBottomNavContext } from "../../contexts/BottomNavContext";
import { useWindowDimensions } from "react-native";

export default function TabLayout() {
  const { derivedColors } = useThemeContext();
  const { visible } = useBottomNavContext();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  if (isTablet) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: derivedColors.primary,
        tabBarInactiveTintColor: derivedColors.tabInactive ?? "#888",
        tabBarStyle: {
          display: visible ? "flex" : "none",
          backgroundColor: derivedColors.surface,
          borderTopColor: derivedColors.outlineVariant,
        },
        tabBarLabelStyle: {
          fontFamily: "JetBrainsMono",
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learning",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ref"
        options={{
          title: "Reference",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
