import { P5_RUNTIME_SOURCE } from "./p5-runtime.generated";
import {
  p5RuntimeScript,
  polyfillScript,
  safeJson,
  errorCaptureScript,
  type RuntimeAssetUrls,
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
  colorScheme?: "light" | "dark",
  assets?: RuntimeAssetUrls | null
): string {
  const isDark = colorScheme === "dark";
  const bodyBg = isDark ? "#000000" : "#111111";
  const sketch = wrapSketch(stripDescribe(code ?? ""));
  const captureScript = errorCaptureScript();
  const p5Script = p5RuntimeScript({
    inlineSource: P5_RUNTIME_SOURCE,
    runtimeUrl: assets?.p5Url,
  });
  const polyfill = polyfillScript({ scriptUrl: assets?.polyfillUrl });
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
    var message = (err && (err.stack || err.message)) ? String(err.stack || err.message) :
      (err ? String(err) : null) ||
      (window.__getP5Error ? window.__getP5Error() : null) ||
      'Unknown error';
    container.innerHTML = '';
    var pre = document.createElement('pre');
    pre.id = 'error';
    pre.textContent = message;
    container.appendChild(pre);
  }

  var hookNames = ['preload','setup','draw','windowResized','mousePressed','mouseReleased','mouseClicked','mouseMoved','mouseDragged','mouseWheel','doubleClicked','keyPressed','keyReleased','keyTyped','touchStarted','touchMoved','touchEnded','deviceMoved','deviceTurned','deviceShaken'];

  function runUserSketch(code, instance) {
    var fields = [];
    for (var i = 0; i < hookNames.length; i++) {
      var name = hookNames[i];
      fields.push(JSON.stringify(name) + ':typeof ' + name + ' !== "undefined" ? ' + name + ' : undefined');
    }
    // Evaluate the sketch in a fresh scope, with the p5 instance exposed as
    // the unqualified API (background(), createCanvas(), ...). This keeps
    // global-style learner code working without binding the sketch to window.
    var factory = new Function(
      '__p5scope',
      'with (__p5scope) { return (function() {' + code + '\\n;return {' + fields.join(',') + '};})(); }'
    );
    var hooks = factory(instance);
    for (var key in hooks) {
      if (!Object.prototype.hasOwnProperty.call(hooks, key)) continue;
      if (typeof hooks[key] !== 'function') continue;
      instance[key] = hooks[key];
    }
  }

  function startSketch() {
    if (window.__clearP5Error) window.__clearP5Error();
    try {
      if (typeof window.p5 !== 'function') {
        showError(window.__p5Error || 'p5 is not available');
        return;
      }
      var inst = new window.p5(function(p) {
        runUserSketch(userCode, p);
      }, container);
      container.__p5 = inst || window.p5.instance || null;
      var canvas = container.__p5 && container.__p5.canvas;
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
