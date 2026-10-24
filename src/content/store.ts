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

export function getP5Source(): string {
  return requireContentPack().p5.source;
}

export function getP5Assets(): Record<string, string> {
  return requireContentPack().p5Assets;
}
