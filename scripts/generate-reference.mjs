import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import jsyaml from "js-yaml";

const WEBSITE_REPO = "https://github.com/processing/p5.js-website.git";
const REF_DIR = "src/content/reference/en";
const OUT_FILE = path.resolve("src/data/reference.generated.json");

const MDX_FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/;

function parseMdxFrontmatter(content) {
  const match = content.match(MDX_FRONTMATTER_RE);
  if (!match) return null;
  return jsyaml.load(match[1]);
}

function flattenParams(params) {
  if (!Array.isArray(params)) return [];
  return params.map((p) => ({
    name: p.name,
    type: p.type || "Any",
    optional: !!p.optional,
    description: (p.description || "").replace(/<\/?p>/g, "").trim(),
  }));
}

function buildSyntax(name, params) {
  if (!params || params.length === 0) return `${name}()`;
  const parts = params.map((p) => (p.optional ? `[${p.name}]` : p.name));
  return `${name}(${parts.join(", ")})`;
}

function mapP5TypeToKeyboardType(typeStr) {
  const t = (typeStr || "").toLowerCase();
  if (t.includes("color")) return "color";
  if (t.includes("string")) return "string";
  if (t.includes("number") || t.includes("int") || t.includes("float")) return "number";
  if (t.includes("array") || t.includes("[]")) return "array";
  if (t.includes("boolean") || t.includes("bool")) return "boolean";
  return "number";
}

function getKeyboardParamTypes(params) {
  if (!params || params.length === 0) return [];
  return params.map((p) => mapP5TypeToKeyboardType(p.type));
}

function buildOutput(byName, byModule, byClass) {
  const classes = Object.keys(byClass).sort();
  const functionNames = Object.keys(byName).filter(
    (k) => byName[k].itemtype === "method"
  ).sort();
  const keyboardFunctions = functionNames.slice(0, 100).map((name) => {
    const s = byName[name];
    return {
      label: s.name,
      insert: s.name + "()",
      paramTypes: getKeyboardParamTypes(s.params),
    };
  });

  return {
    byName,
    byModule,
    byClass,
    classes,
    keyboardFunctions,
    functionNames,
    metadata: {
      generatedAt: new Date().toISOString(),
      p5Version: "1.11.13",
      symbolCount: Object.keys(byName).length,
    },
  };
}

function writeOutput(output) {
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf-8");
  console.log(`Generated ${OUT_FILE}`);
  console.log(`  ${output.metadata.symbolCount} symbols`);
  console.log(`  ${Object.keys(output.byModule).length} modules`);
  console.log(`  ${output.classes.length} classes`);
}

