# Approach B — Runtime Parser

**Concept:** Bundle the `.md` files as static assets via Expo's Metro bundler. The app parses them on first launch to build the course data in memory. No codegen step, no generated `.ts` files.

## Architecture

```
                      ╔════════════════════════╗
                      ║  EXERCISE AUTHOR       ║
                      ║  (writes .md files)    ║
                      ╚════════════════════════╝
                               │
                               ▼
┌──────────────────────────────────────────────────────────┐
│  exercises/                                               │
│  ├── shapes/                                              │
│  │   ├── exercise-1.md                                    │
│  │   ├── exercise-2.md                                    │
│  │   └── ...                                             │
│  ├── colors/     ◄── future courses                       │
│  └── ...                                                 │
│                                                           │
│  Each .md is a plain markdown file with JSON fenced       │
│  code blocks (same format as Approach A)                  │
└──────────────────────────────────────────────────────────┘
                               │
                    (Expo Metro bundler)
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
         ┌─────────────────┐   ┌─────────────────┐
         │  COURSE INDEX    │   │  .md file assets │
         │  (small JSON)    │   │  (bundled via    │
         │                  │   │   Metro's asset   │
         │  { courses: [    │   │   resolution)     │
         │    { slug,       │   └─────────────────┘
         │      files: [...]│           │
         │    }             │           │
         │  ]}              │           │
         └─────────────────┘           │
                    │                   │
                    └────────┬──────────┘
                             │
                 (at app startup)
                             ▼
              ┌──────────────────────────────────┐
              │  src/utils/exerciseParser.ts      │
              │                                    │
              │  Flow:                             │
              │  1. Fetch COURSE_INDEX via require │
              │  2. For each slug, fetch .md files │
              │     via Asset.loadAsync()          │
              │  3. Parse markdown:                │
              │     a. Extract frontmatter         │
              │     b. Extract H1 → title         │
              │     c. Extract JSON validation     │
              │     d. Build Course + Exercise     │
              │     objects in memory              │
              │  4. Cache parsed result            │
              │     in AsyncStorage (memoize)      │
              │  5. Expose via React context        │
              └────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────────┐
              │  React Context + hooks            │
              │                                    │
              │  useCourses() → Course[]          │
              │  useCourse(slug) → Course         │
              │  useExercise(course, id) → Exer.  │
              └────────────────────────────────────┘
```

## Markdown Format (Same as Approach A, but organized by course)

```
exercises/
└── shapes/
    ├── course.md                     # Course-level metadata
    └── exercises/
        ├── exercise-1.md
        ├── exercise-2.md
        └── ...
```

### `exercises/shapes/course.md`

```markdown
---
slug: shapes
title: Shapes
moduleName: Fundamentals
description: Master the coordinate system...
---
```

### `exercises/shapes/exercises/exercise-1.md`

```markdown
---
id: exercise-1
order: 1
module: Shapes
description: Draw your first shape...
---

# The First Circle

...

```json validation
{
  "startingCode": "...",
  "solution": "...",
  "tasks": [...]
}
```
```

## How It Works at Runtime

```typescript
// src/utils/exerciseParser.ts

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// The COURSE_INDEX maps course slugs to lists of bundled .md assets
const COURSE_INDEX: Record<string, string[]> = {
  shapes: [
    require('../../exercises/shapes/course.md'),
    require('../../exercises/shapes/exercises/exercise-1.md'),
    require('../../exercises/shapes/exercises/exercise-2.md'),
    // ...
  ],
};

let parsedCache: Record<string, Course> | null = null;

export async function loadCourses(): Promise<Course[]> {
  if (parsedCache) return Object.values(parsedCache);

  const courses: Record<string, Course> = {};

  for (const [slug, assetPaths] of Object.entries(COURSE_INDEX)) {
    // Load .md files from the app bundle
    const assets = assetPaths.map((p) => Asset.fromModule(p));
    await Promise.all(assets.map((a) => a.downloadAsync()));  // copies from bundle

    // Read contents
    const contents = await Promise.all(
      assets.map((a) => FileSystem.readAsStringAsync(a.localUri!))
    );

    // First file is course.md (frontmatter)
    const courseMeta = parseFrontmatter(contents[0]);

    // Remaining files are exercises
    const exercises = contents.slice(1).map((md) => parseExerciseMd(md));

    courses[slug] = {
      slug,
      title: courseMeta.title,
      moduleName: courseMeta.moduleName,
      description: courseMeta.description,
      exercises: exercises.sort((a, b) => a.order - b.order),
    };
  }

  parsedCache = courses;
  return Object.values(courses);
}

function parseExerciseMd(md: string): Exercise {
  const { data, content } = matter(md);
  const title = content.match(/^#\s+(.+)/m)?.[1] ?? '';
  const validationBlock = content.match(/```json\s+validation\n([\s\S]*?)```/);
  const taskData = validationBlock ? JSON.parse(validationBlock[1]) : { tasks: [] };

  return {
    id: data.id,
    title,
    module: data.module,
    description: data.description,
    instruction: taskData.instruction ?? '',
    startingCode: taskData.startingCode ?? '',
    solution: taskData.solution ?? '',
    tasks: taskData.tasks,
    order: data.order,
  };
}
```

