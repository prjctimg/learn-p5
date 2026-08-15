import { View, Text, StyleSheet } from "react-native";
import Header from "../../components/Header";
import { useThemeContext } from "../../components/ThemeProvider";
import { Colors } from "../../constants/Colors";

export default function Playground() {
 const { colorScheme } = useThemeContext();
 const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

 return (
 <View style={[styles.container, { backgroundColor: colors.surface }]}>
 <Header title="Playground" />
 <View style={styles.centerContent}>
 <Text style={styles.emoji}>🎮</Text>
 <Text style={[styles.heading, { color: colors.onSurface }]}>
 Coming Soon
 </Text>
 <Text style={[styles.description, { color: colors.textSecondary }]}>
 Experiment with p5.js sketches in a free-form playground.
 </Text>
 </View>
 </View>
);
}

const styles = StyleSheet.create({
 container: {
 flex: 1,
 },
 centerContent: {
 flex: 1,
 alignItems: "center",
 justifyContent: "center",
 paddingHorizontal: 24,
 },
 emoji: {
 fontSize: 36,
 marginBottom: 16,
 },
  heading: {
    fontFamily: "JetBrainsMono",
    fontSize: 24,
    fontWeight: "700",
  },
  description: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
 marginTop: 8,
 textAlign: "center",
 },
});
