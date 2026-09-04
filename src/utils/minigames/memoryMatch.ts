// Memory Match — flip cards to find matching pairs. Ties into the Image
// module: each card's face is a tiny procedural pixel-art image rendered
// with beginShape/rect cells. Match every pair to clear the grid; reaching
// the target score (number of pairs) wins.

export function buildMemoryMatchHtml(targetScore: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <style>
    html, body { margin: 0; padding: 0; overflow: hidden; background: #101322; touch-action: none; }
    canvas { display: block; }
  </style>
</head>
<body>
<script>
  // pixel-art sprites (each is a 6x6 grid with 2D-array bitmaps)
  const sprites = [
    [ // heart
      [0,0,1,1,0,0, 0,1,1,1,1,0, 1,1,1,1,1,1, 1,1,1,1,1,1, 0,1,1,1,1,0, 0,0,1,1,0,0],
      [240,90,110],
    ],
    [ // star
      [0,0,0,1,0,0, 0,0,1,1,1,0, 0,1,1,1,1,1, 1,1,1,1,1,1, 0,1,0,0,1,0, 1,1,1,0,1,1],
      [250,200,80],
    ],
    [ // diamond
      [0,0,0,1,0,0, 0,0,1,1,1,0, 0,1,1,1,1,1, 1,1,1,1,1,1, 0,1,1,1,1,0, 0,0,1,1,0,0],
      [90,200,255],
    ],
    [ // tree
      [0,0,0,0,0,0, 0,1,1,1,1,0, 0,1,1,1,1,0, 1,1,1,1,1,1, 0,1,1,1,1,0, 0,1,1,1,1,0],
      [80,210,120],
    ],
    [ // berry
      [1,1,0,0,0,0, 1,1,1,0,0,0, 0,1,1,1,1,1, 0,1,1,1,1,1, 0,1,1,1,1,0, 0,0,1,1,0,0],
      [180,110,240],
    ],
    [ // sun
      [1,0,1,0,1,0, 0,1,1,1,1,0, 1,1,1,1,1,1, 1,1,1,1,1,1, 0,1,1,1,1,0, 1,0,1,0,1,0],
      [255,150,70],
    ],
    [ // wave
      [1,1,0,0,0,0, 0,0,1,1,0,0, 0,0,0,0,1,1, 1,1,1,0,0,0, 0,0,0,0,1,1, 0,0,1,1,0,0],
      [80,180,240],
    ],
    [ // zap
      [0,0,0,1,0,0, 0,0,1,1,0,0, 0,0,1,1,0,0, 0,1,1,1,1,1, 0,1,1,0,0,0, 1,1,0,0,0,0],
      [250,220,80],
    ],
  ];

  let cards = [];
  let first = null;
  let second = null;
  let matches = 0;
  let state = "playing"; // playing | over | won
  let lock = false;

  const COLS = 4, ROWS = 4;
  const CW = 86, CH = 86;

  function setup() {
    createCanvas(400, 400);
    buildDeck();
  }

  function buildDeck() {
    cards = [];
    let pairs = [];
    let n = min(8, ${targetScore});
    for (let i = 0; i < n; i++) {
      pairs.push(i);
      pairs.push(i);
    }
    // shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      let j = floor(random(i + 1));
      let t = pairs[i];
      pairs[i] = pairs[j];
      pairs[j] = t;
    }
    for (let i = 0; i < pairs.length; i++) {
      let px = i % COLS;
      let py = floor(i / COLS);
      cards.push({ x: px * CW + 16, y: py * CH + 16, sprite: pairs[i], faceUp: false, matched: false });
    }
  }

  function draw() {
    background(16, 19, 34);
    drawCards();
    drawStatus();

    if (state !== "playing") {
      drawEnd();
    }
  }

  function drawCards() {
    for (let c of cards) {
      rectMode(CORNER);
      if (c.matched || c.faceUp) {
        // draw sprite face
        noStroke();
        fill(40, 48, 80);
        rect(c.x, c.y, CW, CH, 8);
        drawSprite(c.x + 12, c.y + 12, c.sprite);
      } else {
        fill(70, 90, 150);
        noStroke();
        rect(c.x, c.y, CW, CH, 8);
        // back pattern "?"
        fill(255, 255, 255, 200);
        textSize(30);
        textAlign(CENTER, CENTER);
        text("?", c.x + CW / 2, c.y + CH / 2 + 2);
      }
      if (c.matched) {
        stroke(120, 220, 160);
        strokeWeight(3);
        noFill();
        rect(c.x, c.y, CW, CH, 8);
      }
    }
  }

  function drawSprite(x, y, id) {
    let s = sprites[id];
    let bits = s[0];
    let col = s[1];
    let cell = 10;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (bits[r * 6 + c]) {
          fill(col[0], col[1], col[2]);
          noStroke();
          rect(x + c * cell, y + r * cell, cell - 1, cell - 1);
        }
      }
    }
  }

  function drawStatus() {
    fill(255);
    noStroke();
    textSize(14);
    textAlign(LEFT);
    text("Pairs: " + matches + " / " + ${targetScore}, 16, 388);
  }

  function drawEnd() {
    noStroke();
    fill(255, 255, 255, 200);
    textSize(22);
    textAlign(CENTER, CENTER);
    if (state === "won") {
      text("You win!", width / 2, height / 2 - 10);
      text("Paired " + matches + " sets", width / 2, height / 2 + 18);
    } else {
      text("Game Over", width / 2, height / 2);
    }
  }

  function cardAt(mx, my) {
    for (let c of cards) {
      if (mx > c.x && mx < c.x + CW && my > c.y && my < c.y + CH) {
        return c;
      }
    }
    return null;
  }

  function flip(c) {
    if (lock || c.faceUp || c.matched) return;
    c.faceUp = true;
    if (first === null) {
      first = c;
      return;
    }
    second = c;
    lock = true;
    setTimeout(() => {
      if (first.sprite === second.sprite) {
        first.matched = true;
        second.matched = true;
        matches++;
        postScore();
        if (matches >= ${targetScore}) {
          state = "won";
          postGameOver();
        }
      } else {
        first.faceUp = false;
        second.faceUp = false;
      }
      first = null;
      second = null;
      lock = false;
    }, 600);
  }

  function touchEnded() {
    if (state !== "playing") return false;
    let c = cardAt(touchX, touchY);
    if (c) flip(c);
    return false;
  }

  function postScore() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "score", score: matches }));
    }
  }

  function postGameOver() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "gameOver", score: matches, won: state === "won" }));
    }
  }
</script>
</body>
</html>
  `;
}
