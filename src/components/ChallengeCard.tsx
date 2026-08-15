import { View, Text, StyleSheet } from "react-native";
import { Svg, Path } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import Button from "./Button";

const asteriskPath =
 "M16.909,10.259l8.533-2.576l1.676,5.156l-8.498,2.899l5.275,7.48l-4.447,3.225l-5.553-7.348L8.487,26.25l-4.318-3.289l5.275-7.223L0.88,12.647l1.678-5.16l8.598,2.771V1.364h5.754V10.259z";

interface ChallengeCardProps {
 title: string;
 moduleName: string;
 description: string;
 locked?: boolean;
 onContinue?: () => void;
}

export default function ChallengeCard({
 title,
 moduleName,
 description,
 locked = false,
 onContinue,
}: ChallengeCardProps) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

 return (
 <View style={[styles.card, { backgroundColor: colors.surfaceDim, opacity: locked ? 0.5 : 1 }]}>
  <View style={[styles.iconContainer, { backgroundColor: derivedColors.primary + "1A" }]}>
  {locked ? (
  <MaterialCommunityIcons name="lock" size={28} color={colors.textSecondary} />
  ) : (
  <Svg width={48} height={48} viewBox="0 0 28 28" fill="none">
  <Path d={asteriskPath} fill={derivedColors.primary} />
  </Svg>
  )}
  </View>

  <View style={styles.content}>
  <Text style={[styles.title, { color: locked ? colors.textSecondary : colors.onSurface }]}>
  {title}
  </Text>
  <Text style={[styles.moduleName, { color: derivedColors.primary }]}>
  {moduleName}
  </Text>
 <Text style={[styles.description, { color: colors.textSecondary }]}>
 {locked ? "Complete the previous lesson to unlock this one." : description}
 </Text>
 </View>

 {!locked && onContinue && (
 <View style={styles.buttonContainer}>
 <Button title="Continue" onPress={onContinue} variant="primary" />
 </View>
)}
 </View>
);
}

const styles = StyleSheet.create({
 card: {
 borderRadius: 12,
 overflow: "hidden",
 },
 iconContainer: {
 alignItems: "center",
 justifyContent: "center",
 paddingVertical: 40,
 },
 content: {
 paddingHorizontal: 16,
 paddingVertical: 16,
 gap: 8,
 },
  title: {
    fontFamily: "JetBrainsMono",
    fontSize: 24,
    fontWeight: "700",
  },
  moduleName: {
    fontFamily: "JetBrainsMono",
    fontSize: 11,
 textTransform: "uppercase",
 letterSpacing: 0.5,
 },
  description: {
    fontFamily: "JetBrainsMono",
    fontSize: 16,
 lineHeight: 20,
 },
 buttonContainer: {
 paddingHorizontal: 16,
 paddingBottom: 16,
 },
});
