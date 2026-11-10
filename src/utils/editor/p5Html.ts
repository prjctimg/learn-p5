// Shared helpers for the HTML documents rendered inside WebViews. Keeping the
// escaping and script/runtime injection in one place prevents preview
// surfaces from silently diverging.
import { CORE_JS_BUNDLE } from "./polyfill.generated";

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
 * Install a global error capture before any runtime/user scripts run so load
 * and execution failures can be reported as-is (stack/message) instead of
 * being guessed from missing globals.
 */
export function errorCaptureScript(): string {
  return `<script>
(function(){
  window.__p5Error = null;
  window.__setP5Error = function(err){
    if (window.__p5Error) return;
    try {
      if (err && (err.stack || err.message)) {
        window.__p5Error = err.stack || String(err.message);
      } else if (typeof err === 'string') {
        window.__p5Error = err;
      } else {
        window.__p5Error = String(err);
      }
    } catch (_) {
      try { window.__p5Error = String(err); } catch(_e) { window.__p5Error = 'Unknown error'; }
    }
  };
  window.__getP5Error = function(){
    var e = window.__p5Error;
    if (e) return String(e);
    if (typeof window.p5 !== 'function') return 'p5 is not available (typeof window.p5 === ' + typeof window.p5 + ')';
    return 'Unknown error';
  };
  window.addEventListener('error', function(e){
    var err = e && e.error ? e.error : (e && e.message ? e.message : e);
    window.__setP5Error(err);
  }, true);
  window.addEventListener('unhandledrejection', function(e){
    var r = e ? e.reason : e;
    window.__setP5Error(r);
  });
})();
</script>`;
}

/**
 * Inline the bundled p5 runtime into the preview document. The runtime is
 * fetched verbatim at build time (scripts/bundle-p5.mjs) and ships with the
 * app, so previews work offline without CDN/file:// fetches.
 */
export function p5RuntimeScript({
  inlineSource,
}: {
  inlineSource?: string | null;
}): string {
  if (typeof inlineSource === "string" && inlineSource.length > 0) {
    return `<script>${escapeScriptContent(inlineSource)}</script>`;
  }
  return "";
}

/**
 * JS built-in polyfills (core-js) for the preview WebView. Runs before the
 * p5 runtime so required built-ins are available.
 */
export function polyfillScript(): string {
  if (typeof CORE_JS_BUNDLE === "string" && CORE_JS_BUNDLE.length > 0) {
    return `<script>${escapeScriptContent(CORE_JS_BUNDLE)}</script>`;
  }
  return "";
}
