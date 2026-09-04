import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { loadMinigameForCourse } from "../../../../utils/courseLoader";
import { Minigame } from "../../../../data/types";
import { useThemeContext } from "../../../../components/ThemeProvider";
import { Colors } from "../../../../constants/Colors";
import { setHighScore } from "../../../../store/high-scores-store";
import { getUnlockedAchievements, getUnlockedAchievementsAt } from "../../../../hooks/useAchievements";

export default function MinigameCompleteScreen() {
  const { course, score } = useLocalSearchParams<{ course: string; score: string }>();
  const [minigame, setMinigame] = useState<Minigame | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const { colorScheme, derivedColors } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  useEffect(() => {
    async function loadMinigameData() {
      if (!course) return;
      const data = await loadMinigameForCourse(course);
      setMinigame(data);
      
      if (data) {
        const finalScore = parseInt(score || "0", 10);
        const prevHigh = await loadPreviousHigh(data.id);
        if (finalScore > prevHigh) {
          await setHighScore(data.id, finalScore);
          setIsNewHigh(finalScore > prevHigh);
        }
      }
      setLoading(false);
    }
    loadMinigameData();
  }, [course, score]);

  async function loadPreviousHigh(minigameId: string): Promise<number> {
    // Will be handled by the high-scores store directly
    return 0;
  }

  if (loading || !minigame) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  const finalScore = parseInt(score || "0", 10);
  const passed = finalScore >= minigame.targetScore;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.surfaceDim, borderBottomColor: colors.outlineVariant }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{minigame.title}</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.resultCard, 
          { backgroundColor: passed ? colors.successContainer : "#FFF3CD", borderColor: passed ? colors.success : "#FFC107" }]}>
          <Text style={styles.resultEmoji}>{passed ? "🏆" : "💪"}</Text>
          <Text style={[styles.resultTitle, { color: colors.onSurface }]}>
            {passed ? "Congratulations!" : "Good Try!"}
          </Text>
          <Text style={[styles.resultScore, { color: colors.primary }]}>
            Score: {finalScore} / {minigame.targetScore}
          </Text>
          <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>
            {passed 
              ? "You've mastered this minigame! Your achievement has been unlocked."
              : "Keep practicing! You'll get there next time."
            }
          </Text>
        </View>

        {isNewHigh && (
          <View style={[styles.newHighContainer, { backgroundColor: colors.surfaceDim, borderColor: colors.primary }]}>
            <Text style={[styles.newHighTitle, { color: colors.primary }]}>New High Score!</Text>
          </View>
        )}

        {passed && (
          <View style={[styles.achievementContainer, { backgroundColor: colors.surfaceDim, borderColor: colors.primary }]}>
            <Text style={[styles.achievementTitle, { color: colors.primary }]}>Achievement Unlocked!</Text>
            <Text style={[styles.achievementId, { color: colors.textSecondary }]}>{minigame.achievementId}</Text>
          </View>
        )}

        <View style={[styles.statsContainer, { backgroundColor: colors.surfaceDim }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Target Score</Text>
            <Text style={[styles.statValue, { color: colors.onSurface }]}>{minigame.targetScore}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Your Score</Text>
            <Text style={[styles.statValue, { color: passed ? colors.success : colors.error }]}>
              {finalScore}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Result</Text>
            <Text style={[styles.statValue, { color: passed ? colors.success : colors.error }]}>
              {passed ? "PASSED" : "FAILED"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {!passed && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/learn")}
        >
          <Text style={styles.buttonText}>Continue Learning</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resultCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  resultMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  newHighContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 16,
  },
  newHighTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  achievementContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 2,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  achievementId: {
    fontSize: 14,
    fontFamily: "monospace",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
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
