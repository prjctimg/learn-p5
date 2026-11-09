import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import {
  CONTENT_MANIFEST_TIMEOUT_MS,
  SUPPORTED_CONTENT_SCHEMA_VERSIONS,
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
  // The p5.js runtime ships in the app bundle (see scripts/bundle-p5.mjs),
  // so the manifest only needs to describe the course/reference pack.
  // Older manifests that still carry p5Url/p5Size/p5Sha256 are accepted
  // and those fields are ignored.
  if (
    typeof manifest.contentVersion !== "string" ||
    typeof manifest.packUrl !== "string" ||
    typeof manifest.packSize !== "number" ||
    typeof manifest.packSha256 !== "string"
  ) {
    throw new Error("The content manifest is incomplete.");
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

function isCachedContentCurrent(
  cached: ContentPack | null,
  manifest: ContentManifest
): cached is ContentPack {
  return Boolean(
    cached &&
      cached.contentVersion === manifest.contentVersion &&
      (!manifest.packSha256 || cached.packSha256 === manifest.packSha256)
  );
}

function hasUsableCachedContent(cached: ContentPack | null): cached is ContentPack {
  return Boolean(cached);
}

async function downloadAndCommitContent(
  manifest: ContentManifest,
  onProgress?: ContentProgress
): Promise<ContentPack> {
  const rawPack = await fetchPackText(manifest, onProgress);
  parseContentPack(rawPack);
  const pack = await writeCachedContent(rawPack, {
    contentVersion: manifest.contentVersion,
    // p5Version in the cache meta is retained for back-compat with
    // caches written by older app versions; the runtime version itself
    // comes from the bundled runtime (P5_RUNTIME_VERSION).
    p5Version: manifest.p5Version ?? "",
    packSha256: manifest.packSha256 ?? "",
  });
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
