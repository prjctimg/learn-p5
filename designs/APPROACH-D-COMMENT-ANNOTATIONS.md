# Approach D — Validation as Code Comments

**Concept:** Keep TypeScript as the single source of truth. Embed the validation rules NOT in `.md` files, but as **structured comments** inside the `startingCode` and `solution` code strings. A script extracts validation rules from the code comments. The `.md` files remain design docs that reference the canonical `.ts` course file.

## Architecture

```
╔══════════════════════════════════════════════════════════════╗
║  KEY INSIGHT                                                 ║
║                                                              ║
║  The real source of truth should be the CODE that users      ║
║  actually see and write. By embedding validation rules as    ║
║  comments IN the starting code, the validation and the code  ║
║  can NEVER diverge. The .md files are generated FROM the     ║
║  TypeScript (or vice versa), but the truth is in the code.   ║
╚══════════════════════════════════════════════════════════════╝
```

## Concept: Validation Directives in Starting Code

```typescript
// src/data/courses/shapes.ts

{
  id: "exercise-1",
  title: "The First Circle",
  startingCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  fill(255, 105, 180);
  // @validate functionCall:circle(3)
  // @validate pixelMatch(200,200) == [255,105,180] ±40
  circle(200, 200, 100);
}`,
  solution: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  fill(255, 165, 0);
  circle(200, 200, 100);
}`,
  tasks: [
    {
      id: "task-1",
      title: "Draw the Circle",
      instruction: "Draw a circle...",
      // No separate validation array — extracted from startingCode
    },
  ],
}
```

## How Validation Extraction Works

```typescript
// src/utils/validationExtractor.ts

type ValidationAnnotation =
  | { type: "functionCall"; name: string; exactArgs: number }
  | { type: "pixelMatch"; x: number; y: number; expected: [number,number,number]; tolerance: number }
  | { type: "functionExists"; name: string }
  | { type: "canvasSize"; width: number; height: number };

const VALIDATION_COMMENT_RE = /\/\/\s*@validate\s+(.+)$/gm;

// Parse: "functionCall:circle(3)"        → { type:"functionCall", name:"circle", exactArgs:3 }
// Parse: "pixelMatch(200,200)==[255,105,180]±40"  → { type:"pixelMatch", x:200, y:200, expected:[255,105,180], tolerance:40 }
// Parse: "functionExists:setup"          → { type:"functionExists", name:"setup" }
// Parse: "canvasSize(400,400)"           → { type:"canvasSize", width:400, height:400 }

function parseAnnotation(line: string): ValidationAnnotation {
  line = line.trim();

  // functionCall:circle(3)
  let m = line.match(/^functionCall:\s*(\w+)\((\d+)\)$/);
  if (m) return { type: "functionCall", name: m[1], exactArgs: parseInt(m[2]) };

  // pixelMatch(200,200) == [255,105,180] ±40
  // pixelMatch(200,200)==[255,105,180]±40
  m = line.match(/^pixelMatch\((\d+),(\d+)\)\s*==\s*\[(\d+),(\d+),(\d+)\]\s*±(\d+)$/);
  if (m) return {
    type: "pixelMatch",
    x: parseInt(m[1]), y: parseInt(m[2]),
    expected: [parseInt(m[3]), parseInt(m[4]), parseInt(m[5])],
    tolerance: parseInt(m[6]),
  };

  // functionExists:setup
  m = line.match(/^functionExists:\s*(\w+)$/);
  if (m) return { type: "functionExists", name: m[1] };

  // canvasSize(400,400)
  m = line.match(/^canvasSize\((\d+),(\d+)\)$/);
  if (m) return { type: "canvasSize", width: parseInt(m[1]), height: parseInt(m[2]) };

  throw new Error(`Unknown validation annotation: ${line}`);
}

export function extractValidation(code: string): ValidationAnnotation[] {
  const rules: ValidationAnnotation[] = [];
  let m;
  while ((m = VALIDATION_COMMENT_RE.exec(code)) !== null) {
    rules.push(parseAnnotation(m[1]));
  }
  return rules;
}
```

## Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  AUTHOR WORKFLOW                                              │
│                                                               │
│  Step 1: Edit shapes.ts                                       │
│    - Write startingCode with @validate comments               │
│    - Write solution code                                      │
│    - Write task title and instruction                         │
│                                                               │
│  Step 2: (Optional) Generate .md docs                         │
│    npm run docs:generate                                      │
│    → extracts startingCode, @validate rules, task info        │
│    → writes exercises/*.md                                    │
│                                                               │
│  Step 3: Commit                                              │
│    - shapes.ts is the canonical source                        │
│    - .md files are regenerated docs (or not committed)        │
└──────────────────────────────────────────────────────────────┘
```

## At Runtime

```typescript
// In courseLoader.ts or wherever exercises are prepared:
import { extractValidation } from '../utils/validationExtractor';

function prepareExercise(exercise: ExerciseData): Exercise {
  return {
    ...exercise,
    tasks: exercise.tasks.map((task) => {
      if (!task.validation || task.validation.length === 0) {
        // Extract validation from the starting code's @validate comments
        const code = task.startingCode ?? exercise.startingCode ?? '';
        return {
          ...task,
          validation: extractValidation(code),
        };
      }
      return task;
    }),
  };
}
```

## Comparison with Current Approach

```
                    CURRENT (Approach D target)
                    ┌──────────────────────┐
                    │  shapes.ts            │
                    │                       │
                    │  startingCode: "...",  │
                    │  validation: [         │  ← separate array (drifts!)
                    │    {type:"functionCall"│
                    │   }]                  │
                    └──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  exercises/*.md       │
                    │  (design doc,         │
                    │   also has validation)│  ← duplicate (drifts!)
                    └──────────────────────┘

                    APPROACH D
                    ┌──────────────────────┐
                    │  shapes.ts            │
                    │                       │
                    │  startingCode: `...   │
                    │   // @validate ...    │  ← validation IN the code
                    │   circle(200,200,100) │
                    │  `,                   │
                    │  validation: []       │  ← empty! extracted at runtime
                    └──────────────────────┘
                               │
                               │ (npm run docs:generate)
                               ▼
                    ┌──────────────────────┐
                    │  exercises/*.md       │
                    │  (generated)          │  ← no drift possible
                    └──────────────────────┘
```

## Annotation Syntax Design

```
// @validate functionCall:circle(3)
// @validate pixelMatch(200,200)==[255,105,180]±40
// @validate functionExists:myFunction
// @validate canvasSize(400,400)
// @validate noop  — skip validation, used for free-form tasks

// Multi-task: which task does this belong to?
// @task task-1
// @validate functionCall:circle(3)

// @task task-2
// @validate pixelMatch(200,200)==[255,165,0]±40
```

## Generated Exercises File

Running `npm run docs:generate` would produce:

```markdown
---
id: exercise-1
course: shapes
---

# The First Circle

## Task 1 — Draw the Circle

Draw a circle...

**Starting Code:**

```javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  fill(255, 105, 180);
  // @validate functionCall:circle(3)
  // @validate pixelMatch(200,200) == [255,105,180] ±40
  circle(200, 200, 100);
}
```

**Validation Rules:**

- `circle()` must be called with exactly 3 arguments
- Pixel at (200, 200) must be rgb(255, 105, 180) ±40
```

## Advantages

1. **Validation can NEVER drift from code** — the annotation is literally in the code
2. **Authors work in TypeScript** — familiar environment for most devs
3. **No new file format** — reuses existing `startingCode` strings
4. **Self-documenting** — the validation rules are visible in the editor when the user writes code
5. **No runtime performance cost** — extraction happens once per exercise load

## Disadvantages

1. **Authors must know the annotation DSL** — a mini-language to learn
2. **Annotations clutter the starting code** — visible to users, could confuse beginners
3. **Doesn't eliminate .md → .ts duplication** — if you keep .md files, they still need syncing
4. **Structured validation in comments is brittle** — comment format changes break extraction
5. **TypeScript remains the content source** — non-technical content authors still can't contribute
6. **ManualCheck can't be expressed** — no annotation for user-verified tasks

## When to Choose This

✅ Your team is primarily TypeScript developers  
✅ You want validation to LITERALLY be part of the code  
✅ You're OK with comment DSLs  
✅ You want to generate .md docs from the TypeScript source (inverse of Approach A)

## Decision Checklist

- [ ] Are content authors comfortable with TypeScript? → If no, pick A or B or E
- [ ] Do you want validation visible in the editor? → This is the only approach that does this
- [ ] Are you OK with a custom comment DSL? → Required
- [ ] Do you want to generate .md files from .ts? → This approach supports it
