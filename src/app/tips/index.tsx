import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";
import Header from "../../components/Header";

const tips = [
  {
    icon: "gesture-tap-hold",
    title: "Long-Press Run Button",
    description:
      "Press and hold the Run button for 2 seconds to quickly search p5.js symbol references without leaving the exercise.",
  },
  {
    icon: "vibrate",
    title: "Shake for Quick Actions",
    description:
      "Shake your device during an exercise to open the quick actions menu. Get hints, view references, or reset your code instantly.",
  },
  {
    icon: "gesture-swipe-right",
    title: "Swipe to Open Drawer",
    description:
      "Swipe from the left edge of the screen to open the navigation drawer. You can also tap the colored strip on the left edge (toggleable in Settings).",
  },
  {
    icon: "keyboard",
    title: "Programming Keyboard",
    description:
      "Use the programming keyboard for quick insertion of p5.js functions. Toggle between programming and qwerty keyboards with the keyboard button.",
  },
  {
    icon: "palette",
    title: "Customize Your Editor",
    description:
      "Tap the three-dot menu in the exercise header to access editor settings. Change font size, theme, word wrap, and keyboard height to match your preferences.",
  },
  {
    icon: "check-circle-outline",
    title: "Exercise Tasks",
    description:
      "Each exercise may have multiple tasks. Complete them in order — the app will guide you step by step toward the solution.",
  },
  {
    icon: "book-open-variant",
    title: "Symbol Cross-References",
    description:
      "Tap any p5.js function name in the exercise instructions to jump directly to its reference page with examples and documentation.",
  },
  {
    icon: "magnify",
    title: "Search All Symbols",
    description:
      "Use the search button on the Reference page to quickly find any p5.js function, property, or constant by name or description.",
  },
  {
    icon: "cellphone",
    title: "Optimized for Mobile",
    description:
      "The code editor is optimized for touch input. Tap to place the cursor, use the custom keyboard for input, and swipe to scroll through your code.",
  },
  {
    icon: "theme-light-dark",
    title: "Dark Mode & Accent Colors",
    description:
      "Switch between light and dark mode in Settings. You can also customize the accent color from a palette of processing-inspired colors.",
  },
];

export default function Tips() {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Header title="Tips" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Make the most of Learn P5 with these tips and lesser-known features.
        </Text>
        {tips.map((tip, i) => (
          <View
            key={i}
            style={[styles.tipCard, { backgroundColor: colors.surfaceDim }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: derivedColors.primaryContainer }]}>
              <MaterialCommunityIcons
                name={tip.icon as any}
                size={22}
                color={derivedColors.onPrimaryContainer}
              />
            </View>
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.onSurface }]}>
                {tip.title}
              </Text>
              <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>
                {tip.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  intro: {
    fontFamily: "JetBrainsMono",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: "JetBrainsMono",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  tipDescription: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
    lineHeight: 18,
  },
});
