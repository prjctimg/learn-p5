import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///docs/",
  cacheDirectory: "file:///cache/",
  EncodingType: { UTF8: "utf8", Base64: "base64" },
  getInfoAsync: jest.fn(async () => ({ exists: false })),
  makeDirectoryAsync: jest.fn(async () => {}),
  writeAsStringAsync: jest.fn(async () => {}),
  readAsStringAsync: jest.fn(async () => "function setup(){}"),
  deleteAsync: jest.fn(async () => {}),
}));

// eslint-disable-next-line import/first
import { createSketch, loadSketchspaceIndex, saveTextSketchFile, importBinaryAsset, deleteSketch } from "../../utils/playground/sketchspace";

describe("sketchspace", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("creates a sketch with default entry file", async () => {
    const sketch = await createSketch("Test Sketch");
    expect(sketch.name).toBe("Test Sketch");
    expect(sketch.entryFile).toBe("sketch.js");
    expect(sketch.files.some((f) => f.path === "sketch.js")).toBe(true);
    const index = await loadSketchspaceIndex();
    expect(index.sketches[0].id).toBe(sketch.id);
  });

  it("saves text file updates", async () => {
    const sketch = await createSketch("Code");
    const updated = await saveTextSketchFile(sketch.id, "sketch.js", "function setup(){createCanvas(1,1);}", "text/javascript", "code");
    expect(updated?.files.find((f) => f.path === "sketch.js")?.content).toContain("createCanvas");
  });

  it("imports binary assets as local files", async () => {
    const sketch = await createSketch("Assets");
    const updated = await importBinaryAsset(sketch.id, "cat.png", "QUJD", "image/png");
    expect(updated?.files.some((f) => f.path === "assets/cat.png")).toBe(true);
    expect(updated?.files.find((f) => f.path === "assets/cat.png")?.kind).toBe("asset");
  });

  it("deletes sketches from index", async () => {
    const sketch = await createSketch("Delete me");
    await deleteSketch(sketch.id);
    const index = await loadSketchspaceIndex();
    expect(index.sketches.find((s) => s.id === sketch.id)).toBeUndefined();
  });
});
