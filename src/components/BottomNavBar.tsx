import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

  return (
    <View className="flex-row justify-around items-center px-2 py-2 bg-surface-container dark:bg-surface-container-dark border-t border-outline-variant dark:border-outline-variant-dark">
      {tabs.map((tab) => {
        const active = tab.matchPath(pathname);
        return (
          <Pressable
            key={tab.label}
            onPress={() => router.push(tab.href)}
            className={`flex-col items-center justify-center px-4 py-1 active:scale-90 ${
              active
                ? "bg-primary-container dark:bg-primary-container-dark rounded-full"
                : ""
            }`}
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
              className={`font-label text-[10px] uppercase tracking-wider mt-0.5 ${
                active
                  ? "text-on-primary-container dark:text-on-primary-container-dark font-bold"
                  : "text-on-surface-variant dark:text-on-surface-variant-dark"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
