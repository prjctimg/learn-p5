// Shared helpers for the HTML documents rendered inside WebViews. Keeping the
// escaping and compatibility shim in one place prevents one preview surface
// from silently diverging from the others.
import { CORE_JS_BUNDLE } from "./polyfill.generated";

export const P5_GLOBAL_FUNCTIONS = [
  "preload",
  "setup",
  "draw",
  "windowResized",
  "mousePressed",
  "mouseReleased",
  "mouseClicked",
  "mouseMoved",
  "mouseDragged",
  "mouseWheel",
  "keyPressed",
  "keyReleased",
  "keyTyped",
  "touchStarted",
  "touchMoved",
  "touchEnded",
  "doubleClicked",
  "deviceMoved",
  "deviceTurned",
  "deviceShaken",
] as const;

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
 * Inline the bundled p5 runtime into the preview document. The runtime
 * is fetched verbatim at build time (see scripts/bundle-p5.mjs) and
 * ships with the app, so previews never fetch it from the content pack,
 * a CDN, or a `file://` script tag (which WebViews loading an
 * in-memory document refuse to load), and never send ~1 MB of source
 * through the WebView postMessage bridge.
 */
export function p5RuntimeScript({ inlineSource }: { inlineSource?: string | null }): string {
  if (typeof inlineSource === "string" && inlineSource.length > 0) {
    return `<script>${escapeScriptContent(inlineSource)}</script>`;
  }
  return "";
}

/**
 * Polyfills for the preview WebView from core-js (scripts/bundle-polyfill.mjs).
 * JS built-ins (Array, Object, String, Promise, Intl, etc.) are supplied by
 * the maintained core-js library — no hand-written shims. DOM APIs
 * (AbortController, Element.remove/closest, TextEncoder, etc.) are native in
 * the targeted modern WebView (Baseline, Chrome 90+ / iOS 16.4+), which also
 * parses p5 v2's ES2022 syntax (named capture groups, Unicode property
 * escapes) natively. Runs before the p5 runtime in every preview document.
 */
export function polyfillScript(): string {
  if (typeof CORE_JS_BUNDLE === "string" && CORE_JS_BUNDLE.length > 0) {
    return `<script>${escapeScriptContent(CORE_JS_BUNDLE)}</script>`;
  }
  return "";
}
