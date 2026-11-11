import { describe, expect, it } from "@jest/globals";
import { getExerciseHtml } from "./exerciseHtml";
import { P5_RUNTIME_SOURCE, P5_RUNTIME_VERSION } from "./p5-runtime.generated";
import { CORE_JS_BUNDLE } from "./polyfill.generated";

const baseParams = {
  title: "Test",
  moduleName: "Module",
  instruction: "Draw a circle.",
  exerciseNumber: 1,
  startingCode: "",
  solution: "",
  colorScheme: "light" as const,
};

describe("getExerciseHtml", () => {
  it("evaluates learner code in a fresh, per-instance scope", () => {
    const html = getExerciseHtml(baseParams);
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain("new Function(");
    expect(html).toContain("with (__p5scope)");
    expect(html).toContain("runUserSketch(code, p)");
    expect(html).toContain("new window.p5(makeSketch(code), container)");
    expect(html).not.toContain("document.querySelector('canvas')");
    expect(html).toContain("if (rendered === false) return;");
    expect(html).toContain("typeof CM === 'undefined'");
    expect(html).not.toContain("(0, eval)(code)");
    expect(html).not.toContain("window.__setP5Error");
    expect(html).not.toContain("rawP5Error");
    expect(html).not.toContain("bundled runtime failed to load");
    expect(html).not.toContain("Update Android System WebView");
    expect(html).not.toContain("getP5Constructor");
    expect(html).not.toContain("new Function('p5'");
  });

  it("inlines polyfill and bundled p5 runtime in order", () => {
    const html = getExerciseHtml(baseParams);
    expect(P5_RUNTIME_VERSION).toBe("2.4.0-rc.1");
    expect(html).toContain(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(html).not.toContain('<script src="file://');
    expect(html).not.toContain("case 'p5Runtime':");
    expect(html).not.toContain("p5RuntimeReady");
    const polyfillIdx = html.indexOf(CORE_JS_BUNDLE.slice(0, 100));
    const p5Idx = html.indexOf(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(polyfillIdx).toBeGreaterThan(-1);
    expect(polyfillIdx).toBeLessThan(p5Idx);
  });

  it("loads runtime assets as files when URLs are available", () => {
    const html = getExerciseHtml(baseParams, {
      baseUrl: "file:///cache/p5-runtime/",
      p5Url: "p5-2.4.0-rc.1-100.js",
      polyfillUrl: "core-js-3.51.0-100.js",
      codemirrorUrl: "codemirror-6-100.js",
      fontRegularUrl: "jetbrains-mono-regular-1-100.ttf",
      fontBoldUrl: "jetbrains-mono-bold-1-100.ttf",
    });
    expect(html).toContain('<script src="p5-2.4.0-rc.1-100.js"');
    expect(html).toContain('<script src="core-js-3.51.0-100.js"');
    expect(html).toContain('<script src="codemirror-6-100.js"');
    expect(html).toContain('url("jetbrains-mono-regular-1-100.ttf")');
    expect(html).toContain('url("jetbrains-mono-bold-1-100.ttf")');
    expect(html).not.toContain(P5_RUNTIME_SOURCE.slice(0, 200));
  });
});
