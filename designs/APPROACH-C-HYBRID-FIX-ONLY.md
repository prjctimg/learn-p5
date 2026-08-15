# Approach C — Minimal Fix (Keep Current Structure)

**Concept:** Keep everything as-is — `.md` design docs are separate from `.ts` course data. Only fix the WebView validation bugs. Content duplication remains a manual process, but at least the app works correctly.

## Architecture

```
╔══════════════════════════════════════════════════════════╗
║  WHAT CHANGES                                            ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  1. Fix setActiveTask falsy trap        exerciseHtml.ts  ║
║  2. Fix pixelMatch timing/cleanup       exerciseHtml.ts  ║
║  3. Fix script tag leak                  exerciseHtml.ts  ║
║  4. Persist currentTaskIndex        [id].tsx + storage   ║
║  5. Add manualCheck validation type        types.ts      ║
║                                                          ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ EVERYTHING ELSE STAYS THE SAME                     │  ║
║  │                                                    │  ║
║  │  - exercises/ directory: design docs (unused)      │  ║
║  │  - src/data/courses/shapes.ts: hand-copied data    │  ║
║  │  - Authoring workflow: edit .md → copy to .ts      │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

## Bug Fixes in Detail

### Fix #1: `setActiveTask` falsy trap

```javascript
// File: src/utils/editor/exerciseHtml.ts, line 810
// BEFORE:
ACTIVE_TASK_INDEX = msg.taskIndex || 0;

// AFTER:
ACTIVE_TASK_INDEX = typeof msg.taskIndex === 'number' ? msg.taskIndex : 0;
```

**Why this matters:** When `msg.taskIndex` is `0`, `0 || 0` evaluates to `0` — which by coincidence works. But the REAL problem was *which index is being sent*. The RN side sends `currentTaskIndex` which starts at `0`. After task 1 completes, it increments to `1` and sends it. That works.

However, there's a subtler bug: the `setActiveTask` handler is called on every render where `state.currentTaskIndex` changes. If the index is `0` (no change), the redundant call set it back to `0`. But the more critical issue is the **non-fix**: the `|| 0` pattern breaks if someone sets `setActiveTask(0)` and the intent is to reset. With the fix, it correctly sets `0`.

### Fix #2: Clean up appended script tags

```javascript
// File: src/utils/editor/exerciseHtml.ts, around line 761
// BEFORE:
var script = document.createElement('script');
script.textContent = code;
document.body.appendChild(script);

// AFTER:
var script = document.createElement('script');
script.textContent = code;
document.body.appendChild(script);
// Clean up after execution — but scripts execute synchronously,
// so we can remove immediately after appending.
document.body.removeChild(script);
```

**Wait — this won't work!** When you `appendChild(script)`, the script executes synchronously (if not `defer`/`async`). `removeChild` immediately after will remove it, but the `function setup()` / `function draw()` declarations still exist on `window`. However, subsequent runs `delete window.setup` before appending the next script, so this is actually safe.

**But there's still a problem**: if `p5` constructor is called inside the same tick, the `setup` function must still exist. The key insight: `delete window.setup; delete window.draw;` MUST happen *before* appending the new script. Currently they do. ✓

The fix is to add a post-execution cleanup:

```javascript
document.body.removeChild(script);  // Remove the <script> node
```

### Fix #3: Better pixelMatch timing

The 300ms `setTimeout` is unreliable. Replace with frame-based polling:

```javascript
// BEFORE:
setTimeout(function() {
  var cnv = p5Instance.canvas;
  var ctx = cnv.getContext('2d');
  var imageData = ctx.getImageData(px, py, 1, 1).data;
  // ...compare...
}, 300);

// AFTER:
function waitForCanvas(maxAttempts, callback, attempt) {
  attempt = attempt || 0;
  if (attempt >= maxAttempts) {
    callback(null); // timeout
    return;
  }
  var cnv = p5Instance.canvas;
  if (!cnv || cnv.width === 0 || cnv.height === 0) {
    requestAnimationFrame(function() {
      waitForCanvas(maxAttempts, callback, attempt + 1);
    });
    return;
  }
  // Give one more frame for the draw to complete
  requestAnimationFrame(function() {
    callback(cnv);
  });
}

waitForCanvas(30, function(cnv) {
  if (!cnv) { /* validationFailed: timeout */ return; }
  var ctx = cnv.getContext('2d');
  var imageData = ctx.getImageData(px, py, 1, 1).data;
  // ...compare...
});
```

**But wait — p5.js in instance mode might not have rendered `draw()` yet.** `new p5(undefined, container)` starts the animation loop, but `draw()` runs asynchronously on the next frame. A single `requestAnimationFrame` after detecting the canvas is usually enough.

For even more reliability, we could wait for the `draw` count to be > 0:

```javascript
function waitForDraw(p5Instance, maxAttempts, callback, attempt) {
  attempt = attempt || 0;
  if (!p5Instance.canvas || attempt >= maxAttempts) {
    callback(p5Instance.canvas || null);
    return;
  }
  // p5.js increments _frameCount after each draw() completes
  if (p5Instance._frameCount < 1) {
    requestAnimationFrame(function() {
      waitForDraw(p5Instance, maxAttempts, callback, attempt + 1);
    });
    return;
  }
  callback(p5Instance.canvas);
}
```

### Fix #4: Increase default tolerance for pixelMatch

Current default: 30. Recommended: 120.

```javascript
// File: exerciseHtml.ts, line 1034
// BEFORE:
var tol = pr.tolerance !== undefined ? pr.tolerance : 30;

