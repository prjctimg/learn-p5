export type PairedSymbol = {
  open: string;
  close: string;
  display: string;
  hintTrigger: "string" | "array" | null;
};

export type P5FunctionDef = {
  label: string;
  insert: string;
  paramTypes: ("string" | "number" | "array" | "color" | "boolean")[];
  disabled?: boolean;
};

export const pairedSymbols: PairedSymbol[] = [
  { open: "(", close: ")", display: "( )", hintTrigger: null },
  { open: "{", close: "}", display: "{ }", hintTrigger: null },
  { open: "[", close: "]", display: "[ ]", hintTrigger: "array" },
  { open: "<", close: ">", display: "< >", hintTrigger: null },
  { open: '"', close: '"', display: '" "', hintTrigger: "string" },
];

export const singleSymbols = [
  ".", ";", ",", "=", "+", "-", "*", "/",
];

export const p5Functions: P5FunctionDef[] = [
  { label: "setup", insert: "function setup() {\n  \n}", paramTypes: [] },
  { label: "draw", insert: "function draw() {\n  \n}", paramTypes: [] },
  { label: "createCanvas", insert: "createCanvas()", paramTypes: ["number", "number"] },
  { label: "background", insert: "background()", paramTypes: ["number", "string"] },
  { label: "fill", insert: "fill()", paramTypes: ["number", "string"] },
  { label: "circle", insert: "circle()", paramTypes: ["number", "number", "number"] },
  { label: "stroke", insert: "stroke()", paramTypes: ["number", "string"] },
  { label: "strokeWeight", insert: "strokeWeight()", paramTypes: ["number"] },
  { label: "line", insert: "line()", paramTypes: ["number", "number", "number", "number"] },
  { label: "rect", insert: "rect()", paramTypes: ["number", "number", "number", "number"] },
  { label: "ellipse", insert: "ellipse()", paramTypes: ["number", "number", "number", "number"] },
  { label: "noStroke", insert: "noStroke()", paramTypes: [] },
];

export const p5FunctionLabels = new Set(p5Functions.map((f) => f.label));
