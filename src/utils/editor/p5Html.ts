// Shared helpers for the HTML documents rendered inside WebViews. Keeping the
// escaping and script/runtime injection in one place prevents preview
// surfaces from silently diverging.
import { CORE_JS_BUNDLE } from "./polyfill.generated";

/**
 * File URLs for the runtime assets written by `runtimeAssets.ts`. On web (and
 * in tests) these are null and the generators fall back to inlining the same
 * bundled sources.
 */
export interface RuntimeAssetUrls {
  baseUrl?: string | null;
  p5Url?: string | null;
  polyfillUrl?: string | null;
  codemirrorUrl?: string | null;
  fontRegularUrl?: string | null;
  fontBoldUrl?: string | null;
}

/**
 * Escape the closing sequence that the HTML parser treats as the end of an
 * inline script. The full sequence matters: browsers also accept `</script`
 * followed by whitespace or `/`, not only `</script>`.
 */
export function escapeScriptContent(source: string): string {
  return source.replace(/<\/script/gi, "<\\/script");
}

export function safeJson(value: unknown): string {
  return escapeScriptContent(JSON.stringify(value));
}

export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Emit a classic script tag for a real asset file, or inline the bundled
 * source when no URL is available (web/tests). Classic scripts execute in
 * document order, so external files preserve the same ordering guarantees as
 * inline ones.
 */
export function scriptTag({
  source,
  url,
}: {
  source?: string | null;
  url?: string | null;
}): string {
  if (typeof url === "string" && url.length > 0) {
    return `<script src="${escapeHtmlAttribute(url)}"></script>`;
  }
  if (typeof source === "string" && source.length > 0) {
    return `<script>${escapeScriptContent(source)}</script>`;
  }
  return "";
}

/**
 * Load the bundled p5 runtime. When `runtimeUrl` is supplied the runtime is a
 * real app-private file loaded with `<script src>`; otherwise the verbatim
 * bundled source is inlined (web/tests).
 */
export function p5RuntimeScript({
  inlineSource,
  runtimeUrl,
}: {
  inlineSource?: string | null;
  runtimeUrl?: string | null;
}): string {
  return scriptTag({
    source: inlineSource,
    url: runtimeUrl,
  });
}

/**
 * JS built-in polyfills (core-js) for the preview WebView. Runs before the
 * p5 runtime so required built-ins are available.
 */
export function polyfillScript({
  scriptUrl,
  inlineSource = CORE_JS_BUNDLE,
}: {
  scriptUrl?: string | null;
  inlineSource?: string | null;
} = {}): string {
  return scriptTag({
    source: inlineSource,
    url: scriptUrl,
  });
}
