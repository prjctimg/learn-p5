import { describe, it, expect } from "@jest/globals";
import { getContentPack, setContentPack } from "../../content/store";
import { getExampleHtml } from "./exampleHtml";

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

  it("declares UTF-8 and escapes closing script tags in embedded source", () => {
    const pack = getContentPack();
    expect(pack).not.toBeNull();
    try {
      setContentPack({
        ...pack!,
        p5: {
          ...pack!.p5,
          source: "/*! p5.js v2.4.0-rc.1 */\nvar p5=function(){};\n</script>",
        },
      });
      const html = getExampleHtml("fill(0);");
      expect(html).toContain('<meta charset="utf-8">');
      expect(html).toContain("<\\/script>");
    } finally {
      setContentPack(pack);
    }
  });
});
