import { Stack, usePathname, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { Pressable, Text, View, useWindowDimensions, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ThemeProvider from "../components/ThemeProvider";
import { BottomNavProvider } from "../contexts/BottomNavContext";
import { useThemeContext } from "../components/ThemeProvider";
import { Colors } from "../constants/Colors";
import { APP_VERSION } from "../constants/Version";
import BottomNavFab from "../components/BottomNavFab";

const TAB_ROUTES = [
  { label: "Dashboard", href: "/dashboard", icon: "view-dashboard-outline" as const },
  { label: "Learning", href: "/learn", icon: "book-open-outline" as const },
  { label: "Reference", href: "/ref", icon: "bookmark-outline" as const },
  { label: "Settings", href: "/settings", icon: "cog-outline" as const },
];

function TabletRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const isActive = (route: string) =>
    pathname === route || pathname.startsWith(route + "/");

  return (
    <View style={[railStyles.container, { backgroundColor: colors.surface, borderRightColor: colors.outlineVariant }]}>
      <View style={railStyles.header}>
        <Text style={[railStyles.logoText, { color: derivedColors.primary }]}>p5</Text>
      </View>
      <View style={railStyles.items}>
        {TAB_ROUTES.map((item) => {
          const active = isActive(item.href);
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href)}
              style={[
                railStyles.item,
                active && { backgroundColor: derivedColors.primary + "1A" },
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={active ? derivedColors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  railStyles.label,
                  { color: active ? derivedColors.primary : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[railStyles.version, { color: colors.textSecondary }]}>{APP_VERSION}</Text>
    </View>
  );
}

function RootStack() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {isTablet && <TabletRail />}
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            animationDuration: 500,
          }}
        />
      </View>
      {!isTablet && <BottomNavFab />}
    </View>
  );
}

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
      <ThemeProvider>
        <BottomNavProvider>
          <RootStack />
        </BottomNavProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const railStyles = StyleSheet.create({
  container: {
    width: 72,
    borderRightWidth: 1,
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  logoText: {
    fontFamily: "JetBrainsMono",
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
  },
  items: {
    flex: 1,
    gap: 4,
    width: "100%",
    paddingHorizontal: 8,
  },
  item: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 2,
  },
  label: {
    fontFamily: "JetBrainsMono",
    fontSize: 9,
    fontWeight: "600",
  },
  version: {
    fontFamily: "JetBrainsMono",
    fontSize: 9,
  },
});
