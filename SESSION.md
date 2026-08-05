# Session: Exercise Validation Refactor

## Goal
Refactor exercise validation into a single source of truth and harden pixel validation (Phase 1 + Phase 2).

## What was done

### Phase 1: Single source of truth (`src/utils/editor/validation.ts`)
- Wrote a dependency-free module that all validation flows now share: the exercise WebView bridge and the Node dev checks (`check-exercises.mjs`).
- The module walks a caller-provided syntax tree (`TreeCursorLike` interface) so it runs identically in the browser and in Node — no lezer import in the runtime bundle.
- Exports: `analyze`, `evaluateRules`, `schemaErrors`, `hasPixelRules`, `hasSyncRules`, `pixelMatches`, `effectiveTolerance`, `effectiveMinPassFraction`.
- `RULE_SCHEMAS` validates all five rule types (`functionCall`, `functionExists`, `canvasSize`, `pixelMatch`, `expectedPixels`) and catches malformed rules (typos like `excatArgs`, unknown types, missing fields).
- `analyze()` distinguishes real calls from definitions (handles plain calls, member calls, function declarations, arrow/function-valued variables, object methods, class methods).
- `evaluateRules()` handles sync rules; pixel rules are deferred to the renderer.

### Phase 2: Pixel hardening (in the WebView bridge)
- Replaced the ad-hoc `waitForFrame` (poll until `frameCount > 0`) with `settleForValidation`: stops the loop via `noLoop()`, resets `frameCount` to 0, then calls `redraw()` exactly once for a deterministic "first frame" sample, then restores `loop()` if the sketch was looping.
- `sampleAllPoints` now uses `__VAL_CORE.pixelMatches` and `__VAL_CORE.effectiveTolerance`/`effectiveMinPassFraction` from the shared core, keeping a single source of truth for pixel comparison semantics.
- Added canvas-size sanity check (`!cnv.width || !cnv.height`) before sampling.
- The default per-channel tolerance is now 30 (matching the core's `PIXEL_DEFAULT_TOLERANCE`), replacing the old implicit 120.

### Bridge integration (`src/utils/editor/exerciseHtml.ts`)
- Added `<script>${VALIDATION_CORE}</script>` (the IIFE bundle) before the bridge script so `__VAL_CORE` is available globally.
- Replaced the regex-based `validateSync`, `findCallsByName`, and `findCallArgsList` with calls to `__VAL_CORE.analyze` + `__VAL_CORE.evaluateRules`.
- Added a `schemaErrors` guard in the run-sketch flow so malformed rules fail loudly rather than silently weakening.
- Removed dead `VALIDATION_RULES = []` and the dead regex helpers.

### Dev checks (`scripts/check-exercises.mjs`)
- Rewritten to use the shared core via the generated IIFE bundle (same mechanism as the bridge).
- Now runs `schemaErrors` on every task's rules before evaluating them, catching malformed rules early.
- Covers all tasks (not just the 88/94 previously covered) since the core handles all rule types uniformly.

### Type tightening (`src/data/types.ts`)
- Removed the catch-all `{ type: string; [key: string]: unknown }` from `ValidationRule`, making the union exhaustive.
- Updated `build-courses.mjs` to emit `: Course` type annotations on generated course exports so TypeScript validates the generated data against the tightened type.

### Build plumbing
- Added `scripts/bundle-validation.mjs` (mirrors `bundle-editor.mjs` pattern) and `src/utils/editor/validation-core.generated.ts` (gitignored? No — committed, like `codemirror-bundle.generated.ts`).
- Added `bundle-validation` script to `package.json`; wired into `postinstall` and `start`.

## Key technical notes
- `@lezer/javascript` 1.5.4 is present as a transitive dep. Lezer bundle ≈ 126 KB minified (not imported by the core — the core uses a caller-provided tree cursor).
- `tree.topNode.iterate` does NOT exist in @lezer/javascript; cursor-based `firstChild`/`nextSibling`/`parent` recursion is used.
- Lezer arg-count quirk: `f(...args)` counts as 1 arg (spread node excluded). `new p5(...)` is a `NewExpression` whose first child is the `new` keyword, not the callee — handled by `findCallee`.
- `reference.generated.json` arity is unreliable (createVector → 1, heading → 0); do not build arity checks on it.
- Version: 0.6.126 (to be bumped).