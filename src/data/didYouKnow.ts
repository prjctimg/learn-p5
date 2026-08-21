import { P5_SYMBOLS, P5Symbol } from "./reference";

// Intro-course vocabulary excluded from "Did You Know" picks so the modal
// only surfaces rarely used or advanced library symbols.
const BASIC_SYMBOLS = new Set([
  // Lifecycle callbacks
  "preload",
  "setup",
  "draw",
  ...[
    "mouseMoved",
    "mouseDragged",
    "mousePressed",
    "mouseReleased",
    "mouseClicked",
    "doubleClicked",
    "mouseWheel",
    "keyPressed",
    "keyReleased",
    "keyTyped",
    "touchStarted",
    "touchMoved",
    "touchEnded",
    "deviceMoved",
    "deviceTurned",
    "deviceShaken",
    "windowResized",
  ],
  // Canvas & drawing primitives
  "createCanvas",
  "background",
  "fill",
  "noFill",
  "stroke",
  "noStroke",
  "strokeWeight",
  "strokeCap",
  "strokeJoin",
  "circle",
  "ellipse",
  "ellipseMode",
  "rect",
  "rectMode",
  "line",
  "point",
  "triangle",
  "quad",
  "arc",
  "erase",
  "noErase",
  "clear",
  // Transform stack
  "push",
  "pop",
  "translate",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "shearX",
  "shearY",
  "applyMatrix",
  "resetMatrix",
  "printMatrix",
  // Color basics
  "colorMode",
  "lerpColor",
  "red",
  "green",
  "blue",
  "alpha",
  "brightness",
  "saturation",
  "hue",
  // Text basics
  "text",
  "textSize",
  "textAlign",
  "textStyle",
  "textLeading",
  "textFont",
  "textWidth",
  "textAscent",
  "textDescent",
  // Flow control
  "loop",
  "noLoop",
  "redraw",
  "frameRate",
  // Basic math
  "random",
  "randomSeed",
  "map",
  "constrain",
  "dist",
  "abs",
  "min",
  "max",
  "floor",
  "ceil",
  "round",
  "sq",
  "sqrt",
  "pow",
  "norm",
  "lerp",
  "mag",
  "log",
  "exp",
  "sin",
  "cos",
  "tan",
  "atan2",
  "degrees",
  "radians",
  // Environment variables
  "mouseX",
  "mouseY",
  "pmouseX",
  "pmouseY",
  "width",
  "height",
  "frameCount",
  "key",
  "keyCode",
  "keyIsPressed",
  "mouseIsPressed",
  "focused",
  "displayWidth",
  "displayHeight",
  "windowWidth",
  "windowHeight",
  "pixels",
  "canvas",
  "drawingContext",
  // Console
  "print",
  "println",
]);

function isAdvancedSymbol(sym: P5Symbol): boolean {
  return (
    !BASIC_SYMBOLS.has(sym.name) &&
    !sym.name.endsWith("Hook") &&
    !sym.norender &&
    Array.isArray(sym.examples) &&
    sym.examples.length > 0 &&
    sym.description.trim().length > 0
  );
}

const ADVANCED_POOL: P5Symbol[] = P5_SYMBOLS.filter(isAdvancedSymbol);

export function pickRandomAdvancedSymbol(exclude?: string): P5Symbol | null {
  if (ADVANCED_POOL.length === 0) return null;
  const filtered = exclude
    ? ADVANCED_POOL.filter((s) => s.name !== exclude)
    : ADVANCED_POOL;
  const list = filtered.length > 0 ? filtered : ADVANCED_POOL;
  return list[Math.floor(Math.random() * list.length)];
}
