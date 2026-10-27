import { CONTENT_SCHEMA_VERSION } from "../constants/Content";
import type { ContentPack } from "./types";

// The content pack carries the full p5.js runtime so exercises can run without
// a network connection. A pack with a missing or truncated runtime is worse
// than no pack at all: it renders a broken editor and makes `new p5()` fail
// with an opaque "p5 is not a constructor" error. Keep this check deliberately
// strict so a bad cache is rejected and can be downloaded again.
const MIN_P5_SOURCE_LENGTH = 100_000;

function validateP5Source(pack: ContentPack): void {
  const p5 = pack.p5;
  if (!p5 || typeof p5.version !== "string" || typeof p5.source !== "string") {
    throw new Error("The downloaded content pack is incomplete.");
  }

  const source = p5.source;
  if (source.length < MIN_P5_SOURCE_LENGTH) {
    throw new Error("The downloaded content pack contains an incomplete p5.js runtime.");
  }

  const header = source.match(/^\/\*!\s*p5\.js\s+v([^\s]+)/);
  if (!header) {
    throw new Error("The downloaded content pack contains an invalid p5.js runtime.");
  }
  if (header[1] !== p5.version) {
    throw new Error("The downloaded content pack has a mismatched p5.js version.");
  }

  if (!source.trimEnd().endsWith(");")) {
    throw new Error("The downloaded content pack contains a truncated p5.js runtime.");
  }
}

export function parseContentPack(raw: string): ContentPack {
  const pack = JSON.parse(raw) as ContentPack;

  if (!pack || pack.schemaVersion !== CONTENT_SCHEMA_VERSION) {
    throw new Error("This content pack needs a newer app version.");
  }
  if (
    typeof pack.contentVersion !== "string" ||
    !Array.isArray(pack.courses) ||
    !pack.reference?.byName ||
    !Array.isArray(pack.reference.functionNames) ||
    typeof pack.p5?.source !== "string"
  ) {
    throw new Error("The downloaded content pack is incomplete.");
  }

  validateP5Source(pack);
  return pack;
}