## Updated `courseLoader.ts`

```typescript
import { loadCourses } from '../utils/exerciseParser';

// Old: import { shapesCourse } from './courses/shapes';
// New:
export async function loadCourse(slug: string): Promise<Course | null> {
  const courses = await loadCourses();
  return courses.find((c) => c.slug === slug) ?? null;
}

export async function loadExercise(courseSlug: string, exerciseId: string): Promise<Exercise | null> {
  const course = await loadCourse(courseSlug);
  return course?.exercises.find((e) => e.id === exerciseId) ?? null;
}
```

## How It Fixes Each Current Issue

| Issue | How Approach B fixes it |
|-------|------------------------|
| **Validation bugs** | Same as Approach A — still needs WebView bug fixes |
| **Content duplication** | ✅ Eliminated. `.md` is the sole source, parsed at runtime. |
| **Drift** | ✅ Impossible. There is no `.ts` to drift from. |
| **Authoring friction** | ✅ Best DX — write `.md`, refresh the app, see changes immediately. |
| **Schema validation** | ⚠️ At runtime only. Errors appear when the app loads, not at build time. |
| **New exercise onboarding** | ✅ Add a `.md` file, add its path to COURSE_INDEX, done. |

## Metro Configuration

Expo's Metro is already configured to bundle `.md` files as assets (not JS). But we may need to add the extension to the asset extensions list:

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('md');
module.exports = config;
```

## Advantages

1. **No codegen step** — edit `.md`, reload app, see results
2. **No generated code in repo** — the `.md` files ARE the source
3. **Hot-reload friendly** — in dev mode, Metro detects `.md` changes and the app can re-parse
4. **Truth lives in one place** — the `.md` files are both human-readable docs and machine-readable data
5. **Future-proof** — new courses are just new directories of `.md` files

## Disadvantages

1. **Cold-start parsing cost** — on first launch, the app must read and parse all `.md` files. For 7 exercises this is trivial; for 200 it could be noticeable (100–300ms).
2. **No build-time validation** — malformed JSON or missing fields crash only at runtime. Mitigation: add a CI script that runs the parser in Node.js.
3. **Requires `expo-asset` + `expo-file-system`** — two additional dependencies. These are already common in Expo apps, but add to the bundle.
4. **Parsing logic lives in the app** — the markdown parser (gray-matter clone) or regex logic must be implemented in JS. `gray-matter` is Node-only; we'd need a simpler frontmatter parser or write our own.
5. **Metro asset loading is async** — `loadCourse` needs to be `async`, which propagates through `useExercise`. The app needs loading states for the parser.
6. **Changes to `.md` require app restart** — the asset list is determined at build time. You can't add new `.md` files without a new build. (You *can* edit existing `.md` content freely in dev though, since Expo's Metro provides the latest content.)

## When to Choose This

✅ Your team moves fast and hates codegen steps  
✅ You want the absolute minimum friction for adding exercises  
✅ You're OK with a small cold-start cost  
✅ You're willing to add `expo-asset` and `expo-file-system` dependencies

## Decision Checklist

- [ ] Are we OK with `expo-asset` + `expo-file-system` in the bundle? → Required  
- [ ] Can we tolerate 100-300ms cold start for parsing? → Yes for moderate content  
- [ ] Do we need build-time validation? → If yes, add a CI script or combine with Approach A's validation  
- [ ] Is hot-reload of `.md` content important? → This is the strongest selling point of Approach B
