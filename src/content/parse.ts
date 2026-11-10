import { CONTENT_SCHEMA_VERSION } from "../constants/Content";
import type { ContentPack } from "./types";

export function parseContentPack(raw: string): ContentPack {
  const pack = JSON.parse(raw) as ContentPack;

  if (!pack || pack.schemaVersion !== CONTENT_SCHEMA_VERSION) {
    throw new Error("Unsupported content pack schema.");
  }
  if (
    typeof pack.contentVersion !== "string" ||
    !Array.isArray(pack.courses) ||
    !pack.reference?.byName ||
    !Array.isArray(pack.reference.functionNames)
  ) {
    throw new Error("The downloaded content pack is incomplete.");
  }

  return pack;
}
