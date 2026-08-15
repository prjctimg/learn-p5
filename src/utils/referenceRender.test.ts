import { describe, it, expect } from "@jest/globals";
import {
  highlightSyntax,
  stripDescribe,
  extractDescribeCaption,
} from "./referenceRender";

describe("highlightSyntax", () => {
  it("returns the raw code as a single default-colored token when nothing matches", () => {
    const tokens = highlightSyntax("???", "dark");
    expect(tokens).toHaveLength(1);
    expect(tokens[0].text).toBe("???");
  });

  it("tags p5 function names with the function color", () => {
    const tokens = highlightSyntax("circle(10, 10, 20);", "dark");
    const fn = tokens.find((t) => t.text === "circle");
    expect(fn).toBeDefined();
    expect(fn!.color).toBeDefined();
  });

  it("does not colorize a p5 name that is not followed by a paren", () => {
    const tokens = highlightSyntax("const circle = 5;", "dark");
    expect(tokens.find((t) => t.text === "circle")).toBeUndefined();
  });

  it("colorizes numeric literals separately", () => {
    const tokens = highlightSyntax("background(200);", "dark");
    expect(tokens.find((t) => t.text === "200")).toBeDefined();
  });

  it("colorizes a comment and a string literal", () => {
    const tokens = highlightSyntax("// hi\nfill('red');", "dark");
    expect(tokens.find((t) => t.text === "// hi")).toBeDefined();
    expect(tokens.find((t) => t.text === "'red'")).toBeDefined();
  });

  it("does not duplicate overlapping tokens (sorted, non-overlapping output)", () => {
    const code = "let x = 5; // five";
    const tokens = highlightSyntax(code, "light");
    const rebuilt = tokens.map((t) => t.text).join("");
    expect(rebuilt).toBe(code);
  });

  it("preserves the full source when concatenated", () => {
    const code = "function draw() {\n  background(0);\n  // done\n}";
    const tokens = highlightSyntax(code, "dark");
    expect(tokens.map((t) => t.text).join("")).toBe(code);
  });
});

describe("extractDescribeCaption", () => {
  it("extracts a double-quoted caption", () => {
    expect(extractDescribeCaption('describe("My exercise");')).toBe("My exercise");
  });

  it("extracts a single-quoted caption", () => {
    expect(extractDescribeCaption("describe('Other');")).toBe("Other");
  });

  it("returns null when there is no describe call", () => {
    expect(extractDescribeCaption("no describe here")).toBeNull();
  });
});

describe("stripDescribe", () => {
  it("removes a leading describe line", () => {
    expect(stripDescribe('describe("Cap");\ncircle(1, 2, 3);')).toBe("circle(1, 2, 3);");
  });

  it("returns the input unchanged when no describe is present", () => {
    expect(stripDescribe("circle(1, 2, 3);")).toBe("circle(1, 2, 3);");
  });
});
