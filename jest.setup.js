/* global jest */
// Wired via `setupFilesAfterEnv` (not `setupFiles`) so jest-expo's own preset
// setupFiles are preserved. Runs after the test framework is installed.

jest.mock("react-native-worklets", () =>
  require("react-native-worklets/lib/module/mock")
);
require("react-native-reanimated").setUpTests();
require("react-native-gesture-handler/jestSetup");

jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default
);

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Initialize test content pack for tests
const { setContentPack } = require("./src/content/store");
setContentPack({
  schemaVersion: 1,
  contentVersion: "test",
  generatedAt: new Date().toISOString(),
  p5: { version: "2.4.0-rc.1", source: "var p5=function(){};" },
  p5Assets: {},
  courses: [],
  reference: {
    byName: {
      circle: {
        name: "circle",
        itemtype: "method",
        module: "Shape",
        description: "Draws a circle",
        syntax: "circle(x, y, d)",
        params: [
          { name: "x", type: "number", description: "x" },
          { name: "y", type: "number", description: "y" },
          { name: "d", type: "number", description: "diameter" },
        ],
        examples: [],
      },
      background: {
        name: "background",
        itemtype: "method",
        module: "Color",
        description: "Sets background",
        syntax: "background(v1)",
        params: [{ name: "v1", type: "number", description: "gray" }],
        examples: [],
      },
      fill: {
        name: "fill",
        itemtype: "method",
        module: "Color",
        description: "Sets fill color",
        syntax: "fill(v1)",
        params: [{ name: "v1", type: "number", description: "gray" }],
        examples: [],
      },
      createCanvas: {
        name: "createCanvas",
        itemtype: "method",
        module: "Environment",
        description: "Creates canvas",
        syntax: "createCanvas(w, h)",
        params: [
          { name: "w", type: "number", description: "width" },
          { name: "h", type: "number", description: "height" },
        ],
        examples: [],
      },
    },
    functionNames: ["circle", "background", "fill", "createCanvas"],
    metadata: { p5Version: "2.4.0-rc.1", symbolCount: 4 },
  },
});

// react-native-svg ships no jest mock; map its elements to host components so
// SVG-based components (ModuleCover, ExerciseCard) render under jest.
const { View, Text } = require("react-native");
const svgNames = [
  "Svg", "Path", "Circle", "Line", "Rect", "Polygon", "Polyline",
  "Ellipse", "G", "Defs", "Use", "ClipPath", "Mask", "Symbol", "Marker",
  "LinearGradient", "RadialGradient", "Stop",
];
const svgMock = {};
for (const name of svgNames) {
  const isText = name === "TextPath" || name === "TSpan";
  svgMock[name] = isText ? Text : View;
}
svgMock.Text = Text;
svgMock.TextPath = Text;
svgMock.TSpan = Text;
svgMock.default = View;
jest.mock("react-native-svg", () => svgMock);
