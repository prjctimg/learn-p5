import { P5_RUNTIME_VERSION } from "../editor/p5-runtime.generated";
import type { P5AddonCatalogEntry } from "../../types";

export type P5AssetLoader =
  | "loadImage"
  | "loadJSON"
  | "loadStrings"
  | "loadTable"
  | "loadXML"
  | "loadBytes"
  | "loadFont"
  | "loadModel"
  | "loadShader"
  | "loadSound";

export interface P5AssetTypeInfo {
  extensions: string[];
  mimeTypes: string[];
  loader: P5AssetLoader;
  kind: "asset" | "data" | "code";
  label: string;
  requiresAddon?: string; // addon id/name
  note?: string;
}

export const P5_ASSET_TYPES: P5AssetTypeInfo[] = [
  {
    extensions: ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp"],
    mimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif", "image/bmp"],
    loader: "loadImage",
    kind: "asset",
    label: "Image",
  },
  {
    extensions: ["json"],
    mimeTypes: ["application/json", "text/json"],
    loader: "loadJSON",
    kind: "data",
    label: "JSON",
  },
  {
    extensions: ["txt", "csv", "tsv"],
    mimeTypes: ["text/plain", "text/csv", "text/tab-separated-values"],
    loader: "loadStrings",
    kind: "data",
    label: "Text/Table",
    note: "Use loadStrings/loadTable depending on format.",
  },
  {
    extensions: ["xml"],
    mimeTypes: ["application/xml", "text/xml"],
    loader: "loadXML",
    kind: "data",
    label: "XML",
  },
  {
    extensions: ["bin", "dat", "bytes"],
    mimeTypes: ["application/octet-stream"],
    loader: "loadBytes",
    kind: "data",
    label: "Bytes",
  },
  {
    extensions: ["ttf", "otf", "woff", "woff2"],
    mimeTypes: ["font/ttf", "font/otf", "font/woff", "font/woff2", "application/font-sfnt"],
    loader: "loadFont",
    kind: "asset",
    label: "Font",
  },
  {
    extensions: ["obj", "stl"],
    mimeTypes: ["model/obj", "model/stl", "application/sla", "text/plain"],
    loader: "loadModel",
    kind: "asset",
    label: "3D Model",
  },
  {
    extensions: ["vert", "frag", "glsl"],
    mimeTypes: ["text/plain", "application/x-glsl"],
    loader: "loadShader",
    kind: "code",
    label: "Shader",
    note: "Import vertex/fragment shaders and load with loadShader().",
  },
  {
    extensions: ["mp3", "wav", "ogg", "m4a", "aac", "flac"],
    mimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac", "audio/flac"],
    loader: "loadSound",
    kind: "asset",
    label: "Audio",
    requiresAddon: "p5.sound",
    note: "loadSound requires the p5.sound addon.",
  },
];

export function getExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "";
}

export function detectP5AssetType(name: string, mimeType?: string) {
  const ext = getExtension(name);
  const mime = (mimeType || "").toLowerCase();
  return (
    P5_ASSET_TYPES.find(
      (t) => (ext && t.extensions.includes(ext)) || (mime && t.mimeTypes.includes(mime))
    ) ?? null
  );
}

export function isP5SupportedAsset(name: string, mimeType?: string): boolean {
  return detectP5AssetType(name, mimeType) !== null;
}

export function getBundledP5Major(): number {
  const m = P5_RUNTIME_VERSION.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 2;
}

export function evaluateAddonCompatibility(addon: P5AddonCatalogEntry): {
  compatibility: "compatible" | "untested" | "incompatible" | "unknown";
  message: string;
} {
  const major = getBundledP5Major();
  const version = P5_RUNTIME_VERSION;

  if (addon.testedP5Versions?.includes(version)) {
    return { compatibility: "compatible", message: `Tested with p5.js ${version}.` };
  }
  if (addon.p5Major && addon.p5Major.length > 0) {
    if (addon.p5Major.includes(major)) {
      return {
        compatibility: "untested",
        message: `This addon declares p5.js ${addon.p5Major.join("/")} support but has not been tested with bundled p5.js ${version}. It may not work.`,
      };
    }
    return {
      compatibility: "incompatible",
      message: `This addon targets p5.js ${addon.p5Major.join("/")} and may be incompatible with bundled p5.js ${version}.`,
    };
  }
  return {
    compatibility: "unknown",
    message: `This addon has not been tested with bundled p5.js ${version}. It may not work.`,
  };
}
