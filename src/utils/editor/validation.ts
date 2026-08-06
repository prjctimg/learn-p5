import type { ValidationRule } from "../../data/types";

/**
 * Single source of truth for exercise validation.
 *
 * All validation semantics live here and nowhere else. The module is
 * dependency-free at runtime: it walks an opaque syntax-tree provided by the
 * caller, so the exact same code runs inside the exercise WebView (which reuses
 * the CodeMirror tree that is already on the page) and inside the Node build
 * checks (which feed it a @lezer/javascript parse).
 *
 * Tree shape conventions follow @lezer/javascript:
 *   - CallExpression / NewExpression -> first child is VariableName (plain
 *     call) or MemberExpression (member call); a direct `ArgList` child holds
 *     the arguments.
 *   - FunctionDeclaration -> first VariableDefinition child is the name.
 *   - VariableDeclaration -> VariableDefinition whose initializer is an
 *     ArrowFunction / FunctionExpression is a function definition.
 *   - MethodDeclaration / Property / FieldDeclaration -> a PropertyDefinition
 *     name whose value is (or is followed by) a function body.
 */

export type RuleType =
  | "functionCall"
  | "functionExists"
  | "canvasSize"
  | "pixelMatch"
  | "expectedPixels";

export const RULE_TYPES: readonly RuleType[] = [
  "functionCall",
  "functionExists",
  "canvasSize",
  "pixelMatch",
  "expectedPixels",
];

type FieldKind =
  | "string"
  | "string?"
  | "number"
  | "number?"
  | "boolean?"
  | "num3"
  | "points";

export interface RuleSchema {
  required: string[];
  fields: Record<string, FieldKind>;
}

export const RULE_SCHEMAS: Record<string, RuleSchema> = {
  functionCall: {
    required: ["name"],
    fields: { name: "string", exactArgs: "number?", minArgs: "number?" },
  },
  functionExists: {
    required: ["name"],
    fields: { name: "string" },
  },
  canvasSize: {
    required: ["width", "height"],
    fields: { width: "number", height: "number" },
  },
  pixelMatch: {
    required: ["x", "y", "expected"],
    fields: { x: "number", y: "number", expected: "num3", tolerance: "number?" },
  },
  expectedPixels: {
    required: ["points"],
    fields: { points: "points", minPassFraction: "number?" },
  },
};

/** Default per-channel tolerance used by pixel rules when none is set. */
export const PIXEL_DEFAULT_TOLERANCE = 30;

/** Default minPassFraction used by expectedPixels when none is set. */
export const PIXEL_DEFAULT_MIN_PASS_FRACTION = 0.9;

// ---------------------------------------------------------------------------
// Syntax-tree adapter (structural typing keeps lezer out of the runtime bundle)
// ---------------------------------------------------------------------------

export interface TreeCursorLike {
  readonly type: { readonly name: string };
  readonly from: number;
  readonly to: number;
  firstChild(): boolean;
  nextSibling(): boolean;
  parent(): boolean;
}

