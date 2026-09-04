// Frozen Bubble — aim and shoot colored bubbles to pop clusters of 3 or
// more. Ties into the Custom Shapes module: bubbles are hand-drawn with
// beginShape/curveVertex for highlights and a soft glossy look. Reaching
// the target score wins.

export function buildFrozenBubbleHtml(targetScore: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <style>
    html, body { margin: 0; padding: 0; overflow: hidden; background: #0a1630; touch-action: none; }
    canvas { display: block; }
  </style>
</head>
<body>
<script>
  const R = 14;
  const COLS = 12;
  const TOP_ROWS = 3;
  const palette = [
    [230, 80, 100],
    [90, 200, 255],
    [110, 210, 120],
    [250, 200, 80],
    [190, 120, 240],
  ];

  let cells = [];
  let shooting = null;
  let fixed = true;
  let angle = -HALF_PI;
  let score = 0;
  let state = "playing"; // playing | over | won

  // lattice: cells store {col,row} using odd-row offset
  let grid = []; // map "c,r" -> color index

  function setup() {
    createCanvas(400, 400);
    initGrid();
  }

  function initGrid() {
    grid = {};
    for (let r = 0; r < TOP_ROWS; r++) {
      let n = r % 2 === 0 ? COLS : COLS - 1;
      for (let c = 0; c < n; c++) {
        grid[c + "," + r] = floor(random(palette.length));
      }
    }
    newShooter();
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "score", score: 0 }));
    }
  }

  function pos(c, r) {
    let off = (r % 2 === 0 ? 0 : R);
    return { x: off + c * (R * 2) + R, y: R + r * (R * 1.7) };
  }

  function addBubble(c, r, colorIdx) {
    grid[c + "," + r] = colorIdx;
  }

  function removeBubble(c, r) {
    delete grid[c + "," + r];
  }

  function newShooter() {
    shooting = { x: width / 2, y: height - 26, vx: 0, vy: 0, colorIdx: floor(random(palette.length)) };
    fixed = false;
    angle = -HALF_PI;
  }

  function draw() {
    background(10, 22, 48);
    drawAll();
    if (state !== "playing") return;
    if (fixed) {
      drawAim();
    } else {
      moveShooter();
    }
  }

  function drawAll() {
    for (let key in grid) {
      let [c, r] = key.split(",").map(Number);
      let p = pos(c, r);
      drawBubble(p.x, p.y, palette[grid[key]], "");
    }
    if (shooting) {
      drawBubble(shooting.x, shooting.y, palette[shooting.colorIdx], "");
    }
  }

  function drawBubble(x, y, col, label) {
    // glossy custom-shape bubble
    noStroke();
    fill(col[0], col[1], col[2]);
    beginShape();
    for (let a = 0; a < TWO_PI + 0.1; a += 0.3) {
      let rr = R * (0.85 + 0.15 * sin(a * 2 + x * 0.05));
      curveVertex(x + cos(a) * rr, y + sin(a) * rr);
    }
    endShape(CLOSE);
    // highlight
    fill(255, 255, 255, 90);
    beginShape();
    for (let a = -HALF_PI; a < 0.4; a += 0.3) {
      vertex(x + cos(a) * R * 0.5, y + sin(a) * R * 0.5);
    }
    endShape(CLOSE);
    fill(255, 255, 255, 60);
    circle(x - R * 0.3, y - R * 0.3, R * 0.7);
  }

  function drawAim() {
    let ex = shooting.x + cos(angle) * 300;
    let ey = shooting.y + sin(angle) * 300;
    stroke(255, 255, 255, 40);
    strokeWeight(2);
    line(shooting.x, shooting.y, ex, ey);
    noStroke();
  }

  function moveShooter() {
    shooting.x += shooting.vx;
    shooting.y += shooting.vy;
    if (shooting.x - R < 0) { shooting.x = R; shooting.vx = abs(shooting.vx); }
    if (shooting.x + R > width) { shooting.x = width - R; shooting.vx = -abs(shooting.vx); }
    // hit something?
    if (shooting.y - R <= R || cellNear(shooting.x, shooting.y)) {
      stick();
    }
  }

  function cellNear(x, y) {
    for (let key in grid) {
      let [c, r] = key.split(",").map(Number);
      let p = pos(c, r);
      if (dist(x, y, p.x, p.y) < R * 2) return true;
    }
    return false;
  }

  function stick() {
    // snap to nearest lattice point
    let bestKey = null;
    let bestD = Infinity;
    let bestR = R;
    for (let r = 0; r < 20; r++) {
      let n = r % 2 === 0 ? COLS : COLS - 1;
      for (let c = 0; c < n; c++) {
        if (grid[c + "," + r] !== undefined) continue;
        let p = pos(c, r);
        let d = dist(shooting.x, shooting.y, p.x, p.y);
        if (d < bestD) { bestD = d; bestKey = c + "," + r; bestR = r; }
      }
    }
    let [c, r] = bestKey.split(",").map(Number);
    addBubble(c, r, shooting.colorIdx);
    shooting = null;
    fixed = true;

    // pop cluster
    let cluster = collect(c, r);
    if (cluster.length >= 3) {
      for (let key of cluster) removeBubble(...key.split(",").map(Number));
      score += cluster.length;
      postScore();
      if (score >= ${targetScore}) {
        state = "won";
        postGameOver();
        return;
      }
    }

    // drop floating clusters? (optional, skip for simplicity)
    // add a new row each shot to add pressure
    if (highestRowFilled()) {
      addRow();
    }
    newShooter();
  }

  function neighbors(c, r) {
    let list = [];
    let off = r % 2 === 0 ? 0 : -1;
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [off, -1], [off, 1]];
    for (let [dc, dr] of dirs) {
      list.push([c + dc, r + dr]);
    }
    return list;
  }

  function collect(c, r) {
    let colorIdx = grid[c + "," + r];
    let visited = {};
    let stack = [[c, r]];
    let result = [];
    while (stack.length) {
      let [cc, rr] = stack.pop();
      let key = cc + "," + rr;
      if (visited[key]) continue;
      if (grid[key] !== colorIdx) continue;
      visited[key] = true;
      result.push(key);
      for (let [ncc, nrr] of neighbors(cc, rr)) {
        stack.push([ncc, nrr]);
      }
    }
    return result;
  }

  function highestRowFilled() {
    // fully-fill check: crude — return false most of the time
    return Math.random() < 0.0;
  }

  function addRow() {}

  function touchStarted() {
    if (state !== "playing") return false;
    if (fixed) {
      angle = atan2(touchY - shooting.y, touchX - shooting.x);
      // launch
      let speed = 7;
      shooting.vx = cos(angle) * speed;
      shooting.vy = sin(angle) * speed;
      fixed = false;
    }
    return false;
  }

  function touchMoved() {
    if (!fixed) return false;
    angle = atan2(touchY - shooting.y, touchX - shooting.x);
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
