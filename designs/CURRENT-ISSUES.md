# Current Architecture — Root Cause Analysis

## Problem 1: Validation Never Passes (Even Correct Code)

### Flow Diagram — Current Run/Validation Pipeline

```
React Native (exercise/[id].tsx)           WebView (exerciseHtml.ts)
┌────────────────────────────────┐      ┌──────────────────────────────────┐
│                                │      │                                  │
│  User taps "Run"               │      │                                  │
│    dispatch(RUN_START)         │      │                                  │
│    postMessage("runSketch") ─────────────────▶ handleMessage("runSketch") │
│                                │      │   │                              │
│                                │      │   ├─ renderSketch(userCode)      │
│                                │      │   │  ┌────────────────┐          │
│                                │      │   │  │ delete setup   │          │
│                                │      │   │  │ delete draw    │          │
│                                │      │   │  │ new p5()       │          │
│                                │      │   │  │ append <script>│          │
│                                │      │   │  └────────────────┘          │
│                                │      │   │                              │
│                                │      │   ├─ validateSync(code, rules)    │
│                                │      │   │   ┌──────────────────────┐   │
│                                │      │   │   │ functionCall regex   │   │
│                                │      │   │   │ pixelMatch skipped   │   │
│                                │      │   │   └──────────────────────┘   │
│                                │      │   │                              │
│                                │      │   ├─ if sync passes AND         │
│                                │      │   │   has pixel rules:           │
│                                │      │   │   setTimeout(300ms) ──────▶  │
│                                │      │   │     getImageData(x,y)        │
│                                │      │   │     compare RGB              │
│                                │      │   │     postMessage("taskComplete│
│                                │      │   │       OR "validationFailed") │
│                                │      │   │                              │
│                                │      │   ├─ if sync passes AND         │
│                                │      │   │   NO pixel rules:            │
│                                │      │   │   postMessage("taskComplete" │
│                                │      │   │     OR "exerciseComplete")   │
│                                │      │                                  │
│                                │      │                                  │
│  onMessage("taskComplete") ◀──────────────────── taskIndex: ACTIVE_INDEX │
│    dispatch(TASK_COMPLETE)    │      │                                  │
│    dispatch(RUN_DONE)         │      │                                  │
│    currentTaskIndex++         │      │                                  │
│    postMessage("setActiveTask") ──────▶ handleMessage("setActiveTask")   │
│                                │      │   │                              │
└────────────────────────────────┘      └──────────────────────────────────┘
```

### Bug #1: `setActiveTask` Falsy Trap

**File:** `src/utils/editor/exerciseHtml.ts` line 810

```javascript
// BUG: When taskIndex is 0 (first task), 0 || 0 evaluates to 0
// BUT when called for taskIndex > 0, it works once then resets.
// Actually WORSE: when called with msg.taskIndex = 0, 0 || 0 = 0
// BUT when called with msg.taskIndex = 1, 1 || 0 = 1 (correct)
// PROBLEM: initial render sets ACTIVE_TASK_INDEX = 0 correctly,
// but then RN immediately sends setActiveTask with taskIndex=0
// again (redundantly), which triggers handleMessage which does:
ACTIVE_TASK_INDEX = msg.taskIndex || 0;
// Since msg.taskIndex is 0, 0 is falsy, so JavaScript evaluates:
// 0 || 0  →  0  (works by accident when taskIndex IS 0)
// 
// THE REAL PROBLEM: When taskIndex comes from React state after
// TASK_COMPLETE, RN sends setActiveTask with currentTaskIndex=1
// BUG: msg.taskIndex || 0  →  1 || 0  →  1  (works!)
// So actually task-0→1 transition works...
//
// But EXERCISE 2 onwards start with currentTaskIndex=1
// because the reducer starts at 0 and RN sends setActiveTask
// with currentTaskIndex=1... wait no.
//
// THE ACTUAL CRASH: The bug manifests when:
// 1. currentTaskIndex in RN starts at 0
// 2. RN sends setActiveTask with taskIndex=0 on mount
// 3. WebView sets ACTIVE_TASK_INDEX = 0 (falsy bug still gives 0)
// 4. User runs code correctly
// 5. validation passes, sends taskComplete with ACTIVE_TASK_INDEX (0)
// 6. RN dispatches TASK_COMPLETE with taskIndex: 0
// 7. RN sets currentTaskIndex to 1
// 8. RN sends setActiveTask with taskIndex: 1
// 9. WebView sets ACTIVE_TASK_INDEX = 1 || 0 = 1  ✓
// 10. Task 2 validates correctly...
// 
// BUT WAIT: The validation at step 5 uses
//   TASKS[ACTIVE_TASK_INDEX].validation
//   which is TASKS[0].validation → correct!
//
// SO IS THE BUG ACTUALLY SOMEWHERE ELSE?
```

The `|| 0` bug is actually **not the main blocker**. Let's trace more carefully.

### Bug #2: `pixelMatch` Always Fails (The Real Blocker)

```
┌─────────────────────────────────────────────────────────────────┐
│  renderSketch is called with userCode                           │
│                                                                 │
│  Inside renderSketch:                                           │
│    1. delete window.setup, window.draw                          │
│    2. let script = document.createElement('script')             │
│    3. script.textContent = code                                 │
│    4. document.body.appendChild(script)  ← APPENDS <script>     │
│    5. container.__p5 = new p5(undefined, container)             │
│       ┌──────────────────────────────────────────┐              │
│       │  p5.js runs setup() and draw()            │              │
│       │  This creates a <canvas> inside container │              │
│       │  AND the canvas is drawn to.              │              │
│       │  But p5 may use a <canvas> it finds,      │              │
│       │  or create its own.                       │              │
│       └──────────────────────────────────────────┘              │
│                                                                 │
│  setTimeout(300ms, function() {                                  │
│    var cnv = p5Instance.canvas;  ← MAY BE WRONG/STALE           │
│    var ctx = cnv.getContext('2d');                               │
│    var pixel = ctx.getImageData(x, y, 1, 1).data;               │
│    // Compare pixel to expected                                 │
│  })                                                             │
└─────────────────────────────────────────────────────────────────┘
```

