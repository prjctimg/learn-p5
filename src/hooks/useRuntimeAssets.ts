import { useEffect, useState } from "react";
import {
  ensureRuntimeAssets,
  RuntimeAssetOptions,
} from "../utils/editor/runtimeAssets";
import type { RuntimeAssetUrls } from "../utils/editor/p5Html";

export interface RuntimeAssetsState {
  ready: boolean;
  urls: RuntimeAssetUrls | null;
}

export function useRuntimeAssets(
  options: RuntimeAssetOptions = {}
): RuntimeAssetsState {
  const editor = options.editor === true;
  const [state, setState] = useState<RuntimeAssetsState>({
    ready: false,
    urls: null,
  });

  useEffect(() => {
    let cancelled = false;
    ensureRuntimeAssets({ editor })
      .then((urls) => {
        if (cancelled) return;
        setState({ ready: true, urls });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        console.warn("[useRuntimeAssets] Falling back to inline runtime:", message);
        setState({ ready: true, urls: null });
      });
    return () => {
      cancelled = true;
    };
  }, [editor]);

  return state;
}
