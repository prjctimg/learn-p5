import { describe, expect, it } from "@jest/globals";
import { polyfillScript, p5RuntimeScript, errorCaptureScript } from "./p5Html";
import { CORE_JS_BUNDLE, CORE_JS_VERSION } from "./polyfill.generated";

describe("polyfillScript", () => {
  it("inlines the core-js bundle and escapes closing script tags", () => {
    expect(CORE_JS_VERSION).toBe("3.51.0");
    expect(CORE_JS_BUNDLE.length).toBeGreaterThan(100_000);
    const script = polyfillScript();
    expect(script.startsWith("<script>")).toBe(true);
    expect(script.endsWith("</script>")).toBe(true);
    expect(script).not.toContain("</script>var");
  });

  it("is non-empty and parses as script content", () => {
    expect(() => new Function(CORE_JS_BUNDLE)).not.toThrow();
  });
});

describe("p5RuntimeScript", () => {
  it("inlines the bundled runtime and escapes closing script tags", () => {
    const html = p5RuntimeScript({
      inlineSource: "var p5=function(){};\n</script>",
    });
    expect(html).toBe(
      "<script>var p5=function(){};\n<\\/script></script>"
    );
  });

  it("returns an empty string when no runtime source is given", () => {
    expect(p5RuntimeScript({ inlineSource: null })).toBe("");
    expect(p5RuntimeScript({})).toBe("");
  });
});

describe("errorCaptureScript", () => {
  it("installs raw error capture helpers", () => {
    const script = errorCaptureScript();
    expect(script).toContain("window.__setP5Error");
    expect(script).toContain("window.__getP5Error");
    expect(script).toContain("window.__p5Error");
  });
});