function generateFromRepo() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "p5-ref-"));
  console.log(`Cloning ${WEBSITE_REPO} ...`);

  try {
    execSync(
      `git clone --depth 1 --single-branch "${WEBSITE_REPO}" "${tmpDir}"`,
      { stdio: "pipe", timeout: 120_000 }
    );
  } catch (e) {
    console.error("Failed to clone p5.js-website repo:", e.message);
    process.exit(1);
  }

  const refRoot = path.join(tmpDir, REF_DIR);
  if (!fs.existsSync(refRoot)) {
    console.error(`Reference directory not found: ${refRoot}`);
    process.exit(1);
  }

  const mdxFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".mdx")) {
        mdxFiles.push(full);
      }
    }
  }
  walk(refRoot);

  console.log(`Found ${mdxFiles.length} reference files`);

  const byName = {};
  const byModule = {};
  const byClass = {};

  for (const file of mdxFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const frontmatter = parseMdxFrontmatter(content);
    if (!frontmatter || !frontmatter.title) {
      console.warn(`  Skipping ${path.relative(refRoot, file)}: no frontmatter`);
      continue;
    }

    const name = frontmatter.title;
    const mod = frontmatter.module || "Other";
    const cls = frontmatter.class || "p5";
    const params = flattenParams(frontmatter.params);
    const overloads = (frontmatter.overloads || []).map((o) => ({
      params: flattenParams(o.params),
      chainable: !!o.chainable,
    }));

    const symbol = {
      name,
      module: mod,
      submodule: frontmatter.submodule || null,
      class: cls,
      itemtype: frontmatter.itemtype || "method",
      description: (frontmatter.description || "").replace(/<\/?p>/g, "").trim(),
      syntax: buildSyntax(name, params),
      params,
      overloads: overloads.length > 0 ? overloads : undefined,
      chainable: !!frontmatter.chainable,
      isConstructor: !!frontmatter.isConstructor,
    };

    if (frontmatter.example) {
      const examples = Array.isArray(frontmatter.example)
        ? frontmatter.example
        : [frontmatter.example];
      symbol.examples = examples.map((ex) => {
        if (typeof ex === "string") return ex.trim();
        return String(ex).trim();
      });
    }

    byName[name] = symbol;

    if (!byModule[mod]) byModule[mod] = [];
    byModule[mod].push(name);

    if (!byClass[cls]) byClass[cls] = [];
    byClass[cls].push(name);
  }

  const output = buildOutput(byName, byModule, byClass);
  writeOutput(output);

  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function generateStub() {
  console.log("Generating stub reference data (offline)...");

  // Build from the ~20 core symbols we already know, plus a module structure
  const symbols = [
    { name: "arc", module: "Shape", cls: "p5", itemtype: "method", description: "Draws an arc curve on the canvas.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the arc's center" },
      { name: "y", type: "Number", description: "y-coordinate of the arc's center" },
      { name: "w", type: "Number", description: "width of the arc's ellipse" },
      { name: "h", type: "Number", description: "height of the arc's ellipse" },
      { name: "start", type: "Number", description: "angle to start the arc, in radians" },
      { name: "stop", type: "Number", description: "angle to stop the arc, in radians" },
      { name: "mode", type: "Constant", optional: true, description: "arc drawing mode (OPEN, CHORD, PIE)" },
      { name: "detail", type: "Integer", optional: true, description: "number of ellipse segments" },
    ]},
    { name: "circle", module: "Shape", cls: "p5", description: "Draws a circle on the canvas at the given position and diameter.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the circle's center" },
      { name: "y", type: "Number", description: "y-coordinate of the circle's center" },
      { name: "d", type: "Number", description: "diameter of the circle" },
    ], examples: ["circle(200, 200, 100);"] },
    { name: "ellipse", module: "Shape", cls: "p5", description: "Draws an ellipse (oval) on the canvas.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the ellipse's center" },
      { name: "y", type: "Number", description: "y-coordinate of the ellipse's center" },
      { name: "w", type: "Number", description: "width of the ellipse" },
      { name: "h", type: "Number", optional: true, description: "height of the ellipse (defaults to width)" },
    ], examples: ["ellipse(200, 200, 150, 100);"] },
    { name: "line", module: "Shape", cls: "p5", description: "Draws a line between two points.", params: [
      { name: "x1", type: "Number", description: "x-coordinate of the first point" },
      { name: "y1", type: "Number", description: "y-coordinate of the first point" },
      { name: "x2", type: "Number", description: "x-coordinate of the second point" },
      { name: "y2", type: "Number", description: "y-coordinate of the second point" },
    ], examples: ["line(100, 100, 300, 300);"] },
    { name: "point", module: "Shape", cls: "p5", description: "Draws a point at the given coordinate.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the point" },
      { name: "y", type: "Number", description: "y-coordinate of the point" },
      { name: "z", type: "Number", optional: true, description: "z-coordinate of the point" },
    ]},
    { name: "quad", module: "Shape", cls: "p5", description: "Draws a quadrilateral shape defined by four corners.", params: [
      { name: "x1", type: "Number", description: "x-coordinate of the first corner" },
      { name: "y1", type: "Number", description: "y-coordinate of the first corner" },
      { name: "x2", type: "Number", description: "x-coordinate of the second corner" },
      { name: "y2", type: "Number", description: "y-coordinate of the second corner" },
      { name: "x3", type: "Number", description: "x-coordinate of the third corner" },
      { name: "y3", type: "Number", description: "y-coordinate of the third corner" },
      { name: "x4", type: "Number", description: "x-coordinate of the fourth corner" },
      { name: "y4", type: "Number", description: "y-coordinate of the fourth corner" },
    ]},
    { name: "rect", module: "Shape", cls: "p5", description: "Draws a rectangle on the canvas.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the rectangle's corner" },
      { name: "y", type: "Number", description: "y-coordinate of the rectangle's corner" },
      { name: "w", type: "Number", description: "width of the rectangle" },
      { name: "h", type: "Number", optional: true, description: "height of the rectangle (defaults to width)" },
    ], examples: ["rect(150, 150, 200, 100);"] },
    { name: "square", module: "Shape", cls: "p5", description: "Draws a square on the canvas.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the square's corner" },
      { name: "y", type: "Number", description: "y-coordinate of the square's corner" },
      { name: "s", type: "Number", description: "side length of the square" },
      { name: "tl", type: "Number", optional: true, description: "top-left corner radius" },
      { name: "tr", type: "Number", optional: true, description: "top-right corner radius" },
      { name: "br", type: "Number", optional: true, description: "bottom-right corner radius" },
      { name: "bl", type: "Number", optional: true, description: "bottom-left corner radius" },
    ]},
    { name: "triangle", module: "Shape", cls: "p5", description: "Draws a triangle defined by three vertices.", params: [
      { name: "x1", type: "Number", description: "x-coordinate of the first vertex" },
      { name: "y1", type: "Number", description: "y-coordinate of the first vertex" },
      { name: "x2", type: "Number", description: "x-coordinate of the second vertex" },
      { name: "y2", type: "Number", description: "y-coordinate of the second vertex" },
      { name: "x3", type: "Number", description: "x-coordinate of the third vertex" },
      { name: "y3", type: "Number", description: "y-coordinate of the third vertex" },
    ]},
    { name: "ellipseMode", module: "Shape", cls: "p5", description: "Sets the origin for drawing ellipses and circles.", params: [
      { name: "mode", type: "Constant", description: "CENTER, RADIUS, CORNER, or CORNERS" },
    ]},
    { name: "rectMode", module: "Shape", cls: "p5", description: "Sets the origin for drawing rectangles.", params: [
      { name: "mode", type: "Constant", description: "CENTER, RADIUS, CORNER, or CORNERS" },
    ]},
    { name: "strokeWeight", module: "Shape", cls: "p5", description: "Sets the width of the stroke used for lines, points, and borders.", params: [
      { name: "weight", type: "Number", description: "stroke weight in pixels" },
    ]},
    { name: "stroke", module: "Color", cls: "p5", description: "Sets the color used for drawing lines and borders around shapes.", params: [
      { name: "v1", type: "Number", description: "gray value, red value, or hue" },
      { name: "v2", type: "Number", optional: true, description: "green, saturation, or alpha value" },
      { name: "v3", type: "Number", optional: true, description: "blue or brightness value" },
      { name: "alpha", type: "Number", optional: true, description: "alpha (transparency) value" },
    ]},
    { name: "fill", module: "Color", cls: "p5", description: "Sets the color used to fill shapes.", params: [
      { name: "v1", type: "Number", description: "gray value, red value, or hue" },
      { name: "v2", type: "Number", optional: true, description: "green, saturation, or alpha value" },
      { name: "v3", type: "Number", optional: true, description: "blue or brightness value" },
      { name: "alpha", type: "Number", optional: true, description: "alpha (transparency) value" },
    ], examples: ["fill(255, 0, 0);\ncircle(200, 200, 100);"] },
    { name: "background", module: "Color", cls: "p5", description: "Sets the background color of the canvas.", params: [
      { name: "v1", type: "Number", description: "gray value, red value, or hue" },
      { name: "v2", type: "Number", optional: true, description: "green, saturation, or alpha value" },
      { name: "v3", type: "Number", optional: true, description: "blue or brightness value" },
      { name: "alpha", type: "Number", optional: true, description: "alpha (transparency) value" },
    ], examples: ["background(220);"] },
    { name: "noStroke", module: "Color", cls: "p5", description: "Disables drawing the stroke (outline) for shapes.", params: [] },
    { name: "noFill", module: "Color", cls: "p5", description: "Disables filling the interior of shapes.", params: [] },
    { name: "color", module: "Color", cls: "p5", description: "Creates a color object from the given values.", params: [
      { name: "v1", type: "Number", description: "gray value, red value, or hue" },
      { name: "v2", type: "Number", optional: true, description: "green, saturation, or alpha value" },
      { name: "v3", type: "Number", optional: true, description: "blue or brightness value" },
      { name: "alpha", type: "Number", optional: true, description: "alpha (transparency) value" },
    ]},
    { name: "colorMode", module: "Color", cls: "p5", description: "Changes the color mode for the sketch.", params: [
      { name: "mode", type: "Constant", description: "RGB or HSB" },
    ]},
    { name: "createCanvas", module: "Environment", cls: "p5", description: "Creates a canvas element of the given size.", params: [
      { name: "w", type: "Number", description: "width of the canvas in pixels" },
      { name: "h", type: "Number", description: "height of the canvas in pixels" },
    ]},
    { name: "resizeCanvas", module: "Environment", cls: "p5", description: "Resizes the canvas to the given width and height.", params: [
      { name: "w", type: "Number", description: "new width in pixels" },
      { name: "h", type: "Number", description: "new height in pixels" },
    ]},
    { name: "noCanvas", module: "Environment", cls: "p5", description: "Removes the default canvas element.", params: [] },
    { name: "setup", module: "Structure", cls: "p5", itemtype: "method", description: "Called once when the sketch starts, used to define initial properties.", params: [] },
    { name: "draw", module: "Structure", cls: "p5", description: "Called continuously after setup, executes the main drawing code.", params: [] },
    { name: "preload", module: "Structure", cls: "p5", description: "Called before setup, used to load external assets.", params: [] },
    { name: "loop", module: "Structure", cls: "p5", description: "Resumes the draw loop after noLoop has stopped it.", params: [] },
    { name: "noLoop", module: "Structure", cls: "p5", description: "Stops the draw loop from continuously executing.", params: [] },
    { name: "redraw", module: "Structure", cls: "p5", description: "Executes the draw function once when noLoop is active.", params: [] },
    { name: "push", module: "Structure", cls: "p5", description: "Saves the current drawing style settings and transformations.", params: [] },
    { name: "pop", module: "Structure", cls: "p5", description: "Restores the drawing style and transformation settings saved by push.", params: [] },
    { name: "print", module: "Environment", cls: "p5", description: "Writes to the console.", params: [
      { name: "contents", type: "Any", description: "the content to print to the console" },
    ]},
    { name: "frameCount", module: "Environment", cls: "p5", itemtype: "property", description: "The number of frames that have been displayed since the sketch started.", params: [] },
    { name: "frameRate", module: "Environment", cls: "p5", description: "Specifies the number of frames to be displayed every second.", params: [
      { name: "fps", type: "Number", optional: true, description: "target frames per second" },
    ]},
    { name: "mouseX", module: "Events", cls: "p5", itemtype: "property", description: "The current horizontal position of the mouse.", params: [] },
    { name: "mouseY", module: "Events", cls: "p5", itemtype: "property", description: "The current vertical position of the mouse.", params: [] },
    { name: "mousePressed", module: "Events", cls: "p5", description: "Called when the mouse button is pressed.", params: [
      { name: "event", type: "Object", optional: true, description: "optional mouse event" },
    ]},
    { name: "mouseReleased", module: "Events", cls: "p5", description: "Called when the mouse button is released.", params: [
      { name: "event", type: "Object", optional: true, description: "optional mouse event" },
    ]},
    { name: "mouseMoved", module: "Events", cls: "p5", description: "Called when the mouse is moved.", params: [
      { name: "event", type: "Object", optional: true, description: "optional mouse event" },
    ]},
    { name: "keyPressed", module: "Events", cls: "p5", description: "Called when a key is pressed.", params: [
      { name: "event", type: "Object", optional: true, description: "optional key event" },
    ]},
    { name: "keyReleased", module: "Events", cls: "p5", description: "Called when a key is released.", params: [
      { name: "event", type: "Object", optional: true, description: "optional key event" },
    ]},
    { name: "keyTyped", module: "Events", cls: "p5", description: "Called when a typed key is detected.", params: [
      { name: "event", type: "Object", optional: true, description: "optional key event" },
    ]},
    { name: "width", module: "Environment", cls: "p5", itemtype: "property", description: "The width of the canvas.", params: [] },
    { name: "height", module: "Environment", cls: "p5", itemtype: "property", description: "The height of the canvas.", params: [] },
    { name: "random", module: "Math", cls: "p5", description: "Returns a random number or picks a random item from an array.", params: [
      { name: "low", type: "Number", optional: true, description: "lower bound or array to pick from" },
      { name: "high", type: "Number", optional: true, description: "upper bound" },
    ]},
    { name: "randomSeed", module: "Math", cls: "p5", description: "Sets the seed value for random().", params: [
      { name: "seed", type: "Number", description: "seed value for the random number generator" },
    ]},
    { name: "floor", module: "Math", cls: "p5", description: "Returns the largest integer less than or equal to the value.", params: [
      { name: "n", type: "Number", description: "the value to floor" },
    ]},
    { name: "ceil", module: "Math", cls: "p5", description: "Returns the smallest integer greater than or equal to the value.", params: [
      { name: "n", type: "Number", description: "the value to ceil" },
    ]},
    { name: "round", module: "Math", cls: "p5", description: "Returns the value rounded to the nearest integer.", params: [
      { name: "n", type: "Number", description: "the value to round" },
    ]},
    { name: "map", module: "Math", cls: "p5", description: "Re-maps a number from one range to another.", params: [
      { name: "value", type: "Number", description: "the value to map" },
      { name: "start1", type: "Number", description: "lower bound of the source range" },
      { name: "stop1", type: "Number", description: "upper bound of the source range" },
      { name: "start2", type: "Number", description: "lower bound of the target range" },
      { name: "stop2", type: "Number", description: "upper bound of the target range" },
    ]},
    { name: "constrain", module: "Math", cls: "p5", description: "Constrains a value between a minimum and maximum.", params: [
      { name: "value", type: "Number", description: "the value to constrain" },
      { name: "low", type: "Number", description: "minimum boundary" },
      { name: "high", type: "Number", description: "maximum boundary" },
    ]},
    { name: "lerp", module: "Math", cls: "p5", description: "Calculates a number between two numbers at a specific increment.", params: [
      { name: "start", type: "Number", description: "start value" },
      { name: "stop", type: "Number", description: "end value" },
      { name: "amt", type: "Number", description: "interpolation amount between 0 and 1" },
    ]},
    { name: "dist", module: "Math", cls: "p5", description: "Calculates the distance between two points.", params: [
      { name: "x1", type: "Number", description: "x-coordinate of the first point" },
      { name: "y1", type: "Number", description: "y-coordinate of the first point" },
      { name: "x2", type: "Number", description: "x-coordinate of the second point" },
      { name: "y2", type: "Number", description: "y-coordinate of the second point" },
    ]},
    { name: "sin", module: "Math", cls: "p5", description: "Returns the sine of an angle.", params: [{ name: "angle", type: "Number", description: "angle in radians" }] },
    { name: "cos", module: "Math", cls: "p5", description: "Returns the cosine of an angle.", params: [{ name: "angle", type: "Number", description: "angle in radians" }] },
    { name: "tan", module: "Math", cls: "p5", description: "Returns the tangent of an angle.", params: [{ name: "angle", type: "Number", description: "angle in radians" }] },
    { name: "abs", module: "Math", cls: "p5", description: "Returns the absolute value of a number.", params: [{ name: "n", type: "Number", description: "the value to get the absolute value of" }] },
    { name: "sqrt", module: "Math", cls: "p5", description: "Returns the square root of a number.", params: [{ name: "n", type: "Number", description: "the value to take the square root of" }] },
    { name: "sq", module: "Math", cls: "p5", description: "Returns the square of a number (n * n).", params: [{ name: "n", type: "Number", description: "the value to square" }] },
    { name: "pow", module: "Math", cls: "p5", description: "Returns the value of a number raised to an exponent.", params: [
      { name: "n", type: "Number", description: "the base value" },
      { name: "e", type: "Number", description: "the exponent" },
    ]},
    { name: "text", module: "Typography", cls: "p5", description: "Draws text to the canvas at the given position.", params: [
      { name: "str", type: "String", description: "the text string to display" },
      { name: "x", type: "Number", description: "x-coordinate of the text" },
      { name: "y", type: "Number", description: "y-coordinate of the text" },
    ]},
    { name: "textSize", module: "Typography", cls: "p5", description: "Sets the font size for text.", params: [
      { name: "size", type: "Number", description: "font size in pixels" },
    ]},
    { name: "textFont", module: "Typography", cls: "p5", description: "Sets the font family for text.", params: [
      { name: "font", type: "String", description: "the font name or p5.Font object" },
    ]},
    { name: "textAlign", module: "Typography", cls: "p5", description: "Sets the alignment for drawing text.", params: [
      { name: "alignX", type: "Constant", description: "horizontal alignment (LEFT, CENTER, RIGHT)" },
      { name: "alignY", type: "Constant", optional: true, description: "vertical alignment (TOP, CENTER, BOTTOM)" },
    ]},
    { name: "loadImage", module: "Image", cls: "p5", description: "Loads an image from the given path.", params: [
      { name: "path", type: "String", description: "path to the image file" },
    ]},
    { name: "image", module: "Image", cls: "p5", description: "Draws an image to the canvas.", params: [
      { name: "img", type: "p5.Image", description: "the image to display" },
      { name: "x", type: "Number", description: "x-coordinate of the image" },
      { name: "y", type: "Number", description: "y-coordinate of the image" },
    ]},
    { name: "loadSound", module: "Sound", cls: "p5", description: "Loads a sound file from the given path.", params: [
      { name: "path", type: "String", description: "path to the sound file" },
    ]},
    { name: "millis", module: "Environment", cls: "p5", description: "Returns the number of milliseconds since the sketch started.", params: [] },
    { name: "second", module: "Environment", cls: "p5", description: "Returns the current second as a value from 0 to 59.", params: [] },
    { name: "minute", module: "Environment", cls: "p5", description: "Returns the current minute as a value from 0 to 59.", params: [] },
    { name: "hour", module: "Environment", cls: "p5", description: "Returns the current hour as a value from 0 to 23.", params: [] },
    { name: "day", module: "Environment", cls: "p5", description: "Returns the current day as a value from 1 to 31.", params: [] },
    { name: "month", module: "Environment", cls: "p5", description: "Returns the current month as a value from 1 to 12.", params: [] },
    { name: "year", module: "Environment", cls: "p5", description: "Returns the current year as a four-digit value.", params: [] },
    { name: "createVector", module: "Math", cls: "p5", description: "Creates a new vector with the given components.", params: [
      { name: "x", type: "Number", optional: true, description: "x component" },
      { name: "y", type: "Number", optional: true, description: "y component" },
      { name: "z", type: "Number", optional: true, description: "z component" },
    ]},
    { name: "createGraphics", module: "Rendering", cls: "p5", description: "Creates an off-screen graphics buffer.", params: [
      { name: "w", type: "Number", description: "width in pixels" },
      { name: "h", type: "Number", description: "height in pixels" },
    ]},
    { name: "createImage", module: "Image", cls: "p5", description: "Creates a blank image object of the given size.", params: [
      { name: "w", type: "Number", description: "width in pixels" },
      { name: "h", type: "Number", description: "height in pixels" },
    ]},
  ];

  const byName = {};
  const byModule = {};
  const byClass = {};

  for (const sym of symbols) {
    const name = sym.name;
    const mod = sym.module || "Other";
    const cls = sym.cls || "p5";
    const itemtype = sym.itemtype || "method";
    const params = sym.params.map((p) => ({
      name: p.name,
      type: p.type,
      optional: !!p.optional,
      description: p.description || "",
    }));

    const entry = {
      name,
      module: mod,
      submodule: null,
      class: cls,
      itemtype,
      description: sym.description || "",
      syntax: buildSyntax(name, params),
      params,
      overloads: sym.overloads || undefined,
      chainable: false,
      isConstructor: false,
    };

    if (sym.examples) {
      entry.examples = sym.examples;
    }

    byName[name] = entry;

    if (!byModule[mod]) byModule[mod] = [];
    byModule[mod].push(name);

    if (!byClass[cls]) byClass[cls] = [];
    byClass[cls].push(name);
  }

  const output = buildOutput(byName, byModule, byClass);
  writeOutput(output);
}

const args = process.argv.slice(2);
if (args.includes("--stub")) {
  generateStub();
} else {
  generateFromRepo();
}
