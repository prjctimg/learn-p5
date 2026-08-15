/* global jest */
// Wired via `setupFilesAfterEnv` (not `setupFiles`) so jest-expo's own preset
// setupFiles are preserved. Runs after the test framework is installed.

require("react-native-reanimated").setUpTests();
require("react-native-gesture-handler/jestSetup");

jest.mock("react-native-safe-area-context", () =>
  require("react-native-safe-area-context/jest/mock").default
);

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

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
