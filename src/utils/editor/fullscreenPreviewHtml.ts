import { P5_RUNTIME_SOURCE } from "./p5-runtime.generated";
import {
  p5RuntimeScript,
  polyfillScript,
  safeJson,
  errorCaptureScript,
} from "./p5Html";

function stripDescribe(code: string): string {
  return code
    .replace(/describe\s*\(\s*(["'])((?:(?!\1).)*)\1\s*\)\s*;?\s*/g, "")
    .trim();
}

function wrapSketch(code: string): string {
  const hasSetup = /function\s+setup\s*\(/.test(code);
  if (!hasSetup) {
    return `function setup() {\n${code
      .split("\n")
      .map((l) => "  " + l)
      .join("\n")}\n}`;
  }
  return code;
}

export function getFullscreenPreviewHtml(
  code: string,
  colorScheme?: "light" | "dark"
): string {
  const isDark = colorScheme === "dark";
  const bodyBg = isDark ? "#000000" : "#111111";
  const sketch = wrapSketch(stripDescribe(code ?? ""));
  const captureScript = errorCaptureScript();
  const p5Script = p5RuntimeScript({ inlineSource: P5_RUNTIME_SOURCE });
  const polyfill = polyfillScript();
  const userCode = safeJson(sketch);

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
    text-align: left;
    white-space: pre-wrap;
    width: 100%;
    max-height: 100%;
    overflow: auto;
  }
</style>
</head>
<body>
<div id="sketch"></div>
${captureScript}
${polyfill}
${p5Script}
<script>
(function() {
  var userCode = ${userCode};
  var container = document.getElementById('sketch');

  function showError(err) {
    var message = (window.__getP5Error ? window.__getP5Error() : null) ||
      (err && (err.stack || err.message)) || String(err) || 'Unknown error';
    container.innerHTML = '';
    var pre = document.createElement('pre');
    pre.id = 'error';
    pre.textContent = message;
    container.appendChild(pre);
  }

  function startSketch() {
    try {
      if (typeof window.p5 !== 'function') {
        showError(window.__p5Error || 'p5 is not available');
        return;
      }
      var hookNames = ['preload','setup','draw','remove','windowResized','mousePressed','mouseReleased','mouseClicked','mouseMoved','mouseDragged','mouseWheel','doubleClicked','keyPressed','keyReleased','keyTyped','touchStarted','touchMoved','touchEnded','deviceMoved','deviceTurned','deviceShaken'];
      for (var i = 0; i < hookNames.length; i++) {
        try { delete window[hookNames[i]]; } catch (ignored) {}
      }
      (0, eval)(userCode);
      var inst = new window.p5();
      container.__p5 = inst || window.p5.instance || null;
      var canvas = container.__p5 && container.__p5.canvas ? container.__p5.canvas : document.querySelector('canvas');
      if (canvas && canvas.parentNode !== container) {
        container.appendChild(canvas);
      }
    } catch (e) {
      if (window.__setP5Error) window.__setP5Error(e);
      showError(e);
    }
  }

  startSketch();
})();
</script>
</body>
</html>`;
}
