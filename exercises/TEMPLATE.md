# Exercise Template

This is the generalized template for creating multi-task exercises for any p5.js module.
Each exercise file in this directory serves as a design doc — not runtime code.

## File Naming

Use UPPER-KEBAB-CASE matching the exercise title:
- `THE-FIRST-CIRCLE.md`
- `RECTANGLE-REBEL.md`
- `LINE-DANCE.md`

## Structure

```markdown
# Exercise Title

## Task N — Task Title

[1-2 sentence intro explaining the concept]

- param-1: description
- param-2: description

[Instruction: tell the user exactly what to do, referencing the function and arguments]

**Validation:** `functionName(exactArgs)` + optional `pixelMatch(x, y, [r, g, b])`

---

## Task N+1 — Next Task Title

[Builds on the previous task — more sophisticated use]

[Instruction]

**Validation:** `functionName(exactArgs)` + optional `pixelMatch(x, y, [r, g, b])`
```

## Guidelines

### Tasks per Exercise

- Each exercise should have **2–4 tasks**
- Tasks progress from **basic → intermediate → advanced**
- Each task introduces ONE new concept or variation
- Later tasks build on earlier code (cumulative)

### Task Progression Patterns

**Shapes:** basic shape → styled shape (fill/stroke) → positioned/sized variation → combination
**Color:** single color → RGB → opacity → gradients
**Transform:** translate → rotate → scale → push/pop matrix
**Events:** mousePressed → keyPressed → combined interactions

### Instruction Tone

- Use **"you"** and **"let's"** — direct, encouraging
- Keep instructions under 3 sentences per task
- Reference the p5.js function with its full signature: `circle(x, y, diameter)`
- Avoid repetition — don't repeat the same instruction pattern
- Use the p5.js reference for accurate parameter descriptions

### Validation Rules

- Always use `functionCall` with `exactArgs` to verify the function is called correctly
- Use `pixelMatch` when the visual output matters (color, position)
- For multi-step exercises, each task has its own validation array
- Keep validation simple — one or two rules per task

### Code Structure

Each exercise should have:
- **startingCode**: minimal setup (canvas + background) — user adds the shape
- **solution**: complete working sketch
- **tasks**: each with its own instruction, validation, and optional startingCode override

## Example: Shapes Module

See the individual exercise files in this directory for examples.
