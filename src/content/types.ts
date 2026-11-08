import type { Course } from "../data/types";

export interface ContentSymbol {
  name: string;
  module: string;
  submodule: string | null;
  class: string;
  itemtype: "method" | "property" | "type";
  description: string;
  syntax: string;
  params: { name: string; type: string; optional: boolean; description: string }[];
  overloads?: {
    params: { name: string; type: string; optional: boolean; description: string }[];
    chainable: boolean;
  }[];
  chainable: boolean;
  isConstructor: boolean;
  examples?: string[];
}

export interface ContentReference {
  byName: Record<string, ContentSymbol>;
  functionNames: string[];
  metadata: { generatedAt: string; p5Version: string; symbolCount: number };
}

export interface ContentPack {
  schemaVersion: number;
  contentVersion: string;
  generatedAt: string;
  /**
   * Inline runtime source in packs with schema 1. Newer packs ship the
   * runtime as the separate `p5.min.js` artifact instead and only carry
   * this object as optional metadata (if at all).
   */
  p5?: { version: string; source: string };
  p5Assets: Record<string, string>;
  courses: Course[];
  reference: ContentReference;
  /**
   * Manifest hash that produced this pack. It is attached at runtime and is
   * not part of the downloaded JSON. Keeping it lets the app notice when a
   * re-uploaded pack reuses the same contentVersion.
   */
  packSha256?: string;
  /**
   * Runtime-only fields describing the separately downloaded p5 file.
   * `p5FileUri` is never persisted in the pack JSON.
   */
  p5FileUri?: string;
  p5Sha256?: string;
  p5Version?: string;
}

export interface ContentCacheMeta {
  contentVersion: string;
  p5Version: string;
  packSha256: string;
  p5Sha256?: string;
  p5FileUri?: string;
}

export interface ContentManifest {
  schemaVersion: number;
  contentVersion: string;
  generatedAt: string;
  p5Version: string;
  p5Url?: string;
  p5Size?: number;
  p5Sha256?: string;
  packUrl: string;
  packSize: number;
  packSha256: string;
  courseCount: number;
  symbolCount: number;
}
