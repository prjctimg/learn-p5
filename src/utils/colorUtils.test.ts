import { describe, it, expect } from "@jest/globals";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hslToHex,
  luminance,
  contrastRatio,
  bestOnColor,
  deriveColorsFromAccent,
  deriveAccentShades,
} from "./colorUtils";

describe("hexToRgb", () => {
  it("parses #RRGGBB", () => {
    expect(hexToRgb("#ED225D")).toEqual({ r: 237, g: 34, b: 93 });
  });

  it("parses without a leading hash", () => {
    expect(hexToRgb("000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("parses white and black", () => {
    expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("rgbToHex", () => {
  it("formats #RRGGBB with zero padding", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
  });

  it("clamps and rounds", () => {
    expect(rgbToHex(-10, 300, 127.6)).toBe("#00ff80");
  });
});

describe("rgbToHsl round-trips through hslToRgb", () => {
  it("preserves an accent color within rounding", () => {
    const rgb = hexToRgb("#ED225D");
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const back = hslToRgb(h, s, l);
    expect(rgbToHex(back.r, back.g, back.b)).toBe("ed225d");
  });

  it("treats pure gray as zero saturation", () => {
    expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: expect.closeTo(50.2, 1) });
  });

  it("hslToRgb handles zero saturation (grayscale)", () => {
    expect(hslToRgb(120, 0, 50)).toEqual({ r: 128, g: 128, b: 128 });
  });

  it("hslToRgb pure red at h=0", () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe("hslToHex", () => {
  it("returns a #rrggbb string", () => {
    expect(hslToHex(0, 100, 50)).toBe("#ff0000");
  });
});

describe("luminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(luminance(0, 0, 0)).toBe(0);
    expect(luminance(255, 255, 255)).toBeCloseTo(1, 10);
  });
});

describe("contrastRatio and bestOnColor", () => {
  it("gives ~21:1 for black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it("gives ~1:1 for identical colors", () => {
    expect(contrastRatio("#ED225D", "#ED225D")).toBeCloseTo(1, 5);
  });

  it("picks white on a dark background", () => {
    expect(bestOnColor("#000000")).toBe("#FFFFFF");
  });

  it("picks dark on a light background", () => {
    expect(bestOnColor("#FFFFFF")).toBe("#1C1B1F");
  });
});

describe("deriveColorsFromAccent", () => {
  it("keeps the accent as primary in both modes", () => {
    expect(deriveColorsFromAccent("#ED225D", false).primary).toBe("#ED225D");
    expect(deriveColorsFromAccent("#ED225D", true).primary).toBe("#ED225D");
  });

  it("produces valid hex for every derived key", () => {
    for (const isDark of [false, true]) {
      const colors = deriveColorsFromAccent("#ED225D", isDark);
      for (const [key, value] of Object.entries(colors)) {
        expect(key.length).toBeGreaterThan(0);
        expect(value).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("changes derived colors between light and dark mode", () => {
    const light = deriveColorsFromAccent("#ED225D", false);
    const dark = deriveColorsFromAccent("#ED225D", true);
    expect(light.primaryContainer).not.toBe(dark.primaryContainer);
  });
});

describe("deriveAccentShades", () => {
  it("returns the accent as medium and valid hex elsewhere", () => {
    const shades = deriveAccentShades("#ED225D");
    expect(shades.medium).toBe("#ED225D");
    for (const value of Object.values(shades)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
