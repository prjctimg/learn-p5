// Space Impact — pilot a ship using translate/rotate and dodge falling
// meteors while shooting attackers. Ties into the Transform module: the
// ship and projectiles are drawn in their own translated/rotated coordinate
// frames. Destroying meteors adds score; reaching the target score wins.

export function buildSpaceImpactHtml(targetScore: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <style>
    html, body { margin: 0; padding: 0; overflow: hidden; background: #05070f; touch-action: none; }
    canvas { display: block; }
  </style>
</head>
<body>
<script>
  let ship = { x: 200, y: 340, w: 36, h: 44 };
  let bullets = [];
  let meteors = [];
  let stars = [];
  let score = 0;
  let lives = 3;
  let state = "playing"; // playing | over | won
  let lastShot = 0;
  let nextMeteor = 30;

  function setup() {
    createCanvas(400, 400);
    for (let i = 0; i < 80; i++) {
      stars.push({ x: random(width), y: random(height), s: random(1, 3) });
    }
  }

  function draw() {
    background(5, 7, 15);
    drawStars();
    updateAndDrawMeteors();
    drawShip();
    updateAndDrawBullets();

    if (state !== "playing") {
      drawEnd();
      return;
    }

    // move ship with touch drag
    ship.x = constrain(ship.x, 20, width - 20);
    ship.y = constrain(ship.y, 240, height - 20);

    if (frameCount - lastShot > 12) {
      fire();
    }
  }

  function fire() {
    lastShot = frameCount;
    bullets.push({ x: ship.x, y: ship.y - 26, vx: 0, vy: -7, active: true });
  }

  function drawShip() {
    push();
    translate(ship.x, ship.y);
    rotate(-HALF_PI);
    // ship body drawn in local rotated frame
    noStroke();
    fill(110, 200, 255);
    beginShape();
    vertex(0, -18);
    vertex(12, 12);
    vertex(0, 6);
    vertex(-12, 12);
    endShape(CLOSE);
    fill(255, 120, 170);
    triangle(0, 2, -6, 12, 6, 12);
    fill(255, 255, 255, 90);
    triangle(0, -12, -4, 0, 4, 0);
    pop();
  }

  function drawStars() {
    for (let s of stars) {
      s.y += s.s * 0.6;
      if (s.y > height) {
        s.y = 0;
        s.x = random(width);
      }
      fill(255, 255, 255, s.s * 60);
      noStroke();
      circle(s.x, s.y, s.s * 2);
    }
  }

  function updateAndDrawMeteors() {
    if (state === "playing") {
      nextMeteor--;
      if (nextMeteor <= 0) {
        nextMeteor = floor(random(24, 42));
        meteors.push({
          x: random(20, width - 20),
          y: -20,
          r: random(12, 22),
          vy: random(1.5, 3),
          vx: random(-0.6, 0.6),
          active: true,
        });
      }
      for (let m of meteors) {
        m.y += m.vy;
        m.x += m.vx;
        if (m.y - m.r > height) m.active = false;
      }
      meteors = meteors.filter((m) => m.active);
    }

    for (let m of meteors) {
      noStroke();
      fill(150, 90, 70);
      beginShape();
      for (let a = 0; a < TWO_PI; a += 0.4) {
        let rr = m.r * (0.7 + 0.3 * noise(m.x * 0.05, m.y * 0.05, a));
        vertex(m.x + cos(a) * rr, m.y + sin(a) * rr);
      }
      endShape(CLOSE);

      // collision with ship
      if (state === "playing") {
        let d = dist(m.x, m.y, ship.x, ship.y);
        if (d < m.r + 12) {
          m.active = false;
          lives--;
          if (lives <= 0) {
            state = "over";
            postGameOver();
          }
          return;
        }
      }
    }
    meteors = meteors.filter((m) => m.active);
  }

  function updateAndDrawBullets() {
    for (let b of bullets) {
      b.x += b.vx;
      b.y += b.vy;
      b.active = b.y > -20 && b.y < height && b.x > -10 && b.x < width + 10;
    }

    for (let b of bullets) {
      if (!b.active) continue;
      push();
      translate(b.x, b.y);
      rotate(frameCount * 0.2);
      fill(120, 230, 160);
      noStroke();
      triangle(-3, 5, 3, 5, 0, -8);
      pop();

      for (let m of meteors) {
        if (!m.active) continue;
        if (dist(b.x, b.y, m.x, m.y) < m.r + 4) {
          m.active = false;
          b.active = false;
          score++;
          postScore();
          if (score >= ${targetScore}) {
            state = "won";
            postGameOver();
          }
          break;
        }
      }
    }

    bullets = bullets.filter((b) => b.active);
    meteors = meteors.filter((m) => m.active);
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
    text("Drag to move \u2014 auto-fire", width / 2, height / 2 + 40);
  }

  function touchMoved() {
    if (state !== "playing") return false;
    ship.x = touchX;
    ship.y = constrain(touchY, 240, height - 20);
    return false;
  }

  function touchEnded() {
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
