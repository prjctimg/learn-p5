import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const ROOT_DIR = "playground";
const WEB_DB = "learn-p5-playground";
const WEB_STORE = "files";

function isWeb() {
  return Platform.OS === "web";
}

function getRoot(): string {
  const base = FileSystem.documentDirectory;
  if (!base) throw new Error("FileSystem.documentDirectory unavailable");
  return `${base}${ROOT_DIR}/`;
}

async function ensureDir(dir: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
}

function webKey(sketchId: string, relativePath: string) {
  return `${sketchId}/${relativePath.replace(/^\/+/, "")}`;
}

function openWebDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(WEB_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(WEB_STORE)) db.createObjectStore(WEB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function webPut(key: string, value: string): Promise<void> {
  if (typeof indexedDB === "undefined") {
    // Jest/node fallback
    const g = globalThis as any;
    g.__playgroundWebStore = g.__playgroundWebStore || new Map<string, string>();
    g.__playgroundWebStore.set(key, value);
    return;
  }
  const db = await openWebDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(WEB_STORE, "readwrite");
    tx.objectStore(WEB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function webGet(key: string): Promise<string | null> {
  if (typeof indexedDB === "undefined") {
    const g = globalThis as any;
    const map: Map<string, string> | undefined = g.__playgroundWebStore;
    return map?.get(key) ?? null;
  }
  const db = await openWebDb();
  const result = await new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(WEB_STORE, "readonly");
    const req = tx.objectStore(WEB_STORE).get(key);
    req.onsuccess = () => resolve((req.result as string) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

async function webDelete(key: string): Promise<void> {
  if (typeof indexedDB === "undefined") {
    const g = globalThis as any;
    g.__playgroundWebStore?.delete(key);
    return;
  }
  const db = await openWebDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(WEB_STORE, "readwrite");
    tx.objectStore(WEB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function webDeletePrefix(prefix: string): Promise<void> {
  if (typeof indexedDB === "undefined") {
    const g = globalThis as any;
    const map: Map<string, string> | undefined = g.__playgroundWebStore;
    if (map) for (const k of [...map.keys()]) if (k.startsWith(prefix)) map.delete(k);
    return;
  }
  const db = await openWebDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(WEB_STORE, "readwrite");
    const store = tx.objectStore(WEB_STORE);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return;
      if (String(cursor.key).startsWith(prefix)) cursor.delete();
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function ensurePlaygroundRoot(): Promise<string> {
  if (isWeb()) return "web://playground/";
  const root = getRoot();
  await ensureDir(root);
  return root;
}

export async function ensureSketchDir(sketchId: string): Promise<string> {
  if (isWeb()) return `web://playground/${sketchId}/`;
  const root = await ensurePlaygroundRoot();
  const dir = `${root}${sketchId}/`;
  await ensureDir(dir);
  return dir;
}

export function isWebFileUri(uri: string): boolean {
  return uri.startsWith("webfile://");
}

export async function writeTextFile(
  sketchId: string,
  relativePath: string,
  content: string
): Promise<string> {
  const clean = relativePath.replace(/^\/+/, "");
  if (isWeb()) {
    const key = webKey(sketchId, clean);
    await webPut(key, `text:${content}`);
    return `webfile://${key}`;
  }
  const dir = await ensureSketchDir(sketchId);
  const parts = clean.split("/");
  if (parts.length > 1) await ensureDir(`${dir}${parts.slice(0, -1).join("/")}/`);
  const uri = `${dir}${clean}`;
  await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
  return uri;
}

export async function writeBase64File(
  sketchId: string,
  relativePath: string,
  base64: string,
  mimeType = "application/octet-stream"
): Promise<string> {
  const clean = relativePath.replace(/^\/+/, "");
  if (isWeb()) {
    const key = webKey(sketchId, clean);
    await webPut(key, `data:${mimeType};base64,${base64}`);
    return `webfile://${key}`;
  }
  const dir = await ensureSketchDir(sketchId);
  const parts = clean.split("/");
  if (parts.length > 1) await ensureDir(`${dir}${parts.slice(0, -1).join("/")}/`);
  const uri = `${dir}${clean}`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

export async function readTextFile(uri: string): Promise<string> {
  if (isWebFileUri(uri)) {
    const key = uri.slice("webfile://".length);
    const val = await webGet(key);
    if (val == null) throw new Error(`File not found: ${uri}`);
    if (val.startsWith("text:")) return val.slice(5);
    if (val.startsWith("data:")) return val; // caller should know
    return val;
  }
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
}

export async function readAsDataUrl(uri: string, mimeType = "application/octet-stream"): Promise<string> {
  if (isWebFileUri(uri)) {
    const key = uri.slice("webfile://".length);
    const val = await webGet(key);
    if (val == null) throw new Error(`File not found: ${uri}`);
    if (val.startsWith("data:")) return val;
    if (val.startsWith("text:")) return `data:text/plain;base64,${btoa(unescape(encodeURIComponent(val.slice(5))))}`;
    return val;
  }
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return `data:${mimeType};base64,${base64}`;
}

export async function deleteFile(uri: string): Promise<void> {
  if (isWebFileUri(uri)) {
    await webDelete(uri.slice("webfile://".length));
    return;
  }
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // ignore
  }
}

export async function deleteSketchDir(sketchId: string): Promise<void> {
  if (isWeb()) {
    await webDeletePrefix(`${sketchId}/`);
    return;
  }
  const dir = `${getRoot()}${sketchId}/`;
  try {
    const info = await FileSystem.getInfoAsync(dir);
    if (info.exists) await FileSystem.deleteAsync(dir, { idempotent: true });
  } catch {
    // ignore
  }
}

export function dataUrlToBase64(dataUrl: string): string {
  const idx = dataUrl.indexOf(",");
  return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}
