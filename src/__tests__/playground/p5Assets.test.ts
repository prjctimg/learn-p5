import { describe, expect, it } from "@jest/globals";
import { detectP5AssetType, evaluateAddonCompatibility, isP5SupportedAsset } from "../../utils/playground/p5Assets";

describe("p5Assets", () => {
  it("detects supported image assets", () => {
    expect(detectP5AssetType("photo.png")?.loader).toBe("loadImage");
    expect(isP5SupportedAsset("photo.jpg")).toBe(true);
  });

  it("detects model and font assets", () => {
    expect(detectP5AssetType("mesh.obj")?.loader).toBe("loadModel");
    expect(detectP5AssetType("font.ttf")?.loader).toBe("loadFont");
  });

  it("flags audio as requiring p5.sound", () => {
    const t = detectP5AssetType("song.mp3");
    expect(t?.loader).toBe("loadSound");
    expect(t?.requiresAddon).toBe("p5.sound");
  });

  it("marks incompatible addon majors", () => {
    const result = evaluateAddonCompatibility({
      id: "legacy",
      name: "Legacy",
      description: "",
      url: "https://example.com/lib.js",
      p5Major: [1],
    });
    expect(result.compatibility === "incompatible" || result.compatibility === "untested").toBe(true);
    expect(result.message).toContain("p5.js");
  });

  it("marks unknown addons as untested/unknown", () => {
    const result = evaluateAddonCompatibility({
      id: "x",
      name: "X",
      description: "",
      url: "https://example.com/x.js",
    });
    expect(["unknown", "untested"]).toContain(result.compatibility);
  });
});
