// Breakout — arcade paddle game with curved visuals. Ties into the Curves
// module: the paddle is a beveled/rounded shape and the ball leaves a sine
// trail. Drag the paddle to keep the ball aloft and break bricks to score.
// Reaching the target score wins.

export function buildBreakoutHtml(targetScore: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <style>
    html, body { margin: 0; padding: 0; overflow: hidden; background: #170a20; touch-action: none; }
    canvas { display: block; }
  </style>
</head>
<body>
<script>
  let ball, paddle;
  let bricks = [];
  let score = 0;
  let lives = 3;
  let state = "serving"; // serving | playing | over | won
  let trail = [];
  const COLS = 8, ROWS = 4;
  const brickColors = [
    [230, 120, 220],
    [120, 160, 255],
    [80, 220, 180],
    [250, 180, 90],
  ];

  function setup() {
    createCanvas(400, 400);
    paddle = { x: width / 2 - 42, y: 356, w: 84, h: 14 };
    resetBricks();
    serve();
  }

  function resetBricks() {
    bricks = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        bricks.push({
          x: 22 + c * 46,
          y: 46 + r * 28,
          w: 42,
          h: 20,
          alive: true,
          hp: r < 2 ? 2 : 1,
          color: brickColors[r % brickColors.length],
        });
      }
    }
  }

  function serve() {
    state = "serving";
    ball = { x: width / 2, y: 300, vx: 3, vy: -4, r: 9 };
  }

  function draw() {
    background(23, 10, 32);
    drawBricks();
    drawPaddle();
    drawBall();

    if (state === "serving") {
      serveHint();
      return;
    }
    if (state !== "playing") {
      drawEnd();
      return;
    }

    movePaddle();
    moveBall();

    // paddle collision (curved hit for angle)
    if (
      ball.y + ball.r >= paddle.y &&
      ball.y + ball.r <= paddle.y + paddle.h &&
      ball.x >= paddle.x - ball.r &&
      ball.x <= paddle.x + paddle.w + ball.r &&
      ball.vy > 0
    ) {
      let hit = constrain((ball.x - paddle.x) / paddle.w - 0.5, -0.6, 0.6);
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
        b.hp--;
        ball.vy = -ball.vy;
        if (b.hp <= 0) {
          b.alive = false;
          score++;
          postScore();
          if (score >= ${targetScore}) {
            state = "won";
            postGameOver();
            return;
          }
        }
        break;
      }
    }

    // walls
    if (ball.x - ball.r < 0 || ball.x + ball.r > width) ball.vx = -ball.vx;
    if (ball.y - ball.r < 0) ball.vy = -ball.vy;

    // bottom
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

  function movePaddle() {
    if (mouseIsPressed && mouseX > 0 && mouseX < width) {
      paddle.x = constrain(mouseX - paddle.w / 2, 0, width - paddle.w);
    }
  }

  function moveBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;
    trail.push({ x: ball.x, y: ball.y });
    if (trail.length > 14) trail.shift();
  }

  function drawBricks() {
    for (let b of bricks) {
      if (!b.alive) continue;
      let c = b.color;
      // curve the top face for an "ice-cream arcade" look
      noStroke();
      fill(c[0], c[1], c[2]);
      rect(b.x, b.y, b.w, b.h, 8);
      fill(255, 255, 255, 70);
      arc(b.x + b.w / 2, b.y + b.h / 2, b.w * 0.6, b.h * 0.6, PI, TWO_PI);
      if (b.hp > 1) {
        stroke(255, 255, 255, 120);
        strokeWeight(2);
        noFill();
        ellipse(b.x + b.w / 2, b.y + b.h / 2, 10, 10);
      }
    }
  }

  function drawPaddle() {
    // rounded curved paddle
    fill(250, 200, 90);
    noStroke();
    arc(paddle.x + paddle.w / 2, paddle.y + paddle.h, paddle.w, paddle.h * 2, PI, TWO_PI);
    fill(120, 220, 255);
    rect(paddle.x + 4, paddle.y, paddle.w - 8, paddle.h, 6);
  }

  function drawBall() {
    // sine curve trail ties into curves theme
    stroke(255, 120, 170, 90);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let i = 0; i < trail.length; i++) {
      let t = trail[i];
      let wiggle = sin(i * 0.6) * 3;
      vertex(t.x, t.y + wiggle);
    }
    endShape();

    noStroke();
    for (let i = 0; i < ball.r; i++) {
      let t = i / ball.r;
      fill(lerpColor(color(120, 220, 255), color(250, 120, 200), t));
      circle(ball.x, ball.y, (ball.r - i) * 2);
    }
  }

  function drawEnd() {
    fill(255, 255, 255, 200);
    noStroke();
    textSize(22);
    textAlign(CENTER, CENTER);
    if (state === "won") {
      text("You win! Score: " + score, width / 2, height / 2 - 10);
    } else {
      text("Game Over", width / 2, height / 2 - 20);
      text("Score: " + score, width / 2, height / 2 + 8);
    }
  }

  function serveHint() {
    fill(255, 255, 255, 180);
    noStroke();
    textSize(15);
    textAlign(CENTER, CENTER);
    text("Drag the paddle", width / 2, 190);
    text("Tap to launch", width / 2, 214);
  }

  function touchStarted() {
    if (state === "serving") {
      state = "playing";
      ball.vx = random(2, 4) * (random() > 0.5 ? 1 : -1);
      ball.vy = -4;
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
