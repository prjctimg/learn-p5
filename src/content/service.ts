import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import {
  CONTENT_MANIFEST_TIMEOUT_MS,
  SUPPORTED_CONTENT_SCHEMA_VERSIONS,
} from "../constants/Content";
import { CONTENT_MANIFEST_URL } from "../constants/Content";
import { parseContentPack, validateP5Source } from "./parse";
import { CONTENT_DIR, P5_SCRIPT_FILE, P5_TEMP_FILE, readCachedContent, writeCachedContent } from "./storage";
import { setContentPack } from "./store";
import type { ContentManifest, ContentPack } from "./types";

export type ContentProgress = (fraction: number) => void;

export interface BootstrapResult {
  pack: ContentPack;
  updated: boolean;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function resolveContentUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  try {
    return new URL(url, CONTENT_MANIFEST_URL).toString();
  } catch {
    return `${CONTENT_MANIFEST_URL.replace(/[^/]*$/, "")}${url}`;
  }
}

function validateManifest(manifest: ContentManifest): void {
  if (!SUPPORTED_CONTENT_SCHEMA_VERSIONS.includes(manifest?.schemaVersion as 1 | 2)) {
    throw new Error("This app version cannot read the latest content.");
  }
  if (
    typeof manifest.contentVersion !== "string" ||
    typeof manifest.p5Version !== "string" ||
    typeof manifest.packUrl !== "string" ||
    typeof manifest.packSize !== "number" ||
    typeof manifest.packSha256 !== "string"
  ) {
    throw new Error("The content manifest is incomplete.");
  }
  if (manifest.schemaVersion === 2) {
    if (
      typeof manifest.p5Url !== "string" ||
      typeof manifest.p5Size !== "number" ||
      typeof manifest.p5Sha256 !== "string"
    ) {
      throw new Error("The content manifest has no p5.js runtime.");
    }
  }
}

