# Implementation Stub: Approach D — Comment Annotations

## `src/utils/validationExtractor.ts`

```typescript
import type { ValidationRule } from '../data/types';

// Regex: matches // @validate <annotation>
const ANNOTATION_RE = /\/\/\s*@validate\s+(.+)$/gm;

// ------------------------------------------------------------------
// Parse a single annotation line
// ------------------------------------------------------------------
function parseAnnotation(line: string): ValidationRule {
  const s = line.trim();

  // functionCall:circle(3)
  let m = s.match(/^functionCall:\s*(\w+)\((\d+)\)$/);
  if (m) {
    return { type: 'functionCall', name: m[1], exactArgs: parseInt(m[2], 10) };
  }

  // functionCall:circle minArgs:1
  m = s.match(/^functionCall:\s*(\w+)\s+minArgs:\s*(\d+)$/);
  if (m) {
    return { type: 'functionCall', name: m[1], minArgs: parseInt(m[2], 10) };
  }

  // pixelMatch(200,200)==[255,105,180]±40
  m = s.match(
    /^pixelMatch\((\d+),(\d+)\)\s*==\s*\[(\d+),(\d+),(\d+)\]\s*±(\d+)$/
  );
  if (m) {
    return {
      type: 'pixelMatch',
      x: parseInt(m[1], 10),
      y: parseInt(m[2], 10),
      expected: [
        parseInt(m[3], 10),
        parseInt(m[4], 10),
        parseInt(m[5], 10),
      ],
      tolerance: parseInt(m[6], 10),
    };
  }

  // functionExists:setup
  m = s.match(/^functionExists:\s*(\w+)$/);
  if (m) {
    return { type: 'functionExists', name: m[1] };
  }

  // canvasSize(400,400)
  m = s.match(/^canvasSize\((\d+),(\d+)\)$/);
  if (m) {
    return {
      type: 'canvasSize',
      width: parseInt(m[1], 10),
      height: parseInt(m[2], 10),
    };
  }

  // manualCheck:Does this look right?
  m = s.match(/^manualCheck:\s*(.+)$/);
  if (m) {
    return { type: 'manualCheck', prompt: m[1] };
  }

  // Unknown annotation — throw to catch during development
  throw new Error(`Unknown validation annotation: ${line}`);
}

// ------------------------------------------------------------------
// Extract all validation rules from code with @validate annotations
// ------------------------------------------------------------------
export function extractValidation(code: string): ValidationRule[] {
  const rules: ValidationRule[] = [];
  let m: RegExpExecArray | null;
  while ((m = ANNOTATION_RE.exec(code)) !== null) {
    rules.push(parseAnnotation(m[1]));
  }
  return rules;
}

// ------------------------------------------------------------------
// Usage in courseLoader.ts:
//
// import { extractValidation } from '../utils/validationExtractor';
//
// function prepareTask(task, defaultCode) {
//   const code = task.startingCode ?? defaultCode;
//   const annotations = extractValidation(code);
//   return {
//     ...task,
//     validation: task.validation ?? annotations,
//   };
// }
//
// ------------------------------------------------------------------
```

## Example: Starting code with embedded validation

```typescript
// src/data/courses/shapes.ts

const exercise1 = {
  id: 'exercise-1',
  title: 'The First Circle',
  // ...
  startingCode: `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  fill(255, 105, 180);
  // @validate functionCall:circle(3)
  // @validate pixelMatch(200,200)==[255,105,180]±40
  circle(200, 200, 100);
}`,
  tasks: [
    {
      id: 'task-1',
      title: 'Draw the Circle',
      instruction: '...',
      // validation is extracted from startingCode ^
    },
  ],
};
```
