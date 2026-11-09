import { describe, expect, it } from "@jest/globals";
import { getExerciseHtml } from "./exerciseHtml";
import { P5_RUNTIME_SOURCE, P5_RUNTIME_VERSION } from "./p5-runtime.generated";

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
  it("declares UTF-8 and resolves the p5 constructor before learner code runs", () => {
    const html = getExerciseHtml(baseParams);
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain("function getP5Constructor()");
    expect(html).toContain("var runUserCode = new Function('p5'");
    expect(html).toContain("new p5Ctor(undefined, container)");
  });

  it("inlines the bundled p5 runtime instead of fetching or injecting it", () => {
    const html = getExerciseHtml(baseParams);
    expect(P5_RUNTIME_VERSION).toBe("2.4.0-rc.1");
    expect(html).toContain(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(html).not.toContain('<script src="file://');
    expect(html).not.toContain("case 'p5Runtime':");
    expect(html).not.toContain("p5RuntimeReady");
    // The ES5 polyfill runs before the runtime so older WebViews can parse it.
    expect(html.indexOf("learn-p5-runtime-compat")).toBeGreaterThan(-1);
    expect(html.indexOf("learn-p5-runtime-compat")).toBeLessThan(
      html.indexOf(P5_RUNTIME_SOURCE.slice(0, 200))
    );
  });

  it("does not blame the WebView when the runtime is missing", () => {
    const html = getExerciseHtml(baseParams);
    expect(html).not.toContain("Update Android System WebView");
  });
});
