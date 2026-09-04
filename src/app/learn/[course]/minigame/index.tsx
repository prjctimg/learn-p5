import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { loadMinigameForCourse } from "../../../../utils/courseLoader";
import { Minigame, ExerciseTask } from "../../../../data/types";
import { useThemeContext } from "../../../../components/ThemeProvider";
import { Colors } from "../../../../constants/Colors";

export default function MinigameScreen() {
  const { course } = useLocalSearchParams<{ course: string }>();
  const [minigame, setMinigame] = useState<Minigame | null>(null);
  const [loading, setLoading] = useState(true);
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  useEffect(() => {
    async function loadMinigameData() {
      if (!course) return;
      const data = await loadMinigameForCourse(course);
      setMinigame(data);
      setLoading(false);
    }
    loadMinigameData();
  }, [course]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading minigame...</Text>
      </View>
    );
  }

  if (!minigame) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>No minigame available for this course</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.surfaceDim, borderBottomColor: colors.outlineVariant }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{minigame.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{minigame.description}</Text>
      </View>

      <View style={[styles.infoContainer, { backgroundColor: colors.surfaceDim }]}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Game Type</Text>
          <Text style={[styles.infoValue, { color: colors.primary }]}>{minigame.gameType.toUpperCase()}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Target Score</Text>
          <Text style={[styles.infoValue, { color: colors.primary }]}>{minigame.targetScore}</Text>
        </View>
      </View>

      <View style={styles.unlockSection}>
        <Text style={[styles.unlockTitle, { color: colors.onSurface }]}>Unlock Requirements</Text>
        <Text style={[styles.unlockDescription, { color: colors.textSecondary }]}>
          Complete the following exercise to unlock this minigame:
        </Text>
        
        <View style={[styles.exerciseCard, { backgroundColor: colors.surfaceDim, borderColor: colors.outlineVariant }]}>
          <Text style={[styles.exerciseTitle, { color: colors.onSurface }]}>{minigame.unlockExercise.title}</Text>
          <Text style={[styles.exerciseDescription, { color: colors.textSecondary }]}>
            {minigame.unlockExercise.description}
          </Text>
          
          {minigame.unlockExercise.tasks && (
            <View style={styles.tasksContainer}>
              <Text style={[styles.tasksTitle, { color: colors.onSurface }]}>Tasks:</Text>
              {minigame.unlockExercise.tasks.map((task: ExerciseTask, index: number) => (
                <View key={task.id} style={styles.taskItem}>
                  <Text style={[styles.taskNumber, { color: colors.textSecondary }]}>{index + 1}.</Text>
                  <Text style={[styles.taskTitle, { color: colors.onSurface }]}>{task.title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => {
            router.push(`/learn/${course}/unlock-${minigame.id}`);
          }}
        >
          <Text style={styles.buttonText}>Start Unlock Exercise</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: derivedColors.primary }]}
          onPress={() => {
            router.push(`/learn/${course}/minigame/play`);
          }}
        >
          <Text style={styles.buttonText}>Play Minigame</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  unlockSection: {
    padding: 20,
  },
  unlockTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  unlockDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  exerciseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  tasksContainer: {
    marginTop: 8,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  taskNumber: {
    fontSize: 14,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 14,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
