import { describe, expect, it } from "@jest/globals";
import { P5_COMPAT_POLYFILL } from "./p5Html";

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
