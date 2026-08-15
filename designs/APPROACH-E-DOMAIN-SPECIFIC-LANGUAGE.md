# Approach E — Domain-Specific Language (YAML Course Files)

**Concept:** Replace both `.md` design docs AND `.ts` course definitions with a single YAML or JSON file per course. The YAML file is the **canonical, human-friendly source of truth**. A small loader parses it at build time (or runtime). The format is designed to be readable by non-developers while being strict enough for machine validation.

## Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   A SINGLE YAML FILE per course that contains EVERYTHING:        ║
║   - Course metadata                                              ║
║   - Exercises with all tasks                                     ║
║   - Validation rules (inline, no separate format)                ║
║   - Starting code and solution code                              ║
║   - Hints and references                                         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## The YAML Format

```yaml
# courses/shapes.yaml
slug: shapes
title: Shapes
moduleName: Fundamentals
description: Master the coordinate system and draw your first primitive shapes using code.

exercises:
  - id: exercise-1
    title: "The First Circle"
    module: Shapes
    description: Draw your first shape — a pink ball on a white canvas.
    instruction: |
      Draw a circle at the center of the 400x400 canvas.
      Use circle(x, y, diameter) with x=200, y=200, and a diameter of 100.
    startingCode: |
      function setup() {
        createCanvas(400, 400);
      }
      function draw() {
        background(255);
        fill(255, 105, 180);
      }
    solution: |
      function setup() {
        createCanvas(400, 400);
      }
      function draw() {
        background(255);
        fill(255, 165, 0);
        circle(200, 200, 100);
      }
    tasks:
      - id: task-1
        title: "Draw the Circle"
        instruction: |
          Draw a circle at the center of the 400x400 canvas.
          Use circle(x, y, diameter) with x=200, y=200, and a diameter of 100.
        validation:
          - type: functionCall
            name: circle
            exactArgs: 3
          - type: pixelMatch
            x: 200
            y: 200
            expected: [255, 105, 180]
            tolerance: 40

      - id: task-2
        title: "Change the Color"
        instruction: |
          Now change the fill color to orange.
          Use fill(255, 165, 0) before the circle() call.
        validation:
          - type: functionCall
            name: circle
            exactArgs: 3
          - type: pixelMatch
            x: 200
            y: 200
            expected: [255, 165, 0]
            tolerance: 40
```

## Flow Diagram

```
                     ╔════════════════════════╗
                     ║  CONTENT AUTHOR        ║
                     ║  (edits YAML)          ║
                     ╚════════════════════════╝
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  courses/                                                    │
│  ├── shapes.yaml              ◄── HUMAN AUTHORED, CANONICAL  │
│  ├── colors.yaml                                             │
│  └── ...                                                     │
│                                                              │
│  Written in plain YAML with:                                 │
│   - No TypeScript syntax                                     │
│   - No JSON escaping (\n → actual newlines)                  │
│   - No import/export boilerplate                             │
│   - Validation rules are clear name-value pairs              │
│   - Code is literal (| block scalars preserve newlines)      │
└──────────────────────────────────────────────────────────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
           (Build time)           (Or Runtime)
                 │                       │
                 ▼                       ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  scripts/parse-yaml.mjs  │   │  yaml loader in app     │
│                          │   │                         │
│  1. Read .yaml files    │   │  1. Asset.loadAsync()   │
│  2. Validate schema     │   │  2. Parse with          │
│  3. Output .ts files    │   │     js-yaml             │
│  4. Or use directly     │   │  3. Build Course[]      │
│     via dynamic require │   │  4. Cache in memory     │
└─────────────────────────┘   └─────────────────────────┘
                             │
                             ▼
                   ╔═══════════════════╗
                   ║  EXPO BUNDLE      ║
                   ╚═══════════════════╝
```

## YAML Parsing (Generic)

```yaml
# YAML Schema (json-schema for validation)
course:
  type: object
  required: [slug, title, exercises]
  properties:
    slug:        { type: string, pattern: "^[a-z0-9-]+$" }
    title:       { type: string }
    moduleName:  { type: string }
    description: { type: string }
    exercises:
      type: array
      items:
        type: object
        required: [id, title, tasks]
        properties:
          id:    { type: string, pattern: "^exercise-\\d+$" }
          title: { type: string }
          startingCode: { type: string }
          solution:     { type: string }
          tasks:
            type: array
            items:
              type: object
              required: [id, title, instruction, validation]
              properties:
                id:    { type: string, pattern: "^task-\\d+$" }
                title: { type: string }
                instruction: { type: string }
                validation:
                  type: array
                  items:
                    type: object
                    required: [type]
                    discriminator:
                      propertyName: type
                      mapping:
                        functionCall:
                          required: [name]
                          properties:
                            name:      { type: string }
                            exactArgs: { type: integer, minimum: 0 }
                            minArgs:   { type: integer, minimum: 0 }
                        pixelMatch:
                          required: [x, y, expected]
                          properties:
                            x:         { type: integer }
                            y:         { type: integer }
                            expected:  { type: array, items: { type: integer }, minItems: 3, maxItems: 3 }
                            tolerance: { type: integer, minimum: 0, default: 120 }
                        functionExists:
                          required: [name]
                          properties:
                            name: { type: string }
                        canvasSize:
                          required: [width, height]
                          properties:
                            width:  { type: integer }
                            height: { type: integer }
                        manualCheck:
                          required: [prompt]
                          properties:
                            prompt: { type: string }
```

