import { GENERATED_REFERENCE } from "./reference";

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
  { open: '"', close: '"', display: '" "', hintTrigger: "string" },
];

export const singleSymbols = [
  ".", ";", ",", "=", "+", "-", "*", "/",
];

const P5_TYPE_TO_KEYBOARD_TYPE: Record<string, "string" | "number" | "array" | "color" | "boolean"> = {
  string: "string",
  String: "string",
  number: "number",
  Number: "number",
  Integer: "number",
  float: "number",
  color: "color",
  "p5.Color": "color",
  array: "array",
  "Number[]": "array",
  "String[]": "array",
  boolean: "boolean",
  Boolean: "boolean",
  Constant: "number",
};

function refTypeToKeyboardType(type: string): "string" | "number" | "array" | "color" | "boolean" {
  return P5_TYPE_TO_KEYBOARD_TYPE[type] || "number";
}

type FunctionSpec = {
  label: string;
  insert: string;
  params?: string[]; // function param names to pull from reference
};

const KEYBOARD_FUNCTIONS: FunctionSpec[] = [
  { label: "setup", insert: "function setup() {\n  \n}", params: [] },
  { label: "draw", insert: "function draw() {\n  \n}", params: [] },
  { label: "createCanvas", insert: "createCanvas()", params: ["w", "h"] },
  { label: "background", insert: "background()", params: ["v1", "v2", "v3"] },
  { label: "fill", insert: "fill()", params: ["v1", "v2", "v3"] },
  { label: "stroke", insert: "stroke()", params: ["v1", "v2", "v3"] },
  { label: "circle", insert: "circle()", params: ["x", "y", "d"] },
  { label: "strokeWeight", insert: "strokeWeight()", params: ["weight"] },
  { label: "line", insert: "line()", params: ["x1", "y1", "x2", "y2"] },
  { label: "rect", insert: "rect()", params: ["x", "y", "w", "h"] },
  { label: "ellipse", insert: "ellipse()", params: ["x", "y", "w", "h"] },
  { label: "noStroke", insert: "noStroke()", params: [] },
];

export const p5Functions: P5FunctionDef[] = KEYBOARD_FUNCTIONS.map((spec) => {
  const ref = GENERATED_REFERENCE.byName[spec.label];
  if (ref && spec.params) {
    const paramTypes = spec.params.map((pname) => {
      const p = ref.params.find((rp) => rp.name === pname);
      return p ? refTypeToKeyboardType(p.type) : "number";
    });
    return { label: spec.label, insert: spec.insert, paramTypes };
  }
  return { label: spec.label, insert: spec.insert, paramTypes: [] };
});

export const p5FunctionLabels = new Set(p5Functions.map((f) => f.label));
