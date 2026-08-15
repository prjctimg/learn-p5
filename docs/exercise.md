# Exercise / lesson file format

Each lesson is a standalone Markdown file inside a course directory. The file
has YAML frontmatter for structured metadata and a body with H2 sections for
content and code blocks.

## Example

```markdown
---
id: exercise-1
title: The First Circle
symbols:
  - circle
  - fill
  - stroke
  - background
  - createCanvas
---

## Description

Learn how to draw circles and use math to create motion with trigonometric functions.

## Instructions

Modify the `circle()` function parameters to draw a circle at the exact center
of the canvas. The canvas is 400×400 pixels. Use `fill()` to give it a color
and `stroke()` to outline the circle.

## Demo Code

```js
function setup() {
  createCanvas(400, 400);
}
function draw() {
  background(20);
  fill(255, 178, 187);
  circle(mouseX, mouseY, 50);
}
```

## Starter Code

```js
function setup() {
  createCanvas(400, 400);
}
function draw() {
  background(20);
  fill(255, 178, 187);
  circle(200, 200, 50);
}
```
```

## Frontmatter

| Field     | Required | Description |
|-----------|----------|-------------|
| `id`      | yes      | Unique identifier within the course (e.g. `exercise-1`). Used for routing. |
| `title`   | yes      | Lesson title displayed in the UI. |
| `symbols` | yes      | Array of p5.js function names used in this lesson. Drives the on-screen keyboard buttons. |

The `module` field is NOT in the frontmatter — it is set from `course.yaml`
context during the build.

## Body sections

These are H2 (`##`) headings parsed in order. The build script (`gray-matter`
for frontmatter, then a section parser for the body) extracts them by heading
name.

| Section         | Required | Content type | Notes |
|-----------------|----------|--------------|-------|
| `Description`   | yes      | Plain text   | Short summary of what the lesson teaches. |
| `Instructions`  | yes      | Markdown     | The main lesson instructions shown to the user. |
| `Demo Code`     | yes      | Fenced code block (`` ```js ``) | Code the user starts editing. Shown in the editor pane. |
| `Starter Code`  | yes      | Fenced code block (`` ```js ``) | The correct solution. Shown in the preview pane. |

The heading names are case-sensitive and must match exactly (`Demo Code`, not
`Demo code` or `demo code`). Each section contains exactly **one** fenced code
block. Text before the first code block in Demo/Starter sections is ignored.

## Parsing rules

1. Frontmatter is parsed with `gray-matter`.
2. The body is split on H2 headings (`/^## /m`).
3. Each section is identified by its heading text (trimmed).
4. For `Demo Code` and `Starter Code`, the first fenced code block (`` ``` ````
   or `` ```js ``) is extracted as the code value.
5. The `module` field on the final `Lesson` object is set to the course's title
   (from `course.yaml`).
