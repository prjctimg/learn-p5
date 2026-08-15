#!/usr/bin/env node
// Dev-only invariant: every p5 function call / property / constant referenced in
// course YAML code blocks must resolve to a known symbol. Catches typos and stale
// p5 v1 names (e.g. curveVertex, curve()) before they reach the bundled sketch.
// Run via: npm run check-symbols
import fs from "fs";
import path from "path";
import jsyaml from "js-yaml";

const COURSES_DIR = path.resolve("src/data/courses");
const REF_FILE = path.resolve("src/data/reference.generated.json");

// p5 v2 symbols used by the course library. The union of the generated reference
// and this curated list keeps the check working even with an offline/stub
// reference snapshot (which only contains a subset of symbols).
const CORE_P5_SYMBOLS = [
  // structure / environment
  "setup", "draw", "preload", "loop", "noLoop", "redraw", "frameRate",
  "millis", "second", "minute", "hour", "day", "month", "year",
  "push", "pop", "print", "clear", "remove",
  // rendering
  "createCanvas", "resizeCanvas", "noCanvas", "createGraphics",
  "pixelDensity", "displayDensity", "blendMode",
  // color
  "background", "fill", "stroke", "noFill", "noStroke", "color", "colorMode",
  "lerpColor", "alpha", "red", "green", "blue", "hue", "saturation", "brightness",
  "tint", "noTint", "strokeCap", "strokeJoin",
  // shapes
  "point", "line", "triangle", "quad", "rect", "square", "circle", "ellipse",
  "arc", "rectMode", "ellipseMode", "strokeWeight", "textSize", "textStyle",
  "textAlign", "textLeading", "textFont", "textWidth", "textAscent", "textDescent", "text",
  // curves & custom shapes
  "beginShape", "endShape", "beginContour", "endContour", "vertex",
  "bezierVertex", "quadraticVertex", "curveVertex", "splineVertex",
  "bezier", "bezierPoint", "bezierTangent", "bezierOrder", "curve",
  "curvePoint", "curveTangent", "curveTightness", "spline",
  // math
  "map", "constrain", "lerp", "dist", "sq", "sqrt", "pow", "abs", "ceil", "floor",
  "round", "min", "max", "norm", "exp", "log", "log10", "sin", "cos", "tan",
  "asin", "acos", "atan", "atan2", "degrees", "radians", "angleMode",
  "random", "randomSeed", "randomGaussian", "noise", "noiseDetail", "noiseSeed",
  "createVector", "frameCount", "width", "height", "mouseX", "mouseY",
  "mouseIsPressed", "key", "keyCode", "keyIsPressed",
  // events
  "mousePressed", "mouseReleased", "mouseMoved", "mouseDragged", "mouseClicked",
  "mouseWheel", "keyPressed", "keyReleased", "keyTyped", "keyIsDown", "touchStarted",
  "touchMoved", "touchEnded", "deviceMoved", "deviceTurned", "deviceShaken",
  // image
  "createImage", "loadImage", "image", "tint", "filter", "get", "set",
  "loadPixels", "updatePixels", "loadPixels", "loadImage",
  // IO / data
  "loadJSON", "loadStrings", "loadXML", "loadTable", "loadBytes", "loadFont",
  "loadSound", "httpGet", "httpPost", "getItem", "storeItem", "clearStorage",
  "removeItem", "getURL", "getURLPath", "getURLParams",
  // transform
  "translate", "rotate", "rotateX", "rotateY", "rotateZ", "scale", "shearX",
  "shearY", "applyMatrix", "resetMatrix", "printMatrix",
  // webgl / 3d
  "sphere", "box", "cone", "cylinder", "torus", "plane", "lights", "ambientLight",
  "directionalLight", "pointLight", "spotLight", "normalMaterial", "ambientMaterial",
  "specularMaterial", "shininess", "orbitControl", "debugMode", "noDebugMode",
  // dom
  "createDiv", "createP", "createSpan", "createButton", "createSlider",
  "createCheckbox", "createSelect", "createRadio", "createInput", "createColorPicker",
  "createFileInput", "createVideo", "createAudio", "createImg", "createA",
  "createElement", "createCanvas",
];

const P5_CONSTANTS = [
  "PI", "TWO_PI", "HALF_PI", "QUARTER_PI", "TAU",
  "CLOSE", "OPEN", "CHORD", "PIE",
  "HSB", "RGB", "CMYK", "ARGB", "HSBA",
  "LEFT_ARROW", "RIGHT_ARROW", "UP_ARROW", "DOWN_ARROW",
  "GRAY", "INVERT", "THRESHOLD", "OPAQUE", "POSTERIZE", "BLUR", "ERASE", "DILATE", "ERODE",
  "CENTER", "LEFT", "RIGHT", "TOP", "BOTTOM",
  "BOLD", "NORMAL", "ITALIC", "BOLDITALIC",
  "P2D", "WEBGL",
  "WIDTH", "HEIGHT", "RADIUS", "CORNER", "CORNERS",
  "LANDSCAPE", "PORTRAIT",
  "ADD", "SUBTRACT", "DARKEST", "LIGHTEST", "DIFFERENCE", "EXCLUSION",
  "MULTIPLY", "SCREEN", "REPLACE", "OVERLAY", "HARD_LIGHT", "SOFT_LIGHT",
  "DODGE", "BURN",
  "SEMIBOLD", "THIN", "LIGHT",
];

