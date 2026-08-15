export const shapesCourse = {
  "slug": "shapes",
  "title": "Shapes",
  "moduleName": "Fundamentals",
  "description": "Master the coordinate system and draw your first primitive shapes using code.",
  "exercises": [
    {
      "id": "exercise-1",
      "title": "The First Circle",
      "module": "Shapes",
      "description": "Draw your first shape — a pink ball on a white canvas.",
      "instruction": "Draw a circle at the center of the 400x400 canvas.\nUse circle(x, y, diameter) with x=200, y=200, and a diameter of 100.\n",
      "startingCode": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(255);\n  fill(255, 105, 180);\n}\n",
      "solution": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(255);\n  fill(255, 165, 0);\n  circle(200, 200, 100);\n}\n",
      "tasks": [
        {
          "id": "task-1",
          "title": "Draw the Circle",
          "instruction": "Draw a circle at the center of the 400x400 canvas.\nUse circle(x, y, diameter) with x=200, y=200, and a diameter of 100.\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "circle",
              "exactArgs": 3
            },
            {
              "type": "pixelMatch",
              "x": 200,
              "y": 200,
              "expected": [
                255,
                105,
                180
              ],
              "tolerance": 120
            }
          ]
        },
        {
          "id": "task-2",
          "title": "Change the Color",
          "instruction": "Now change the fill color to orange.\nUse fill(255, 165, 0) before the circle() call.\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "circle",
              "exactArgs": 3
            },
            {
              "type": "pixelMatch",
              "x": 200,
              "y": 200,
              "expected": [
                255,
                165,
                0
              ],
              "tolerance": 120
            }
          ]
        }
      ]
    },
    {
      "id": "exercise-2",
      "title": "Rectangle Rebel",
      "module": "Shapes",
      "description": "Learn how to draw rectangles and understand the coordinate system.",
      "instruction": "Draw a rectangle in the center of the dark canvas.\nUse rect(x, y, width, height) to draw a 200x200 rectangle at position (100, 100).\n",
      "startingCode": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(100, 200, 255);\n}\n",
      "solution": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(100, 200, 255);\n  rect(100, 100, 200, 200, 20);\n}\n",
      "tasks": [
        {
          "id": "task-1",
          "title": "Basic Rectangle",
          "instruction": "Draw a rectangle at (100, 100) that is 200 wide and 200 tall.\nUse rect(x, y, width, height).\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "rect",
              "exactArgs": 4
            },
            {
              "type": "pixelMatch",
              "x": 200,
              "y": 200,
              "expected": [
                100,
                200,
                255
              ],
              "tolerance": 120
            }
          ]
        },
        {
          "id": "task-2",
          "title": "Rounded Corners",
          "instruction": "Add a corner radius of 20 to round the corners.\nUse rect(x, y, w, h, radius) with 5 arguments.\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "rect",
              "exactArgs": 5
            },
            {
              "type": "pixelMatch",
              "x": 200,
              "y": 200,
              "expected": [
                100,
                200,
                255
              ],
              "tolerance": 120
            }
          ]
        }
      ]
    },
    {
      "id": "exercise-3",
      "title": "Elliptical Motion",
      "module": "Shapes",
      "description": "Explore the difference between circles and ellipses.",
      "instruction": "Draw an oval shape that is wider than it is tall.\nUse ellipse(x, y, width, height) — try 300 wide and 150 tall, centered at (200, 200).\n",
      "startingCode": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(40);\n  fill(255, 220, 100);\n}\n",
      "solution": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(40);\n  fill(255, 220, 100);\n  ellipse(200, 200, 300, 300);\n}\n",
      "tasks": [
        {
          "id": "task-1",
          "title": "Basic Ellipse",
          "instruction": "Draw an ellipse at (200, 200) that is 300 wide and 150 tall.\nUse ellipse(x, y, width, height).\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "ellipse",
              "exactArgs": 4
            },
            {
              "type": "pixelMatch",
              "x": 200,
              "y": 200,
              "expected": [
                255,
                220,
                100
              ],
              "tolerance": 120
            }
          ]
        },
        {
          "id": "task-2",
          "title": "Circle via Ellipse",
          "instruction": "When width equals height, an ellipse becomes a circle.\nDraw a perfect circle using ellipse() — set both width and height to 300.\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "ellipse",
              "exactArgs": 4
            }
          ]
        }
      ]
    },
    {
      "id": "exercise-4",
      "title": "Line Dance",
      "module": "Shapes",
      "description": "Connect points across the canvas using lines and customize them.",
      "instruction": "Draw a diagonal line from top-left to bottom-right.\nUse line(x1, y1, x2, y2) with coordinates (0, 0) and (400, 400).\n",
      "startingCode": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(15);\n  stroke(255, 100, 100);\n  strokeWeight(4);\n}\n",
      "solution": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(15);\n  stroke(255, 100, 100);\n  strokeWeight(4);\n  line(0, 0, 400, 400);\n}\n",
      "tasks": [
        {
          "id": "task-1",
          "title": "Single Line",
          "instruction": "Draw a diagonal line from top-left (0, 0) to bottom-right (400, 400).\nUse line(x1, y1, x2, y2).\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "line",
              "exactArgs": 4
            }
          ]
        },
        {
          "id": "task-2",
          "title": "Add a Second Line",
          "instruction": "Draw another line from bottom-left to top-right: (0, 400) to (400, 0).\nYou now have two line() calls creating an X shape.\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "line",
              "exactArgs": 4
            }
          ]
        }
      ]
    },
    {
      "id": "exercise-5",
      "title": "Triangle Trouble",
      "module": "Shapes",
      "description": "Build custom polygons by placing three vertices.",
      "instruction": "Draw an upward-pointing triangle.\nUse triangle(x1, y1, x2, y2, x3, y3) with vertices at (200, 50), (100, 300), and (300, 300).\n",
      "startingCode": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20);\n  fill(100, 255, 150);\n  noStroke();\n}\n",
      "solution": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20);\n  fill(100, 255, 150);\n  noStroke();\n  triangle(200, 50, 100, 300, 300, 300);\n}\n",
      "tasks": [
        {
          "id": "task-1",
          "title": "Basic Triangle",
          "instruction": "Draw an upward-pointing triangle.\nUse triangle(x1, y1, x2, y2, x3, y3) with vertices at (200, 50), (100, 300), (300, 300).\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "triangle",
              "exactArgs": 6
            },
            {
              "type": "pixelMatch",
              "x": 200,
              "y": 250,
              "expected": [
                100,
                255,
                150
              ],
              "tolerance": 120
            }
          ]
        }
      ]
    },
    {
      "id": "exercise-6",
      "title": "Quad Squad",
      "module": "Shapes",
      "description": "Draw four-sided shapes with quad() and explore quadrilaterals.",
      "instruction": "Draw a trapezoid using four corner points.\nUse quad(x1, y1, x2, y2, x3, y3, x4, y4) with the given coordinates.\n",
      "startingCode": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(25);\n  fill(180, 130, 255);\n  stroke(255);\n  strokeWeight(2);\n}\n",
      "solution": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(25);\n  fill(180, 130, 255);\n  stroke(255);\n  strokeWeight(2);\n  quad(150, 100, 250, 100, 300, 300, 100, 300);\n}\n",
      "tasks": [
        {
          "id": "task-1",
          "title": "Basic Quad",
          "instruction": "Draw a trapezoid using four corner points.\nUse quad(x1, y1, x2, y2, x3, y3, x4, y4) with vertices at (150, 100), (250, 100), (300, 300), (100, 300).\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "quad",
              "exactArgs": 8
            },
            {
              "type": "pixelMatch",
              "x": 200,
              "y": 200,
              "expected": [
                180,
                130,
                255
              ],
              "tolerance": 120
            }
          ]
        }
      ]
    },
    {
      "id": "exercise-7",
      "title": "Arc Adept",
      "module": "Shapes",
      "description": "Draw partial curves with arc() and control the visible portion.",
      "instruction": "Draw a semicircle that opens upward.\nUse arc(x, y, w, h, start, stop) with PI as the start angle and TWO_PI as the stop angle.\n",
      "startingCode": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(255, 150, 200);\n  noStroke();\n}\n",
      "solution": "function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  fill(255, 150, 200);\n  noStroke();\n  arc(200, 200, 300, 300, PI, TWO_PI, PIE);\n}\n",
      "tasks": [
        {
          "id": "task-1",
          "title": "Semicircle",
          "instruction": "Draw a semicircle that opens upward.\nUse arc(x, y, w, h, PI, TWO_PI) with a 300x300 size.\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "arc",
              "minArgs": 5
            },
            {
              "type": "pixelMatch",
              "x": 200,
              "y": 120,
              "expected": [
                255,
                150,
                200
              ],
              "tolerance": 120
            }
          ]
        },
        {
          "id": "task-2",
          "title": "Pie Slice",
          "instruction": "Add the PIE mode to fill the arc as a pie shape.\nUse arc(x, y, w, h, start, stop, PIE) with 7 arguments.\n",
          "validation": [
            {
              "type": "functionCall",
              "name": "arc",
              "exactArgs": 7
            }
          ]
        }
      ]
    }
  ]
};