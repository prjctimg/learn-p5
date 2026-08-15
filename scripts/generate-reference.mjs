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

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<code>/gi, "")
    .replace(/<\/code>/gi, "")
    .replace(/<a[^>]*>/gi, "")
    .replace(/<\/a>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function flattenParams(params) {
  if (!Array.isArray(params)) return [];
  return params.map((p) => ({
    name: p.name,
    type: p.type || "Any",
    optional: p.optional === 1 || p.optional === true,
    description: stripHtml(p.description || ""),
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
      p5Version: "2.3.0",
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
    console.log("Falling back to stub data...");
    generateStub();
    return;
  }

  const refRoot = path.join(tmpDir, REF_DIR);
  if (!fs.existsSync(refRoot)) {
    console.error(`Reference directory not found: ${refRoot}`);
    console.log("Falling back to stub data...");
    fs.rmSync(tmpDir, { recursive: true, force: true });
    generateStub();
    return;
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

  let skipped = 0;
  for (const file of mdxFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const frontmatter = parseMdxFrontmatter(content);
    if (!frontmatter || !frontmatter.title) {
      skipped++;
      continue;
    }

    const name = frontmatter.title;
    const mod = frontmatter.module || "Other";
    const cls = frontmatter.class || "p5";

    const topParams = flattenParams(frontmatter.params);
    const overloads = (frontmatter.overloads || []).map((o) => ({
      params: flattenParams(o.params),
      chainable: o.chainable === 1 || o.chainable === true,
    }));

    const params = topParams.length > 0 ? topParams
      : overloads.length > 0 ? overloads[0].params
      : [];

    const symbol = {
      name,
      module: mod,
      submodule: frontmatter.submodule || null,
      class: cls,
      itemtype: frontmatter.itemtype || "method",
      description: stripHtml(frontmatter.description || ""),
      syntax: buildSyntax(name, params),
      params,
      overloads: overloads.length > 0 ? overloads : undefined,
      chainable: frontmatter.chainable === 1 || frontmatter.chainable === true,
      isConstructor: !!frontmatter.isConstructor,
    };

    if (frontmatter.example) {
      const examples = Array.isArray(frontmatter.example)
        ? frontmatter.example
        : [frontmatter.example];
      symbol.examples = examples
        .map((ex) => (typeof ex === "string" ? ex.trim() : String(ex).trim()))
        .filter((ex) => ex.length > 0);
    }

    byName[name] = symbol;

    if (!byModule[mod]) byModule[mod] = [];
    byModule[mod].push(name);

    if (!byClass[cls]) byClass[cls] = [];
    byClass[cls].push(name);
  }

  if (skipped > 0) console.log(`  Skipped ${skipped} files (no frontmatter)`);

  const output = buildOutput(byName, byModule, byClass);
  writeOutput(output);

  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function generateStub() {
  console.log("Generating stub reference data (offline)...");

  const symbols = [
    { name: "arc", module: "Shape", submodule: "2D Primitives", cls: "p5", description: "Draws an arc on the canvas.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the arc's center." },
      { name: "y", type: "Number", description: "y-coordinate of the arc's center." },
      { name: "w", type: "Number", description: "width of the arc's ellipse." },
      { name: "h", type: "Number", description: "height of the arc's ellipse." },
      { name: "start", type: "Number", description: "angle to start the arc, in radians." },
      { name: "stop", type: "Number", description: "angle to stop the arc, in radians." },
      { name: "mode", type: "Constant", optional: true, description: "arc drawing mode (OPEN, CHORD, PIE)." },
      { name: "detail", type: "Integer", optional: true, description: "number of ellipse segments." },
    ]},
    { name: "circle", module: "Shape", submodule: "2D Primitives", cls: "p5", description: "Draws a circle on the canvas.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the circle's center." },
      { name: "y", type: "Number", description: "y-coordinate of the circle's center." },
      { name: "d", type: "Number", description: "diameter of the circle." },
    ], examples: ["circle(50, 50, 25);"] },
    { name: "ellipse", module: "Shape", submodule: "2D Primitives", cls: "p5", description: "Draws an ellipse (oval) on the canvas.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the ellipse's center." },
      { name: "y", type: "Number", description: "y-coordinate of the ellipse's center." },
      { name: "w", type: "Number", description: "width of the ellipse." },
      { name: "h", type: "Number", optional: true, description: "height of the ellipse (defaults to width)." },
    ], examples: ["ellipse(50, 50, 40, 30);"] },
    { name: "line", module: "Shape", submodule: "2D Primitives", cls: "p5", description: "Draws a straight line between two points.", params: [
      { name: "x1", type: "Number", description: "x-coordinate of the first point." },
      { name: "y1", type: "Number", description: "y-coordinate of the first point." },
      { name: "x2", type: "Number", description: "x-coordinate of the second point." },
      { name: "y2", type: "Number", description: "y-coordinate of the second point." },
    ], examples: ["line(0, 0, 100, 100);"] },
    { name: "point", module: "Shape", submodule: "2D Primitives", cls: "p5", description: "Draws a single point in space.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the point." },
      { name: "y", type: "Number", description: "y-coordinate of the point." },
      { name: "z", type: "Number", optional: true, description: "z-coordinate of the point." },
    ]},
    { name: "quad", module: "Shape", submodule: "2D Primitives", cls: "p5", description: "Draws a quadrilateral (four-sided shape).", params: [
      { name: "x1", type: "Number", description: "x-coordinate of the first corner." },
      { name: "y1", type: "Number", description: "y-coordinate of the first corner." },
      { name: "x2", type: "Number", description: "x-coordinate of the second corner." },
      { name: "y2", type: "Number", description: "y-coordinate of the second corner." },
      { name: "x3", type: "Number", description: "x-coordinate of the third corner." },
      { name: "y3", type: "Number", description: "y-coordinate of the third corner." },
      { name: "x4", type: "Number", description: "x-coordinate of the fourth corner." },
      { name: "y4", type: "Number", description: "y-coordinate of the fourth corner." },
    ]},
    { name: "rect", module: "Shape", submodule: "2D Primitives", cls: "p5", description: "Draws a rectangle on the canvas.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the rectangle's corner." },
      { name: "y", type: "Number", description: "y-coordinate of the rectangle's corner." },
      { name: "w", type: "Number", description: "width of the rectangle." },
      { name: "h", type: "Number", optional: true, description: "height of the rectangle (defaults to width)." },
    ], examples: ["rect(30, 20, 55, 55);"] },
    { name: "square", module: "Shape", submodule: "2D Primitives", cls: "p5", description: "Draws a square on the canvas.", params: [
      { name: "x", type: "Number", description: "x-coordinate of the square's corner." },
      { name: "y", type: "Number", description: "y-coordinate of the square's corner." },
      { name: "s", type: "Number", description: "side length of the square." },
      { name: "tl", type: "Number", optional: true, description: "top-left corner radius." },
      { name: "tr", type: "Number", optional: true, description: "top-right corner radius." },
      { name: "br", type: "Number", optional: true, description: "bottom-right corner radius." },
      { name: "bl", type: "Number", optional: true, description: "bottom-left corner radius." },
    ]},
    { name: "triangle", module: "Shape", submodule: "2D Primitives", cls: "p5", description: "Draws a triangle defined by three vertices.", params: [
      { name: "x1", type: "Number", description: "x-coordinate of the first vertex." },
      { name: "y1", type: "Number", description: "y-coordinate of the first vertex." },
      { name: "x2", type: "Number", description: "x-coordinate of the second vertex." },
      { name: "y2", type: "Number", description: "y-coordinate of the second vertex." },
      { name: "x3", type: "Number", description: "x-coordinate of the third vertex." },
      { name: "y3", type: "Number", description: "y-coordinate of the third vertex." },
    ]},
    { name: "ellipseMode", module: "Shape", submodule: "Attributes", cls: "p5", description: "Changes where ellipses, circles, and arcs are drawn.", params: [
      { name: "mode", type: "Constant", description: "CENTER, RADIUS, CORNER, or CORNERS." },
    ]},
    { name: "rectMode", module: "Shape", submodule: "Attributes", cls: "p5", description: "Changes where rectangles and squares are drawn.", params: [
      { name: "mode", type: "Constant", description: "CENTER, RADIUS, CORNER, or CORNERS." },
    ]},
    { name: "strokeWeight", module: "Shape", submodule: "Attributes", cls: "p5", description: "Sets the width of the stroke used for points, lines, and the outlines of shapes.", params: [
      { name: "weight", type: "Number", description: "stroke weight in pixels." },
    ]},
    { name: "stroke", module: "Color", submodule: "Setting", cls: "p5", description: "Sets the color used to draw points, lines, and the outlines of shapes.", params: [
      { name: "v1", type: "Number", description: "gray value, red value, or hue." },
      { name: "v2", type: "Number", optional: true, description: "green, saturation, or alpha value." },
      { name: "v3", type: "Number", optional: true, description: "blue or brightness value." },
      { name: "alpha", type: "Number", optional: true, description: "alpha (transparency) value." },
    ]},
    { name: "fill", module: "Color", submodule: "Setting", cls: "p5", description: "Sets the color used to fill shapes.", params: [
      { name: "v1", type: "Number", description: "gray value, red value, or hue." },
      { name: "v2", type: "Number", optional: true, description: "green, saturation, or alpha value." },
      { name: "v3", type: "Number", optional: true, description: "blue or brightness value." },
      { name: "alpha", type: "Number", optional: true, description: "alpha (transparency) value." },
    ], examples: ["fill(255, 0, 0);"] },
    { name: "background", module: "Color", submodule: "Setting", cls: "p5", description: "Sets the color used for the background of the canvas.", params: [
      { name: "v1", type: "Number", description: "gray value, red value, or hue." },
      { name: "v2", type: "Number", optional: true, description: "green, saturation, or alpha value." },
      { name: "v3", type: "Number", optional: true, description: "blue or brightness value." },
      { name: "alpha", type: "Number", optional: true, description: "alpha (transparency) value." },
    ], examples: ["background(220);"] },
    { name: "noStroke", module: "Color", submodule: "Setting", cls: "p5", description: "Disables drawing points, lines, and the outlines of shapes.", params: [] },
    { name: "noFill", module: "Color", submodule: "Setting", cls: "p5", description: "Disables setting the fill color for shapes.", params: [] },
    { name: "color", module: "Color", submodule: "Creating & Reading", cls: "p5", description: "Creates a p5.Color object.", params: [
      { name: "v1", type: "Number", description: "gray value, red value, or hue." },
      { name: "v2", type: "Number", optional: true, description: "green, saturation, or alpha value." },
      { name: "v3", type: "Number", optional: true, description: "blue or brightness value." },
      { name: "alpha", type: "Number", optional: true, description: "alpha (transparency) value." },
    ]},
    { name: "colorMode", module: "Color", submodule: "Setting", cls: "p5", description: "Changes the way color values are interpreted.", params: [
      { name: "mode", type: "Constant", description: "RGB or HSB." },
    ]},
    { name: "createCanvas", module: "Rendering", submodule: "Rendering", cls: "p5", description: "Creates a canvas element on the web page.", params: [
      { name: "width", type: "Number", optional: true, description: "width of the canvas. Defaults to 100." },
      { name: "height", type: "Number", optional: true, description: "height of the canvas. Defaults to 100." },
      { name: "renderer", type: "P2D|WEBGL", optional: true, description: "either P2D or WEBGL. Defaults to P2D." },
    ]},
    { name: "resizeCanvas", module: "Rendering", submodule: "Rendering", cls: "p5", description: "Resizes the canvas to a given width and height.", params: [
      { name: "width", type: "Number", description: "new width in pixels." },
      { name: "height", type: "Number", description: "new height in pixels." },
    ]},
    { name: "noCanvas", module: "Rendering", submodule: "Rendering", cls: "p5", description: "Removes the default canvas.", params: [] },
    { name: "setup", module: "Structure", submodule: "Structure", cls: "p5", description: "Called once when the sketch starts, used to define initial properties.", params: [] },
    { name: "draw", module: "Structure", submodule: "Structure", cls: "p5", description: "Called continuously after setup, executes the main drawing code.", params: [] },
    { name: "preload", module: "Structure", submodule: "Structure", cls: "p5", description: "Called before setup, used to load external assets.", params: [] },
    { name: "loop", module: "Structure", submodule: "Structure", cls: "p5", description: "Resumes the draw loop after noLoop has stopped it.", params: [] },
    { name: "noLoop", module: "Structure", submodule: "Structure", cls: "p5", description: "Stops the draw loop from continuously executing.", params: [] },
    { name: "redraw", module: "Structure", submodule: "Structure", cls: "p5", description: "Executes the draw function once when noLoop is active.", params: [] },
    { name: "push", module: "Transform", submodule: "Transform", cls: "p5", description: "Begins a drawing group that contains its own styles and transformations.", params: [] },
    { name: "pop", module: "Transform", submodule: "Transform", cls: "p5", description: "Ends a drawing group that contains its own styles and transformations.", params: [] },
    { name: "print", module: "Environment", submodule: "Environment", cls: "p5", description: "Displays text in the web browser's console.", params: [
      { name: "contents", type: "Any", description: "the content to print to the console." },
    ]},
    { name: "frameCount", module: "Environment", submodule: "Environment", cls: "p5", itemtype: "property", description: "A Number variable that tracks the number of frames drawn since the sketch started.", params: [] },
    { name: "frameRate", module: "Environment", submodule: "Environment", cls: "p5", description: "Sets the number of frames to draw per second.", params: [
      { name: "fps", type: "Number", optional: true, description: "target frames per second." },
    ]},
    { name: "mouseX", module: "Events", submodule: "Mouse", cls: "p5", itemtype: "property", description: "A Number variable that stores the current horizontal position of the mouse.", params: [] },
    { name: "mouseY", module: "Events", submodule: "Mouse", cls: "p5", itemtype: "property", description: "A Number variable that stores the current vertical position of the mouse.", params: [] },
    { name: "mousePressed", module: "Events", submodule: "Mouse", cls: "p5", description: "Called when the mouse button is pressed.", params: [
      { name: "event", type: "Object", optional: true, description: "optional MouseEvent object." },
    ]},
    { name: "mouseReleased", module: "Events", submodule: "Mouse", cls: "p5", description: "Called when the mouse button is released.", params: [
      { name: "event", type: "Object", optional: true, description: "optional MouseEvent object." },
    ]},
    { name: "mouseMoved", module: "Events", submodule: "Mouse", cls: "p5", description: "Called when the mouse is moved.", params: [
      { name: "event", type: "Object", optional: true, description: "optional MouseEvent object." },
    ]},
    { name: "keyPressed", module: "Events", submodule: "Keyboard", cls: "p5", description: "Called when a key is pressed.", params: [
      { name: "event", type: "Object", optional: true, description: "optional KeyboardEvent object." },
    ]},
    { name: "keyReleased", module: "Events", submodule: "Keyboard", cls: "p5", description: "Called when a key is released.", params: [
      { name: "event", type: "Object", optional: true, description: "optional KeyboardEvent object." },
    ]},
    { name: "keyTyped", module: "Events", submodule: "Keyboard", cls: "p5", description: "Called when a typed key is detected.", params: [
      { name: "event", type: "Object", optional: true, description: "optional KeyboardEvent object." },
    ]},
    { name: "width", module: "Environment", submodule: "Environment", cls: "p5", itemtype: "property", description: "A Number variable that stores the width of the canvas in pixels.", params: [] },
    { name: "height", module: "Environment", submodule: "Environment", cls: "p5", itemtype: "property", description: "A Number variable that stores the height of the canvas in pixels.", params: [] },
    { name: "random", module: "Math", submodule: "Math", cls: "p5", description: "Returns a random number or picks a random item from an array.", params: [
      { name: "low", type: "Number", optional: true, description: "lower bound or array to pick from." },
      { name: "high", type: "Number", optional: true, description: "upper bound." },
    ]},
    { name: "randomSeed", module: "Math", submodule: "Math", cls: "p5", description: "Sets the seed value for random().", params: [
      { name: "seed", type: "Number", description: "seed value for the random number generator." },
    ]},
    { name: "floor", module: "Math", submodule: "Math", cls: "p5", description: "Returns the largest integer less than or equal to the value.", params: [
      { name: "n", type: "Number", description: "the value to floor." },
    ]},
    { name: "ceil", module: "Math", submodule: "Math", cls: "p5", description: "Returns the smallest integer greater than or equal to the value.", params: [
      { name: "n", type: "Number", description: "the value to ceil." },
    ]},
    { name: "round", module: "Math", submodule: "Math", cls: "p5", description: "Returns the value rounded to the nearest integer.", params: [
      { name: "n", type: "Number", description: "the value to round." },
    ]},
    { name: "map", module: "Math", submodule: "Math", cls: "p5", description: "Re-maps a number from one range to another.", params: [
      { name: "value", type: "Number", description: "the value to map." },
      { name: "start1", type: "Number", description: "lower bound of the source range." },
      { name: "stop1", type: "Number", description: "upper bound of the source range." },
      { name: "start2", type: "Number", description: "lower bound of the target range." },
      { name: "stop2", type: "Number", description: "upper bound of the target range." },
    ]},
    { name: "constrain", module: "Math", submodule: "Math", cls: "p5", description: "Constrains a value between a minimum and maximum.", params: [
      { name: "value", type: "Number", description: "the value to constrain." },
      { name: "low", type: "Number", description: "minimum boundary." },
      { name: "high", type: "Number", description: "maximum boundary." },
    ]},
    { name: "lerp", module: "Math", submodule: "Math", cls: "p5", description: "Calculates a number between two numbers at a specific increment.", params: [
      { name: "start", type: "Number", description: "start value." },
      { name: "stop", type: "Number", description: "end value." },
      { name: "amt", type: "Number", description: "interpolation amount between 0 and 1." },
    ]},
    { name: "dist", module: "Math", submodule: "Math", cls: "p5", description: "Calculates the distance between two points.", params: [
      { name: "x1", type: "Number", description: "x-coordinate of the first point." },
      { name: "y1", type: "Number", description: "y-coordinate of the first point." },
      { name: "x2", type: "Number", description: "x-coordinate of the second point." },
      { name: "y2", type: "Number", description: "y-coordinate of the second point." },
    ]},
    { name: "sin", module: "Math", submodule: "Math", cls: "p5", description: "Returns the sine of an angle.", params: [{ name: "angle", type: "Number", description: "angle in radians." }] },
    { name: "cos", module: "Math", submodule: "Math", cls: "p5", description: "Returns the cosine of an angle.", params: [{ name: "angle", type: "Number", description: "angle in radians." }] },
    { name: "tan", module: "Math", submodule: "Math", cls: "p5", description: "Returns the tangent of an angle.", params: [{ name: "angle", type: "Number", description: "angle in radians." }] },
    { name: "abs", module: "Math", submodule: "Math", cls: "p5", description: "Returns the absolute value of a number.", params: [{ name: "n", type: "Number", description: "the value." }] },
    { name: "sqrt", module: "Math", submodule: "Math", cls: "p5", description: "Returns the square root of a number.", params: [{ name: "n", type: "Number", description: "the value." }] },
    { name: "sq", module: "Math", submodule: "Math", cls: "p5", description: "Returns the square of a number (n * n).", params: [{ name: "n", type: "Number", description: "the value to square." }] },
    { name: "pow", module: "Math", submodule: "Math", cls: "p5", description: "Returns the value of a number raised to an exponent.", params: [
      { name: "n", type: "Number", description: "the base value." },
      { name: "e", type: "Number", description: "the exponent." },
    ]},
    { name: "text", module: "Typography", submodule: "Typography", cls: "p5", description: "Draws text to the canvas.", params: [
      { name: "str", type: "String", description: "the text string to display." },
      { name: "x", type: "Number", description: "x-coordinate of the text." },
      { name: "y", type: "Number", description: "y-coordinate of the text." },
    ]},
    { name: "textSize", module: "Typography", submodule: "Typography", cls: "p5", description: "Sets or gets the current text size.", params: [
      { name: "size", type: "Number", description: "font size in pixels." },
    ]},
    { name: "textFont", module: "Typography", submodule: "Typography", cls: "p5", description: "Sets the font used by the text() function.", params: [
      { name: "font", type: "String|p5.Font", description: "the font name or p5.Font object." },
    ]},
    { name: "textAlign", module: "Typography", submodule: "Typography", cls: "p5", description: "Sets the way text is aligned when text() is called.", params: [
      { name: "alignX", type: "Constant", description: "horizontal alignment (LEFT, CENTER, RIGHT)." },
      { name: "alignY", type: "Constant", optional: true, description: "vertical alignment (TOP, CENTER, BOTTOM)." },
    ]},
    { name: "loadImage", module: "Image", submodule: "Loading & Displaying", cls: "p5", description: "Loads an image to create a p5.Image object.", params: [
      { name: "path", type: "String", description: "path to the image file." },
    ]},
    { name: "image", module: "Image", submodule: "Loading & Displaying", cls: "p5", description: "Draws an image to the canvas.", params: [
      { name: "img", type: "p5.Image", description: "the image to display." },
      { name: "x", type: "Number", description: "x-coordinate of the image." },
      { name: "y", type: "Number", description: "y-coordinate of the image." },
    ]},
    { name: "loadSound", module: "Sound", submodule: "Sound", cls: "p5.sound", description: "Loads a sound file from the given path.", params: [
      { name: "path", type: "String", description: "path to the sound file." },
    ]},
    { name: "millis", module: "Environment", submodule: "Time", cls: "p5", description: "Returns the number of milliseconds since the sketch started.", params: [] },
    { name: "second", module: "Environment", submodule: "Time", cls: "p5", description: "Returns the current second as a value from 0 to 59.", params: [] },
    { name: "minute", module: "Environment", submodule: "Time", cls: "p5", description: "Returns the current minute as a value from 0 to 59.", params: [] },
    { name: "hour", module: "Environment", submodule: "Time", cls: "p5", description: "Returns the current hour as a value from 0 to 23.", params: [] },
    { name: "day", module: "Environment", submodule: "Time", cls: "p5", description: "Returns the current day as a value from 1 to 31.", params: [] },
    { name: "month", module: "Environment", submodule: "Time", cls: "p5", description: "Returns the current month as a value from 1 to 12.", params: [] },
    { name: "year", module: "Environment", submodule: "Time", cls: "p5", description: "Returns the current year as a four-digit value.", params: [] },
    { name: "createVector", module: "Math", submodule: "Math", cls: "p5", description: "Creates a new p5.Vector with the given components.", params: [
      { name: "x", type: "Number", optional: true, description: "x component." },
      { name: "y", type: "Number", optional: true, description: "y component." },
      { name: "z", type: "Number", optional: true, description: "z component." },
    ]},
    { name: "createGraphics", module: "Rendering", submodule: "Rendering", cls: "p5", description: "Creates a p5.Graphics object.", params: [
      { name: "w", type: "Number", description: "width in pixels." },
      { name: "h", type: "Number", description: "height in pixels." },
    ]},
    { name: "createImage", module: "Image", submodule: "Image", cls: "p5", description: "Creates a new p5.Image object.", params: [
      { name: "w", type: "Number", description: "width in pixels." },
      { name: "h", type: "Number", description: "height in pixels." },
    ]},
    { name: "translate", module: "Transform", submodule: "Transform", cls: "p5", description: "Translates the coordinate system.", params: [
      { name: "x", type: "Number", description: "left/right translation." },
      { name: "y", type: "Number", description: "up/down translation." },
    ]},
    { name: "rotate", module: "Transform", submodule: "Transform", cls: "p5", description: "Rotates the coordinate system.", params: [
      { name: "angle", type: "Number", description: "angle of rotation specified in radians." },
    ]},
    { name: "scale", module: "Transform", submodule: "Transform", cls: "p5", description: "Scales the coordinate system.", params: [
      { name: "s", type: "Number", description: "scaling factor." },
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
      submodule: sym.submodule || null,
      class: cls,
      itemtype,
      description: sym.description || "",
      syntax: buildSyntax(name, params),
      params,
      overloads: undefined,
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
