import { CODEMIRROR_BUNDLE } from "./codemirror-bundle.generated";
import { P5_RUNTIME_SOURCE } from "./p5-runtime.generated";
import { Colors, type ColorScheme } from "../../constants/Colors";
import { getEditorTheme } from "./themes";
import { getP5FunctionNames } from "../../data/reference";
import { hexToRgb } from "../colorUtils";
import { p5RuntimeScript, polyfillScript, safeJson, scriptTag, type RuntimeAssetUrls } from "./p5Html";
import { fontFaceCss } from "./fontFace";
import type { SketchAddon } from "../../types";

interface PlaygroundHtmlParams {
  code: string;
  colorScheme: ColorScheme;
  editorTheme?: string;
  codeFontSize?: number;
  ctaColor?: string;
  wordWrap?: boolean;
  assetMap?: Record<string, string>;
  addons?: SketchAddon[];
  sketchName?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getPlaygroundHtml(params: PlaygroundHtmlParams, assets?: RuntimeAssetUrls | null): string {
  const colors = Colors[params.colorScheme];
  const ctaColor = params.ctaColor ?? colors.cta;
  const { r, g, b } = hexToRgb(ctaColor);
  const ctaRgb = `${r},${g},${b}`;
  const themeColors = getEditorTheme(params.editorTheme || "p5-learn", params.colorScheme, ctaColor);
  const fontSize = params.codeFontSize ?? 22;
  const p5Script = p5RuntimeScript({ inlineSource: P5_RUNTIME_SOURCE, runtimeUrl: assets?.p5Url });
  const polyfill = polyfillScript({ scriptUrl: assets?.polyfillUrl });
  const codemirror = scriptTag({ source: CODEMIRROR_BUNDLE, url: assets?.codemirrorUrl });
  const fontFaces = fontFaceCss({ regularUrl: assets?.fontRegularUrl, boldUrl: assets?.fontBoldUrl });
  const assetMapJson = safeJson(params.assetMap ?? {});
  const codeArg = safeJson(params.code ?? "");
  const addonScripts = (params.addons ?? [])
    .filter((a) => a.enabled && a.url)
    .map((a) => `<script src="${escapeHtml(a.url)}"></script>`)
    .join("\n");
  const p5Fns = safeJson(getP5FunctionNames());

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
${fontFaces}
* { margin:0; padding:0; box-sizing:border-box; }
html, body { min-height:100%; background:${colors.surface}; font-family:"JetBrains Mono", monospace; color:${colors.onSurface}; }
.section { margin: 12px 16px; }
.label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${colors.onSurfaceVariant}; margin-bottom:8px; }
.preview-box { height: 260px; background:#000; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; position:relative; }
.preview-box canvas { display:block; max-width:100%; height:auto; touch-action:pan-y !important; }
.toolbar { display:flex; gap:8px; margin: 0 16px 8px 16px; flex-wrap:wrap; }
.btn { background:${colors.surfaceContainerHigh}; border:1px solid ${colors.outlineVariant}; color:${colors.onSurface}; font-family:"JetBrains Mono",monospace; font-size:11px; font-weight:700; padding:6px 10px; border-radius:6px; cursor:pointer; }
.btn:active { opacity:.7; }
.btn.primary { background:${ctaColor}; color:#fff; border-color:${ctaColor}; }
.editor-section { margin: 12px 16px 16px 16px; border-radius:8px; overflow:hidden; background:${themeColors.bg}; }
.editor-header { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; }
.lang-tag { font-size:11px; font-weight:700; color:${ctaColor}; background:rgba(${ctaRgb},0.12); padding:2px 6px; border-radius:3px; }
#editor { min-height: 180px; }
.cm-editor { font-size:${fontSize}px; background:${themeColors.bg}; }
.cm-editor .cm-scroller { font-family:'JetBrains Mono', monospace; max-height:${Math.round(fontSize * 1.6 * 20)}px; overflow:auto; }
.cm-editor.cm-focused { outline:none; }
.console { margin: 0 16px 24px 16px; background:${colors.surfaceContainer}; border-radius:8px; padding:10px; max-height:160px; overflow:auto; font-size:12px; line-height:1.5; }
.console .err { color:#ef4444; }
.console .warn { color:#f59e0b; }
.console .log { color:${colors.onSurfaceVariant}; }
.status { margin: 0 16px 8px 16px; font-size:11px; color:${colors.onSurfaceVariant}; min-height:16px; }
</style>
</head>
<body>
<div class="section">
  <div class="label">Preview</div>
  <div class="preview-box" id="preview"></div>
</div>
<div class="toolbar">
  <button class="btn primary" id="runBtn">Run</button>
  <button class="btn" id="stopBtn">Stop</button>
  <button class="btn" id="exportBtn">Export PNG</button>
</div>
<div class="status" id="status"></div>
<div class="editor-section">
  <div class="editor-header">
    <span class="lang-tag">JS</span>
    <div>
      <button class="btn" id="copyBtn">Copy</button>
    </div>
  </div>
  <div id="editor"></div>
</div>
<div class="section">
  <div class="label">Console</div>
  <div class="console" id="console"></div>
</div>
${polyfill}
${p5Script}
${addonScripts}
${codemirror}
<script>
(function() {
  function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var INITIAL_CODE = ${codeArg};
  var ASSET_MAP = ${assetMapJson};
  var P5_FNS = ${p5Fns};
  var WORD_WRAP = ${params.wordWrap ? "true" : "false"};
  var currentSketch = null;
  var view = null;
  var captureQueue = null;
  var captureResults = [];
  var captureWasLooping = false;
  var captureTarget = null;

  function post(msg) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  }
  function setStatus(text) { var el = document.getElementById('status'); if (el) el.textContent = text || ''; }
  function logConsole(level, args) {
    var el = document.getElementById('console');
    if (!el) return;
    var line = document.createElement('div');
    line.className = level;
    var text = [];
    for (var i=0;i<args.length;i++) {
      try { text.push(typeof args[i] === 'string' ? args[i] : JSON.stringify(args[i])); } catch(e) { text.push(String(args[i])); }
    }
    line.textContent = '[' + level + '] ' + text.join(' ');
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
    post({ type: 'console', level: level, message: text.join(' ') });
  }

  ['log','warn','error','info'].forEach(function(level) {
    var orig = console[level];
    console[level] = function() {
      try { logConsole(level === 'info' ? 'log' : level, Array.prototype.slice.call(arguments)); } catch(e) {}
      return orig.apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e) {
    logConsole('error', [e.message + (e.lineno ? ' (' + e.lineno + ':' + e.colno + ')' : '')]);
  });
  window.addEventListener('unhandledrejection', function(e) {
    logConsole('error', ['Unhandled promise rejection: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason))]);
  });

  function resolveAssetPath(path) {
    if (!path || typeof path !== 'string') return path;
    if (ASSET_MAP[path]) return ASSET_MAP[path];
    var clean = path.replace(/^\.\\//, '');
    if (ASSET_MAP[clean]) return ASSET_MAP[clean];
    var base = clean.split('/').pop();
    for (var k in ASSET_MAP) { if (k === clean || k.endsWith('/' + clean) || k.split('/').pop() === base) return ASSET_MAP[k]; }
    return path;
  }

  function patchP5AssetLoading() {
    if (typeof window.p5 === 'undefined' || !window.p5.prototype) return;
    var loaders = ['loadImage','loadJSON','loadStrings','loadTable','loadXML','loadBytes','loadFont','loadModel','loadShader'];
    loaders.forEach(function(name) {
      var orig = window.p5.prototype[name];
      if (typeof orig !== 'function') return;
      window.p5.prototype[name] = function() {
        var args = Array.prototype.slice.call(arguments);
        if (typeof args[0] === 'string') args[0] = resolveAssetPath(args[0]);
        if (name === 'loadShader' && typeof args[1] === 'string') args[1] = resolveAssetPath(args[1]);
        return orig.apply(this, args);
      };
    });
  }

  function destroySketch() {
    if (currentSketch) {
      try { currentSketch.remove(); } catch(e) {}
      currentSketch = null;
    }
    var container = document.getElementById('preview');
    if (container) container.innerHTML = '';
  }

  var P5_HOOK_NAMES = ['preload','setup','draw','windowResized','mousePressed','mouseReleased','mouseClicked','mouseMoved','mouseDragged','mouseWheel','doubleClicked','keyPressed','keyReleased','keyTyped','touchStarted','touchMoved','touchEnded','deviceMoved','deviceTurned','deviceShaken'];
  function runUserSketch(code, instance) {
    var fields = [];
    for (var i = 0; i < P5_HOOK_NAMES.length; i++) {
      var name = P5_HOOK_NAMES[i];
      fields.push(JSON.stringify(name) + ':typeof ' + name + ' !== "undefined" ? ' + name + ' : undefined');
    }
    var factory = new Function('__p5scope', 'with (__p5scope) { return (function() {' + code + '\\n;return {' + fields.join(',') + '};})(); }');
    var hooks = factory(instance);
    for (var key in hooks) {
      if (Object.prototype.hasOwnProperty.call(hooks, key) && typeof hooks[key] === 'function') instance[key] = hooks[key];
    }
  }

  function makeSketch(code) {
    return function(p) {
      runUserSketch(code, p);
      var userDraw = p.draw;
      p.draw = function() {
        if (typeof userDraw === 'function') userDraw.call(p);
        handleCaptureFrame(p);
      };
    };
  }

  function runSketch(code) {
    destroySketch();
    var container = document.getElementById('preview');
    setStatus('Running...');
    document.getElementById('console').innerHTML = '';
    try {
      patchP5AssetLoading();
      currentSketch = new window.p5(makeSketch(code), container);
      setStatus('Running');
      post({ type: 'runStarted' });
    } catch(e) {
      logConsole('error', [e.message || String(e)]);
      setStatus('Error');
      post({ type: 'runError', message: e.message || String(e) });
    }
  }

  function stopSketch() {
    if (currentSketch) {
      try { currentSketch.noLoop(); } catch(e) {}
      setStatus('Stopped');
      post({ type: 'stopped' });
    }
  }

  function exportPng() {
    if (!currentSketch || !currentSketch.canvas) { logConsole('warn', ['No canvas to export. Run the sketch first.']); return; }
    try {
      var dataUrl = currentSketch.canvas.toDataURL('image/png');
      post({ type: 'exportPng', dataUrl: dataUrl, name: 'sketch.png' });
      setStatus('Exported PNG');
    } catch(e) { logConsole('error', ['Export failed: ' + e.message]); }
  }

  function handleCaptureFrame(p) {
    if (!captureQueue || captureQueue.length === 0) return;
    var target = captureQueue[0];
    if (p.frameCount < target) return;
    if (captureTarget === target) return;
    captureTarget = target;
    try {
      p.noLoop();
      var wasLooping = captureWasLooping;
      var doCapture = function() {
        try {
          var dataUrl = p.canvas.toDataURL('image/png');
          captureResults.push({ frame: target, dataUrl: dataUrl });
          post({ type: 'frameCaptured', frame: target, index: captureResults.length, total: captureResults.length + captureQueue.length - 1 });
        } catch(e) {
          logConsole('error', ['Frame capture failed at ' + target + ': ' + e.message]);
        }
        captureQueue.shift();
        captureTarget = null;
        if (captureQueue.length === 0) {
          var results = captureResults.slice();
          captureResults = [];
          captureQueue = null;
          if (wasLooping) try { p.loop(); } catch(e) {}
          setStatus('Captured ' + results.length + ' frame(s)');
          post({ type: 'captureComplete', frames: results });
        } else {
          try { p.loop(); } catch(e) {}
        }
      };
      // one redraw at deterministic point
      p.frameCount = target - 1;
      Promise.resolve().then(function() { return p.redraw(); }).then(doCapture).catch(function(e) {
        logConsole('error', ['Capture redraw failed: ' + e.message]);
        captureQueue = null; captureResults = []; captureTarget = null;
        post({ type: 'captureComplete', frames: [], error: e.message });
      });
    } catch(e) {
      logConsole('error', ['Capture error: ' + e.message]);
      captureQueue = null; captureResults = []; captureTarget = null;
      post({ type: 'captureComplete', frames: [], error: e.message });
    }
  }

  function startCapture(frames) {
    if (!currentSketch) { logConsole('warn', ['Run the sketch before capturing frames.']); return; }
    var uniq = [];
    var seen = {};
    for (var i=0;i<frames.length;i++) {
      var f = parseInt(frames[i], 10);
      if (isFinite(f) && f >= 0 && !seen[f]) { seen[f] = true; uniq.push(f); }
    }
    uniq.sort(function(a,b){ return a-b; });
    if (uniq.length === 0) { logConsole('warn', ['No valid frames to capture.']); return; }
    captureQueue = uniq.slice();
    captureResults = [];
    captureTarget = null;
    captureWasLooping = currentSketch.isLooping ? currentSketch.isLooping() : true;
    setStatus('Capturing ' + uniq.length + ' frame(s)...');
    try { currentSketch.loop(); } catch(e) {}
  }

  // Editor
  var CM = window.CM;
  if (CM) {
    var highlightStyle = CM.HighlightStyle.define([
      { tag: CM.tags.keyword, color: '${themeColors.keyword}' },
      { tag: CM.tags.string, color: '${themeColors.string}' },
      { tag: CM.tags.number, color: '${themeColors.number}' },
      { tag: CM.tags.comment, color: '${themeColors.comment}', fontStyle: 'italic' },
      { tag: CM.tags.function(CM.tags.variableName), color: '${themeColors.function}' },
      { tag: CM.tags.definition(CM.tags.variableName), color: '${themeColors.function}' },
      { tag: CM.tags.typeName, color: '${themeColors.type}' },
      { tag: CM.tags.operator, color: '${themeColors.operator}' },
      { tag: CM.tags.bool, color: '${themeColors.number}' },
    ]);
    var theme = CM.EditorView.theme({
      '&': { backgroundColor: '${themeColors.bg}', color: '${themeColors.fg}' },
      '.cm-content': { caretColor: '${ctaColor}', fontFamily: "'JetBrains Mono', monospace" },
      '.cm-gutters': { backgroundColor: '${themeColors.bg}', color: '${themeColors.gutterFg}', borderRight: '1px solid ${themeColors.gutterBorder}' },
      '.cm-activeLineGutter': { backgroundColor: '${themeColors.activeBg}' },
      '.cm-activeLine': { backgroundColor: '${themeColors.activeBg}' },
      '.cm-selectionBackground': { backgroundColor: '${themeColors.selBg}' },
      '.cm-cursor': { borderLeftColor: '${ctaColor}' },
    });
    var extensions = [CM.basicSetup, CM.javascript(), theme, CM.syntaxHighlighting(highlightStyle), CM.EditorView.updateListener.of(function(u){ if (u.docChanged) post({ type:'codeChange', code: u.state.doc.toString() }); })];
    if (WORD_WRAP && CM.EditorView.lineWrapping) extensions.push(CM.EditorView.lineWrapping);
    view = new CM.EditorView({ state: CM.EditorState.create({ doc: INITIAL_CODE, extensions: extensions }), parent: document.getElementById('editor') });
    post({ type: 'editorReady', ready: true });
  } else {
    document.getElementById('editor').innerHTML = '<textarea id="fallback" style="width:100%;min-height:180px;background:${themeColors.bg};color:${themeColors.fg};border:none;padding:12px;font-family:JetBrains Mono,monospace;font-size:${fontSize}px">' + escapeHtml(INITIAL_CODE) + '</textarea>';
    var fb = document.getElementById('fallback');
    fb.addEventListener('input', function() { post({ type:'codeChange', code: fb.value }); });
    post({ type: 'editorReady', ready: true });
  }

  function getCode() { return view ? view.state.doc.toString() : (document.getElementById('fallback') ? document.getElementById('fallback').value : INITIAL_CODE); }
  function setCode(code) {
    if (view) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code || '' } });
    else { var fb = document.getElementById('fallback'); if (fb) fb.value = code || ''; }
  }

  document.getElementById('runBtn').addEventListener('click', function() { runSketch(getCode()); });
  document.getElementById('stopBtn').addEventListener('click', stopSketch);
  document.getElementById('exportBtn').addEventListener('click', exportPng);
  document.getElementById('copyBtn').addEventListener('click', function() {
    var code = getCode();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).catch(function(){});
    post({ type: 'copied' });
  });

  function handleMessage(data) {
    var msg;
    try { msg = typeof data === 'string' ? JSON.parse(data) : data; } catch(e) { return; }
    if (!msg || !msg.type) return;
    switch (msg.type) {
      case 'run': runSketch(getCode()); break;
      case 'stop': stopSketch(); break;
      case 'setCode': setCode(msg.code || ''); break;
      case 'getCode': post({ type: 'code', code: getCode() }); break;
      case 'exportPng': exportPng(); break;
      case 'captureFrames': startCapture(msg.frames || []); break;
      case 'setAssetMap': ASSET_MAP = msg.assetMap || {}; break;
      case 'setWordWrap':
        WORD_WRAP = !!msg.wordWrap;
        // simple rebuild
        if (view && CM) {
          var code = getCode(); var sel = view.state.selection.main.head;
          view.destroy();
          var exts = [CM.basicSetup, CM.javascript(), theme, CM.syntaxHighlighting(highlightStyle), CM.EditorView.updateListener.of(function(u){ if (u.docChanged) post({ type:'codeChange', code: u.state.doc.toString() }); })];
          if (WORD_WRAP && CM.EditorView.lineWrapping) exts.push(CM.EditorView.lineWrapping);
          view = new CM.EditorView({ state: CM.EditorState.create({ doc: code, extensions: exts }), parent: document.getElementById('editor') });
        }
        break;
      case 'insert':
        if (view) {
          var sel = view.state.selection.main;
          var text = msg.text || '';
          var offset = msg.cursorOffset != null ? msg.cursorOffset : text.length;
          view.dispatch({ changes: { from: sel.from, to: sel.to, insert: text }, selection: { anchor: sel.from + offset } });
          view.focus();
        }
        break;
      case 'backspace':
        if (view) {
          var s = view.state.selection.main;
          if (s.from !== s.to) view.dispatch({ changes: { from: s.from, to: s.to }, selection: { anchor: s.from } });
          else if (s.head > 0) view.dispatch({ changes: { from: s.head - 1, to: s.head }, selection: { anchor: s.head - 1 } });
        }
        break;
    }
  }
  window.addEventListener('message', function(e) { handleMessage(e.data); });
  document.addEventListener('message', function(e) { handleMessage(e.data); });
  post({ type: 'ready' });
})();
</script>
</body>
</html>`;
}
