import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { WebView } from "react-native-webview";
import { loadMinigameForCourse } from "../../../../utils/courseLoader";
import { Minigame } from "../../../../data/types";
import { useThemeContext } from "../../../../components/ThemeProvider";
import { Colors } from "../../../../constants/Colors";

export default function MinigamePlayScreen() {
  const { course } = useLocalSearchParams<{ course: string }>();
  const [minigame, setMinigame] = useState<Minigame | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
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

  if (loading || !minigame) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading minigame...</Text>
      </View>
    );
  }

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === "score") {
        setScore(data.score);
      } else if (data.type === "gameOver") {
        setGameOver(true);
        if (data.score >= minigame.targetScore) {
          Alert.alert(
            "Congratulations!",
            `You achieved a score of ${data.score}!`,
            [
              {
                text: "Continue",
                onPress: () => router.back(),
              },
            ]
          );
        } else {
          Alert.alert(
            "Game Over",
            `You scored ${data.score}. Try again to reach ${minigame.targetScore}!`,
            [
              {
                text: "Try Again",
                onPress: () => setGameOver(false),
              },
              {
                text: "Quit",
                onPress: () => router.back(),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  const gameHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        canvas { display: block; }
      </style>
    </head>
    <body>
      <script>
        let score = 0;
        let gameOver = false;
        
        function setup() {
          createCanvas(400, 400);
        }
        
        function draw() {
          if (!gameOver) {
            background(220);
            // TODO: Implement actual minigame logic here
            textAlign(CENTER);
            textSize(32);
            text("Score: " + score, 200, 200);
          }
        }
        
        function mousePressed() {
          if (!gameOver) {
            score++;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "score", score: score }));
            
            if (score >= ${minigame.targetScore}) {
              gameOver = true;
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: "gameOver", score: score }));
            }
          }
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { backgroundColor: colors.surfaceDim, borderBottomColor: colors.outlineVariant }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{minigame.title}</Text>
        <Text style={[styles.score, { color: colors.primary }]}>Score: {score} / {minigame.targetScore}</Text>
      </View>

      <View style={[styles.gameContainer, { borderColor: colors.outlineVariant }]}>
        <WebView
          source={{ html: gameHtml }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          originWhitelist={["*"]}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Quit</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  score: {
    fontSize: 18,
    fontWeight: "600",
  },
  gameContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  webview: {
    flex: 1,
  },
  controls: {
    padding: 16,
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
