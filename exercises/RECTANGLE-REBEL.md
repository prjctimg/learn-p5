# Rectangle Rebel

A `rect` draws a rectangle. It needs 4 parameters:

- x: left edge position
- y: top edge position
- width: how wide
- height: how tall

---

## Task 1 — Basic Rectangle

Draw a rectangle at (100, 100) that is 200 wide and 200 tall.

Use `rect(x, y, width, height)`.

**Validation:** `rect(4)` + `pixelMatch(200, 200, [100, 200, 255])`

---

## Task 2 — Rounded Corners

Add a corner radius to the rectangle.

Use `rect(x, y, w, h, radius)` with a radius of 20.

**Validation:** `rect(5)` + `pixelMatch(200, 200, [100, 200, 255])`
