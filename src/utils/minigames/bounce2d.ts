// Bounce 2D — Arkanoid-style: keep the ball in play, break colored bricks,
// and use the colored ball/paddle themes from the Color module. Reaching the
// target score clears the board; losing all lives ends the game.

export function buildBounce2DHtml(targetScore: number): string {
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