export async function fetchContentManifest(): Promise<ContentManifest> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONTENT_MANIFEST_TIMEOUT_MS);
  const separator = CONTENT_MANIFEST_URL.includes("?") ? "&" : "?";
  const url = `${CONTENT_MANIFEST_URL}${separator}_=${Date.now()}`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Content server returned ${response.status}.`);
    }

    const manifest = (await response.json()) as ContentManifest;
    validateManifest(manifest);
    return manifest;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Timed out contacting the content server.");
    }
    throw new Error(errorMessage(error));
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchPackText(
  manifest: ContentManifest,
  onProgress?: ContentProgress
): Promise<string> {
  const packUrl = resolveContentUrl(manifest.packUrl);
  const cacheDirectory = FileSystem.cacheDirectory;
  const useFileSystem = Platform.OS !== "web" && !!cacheDirectory;

  if (!useFileSystem) {
    const response = await fetch(packUrl);
    if (!response.ok) {
      throw new Error(`Content download failed (${response.status}).`);
    }
    onProgress?.(1);
    return response.text();
  }

  const dir = `${cacheDirectory}content/`;
  const tempFile = `${dir}download.json`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  await FileSystem.deleteAsync(tempFile, { idempotent: true });

  try {
    const download = FileSystem.createDownloadResumable(
      packUrl,
      tempFile,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        if (totalBytesExpectedToWrite > 0) {
          onProgress?.(totalBytesWritten / totalBytesExpectedToWrite);
        }
      }
    );
    const result = await download.downloadAsync();
    if (!result) throw new Error("Content download was interrupted.");

    const info = await FileSystem.getInfoAsync(result.uri);
    if (!info.exists || info.isDirectory) {
      throw new Error("Content download did not produce a file.");
    }
    if (manifest.packSize > 0 && info.size !== manifest.packSize) {
      throw new Error("Content download was incomplete.");
    }

    return await FileSystem.readAsStringAsync(result.uri);
  } finally {
    await FileSystem.deleteAsync(tempFile, { idempotent: true });
  }
}

async function downloadP5Runtime(
  manifest: ContentManifest,
  onProgress?: ContentProgress
): Promise<string> {
  if (
    typeof manifest.p5Url !== "string" ||
    typeof manifest.p5Size !== "number" ||
    typeof manifest.p5Sha256 !== "string"
  ) {
    throw new Error("The content manifest has no p5.js runtime.");
  }

  const p5Url = resolveContentUrl(manifest.p5Url);

  if (Platform.OS === "web") {
    const response = await fetch(p5Url);
    if (!response.ok) {
      throw new Error(`p5.js runtime download failed (${response.status}).`);
    }
    const source = await response.text();
    validateP5Source(source, manifest.p5Version);
    onProgress?.(1);
    return p5Url;
  }

  if (!FileSystem.documentDirectory || !P5_SCRIPT_FILE || !P5_TEMP_FILE) {
    throw new Error("p5.js runtime storage is unavailable.");
  }

  await FileSystem.makeDirectoryAsync(CONTENT_DIR!, { intermediates: true });
  await FileSystem.deleteAsync(P5_TEMP_FILE, { idempotent: true });

  try {
    const download = FileSystem.createDownloadResumable(
      p5Url,
      P5_TEMP_FILE,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        if (totalBytesExpectedToWrite > 0) {
          onProgress?.(totalBytesWritten / totalBytesExpectedToWrite);
        }
      }
    );
    const result = await download.downloadAsync();
    if (!result) throw new Error("p5.js runtime download was interrupted.");

    const info = await FileSystem.getInfoAsync(result.uri);
    if (!info.exists || info.isDirectory) {
      throw new Error("p5.js runtime download did not produce a file.");
    }
    if (manifest.p5Size > 0 && info.size !== manifest.p5Size) {
      throw new Error("p5.js runtime download was incomplete.");
    }

    const source = await FileSystem.readAsStringAsync(result.uri);
    validateP5Source(source, manifest.p5Version);

    await FileSystem.deleteAsync(P5_SCRIPT_FILE, { idempotent: true });
    await FileSystem.moveAsync({ from: P5_TEMP_FILE, to: P5_SCRIPT_FILE });
    return P5_SCRIPT_FILE;
  } finally {
    await FileSystem.deleteAsync(P5_TEMP_FILE, { idempotent: true });
  }
}

function isCachedContentCurrent(
  cached: ContentPack | null,
  manifest: ContentManifest
): cached is ContentPack {
  return Boolean(
    cached &&
      cached.contentVersion === manifest.contentVersion &&
      cached.p5FileUri &&
      (!manifest.packSha256 || cached.packSha256 === manifest.packSha256) &&
      (!manifest.p5Sha256 || cached.p5Sha256 === manifest.p5Sha256)
  );
}

function hasUsableCachedContent(cached: ContentPack | null): cached is ContentPack {
  return Boolean(
    cached &&
      (cached.p5FileUri ||
        // Legacy schema 1 caches keep the runtime inline and remain usable
        // offline while the separate download is prepared.
        (cached.schemaVersion === 1 && typeof cached.p5?.source === "string"))
  );
}

async function downloadAndCommitContent(
  manifest: ContentManifest,
  onProgress?: ContentProgress
): Promise<ContentPack> {
  // Fetch and validate both downloads before writing either, so a failure
  // leaves the previously working cache untouched.
  const rawPack = await fetchPackText(manifest, (fraction) =>
    onProgress?.(fraction * 0.5)
  );
  parseContentPack(rawPack);
  const p5FileUri = await downloadP5Runtime(manifest, (fraction) =>
    onProgress?.(0.5 + fraction * 0.5)
  );
  const pack = await writeCachedContent(rawPack, {
    contentVersion: manifest.contentVersion,
    p5Version: manifest.p5Version,
    packSha256: manifest.packSha256 ?? "",
    p5Sha256: manifest.p5Sha256 ?? "",
    p5FileUri,
  });
  pack.p5FileUri = p5FileUri;
  pack.p5Sha256 = manifest.p5Sha256;
  pack.p5Version = manifest.p5Version;
  return pack;
}

export async function bootstrapContent(
  onProgress?: ContentProgress
): Promise<BootstrapResult> {
  const cached = await readCachedContent();
  let manifest: ContentManifest;

  try {
    manifest = await fetchContentManifest();
  } catch (error) {
    if (hasUsableCachedContent(cached)) {
      setContentPack(cached);
      return { pack: cached, updated: false };
    }
    throw error;
  }

  if (isCachedContentCurrent(cached, manifest)) {
    setContentPack(cached);
    return { pack: cached, updated: false };
  }

  try {
    const pack = await downloadAndCommitContent(manifest, onProgress);
    setContentPack(pack);
    return { pack, updated: !!cached };
  } catch (error) {
    if (hasUsableCachedContent(cached)) {
      setContentPack(cached);
      return { pack: cached, updated: false };
    }
    throw error;
  }
}

export async function checkForContentUpdate(
  current: ContentPack,
  onProgress?: ContentProgress
): Promise<ContentPack | null> {
  const manifest = await fetchContentManifest();
  if (isCachedContentCurrent(current, manifest)) {
    return null;
  }

  const pack = await downloadAndCommitContent(manifest, onProgress);
  setContentPack(pack);
  return pack;
}
