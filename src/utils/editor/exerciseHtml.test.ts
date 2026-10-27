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
  it("declares UTF-8 and captures the p5 constructor before learner code runs", () => {
    const html = getExerciseHtml(baseParams);
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain("var P5_CTOR = window.p5;");
    expect(html).toContain("var runUserCode = new Function('p5'");
    expect(html).toContain("new P5_CTOR(undefined, container)");
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
      const html = getExerciseHtml(baseParams);
      expect(html).toContain("<\\/script>");
    } finally {
      setContentPack(pack);
    }
  });
});
