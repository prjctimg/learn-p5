// Shared helpers for the HTML documents rendered inside WebViews. Keeping the
// escaping and compatibility shim in one place prevents one preview surface
// from silently diverging from the others.

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

/**
 * p5 2.x targets modern browsers, but Expo supports older Android WebViews and
 * iOS versions where a few small runtime APIs are missing. These polyfills are
 * ES5 so they can run before p5 is parsed.
 */
export const P5_COMPAT_POLYFILL = `<script>
(function () {
  if (!Object.hasOwn) {
    Object.hasOwn = function (object, key) {
      return Object.prototype.hasOwnProperty.call(object, key);
    };
  }
  if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replacement) {
      var value = String(this);
      if (search instanceof RegExp) {
        if (!search.global) {
          throw new TypeError("replaceAll must be called with a global RegExp");
        }
        return value.replace(search, replacement);
      }
      return value.split(String(search)).join(String(replacement));
    };
  }
  if (!Array.prototype.at) {
    Object.defineProperty(Array.prototype, "at", {
      configurable: true,
      writable: true,
      value: function (index) {
        var length = this.length;
        var position = Math.trunc(index) || 0;
        if (position < 0) position += length;
        return position >= 0 && position < length ? this[position] : undefined;
      },
    });
  }
  if (typeof structuredClone !== "function") {
    window.structuredClone = function (value) {
      return JSON.parse(JSON.stringify(value));
    };
  }
})();
</script>`;
