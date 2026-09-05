// Snake Classic — move the snake over a grid to collect food and grow.
// Ties into the Shapes module: everything is built from basic primitive
// shapes with stroke enabled (the snake is a connected chain of rounded
// squares, the food is a circle). Reaching the target score wins.

export function buildSnakeClassicHtml(targetScore: number): string {
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
  const CELL = 20;
  const COLS = 20;
  const ROWS = 20;
  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 8, y: 8 };
  let score = 0;
  let state = "playing"; // playing | over | won
  let step = 0;

  function setup() {
    createCanvas(COLS * CELL, ROWS * CELL);
    snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
    placeFood();
    frameRate(10);
  }

  function placeFood() {
    let p;
    do {
      p = { x: floor(random(COLS)), y: floor(random(ROWS)) };
    } while (snake.some((s) => s.x === p.x && s.y === p.y));
    food = p;
  }

  function draw() {
    background(11, 16, 38);
    drawGrid();
    drawFood();
    drawSnake();

    if (state !== "playing") {
      drawEnd();
      return;
    }

    step++;
    if (step % 2 === 0) {
      moveSnake();
    }
  }

  function moveSnake() {
    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      end("over");
      return;
    }

    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        end("over");
        return;
      }
    }

    const ate = head.x === food.x && head.y === food.y;
    snake.unshift(head);
    if (ate) {
      score++;
      postScore();
      if (score >= ${targetScore}) {
        end("won");
        return;
      }
      placeFood();
    } else {
      snake.pop();
    }
  }

  function end(s) {
    state = s;
    postGameOver();
  }

  function drawGrid() {
    stroke(30, 40, 70);
    strokeWeight(1);
    for (let x = 0; x <= COLS; x++) {
      line(x * CELL, 0, x * CELL, height);
    }
    for (let y = 0; y <= ROWS; y++) {
      line(0, y * CELL, width, y * CELL);
    }
  }

  function drawFood() {
    // pulsing food circle using stroke + fill
    let r = CELL / 2 + sin(millis() / 150) * 2;
    noStroke();
    fill(240, 90, 80);
    circle(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, r * 2);
    fill(255, 255, 255, 60);
    circle(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, r);
  }

  function drawSnake() {
    stroke(30, 40, 70);
    strokeWeight(2);
    for (let i = 0; i < snake.length; i++) {
      let t = i / max(snake.length - 1, 1);
      fill(lerpColor(color(70, 220, 120), color(50, 150, 90), t));
      let s = snake[i];
      rect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 6);
    }
  }

  function drawEnd() {
    noStroke();
    fill(255, 255, 255, 200);
    textSize(22);
    textAlign(CENTER, CENTER);
    if (state === "won") {
      text("You win! Score: " + score, width / 2, height / 2 - 10);
    } else {
      text("Game Over", width / 2, height / 2 - 20);
      text("Score: " + score, width / 2, height / 2 + 8);
    }
    fill(255, 255, 255, 140);
    textSize(13);
    text("Swipe (or arrows) to steer", width / 2, height / 2 + 40);
  }

  function keyPressed() {
    if (keyCode === UP_ARROW && dir.y !== 1) nextDir = { x: 0, y: -1 };
    else if (keyCode === DOWN_ARROW && dir.y !== -1) nextDir = { x: 0, y: 1 };
    else if (keyCode === LEFT_ARROW && dir.x !== 1) nextDir = { x: -1, y: 0 };
    else if (keyCode === RIGHT_ARROW && dir.x !== -1) nextDir = { x: 1, y: 0 };
    return false;
  }

  // touch swipe handling
  let touchStart = null;
  function touchStarted() {
    touchStart = { x: touchX, y: touchY };
    return false;
  }

  function touchEnded() {
    if (!touchStart) return false;
    let dx = touchX - touchStart.x;
    let dy = touchY - touchStart.y;
    touchStart = null;
    if (abs(dx) < 12 && abs(dy) < 12) return false;
    if (abs(dx) > abs(dy)) {
      if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 };
      else if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 };
    } else {
      if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 };
      else if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 };
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
