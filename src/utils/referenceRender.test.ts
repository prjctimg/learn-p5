import { describe, it, expect } from "@jest/globals";
import {
  highlightSyntax,
  parseDescriptionBlocks,
  sanitizeCode,
} from "./referenceRender";
import { extractDescribeCaption, stripDescribe } from "./describe";

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

describe("parseDescriptionBlocks", () => {
  it("finds every fenced block even when adjacent to prose and each other", () => {
    const blocks = parseDescriptionBlocks(
      "Before```js example\ncircle(1);\n```After```js\nline(2);\n```End"
    );

    expect(blocks).toEqual([
      { type: "text", text: "Before" },
      { type: "code", code: "circle(1);", language: "js", example: true },
      { type: "text", text: "After" },
      { type: "code", code: "line(2);", language: "js", example: false },
      { type: "text", text: "End" },
    ]);
  });

  it("converts adjacent HTML code blocks before parsing", () => {
    const blocks = parseDescriptionBlocks(
      '<pre><code class="language-js example">circle(1);</code></pre>' +
        '<pre><code class="language-js">line(2);</code></pre>'
    );

    expect(blocks.filter((block) => block.type === "code")).toEqual([
      { type: "code", code: "circle(1);", language: "js", example: true },
      { type: "code", code: "line(2);", language: "js", example: false },
    ]);
  });

  it("only flags the example token after the language", () => {
    const [block] = parseDescriptionBlocks("```js example\ncircle(1);\n```");
    expect(block).toEqual({ type: "code", code: "circle(1);", language: "js", example: true });
  });

  it("leaves unmatched fences as text", () => {
    const blocks = parseDescriptionBlocks("Before ```js\ncircle(1);");
    expect(blocks).toEqual([{ type: "text", text: "Before ```js\ncircle(1);" }]);
  });
});

describe("sanitizeCode", () => {
  it("removes malformed HTML wrappers without dropping trailing code", () => {
    const code = sanitizeCode(`<div>
<code>
let x = 1;
</code>
</div>
function draw() {
  circle(x, 1, 2);
}`);

    expect(code).toBe("let x = 1;\n\n\nfunction draw() {\n  circle(x, 1, 2);\n}");
    expect(code).not.toMatch(/<\/?div|<\/?code/);
  });

  it("keeps HTML-looking strings and comparison operators inside examples", () => {
    const code = sanitizeCode(`<div>
<code>
let div = createDiv('<h3>p5*js</h3>');
if (mouseX < width && mouseY > 0) {
  circle(1, 1, 2);
}
</code>
</div>`);

    expect(code).toContain("<h3>p5*js</h3>");
    expect(code).toContain("mouseX < width && mouseY > 0");
    expect(code).not.toMatch(/^\s*<div>/);
  });

  it("decodes entities in code before highlighting", () => {
    const code = sanitizeCode("<code>if (a &lt; b) text('&amp;');</code>");
    expect(code).toBe("if (a < b) text('&');");
    expect(highlightSyntax(code, "dark").map((token) => token.text).join("")).toBe(code);
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
