import type { ContentReference, ContentSymbol } from "../content/types";
import { requireContentPack } from "../content/store";

export type GeneratedSymbol = ContentSymbol;

export type ReferenceData = ContentReference;

export type P5Symbol = {
  name: string;
  module: string;
  description: string;
  syntax: string;
  parameters: { name: string; type: string; description: string }[];
  examples?: string[];
  norender?: boolean;
};

let cachedReference: ReferenceData | null = null;
let cachedSymbols: P5Symbol[] = [];
let cachedByName: Record<string, P5Symbol> = {};

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

function ensureReferenceCache(): void {
  const data = requireContentPack().reference;
  if (data === cachedReference) return;
  cachedReference = data;
  cachedSymbols = Object.values(data.byName).map(toP5Symbol);
  cachedByName = {};
  for (const view of cachedSymbols) {
    cachedByName[view.name] = view;
  }
}

export function getReferenceData(): ReferenceData {
  return requireContentPack().reference;
}

export function getP5Symbols(): P5Symbol[] {
  ensureReferenceCache();
  return cachedSymbols;
}

export function getP5SymbolsByName(): Record<string, P5Symbol> {
  ensureReferenceCache();
  return cachedByName;
}

export function getP5FunctionNames(): string[] {
  return getReferenceData().functionNames;
}

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
  // p5 2.0 routes touch through the pointer-backed mouse* events, so touch*
  // handlers are deliberately absent.
  "deviceMoved",
  "deviceTurned",
  "deviceShaken",
  "windowResized",
];
