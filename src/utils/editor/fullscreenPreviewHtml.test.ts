import { describe, expect, it } from "@jest/globals";
import { getFullscreenPreviewHtml } from "./fullscreenPreviewHtml";
import { P5_RUNTIME_SOURCE } from "./p5-runtime.generated";
import { CORE_JS_BUNDLE } from "./polyfill.generated";

describe("getFullscreenPreviewHtml", () => {
  it("evaluates learner code in a fresh, per-instance scope and reports raw errors", () => {
    const html = getFullscreenPreviewHtml(
      "function setup() { createCanvas(100, 100); }"
    );
    expect(html).toContain("with (__p5scope)");
    expect(html).toContain("new window.p5(function(p)");
    expect(html).not.toContain("document.querySelector('canvas')");
    expect(html).toContain("window.__setP5Error");
    expect(html).toContain("showError");
    expect(html).not.toContain("bundled runtime failed to load");
    expect(html).not.toContain("new Function('p5'");
  });

  it("inlines error capture, polyfill, and p5 runtime in order", () => {
    const html = getFullscreenPreviewHtml("fill(0);");
    expect(html).toContain(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(html).toContain(CORE_JS_BUNDLE.slice(0, 100));
    const captureIdx = html.indexOf("window.__setP5Error");
    const polyfillIdx = html.indexOf(CORE_JS_BUNDLE.slice(0, 100));
    const p5Idx = html.indexOf(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(captureIdx).toBeGreaterThan(-1);
    expect(captureIdx).toBeLessThan(polyfillIdx);
    expect(polyfillIdx).toBeLessThan(p5Idx);
    expect(html).not.toContain('<script src="file://');
    expect(html).not.toContain("p5Runtime");
  });

  it("loads p5 and polyfills as files when URLs are supplied", () => {
    const html = getFullscreenPreviewHtml("fill(0);", "dark", {
      p5Url: "p5.min.js",
      polyfillUrl: "core-js.js",
    });
    expect(html).toContain('<script src="p5.min.js"');
    expect(html).toContain('<script src="core-js.js"');
    expect(html).not.toContain(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(html).toContain("fill(0);");
  });
});
