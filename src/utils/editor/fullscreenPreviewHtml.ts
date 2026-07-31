import { p5Source } from "../p5Source";

function stripDescribe(code: string): string {
  return code
    .replace(/describe\s*\(\s*(["'])((?:(?!\1).)*)\1\s*\)\s*;?\s*/g, "")
    .trim();
}

function wrapSketch(code: string): string {
  const hasSetup = /function\s+setup\s*\(/.test(code);
  if (!hasSetup) {
    return `function setup() {\n${code.split("\n").map((l) => "  " + l).join("\n")}\n}`;
  }
  return code;
}

export function getFullscreenPreviewHtml(code: string, colorScheme?: "light" | "dark"): string {
  const isDark = colorScheme === "dark";
  const bodyBg = isDark ? "#000000" : "#111111";
  const sketch = wrapSketch(stripDescribe(code ?? ""));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%;
    height: 100%;
    background: ${bodyBg};
    overflow: hidden;
  }
  #sketch {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #sketch canvas { display: block; }
  #error {
    color: #FF5252;
    font-family: monospace;
    font-size: 14px;
    padding: 24px;
    text-align: center;
    white-space: pre-wrap;
  }
</style>
</head>
<body>
<div id="sketch"></div>
<script>${p5Source.replace(/<\/script>/gi, "<\\/script>")}</script>
<script>
(function() {
  var userCode = ${JSON.stringify(sketch)};
  var script = document.createElement('script');
  script.textContent = userCode;
  document.body.appendChild(script);
  var container = document.getElementById('sketch');
  try {
    container.__p5 = new p5(undefined, container);
  } catch (e) {
    container.innerHTML = '<div id="error">' + ((e && e.message) ? e.message : String(e)) + '</div>';
  }
})();
</script>
</body>
</html>`;
}
