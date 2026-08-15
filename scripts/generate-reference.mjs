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
      { name: "x", type: "Number" }, { name: "y", type: "Number" },
      { name: "w", type: "Number" }, { name: "h", type: "Number" },
      { name: "start", type: "Number" }, { name: "stop", type: "Number" },
      { name: "mode", type: "Constant", optional: true },
      { name: "detail", type: "Integer", optional: true },
    ]},
    { name: "circle", module: "Shape", cls: "p5", description: "Draws a circle on the canvas at the given position and diameter.", params: [
      { name: "x", type: "Number" }, { name: "y", type: "Number" }, { name: "d", type: "Number" },
    ], examples: ["circle(200, 200, 100);"] },
    { name: "ellipse", module: "Shape", cls: "p5", description: "Draws an ellipse (oval) on the canvas.", params: [
      { name: "x", type: "Number" }, { name: "y", type: "Number" },
      { name: "w", type: "Number" }, { name: "h", type: "Number", optional: true },
    ], examples: ["ellipse(200, 200, 150, 100);"] },
    { name: "line", module: "Shape", cls: "p5", description: "Draws a line between two points.", params: [
      { name: "x1", type: "Number" }, { name: "y1", type: "Number" },
      { name: "x2", type: "Number" }, { name: "y2", type: "Number" },
    ], examples: ["line(100, 100, 300, 300);"] },
    { name: "point", module: "Shape", cls: "p5", description: "Draws a point at the given coordinate.", params: [
      { name: "x", type: "Number" }, { name: "y", type: "Number" }, { name: "z", type: "Number", optional: true },
    ]},
    { name: "quad", module: "Shape", cls: "p5", description: "Draws a quadrilateral shape defined by four corners.", params: [
      { name: "x1", type: "Number" }, { name: "y1", type: "Number" },
      { name: "x2", type: "Number" }, { name: "y2", type: "Number" },
      { name: "x3", type: "Number" }, { name: "y3", type: "Number" },
      { name: "x4", type: "Number" }, { name: "y4", type: "Number" },
    ]},
    { name: "rect", module: "Shape", cls: "p5", description: "Draws a rectangle on the canvas.", params: [
      { name: "x", type: "Number" }, { name: "y", type: "Number" },
      { name: "w", type: "Number" }, { name: "h", type: "Number", optional: true },
    ], examples: ["rect(150, 150, 200, 100);"] },
    { name: "square", module: "Shape", cls: "p5", description: "Draws a square on the canvas.", params: [
      { name: "x", type: "Number" }, { name: "y", type: "Number" }, { name: "s", type: "Number" },
      { name: "tl", type: "Number", optional: true }, { name: "tr", type: "Number", optional: true },
      { name: "br", type: "Number", optional: true }, { name: "bl", type: "Number", optional: true },
    ]},
    { name: "triangle", module: "Shape", cls: "p5", description: "Draws a triangle defined by three vertices.", params: [
      { name: "x1", type: "Number" }, { name: "y1", type: "Number" },
      { name: "x2", type: "Number" }, { name: "y2", type: "Number" },
      { name: "x3", type: "Number" }, { name: "y3", type: "Number" },
    ]},
    { name: "ellipseMode", module: "Shape", cls: "p5", description: "Sets the origin for drawing ellipses and circles.", params: [
      { name: "mode", type: "Constant" },
    ]},
    { name: "rectMode", module: "Shape", cls: "p5", description: "Sets the origin for drawing rectangles.", params: [
      { name: "mode", type: "Constant" },
    ]},
    { name: "strokeWeight", module: "Shape", cls: "p5", description: "Sets the width of the stroke used for lines, points, and borders.", params: [
      { name: "weight", type: "Number" },
    ]},
    { name: "stroke", module: "Color", cls: "p5", description: "Sets the color used for drawing lines and borders around shapes.", params: [
      { name: "v1", type: "Number" }, { name: "v2", type: "Number", optional: true },
      { name: "v3", type: "Number", optional: true }, { name: "alpha", type: "Number", optional: true },
    ]},
    { name: "fill", module: "Color", cls: "p5", description: "Sets the color used to fill shapes.", params: [
      { name: "v1", type: "Number" }, { name: "v2", type: "Number", optional: true },
      { name: "v3", type: "Number", optional: true }, { name: "alpha", type: "Number", optional: true },
    ], examples: ["fill(255, 0, 0);\ncircle(200, 200, 100);"] },
    { name: "background", module: "Color", cls: "p5", description: "Sets the background color of the canvas.", params: [
      { name: "v1", type: "Number" }, { name: "v2", type: "Number", optional: true },
      { name: "v3", type: "Number", optional: true }, { name: "alpha", type: "Number", optional: true },
    ], examples: ["background(220);"] },
    { name: "noStroke", module: "Color", cls: "p5", description: "Disables drawing the stroke (outline) for shapes.", params: [] },
    { name: "noFill", module: "Color", cls: "p5", description: "Disables filling the interior of shapes.", params: [] },
    { name: "color", module: "Color", cls: "p5", description: "Creates a color object from the given values.", params: [
      { name: "v1", type: "Number" }, { name: "v2", type: "Number", optional: true },
      { name: "v3", type: "Number", optional: true }, { name: "alpha", type: "Number", optional: true },
    ]},
    { name: "colorMode", module: "Color", cls: "p5", description: "Changes the color mode for the sketch.", params: [
      { name: "mode", type: "Constant" },
    ]},
    { name: "createCanvas", module: "Environment", cls: "p5", description: "Creates a canvas element of the given size.", params: [
      { name: "w", type: "Number" }, { name: "h", type: "Number" },
    ]},
    { name: "resizeCanvas", module: "Environment", cls: "p5", description: "Resizes the canvas to the given width and height.", params: [
      { name: "w", type: "Number" }, { name: "h", type: "Number" },
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
      { name: "contents", type: "Any" },
    ]},
    { name: "frameCount", module: "Environment", cls: "p5", itemtype: "property", description: "The number of frames that have been displayed since the sketch started.", params: [] },
    { name: "frameRate", module: "Environment", cls: "p5", description: "Specifies the number of frames to be displayed every second.", params: [
      { name: "fps", type: "Number", optional: true },
    ]},
    { name: "mouseX", module: "Events", cls: "p5", itemtype: "property", description: "The current horizontal position of the mouse.", params: [] },
    { name: "mouseY", module: "Events", cls: "p5", itemtype: "property", description: "The current vertical position of the mouse.", params: [] },
    { name: "mousePressed", module: "Events", cls: "p5", description: "Called when the mouse button is pressed.", params: [
      { name: "event", type: "Object", optional: true },
    ]},
    { name: "mouseReleased", module: "Events", cls: "p5", description: "Called when the mouse button is released.", params: [
      { name: "event", type: "Object", optional: true },
    ]},
    { name: "mouseMoved", module: "Events", cls: "p5", description: "Called when the mouse is moved.", params: [
      { name: "event", type: "Object", optional: true },
    ]},
    { name: "keyPressed", module: "Events", cls: "p5", description: "Called when a key is pressed.", params: [
      { name: "event", type: "Object", optional: true },
    ]},
    { name: "keyReleased", module: "Events", cls: "p5", description: "Called when a key is released.", params: [
      { name: "event", type: "Object", optional: true },
    ]},
    { name: "keyTyped", module: "Events", cls: "p5", description: "Called when a typed key is detected.", params: [
      { name: "event", type: "Object", optional: true },
    ]},
    { name: "width", module: "Environment", cls: "p5", itemtype: "property", description: "The width of the canvas.", params: [] },
    { name: "height", module: "Environment", cls: "p5", itemtype: "property", description: "The height of the canvas.", params: [] },
    { name: "random", module: "Math", cls: "p5", description: "Returns a random number or picks a random item from an array.", params: [
      { name: "low", type: "Number", optional: true },
      { name: "high", type: "Number", optional: true },
    ]},
    { name: "randomSeed", module: "Math", cls: "p5", description: "Sets the seed value for random().", params: [
      { name: "seed", type: "Number" },
    ]},
    { name: "floor", module: "Math", cls: "p5", description: "Returns the largest integer less than or equal to the value.", params: [
      { name: "n", type: "Number" },
    ]},
    { name: "ceil", module: "Math", cls: "p5", description: "Returns the smallest integer greater than or equal to the value.", params: [
      { name: "n", type: "Number" },
    ]},
    { name: "round", module: "Math", cls: "p5", description: "Returns the value rounded to the nearest integer.", params: [
      { name: "n", type: "Number" },
    ]},
    { name: "map", module: "Math", cls: "p5", description: "Re-maps a number from one range to another.", params: [
      { name: "value", type: "Number" }, { name: "start1", type: "Number" },
      { name: "stop1", type: "Number" }, { name: "start2", type: "Number" },
      { name: "stop2", type: "Number" },
    ]},
    { name: "constrain", module: "Math", cls: "p5", description: "Constrains a value between a minimum and maximum.", params: [
      { name: "value", type: "Number" }, { name: "low", type: "Number" },
      { name: "high", type: "Number" },
    ]},
    { name: "lerp", module: "Math", cls: "p5", description: "Calculates a number between two numbers at a specific increment.", params: [
      { name: "start", type: "Number" }, { name: "stop", type: "Number" },
      { name: "amt", type: "Number" },
    ]},
    { name: "dist", module: "Math", cls: "p5", description: "Calculates the distance between two points.", params: [
      { name: "x1", type: "Number" }, { name: "y1", type: "Number" },
      { name: "x2", type: "Number" }, { name: "y2", type: "Number" },
    ]},
    { name: "sin", module: "Math", cls: "p5", description: "Returns the sine of an angle.", params: [{ name: "angle", type: "Number" }] },
    { name: "cos", module: "Math", cls: "p5", description: "Returns the cosine of an angle.", params: [{ name: "angle", type: "Number" }] },
    { name: "tan", module: "Math", cls: "p5", description: "Returns the tangent of an angle.", params: [{ name: "angle", type: "Number" }] },
    { name: "abs", module: "Math", cls: "p5", description: "Returns the absolute value of a number.", params: [{ name: "n", type: "Number" }] },
    { name: "sqrt", module: "Math", cls: "p5", description: "Returns the square root of a number.", params: [{ name: "n", type: "Number" }] },
    { name: "sq", module: "Math", cls: "p5", description: "Returns the square of a number (n * n).", params: [{ name: "n", type: "Number" }] },
    { name: "pow", module: "Math", cls: "p5", description: "Returns the value of a number raised to an exponent.", params: [
      { name: "n", type: "Number" }, { name: "e", type: "Number" },
    ]},
    { name: "text", module: "Typography", cls: "p5", description: "Draws text to the canvas at the given position.", params: [
      { name: "str", type: "String" }, { name: "x", type: "Number" },
      { name: "y", type: "Number" },
    ]},
    { name: "textSize", module: "Typography", cls: "p5", description: "Sets the font size for text.", params: [
      { name: "size", type: "Number" },
    ]},
    { name: "textFont", module: "Typography", cls: "p5", description: "Sets the font family for text.", params: [
      { name: "font", type: "String" },
    ]},
    { name: "textAlign", module: "Typography", cls: "p5", description: "Sets the alignment for drawing text.", params: [
      { name: "alignX", type: "Constant" }, { name: "alignY", type: "Constant", optional: true },
    ]},
    { name: "loadImage", module: "Image", cls: "p5", description: "Loads an image from the given path.", params: [
      { name: "path", type: "String" },
    ]},
    { name: "image", module: "Image", cls: "p5", description: "Draws an image to the canvas.", params: [
      { name: "img", type: "p5.Image" }, { name: "x", type: "Number" },
      { name: "y", type: "Number" },
    ]},
    { name: "loadSound", module: "Sound", cls: "p5", description: "Loads a sound file from the given path.", params: [
      { name: "path", type: "String" },
    ]},
    { name: "millis", module: "Environment", cls: "p5", description: "Returns the number of milliseconds since the sketch started.", params: [] },
    { name: "second", module: "Environment", cls: "p5", description: "Returns the current second as a value from 0 to 59.", params: [] },
    { name: "minute", module: "Environment", cls: "p5", description: "Returns the current minute as a value from 0 to 59.", params: [] },
    { name: "hour", module: "Environment", cls: "p5", description: "Returns the current hour as a value from 0 to 23.", params: [] },
    { name: "day", module: "Environment", cls: "p5", description: "Returns the current day as a value from 1 to 31.", params: [] },
    { name: "month", module: "Environment", cls: "p5", description: "Returns the current month as a value from 1 to 12.", params: [] },
    { name: "year", module: "Environment", cls: "p5", description: "Returns the current year as a four-digit value.", params: [] },
    { name: "createVector", module: "Math", cls: "p5", description: "Creates a new vector with the given components.", params: [
      { name: "x", type: "Number", optional: true },
      { name: "y", type: "Number", optional: true },
      { name: "z", type: "Number", optional: true },
    ]},
    { name: "createGraphics", module: "Rendering", cls: "p5", description: "Creates an off-screen graphics buffer.", params: [
      { name: "w", type: "Number" }, { name: "h", type: "Number" },
    ]},
    { name: "createImage", module: "Image", cls: "p5", description: "Creates a blank image object of the given size.", params: [
      { name: "w", type: "Number" }, { name: "h", type: "Number" },
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
      description: "",
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
