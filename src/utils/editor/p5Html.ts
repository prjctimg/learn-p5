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

function escapeInlineString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/</g, "\\u003c")
    .replace(/\r?\n/g, " ");
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
  label,
}: {
  source?: string | null;
  url?: string | null;
  label: string;
}): string {
  if (typeof url === "string" && url.length > 0) {
    const safeUrl = escapeHtmlAttribute(url);
    const safeLabel = escapeInlineString(label);
    return `<script src="${safeUrl}" onerror="window.__noteP5LoadError && window.__noteP5LoadError('${safeLabel}', this.src)"></script>`;
  }
  if (typeof source === "string" && source.length > 0) {
    return `<script>${escapeScriptContent(source)}</script>`;
  }
  return "";
}

/**
 * Install a global error capture before any runtime/user scripts run so load
 * and execution failures can be reported as-is (stack/message) instead of
 * being guessed from missing globals. Resource load failures are recorded
 * separately with the failing URL.
 */
export function errorCaptureScript(): string {
  return `<script>
(function(){
  window.__p5Error = null;
  window.__p5ErrorPhase = null;
  window.__p5LoadErrors = [];
  window.__p5Running = false;
  window.__noteP5LoadError = function(label, src){
    var message = 'Failed to load ' + label + (src ? ' (' + src + ')' : '');
    try { window.__p5LoadErrors.push(message); } catch (_) {}
    window.__p5Error = message;
    window.__p5ErrorPhase = 'load';
  };
  window.__setP5Error = function(err, phase){
    var text;
    try {
      if (err && (err.stack || err.message)) {
        text = err.stack || String(err.message);
      } else if (typeof err === 'string') {
        text = err;
      } else {
        text = String(err);
      }
    } catch (_) {
      try { text = String(err); } catch(_e) { text = 'Unknown error'; }
    }
    window.__p5Error = text;
    window.__p5ErrorPhase = phase || 'runtime';
  };
  window.__clearP5Error = function(){
    window.__p5Error = null;
    window.__p5ErrorPhase = null;
  };
  window.__getP5Error = function(){
    if (window.__p5Error) return String(window.__p5Error);
    if (typeof window.p5 !== 'function') {
      var detail = 'p5 is not available (typeof window.p5 === ' + typeof window.p5 + ')';
      if (window.__p5LoadErrors && window.__p5LoadErrors.length) {
        detail += '\\n' + window.__p5LoadErrors.join('\\n');
      }
      return detail;
    }
    return 'Unknown error';
  };
  window.addEventListener('error', function(e){
    // Only attribute uncaught errors while a sketch is actually running; the
    // editor and tooling share this document.
    if (!window.__p5Running) return;
    var err = e && e.error ? e.error : (e && e.message ? e.message : e);
    window.__setP5Error(err, 'sketch');
  }, true);
  window.addEventListener('unhandledrejection', function(e){
    if (!window.__p5Running) return;
    window.__setP5Error(e ? e.reason : e, 'sketch');
  });
})();
</script>`;
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
    label: "p5 runtime",
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
    label: "core-js polyfills",
  });
}