## Build-Time Loader

```typescript
// scripts/parse-yaml.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import YAML from 'yaml';
import Ajv from 'ajv';

const ajv = new Ajv();
const schema = JSON.parse(readFileSync('scripts/course-schema.json', 'utf-8'));
const validate = ajv.compile(schema);

const files = await glob('courses/*.yaml');

for (const file of files) {
  const yaml = readFileSync(file, 'utf-8');
  const course = YAML.parse(yaml);

  if (!validate(course)) {
    console.error(`Validation failed for ${file}:`, validate.errors);
    process.exit(1);
  }

  const ts = `// DO NOT EDIT — generated from ${file}
// Source: ${file}
import type { Course } from "../../types";

export const ${course.slug}Course: Course = ${JSON.stringify(course, null, 2)};
`;

  writeFileSync(`src/data/courses/auto-generated/${course.slug}.ts`, ts, 'utf-8');
}
```

## Runtime Loader (Alternative)

```typescript
// src/utils/courseLoader.ts
import YAML from 'js-yaml';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const courseAssetMap = {
  shapes: require('../../courses/shapes.yaml'),
};

export async function loadCourse(slug: string): Promise<Course | null> {
  const asset = Asset.fromModule(courseAssetMap[slug]);
  if (!asset) return null;
  await asset.downloadAsync();
  const yaml = await FileSystem.readAsStringAsync(asset.localUri!);
  const course = YAML.load(yaml) as Course;

  // Hydrate tasks that have no explicit startingCode
  for (const exercise of course.exercises) {
    for (const task of exercise.tasks ?? []) {
      if (!task.startingCode) {
        task.startingCode = exercise.startingCode;
      }
    }
  }

  return course;
}
```

## Replacing the .md Design Docs

With Approach E, the `.md` files in `exercises/` can be **auto-generated from YAML**:

```
npm run docs:generate
→ reads courses/shapes.yaml
→ writes exercises/GOING-IN-CIRCLES.md (human-friendly)
→ writes exercises/TEMPLATE.md (updated based on YAML schema)
```

Or the `.md` files can be **retired entirely** — the YAML file IS the design doc.

## Advantages

1. **Human-friendliest format** — YAML is more readable than JSON, more accessible than TypeScript
2. **Single source of truth** — no drift between design docs and runtime
3. **Schema-validated** — every YAML file can be validated against a JSON Schema before building
4. **Clean code blocks** — YAML `|` block scalars mean no `\n` escaping in code
5. **Non-developers can contribute** — YAML is taught to content writers, product managers, and educators
6. **Self-documenting** — the YAML file reads like a spec
7. **Works with both build-time and runtime** — flexible deployment

## Disadvantages

1. **New dependency** — `yaml` (or `js-yaml`) for YAML parsing
2. **YAML is whitespace-sensitive** — can be error-prone for non-developers
3. **No TypeScript type safety in the YAML file** — IDE won't autocomplete field names
4. **Another format to learn** — even if simpler than TypeScript, it's still new
5. **Tooling gap** — no `tsc`-level validation; relies on JSON Schema (which has its own learning curve)
6. **Potential ambiguity** — YAML's implicit typing can surprise (e.g., `yes` becomes boolean `true`)

## When to Choose This

✅ You have non-developer content authors who need to create exercises  
✅ You want the most readable format possible  
✅ You're building a multi-course app and need a scalable authoring workflow  
✅ You want schema validation for all exercise content  
✅ You're willing to add `js-yaml` as a dependency

## Decision Checklist

- [ ] Will non-developers be authoring exercises? → If yes, this is the best option
- [ ] Is YAML familiarity present in the team? → If no, consider JSON5 or TOML instead
- [ ] Do we want JSON Schema validation? → Strong yes for this approach
- [ ] Do we want runtime or build-time loading? → Both work, choose based on latency needs
- [ ] Are we OK with a YAML parser in the bundle? → Only ~5KB gzipped for `js-yaml`

## Variant: JSON5 Instead of YAML

If YAML's whitespace sensitivity is concerning, use JSON5 instead:

```json5
// courses/shapes.json5
{
  slug: "shapes",
  title: "Shapes",
  exercises: [
    {
      id: "exercise-1",
      title: "The First Circle",
      startingCode: [
        "function setup() {",
        "  createCanvas(400, 400);",
        "}",
        "",
        "function draw() {",
        "  background(255);",
        "  fill(255, 105, 180);",
        "}",
      ].join("\n"),
      // ...
    },
  ],
}
```

JSON5: no quotes on keys, trailing commas, multiline strings via arrays. Familiar to JS devs, but less friendly to non-devs.
