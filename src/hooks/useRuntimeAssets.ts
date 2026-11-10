import { useEffect, useState } from "react";
import {
  ensureRuntimeAssets,
  RuntimeAssetOptions,
} from "../utils/editor/runtimeAssets";
import type { RuntimeAssetUrls } from "../utils/editor/p5Html";

export interface RuntimeAssetsState {
  /** True once asset preparation has finished (successfully or not). */
  ready: boolean;
  /** Relative file URLs + base URL, or null to inline the bundled sources. */
  urls: RuntimeAssetUrls | null;
  error: string | null;
}

/**
 * Prepare the app-private runtime files used by the preview WebViews. Falls
 * back to inline bundled sources when file assets are unavailable (web, tests,
 * or an unexpected filesystem error).
 */
export function useRuntimeAssets(
  options: RuntimeAssetOptions = {}
): RuntimeAssetsState {
  const editor = options.editor === true;
  const [state, setState] = useState<RuntimeAssetsState>({
    ready: false,
    urls: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    ensureRuntimeAssets({ editor })
      .then((urls) => {
        if (cancelled) return;
        setState({ ready: true, urls, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        console.warn("[useRuntimeAssets] Falling back to inline runtime:", message);
        setState({ ready: true, urls: null, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, [editor]);

  return state;
}
