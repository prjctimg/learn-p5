export const shapesCourse = {
  slug: "shapes",
  title: "Shapes",
  moduleName: "Fundamentals",
  description: "Master the coordinate system and draw your first primitive shapes using code.",
  lessons: [
    {
      id: "exercise-1",
      title: "The First Circle",
      module: "Shapes",
      description: "Draw your first shape — a pink ball on a white canvas.",
      instruction: "Draw a circle at the center of the 400x400 canvas.\n\nUse circle(x, y, diameter) with x=200, y=200, and a diameter of 100.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(255);\n  fill(255, 105, 180);\n  circle(200, 200, 100);\n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(255);\n  fill(255, 105, 180);\n  circle(200, 200, 100);\n}"
    },
    {
      id: "exercise-2",
      title: "Rectangle Rebel",
      module: "Shapes",
      description: "Learn how to draw rectangles and understand the coordinate system.",
      instruction: "Draw a rectangle in the center of the dark canvas.\n\nUse rect(x, y, width, height) to draw a 200x200 rectangle at position (100, 100).",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(100, 200, 255);\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(100, 200, 255);\n  rect(100, 100, 200, 200);\n}"
    },
    {
      id: "exercise-3",
      title: "Elliptical Motion",
      module: "Shapes",
      description: "Explore the difference between circles and ellipses.",
      instruction: "Draw an oval shape that is wider than it is tall.\n\nUse ellipse(x, y, width, height) — try 300 wide and 150 tall, centered at (200, 200).",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(40);\n  fill(255, 220, 100);\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(40);\n  fill(255, 220, 100);\n  ellipse(200, 200, 300, 150);\n}"
    },
    {
      id: "exercise-4",
      title: "Line Dance",
      module: "Shapes",
      description: "Connect points across the canvas using lines and customize them.",
      instruction: "Draw a diagonal line from top-left to bottom-right.\n\nUse line(x1, y1, x2, y2) with coordinates (0, 0) and (400, 400).",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(15);\n  stroke(255, 100, 100);\n  strokeWeight(4);\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(15);\n  stroke(255, 100, 100);\n  strokeWeight(4);\n  line(0, 0, 400, 400);\n}"
    },
    {
      id: "exercise-5",
      title: "Triangle Trouble",
      module: "Shapes",
      description: "Build custom polygons by placing three vertices.",
      instruction: "Draw an upward-pointing triangle.\n\nUse triangle(x1, y1, x2, y2, x3, y3) with vertices at (200, 50), (100, 300), and (300, 300).",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20);\n  fill(100, 255, 150);\n  noStroke();\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20);\n  fill(100, 255, 150);\n  noStroke();\n  triangle(200, 50, 100, 300, 300, 300);\n}"
    },
    {
      id: "exercise-6",
      title: "Quad Squad",
      module: "Shapes",
      description: "Draw four-sided shapes with quad() and explore quadrilaterals.",
      instruction: "Draw a trapezoid using four corner points.\n\nUse quad(x1, y1, x2, y2, x3, y3, x4, y4) with the given coordinates.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(25);\n  fill(180, 130, 255);\n  stroke(255);\n  strokeWeight(2);\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(25);\n  fill(180, 130, 255);\n  stroke(255);\n  strokeWeight(2);\n  quad(150, 100, 250, 100, 300, 300, 100, 300);\n}"
    },
    {
      id: "exercise-7",
      title: "Arc Adept",
      module: "Shapes",
      description: "Draw partial curves with arc() and control the visible portion.",
      instruction: "Draw a semicircle that opens upward.\n\nUse arc(x, y, w, h, start, stop) with PI as the start angle and TWO_PI as the stop angle.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(255, 150, 200);\n  noStroke();\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(255, 150, 200);\n  noStroke();\n  arc(200, 200, 300, 300, PI, TWO_PI);\n}"
    }
  ]
};

export type Course = typeof shapesCourse;