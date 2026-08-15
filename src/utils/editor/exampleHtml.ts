import { p5Source } from "../p5Source";
import { Colors } from "../../constants/Colors";
import {
  JETBRAINS_MONO_REGULAR_BASE64,
  JETBRAINS_MONO_BOLD_BASE64,
} from "../../constants/fontBase64.generated";

export function getExampleHtml(code: string, colorScheme?: "light" | "dark"): string {
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const needsWrap = !code.includes("function setup");

  let sketch = code;
  if (needsWrap) {
    sketch = `function setup() {\n  createCanvas(400, 400);\n${code.split("\n").map((l) => "  " + l).join("\n")}\n}`;
  } else {
    sketch = code.replace(
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
