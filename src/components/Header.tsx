import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { useDrawerContext } from "../contexts/DrawerContext";
import { Colors } from "../constants/Colors";

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export default function Header({ title, subtitle, right, showBack = true, onBack }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { openDrawer } = useDrawerContext();

  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8, backgroundColor: colors.surface },
      ]}
    >
      <View style={styles.leftSection}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={styles.menuButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        ) : (
          <Pressable
            onPress={openDrawer}
            style={styles.menuButton}
            accessibilityRole="button"
            accessibilityLabel="Open navigation drawer"
          >
            <MaterialCommunityIcons name="menu" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        )}
        <View>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontFamily: "JetBrainsMono",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
    marginTop: -2,
  },
});
