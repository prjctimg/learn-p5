import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "../components/ThemeProvider";
import { Colors } from "../constants/Colors";

interface TabItem {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconFilled: keyof typeof MaterialCommunityIcons.glyphMap;
  href: string;
  matchPath: (path: string) => boolean;
}

const tabs: TabItem[] = [
  {
    label: "Learn",
    icon: "school-outline",
    iconFilled: "school",
    href: "/learn",
    matchPath: (p) => p === "/learn",
  },
  {
    label: "Editor",
    icon: "code-tags",
    iconFilled: "code-tags",
    href: "/learn/shapes/exercise-1",
    matchPath: (p) => p.startsWith("/learn/") && p !== "/learn",
  },
  {
    label: "Gallery",
    icon: "grid",
    iconFilled: "grid",
    href: "/playground",
    matchPath: (p) => p === "/playground",
  },
  {
    label: "Profile",
    icon: "account-outline",
    iconFilled: "account",
    href: "/settings",
    matchPath: (p) => p === "/settings",
  },
];

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer, borderTopColor: colors.outlineVariant }]}>
      {tabs.map((tab) => {
        const active = tab.matchPath(pathname);
        return (
          <Pressable
            key={tab.label}
            onPress={() => router.push(tab.href)}
            style={({ pressed }) => [
              styles.tab,
              active && { backgroundColor: colors.primaryContainer, borderRadius: 9999 },
              pressed && { transform: [{ scale: 0.9 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
          >
            <MaterialCommunityIcons
              name={active ? tab.iconFilled : tab.icon}
              size={24}
              color={active ? "#5A001C" : "#E4BDC0"}
            />
            <Text
              style={[
                styles.tabLabel,
                active
                  ? { color: colors.onPrimaryContainer, fontWeight: "700" }
                  : { color: colors.onSurfaceVariant },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  tab: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tabLabel: {
    fontFamily: "Inter",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
