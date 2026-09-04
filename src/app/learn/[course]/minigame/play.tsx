import { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { WebView } from "react-native-webview";
import { loadMinigameForCourse } from "../../../../utils/courseLoader";
import { Minigame } from "../../../../data/types";
import { useThemeContext } from "../../../../components/ThemeProvider";
import { Colors } from "../../../../constants/Colors";
import { setHighScore } from "../../../../store/high-scores-store";

// Bounce 2D — Arkanoid-style: keep the ball in play, break colored bricks,
// and use the colored ball/paddle themes from the Color module. Reaching the
// target score clears the board; losing all lives ends the game.

function buildBounce2DHtml(targetScore: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <style>
    html, body { margin: 0; padding: 0; overflow: hidden; background: #0b1026; touch-action: none; }
    canvas { display: block; }
  </style>
</head>
<body>
<script>
  let score = 0;
  let lives = 3;
  let state = "serving"; // serving | playing | over | won
  let paddle, ball;      // {x,y,w,h} and {x,y,vx,vy,r}
  let bricks = [];
  const COLS = 8, ROWS = 4;
  const paddleSpeed = 8;
  const brickColors = [
    [236, 100, 75],  // warm brick
    [240, 160, 60], // amber
    [80, 190, 120], // green
    [70, 130, 210], // blue
  ];

  function resetBricks() {
    bricks = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        bricks.push({
          x: 20 + c * 46,
          y: 50 + r * 26,
          w: 42,
          h: 18,
          alive: true,
          color: brickColors[r % brickColors.length],
        });
      }
    }
  }

  function serve() {
    state = "serving";
    ball = { x: width / 2, y: 300, vx: 3, vy: -4, r: 10 };
  }

  function setup() {
    createCanvas(400, 400);
    paddle = { x: width / 2 - 40, y: 360, w: 80, h: 12 };
    resetBricks();
    serve();
  }

  function draw() {
    background(11, 16, 38);
    drawBricks();
    drawPaddle();
    drawBall();
    drawStatus();

    if (state === "serving") {
      serveHint();
      return;
    }
    if (state !== "playing") return;

    movePaddle();
    moveBall();

    // paddle collision
    if (
      ball.y + ball.r >= paddle.y &&
      ball.y + ball.r <= paddle.y + paddle.h &&
      ball.x >= paddle.x - ball.r &&
      ball.x <= paddle.x + paddle.w + ball.r &&
      ball.vy > 0
    ) {
      // reflect based on hit position for angle control
      let hit = (ball.x - paddle.x) / paddle.w - 0.5; // -0.5..0.5
      ball.vx = hit * 8;
      ball.vy = -abs(ball.vy);
    }

    // brick collision
    for (let b of bricks) {
      if (!b.alive) continue;
      if (
        ball.x + ball.r >= b.x && ball.x - ball.r <= b.x + b.w &&
        ball.y + ball.r >= b.y && ball.y - ball.r <= b.y + b.h
      ) {
        b.alive = false;
        ball.vy = -ball.vy;
        score++;
        postScore();
        if (score >= ${targetScore}) {
          state = "won";
          postGameOver();
          return;
        }
        break;
      }
    }

    // walls
    if (ball.x - ball.r < 0 || ball.x + ball.r > width) ball.vx = -ball.vx;
    if (ball.y - ball.r < 0) ball.vy = -ball.vy;

    // bottom — lost a life
    if (ball.y - ball.r > height) {
      lives--;
      if (lives <= 0) {
        state = "over";
        postGameOver();
      } else {
        serve();
      }
    }
  }

  function drawBricks() {
    for (let b of bricks) {
      if (!b.alive) continue;
      fill(b.color[0], b.color[1], b.color[2]);
      noStroke();
      rect(b.x, b.y, b.w, b.h, 4);
    }
  }

  function drawPaddle() {
    fill(255, 120, 170);
    noStroke();
    rect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
    fill(255, 255, 255, 60);
    rect(paddle.x + 6, paddle.y + 3, paddle.w - 12, 3, 3);
  }

  function drawBall() {
    // gradient ball — ties into the Color module theme
    for (let i = 0; i < ball.r; i++) {
      let t = i / ball.r;
      fill(lerpColor(color(90, 200, 255), color(255, 80, 150), t));
      circle(ball.x, ball.y, (ball.r - i) * 2);
    }
  }

  function movePaddle() {
    if (mouseIsPressed && mouseX > 0 && mouseX < width) {
      paddle.x = constrain(mouseX - paddle.w / 2, 0, width - paddle.w);
    }
  }

  function moveBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;
  }

  function drawStatus() {
    fill(255);
    noStroke();
    textSize(14);
    textAlign(LEFT);
    text("Score " + score, 12, 390);
    textAlign(RIGHT);
    text("Lives " + "●".repeat(max(lives, 0)), width - 12, 390);
  }

  function serveHint() {
    fill(255, 255, 255, 180);
    textSize(15);
    textAlign(CENTER);
    text("Hold + drag to move the paddle", width / 2, 200);
    text("Tap anywhere to launch the ball", width / 2, 222);
  }

  function touchStarted() {
    if (state === "serving") {
      state = "playing";
      ball.vx = random(2, 4) * (random() > 0.5 ? 1 : -1);
      ball.vy = -4;
    } else if (state === "over" || state === "won") {
      return false;
    }
    return false;
  }

  function postScore() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "score", score: score }));
    }
  }

  function postGameOver() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "gameOver", score: score, won: state === "won" }));
    }
  }
</script>
</body>
</html>
  `;
}

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

  const html = buildBounce2DHtml(minigame.targetScore);

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
