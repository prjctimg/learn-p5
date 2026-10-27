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
  p5: { version: string; source: string };
  p5Assets: Record<string, string>;
  courses: Course[];
  reference: ContentReference;
  /**
   * Manifest hash that produced this pack. It is attached at runtime and is
   * not part of the downloaded JSON. Keeping it lets the app notice when a
   * re-uploaded pack reuses the same contentVersion.
   */
  packSha256?: string;
}

export interface ContentCacheMeta {
  contentVersion: string;
  p5Version: string;
  packSha256: string;
}

export interface ContentManifest {
  schemaVersion: number;
  contentVersion: string;
  generatedAt: string;
  p5Version: string;
  packUrl: string;
  packSize: number;
  packSha256: string;
  courseCount: number;
  symbolCount: number;
}
