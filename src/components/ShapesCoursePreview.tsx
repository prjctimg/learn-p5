import { useEffect, useMemo, useState } from "react";
import { InteractionManager, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { ACCENT_COLOR_HEX } from "../constants/AccentColors";
import { Colors, type ColorScheme } from "../constants/Colors";
import { useRuntimeAssets } from "../hooks/useRuntimeAssets";
import { fontFaceCss } from "../utils/editor/fontFace";
import { escapeScriptContent, p5RuntimeScript, polyfillScript } from "../utils/editor/p5Html";
import { P5_RUNTIME_SOURCE } from "../utils/editor/p5-runtime.generated";

interface ShapesCoursePreviewProps {
  colorScheme: ColorScheme;
  accentColor: string;
  height?: number;
}

function buildShapesPreviewHtml(
  colorScheme: ColorScheme,
  accentColor: string,
  urls: {
    baseUrl?: string | null;
    p5Url?: string | null;
    polyfillUrl?: string | null;
    fontRegularUrl?: string | null;
    fontBoldUrl?: string | null;
  } | null
): string {
  const colors = Colors[colorScheme];
  const palette = Array.from(new Set([accentColor, ...ACCENT_COLOR_HEX]));
  const safePalette = escapeScriptContent(JSON.stringify(palette));
  const safeBg = escapeScriptContent(JSON.stringify(colors.surfaceDim));
  const p5Script = p5RuntimeScript({ inlineSource: P5_RUNTIME_SOURCE, runtimeUrl: urls?.p5Url });
  const polyfill = polyfillScript({ scriptUrl: urls?.polyfillUrl });
  const fontFaces = fontFaceCss({ regularUrl: urls?.fontRegularUrl, boldUrl: urls?.fontBoldUrl });

  const sketch = `
const PALETTE = ${safePalette};
const BG = ${safeBg};
let t = 0;
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  noStroke();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function fillFor(i) {
  var idx = (Math.floor(t / 30) + i) % PALETTE.length;
  fill(PALETTE[idx]);
}
function draw() {
  clear();
  background(BG);
  t++;
  var w = width, h = height;
  var s = min(w, h);

  // Large, distinguishable primitives with accent fills swapped between shapes.
  push();
  fillFor(0);
  circle(w * 0.22, h * 0.34, s * 0.36);
  pop();

  push();
  rectMode(CENTER);
  fillFor(1);
  rect(w * 0.72, h * 0.30, s * 0.32, s * 0.32, s * 0.04);
  pop();

  push();
  fillFor(2);
  triangle(w * 0.14, h * 0.82, w * 0.42, h * 0.82, w * 0.28, h * 0.50);
  pop();

  push();
  fillFor(3);
  ellipse(w * 0.72, h * 0.72, s * 0.40, s * 0.26);
  pop();

  push();
  stroke(PALETTE[(Math.floor(t / 30) + 4) % PALETTE.length]);
  strokeWeight(max(5, s * 0.04));
  strokeCap(ROUND);
  noFill();
  line(w * 0.44, h * 0.14, w * 0.58, h * 0.50);
  pop();

  push();
  fillFor(5);
  arc(w * 0.50, h * 0.86, s * 0.32, s * 0.32, PI, TWO_PI, PIE);
  pop();
}
`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
${fontFaces}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: ${colors.surfaceDim}; }
canvas { display: block; }
</style>
</head>
<body>
${polyfill}
${p5Script}
<script>${escapeScriptContent(sketch)}</script>
</body>
</html>`;
}

export default function ShapesCoursePreview({
  colorScheme,
  accentColor,
  height = 140,
}: ShapesCoursePreviewProps) {
  const colors = Colors[colorScheme];
  const assets = useRuntimeAssets();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!assets.ready) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const interaction = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!cancelled) setShow(true);
      }, 60);
    });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      interaction.cancel?.();
    };
  }, [assets.ready]);

  const html = useMemo(() => {
    if (!show || !assets.ready) return null;
    return buildShapesPreviewHtml(colorScheme, accentColor, assets.urls);
  }, [show, assets.ready, assets.urls, colorScheme, accentColor]);

  if (!html) {
    return (
      <View style={[styles.placeholder, { height, backgroundColor: colors.surfaceDim }]}>
        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          Loading preview…
        </Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ html, baseUrl: assets.urls?.baseUrl ?? undefined }}
      style={[styles.preview, { height, backgroundColor: colors.surfaceDim }]}
      scrollEnabled={false}
      pointerEvents="none"
      javaScriptEnabled
      domStorageEnabled
      allowFileAccess
      allowFileAccessFromFileURLs
      allowUniversalAccessFromFileURLs
      bounces={false}
    />
  );
}

const styles = StyleSheet.create({
  preview: {
    width: "100%",
    overflow: "hidden",
  },
  placeholder: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontFamily: "JetBrainsMono",
    fontSize: 12,
  },
});
