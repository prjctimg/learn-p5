import { describe, it, expect } from "@jest/globals";
import { getExampleHtml } from "./exampleHtml";
import { P5_RUNTIME_SOURCE } from "./p5-runtime.generated";
import { CORE_JS_BUNDLE } from "./polyfill.generated";

describe("getExampleHtml", () => {
  it("embeds the sketch between the script tags", () => {
    const html = getExampleHtml("createCanvas(400, 400);");
    expect(html).toContain("<script>");
    expect(html).toMatch(/<script>[\s\S]*createCanvas\(400, 400\);[\s\S]*<\/script>/);
  });

  it("wraps a bare expression in setup() when the sketch has no setup function", () => {
    const html = getExampleHtml("background(0);");
    expect(html).toContain("function setup() {");
    expect(html).toContain("  createCanvas(400, 400);");
  });

  it("does not wrap sketches that already define setup", () => {
    const code = "function setup() {\n  createCanvas(200, 200);\n}";
    const html = getExampleHtml(code);
    expect(html.match(/function setup\(\)/g)).toHaveLength(1);
  });

  it("normalizes any literal createCanvas to 400x400 when setup is present", () => {
    const html = getExampleHtml("function setup() {\n  createCanvas(123, 456);\n}");
    expect(html).toContain("createCanvas(400, 400)");
    expect(html).not.toContain("createCanvas(123, 456)");
  });

  it("leaves non-literal createCanvas calls alone", () => {
    const code = "function setup() {\n  createCanvas(w, h);\n}";
    const html = getExampleHtml(code);
    expect(html).toContain("createCanvas(w, h)");
  });

  it("does not substitute placeholders when the code has none", () => {
    const html = getExampleHtml("ellipse(0, 0, 10);");
    expect(html).not.toContain("__P5_ASSET__");
  });

  it("declares UTF-8 and inlines the bundled p5 runtime", () => {
    const html = getExampleHtml("fill(0);");
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(html).toContain(CORE_JS_BUNDLE.slice(0, 100));
    expect(html.indexOf(CORE_JS_BUNDLE.slice(0, 100))).toBeLessThan(
      html.indexOf(P5_RUNTIME_SOURCE.slice(0, 200))
    );
    expect(html).not.toContain('<script src="file://');
  });

  it("loads p5, polyfills, and fonts as files when URLs are supplied", () => {
    const html = getExampleHtml("fill(0);", "light", {
      p5Url: "p5.min.js",
      polyfillUrl: "core-js.js",
      fontRegularUrl: "regular.ttf",
      fontBoldUrl: "bold.ttf",
    });
    expect(html).toContain('<script src="p5.min.js"');
    expect(html).toContain('<script src="core-js.js"');
    expect(html).toContain('url("regular.ttf")');
    expect(html).toContain('url("bold.ttf")');
    expect(html).not.toContain(P5_RUNTIME_SOURCE.slice(0, 200));
  });
});
