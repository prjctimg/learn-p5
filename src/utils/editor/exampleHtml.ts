export function getExampleHtml(code: string): string {
  const escaped = code.replace(/<\/script>/gi, "<\\/script>");
  const needsWrap = !code.includes("function setup");
  const sketch = needsWrap ? `function setup() {\n  createCanvas(400, 400);\n${code.split("\n").map((l) => "  " + l).join("\n")}\n}` : code;

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #fff; display: flex; align-items: center; justify-content: center; min-height: 220px; }
canvas { display: block; max-width: 100%; height: auto; }
</style>
</head>
<body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js"><\/script>
<script>${sketch}<\/script>
</body>
</html>`;
}
