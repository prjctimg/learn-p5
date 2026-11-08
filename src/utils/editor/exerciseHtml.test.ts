import { describe, expect, it } from "@jest/globals";
import { getContentPack, setContentPack } from "../../content/store";
import { getExerciseHtml } from "./exerciseHtml";

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
    expect(html).toContain("case 'p5Runtime':");
  });

  it("omits the runtime script tag when injection is requested", () => {
    const pack = getContentPack();
    expect(pack).not.toBeNull();
    try {
      setContentPack({
        ...pack!,
        p5FileUri: "file:///data/user/0/com.learnp5/files/content/p5.min.js",
      });
      const html = getExerciseHtml({ ...baseParams, injectP5Runtime: true });
      expect(html).not.toContain('<script src="file:///data/user/0/com.learnp5/files/content/p5.min.js"></script>');
      expect(html).not.toContain("var p5=function(){}");
    } finally {
      setContentPack(pack);
    }
  });

  it("escapes closing script tags in the inlined p5 runtime", () => {
    const pack = getContentPack();
    expect(pack).not.toBeNull();
    try {
      setContentPack({
        ...pack!,
        p5: {
          version: "2.4.0-rc.1",
          source: "/*! p5.js v2.4.0-rc.1 */\nvar p5=function(){};\n</script>",
        },
      });
      const html = getExerciseHtml(baseParams);
      expect(html).toContain("<\\/script>");
    } finally {
      setContentPack(pack);
    }
  });

  it("loads p5 from a file script tag when a script URI is present", () => {
    const pack = getContentPack();
    expect(pack).not.toBeNull();
    try {
      setContentPack({
        ...pack!,
        p5FileUri: "file:///data/user/0/com.learnp5/files/content/p5.min.js\"&<onload>",
      });
      const html = getExerciseHtml(baseParams);
      expect(html).toContain('<script src="file:///data/user/0/com.learnp5/files/content/p5.min.js&quot;&amp;&lt;onload&gt;"></script>');
      expect(html).not.toContain("var p5=function(){}");
    } finally {
      setContentPack(pack);
    }
  });
});