// AFTER:
var tol = pr.tolerance !== undefined ? pr.tolerance : 120;
```

**Why 120?** p5.js's 2D renderer with anti-aliasing can produce pixels that differ by 50–80 per channel from the exact fill color, especially near edges of shapes. A tolerance of 120 catches these while still rejecting clearly wrong colors (e.g., red vs blue has a channel difference of 255).

### Fix #5: Persist `currentTaskIndex` and `completedTasks`

```typescript
// File: src/app/learn/[course]/[id].tsx

const TASK_PROGRESS_PREFIX = 'taskProgress_';

function getTaskProgressKey(course: string, id: string): string {
  return `${TASK_PROGRESS_PREFIX}${course}_${id}`;
}

// On LOAD_DONE, also restore task progress:
const savedProgress = await AsyncStorage.getItem(getTaskProgressKey(course, id));
if (savedProgress) {
  const { currentTaskIndex, completedTasks } = JSON.parse(savedProgress);
  state.currentTaskIndex = currentTaskIndex;
  state.completedTasks = completedTasks;
}

// On TASK_COMPLETE, persist progress:
AsyncStorage.setItem(
  getTaskProgressKey(course, id),
  JSON.stringify({
    currentTaskIndex: newState.currentTaskIndex,
    completedTasks: newState.completedTasks,
  })
);
```

### Fix #6: Add `manualCheck` validation type

```typescript
// File: src/data/types.ts
export type ValidationRule =
  | { type: "functionCall"; name: string; exactArgs?: number; minArgs?: number }
  | { type: "functionExists"; name: string }
  | { type: "canvasSize"; width: number; height: number }
  | { type: "pixelMatch"; x: number; y: number; expected: [number, number, number]; tolerance?: number }
  | { type: "manualCheck"; prompt: string };  // NEW
```

In the WebView:

```javascript
if (rule.type === 'manualCheck') {
  // If all other rules passed, show a confirmation dialog
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'manualCheck',
      prompt: rule.prompt,
      taskIndex: ACTIVE_TASK_INDEX,
    }));
  }
}
```

In React Native:

```typescript
case "manualCheck":
  Alert.alert(
    "Does this look right?",
    msg.prompt,
    [
      { text: "Not yet", style: "cancel" },
      { text: "Yes, continue!", onPress: () => {
        dispatch({ type: "TASK_COMPLETE", taskIndex: msg.taskIndex });
      }}
    ]
  );
  break;
```

## Current `.md` → `.ts` Duplication Unchanged

```
exercises/GOING-IN-CIRCLES.md
  validation: circle(3)
  validation: pixelMatch(200,200,[255,105,180])
                    │
                    │  (still manual copy)
                    ▼
src/data/courses/shapes.ts
  { type: "functionCall", name: "circle", exactArgs: 3 },
  { type: "pixelMatch", x: 200, y: 200, expected: [255,105,180], tolerance: 40 }
```

**This remains a source of errors.** The only mitigation is author discipline.

## Summary of Changes

| File | Change | Lines |
|------|--------|-------|
| `exerciseHtml.ts:810` | `msg.taskIndex \|\| 0` → `typeof check` | 1 |
| `exerciseHtml.ts:761-763` | `removeChild(script)` after append | 2 |
| `exerciseHtml.ts:1006-1064` | `setTimeout(300)` → `waitForDraw()` polling | 30 |
| `exerciseHtml.ts:1034` | Default tolerance 30 → 120 | 1 |
| `exerciseHtml.ts:958-960` | Add `manualCheck` rule handling | 15 |
| `[id].tsx` | Persist `currentTaskIndex` + `completedTasks` | 20 |
| `[id].tsx` | Handle `manualCheck` message from WebView | 15 |
| `types.ts` | Add `manualCheck` to `ValidationRule` | 1 |
| **Total** | | **~85 lines changed** |

## Advantages

1. **Minimal changes** — only ~85 lines of code touched
2. **No new dependencies** — uses existing AsyncStorage
3. **No build pipeline changes** — no new scripts, no Metro config
4. **Fastest to implement** — 1–2 hours
5. **Lowest risk** — smallest surface area for bugs

## Disadvantages

1. **Doesn't solve content duplication** — `.md` and `.ts` still drift
2. **Doesn't improve authoring workflow** — still manual copy-paste
3. **manualCheck is a UX downgrade** — users must self-verify
4. **pixelMatch tolerance increase is a band-aid** — 120 tolerance might accept clearly wrong colors
5. **Only fixes the immediate symptoms** — doesn't address the root architectural problems

## When to Choose This

Choose Approach C when:
- **You need a fix RIGHT NOW** — the app is broken and users can't progress
- **You plan to implement a better approach later** — this is a stopgap
- **You're the sole developer** and content duplication isn't a problem yet
- **You have 2 hours before a deadline**

**This is the "ship it, fix it properly later" approach.**

## Decision Checklist

- [ ] Is the app currently broken for end users? → If yes, start here first
- [ ] Can we tolerate manual .md → .ts syncing? → If no, pick A, B, or E
- [ ] Do we have time for a larger refactor today? → If no, start here
