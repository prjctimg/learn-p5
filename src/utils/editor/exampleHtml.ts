import { getP5Assets } from "../../content/store";
import { P5_RUNTIME_SOURCE } from "./p5-runtime.generated";
import { Colors, type ColorScheme } from "../../constants/Colors";
import {
  escapeScriptContent,
  p5RuntimeScript,
  polyfillScript,
  type RuntimeAssetUrls,
} from "./p5Html";
import { fontFaceCss } from "./fontFace";

// Placeholders inserted by the content repo's generate-reference.mjs look like
// __P5_ASSET__<basename>__P5_ASSET__. At render time we swap them for the
// real data: URI from the asset map, so the p5.js load*() calls inside the
// example WebView resolve to bundled base64 blobs (offline-safe, no CORS).
const ASSET_PLACEHOLDER_RE = /__P5_ASSET__([^'"\\\s)]+?)__P5_ASSET__/g;

function substituteAssetPlaceholders(code: string): string {
  if (!code.includes("__P5_ASSET__")) return code;
  const p5Assets = getP5Assets();
  return code.replace(ASSET_PLACEHOLDER_RE, (full, name) => {
    const uri = p5Assets[`__P5_ASSET__${name}__P5_ASSET__`];
    if (uri) return uri;
    // Leave placeholders in place if assets aren't available yet; the
    // content pack should provide them and the app gates on load.
    return full;
  });
}

export function getExampleHtml(
  code: string,
  colorScheme?: ColorScheme,
  assets?: RuntimeAssetUrls | null
): string {
  const colors = Colors[colorScheme ?? "light"];
  const resolved = substituteAssetPlaceholders(code);
  const needsWrap = !resolved.includes("function setup");

  let sketch = resolved;
  if (needsWrap) {
    sketch = `function setup() {\n  createCanvas(400, 400);\n${resolved.split("\n").map((l) => "  " + l).join("\n")}\n}`;
  } else {
    sketch = sketch.replace(
      /createCanvas\s*\(\s*\d+\s*,\s*\d+\s*\)/g,
      "createCanvas(400, 400)"
    );
  }

  const p5Script = p5RuntimeScript({
    inlineSource: P5_RUNTIME_SOURCE,
    runtimeUrl: assets?.p5Url,
  });
  const polyfill = polyfillScript({ scriptUrl: assets?.polyfillUrl });
  const fontFaces = fontFaceCss({
    regularUrl: assets?.fontRegularUrl,
    boldUrl: assets?.fontBoldUrl,
  });
  const safeSketch = escapeScriptContent(sketch);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
${fontFaces}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: ${colors.surface}; display: flex; align-items: center; justify-content: center; min-height: 220px; font-family: "JetBrains Mono", monospace; }
canvas { display: block; max-width: 100%; height: auto; }
</style>
</head>
<body>
${polyfill}
${p5Script}
<script>${safeSketch}<\/script>
</body>
</html>`;
}
