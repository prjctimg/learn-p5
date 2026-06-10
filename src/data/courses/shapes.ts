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
      description: "Learn how to draw circles and use math to create motion with trigonometric functions.",
      instruction: "Modify the circle() function parameters to draw a circle at the exact center of the canvas. The canvas is 400x400 pixels. Use fill() to give it a color and stroke() to outline the circle.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20);\n  fill(255, 178, 187);\n  circle(mouseX, mouseY, 50);\n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20);\n  fill(255, 178, 187);\n  circle(200, 200, 50);\n}"
    },
    {
      id: "exercise-2",
      title: "Rectangle Rebel",
      module: "Shapes",
      description: "Learn how to draw rectangles and understand the coordinate system.",
      instruction: "Draw a rectangle in the center of the canvas using rect(). The rect() function takes x, y, width, and height. Try making a rectangle that fills most of the canvas.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(100, 200, 255);\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(100, 200, 255);\n  rect(100, 100, 200, 200);\n}"
    },
    {
      id: "exercise-3",
      title: "Elliptical Motion",
      module: "Shapes",
      description: "Explore the difference between circles and ellipses.",
      instruction: "Use ellipse() to draw an oval shape. Unlike circle() which takes a single diameter, ellipse() takes separate width and height parameters. Try creating an ellipse that is wider than it is tall.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(40);\n  fill(255, 220, 100);\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(40);\n  fill(255, 220, 100);\n  ellipse(200, 200, 300, 150);\n}"
    },
    {
      id: "exercise-4",
      title: "Line Dance",
      module: "Shapes",
      description: "Connect points across the canvas using lines and customize them.",
      instruction: "Use line() to draw a straight line between two points. The parameters are (x1, y1, x2, y2). You can change the line appearance with stroke() and strokeWeight(). Draw a line from the top-left to the bottom-right corner.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(15);\n  stroke(255, 100, 100);\n  strokeWeight(4);\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(15);\n  stroke(255, 100, 100);\n  strokeWeight(4);\n  line(0, 0, 400, 400);\n}"
    },
    {
      id: "exercise-5",
      title: "Triangle Trouble",
      module: "Shapes",
      description: "Build custom polygons by placing three vertices.",
      instruction: "Use triangle() to draw a three-sided shape. It takes six parameters: (x1, y1, x2, y2, x3, y3). Position the three points to make an isosceles triangle pointing upward.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20);\n  fill(100, 255, 150);\n  noStroke();\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20);\n  fill(100, 255, 150);\n  noStroke();\n  triangle(200, 50, 100, 300, 300, 300);\n}"
    },
    {
      id: "exercise-6",
      title: "Quad Squad",
      module: "Shapes",
      description: "Draw four-sided shapes with quad() and explore quadrilaterals.",
      instruction: "Use quad() to draw a four-sided shape. It takes eight parameters: (x1, y1, x2, y2, x3, y3, x4, y4). Create a trapezoid by placing the four points in clockwise order.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(25);\n  fill(180, 130, 255);\n  stroke(255);\n  strokeWeight(2);\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(25);\n  fill(180, 130, 255);\n  stroke(255);\n  strokeWeight(2);\n  quad(150, 100, 250, 100, 300, 300, 100, 300);\n}"
    },
    {
      id: "exercise-7",
      title: "Arc Adept",
      module: "Shapes",
      description: "Draw partial curves with arc() and control the visible portion.",
      instruction: "Use arc() to draw a curved section. The parameters are (x, y, w, h, start, stop). Draw a half-circle (semicircle) arc that opens upward. Use PI and TWO_PI constants for the angle values.",
      startingCode: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(255, 150, 200);\n  noStroke();\n  \n}",
      solution: "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(255, 150, 200);\n  noStroke();\n  arc(200, 200, 300, 300, PI, TWO_PI);\n}"
    }
  ]
};

export type Course = typeof shapesCourse;