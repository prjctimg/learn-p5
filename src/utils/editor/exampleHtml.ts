import { p5Source } from "../p5Source";
import { Colors } from "../../constants/Colors";
import {
  JETBRAINS_MONO_REGULAR_BASE64,
  JETBRAINS_MONO_BOLD_BASE64,
} from "../../constants/fontBase64.generated";
import p5Assets from "../../data/p5Assets.generated.json";

// Placeholders inserted by scripts/generate-reference.mjs look like
// __P5_ASSET__<basename>__P5_ASSET__. At render time we swap them for the
// real data: URI from the asset map, so the p5.js load*() calls inside the
// example WebView resolve to bundled base64 blobs (offline-safe, no CORS).
const ASSET_PLACEHOLDER_RE = /__P5_ASSET__([^'"\\\s)]+?)__P5_ASSET__/g;

function substituteAssetPlaceholders(code: string): string {
  if (!code.includes("__P5_ASSET__")) return code;
  return code.replace(ASSET_PLACEHOLDER_RE, (full, name) => {
    const uri = (p5Assets as Record<string, string>)[`__P5_ASSET__${name}__P5_ASSET__`];
    return uri ?? full;
  });
}

export function getExampleHtml(code: string, colorScheme?: "light" | "dark"): string {
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
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

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  src: url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_MONO_REGULAR_BASE64}) format('truetype');
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 700;
  src: url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_MONO_BOLD_BASE64}) format('truetype');
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: ${colors.surface}; display: flex; align-items: center; justify-content: center; min-height: 220px; font-family: "JetBrains Mono", monospace; }
canvas { display: block; max-width: 100%; height: auto; }
</style>
</head>
<body>
<script>${p5Source}<\/script>
<script>${sketch}<\/script>
</body>
</html>`;
}
