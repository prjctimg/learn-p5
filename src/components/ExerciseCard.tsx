import { View, Text, StyleSheet, Pressable } from "react-native";
import { useThemeContext } from "./ThemeProvider";
import { Colors } from "../constants/Colors";
import Button from "./Button";
import ModuleCover from "./ModuleCover";

interface ExerciseCardProps {
  title: string;
  moduleName: string;
  description: string;
  /** Course slug — drives the animated cover graphic. */
  slug?: string;
  locked?: boolean;
  isCurrent?: boolean;
  completed?: boolean;
  /** Title of the prior module the user must complete to unlock this card.
   *  When provided, the locked-state description names it explicitly. */
  lockHint?: string;
  onContinue?: () => void;
}

export default function ExerciseCard({
  title,
  moduleName,
  description,
  slug,
  locked = false,
  isCurrent = false,
  completed = false,
  lockHint,
  onContinue,
}: ExerciseCardProps) {
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
  <Pressable
    disabled={locked}
    onPress={onContinue}
    style={({ pressed }) => [
      styles.card,
      { backgroundColor: colors.surfaceDim, opacity: locked ? 0.5 : pressed ? 0.85 : 1 },
    ]}
    accessibilityRole="button"
    accessibilityLabel={locked ? `${title} (locked${lockHint ? `, complete ${lockHint} first` : ""})` : title}
  >
   <ModuleCover
     slug={slug ?? ""}
     color={derivedColors.primary}
     locked={locked}
     completed={completed}
   />

   <View style={styles.content}>
   <Text style={[styles.title, { color: locked ? colors.textSecondary : colors.onSurface }]}>
   {title}
   </Text>
   <Text style={[styles.moduleName, { color: derivedColors.primary }]}>
   {moduleName}
   </Text>
  <Text style={[styles.description, { color: colors.textSecondary }]}>
  {locked
    ? (lockHint
      ? `Complete "${lockHint}" to unlock this one.`
      : "Complete the current module to unlock this one.")
    : description}
  </Text>
   </View>

  {!locked && isCurrent && onContinue && (
  <View style={styles.buttonContainer}>
  <Button title="Continue" onPress={onContinue} variant="primary" />
  </View>
  )}
  </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
  borderRadius: 12,
  overflow: "hidden",
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