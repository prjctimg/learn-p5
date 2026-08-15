# Implementation Stub: Approach C — Fix WebView Bugs

## Bug 1: `setActiveTask` Falsy Trap

```javascript
// File: src/utils/editor/exerciseHtml.ts : line 810

// BEFORE:
ACTIVE_TASK_INDEX = msg.taskIndex || 0;

// AFTER:
ACTIVE_TASK_INDEX = typeof msg.taskIndex === 'number' ? msg.taskIndex : 0;
```

## Bug 2: Wait for Canvas Rendering

```javascript
// File: src/utils/editor/exerciseHtml.ts : replace lines 1006-1064

// Replace setTimeout(300, ...) with:

function waitForDraw(p5Instance, maxFrames, callback, frameCount) {
  frameCount = frameCount || 0;
  if (frameCount >= maxFrames) {
    callback(null); // Timeout — canvas never rendered
    return;
  }
  var cnv = p5Instance.canvas;
  if (!cnv || cnv.width === 0 || cnv.height === 0 || (p5Instance._frameCount || 0) < 1) {
    requestAnimationFrame(function() {
      waitForDraw(p5Instance, maxFrames, callback, frameCount + 1);
    });
    return;
  }
  callback(cnv);
}

// Usage:
waitForDraw(p5Instance, 60, function(cnv) {
  if (!cnv) {
    // Handle timeout
    postMessage('validationFailed', 'Sketch did not render in time');
    return;
  }
  var ctx = cnv.getContext('2d');
  // ... pixel checking logic unchanged ...
});
```

## Bug 3: Script Tag Leak

```javascript
// File: src/utils/editor/exerciseHtml.ts : around line 761

// BEFORE:
var script = document.createElement('script');
script.textContent = code;
document.body.appendChild(script);

// AFTER:
var script = document.createElement('script');
script.textContent = code;
document.body.appendChild(script);
// Script executes synchronously; safe to remove immediately
document.body.removeChild(script);
```

## Bug 4: Increase Default Tolerance

```javascript
// File: src/utils/editor/exerciseHtml.ts : line 1034

// BEFORE:
var tol = pr.tolerance !== undefined ? pr.tolerance : 30;

// AFTER:
var tol = pr.tolerance !== undefined ? pr.tolerance : 120;
```

## Bug 5: Persist Task Progress

```typescript
// File: src/app/learn/[course]/[id].tsx : additions

const TASK_PROGRESS_PREFIX = 'taskProgress_';

// Inside the LOAD_DONE handler (around line 359):
const savedProgress = await AsyncStorage.getItem(
  `${TASK_PROGRESS_PREFIX}${course}_${id}`
);
if (savedProgress) {
  const { currentTaskIndex, completedTasks } = JSON.parse(savedProgress);
  // Merge into state
  state.currentTaskIndex = currentTaskIndex;
  state.completedTasks = completedTasks;
}

// Inside TASK_COMPLETE reducer (line 91):
AsyncStorage.setItem(
  `${TASK_PROGRESS_PREFIX}${course}_${id}`,
  JSON.stringify({
    currentTaskIndex: newState.currentTaskIndex,
    completedTasks: newState.completedTasks,
  })
);

// On EXERCISE_COMPLETE (line 89):
// Clear task progress storage when exercise is fully done
AsyncStorage.removeItem(`${TASK_PROGRESS_PREFIX}${course}_${id}`);
```

## Bug 6: Add manualCheck Validation Type

```typescript
// File: src/data/types.ts : add to ValidationRule
| { type: "manualCheck"; prompt: string }
```

```javascript
// File: src/utils/editor/exerciseHtml.ts : add to validateSync handler

// In the validation loop, after other rule types:
if (rule.type === 'manualCheck') {
  // manualCheck always passes sync; it's handled asynchronously
  // (but we need to signal back to RN)
}
```

```typescript
// File: src/app/learn/[course]/[id].tsx : in handleMessage

case "manualCheck":
  Alert.alert(
    "Does this look right?",
    msg.prompt,
    [
      { text: "Not yet", style: "cancel" },
      {
        text: "Yes, continue!",
        onPress: () => {
          dispatch({ type: "TASK_COMPLETE", taskIndex: msg.taskIndex });
          dispatch({ type: "RUN_DONE" });
        },
      },
    ]
  );
  break;
```
