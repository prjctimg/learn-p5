import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { P5_RUNTIME_SOURCE, P5_RUNTIME_VERSION } from "./p5-runtime.generated";
import { CORE_JS_BUNDLE, CORE_JS_VERSION } from "./polyfill.generated";
import { CODEMIRROR_BUNDLE } from "./codemirror-bundle.generated";
import {
  JETBRAINS_MONO_REGULAR_BASE64,
  JETBRAINS_MONO_BOLD_BASE64,
} from "../../constants/fontBase64.generated";
import type { RuntimeAssetUrls } from "./p5Html";

export interface RuntimeAssetOptions {
  /** Also write the editor-only assets (CodeMirror + JetBrains Mono). */
  editor?: boolean;
}

const RUNTIME_DIR = "p5-runtime";
const pendingWrites = new Map<string, Promise<string | null>>();

function versionedName(name: string, version: string, contents: string, ext: string): string {
  return `${name}-${version}-${contents.length}.${ext}`;
}

async function ensureFile(
  directory: string,
  name: string,
  contents: string,
  encoding: FileSystem.EncodingType = FileSystem.EncodingType.UTF8
): Promise<string | null> {
  const uri = `${directory}${name}`;
  const cacheKey = uri;

  const pending = pendingWrites.get(cacheKey);
  if (pending) return pending;

  const write = (async () => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists && (info.size ?? 0) > 0) return name;
      await FileSystem.writeAsStringAsync(uri, contents, { encoding });
      return name;
    } catch (err) {
      console.warn(`[runtimeAssets] Could not write ${name}:`, err);
      return null;
    }
  })();

  pendingWrites.set(cacheKey, write);
  return write;
}

/**
 * Write the bundled runtime sources to an app-private cache directory so the
 * WebViews can load them with real `<script src>`/URL references instead of
 * inlining several megabytes into every HTML document.
 *
 * Returns relative file names plus the `baseUrl` that resolves them. On web
 * (or if writing is unavailable) it returns null and callers fall back to
 * inlining the same bundled sources.
 */
export async function ensureRuntimeAssets(
  options: RuntimeAssetOptions = {}
): Promise<RuntimeAssetUrls | null> {
  if (Platform.OS === "web" || !FileSystem.cacheDirectory) return null;

  const directory = `${FileSystem.cacheDirectory}${RUNTIME_DIR}/`;
  try {
    const dirInfo = await FileSystem.getInfoAsync(directory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }
  } catch (err) {
    console.warn("[runtimeAssets] Could not create runtime asset directory:", err);
    return null;
  }

  const p5Name = versionedName("p5", P5_RUNTIME_VERSION, P5_RUNTIME_SOURCE, "min.js");
  const polyfillName = versionedName("core-js", CORE_JS_VERSION, CORE_JS_BUNDLE, "js");

  const [p5Url, polyfillUrl] = await Promise.all([
    ensureFile(directory, p5Name, P5_RUNTIME_SOURCE),
    ensureFile(directory, polyfillName, CORE_JS_BUNDLE),
  ]);

  if (!p5Url || !polyfillUrl) return null;

  const urls: RuntimeAssetUrls = {
    baseUrl: directory,
    p5Url,
    polyfillUrl,
  };

  if (options.editor) {
    const codemirrorName = versionedName("codemirror", "6", CODEMIRROR_BUNDLE, "js");
    const regularName = versionedName(
      "jetbrains-mono-regular",
      "1",
      JETBRAINS_MONO_REGULAR_BASE64,
      "ttf"
    );
    const boldName = versionedName(
      "jetbrains-mono-bold",
      "1",
      JETBRAINS_MONO_BOLD_BASE64,
      "ttf"
    );

    const [codemirrorUrl, fontRegularUrl, fontBoldUrl] = await Promise.all([
      ensureFile(directory, codemirrorName, CODEMIRROR_BUNDLE),
      ensureFile(directory, regularName, JETBRAINS_MONO_REGULAR_BASE64, FileSystem.EncodingType.Base64),
      ensureFile(directory, boldName, JETBRAINS_MONO_BOLD_BASE64, FileSystem.EncodingType.Base64),
    ]);

    urls.codemirrorUrl = codemirrorUrl;
    urls.fontRegularUrl = fontRegularUrl;
    urls.fontBoldUrl = fontBoldUrl;
  }

  return urls;
}
