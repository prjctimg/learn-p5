import { describe, expect, it } from "@jest/globals";
import { getFullscreenPreviewHtml } from "./fullscreenPreviewHtml";
import { P5_RUNTIME_SOURCE } from "./p5-runtime.generated";

describe("getFullscreenPreviewHtml", () => {
  it("runs learner code through the guarded p5 wrapper", () => {
    const html = getFullscreenPreviewHtml("function setup() { createCanvas(100, 100); }");
    expect(html).toContain("var P5 = window.p5;");
    expect(html).toContain("new Function('p5'");
    expect(html).toContain("new P5(undefined, container)");
  });

  it("inlines the bundled p5 runtime instead of deferring it via postMessage", () => {
    const html = getFullscreenPreviewHtml("fill(0);");
    expect(html).toContain(P5_RUNTIME_SOURCE.slice(0, 200));
    expect(html).not.toContain('<script src="file://');
    expect(html).not.toContain("p5Runtime");
    expect(html).not.toContain("Update Android System WebView");
  });
});
