# Course format

Courses are authored as directories under `src/data/courses/`. Each course is a
directory whose name matches the course slug. Inside sits a `course.yaml`
manifest and one Markdown file per lesson.

## Directory layout

```
src/data/courses/
  shapes/                     # directory name = course slug
    course.yaml               # course-level metadata
    the-first-circle.md       # one .md per lesson
    rectangle-rebel.md
    elliptical-motion.md
    line-dance.md
    triangle-trouble.md
    quad-squad.md
    arc-adept.md
```

## course.yaml

```yaml
slug: shapes
title: Shapes
moduleName: Fundamentals
description: Master the coordinate system and draw your first primitive shapes.
lessons:
  - the-first-circle
  - rectangle-rebel
  - elliptical-motion
  - line-dance
  - triangle-trouble
  - quad-squad
  - arc-adept
```

| Field        | Required | Description |
|--------------|----------|-------------|
| `slug`       | yes      | URL-safe identifier. Must match the directory name. |
| `title`      | yes      | Human-readable course title. |
| `moduleName` | yes      | Module grouping for the course listing. |
| `description`| yes      | Short summary shown on the course card. |
| `lessons`    | yes      | Ordered list of lesson filename stems (without `.md`). Determines the lesson sequence. |

## Build pipeline

1. `scripts/generate-courses.mjs` scans `src/data/courses/` for subdirectories
   containing `course.yaml`.
2. For each course it reads `course.yaml`, then reads each `.md` lesson file in
   the order specified by the `lessons` array.
3. It parses the YAML frontmatter of each `.md` file and extracts structured
   sections from the body (see [exercise.md](./exercise.md)).
4. A TypeScript file is emitted per course (matching the `Course` interface in
   `src/data/types.ts`), plus a barrel `index.ts` that exports all courses.
5. `src/utils/courseLoader.ts` imports from the barrel so new courses are picked
   up automatically.

## Adding a new course

1. Create a new directory under `src/data/courses/` named after the slug.
2. Write `course.yaml` with the fields above.
3. Create one `.md` file per lesson (follow the format in [exercise.md](./exercise.md)).
4. Run `npm run generate-courses` (or just `npm start` which runs it automatically).
5. The generated `.ts` file and barrel are updated — no manual imports needed.
