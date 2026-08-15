# Implementation Stub: Approach B — Runtime .md Parser

## `src/utils/exerciseParser.ts`

```typescript
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import type { Course, Exercise, ExerciseTask, ValidationRule } from '../data/types';

// ------------------------------------------------------------------
// Minimal frontmatter parser (no deps — pure TypeScript)
// ------------------------------------------------------------------
interface FrontmatterResult {
  data: Record<string, string>;
  content: string;
}

function parseFrontmatter(text: string): FrontmatterResult {
  const data: Record<string, string> = {};
  let content = text;

  if (text.startsWith('---')) {
    const end = text.indexOf('---', 3);
    if (end !== -1) {
      const fmLines = text.slice(3, end).trim().split('\n');
      content = text.slice(end + 3).trim();
      for (const line of fmLines) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
    }
  }

  return { data, content };
}

// ------------------------------------------------------------------
// Extract title from H1
// ------------------------------------------------------------------
function extractTitle(md: string): string {
  const m = md.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : 'Untitled';
}

// ------------------------------------------------------------------
// Extract ```json validation blocks
// ------------------------------------------------------------------
interface ExercisePayload {
  instruction?: string;
  startingCode?: string;
  solution?: string;
  tasks?: Array<{
    id: string;
    title: string;
    instruction: string;
    validation: ValidationRule[];
  }>;
}

function extractValidationPayload(md: string): ExercisePayload | null {
  const re = /```json\s+validation\n([\s\S]*?)```/;
  const m = md.match(re);
  if (!m) return null;
  try {
    return JSON.parse(m[1]) as ExercisePayload;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Asset index — maps course slugs to their .md file paths
// ------------------------------------------------------------------
// In a real app, require.resolve() or a generated index would be used.
// For now, we manually list the assets.
//
// Metro treats .md files as assets, returning their URIs at runtime.
// The Asset.fromModule() call reads them from the app bundle.

const COURSE_INDEX: Record<string, { meta: number; exercises: number[] }> = {
  shapes: {
    meta: require('../../exercises/shapes/course.md'),
    exercises: [
      require('../../exercises/shapes/exercises/exercise-1.md'),
      require('../../exercises/shapes/exercises/exercise-2.md'),
      require('../../exercises/shapes/exercises/exercise-3.md'),
      require('../../exercises/shapes/exercises/exercise-4.md'),
      require('../../exercises/shapes/exercises/exercise-5.md'),
      require('../../exercises/shapes/exercises/exercise-6.md'),
      require('../../exercises/shapes/exercises/exercise-7.md'),
    ],
  },
};

// ------------------------------------------------------------------
// Cache — parsed courses are memoized
// ------------------------------------------------------------------
let parsedCache: Record<string, Course> | null = null;

// ------------------------------------------------------------------
// Main loader
// ------------------------------------------------------------------
async function readMdAsset(assetRef: number): Promise<string> {
  const asset = Asset.fromModule(assetRef);
  await asset.downloadAsync(); // copies from bundle to local FS
  return FileSystem.readAsStringAsync(asset.localUri!);
}

export async function loadCourses(): Promise<Course[]> {
  if (parsedCache) return Object.values(parsedCache);

  const courses: Record<string, Course> = {};

  for (const [slug, refs] of Object.entries(COURSE_INDEX)) {
    // Read all files in parallel for this course
    const contents = await Promise.all([
      readMdAsset(refs.meta),
      ...refs.exercises.map((r) => readMdAsset(r)),
    ]);

    // First file = course.md (frontmatter only)
    const courseMeta = parseFrontmatter(contents[0]);

    // Remaining files = exercises
    const exercises: Exercise[] = [];

    for (let i = 1; i < contents.length; i++) {
      const md = contents[i];
      const { data, content } = parseFrontmatter(md);
      const title = extractTitle(content);
      const payload = extractValidationPayload(content);

      const exercise: Exercise = {
        id: data.id || `exercise-${i}`,
        title,
        module: data.module || slug,
        description: data.description || '',
        instruction: payload?.instruction || '',
        startingCode: payload?.startingCode || '',
        solution: payload?.solution || '',
        tasks: payload?.tasks || [],
      };
      exercises.push(exercise);
    }

    courses[slug] = {
      slug,
      title: courseMeta.data.title || slug,
      moduleName: courseMeta.data.moduleName || 'Fundamentals',
      description: courseMeta.data.description || '',
      exercises,
    };
  }

  parsedCache = courses;
  return Object.values(courses);
}

export async function loadCourse(slug: string): Promise<Course | null> {
  const courses = await loadCourses();
  return courses.find((c) => c.slug === slug) ?? null;
}

export async function loadExercise(
  courseSlug: string,
  exerciseId: string
): Promise<Exercise | null> {
  const course = await loadCourse(courseSlug);
  return course?.exercises.find((e) => e.id === exerciseId) ?? null;
}
```

## Metro config update

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('md');
module.exports = config;
```

## Directory structure

```
exercises/
├── shapes/
│   ├── course.md           # Course metadata (frontmatter only)
│   └── exercises/
│       ├── exercise-1.md   # Full exercise markdown + validation JSON
│       ├── exercise-2.md
│       └── ...
└── colors/                 # Future courses
    ├── course.md
    └── exercises/
```
