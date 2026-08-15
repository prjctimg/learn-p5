import { P5Symbol } from "./types";

export const P5_SYMBOLS: P5Symbol[] = [
  {
    name: "arc",
    module: "shapes",
    description:
      "Draws an arc. An arc is a section of an ellipse defined by the x, y, w, and h parameters. x and y set the location of the arc's center. w and h set the arc's width and height. The start and stop parameters set the angles between which to draw the arc.",
    syntax: "arc(x, y, w, h, start, stop, [mode], [detail])",
    parameters: [
      { name: "x", type: "Number", description: "x-coordinate of the arc's ellipse." },
      { name: "y", type: "Number", description: "y-coordinate of the arc's ellipse." },
      { name: "w", type: "Number", description: "width of the arc's ellipse by default." },
      { name: "h", type: "Number", description: "height of the arc's ellipse by default." },
      { name: "start", type: "Number", description: "angle to start the arc, specified in radians." },
      { name: "stop", type: "Number", description: "angle to stop the arc, specified in radians." },
      { name: "mode", type: "Constant", description: "either CHORD, PIE, or OPEN." },
      { name: "detail", type: "Integer", description: "number of vertices for WebGL mode." },
    ],
    url: "https://p5js.org/reference/p5/arc/",
  },
  {
    name: "circle",
    module: "shapes",
    description:
      "Draws a circle. A circle is a round shape defined by the x, y, and d parameters. x and y set the location of its center. d sets its width and height (diameter).",
    syntax: "circle(x, y, d)",
    parameters: [
      { name: "x", type: "Number", description: "x-coordinate of the center of the circle." },
      { name: "y", type: "Number", description: "y-coordinate of the center of the circle." },
      { name: "d", type: "Number", description: "diameter of the circle." },
    ],
    url: "https://p5js.org/reference/p5/circle/",
  },
  {
    name: "ellipse",
    module: "shapes",
    description:
      "Draws an ellipse (oval). An ellipse is a round shape defined by the x, y, w, and h parameters. x and y set the location of its center. w and h set its width and height.",
    syntax: "ellipse(x, y, w, [h])",
    parameters: [
      { name: "x", type: "Number", description: "x-coordinate of the center of the ellipse." },
      { name: "y", type: "Number", description: "y-coordinate of the center of the ellipse." },
      { name: "w", type: "Number", description: "width of the ellipse." },
      { name: "h", type: "Number", description: "height of the ellipse." },
    ],
    url: "https://p5js.org/reference/p5/ellipse/",
  },
  {
    name: "line",
    module: "shapes",
    description:
      "Draws a straight line between two points. A line's default width is one pixel. To color a line, use the stroke() function. To change its width, use the strokeWeight() function.",
    syntax: "line(x1, y1, x2, y2)",
    parameters: [
      { name: "x1", type: "Number", description: "the x-coordinate of the first point." },
      { name: "y1", type: "Number", description: "the y-coordinate of the first point." },
      { name: "x2", type: "Number", description: "the x-coordinate of the second point." },
      { name: "y2", type: "Number", description: "the y-coordinate of the second point." },
    ],
    url: "https://p5js.org/reference/p5/line/",
  },
  {
    name: "point",
    module: "shapes",
    description:
      "Draws a single point in space. A point's default width is one pixel. To color a point, use the stroke() function. To change its width, use the strokeWeight() function.",
    syntax: "point(x, y, [z])",
    parameters: [
      { name: "x", type: "Number", description: "the x-coordinate." },
      { name: "y", type: "Number", description: "the y-coordinate." },
      { name: "z", type: "Number", description: "the z-coordinate (for WebGL mode)." },
    ],
    url: "https://p5js.org/reference/p5/point/",
  },
  {
    name: "quad",
    module: "shapes",
    description:
      "Draws a quadrilateral (four-sided shape). Quadrilaterals include rectangles, squares, rhombuses, and trapezoids.",
    syntax: "quad(x1, y1, x2, y2, x3, y3, x4, y4)",
    parameters: [
      { name: "x1", type: "Number", description: "the x-coordinate of the first point." },
      { name: "y1", type: "Number", description: "the y-coordinate of the first point." },
      { name: "x2", type: "Number", description: "the x-coordinate of the second point." },
      { name: "y2", type: "Number", description: "the y-coordinate of the second point." },
      { name: "x3", type: "Number", description: "the x-coordinate of the third point." },
      { name: "y3", type: "Number", description: "the y-coordinate of the third point." },
      { name: "x4", type: "Number", description: "the x-coordinate of the fourth point." },
      { name: "y4", type: "Number", description: "the y-coordinate of the fourth point." },
    ],
    url: "https://p5js.org/reference/p5/quad/",
  },
  {
    name: "rect",
    module: "shapes",
    description:
      "Draws a rectangle. A rectangle is a four-sided shape defined by the x, y, w, and h parameters. x and y set the location of its top-left corner. w sets its width and h sets its height.",
    syntax: "rect(x, y, w, [h])",
    parameters: [
      { name: "x", type: "Number", description: "x-coordinate of the rectangle." },
      { name: "y", type: "Number", description: "y-coordinate of the rectangle." },
      { name: "w", type: "Number", description: "width of the rectangle." },
      { name: "h", type: "Number", description: "height of the rectangle." },
    ],
    url: "https://p5js.org/reference/p5/rect/",
  },
  {
    name: "square",
    module: "shapes",
    description:
      "Draws a square. A square is a four-sided shape defined by the x, y, and s parameters. x and y set the location of its top-left corner. s sets its width and height.",
    syntax: "square(x, y, s, [tl], [tr], [br], [bl])",
    parameters: [
      { name: "x", type: "Number", description: "x-coordinate of the square." },
      { name: "y", type: "Number", description: "y-coordinate of the square." },
      { name: "s", type: "Number", description: "side size of the square." },
      { name: "tl", type: "Number", description: "optional radius of top-left corner." },
      { name: "tr", type: "Number", description: "optional radius of top-right corner." },
      { name: "br", type: "Number", description: "optional radius of bottom-right corner." },
      { name: "bl", type: "Number", description: "optional radius of bottom-left corner." },
    ],
    url: "https://p5js.org/reference/p5/square/",
  },
  {
    name: "triangle",
    module: "shapes",
    description:
      "Draws a triangle. A triangle is a three-sided shape defined by three points.",
    syntax: "triangle(x1, y1, x2, y2, x3, y3)",
    parameters: [
      { name: "x1", type: "Number", description: "x-coordinate of the first point." },
      { name: "y1", type: "Number", description: "y-coordinate of the first point." },
      { name: "x2", type: "Number", description: "x-coordinate of the second point." },
      { name: "y2", type: "Number", description: "y-coordinate of the second point." },
      { name: "x3", type: "Number", description: "x-coordinate of the third point." },
      { name: "y3", type: "Number", description: "y-coordinate of the third point." },
    ],
    url: "https://p5js.org/reference/p5/triangle/",
  },
  {
    name: "ellipseMode",
    module: "shapes",
    description:
      "Changes where ellipses, circles, and arcs are drawn. The mode can be CENTER, RADIUS, CORNER, or CORNERS.",
    syntax: "ellipseMode(mode)",
    parameters: [
      { name: "mode", type: "Constant", description: "either CENTER, RADIUS, CORNER, or CORNERS." },
    ],
    url: "https://p5js.org/reference/p5/ellipseMode/",
  },
  {
    name: "rectMode",
    module: "shapes",
    description:
      "Changes where rectangles and squares are drawn. The mode can be CORNER, CORNERS, CENTER, or RADIUS.",
    syntax: "rectMode(mode)",
    parameters: [
      { name: "mode", type: "Constant", description: "either CORNER, CORNERS, CENTER, or RADIUS." },
    ],
    url: "https://p5js.org/reference/p5/rectMode/",
  },
  {
    name: "strokeWeight",
    module: "shapes",
    description:
      "Sets the width of the stroke used for points, lines, and the outlines of shapes.",
    syntax: "strokeWeight(weight)",
    parameters: [
      { name: "weight", type: "Number", description: "the weight of the stroke (in pixels)." },
    ],
    url: "https://p5js.org/reference/p5/strokeWeight/",
  },
  {
    name: "stroke",
    module: "color",
    description:
      "Sets the color used to draw points, lines, and the outlines of shapes.",
    syntax: "stroke(v1, v2, v3, [alpha])",
    parameters: [
      { name: "v1", type: "Number", description: "red or hue value." },
      { name: "v2", type: "Number", description: "green or saturation value." },
      { name: "v3", type: "Number", description: "blue or brightness value." },
      { name: "alpha", type: "Number", description: "alpha value (0-255)." },
    ],
    url: "https://p5js.org/reference/p5/stroke/",
  },
  {
    name: "fill",
    module: "color",
    description:
      "Sets the color used to fill shapes. After calling fill(), all shapes drawn will be filled with the given color.",
    syntax: "fill(v1, v2, v3, [alpha])",
    parameters: [
      { name: "v1", type: "Number", description: "red or hue value." },
      { name: "v2", type: "Number", description: "green or saturation value." },
      { name: "v3", type: "Number", description: "blue or brightness value." },
      { name: "alpha", type: "Number", description: "alpha value (0-255)." },
    ],
    url: "https://p5js.org/reference/p5/fill/",
  },
  {
    name: "background",
    module: "color",
    description: "Sets the color used for the background of the canvas.",
    syntax: "background(v1, v2, v3)",
    parameters: [
      { name: "v1", type: "Number", description: "red or hue value." },
      { name: "v2", type: "Number", description: "green or saturation value." },
      { name: "v3", type: "Number", description: "blue or brightness value." },
    ],
    url: "https://p5js.org/reference/p5/background/",
  },
  {
    name: "createCanvas",
    module: "core",
    description: "Creates a canvas element on the web page.",
    syntax: "createCanvas(w, h)",
    parameters: [
      { name: "w", type: "Number", description: "width of the canvas." },
      { name: "h", type: "Number", description: "height of the canvas." },
    ],
    url: "https://p5js.org/reference/p5/createCanvas/",
  },
];

export const P5_SYMBOLS_BY_NAME: Record<string, P5Symbol> = {};
for (const sym of P5_SYMBOLS) {
  P5_SYMBOLS_BY_NAME[sym.name] = sym;
}

export const P5_FUNCTION_NAMES = P5_SYMBOLS.map((s) => s.name);

export const ONCE_ONLY_P5_FUNCTIONS = [
  "preload",
  "setup",
  "draw",
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
];
