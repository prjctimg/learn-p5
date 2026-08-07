import { describe, it, expect } from "@jest/globals";
import { parser } from "@lezer/javascript";
import { VALIDATION_CORE } from "./validation-core.generated";
import * as src from "./validation";
import type { ValidationRule } from "../../data/types";
import type { PixelSample } from "./validation";

/**
 * Guard against a stale `validation-core.generated.ts`. The bundle is the
 * artifact that runs inside the exercise WebView and is what check-exercises
 * loads, so it must stay behaviorally identical to the source module. If this
 * file is regenerated, re-run `node scripts/bundle-validation.mjs`.
 */

interface BundleExports {
  analyze: typeof src.analyze;
  evaluateRules: typeof src.evaluateRules;
  schemaErrors: typeof src.schemaErrors;
  pixelMatches: typeof src.pixelMatches;
  effectiveTolerance: typeof src.effectiveTolerance;
  effectiveMinPassFraction: typeof src.effectiveMinPassFraction;
  RULE_TYPES: readonly string[];
  RULE_SCHEMAS: Record<string, unknown>;
  PIXEL_DEFAULT_TOLERANCE: number;
  PIXEL_DEFAULT_MIN_PASS_FRACTION: number;
}

function loadBundle(): BundleExports {
  const sandbox: { __VAL_CORE?: BundleExports } = {};
  // Matches how scripts/check-exercises.mjs executes the artifact.
  // eslint-disable-next-line no-new-func
  new Function("globalThis", VALIDATION_CORE)(sandbox);
  return sandbox.__VAL_CORE as BundleExports;
}

const bundle = loadBundle();

const samples = [
  "createCanvas(400, 400);",
  "circle(10, 10, 20);",
  "function draw() { background(0); }",
  "const add = (a, b) => a + b;",
  "noLoop();",
  "let total = 0; for (let i = 0; i < 10; i++) total += i;",
  "const obj = { render() {} };",
  "new p5.Vector(1, 2);",
  "vec.add(1, 2);",
  "fill(random(255), 0, 0);",
  "background(0);",
  "createCanvas(width, height);",
  "",
];

const ruleSets: ValidationRule[][] = [
  [],
  [{ type: "functionCall", name: "circle" }],
  [{ type: "functionCall", name: "translate", exactArgs: 2 }],
  [{ type: "functionCall", name: "line", minArgs: 4 }],
  [{ type: "functionExists", name: "draw" }],
  [{ type: "canvasSize", width: 400, height: 400 }],
  [
    { type: "functionCall", name: "circle" },
    { type: "functionExists", name: "draw" },
    { type: "canvasSize", width: 200, height: 200 },
  ],
];

const invalidRules: Array<Array<Record<string, unknown>>> = [
  [{ type: "bogus" }],
  [{ type: "canvasSize", width: 400 }],
  [{ type: "functionCall", name: 123 }],
  [{ type: "pixelMatch", x: 0, y: 0, expected: [255, 0] }],
  [{ type: "expectedPixels", points: [] }],
  [{ name: "x" }],
];

function analysisToJson(a: ReturnType<typeof src.analyze>) {
  return {
    calls: a.calls,
    canvas: a.canvas,
    canvasPresent: a.canvasPresent,
    functionDefs: [...a.functionDefs].sort(),
  };
}

describe("validation-core bundle parity", () => {
  it("exports the same runtime surface", () => {
    expect(Object.keys(bundle.RULE_SCHEMAS).sort()).toEqual(
      Object.keys(src.RULE_SCHEMAS).sort()
    );
    expect([...bundle.RULE_TYPES].sort()).toEqual([...src.RULE_TYPES].sort());
    expect(bundle.PIXEL_DEFAULT_TOLERANCE).toBe(src.PIXEL_DEFAULT_TOLERANCE);
    expect(bundle.PIXEL_DEFAULT_MIN_PASS_FRACTION).toBe(
      src.PIXEL_DEFAULT_MIN_PASS_FRACTION
    );
    for (const key of [
      "analyze",
      "evaluateRules",
      "schemaErrors",
      "pixelMatches",
      "effectiveTolerance",
      "effectiveMinPassFraction",
    ]) {
      expect(typeof (bundle as unknown as Record<string, unknown>)[key]).toBe("function");
    }
  });

  it("produces identical analyze() output for every sample", () => {
    for (const code of samples) {
      const tree = parser.parse(code);
      const adapter = {
        cursor: () => tree.cursor(),
        slice: (from: number, to: number) => code.slice(from, to),
      };
      expect(analysisToJson(bundle.analyze(adapter))).toEqual(
        analysisToJson(src.analyze(adapter))
      );
    }
  });

  it("evaluateRules agrees on every (sample, ruleSet) pair", () => {
    for (const code of samples) {
      const tree = parser.parse(code);
      const adapter = {
        cursor: () => tree.cursor(),
        slice: (from: number, to: number) => code.slice(from, to),
      };
      const a = src.analyze(adapter);
      for (const rules of ruleSets) {
        expect(bundle.evaluateRules(a, rules)).toEqual(
          src.evaluateRules(a, rules)
        );
      }
    }
  });

  it("schemaErrors agrees on invalid rule sets", () => {
    for (const rules of invalidRules) {
      const cast = rules as unknown as ValidationRule[];
      expect(bundle.schemaErrors(cast)).toEqual(src.schemaErrors(cast));
    }
  });

  it("pixel helper functions agree", () => {
    const cases: [
      readonly [number, number, number],
      readonly [number, number, number],
      number
    ][] = [
      [[100, 100, 100], [90, 110, 95], 15],
      [[100, 100, 100], [100, 100, 200], 15],
      [[0, 0, 0], [0, 0, 0], 0],
      [[255, 255, 255], [250, 250, 250], 5],
    ];
    for (const [a, b, tol] of cases) {
      expect(bundle.pixelMatches(a, b, tol)).toBe(src.pixelMatches(a, b, tol));
    }
    const pts: PixelSample[] = [
      { x: 0, y: 0, expected: [0, 0, 0] },
      { x: 0, y: 0, expected: [0, 0, 0], tolerance: 7 },
    ];
    for (const pt of pts) {
      expect(bundle.effectiveTolerance(pt)).toBe(src.effectiveTolerance(pt));
    }
    expect(bundle.effectiveMinPassFraction(undefined)).toBe(
      src.effectiveMinPassFraction(undefined)
    );
    expect(bundle.effectiveMinPassFraction(0.25)).toBe(
      src.effectiveMinPassFraction(0.25)
    );
  });
});
