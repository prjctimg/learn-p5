# Arc Adept

An `arc` draws a partial curve. It needs at least 6 parameters:

- x, y: center position
- w, h: width and height of the ellipse
- start: start angle (in radians)
- stop: stop angle (in radians)

---

## Task 1 — Semicircle

Draw a semicircle that opens upward.

Use `arc(x, y, w, h, PI, TWO_PI)`.

**Validation:** `arc(5)` + `pixelMatch(200, 120, [255, 150, 200])`

---

## Task 2 — Pie Slice

Add the `PIE` mode to make the arc a filled pie shape.

Use `arc(x, y, w, h, start, stop, PIE)`.

**Validation:** `arc(6)` (6 args for PIE mode)
