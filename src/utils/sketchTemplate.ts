import { p5Source } from "./p5Source";

export function buildSketchHTML(code: string): string {
  const safeCode = code.replace(/<\/script>/gi, '<\\/script>');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #0D0E12; display: flex; align-items: center; justify-content: center; }
  canvas { display: block; }
</style>
</head>
<body>
<script>${p5Source}<\/script>
<script>${safeCode}<\/script>
</body>
</html>`;
}

export const DEFAULT_SKETCH = `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(20);
  fill(255, 178, 187);
  circle(200, 200, 50);
}`;
