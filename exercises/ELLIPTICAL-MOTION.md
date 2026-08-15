# Elliptical Motion

An `ellipse` draws an oval. It needs 4 parameters:

- x: center x
- y: center y
- width: horizontal diameter
- height: vertical diameter

---

## Task 1 — Basic Ellipse

Draw an ellipse at (200, 200) that is 300 wide and 150 tall.

Use `ellipse(x, y, width, height)`.

**Validation:** `ellipse(4)` + `pixelMatch(200, 200, [255, 220, 100])`

---

## Task 2 — Circle vs Ellipse

When width equals height, an ellipse becomes a circle.

Draw a perfect circle using `ellipse()` (not `circle()`).

**Validation:** `ellipse(4)` with equal width/height
