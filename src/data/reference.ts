import generated from "./reference.generated.json";

export interface GeneratedSymbol {
  name: string;
  module: string;
  submodule: string | null;
  class: string;
  itemtype: "method" | "property" | "type";
  description: string;
  syntax: string;
  params: { name: string; type: string; optional: boolean; description: string }[];
  overloads?: { params: { name: string; type: string; optional: boolean; description: string }[]; chainable: boolean }[];
  chainable: boolean;
  isConstructor: boolean;
  examples?: string[];
}

interface ReferenceData {
  byName: Record<string, GeneratedSymbol>;
  byModule: Record<string, string[]>;
  byClass: Record<string, string[]>;
  classes: string[];
  keyboardFunctions: { label: string; insert: string; paramTypes: string[] }[];
  functionNames: string[];
  metadata: { generatedAt: string; p5Version: string; symbolCount: number };
}

const data = generated as ReferenceData;

export type P5Symbol = {
  name: string;
  module: string;
  description: string;
  syntax: string;
  parameters: { name: string; type: string; description: string }[];
  examples?: string[];
  norender?: boolean;
};

function toP5Symbol(sym: GeneratedSymbol): P5Symbol {
  return {
    name: sym.name,
    module: sym.module,
    description: sym.description,
    syntax: sym.syntax,
    parameters: sym.params.map((p) => ({
      name: p.name,
      type: p.type,
      description: p.description,
    })),
    examples: sym.examples,
    norender: sym.itemtype === "property",
  };
}

export const P5_SYMBOLS: P5Symbol[] = Object.values(data.byName).map(toP5Symbol);

export const P5_SYMBOLS_BY_NAME: Record<string, P5Symbol> = {};
for (const view of P5_SYMBOLS) {
  P5_SYMBOLS_BY_NAME[view.name] = view;
}

export const P5_FUNCTION_NAMES: string[] = data.functionNames;

export const ONCE_ONLY_P5_FUNCTIONS: string[] = [
  "preload",
  "setup",
  "draw",
  "mouseMoved",
  "mouseDragged",
  "mousePressed",
  "mouseReleased",
  "mouseClicked",
  "doubleClicked",
  "mouseWheel",
  "keyPressed",
  "keyReleased",
  "keyTyped",
  "touchStarted",
  "touchMoved",
  "touchEnded",
  "deviceMoved",
  "deviceTurned",
  "deviceShaken",
  "windowResized",
];

// Raw access to the full generated data (for new code)
export const GENERATED_REFERENCE = data;
