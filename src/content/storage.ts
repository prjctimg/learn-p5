import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { parseContentPack } from "./parse";
import type { ContentCacheMeta, ContentPack } from "./types";

const WEB_PACK_KEY = "content_pack_data_v1";
const WEB_META_KEY = "content_pack_meta_v1";
const CONTENT_DIR = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}content/`
  : null;
const PACK_FILE = CONTENT_DIR ? `${CONTENT_DIR}pack.json` : null;
const TEMP_FILE = CONTENT_DIR ? `${CONTENT_DIR}pack.tmp.json` : null;
const META_FILE = CONTENT_DIR ? `${CONTENT_DIR}pack.meta.json` : null;

function useWebStorage(): boolean {
  return Platform.OS === "web" || !CONTENT_DIR || !PACK_FILE || !TEMP_FILE || !META_FILE;
}

async function readCachedMeta(): Promise<ContentCacheMeta | null> {
  try {
    let raw: string | null = null;
    if (useWebStorage()) {
      raw = await AsyncStorage.getItem(WEB_META_KEY);
    } else {
      const info = await FileSystem.getInfoAsync(META_FILE!);
      if (info.exists && !info.isDirectory) {
        raw = await FileSystem.readAsStringAsync(META_FILE!);
      }
    }
    if (!raw) return null;
    const meta = JSON.parse(raw) as ContentCacheMeta;
    if (
      typeof meta?.contentVersion !== "string" ||
      typeof meta?.p5Version !== "string" ||
      typeof meta?.packSha256 !== "string"
    ) {
      return null;
    }
    return meta;
  } catch {
    return null;
  }
}

async function writeCachedMeta(meta: ContentCacheMeta): Promise<void> {
  const raw = JSON.stringify(meta);
  if (useWebStorage()) {
    await AsyncStorage.setItem(WEB_META_KEY, raw);
    return;
  }
  await FileSystem.writeAsStringAsync(META_FILE!, raw);
}

async function clearCachedMeta(): Promise<void> {
  if (useWebStorage()) {
    await AsyncStorage.removeItem(WEB_META_KEY);
    return;
  }
  await FileSystem.deleteAsync(META_FILE!, { idempotent: true });
}

export async function readCachedContent(): Promise<ContentPack | null> {
  try {
    let raw: string | null = null;

    if (useWebStorage()) {
      raw = await AsyncStorage.getItem(WEB_PACK_KEY);
    } else {
      const info = await FileSystem.getInfoAsync(PACK_FILE!);
      if (info.exists && !info.isDirectory) {
        raw = await FileSystem.readAsStringAsync(PACK_FILE!);
      }
    }

    if (!raw) return null;
    const pack = parseContentPack(raw);
    const meta = await readCachedMeta();
    if (
      meta &&
      meta.contentVersion === pack.contentVersion &&
      meta.p5Version === pack.p5.version
    ) {
      pack.packSha256 = meta.packSha256;
    }
    return pack;
  } catch {
    try {
      await clearCachedContent();
    } catch {
      // A corrupt cache should never prevent a fresh download attempt.
    }
    return null;
  }
}

export async function writeCachedContent(
  raw: string,
  meta: ContentCacheMeta
): Promise<ContentPack> {
  const pack = parseContentPack(raw);
  pack.packSha256 = meta.packSha256;

  if (useWebStorage()) {
    await AsyncStorage.setItem(WEB_PACK_KEY, raw);
    await writeCachedMeta(meta);
    return pack;
  }

  await FileSystem.makeDirectoryAsync(CONTENT_DIR!, { intermediates: true });
  await FileSystem.writeAsStringAsync(TEMP_FILE!, raw);
  await FileSystem.deleteAsync(PACK_FILE!, { idempotent: true });
  await FileSystem.moveAsync({ from: TEMP_FILE!, to: PACK_FILE! });
  await writeCachedMeta(meta);
  return pack;
}

export async function clearCachedContent(): Promise<void> {
  if (useWebStorage()) {
    await AsyncStorage.removeItem(WEB_PACK_KEY);
    await clearCachedMeta();
    return;
  }

  await FileSystem.deleteAsync(PACK_FILE!, { idempotent: true });
  await FileSystem.deleteAsync(TEMP_FILE!, { idempotent: true });
  await clearCachedMeta();
}
