import { describe, expect, it } from "@jest/globals";
import { getContentPack, setContentPack } from "../../content/store";
import { getFullscreenPreviewHtml } from "./fullscreenPreviewHtml";

describe("getFullscreenPreviewHtml", () => {
  it("runs learner code through the guarded p5 wrapper", () => {
    const html = getFullscreenPreviewHtml("function setup() { createCanvas(100, 100); }");
    expect(html).toContain("var P5 = window.p5;");
    expect(html).toContain("new Function('p5'");
    expect(html).toContain("new P5(undefined, container)");
  });

  it("escapes closing script tags in the inlined p5 runtime", () => {
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
      const html = getFullscreenPreviewHtml("fill(0);");
      expect(html).toContain("<\\/script>");
    } finally {
      setContentPack(pack);
    }
  });
});
