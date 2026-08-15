import { describe, it, expect } from "@jest/globals";
import {
  evaluateRules,
  schemaErrors,
  pixelMatches,
  effectiveTolerance,
  effectiveMinPassFraction,
  hasPixelRules,
  hasSyncRules,
  PIXEL_DEFAULT_TOLERANCE,
  PIXEL_DEFAULT_MIN_PASS_FRACTION,
  RULE_SCHEMAS,
  RULE_TYPES,
} from "./validation";
import { analyzeCode } from "../../test/lezerAdapter";
import type { ValidationRule } from "../../data/types";

function evalRules(code: string, rules: ValidationRule[]) {
  return evaluateRules(analyzeCode(code), rules);
}

describe("analyze", () => {
  it("finds plain function calls with argument counts", () => {
    const a = analyzeCode("createCanvas(400, 400);");
    expect(a.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "createCanvas", args: 2, member: false }),
      ])
    );
  });

  it("reports zero arguments for a bare call", () => {
    const a = analyzeCode("noLoop();");
    expect(a.calls).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "noLoop", args: 0 })])
    );
  });

  it("finds member calls and strips the object", () => {
    const a = analyzeCode("vec.add(1, 2);");
    expect(a.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "add", args: 2, member: true }),
      ])
    );
  });

  it("finds chained member calls", () => {
    const a = analyzeCode("p5.vector.add(1);");
    expect(a.calls).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "add", member: true })])
    );
  });

  it("counts nested call arguments independently", () => {
    const a = analyzeCode("fill(random(255), 0, 0);");
    expect(a.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "fill", args: 3 }),
        expect.objectContaining({ name: "random", args: 1 }),
      ])
    );
  });

  it("treats `new` expressions as calls", () => {
    const a = analyzeCode("new p5.Vector(1, 2);");
    expect(a.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Vector", args: 2, member: true }),
      ])
    );
  });

  it("does not count spread tokens as arguments", () => {
    const a = analyzeCode("foo(...xs);");
    expect(a.calls).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "foo", args: 1 })])
    );
  });

  it("captures literal canvas sizes", () => {
    const a = analyzeCode("createCanvas(200, 300);");
    expect(a.canvasPresent).toBe(true);
    expect(a.canvas).toEqual({ width: 200, height: 300 });
  });

  it("marks canvas present but unresolved when size is not literal", () => {
    const a = analyzeCode("createCanvas(width, height);");
    expect(a.canvasPresent).toBe(true);
    expect(a.canvas).toBeNull();
  });

  it("does not flag a missing createCanvas", () => {
    const a = analyzeCode("background(255);");
    expect(a.canvasPresent).toBe(false);
    expect(a.canvas).toBeNull();
  });

  it("collects function declarations", () => {
    const a = analyzeCode("function draw() { background(0); }");
    expect(a.functionDefs.has("draw")).toBe(true);
  });

  it("collects arrow functions assigned to const/let/var", () => {
    const a = analyzeCode("const f = () => {}; let g = () => {}; var h = function() {};");
    expect(a.functionDefs.has("f")).toBe(true);
    expect(a.functionDefs.has("g")).toBe(true);
    expect(a.functionDefs.has("h")).toBe(true);
  });

  it("collects object method names", () => {
    const a = analyzeCode("const obj = { add() { return 1; } };");
    expect(a.functionDefs.has("add")).toBe(true);
  });

  it("collects class method names", () => {
    const a = analyzeCode("class Shape { render() {} }");
    expect(a.functionDefs.has("render")).toBe(true);
  });

  it("does not collect non-function variables", () => {
    const a = analyzeCode("const x = 5;");
    expect(a.functionDefs.has("x")).toBe(false);
  });
});

