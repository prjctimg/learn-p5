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
  it("evaluates learner code directly and shows raw errors", () => {
    const html = getExerciseHtml(baseParams);
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain("(0, eval)(code)");
    expect(html).toContain("new window.p5()");
    expect(html).toContain("window.__setP5Error");
    expect(html).toContain("rawP5Error");
    expect(html).not.toContain("bundled runtime failed to load");
    expect(html).not.toContain("Update Android System WebView");
    expect(html).not.toContain("getP5Constructor");
    expect(html).not.toContain("new Function('p5'");
  });

  it("inlines error capture, polyfill, and bundled p5 runtime in order", () => {
    const html = getExerciseHtml(baseParams);
    expect(P5_RUNTIME_VERSION).toBe("2.4.0-rc.1");
    expect(html).toContain(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(html).not.toContain('<script src="file://');
    expect(html).not.toContain("case 'p5Runtime':");
    expect(html).not.toContain("p5RuntimeReady");
    const captureIdx = html.indexOf("window.__setP5Error");
    const polyfillIdx = html.indexOf(CORE_JS_BUNDLE.slice(0, 100));
    const p5Idx = html.indexOf(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(captureIdx).toBeGreaterThan(-1);
    expect(captureIdx).toBeLessThan(polyfillIdx);
    expect(polyfillIdx).toBeLessThan(p5Idx);
  });
});
