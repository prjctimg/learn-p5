import { getP5InlineSource, getP5ScriptUri } from "../../content/store";
import {
  p5RuntimeScript,
  P5_COMPAT_POLYFILL,
  P5_GLOBAL_FUNCTIONS,
  safeJson,
} from "./p5Html";

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

export function getFullscreenPreviewHtml(
  code: string,
  colorScheme?: "light" | "dark",
  options?: { deferP5Runtime?: boolean }
): string {
  const isDark = colorScheme === "dark";
  const bodyBg = isDark ? "#000000" : "#111111";
  const sketch = wrapSketch(stripDescribe(code ?? ""));
  const p5Script = options?.deferP5Runtime
    ? ""
    : p5RuntimeScript({ scriptUri: getP5ScriptUri(), inlineSource: getP5InlineSource() });
  const deferP5Runtime = options?.deferP5Runtime ?? false;
  const p5RuntimeLoader = deferP5Runtime
    ? `<script>
window.addEventListener('message', function(event) {
  try {
    var msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    if (!msg || msg.type !== 'p5Runtime' || typeof msg.source !== 'string') return;
    var script = document.createElement('script');
    script.textContent = msg.source;
    document.head.appendChild(script);
    window.dispatchEvent(new Event('p5RuntimeReady'));
  } catch (e) {
    window.dispatchEvent(new Event('p5RuntimeError'));
  }
});
</script>`
    : "";
  const userCode = safeJson(sketch);
  const globalFunctions = JSON.stringify(P5_GLOBAL_FUNCTIONS);

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
${P5_COMPAT_POLYFILL}
${p5Script}
${p5RuntimeLoader}
<script>
(function() {
  var userCode = ${userCode};
  var globalFunctions = ${globalFunctions};
  var container = document.getElementById('sketch');
  var started = false;

  function showError(message) {
    container.innerHTML = '';
    var error = document.createElement('div');
    error.id = 'error';
    error.textContent = message;
    container.appendChild(error);
  }

  function startSketch() {
    if (started) return;
    started = true;
    var P5 = window.p5;
    if (typeof P5 !== 'function') {
      showError('p5.js could not start on this device. Update Android System WebView (or iOS) and try again.');
      return;
    }

    try {
      var expose = '';
      for (var i = 0; i < globalFunctions.length; i++) {
        var name = globalFunctions[i];
        expose += 'if (typeof ' + name + ' === "function") window.' + name + ' = ' + name + ';\\n';
      }
      var runUserCode = new Function('p5', userCode + '\\n' + expose);
      runUserCode.call(window, P5);
      container.__p5 = new P5(undefined, container);
    } catch (e) {
      showError((e && e.message) ? e.message : String(e));
    }
  }

  if (typeof window.p5 === 'function') {
    startSketch();
  } else {
    window.addEventListener('p5RuntimeReady', startSketch);
  }
})();
</script>
</body>
</html>`;
}
