export type Rgb = [number, number, number];

export interface PixelSample {
  x: number;
  y: number;
  expected: Rgb;
  tolerance?: number;
}

export type ValidationRule =
  | { type: "functionCall"; name: string; exactArgs?: number; minArgs?: number }
  | { type: "functionExists"; name: string }
  | { type: "canvasSize"; width: number; height: number }
  | { type: "pixelMatch"; x: number; y: number; expected: Rgb; tolerance?: number }
  | { type: "expectedPixels"; points: PixelSample[]; minPassFraction?: number };

export interface ExerciseTask {
  id: string;
  title: string;
  instruction: string;
  validation: ValidationRule[];
  startingCode?: string;
  solution?: string;
}

export interface Exercise {
  id: string;
  title: string;
  module: string;
  description: string;
  instruction: string;
  startingCode?: string;
  solution?: string;
  tasks?: ExerciseTask[];
}

export interface Course {
  slug: string;
  title: string;
  moduleName: string;
  description: string;
  exercises: Exercise[];
}

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
  p5Assets: Record<string, string>;
  courses: Course[];
  reference: ContentReference;
  packSha256?: string;
}

export interface ContentManifest {
  schemaVersion: number;
  contentVersion: string;
  generatedAt: string;
  packUrl: string;
  packSize: number;
  packSha256: string;
  courseCount: number;
  symbolCount: number;
}

export type ContentCacheMeta = Pick<ContentManifest, "contentVersion" | "packSha256">;

// Playground / Sketchspace

export type SketchFileKind = "code" | "asset" | "data";

export interface SketchFile {
  id: string;
  name: string;
  path: string; // sketch-relative path, e.g. assets/cat.png or sketch.js
  kind: SketchFileKind;
  mimeType: string;
  size: number;
  /** Local file URI on device/web blob URL reference; binary assets stay local. */
  uri: string;
  /** For small text/data files we may keep inline content for web fallback. */
  content?: string;
  source: "local" | "github";
  updatedAt: string;
}

export interface SketchAddon {
  id: string;
  name: string;
  url: string;
  version?: string;
  enabled: boolean;
  /** p5 compatibility status evaluated against bundled runtime. */
  compatibility: "compatible" | "untested" | "incompatible" | "unknown";
  compatibilityMessage?: string;
  addedAt: string;
}

export interface Sketch {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  entryFile: string; // sketch-relative path, default sketch.js
  files: SketchFile[];
  addons: SketchAddon[];
  gistId?: string;
  gistUrl?: string;
  lastSyncedAt?: string;
  lastSyncedGistUpdatedAt?: string;
}

export interface SketchspaceIndex {
  version: 1;
  sketches: Sketch[];
  activeSketchId?: string;
}

export interface GitHubUser {
  login: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface GitHubAuthState {
  accessToken: string;
  scope?: string;
  tokenType?: string;
  user: GitHubUser;
}

export interface P5AddonCatalogEntry {
  id: string;
  name: string;
  description: string;
  url: string;
  homepage?: string;
  version?: string;
  /** p5 major versions this addon declares support for, e.g. [1] or [1,2]. */
  p5Major?: number[];
  /** Specific p5 versions known tested. */
  testedP5Versions?: string[];
  notes?: string;
}

export interface FrameCaptureRequest {
  frames: number[];
  width?: number;
  height?: number;
}

export interface CapturedFrame {
  frame: number;
  dataUrl: string; // image/png data URL
}
