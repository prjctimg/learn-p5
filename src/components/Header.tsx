import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrawerContext } from "../contexts/DrawerContext";
import { useThemeContext } from "../components/ThemeProvider";
import { Colors } from "../constants/Colors";

interface HeaderProps {
 title: string;
 subtitle?: string;
 right?: React.ReactNode;
}

export default function Header({ title, subtitle, right }: HeaderProps) {
 const insets = useSafeAreaInsets();
 const { openDrawer } = useDrawerContext();
 const { colorScheme } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

 return (
 <View
 style={[
 styles.header,
 { paddingTop: insets.top + 8, backgroundColor: colors.surface },
 ]}
 >
 <View style={styles.leftSection}>
 <Pressable
 onPress={openDrawer}
 style={[styles.menuButton, { backgroundColor: colors.surfaceDim }]}
 accessibilityRole="button"
 accessibilityLabel="Open navigation menu"
 >
 <Text style={[styles.menuIcon, { color: colors.onSurface }]}>
 ☰
 </Text>
 </Pressable>
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
 width: 40,
 height: 40,
 alignItems: "center",
 justifyContent: "center",
 borderRadius: 9999,
 },
 menuIcon: {
 fontSize: 20,
 fontWeight: "700",
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
