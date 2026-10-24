import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import {
  CONTENT_MANIFEST_TIMEOUT_MS,
  CONTENT_SCHEMA_VERSION,
} from "../constants/Content";
import { CONTENT_MANIFEST_URL } from "../constants/Content";
import { parseContentPack } from "./parse";
import { readCachedContent, writeCachedContent } from "./storage";
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

function resolvePackUrl(packUrl: string): string {
  if (/^https?:\/\//i.test(packUrl)) return packUrl;
  try {
    return new URL(packUrl, CONTENT_MANIFEST_URL).toString();
  } catch {
    return `${CONTENT_MANIFEST_URL.replace(/[^/]*$/, "")}${packUrl}`;
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
    if (manifest?.schemaVersion !== CONTENT_SCHEMA_VERSION) {
      throw new Error("This app version cannot read the latest content.");
    }
    if (
      typeof manifest.contentVersion !== "string" ||
      typeof manifest.packUrl !== "string" ||
      typeof manifest.packSize !== "number"
    ) {
      throw new Error("The content manifest is incomplete.");
    }
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
  const packUrl = resolvePackUrl(manifest.packUrl);
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

async function downloadPack(
  manifest: ContentManifest,
  onProgress?: ContentProgress
): Promise<ContentPack> {
  const raw = await fetchPackText(manifest, onProgress);
  parseContentPack(raw);
  return writeCachedContent(raw);
}

export async function bootstrapContent(
  onProgress?: ContentProgress
): Promise<BootstrapResult> {
  const cached = await readCachedContent();
  let manifest: ContentManifest;

  try {
    manifest = await fetchContentManifest();
  } catch (error) {
    if (cached) {
      setContentPack(cached);
      return { pack: cached, updated: false };
    }
    throw error;
  }

  if (
    cached &&
    cached.contentVersion === manifest.contentVersion &&
    cached.p5.version === manifest.p5Version
  ) {
    setContentPack(cached);
    return { pack: cached, updated: false };
  }

  try {
    const pack = await downloadPack(manifest, onProgress);
    setContentPack(pack);
    return { pack, updated: !!cached };
  } catch (error) {
    if (cached) {
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
  if (
    manifest.contentVersion === current.contentVersion &&
    manifest.p5Version === current.p5.version
  ) {
    return null;
  }

  const pack = await downloadPack(manifest, onProgress);
  setContentPack(pack);
  return pack;
}
