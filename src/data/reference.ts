import type { ContentReference, ContentSymbol } from "../types";
import { requireContentPack } from "../content/store";

let cachedReference: ContentReference | null = null;
let cachedSymbols: ContentSymbol[] = [];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getReferenceData(): ContentReference {
  return requireContentPack().reference;
}

export function getP5Symbols(): ContentSymbol[] {
  const reference = getReferenceData();
  if (reference !== cachedReference) {
    cachedReference = reference;
    cachedSymbols = Object.values(reference.byName);
  }
  return cachedSymbols;
}

export function getP5SymbolsByName(): Record<string, ContentSymbol> {
  return getReferenceData().byName;
}

export function getP5FunctionNames(): string[] {
  return getReferenceData().functionNames;
}

export function buildP5SymbolPattern(): RegExp | null {
  const names = getP5FunctionNames();
  if (names.length === 0) return null;
  return new RegExp(`\\b(${names.map(escapeRegExp).join("|")})\\b(?=\\s*\\()`, "g");
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
  // p5 2.0 routes touch through the pointer-backed mouse* events.
  "deviceMoved",
  "deviceTurned",
  "deviceShaken",
  "windowResized",
];
