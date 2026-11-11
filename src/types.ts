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
