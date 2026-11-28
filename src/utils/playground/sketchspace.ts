import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../constants/StorageKeys";
import { DEFAULTS } from "../../constants/Defaults";
import type { Sketch, SketchFile, SketchAddon, SketchspaceIndex } from "../../types";
import { createId } from "./id";
import {
  writeTextFile,
  writeBase64File,
  readTextFile,
  readAsDataUrl,
  deleteFile,
  deleteSketchDir,
} from "./fileStore";
import { detectP5AssetType } from "./p5Assets";

const INDEX_VERSION = 1 as const;

export const DEFAULT_SKETCH_CODE = `function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(width / 2, height / 2, 100);
}
`;

function nowIso() {
  return new Date().toISOString();
}

export function createEmptyIndex(): SketchspaceIndex {
  return { version: INDEX_VERSION, sketches: [] };
}

export async function loadSketchspaceIndex(): Promise<SketchspaceIndex> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.playgroundIndex);
  if (!raw) return createEmptyIndex();
  try {
    const parsed = JSON.parse(raw) as SketchspaceIndex;
    if (!parsed || parsed.version !== INDEX_VERSION || !Array.isArray(parsed.sketches)) {
      return createEmptyIndex();
    }
    return parsed;
  } catch {
    return createEmptyIndex();
  }
}

export async function saveSketchspaceIndex(index: SketchspaceIndex): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.playgroundIndex, JSON.stringify(index));
}

export async function getSketch(sketchId: string): Promise<Sketch | null> {
  const index = await loadSketchspaceIndex();
  return index.sketches.find((s) => s.id === sketchId) ?? null;
}

export async function createSketch(name?: string): Promise<Sketch> {
  const index = await loadSketchspaceIndex();
  const id = createId("sketch");
  const ts = nowIso();
  const entryFile = "sketch.js";
  const uri = await writeTextFile(id, entryFile, DEFAULT_SKETCH_CODE);
  const file: SketchFile = {
    id: createId("file"),
    name: entryFile,
    path: entryFile,
    kind: "code",
    mimeType: "text/javascript",
    size: DEFAULT_SKETCH_CODE.length,
    uri,
    content: DEFAULT_SKETCH_CODE,
    source: "local",
    updatedAt: ts,
  };
  const sketch: Sketch = {
    id,
    name: name?.trim() || DEFAULTS.playgroundDefaultSketchName,
    createdAt: ts,
    updatedAt: ts,
    entryFile,
    files: [file],
    addons: [],
  };
  index.sketches.unshift(sketch);
  index.activeSketchId = id;
  await saveSketchspaceIndex(index);
  return sketch;
}

export async function updateSketch(sketchId: string, updater: (s: Sketch) => Sketch): Promise<Sketch | null> {
  const index = await loadSketchspaceIndex();
  const i = index.sketches.findIndex((s) => s.id === sketchId);
  if (i < 0) return null;
  const updated = updater({ ...index.sketches[i], files: [...index.sketches[i].files], addons: [...index.sketches[i].addons] });
  updated.updatedAt = nowIso();
  index.sketches[i] = updated;
  await saveSketchspaceIndex(index);
  return updated;
}

export async function deleteSketch(sketchId: string): Promise<void> {
  const index = await loadSketchspaceIndex();
  index.sketches = index.sketches.filter((s) => s.id !== sketchId);
  if (index.activeSketchId === sketchId) index.activeSketchId = index.sketches[0]?.id;
  await saveSketchspaceIndex(index);
  await deleteSketchDir(sketchId);
}

export async function renameSketch(sketchId: string, name: string): Promise<Sketch | null> {
  return updateSketch(sketchId, (s) => ({ ...s, name: name.trim() || s.name }));
}

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\\/g, "/");
}

export async function saveTextSketchFile(
  sketchId: string,
  path: string,
  content: string,
  mimeType = "text/plain",
  kind: SketchFile["kind"] = "code"
): Promise<Sketch | null> {
  const clean = normalizePath(path);
  const uri = await writeTextFile(sketchId, clean, content);
  return updateSketch(sketchId, (s) => {
    const existingIdx = s.files.findIndex((f) => f.path === clean);
    const file: SketchFile = {
      id: existingIdx >= 0 ? s.files[existingIdx].id : createId("file"),
      name: clean.split("/").pop() || clean,
      path: clean,
      kind,
      mimeType,
      size: content.length,
      uri,
      content,
      source: "local",
      updatedAt: nowIso(),
    };
    const files = [...s.files];
    if (existingIdx >= 0) files[existingIdx] = file;
    else files.push(file);
    return { ...s, files };
  });
}

export async function importBinaryAsset(
  sketchId: string,
  name: string,
  base64: string,
  mimeType: string
): Promise<Sketch | null> {
  const cleanName = name.replace(/[^\w.\- ]+/g, "_");
  const detected = detectP5AssetType(cleanName, mimeType);
  const kind: SketchFile["kind"] = detected?.kind === "data" ? "data" : detected?.kind === "code" ? "code" : "asset";
  const path = normalizePath(`assets/${cleanName}`);
  const uri = await writeBase64File(sketchId, path, base64, mimeType);
  const approxSize = Math.floor((base64.length * 3) / 4);
  return updateSketch(sketchId, (s) => {
    const existingIdx = s.files.findIndex((f) => f.path === path);
    const file: SketchFile = {
      id: existingIdx >= 0 ? s.files[existingIdx].id : createId("file"),
      name: cleanName,
      path,
      kind,
      mimeType,
      size: approxSize,
      uri,
      source: "local",
      updatedAt: nowIso(),
    };
    const files = [...s.files];
    if (existingIdx >= 0) files[existingIdx] = file;
    else files.push(file);
    return { ...s, files };
  });
}

export async function removeSketchFile(sketchId: string, path: string): Promise<Sketch | null> {
  const clean = normalizePath(path);
  const sketch = await getSketch(sketchId);
  if (!sketch) return null;
  const file = sketch.files.find((f) => f.path === clean);
  if (file) await deleteFile(file.uri);
  return updateSketch(sketchId, (s) => ({ ...s, files: s.files.filter((f) => f.path !== clean) }));
}

export async function setSketchAddons(sketchId: string, addons: SketchAddon[]): Promise<Sketch | null> {
  return updateSketch(sketchId, (s) => ({ ...s, addons }));
}

export async function readSketchFileText(file: SketchFile): Promise<string> {
  if (typeof file.content === "string" && file.kind !== "asset") return file.content;
  return readTextFile(file.uri);
}

export async function readSketchFileDataUrl(file: SketchFile): Promise<string> {
  return readAsDataUrl(file.uri, file.mimeType);
}

export async function getSketchCode(sketch: Sketch): Promise<string> {
  const entry = sketch.files.find((f) => f.path === sketch.entryFile) ?? sketch.files.find((f) => f.path.endsWith(".js"));
  if (!entry) return DEFAULT_SKETCH_CODE;
  return readSketchFileText(entry);
}
