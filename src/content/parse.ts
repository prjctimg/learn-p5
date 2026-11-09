import {
  SUPPORTED_CONTENT_SCHEMA_VERSIONS,
} from "../constants/Content";
import type { ContentPack } from "./types";

// Legacy schema 1 packs carried the full p5.js runtime as a string. The
// runtime now ships in the app bundle (fetched verbatim at build time,
// never vendored), but old cached packs are still parsed on upgrade, so
// keep this validation strict: a missing or truncated runtime in a
// legacy cache is rejected and re-downloaded rather than rendering a
// broken editor.
const MIN_P5_SOURCE_LENGTH = 100_000;

export function validateP5Source(source: string, version: string): void {
  if (typeof source !== "string" || typeof version !== "string") {
    throw new Error("The downloaded content pack is incomplete.");
  }

  if (source.length < MIN_P5_SOURCE_LENGTH) {
    throw new Error("The downloaded content pack contains an incomplete p5.js runtime.");
  }

  const header = source.match(/^\/\*!\s*p5\.js\s+v([^\s]+)/);
  if (!header) {
    throw new Error("The downloaded content pack contains an invalid p5.js runtime.");
  }
  if (header[1] !== version) {
    throw new Error("The downloaded content pack has a mismatched p5.js version.");
  }

  if (!source.trimEnd().endsWith(");")) {
    throw new Error("The downloaded content pack contains a truncated p5.js runtime.");
  }
}

function validateInlineP5Source(pack: ContentPack): void {
  const p5 = pack.p5;
  if (!p5 || typeof p5.version !== "string" || typeof p5.source !== "string") {
    throw new Error("The downloaded content pack is incomplete.");
  }

  validateP5Source(p5.source, p5.version);
}

export function parseContentPack(raw: string): ContentPack {
  const pack = JSON.parse(raw) as ContentPack;

  if (!pack || !SUPPORTED_CONTENT_SCHEMA_VERSIONS.includes(pack.schemaVersion as 1 | 2)) {
    throw new Error("This content pack needs a newer app version.");
  }
  if (
    typeof pack.contentVersion !== "string" ||
    !Array.isArray(pack.courses) ||
    !pack.reference?.byName ||
    !Array.isArray(pack.reference.functionNames)
  ) {
    throw new Error("The downloaded content pack is incomplete.");
  }

  // Schema 1 packs carried the runtime inline. Schema 2+ packs carry no
  // runtime: p5.js is fetched verbatim at app build time and bundled
  // with the app (scripts/bundle-p5.mjs).
  if (pack.schemaVersion === 1) {
    validateInlineP5Source(pack);
  }
  return pack;
}
