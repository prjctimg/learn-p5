# The First Circle

A `circle` is a primitive 2D shape. To draw one, we need 3 parameters:

- x: horizontal position on the canvas
- y: vertical position on the canvas
- diameter: how wide/tall the circle is

---

## Task 1 — Draw the Circle

Let's draw a circle at the center of the canvas.

Use `circle(x, y, diameter)` with x=200, y=200, and a diameter of 100.

**Validation:** `circle(3)` + `pixelMatch(200, 200, [255, 105, 180])`

---

## Task 2 — Style It

Now change the fill color to something other than pink.

Use `fill(r, g, b)` before the `circle()` call. Try a warm orange: `fill(255, 165, 0)`.

**Validation:** `circle(3)` + `pixelMatch(200, 200, [255, 165, 0])`