describe("evaluateRules", () => {
  it("passes a satisfied functionCall rule", () => {
    const r = evalRules("circle(10, 10, 20);", [{ type: "functionCall", name: "circle" }]);
    expect(r.passed).toBe(true);
  });

  it("fails a functionCall rule with an actionable reason", () => {
    const r = evalRules("rect(0, 0, 10, 10);", [{ type: "functionCall", name: "circle" }]);
    expect(r).toEqual({ passed: false, reason: "Add a circle() call" });
  });

  it("enforces exactArgs", () => {
    const rules: ValidationRule[] = [{ type: "functionCall", name: "translate", exactArgs: 2 }];
    expect(evalRules("translate(150, 150);", rules).passed).toBe(true);
    const r = evalRules("translate(150);", rules);
    expect(r.passed).toBe(false);
    expect(r.reason).toBe("translate() needs 2 arguments");
  });

  it("enforces minArgs", () => {
    const rules: ValidationRule[] = [{ type: "functionCall", name: "line", minArgs: 4 }];
    expect(evalRules("line(0, 0, 10, 10);", rules).passed).toBe(true);
    const r = evalRules("line(0, 0, 10);", rules);
    expect(r.passed).toBe(false);
    expect(r.reason).toBe("line() needs at least 4 arguments");
  });

  it("satisfies exactArgs when any matching call has the right arity", () => {
    const rules: ValidationRule[] = [{ type: "functionCall", name: "fill", exactArgs: 3 }];
    expect(evalRules("fill(10, 20, 30);", rules).passed).toBe(true);
  });

  it("passes a defined functionExists rule", () => {
    const r = evalRules("function setup() {} function draw() {}", [
      { type: "functionExists", name: "draw" },
    ]);
    expect(r.passed).toBe(true);
  });

  it("fails an undefined functionExists rule", () => {
    const r = evalRules("function setup() {}", [{ type: "functionExists", name: "draw" }]);
    expect(r).toEqual({ passed: false, reason: "Define a draw() function" });
  });

  it("passes a matching canvasSize rule", () => {
    const r = evalRules("createCanvas(400, 400);", [
      { type: "canvasSize", width: 400, height: 400 },
    ]);
    expect(r.passed).toBe(true);
  });

  it("fails a mismatched canvasSize rule", () => {
    const r = evalRules("createCanvas(400, 400);", [
      { type: "canvasSize", width: 200, height: 400 },
    ]);
    expect(r).toEqual({ passed: false, reason: "Canvas should be 200x400" });
  });

  it("fails canvasSize when no canvas is created", () => {
    const r = evalRules("background(0);", [{ type: "canvasSize", width: 400, height: 400 }]);
    expect(r).toEqual({ passed: false, reason: "Use createCanvas() to set canvas size" });
  });

  it("ignores pixel rules (renderer-checked)", () => {
    const r = evalRules("background(0);", [
      { type: "pixelMatch", x: 1, y: 1, expected: [0, 0, 0] },
      { type: "expectedPixels", points: [{ x: 1, y: 1, expected: [0, 0, 0] }] },
    ]);
    expect(r.passed).toBe(true);
  });

  it("passes empty and null rules", () => {
    expect(evalRules("circle(1, 2, 3);", []).passed).toBe(true);
    expect(evaluateRules(analyzeCode("x;"), null).passed).toBe(true);
  });
});

