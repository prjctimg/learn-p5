import { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { WebView } from "react-native-webview";
import { loadMinigameForCourse } from "../../../../utils/courseLoader";
import { Minigame } from "../../../../data/types";
import { useThemeContext } from "../../../../components/ThemeProvider";
import { Colors } from "../../../../constants/Colors";
import { setHighScore } from "../../../../store/high-scores-store";
import { buildBounce2DHtml } from "../../../../utils/minigames/bounce2d";
import { buildSnakeClassicHtml } from "../../../../utils/minigames/snakeClassic";
import { buildSpaceImpactHtml } from "../../../../utils/minigames/spaceImpact";
import { buildBreakoutHtml } from "../../../../utils/minigames/breakout";
import { buildMemoryMatchHtml } from "../../../../utils/minigames/memoryMatch";
import { buildFrozenBubbleHtml } from "../../../../utils/minigames/frozenBubble";

const GAME_BUILDERS: Record<string, (targetScore: number) => string> = {
  "bounce-2d": buildBounce2DHtml,
  "snake-classic": buildSnakeClassicHtml,
  "space-impact": buildSpaceImpactHtml,
  breakout: buildBreakoutHtml,
  "memory-match": buildMemoryMatchHtml,
  "frozen-bubble": buildFrozenBubbleHtml,
};

export default function MinigamePlayScreen() {
  const { course } = useLocalSearchParams<{ course: string }>();
  const [minigame, setMinigame] = useState<Minigame | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [restartKey, setRestartKey] = useState(0);
  const gameHandledRef = useRef(false);
  const { colorScheme } = useThemeContext();
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

  const handleRestart = useCallback(() => {
    gameHandledRef.current = false;
    setScore(0);
    setRestartKey((k) => k + 1);
  }, []);

  const finishGame = useCallback(
    async (finalScore: number, won: boolean) => {
      if (gameHandledRef.current || !minigame) return;
      gameHandledRef.current = true;

      try {
        await setHighScore(minigame.id, finalScore);
      } catch {}

      const passed = finalScore >= minigame.targetScore;
      if (won || passed) {
        router.replace(`/learn/${course}/minigame/complete?score=${finalScore}`);
      } else {
        Alert.alert(
          "Game Over",
          `You scored ${finalScore}. Reach ${minigame.targetScore} to earn the achievement!`,
          [
            { text: "Try Again", onPress: handleRestart },
            { text: "Quit", style: "cancel", onPress: () => router.back() },
          ]
        );
      }
    },
    [course, minigame, handleRestart]
  );

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "score") {
          setScore(data.score);
        } else if (data.type === "gameOver") {
          finishGame(data.score ?? 0, data.won ?? false);
        }
      } catch {}
    },
    [finishGame]
  );

  if (loading || !minigame) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading minigame...</Text>
      </View>
    );
  }

  const builder = GAME_BUILDERS[minigame.id];
  const html = builder
    ? builder(minigame.targetScore)
    : `<html><body style="background:#0b1026;color:#fff;display:flex;align-items:center;justify-content:center;height:100%"><div>Coming soon</div></body></html>`;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.surfaceDim, borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={[styles.back, { color: colors.primary }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>{minigame.title}</Text>
        <Text style={[styles.score, { color: colors.primary }]}>Score: {score}</Text>
      </View>

      <View style={[styles.gameContainer, { borderColor: colors.outlineVariant }]}>
        <WebView
          key={restartKey}
          source={{ html }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          bounces={false}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.controls}>
        <Text style={[styles.targetText, { color: colors.textSecondary }]}>
          Target: {minigame.targetScore} points to win
        </Text>
        <TouchableOpacity
          style={[styles.restartButton, { backgroundColor: colors.secondary }]}
          onPress={handleRestart}
          accessibilityRole="button"
          accessibilityLabel="Restart game"
        >
          <Text style={styles.buttonText}>Restart</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  back: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  score: {
    fontSize: 16,
    fontWeight: "700",
  },
  gameContainer: {
    flex: 1,
    margin: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "#0b1026",
  },
  controls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  targetText: {
    fontSize: 13,
    flex: 1,
  },
  restartButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