**Root cause of `pixelMatch` failure:**

The `validateSync` and `pixelMatch` pixel comparison functions are incompatible with each other for p5.js sketches:

1. **p5.js draws asynchronously** — `setup()` and `draw()` might not have completed by the time `setTimeout` fires
2. **The canvas reference can be stale** — `p5Instance.canvas` might point to an old canvas from a previous render
3. **Anti-aliasing** — p5.js renders with anti-aliasing; a solid fill color at the edges bleeds. Even a pixel in the center may have slight variation.
4. **The script tag leaks** — `appendChild(script)` is never removed. Over repeated runs, the DOM accumulates scripts. `delete window.setup` may not fully clean up because the old script's `function setup()` declaration hoists differently from a fresh eval.
5. **`new p5(undefined, container)` uses instance mode** — but the user writes global-mode code (bare `function setup()`). p5.js detects the global functions and uses them, but if multiple scripts define `setup`, the **last one wins** — which is actually fine, but if the previous render's `setup` wasn't fully deleted, it could cause a race.

### Bug #3: The `pixelMatch` tolerance is too tight

Current tolerance default is 30, and some exercises use 40–50.

**Problem:** p5.js's WebGL or 2D renderer produces slightly different pixels than expected because:
- p5.js blends with the background
- The browser's compositor can dither or interpolate
- The WebView in React Native may render at a different device-pixel ratio

In practice, even a solid fill can differ by 10–40 on each channel depending on positioning and anti-aliasing.

### Bug #4: `ACTIVE_TASK_INDEX` not persisted across page reloads

```
┌────────────────────────────────────────────────────────────────┐
│  Initial load flow:                                             │
│                                                                 │
│  RN Component Mounts                                            │
│    state.currentTaskIndex = 0  (hardcoded initial)              │
│    state.completedTasks = []   (hardcoded initial)              │
│                                                                 │
│    LOAD_DONE sets state.exercise from AsyncStorage              │
│    (no task index restoration from storage)                     │
│                                                                 │
│    useEffect triggers setActiveTask(taskIndex=0)                │
│    WebView's ACTIVE_TASK_INDEX = 0  (or 0 due to falsey)       │
│                                                                 │
│  What happens if user was on task 2 and reloads?                │
│    — They go back to task 1 even if completedTasks has [0,1]    │
│    — BUT completedTasks isn't persisted either                  │
│    — The exercise shows task 1 instructions again               │
└────────────────────────────────────────────────────────────────┘
```

### Bug #5: Fallback Exact-Match Always Fails

When `activeRules` is empty (no tasks or no validation rules for a task):

```javascript
syncResult = { passed: SOLUTION_CODE && userCode.trim() === SOLUTION_CODE.trim(), reason: '' };
```

This **exact string match** always fails because:
- User formats code differently
- User types spaces/tabs differently
- The saved code from AsyncStorage may differ
- The starting code is a template, not the solution

## Problem 2: Content Duplication

### Current Authoring Pipeline

```
                   ╔═══════════════════╗
                   ║   HUMAN AUTHOR    ║
                   ╚═══════════════════╝
                            │
                            ▼
              ┌─────────────────────────┐
              │  exercises/<FILE>.md    │
              │  (design doc)           │
              │                         │
              │  "Draw a circle..."     │
              │  Validation: circle(3)  │
              │  Validation: pixelMatch │
              └─────────────────────────┘
                            │
                    (manual copy-paste)
                            │
                            ▼
              ┌─────────────────────────┐
              │  src/data/courses/      │
              │  shapes.ts              │
              │                         │
              │  TypeScript object:     │
              │  validation: [          │
              │    {type:"functionCall",│
              │     name:"circle",      │
              │     exactArgs:3}        │
              │  ]                      │
              └─────────────────────────┘
                            │
                    (TypeScript compile)
                            │
                            ▼
                   ╔═══════════════════╗
                   ║  EXPO BUNDLE      ║
                   ╚═══════════════════╝
```

**Drift points:**
1. `circle(3)` in `.md` → `{type:"functionCall", name:"circle", exactArgs:3}` in `.ts` — easy to mis-type
2. Instructions in `.md` vs `instruction` field in `.ts` — can diverge
3. `startingCode` in `.md` vs `.ts` — the most common divergence
4. Validation rules get added/removed in one but not the other
5. Tasks reordered in one but not the other

## Summary of All Issues

| # | Issue | Severity | Root Cause |
|---|-------|----------|------------|
| 1 | `setActiveTask` falsy bug | Medium | `msg.taskIndex \|\| 0` treats 0 as falsy |
| 2 | `pixelMatch` always fails | **High** | Timing, stale canvas, anti-aliasing, insufficient tolerance |
| 3 | Script tags leak between runs | Medium | `renderSketch` appends `<script>` but never removes |
| 4 | Task state not persisted | Medium | `currentTaskIndex` and `completedTasks` not in AsyncStorage |
| 5 | Exact-match fallback always fails | Low | Only triggers when no validation rules exist; but exercise 7 task 2 uses `functionCall` with `exactArgs: 7` — this works |
| 6 | Content .md / .ts duplication | **High** | No automated pipeline between design docs and runtime code |
| 7 | No exercise schema validation | Medium | No script checks that validation rules match the actual exercises |