const JS_GLOBALS = [
  "window", "document", "console", "Math", "JSON", "Number", "String", "Array",
  "Boolean", "Object", "RegExp", "Date", "Promise", "Map", "Set", "Symbol", "BigInt",
  "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent",
  "decodeURIComponent", "setTimeout", "setInterval", "clearTimeout", "clearInterval",
  "requestAnimationFrame", "require", "module", "exports", "process",
];

const JS_KEYWORDS = [
  "if", "else", "for", "while", "do", "return", "function", "let", "const",
  "var", "new", "true", "false", "null", "undefined", "this", "typeof",
  "instanceof", "in", "of", "switch", "case", "break", "continue", "default",
  "try", "catch", "finally", "throw", "delete", "void", "yield", "async",
  "await", "class", "extends", "super", "import", "export", "from",
];

// Members accessed on p5 instances (p5.Element, p5.Vector, p5.Image) and on
// plain JS objects/arrays returned by the loaded data.
const MEMBER_ALLOWLIST = [
  // p5.Element
  "value", "checked", "color", "style", "size", "position", "elt", "id",
  "attribute", "removeAttribute", "addClass", "removeClass", "hasClass", "toggleClass",
  "mousePressed", "mouseReleased", "mouseOver", "mouseOut", "mouseMoved",
  "mouseWheel", "input", "changed", "hide", "show", "addClass", "dragOver", "drop",
  // p5.Vector
  "add", "sub", "mult", "div", "mag", "magSq", "normalize", "setMag", "limit",
  "heading", "setHeading", "rotate", "dist", "dot", "cross", "lerp", "random2D",
  "random3D", "fromAngle", "copy", "array", "equals", "set", "get",
  // p5.Image / p5.Graphics
  "loadPixels", "updatePixels", "pixels", "set", "get", "width", "height",
  "copy", "resize", "mask", "filter", "blend", "save",
  // loaded-data / plain JS objects & arrays
  "title", "completed", "join", "split", "toFixed", "toString", "toUpperCase",
  "toLowerCase", "push", "pop", "slice", "map", "filter", "reduce", "length",
  "x", "y", "z",
];

function stripIgnored(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], c2 = src[i + 1];
    if (c === "/" && c2 === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && c2 === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
    if (c === '"' || c === "'" || c === "`") {
      const q = c; i++;
      while (i < n) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === q) { i++; break; }
        i++;
      }
      continue;
    }
    out += c; i++;
  }
  return out;
}

let symbolSet = new Set([...CORE_P5_SYMBOLS, ...JS_GLOBALS, ...JS_KEYWORDS]);
let refSymbols = new Set();
try {
  const ref = JSON.parse(fs.readFileSync(REF_FILE, "utf-8"));
  if (ref.byName) {
    refSymbols = new Set(Object.keys(ref.byName));
    symbolSet = new Set([...symbolSet, ...refSymbols]);
  }
} catch {
  console.warn(`[check-symbols] ${REF_FILE} not found — relying on curated symbol list only.`);
}

const callRe = /(?<![\w$.])\b([A-Za-z_$][\w$]*)\s*\(/g;
const memberRe = /\.([A-Za-z_$][\w$]*)\b/g;
const constRe = /\b([A-Z][A-Z0-9_]*)\b/g;

function declaredNames(code) {
  const names = new Set();
  let m;
  const fnRe = /function\s+([A-Za-z_$][\w$]*)/g;
  while ((m = fnRe.exec(code)) !== null) names.add(m[1]);
  const varRe = /\b(?:let|const|var)\s+([A-Za-z_$][\w$]*)/g;
  while ((m = varRe.exec(code)) !== null) names.add(m[1]);
  const paramRe = /function\s*\(([^)]*)\)/g;
  while ((m = paramRe.exec(code)) !== null) {
    for (const p of m[1].split(",")) {
      const id = p.trim().split(/[=:]/)[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(id)) names.add(id);
    }
  }
  return names;
}

let failures = 0;
function report(file, exId, block, msg) {
  console.error(`  ✗ ${file} ${exId} ${block}: ${msg}`);
  failures++;
}

const yamlFiles = fs.readdirSync(COURSES_DIR).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

for (const file of yamlFiles) {
  const course = jsyaml.load(fs.readFileSync(path.join(COURSES_DIR, file), "utf8"));
  for (const ex of course.exercises ?? []) {
    const blocks = [
      ["startingCode", ex.startingCode],
      ["solution", ex.solution],
      ...(ex.tasks ?? []).map((t) => [`task.${t.id}.solution`, t.solution]),
    ];
    for (const [label, src] of blocks) {
      if (!src) continue;
      const code = stripIgnored(src);
      const declared = declaredNames(code);
      let m;
      callRe.lastIndex = 0;
      while ((m = callRe.exec(code)) !== null) {
        const name = m[1];
        if (!symbolSet.has(name) && !declared.has(name)) {
          report(file, ex.id, label, `unknown function call ${name}()`);
        }
      }
      memberRe.lastIndex = 0;
      while ((m = memberRe.exec(code)) !== null) {
        const name = m[1];
        if (!symbolSet.has(name) && !MEMBER_ALLOWLIST.includes(name) && !declared.has(name)) {
          report(file, ex.id, label, `unknown member .${name}`);
        }
      }
      constRe.lastIndex = 0;
      while ((m = constRe.exec(code)) !== null) {
        const name = m[1];
        if (!P5_CONSTANTS.includes(name) && !refSymbols.has(name) && !JS_GLOBALS.includes(name)) {
          report(file, ex.id, label, `unknown constant ${name}`);
        }
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} unknown symbol(s) in course YAML.`);
  process.exit(1);
} else {
  console.log("All course YAML symbols resolve to known p5/JS symbols.");
}
