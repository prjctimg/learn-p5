# Validators

All validation logic lives in `src/utils/editor/validation.ts` — a dependency-free module that runs identically in the exercise WebView and in Node dev checks.

---

## Rule Types

Five rule types are supported (defined in `RULE_TYPES`):

| Type | Purpose |
|---|---|
| `functionCall` | Checks that a named function is called with the right arg count |
| `functionExists` | Checks that a named function is defined |
| `canvasSize` | Checks that `createCanvas` is called with specific dimensions |
| `pixelMatch` | Checks a single pixel's color at (x, y) |
| `expectedPixels` | Checks multiple pixels across the canvas |

## Rule Schemas (`RULE_SCHEMAS`)

Each rule type has a schema that defines required fields and field kinds:

- **functionCall**: required `name`; optional `exactArgs` (number), `minArgs` (number)
- **functionExists**: required `name`
- **canvasSize**: required `width` (number), `height` (number)
- **pixelMatch**: required `x` (number), `y` (number), `expected` (num3 — `[r,g,b]`); optional `tolerance` (number)
- **expectedPixels**: required `points` (points array); optional `minPassFraction` (number)

Field kinds: `"string"`, `"string?"`, `"number"`, `"number?"`, `"boolean?"`, `"num3"`, `"points"`.

## Validators

### `schemaErrors(rules)` — `src/utils/editor/validation.ts:447`

Validates the structure of a task's validation rules before evaluation. Iterates every rule and checks:
1. The rule is an object with a string `type`.
2. The `type` exists in `RULE_SCHEMAS` (catches unknown types).
3. All `required` fields are present.
4. No unknown fields exist (catches typos like `excatArgs`).
5. Each field's value passes `kindCheck` (correct type/shape).

Returns an array of human-readable problem strings. Empty array means the rules are well-formed.

### `analyze(adapter)` — `src/utils/editor/validation.ts:210`

Walks a `TreeAdapter` (caller-provided syntax tree) and returns an `Analysis` object:
- `calls`: all function calls found — each with `name`, `args` (count), `member` (whether it's a method call like `p5.map()`), `from`, `to`.
- `functionDefs`: set of all function names defined (regular declarations, arrow/function expressions assigned to variables, object/class methods).
- `canvas`: `{ width, height }` from the first `createCanvas()` call, or `null`.
- `canvasPresent`: boolean indicating whether `createCanvas` was called at all.

Handles these syntax forms:
- Plain calls (`foo()`) — `VariableName` callee
- Member calls (`p5.map()`) — `MemberExpression` callee, extracts name after last dot
- Function declarations (`function foo() {}`)
- Arrow/function-valued variables (`const foo = () => {}`)
- Object methods (`{ foo() {} }`)
- Class methods (`class C { foo() {} }`)
- `new` expressions (`new p5(...)`) — handles the lezer quirk where the first child is the `new` keyword

The tree walk uses cursor-based `firstChild`/`nextSibling`/`parent` recursion (lezer's `topNode.iterate` does not exist).

### `evaluateRules(analysis, rules)` — `src/utils/editor/validation.ts:335`

Evaluates synchronous rules against the `Analysis`. Pixel rules (`pixelMatch`, `expectedPixels`) are skipped (deferred to the renderer). For each rule:

- **functionCall**: Finds matching calls by name. If `exactArgs` is set, at least one call must have exactly that many args. If `minArgs` is set, at least one call must have at least that many args.
- **functionExists**: Checks the function name is in `analysis.functionDefs`.
- **canvasSize**: Checks `analysis.canvasPresent` is true and `analysis.canvas` matches the specified width and height.

Returns `{ passed: boolean, reason: string }`.

### `hasPixelRules(rules)` — `src/utils/editor/validation.ts:320`

Returns `true` if any rule is `pixelMatch` or `expectedPixels`. Used by the bridge to decide whether to run the pixel-sampling renderer.

### `hasSyncRules(rules)` — `src/utils/editor/validation.ts:326`

Returns `true` if any rule is `functionCall`, `functionExists`, or `canvasSize`. Used by the bridge to decide whether to run synchronous (pre-render) validation.

### `pixelMatches(actual, expected, tolerance)` — `src/utils/editor/validation.ts:496`

Per-channel max-difference color comparison. A pixel passes when every RGB channel is within `tolerance` of its expected value (0–255). Accepts `Uint8ClampedArray` or `[r,g,b]` tuples.

### `effectiveTolerance(pt)` — `src/utils/editor/validation.ts:507`

Returns the per-channel tolerance for a pixel sample, falling back to `PIXEL_DEFAULT_TOLERANCE` (30) if `pt.tolerance` is undefined.

### `effectiveMinPassFraction(minPassFraction?)` — `src/utils/editor/validation.ts:511`

Returns the minimum fraction of pixels that must pass for an `expectedPixels` rule, falling back to `PIXEL_DEFAULT_MIN_PASS_FRACTION` (0.9) if undefined.

---

## Constants

- `PIXEL_DEFAULT_TOLERANCE` = 30 (default per-channel tolerance for pixel rules)
- `PIXEL_DEFAULT_MIN_PASS_FRACTION` = 0.9 (default minimum pass fraction for `expectedPixels`)

---

## Pixel Hardening (Phase 2, in the WebView bridge)

- `settleForValidation` replaces the old `waitForFrame`: stops the loop via `noLoop()`, resets `frameCount` to 0, calls `redraw()` exactly once for a deterministic first-frame sample, then restores `loop()` if the sketch was looping.
- `sampleAllPoints` uses `__VAL_CORE.pixelMatches`, `__VAL_CORE.effectiveTolerance`, and `__VAL_CORE.effectiveMinPassFraction` from the shared core.
- Canvas-size sanity check (`!cnv.width || !cnv.height`) is performed before sampling.
- Default per-channel tolerance is 30 (matching `PIXEL_DEFAULT_TOLERANCE`), replacing the old implicit 120.

---

## Integration Points

- **WebView bridge** (`src/utils/editor/exerciseHtml.ts`): injects the IIFE bundle as `<script>${VALIDATION_CORE}</script>` so `__VAL_CORE` is globally available. Uses `__VAL_CORE.analyze` + `__VAL_CORE.evaluateRules` for sync validation, `__VAL_CORE.hasPixelRules` to gate pixel sampling, and `__VAL_CORE.schemaErrors` to fail loudly on malformed rules.
- **Dev checks** (`scripts/check-exercises.mjs`): uses the shared core via the IIFE bundle, runs `schemaErrors` on every task's rules before evaluating them.
- **Build** (`scripts/bundle-validation.mjs`): produces the IIFE bundle (`src/utils/editor/validation-core.generated.ts`), wired into `postinstall` and `start` in `package.json`.