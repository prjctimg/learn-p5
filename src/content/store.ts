import type { ContentPack } from "./types";

let currentPack: ContentPack | null = null;

export function setContentPack(pack: ContentPack | null): void {
  currentPack = pack;
}

export function getContentPack(): ContentPack | null {
  return currentPack;
}

export function requireContentPack(): ContentPack {
  if (!currentPack) {
    throw new Error("Course content has not been loaded yet.");
  }
  return currentPack;
}

/**
 * Loadable URL for the cached p5.min.js file (a local file URI on native,
 * or a remote URL on web). Prefers the separate artifact; only legacy
 * schema 1 caches without it still ship the runtime inline.
 */
export function getP5ScriptUri(): string | null {
  const pack = requireContentPack();
  if (pack.p5FileUri) return pack.p5FileUri;
  return null;
}

/** Inline runtime source for legacy schema 1 caches; null when a file script URI exists. */
export function getP5InlineSource(): string | null {
  const pack = requireContentPack();
  if (pack.p5FileUri) return null;
  return pack.p5?.source ?? null;
}

export function getP5Assets(): Record<string, string> {
  return requireContentPack().p5Assets;
}