describe("schemaErrors", () => {
  it("returns no problems for well-formed rules", () => {
    expect(
      schemaErrors([
        { type: "functionCall", name: "translate", exactArgs: 2 },
        { type: "pixelMatch", x: 0, y: 0, expected: [255, 0, 0], tolerance: 5 },
      ])
    ).toEqual([]);
  });

  it("returns no problems for null/undefined rules", () => {
    expect(schemaErrors(null)).toEqual([]);
    expect(schemaErrors(undefined)).toEqual([]);
  });

  it("flags unknown rule types", () => {
    const problems = schemaErrors([{ type: "bogus" } as unknown as ValidationRule]);
    expect(problems).toEqual([expect.stringContaining("unknown rule type 'bogus'")]);
  });

  it("flags missing required fields", () => {
    const problems = schemaErrors([{ type: "canvasSize", width: 400 } as unknown as ValidationRule]);
    expect(problems).toEqual([
      expect.stringContaining("missing required field 'height'"),
    ]);
  });

  it("flags unknown fields (typo guard)", () => {
    const problems = schemaErrors([
      { type: "functionCall", name: "x", excatArgs: 2 } as unknown as ValidationRule,
    ]);
    expect(problems).toEqual([
      expect.stringContaining("unknown field 'excatArgs'"),
    ]);
  });

  it("flags wrong field types", () => {
    const problems = schemaErrors([
      { type: "functionCall", name: 123 } as unknown as ValidationRule,
    ]);
    expect(problems).toEqual([
      expect.stringContaining("field 'name' must be a string"),
    ]);
  });

  it("flags malformed pixelMatch expected values", () => {
    const problems = schemaErrors([
      { type: "pixelMatch", x: 0, y: 0, expected: [255, 0] } as unknown as ValidationRule,
    ]);
    expect(problems).toEqual([
      expect.stringContaining("must be an [r, g, b] array of three numbers"),
    ]);
  });

  it("flags empty expectedPixels points", () => {
    const problems = schemaErrors([
      { type: "expectedPixels", points: [] } as unknown as ValidationRule,
    ]);
    expect(problems).toEqual([
      expect.stringContaining("must be a non-empty array"),
    ]);
  });

  it("accepts valid expectedPixels points", () => {
    expect(
      schemaErrors([
        {
          type: "expectedPixels",
          points: [{ x: 1, y: 2, expected: [10, 20, 30] }],
          minPassFraction: 0.5,
        },
      ])
    ).toEqual([]);
  });

  it("flags a rule missing its type", () => {
    const problems = schemaErrors([{ name: "x" } as unknown as ValidationRule]);
    expect(problems).toEqual([
      expect.stringContaining("missing a string 'type'"),
    ]);
  });
});

describe("pixel helpers", () => {
  it("pixelMatches passes within tolerance per channel", () => {
    expect(pixelMatches([100, 100, 100], [90, 110, 95], 15)).toBe(true);
  });

  it("pixelMatches fails when any channel is out of tolerance", () => {
    expect(pixelMatches([100, 100, 100], [100, 100, 200], 15)).toBe(false);
  });

  it("pixelMatches accepts Uint8ClampedArray input", () => {
    const data = new Uint8ClampedArray([255, 0, 0, 255]);
    expect(pixelMatches(data, [255, 0, 0], 0)).toBe(true);
  });

  it("effectiveTolerance falls back to the default", () => {
    expect(effectiveTolerance({ x: 0, y: 0, expected: [0, 0, 0] })).toBe(
      PIXEL_DEFAULT_TOLERANCE
    );
    expect(effectiveTolerance({ x: 0, y: 0, expected: [0, 0, 0], tolerance: 7 })).toBe(7);
  });

  it("effectiveMinPassFraction falls back to the default", () => {
    expect(effectiveMinPassFraction(undefined)).toBe(PIXEL_DEFAULT_MIN_PASS_FRACTION);
    expect(effectiveMinPassFraction(0.25)).toBe(0.25);
  });
});

describe("rule classification helpers", () => {
  it("hasSyncRules / hasPixelRules split rule types correctly", () => {
    const sync: ValidationRule[] = [{ type: "functionCall", name: "x" }];
    const pixel: ValidationRule[] = [
      { type: "pixelMatch", x: 0, y: 0, expected: [0, 0, 0] },
    ];
    expect(hasSyncRules(sync)).toBe(true);
    expect(hasSyncRules(pixel)).toBe(false);
    expect(hasPixelRules(pixel)).toBe(true);
    expect(hasPixelRules(sync)).toBe(false);
    expect(hasSyncRules(null)).toBe(false);
    expect(hasPixelRules(undefined)).toBe(false);
  });

  it("RULE_SCHEMAS covers every declared rule type", () => {
    for (const type of RULE_TYPES) {
      expect(RULE_SCHEMAS[type]).toBeDefined();
    }
  });
});
