import { P5_RUNTIME_SOURCE } from "./p5-runtime.generated";
import { stripDescribe } from "../describe";
import type { ColorScheme } from "../../constants/Colors";
import {
  p5RuntimeScript,
  polyfillScript,
  safeJson,
  type RuntimeAssetUrls,
} from "./p5Html";

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
  colorScheme?: ColorScheme,
  assets?: RuntimeAssetUrls | null
): string {
  const isDark = colorScheme === "dark";
  const bodyBg = isDark ? "#000000" : "#111111";
  const sketch = wrapSketch(stripDescribe(code ?? ""));
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
</style>
</head>
<body>
<div id="sketch"></div>
${polyfill}
${p5Script}
<script>
(function() {
  var userCode = ${userCode};
  var container = document.getElementById('sketch');

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
    try {
      if (typeof window.p5 !== 'function') {
        console.error('p5 is not available');
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
      console.error('Preview render error:', e);
    }
  }

  startSketch();
})();
</script>
</body>
</html>`;
}
