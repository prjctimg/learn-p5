import { describe, expect, it } from "@jest/globals";
import { getPlaygroundHtml } from "../../utils/editor/playgroundHtml";

describe("getPlaygroundHtml", () => {
  it("includes p5 runtime, editor, asset map and addon scripts", () => {
    const html = getPlaygroundHtml({
      code: "function setup(){createCanvas(10,10);}",
      colorScheme: "light",
      assetMap: { "assets/cat.png": "data:image/png;base64,abc" },
      addons: [
        { id: "a1", name: "addon", url: "https://example.com/addon.js", enabled: true, compatibility: "untested", addedAt: "now" },
      ],
    });
    expect(html).toContain("createCanvas(10,10)");
    expect(html).toContain("assets/cat.png");
    expect(html).toContain("https://example.com/addon.js");
    expect(html).toContain("captureFrames");
    expect(html).toContain("exportPng");
  });

  it("escapes closing script sequences in user code", () => {
    const html = getPlaygroundHtml({ code: "const x = '</script>'; ", colorScheme: "dark" });
    expect(html).not.toContain("</script>'; ");
    expect(html).toContain("<\\/script>");
  });
});
