import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { parseContentPack } from "./parse";
import type { ContentPack } from "./types";

const WEB_PACK_KEY = "content_pack_data_v1";
const CONTENT_DIR = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}content/`
  : null;
const PACK_FILE = CONTENT_DIR ? `${CONTENT_DIR}pack.json` : null;
const TEMP_FILE = CONTENT_DIR ? `${CONTENT_DIR}pack.tmp.json` : null;

function useWebStorage(): boolean {
  return Platform.OS === "web" || !CONTENT_DIR || !PACK_FILE || !TEMP_FILE;
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

    return raw ? parseContentPack(raw) : null;
  } catch {
    await clearCachedContent();
    return null;
  }
}

export async function writeCachedContent(raw: string): Promise<ContentPack> {
  const pack = parseContentPack(raw);

  if (useWebStorage()) {
    await AsyncStorage.setItem(WEB_PACK_KEY, raw);
    return pack;
  }

  await FileSystem.makeDirectoryAsync(CONTENT_DIR!, { intermediates: true });
  await FileSystem.writeAsStringAsync(TEMP_FILE!, raw);
  await FileSystem.deleteAsync(PACK_FILE!, { idempotent: true });
  await FileSystem.moveAsync({ from: TEMP_FILE!, to: PACK_FILE! });
  return pack;
}

export async function clearCachedContent(): Promise<void> {
  if (useWebStorage()) {
    await AsyncStorage.removeItem(WEB_PACK_KEY);
    return;
  }

  await FileSystem.deleteAsync(PACK_FILE!, { idempotent: true });
  await FileSystem.deleteAsync(TEMP_FILE!, { idempotent: true });
}
