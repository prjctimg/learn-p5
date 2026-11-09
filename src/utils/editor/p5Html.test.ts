import { describe, expect, it } from "@jest/globals";
import { P5_COMPAT_POLYFILL, p5RuntimeScript } from "./p5Html";

describe("P5_COMPAT_POLYFILL", () => {
  it.each([
    "Object.fromEntries",
    "Object.entries",
    "Object.values",
    "Object.hasOwn",
    "String.prototype.replaceAll",
    'define(String.prototype, "padStart"',
    'define(String.prototype, "padEnd"',
    'define(Array.prototype, "at"',
    'define(Array.prototype, "flat"',
    'define(Array.prototype, "flatMap"',
    'define(String.prototype, "at"',
    "Intl.getCanonicalLocales",
    "structuredClone",
    "queueMicrotask",
    "setImmediate",
    "AbortController",
    "globalThis",
    "Object.assign",
    "Array.from",
    "Number.isFinite",
    "Number.isInteger",
    'define(Array.prototype, "includes"',
    'define(Array.prototype, "find"',
    'define(Array.prototype, "findIndex"',
    'define(String.prototype, "includes"',
    'define(String.prototype, "startsWith"',
    'define(String.prototype, "endsWith"',
    'define(String.prototype, "repeat"',
    'define(String.prototype, "trimStart"',
    'define(String.prototype, "trimEnd"',
    "Promise.prototype.finally",
    "Promise.allSettled",
    "TextEncoder",
    "TextDecoder",
    'define(root.Element.prototype, "remove"',
    'define(root.Element.prototype, "closest"',
  ])("provides the %s fallback used by the p5 runtime", (api) => {
    expect(P5_COMPAT_POLYFILL).toContain(api);
  });

  it("is plain ES5 that can run before p5 is parsed", () => {
    const script = P5_COMPAT_POLYFILL.replace(/^<script>\n?/, "").replace(
      /\n?<\/script>$/,
      ""
    );
    expect(script).not.toMatch(/\b(?:const|let|class)\b|=>/);
    expect(() => new Function(script)).not.toThrow();
  });
});

describe("p5RuntimeScript", () => {
  it("inlines the bundled runtime and escapes closing script tags", () => {
    const html = p5RuntimeScript({ inlineSource: "var p5=function(){};\n</script>" });
    expect(html).toBe("<script>var p5=function(){};\n<\\/script></script>");
  });

  it("returns an empty string when no runtime source is given", () => {
    expect(p5RuntimeScript({ inlineSource: null })).toBe("");
    expect(p5RuntimeScript({})).toBe("");
  });
});
