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

export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Inline the bundled p5 runtime into the preview document. The runtime
 * ships with the app (see scripts/bundle-p5.mjs), so previews never fetch
 * it from the content pack, a CDN, or a `file://` script tag (which
 * WebViews loading an in-memory document refuse to load), and never send
 * ~1 MB of source through the WebView postMessage bridge.
 */
export function p5RuntimeScript({ inlineSource }: { inlineSource?: string | null }): string {
  if (typeof inlineSource === "string" && inlineSource.length > 0) {
    return `<script>${escapeScriptContent(inlineSource)}</script>`;
  }
  return "";
}

/**
 * The bundled p5 runtime is transpiled to ES2015, but transpiling only
 * rewrites syntax: p5 still calls runtime APIs from ES2016-ES2023 and
 * newer DOM APIs that are missing from older Android WebViews (which can
 * lag the Android version by years on devices that never update System
 * WebView) and older iOS versions. These polyfills are ES5 so they can
 * run before p5 is parsed. Each one only fills in a missing API, so
 * newer WebViews keep their native implementation.
 */
export const P5_COMPAT_POLYFILL = `<script>
/* learn-p5-runtime-compat:start */
(function () {
  var root = typeof window !== "undefined" ? window : this;
  var hasAbortController = typeof root.AbortController !== "undefined";
  var supportsAbortSignal = false;

  if (
    hasAbortController &&
    typeof root.EventTarget !== "undefined" &&
    typeof root.Event === "function"
  ) {
    try {
      var probeController = new root.AbortController();
      var probeTarget = new root.EventTarget();
      var probeCalled = false;
      probeTarget.addEventListener(
        "learn-p5-probe",
        function () {
          probeCalled = true;
        },
        { signal: probeController.signal }
      );
      probeController.abort();
      probeTarget.dispatchEvent(new root.Event("learn-p5-probe"));
      supportsAbortSignal = !probeCalled;
    } catch (error) {}
  }

  var needsAbortSignalShim = !supportsAbortSignal;

  if (typeof root.globalThis === "undefined") {
    root.globalThis = root;
  }

  if (root.Intl && typeof root.Intl.getCanonicalLocales !== "function") {
    root.Intl.getCanonicalLocales = function (locales) {
      var list = locales === undefined ? [] : Array.isArray(locales) ? locales : [locales];
      var result = [];
      for (var i = 0; i < list.length; i++) {
        if (typeof list[i] !== "string") {
          throw new TypeError("Language ID should be string or object.");
        }
        var tag = list[i];
        try {
          tag = new root.Intl.DateTimeFormat(tag).resolvedOptions().locale;
        } catch (error) {}
        result.push(tag);
      }
      return result;
    };
  }

  function define(target, name, value) {
    if (typeof target[name] === "function") return;
    if (Object.defineProperty) {
      Object.defineProperty(target, name, {
        configurable: true,
        writable: true,
        value: value,
      });
    } else {
      target[name] = value;
    }
  }

  if (typeof Object.fromEntries !== "function") {
    Object.fromEntries = function (entries) {
      var result = {};
      if (entries == null) {
        throw new TypeError("Object.fromEntries requires an iterable");
      }
      var iteratorSymbol = typeof Symbol === "function" && Symbol.iterator;
      if (iteratorSymbol && typeof entries[iteratorSymbol] === "function") {
        var iterator = entries[iteratorSymbol]();
        var step;
        while (!(step = iterator.next()).done) {
          var entry = step.value;
          if (entry == null || typeof entry.length !== "number" || entry.length < 2) {
            throw new TypeError("Object.fromEntries requires entry objects");
          }
          result[entry[0]] = entry[1];
        }
        return result;
      }
      if (typeof entries.length === "number") {
        for (var i = 0; i < entries.length; i++) {
          var pair = entries[i];
          if (pair == null || typeof pair.length !== "number" || pair.length < 2) {
            throw new TypeError("Object.fromEntries requires entry objects");
          }
          result[pair[0]] = pair[1];
        }
        return result;
      }
      throw new TypeError("Object.fromEntries requires an iterable");
    };
  }

  if (typeof Object.entries !== "function") {
    Object.entries = function (object) {
      if (object == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      var keys = Object.keys(Object(object));
      var result = [];
      for (var i = 0; i < keys.length; i++) {
        result.push([keys[i], object[keys[i]]]);
      }
      return result;
    };
  }

  if (typeof Object.values !== "function") {
    Object.values = function (object) {
      var entries = Object.entries(Object(object));
      var result = [];
      for (var i = 0; i < entries.length; i++) {
        result.push(entries[i][1]);
      }
      return result;
    };
  }

  if (typeof Object.hasOwn !== "function") {
    Object.hasOwn = function (object, key) {
      return Object.prototype.hasOwnProperty.call(object, key);
    };
  }

  if (typeof Object.assign !== "function") {
    Object.assign = function (target) {
      if (target == null) {
        throw new TypeError("Object.assign target cannot be null or undefined");
      }
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var from = arguments[i];
        if (from == null) continue;
        var keys = Object.keys(Object(from));
        for (var j = 0; j < keys.length; j++) {
          to[keys[j]] = from[keys[j]];
        }
        if (typeof Symbol === "function" && typeof Symbol.getOwnPropertySymbols === "function") {
          var symbols = Symbol.getOwnPropertySymbols(Object(from));
          for (var k = 0; k < symbols.length; k++) {
            if (Object.prototype.propertyIsEnumerable.call(from, symbols[k])) {
              to[symbols[k]] = from[symbols[k]];
            }
          }
        }
      }
      return to;
    };
  }

  if (typeof Array.from !== "function") {
    Array.from = function (arrayLike, mapFn, thisArg) {
      var result = [];
      if (arrayLike == null) return result;
      var iteratorSymbol = typeof Symbol === "function" && Symbol.iterator;
      if (iteratorSymbol && typeof arrayLike[iteratorSymbol] === "function") {
        var iterator = arrayLike[iteratorSymbol]();
        var step;
        var index = 0;
        while (!(step = iterator.next()).done) {
          result.push(mapFn ? mapFn.call(thisArg, step.value, index) : step.value);
          index++;
        }
        return result;
      }
      var length = Math.max(0, Math.min(Number(arrayLike.length) || 0, 9007199254740991));
      for (var i = 0; i < length; i++) {
        result.push(mapFn ? mapFn.call(thisArg, arrayLike[i], i) : arrayLike[i]);
      }
      return result;
    };
  }

  if (typeof Number.isFinite !== "function") {
    Number.isFinite = function (value) {
      return typeof value === "number" && isFinite(value);
    };
  }

  if (typeof Number.isInteger !== "function") {
    Number.isInteger = function (value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
  }

  if (typeof String.prototype.replaceAll !== "function") {
    define(String.prototype, "replaceAll", function (search, replacement) {
      var value = String(this);
      if (search instanceof RegExp) {
        if (!search.global) {
          throw new TypeError("replaceAll must be called with a global RegExp");
        }
        return value.replace(search, replacement);
      }
      return value.split(String(search)).join(String(replacement));
    });
  }

  function pad(value, targetLength, padString, atStart) {
    var length = targetLength === undefined ? 0 : Number(targetLength);
    if (length !== length) length = 0;
    length = Math.floor(length);
    if (length <= value.length) return value;
    var padding = padString === undefined ? " " : String(padString);
    if (padding.length === 0) return value;
    var needed = length - value.length;
    var fill = "";
    while (fill.length < needed) fill += padding;
    fill = fill.slice(0, needed);
    return atStart ? fill + value : value + fill;
  }

  define(String.prototype, "padStart", function (targetLength, padString) {
    return pad(String(this), targetLength, padString, true);
  });

  define(String.prototype, "padEnd", function (targetLength, padString) {
    return pad(String(this), targetLength, padString, false);
  });

  define(Array.prototype, "at", function (index) {
    var length = this.length;
    var position = Number(index);
    if (position !== position) position = 0;
    position = position < 0 ? Math.ceil(position) : Math.floor(position);
    if (position < 0) position += length;
    return position >= 0 && position < length ? this[position] : undefined;
  });

  define(String.prototype, "at", function (index) {
    var value = String(this);
    var length = value.length;
    var position = Number(index);
    if (position !== position) position = 0;
    position = position < 0 ? Math.ceil(position) : Math.floor(position);
    if (position < 0) position += length;
    return position >= 0 && position < length ? value.charAt(position) : undefined;
  });

  function flattenInto(input, depth, output) {
    for (var i = 0; i < input.length; i++) {
      var value = input[i];
      if (depth > 0 && Array.isArray(value)) {
        flattenInto(value, depth - 1, output);
      } else {
        output.push(value);
      }
    }
    return output;
  }

  define(Array.prototype, "flat", function (depth) {
    var level = depth === undefined ? 1 : Number(depth);
    if (level !== level || level < 0) level = 0;
    return flattenInto(this, level === Infinity ? Infinity : Math.floor(level), []);
  });

  define(Array.prototype, "flatMap", function (callback, thisArg) {
    return flattenInto(this.map(callback, thisArg), 1, []);
  });

  define(Array.prototype, "includes", function (searchElement, fromIndex) {
    var start = fromIndex === undefined ? 0 : Number(fromIndex);
    if (start !== start) start = 0;
    if (start < 0) start = Math.max(0, this.length + start);
    for (var i = start; i < this.length; i++) {
      if (this[i] === searchElement || (searchElement !== searchElement && this[i] !== this[i])) {
        return true;
      }
    }
    return false;
  });

  define(Array.prototype, "find", function (predicate, thisArg) {
    if (typeof predicate !== "function") {
      throw new TypeError("Array.prototype.find requires a predicate function");
    }
    for (var i = 0; i < this.length; i++) {
      if (predicate.call(thisArg, this[i], i, this)) return this[i];
    }
    return undefined;
  });

  define(Array.prototype, "findIndex", function (predicate, thisArg) {
    if (typeof predicate !== "function") {
      throw new TypeError("Array.prototype.findIndex requires a predicate function");
    }
    for (var i = 0; i < this.length; i++) {
      if (predicate.call(thisArg, this[i], i, this)) return i;
    }
    return -1;
  });

  define(String.prototype, "includes", function (searchString, position) {
    if (searchString instanceof RegExp) {
      throw new TypeError("String.prototype.includes cannot take a RegExp");
    }
    var start = position === undefined ? 0 : Number(position);
    if (start !== start) start = 0;
    return String(this).indexOf(String(searchString), start) !== -1;
  });

  define(String.prototype, "startsWith", function (searchString, position) {
    if (searchString instanceof RegExp) {
      throw new TypeError("String.prototype.startsWith cannot take a RegExp");
    }
    var start = position === undefined ? 0 : Number(position);
    if (start !== start || start < 0) start = 0;
    return String(this).slice(start, start + String(searchString).length) === String(searchString);
  });

  define(String.prototype, "endsWith", function (searchString, endPosition) {
    if (searchString instanceof RegExp) {
      throw new TypeError("String.prototype.endsWith cannot take a RegExp");
    }
    var value = String(this);
    var end = endPosition === undefined ? value.length : Number(endPosition);
    if (end !== end || end > value.length) end = value.length;
    if (end < 0) end = 0;
    return value.slice(end - String(searchString).length, end) === String(searchString);
  });

  define(String.prototype, "repeat", function (count) {
    var value = String(this);
    var n = Number(count);
    if (n !== n || n === Infinity || n === -Infinity) {
      throw new RangeError("String.prototype.repeat count must be finite");
    }
    n = Math.floor(n);
    if (n < 0) throw new RangeError("String.prototype.repeat count cannot be negative");
    var result = "";
    for (var i = 0; i < n; i++) result += value;
    return result;
  });

  define(String.prototype, "trimStart", function () {
    return String(this).replace(/^\\s+/, "");
  });

  define(String.prototype, "trimEnd", function () {
    return String(this).replace(/\\s+$/, "");
  });

  if (typeof Promise !== "undefined" && typeof Promise.prototype.finally !== "function") {
    define(Promise.prototype, "finally", function (onFinally) {
      var promise = this;
      if (typeof onFinally !== "function") return promise.then();
      return promise.then(
        function (value) {
          return Promise.resolve(onFinally()).then(function () { return value; });
        },
        function (reason) {
          return Promise.resolve(onFinally()).then(function () { throw reason; });
        }
      );
    });
  }

  if (typeof Promise !== "undefined" && typeof Promise.allSettled !== "function") {
    Promise.allSettled = function (iterable) {
      return Promise.all(
        Array.from(iterable).map(function (value) {
          return Promise.resolve(value).then(
            function (resolvedValue) { return { status: "fulfilled", value: resolvedValue }; },
            function (reason) { return { status: "rejected", reason: reason }; }
          );
        })
      );
    };
  }

  if (typeof root.TextEncoder === "undefined" && typeof Uint8Array === "function") {
    root.TextEncoder = function () {};
    root.TextEncoder.prototype.encode = function (input) {
      var str = String(input);
      var bytes = [];
      for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code < 128) {
          bytes.push(code);
        } else if (code < 2048) {
          bytes.push(192 | (code >> 6), 128 | (code & 63));
        } else if (code >= 55296 && code <= 56319 && i + 1 < str.length) {
          var next = str.charCodeAt(i + 1);
          if (next >= 56320 && next <= 57343) {
            var cp = 65536 + ((code - 55296) << 10) + (next - 56320);
            bytes.push(240 | (cp >> 18), 128 | ((cp >> 12) & 63), 128 | ((cp >> 6) & 63), 128 | (cp & 63));
            i++;
          } else {
            bytes.push(239, 191, 189);
          }
        } else if (code >= 56320 && code <= 57343) {
          bytes.push(239, 191, 189);
        } else {
          bytes.push(224 | (code >> 12), 128 | ((code >> 6) & 63), 128 | (code & 63));
        }
      }
      return new Uint8Array(bytes);
    };
    root.TextEncoder.prototype.encodeInto = function (source, destination) {
      var bytes = this.encode(source);
      var written = Math.min(bytes.length, destination.length);
      for (var i = 0; i < written; i++) destination[i] = bytes[i];
      return { read: source.length, written: written };
    };
  }

  if (typeof root.TextDecoder === "undefined" && typeof Uint8Array === "function") {
    root.TextDecoder = function (label) {
      this.label = label || "utf-8";
    };
    root.TextDecoder.prototype.decode = function (input) {
      if (input == null) return "";
      var bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
      var binary = "";
      for (var i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + 8192, bytes.length)));
      }
      try {
        return decodeURIComponent(escape(binary));
      } catch (error) {
        return binary;
      }
    };
  }

  if (typeof root.Element !== "undefined" && root.Element.prototype) {
    define(root.Element.prototype, "remove", function () {
      if (this.parentNode) this.parentNode.removeChild(this);
    });
    define(root.Element.prototype, "closest", function (selector) {
      var el = this;
      while (el && el.nodeType === 1) {
        if (typeof el.matches === "function" && el.matches(selector)) return el;
        el = el.parentElement || el.parentNode;
      }
      return null;
    });
  }

  if (typeof root.structuredClone !== "function") {
    root.structuredClone = function (value) {
      if (value === undefined) return undefined;
      return JSON.parse(JSON.stringify(value));
    };
  }

  if (typeof root.queueMicrotask !== "function") {
    root.queueMicrotask = function (callback) {
      Promise.resolve().then(callback).catch(function (error) {
        setTimeout(function () {
          throw error;
        }, 0);
      });
    };
  }

  if (typeof root.setImmediate !== "function") {
    root.setImmediate = function (callback) {
      var args = Array.prototype.slice.call(arguments, 1);
      return setTimeout(function () {
        callback.apply(null, args);
      }, 0);
    };
    root.clearImmediate = function (id) {
      clearTimeout(id);
    };
  }

  if (!hasAbortController) {
    root.AbortController = function () {
      var listeners = [];
      var signal = {
        aborted: false,
        onabort: null,
        addEventListener: function (type, listener) {
          if (type === "abort" && listeners.indexOf(listener) === -1) {
            listeners.push(listener);
          }
        },
        removeEventListener: function (type, listener) {
          if (type !== "abort") return;
          var index = listeners.indexOf(listener);
          if (index !== -1) listeners.splice(index, 1);
        },
      };
      this.signal = signal;
      this.abort = function () {
        if (signal.aborted) return;
        signal.aborted = true;
        var event;
        try {
          event = new Event("abort");
        } catch (error) {
          event = { type: "abort", target: signal };
        }
        if (typeof signal.onabort === "function") {
          try {
            signal.onabort.call(signal, event);
          } catch (error) {}
        }
        for (var i = 0; i < listeners.length; i++) {
          try {
            listeners[i].call(signal, event);
          } catch (error) {}
        }
        listeners.length = 0;
      };
    };
  }

  // Older WebViews ignore the signal option on addEventListener, and
  // WebViews without a native AbortController reject the polyfilled
  // signal object entirely ("Failed to convert value to 'AbortSignal'").
  // p5 uses the signal to tear down window/document listeners in
  // remove(). Strip the signal before calling the native method (keeping
  // only the legacy capture flag) and emulate abort removal ourselves.
  if (needsAbortSignalShim && typeof root.EventTarget !== "undefined") {
    var nativeAddEventListener = root.EventTarget.prototype.addEventListener;
    var nativeRemoveEventListener = root.EventTarget.prototype.removeEventListener;

    root.EventTarget.prototype.addEventListener = function (type, listener, options) {
      var signal = options && typeof options === "object" ? options.signal : null;
      if (!signal) {
        nativeAddEventListener.call(this, type, listener, options);
        return;
      }

      var capture = options.capture ? true : false;
      nativeAddEventListener.call(this, type, listener, capture);

      var target = this;
      var remove = function () {
        nativeRemoveEventListener.call(target, type, listener, capture);
      };

      if (signal.aborted) {
        remove();
      } else if (typeof signal.addEventListener === "function") {
        signal.addEventListener("abort", remove);
      }
    };
  }
})();
</script>`;