export interface TreeAdapter {
  cursor(): TreeCursorLike;
  slice(from: number, to: number): string;
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export interface ParsedCall {
  name: string;
  args: number;
  member: boolean;
  from: number;
  to: number;
}

export interface Analysis {
  calls: ParsedCall[];
  functionDefs: Set<string>;
  canvas: { width: number; height: number } | null;
  canvasPresent: boolean;
}

const FUNCTION_KINDS = new Set(["ArrowFunction", "FunctionExpression"]);
const ARG_SEPARATORS = new Set(["(", ")", ","]);

/**
 * Locate the callee expression of a call/new node. For a CallExpression the
 * callee is the first child; for a NewExpression it follows the `new` keyword.
 */
function findCallee(
  cursor: TreeCursorLike
): { name: string; from: number; to: number } | null {
  if (!cursor.firstChild()) return null;
  do {
    const n = cursor.type.name;
    if (n === "VariableName" || n === "MemberExpression") {
      const hit = { name: n, from: cursor.from, to: cursor.to };
      cursor.parent();
      return hit;
    }
  } while (cursor.nextSibling());
  cursor.parent();
  return null;
}

/** Count argument expressions directly inside the ArgList the cursor is on. */
function countArguments(cursor: TreeCursorLike): number {
  let count = 0;
  if (!cursor.firstChild()) return 0;
  do {
    if (!ARG_SEPARATORS.has(cursor.type.name) && cursor.type.name !== "...") count++;
  } while (cursor.nextSibling());
  cursor.parent();
  return count;
}

/** Collect definitions out of a VariableDeclaration (var/let/const = fn). */
function collectVariableFunctionNames(
  cursor: TreeCursorLike,
  slice: TreeAdapter["slice"],
  defs: Set<string>
): void {
  if (!cursor.firstChild()) return;
  let pending: { from: number; to: number } | null = null;
  do {
    const n = cursor.type.name;
    if (n === "VariableDefinition") {
      pending = { from: cursor.from, to: cursor.to };
    } else if (FUNCTION_KINDS.has(n) && pending) {
      defs.add(slice(pending.from, pending.to));
      pending = null;
    } else if (n !== "Equals" && n !== "," && n !== ";") {
      pending = null;
    }
  } while (cursor.nextSibling());
  cursor.parent();
}

/** Collect definitions out of Property / FieldDeclaration / MethodDeclaration. */
function collectPropertyFunctionName(
  cursor: TreeCursorLike,
  slice: TreeAdapter["slice"],
  defs: Set<string>
): void {
  if (!cursor.firstChild()) return;
  let pending: { from: number; to: number } | null = null;
  do {
    const n = cursor.type.name;
    if (n === "PropertyDefinition" || n === "FieldName") {
      pending = { from: cursor.from, to: cursor.to };
    } else if (FUNCTION_KINDS.has(n)) {
      if (pending) defs.add(slice(pending.from, pending.to));
      pending = null;
    } else if (n === "ParamList") {
      if (pending) defs.add(slice(pending.from, pending.to));
      pending = null;
    } else if (n !== ":" && n !== "," && n !== ";" && n !== "=" && n !== "static") {
      pending = null;
    }
  } while (cursor.nextSibling());
  cursor.parent();
}

function visit(cursor: TreeCursorLike, depth: number, fn: (c: TreeCursorLike) => void): void {
  if (depth > 500) return;
  fn(cursor);
  if (cursor.firstChild()) {
    do {
      visit(cursor, depth + 1, fn);
    } while (cursor.nextSibling());
    cursor.parent();
  }
}

export function analyze(adapter: TreeAdapter): Analysis {
  const calls: ParsedCall[] = [];
  const functionDefs = new Set<string>();
  let canvas: { width: number; height: number } | null = null;
  let canvasPresent = false;

  const cursor = adapter.cursor();

  visit(cursor, 0, (c) => {
    switch (c.type.name) {
      case "CallExpression":
      case "NewExpression": {
        const callee = findCallee(c);
        if (!callee) break;
        let name: string | null = null;
        let member = false;
        if (callee.name === "VariableName") {
          name = adapter.slice(callee.from, callee.to);
        } else if (callee.name === "MemberExpression") {
          member = true;
          const text = adapter.slice(callee.from, callee.to);
          const dot = text.lastIndexOf(".");
          if (dot !== -1) {
            name = text.slice(dot + 1).trim() || null;
          }
        }
        if (name === null) break;

        let args = 0;
        if (c.firstChild()) {
          do {
            if ((c.type.name as string) === "ArgList") {
              args = countArguments(c);
              break;
            }
          } while (c.nextSibling());
          c.parent();
        }

        calls.push({ name, args, member, from: c.from, to: c.to });

        if (!member && name === "createCanvas") {
          canvasPresent = true;
          const size = collectCanvasNumbers(c, adapter);
          if (size) canvas = size;
        }
        break;
      }
      case "FunctionDeclaration": {
        if (!c.firstChild()) break;
        do {
          if ((c.type.name as string) === "VariableDefinition") {
            functionDefs.add(adapter.slice(c.from, c.to));
            break;
          }
        } while (c.nextSibling());
        c.parent();
        break;
      }
      case "VariableDeclaration": {
        collectVariableFunctionNames(c, adapter.slice, functionDefs);
        break;
      }
      case "MethodDeclaration":
      case "Property":
      case "FieldDeclaration": {
        collectPropertyFunctionName(c, adapter.slice, functionDefs);
        break;
      }
    }
  });

  return { calls, functionDefs, canvas, canvasPresent };
}

/** Extract literal (width, height) from a createCanvas call, if possible. */
function collectCanvasNumbers(
  cursor: TreeCursorLike,
  adapter: TreeAdapter
): { width: number; height: number } | null {
  const numbers: number[] = [];
  if (!cursor.firstChild()) return null;
  do {
    if (cursor.type.name === "ArgList") {
      if (!cursor.firstChild()) return null;
      do {
        const n = cursor.type.name as string;
        if (n === "Number" || n === "UnaryExpression") {
          const num = Number(adapter.slice(cursor.from, cursor.to));
          if (isFinite(num)) numbers.push(num);
        }
      } while (cursor.nextSibling());
      cursor.parent();
      break;
    }
  } while (cursor.nextSibling());
  cursor.parent();
  if (numbers.length >= 2) return { width: numbers[0], height: numbers[1] };
  return null;
}

// ---------------------------------------------------------------------------
// Rule evaluation (synchronous rules only; pixel rules are renderer-checked)
// ---------------------------------------------------------------------------

export interface EvalResult {
  passed: boolean;
  reason: string;
}

export function hasPixelRules(rules: ValidationRule[] | undefined | null): boolean {
  return (rules ?? []).some(
    (r) => r.type === "pixelMatch" || r.type === "expectedPixels"
  );
}

export function hasSyncRules(rules: ValidationRule[] | undefined | null): boolean {
  return (rules ?? []).some(
    (r) =>
      r.type === "functionCall" ||
      r.type === "functionExists" ||
      r.type === "canvasSize"
  );
}

export function evaluateRules(
  analysis: Analysis,
  rules: ValidationRule[] | undefined | null
): EvalResult {
  for (const rule of rules ?? []) {
    switch (rule.type) {
      case "functionCall": {
        const matches = analysis.calls.filter((c) => c.name === rule.name);
        if (matches.length === 0) {
          return { passed: false, reason: `Add a ${rule.name}() call` };
        }
        if (typeof rule.exactArgs === "number") {
          const ok = matches.some((c) => c.args === rule.exactArgs);
          if (!ok) {
            return {
              passed: false,
              reason: `${rule.name}() needs ${rule.exactArgs} arguments`,
            };
          }
        }
        if (typeof rule.minArgs === "number") {
          const minArgs = rule.minArgs;
          const ok = matches.some((c) => c.args >= minArgs);
          if (!ok) {
            return {
              passed: false,
              reason: `${rule.name}() needs at least ${minArgs} arguments`,
            };
          }
        }
        break;
      }
      case "functionExists": {
        if (!analysis.functionDefs.has(rule.name)) {
          return { passed: false, reason: `Define a ${rule.name}() function` };
        }
        break;
      }
      case "canvasSize": {
        if (!analysis.canvasPresent) {
          return { passed: false, reason: "Use createCanvas() to set canvas size" };
        }
        if (
          !analysis.canvas ||
          analysis.canvas.width !== rule.width ||
          analysis.canvas.height !== rule.height
        ) {
          return { passed: false, reason: `Canvas should be ${rule.width}x${rule.height}` };
        }
        break;
      }
      case "pixelMatch":
      case "expectedPixels":
        // Handled by the renderer after the sketch runs.
        break;
    }
  }
  return { passed: true, reason: "" };
}

// ---------------------------------------------------------------------------
// Rule schema validation (catches typos such as `excatArgs`)
// ---------------------------------------------------------------------------

function kindCheck(kind: FieldKind, value: unknown): string | null {
  switch (kind) {
    case "string":
      return typeof value === "string" ? null : "must be a string";
    case "string?":
      return value === undefined || typeof value === "string" ? null : "must be a string";
    case "number":
      return typeof value === "number" && isFinite(value)
        ? null
        : "must be a finite number";
    case "number?":
      return value === undefined ||
        (typeof value === "number" && isFinite(value))
        ? null
        : "must be a finite number";
    case "boolean?":
      return value === undefined || typeof value === "boolean"
        ? null
        : "must be a boolean";
    case "num3":
      return Array.isArray(value) &&
        value.length === 3 &&
        value.every((v) => typeof v === "number" && isFinite(v))
        ? null
        : "must be an [r, g, b] array of three numbers";
    case "points":
      return Array.isArray(value) &&
        value.length > 0 &&
        value.every(
          (p) =>
            p &&
            typeof p === "object" &&
            typeof (p as { x?: unknown }).x === "number" &&
            typeof (p as { y?: unknown }).y === "number" &&
            Array.isArray((p as { expected?: unknown }).expected) &&
            ((p as { expected: unknown[] }).expected).length === 3 &&
            ((p as { expected: unknown[] }).expected).every((v: unknown) => typeof v === "number")
        )
        ? null
        : "must be a non-empty array of {x, y, expected, tolerance?}";
  }
}

/**
 * Returns human-readable problems with a task's validation rules. Any problem
 * means the task's rules are malformed and should be treated as unsatisfiable
 * rather than silently weakened.
 */
export function schemaErrors(rules: ValidationRule[] | undefined | null): string[] {
  const problems: string[] = [];
  for (let i = 0; i < (rules ?? []).length; i++) {
    const rule = (rules ?? [])[i];
    if (!rule || typeof rule !== "object" || typeof rule.type !== "string") {
      problems.push(`rule[${i}]: missing a string 'type'`);
      continue;
    }
    const schema = RULE_SCHEMAS[rule.type];
    if (!schema) {
      problems.push(`rule[${i}]: unknown rule type '${rule.type}'`);
      continue;
    }
    for (const req of schema.required) {
      if (!(req in rule)) {
        problems.push(`rule[${i}] (${rule.type}): missing required field '${req}'`);
      }
    }
    for (const key of Object.keys(rule)) {
      if (key === "type") continue;
      const kind = schema.fields[key];
      if (!kind) {
        problems.push(`rule[${i}] (${rule.type}): unknown field '${key}'`);
        continue;
      }
      const err = kindCheck(kind, (rule as Record<string, unknown>)[key]);
      if (err) {
        problems.push(`rule[${i}] (${rule.type}): field '${key}' ${err}`);
      }
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Pixel matching helpers (shared by the renderer and tests)
// ---------------------------------------------------------------------------

export interface PixelSample {
  x: number;
  y: number;
  expected: [number, number, number];
  tolerance?: number;
}

/**
 * Per-channel max-difference color comparison. A pixel passes when every
 * channel is within `tolerance` of its expected value (0-255).
 */
export function pixelMatches(
  actual: readonly [number, number, number] | Uint8ClampedArray,
  expected: readonly [number, number, number],
  tolerance: number
): boolean {
  const dr = Math.abs(actual[0] - expected[0]);
  const dg = Math.abs(actual[1] - expected[1]);
  const db = Math.abs(actual[2] - expected[2]);
  return dr <= tolerance && dg <= tolerance && db <= tolerance;
}

export function effectiveTolerance(pt: PixelSample): number {
  return pt.tolerance !== undefined ? pt.tolerance : PIXEL_DEFAULT_TOLERANCE;
}

export function effectiveMinPassFraction(minPassFraction?: number): number {
  return minPassFraction !== undefined
    ? minPassFraction
    : PIXEL_DEFAULT_MIN_PASS_FRACTION;
}
