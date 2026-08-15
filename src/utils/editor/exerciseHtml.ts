import { p5Source } from "../p5Source";
import { P5_FUNCTION_NAMES, P5_SYMBOLS } from "../../data/p5Symbols";
import { Colors } from "../../constants/Colors";
// CM is loaded via the embedded IIFE bundle
import { CODEMIRROR_BUNDLE } from "./codemirror-bundle.generated";

const SYMBOL_PATTERN = new RegExp(
  `\\b(${P5_FUNCTION_NAMES.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b(?=\\()`,
  "g"
);

function parseInstructionHtml(text: string): string {
  if (!text) return "";
  let html = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  SYMBOL_PATTERN.lastIndex = 0;

  while ((match = SYMBOL_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      html += escapeHtml(text.slice(lastIndex, match.index));
    }
    html += `<span class="symbol" data-symbol="${match[0]}">${match[0]}</span>`;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    html += escapeHtml(text.slice(lastIndex));
  }

  return html || escapeHtml(text);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsString(s: string): string {
  return JSON.stringify(s.replace(/<\/script>/gi, "<\\/script>"));
}

export function getExerciseHtml(params: {
  title: string;
  moduleName: string;
  instruction: string;
  exerciseNumber: number;
  startingCode: string;
  solution: string;
  colorScheme: "light" | "dark";
  codeBackground?: string;
  codeFontSize?: number;
}): string {
  const colors = Colors[params.colorScheme === "dark" ? "dark" : "light"];
  const editorBg = params.codeBackground && params.codeBackground !== "auto" ? params.codeBackground : colors.surfaceContainerLowest;
  const fontSize = params.codeFontSize ?? 22;
  const instructionHtml = parseInstructionHtml(params.instruction);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { min-height: 100%; background: ${colors.surface}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

  .description {
    padding: 12px 16px;
    background: ${colors.surfaceContainer};
  }
  .description-title {
    font-family: "SpaceGrotesk", sans-serif;
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${colors.primary};
    margin-bottom: 4px;
  }
  .description-text {
    font-size: 16px;
    line-height: 24px;
    color: ${colors.onSurfaceVariant};
  }
  .symbol {
    font-weight: 700;
    text-decoration: underline;
    color: ${colors.primary};
    cursor: pointer;
  }

  .preview-section {
    margin-top: 16px;
    padding: 0 16px;
  }
  .preview-label {
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${colors.onSurfaceVariant};
    margin-bottom: 8px;
  }
  .sketch-box {
    height: 180px;
    background: #000000;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .sketch-box canvas { display: block; }
  .run-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: #ED225D;
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    z-index: 10;
    opacity: 0.9;
  }
  .run-btn:active { opacity: 0.7; }

  .solution-section {
    margin-top: 16px;
    padding: 0 16px;
  }
  .solution-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    padding: 0;
  }
  .solution-header:active { opacity: 0.7; }

  .editor-section {
    margin-top: 20px;
    margin-left: 20px;
    margin-right: 20px;
    border-radius: 8px;
    overflow: hidden;
    background: ${editorBg};
    min-height: 400px;
    position: relative;
  }
  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px 0 12px;
  }
  .editor-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .code-label {
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${colors.onSurfaceVariant};
  }
  .lang-tag {
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${colors.primary};
    background: ${colors.primaryContainer}66;
    padding: 2px 6px;
    border-radius: 3px;
  }
  .editor-header-right {
    display: flex;
    gap: 6px;
  }
  .editor-header-btn {
    background: none;
    border: 1px solid ${colors.outlineVariant};
    color: ${colors.onSurfaceVariant};
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  .editor-header-btn:active {
    background: ${colors.primaryContainer}44;
  }
  .editor-header-btn.copied {
    color: #22C55E;
    border-color: #22C55E;
  }
  .cm-editor { height: 100%; font-size: 22px; background: ${editorBg}; }
  .cm-editor .cm-scroller { font-family: 'JetBrains Mono', monospace; overflow: auto; }
  .cm-editor.cm-focused { outline: none; }
  .cm-editor .cm-gutters { background: ${editorBg}; border-right: 1px solid ${params.colorScheme === 'dark' ? '#292A2E' : '#E5E7EB'}; color: ${params.colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}; }
  .cm-editor .cm-activeLineGutter { background: ${params.colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}; }
  .cm-editor .cm-activeLine { background: ${params.colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}; }
  .cm-editor .cm-cursor { border-left-color: #ED225D; }
  .cm-editor .cm-selectionBackground,
  .cm-editor.cm-focused .cm-selectionBackground { background: ${params.colorScheme === 'dark' ? 'rgba(237, 34, 93, 0.2)' : 'rgba(237, 34, 93, 0.15)'} !important; }
  .cm-editor .cm-matchingBracket {
    background: rgba(237, 34, 93, 0.3);
    outline: 1px solid #ED225D;
  }
  .cm-editor .cm-tooltip-autocomplete { background: ${colors.surfaceContainer}; border: 1px solid ${colors.outlineVariant}; border-radius: 6px; }
  .cm-editor .cm-tooltip-autocomplete ul li[aria-selected] { background: ${colors.primaryContainer}; color: ${colors.onPrimaryContainer}; }
  .cm-editor .cm-tooltip-autocomplete .cm-completionDetail { color: ${colors.onSurfaceVariant}; }
  .scroll-whitespace {
    height: 700px;
  }

  ${params.exerciseNumber === 1 ? `
  .tut-overlay {
    position: fixed; inset: 0; z-index: 9999;
    pointer-events: auto;
  }
  .tut-bg {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.55);
  }
  .tut-cutout {
    position: absolute;
    pointer-events: none;
    border-radius: 8px;
    box-shadow: 0 0 0 9999px rgba(0,0,0,0.55);
  }
  .tut-card {
    position: absolute;
    background: ${colors.surfaceContainerHighest};
    color: ${colors.onSurface};
    border-radius: 12px;
    padding: 16px 20px;
    max-width: 300px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    line-height: 20px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    z-index: 10000;
  }
  .tut-card-title {
    font-family: "SpaceGrotesk", sans-serif;
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${colors.primary};
    margin-bottom: 6px;
  }
  .tut-card-body {
    color: ${colors.onSurfaceVariant};
  }
  .tut-arrow {
    position: absolute;
    width: 0; height: 0;
    border: 8px solid transparent;
  }
  .tut-arrow-down { border-top-color: ${colors.surfaceContainerHighest}; top: 100%; left: 50%; margin-left: -8px; }
  .tut-arrow-up { border-bottom-color: ${colors.surfaceContainerHighest}; bottom: 100%; left: 50%; margin-left: -8px; }
  .tut-arrow-left { border-right-color: ${colors.surfaceContainerHighest}; right: 100%; top: 50%; margin-top: -8px; }
  .tut-arrow-right { border-left-color: ${colors.surfaceContainerHighest}; left: 100%; top: 50%; margin-top: -8px; }
  .tut-dismiss {
    display: inline-block;
    margin-top: 10px;
    background: ${colors.primary};
    color: ${colors.onPrimary};
    border: none;
    border-radius: 6px;
    padding: 6px 16px;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
  }
  ` : ''}
</style>
</head>
<body>

<div class="description">
  <div class="description-title">Exercise ${params.exerciseNumber}: ${escapeHtml(params.title)}</div>
  <div class="description-text">${instructionHtml}</div>
</div>

${
  params.solution
    ? `<div class="solution-section" id="solution-section">
  <button class="solution-header" id="solution-toggle">
    <span class="preview-label" style="margin-bottom:0">Target Solution</span>
    <span class="solution-chevron" id="solution-chevron">&#9660;</span>
  </button>
  <div style="position:relative">
    <div id="solution-sketch" class="sketch-box"></div>
    <button id="solution-run-btn" class="run-btn">&#9654; Run</button>
  </div>
</div>`
    : ""
}

<div class="preview-section">
  <div class="preview-label">Your Output</div>
  <div id="user-sketch" class="sketch-box"></div>
</div>

<div class="editor-section">
  <div class="editor-header">
    <div class="editor-header-left">
      <span class="code-label">Code</span>
      <span class="lang-tag">JS</span>
    </div>
    <div class="editor-header-right">
      <button class="editor-header-btn" id="copyBtn">Copy</button>
    </div>
  </div>
  <div id="editor" style="min-height:400px"></div>
</div>

<div class="scroll-whitespace"></div>

<script>${p5Source}</script>
<script>${CODEMIRROR_BUNDLE}</script>
<script>
${getBridgeScript(params.startingCode, params.solution, editorBg, params.colorScheme, params.exerciseNumber, fontSize)}
</script>

${params.exerciseNumber === 1 ? `
<div id="tut-overlay" class="tut-overlay" style="display:none">
  <div class="tut-bg" id="tut-bg"></div>
  <div class="tut-cutout" id="tut-cutout"></div>
  <div class="tut-card" id="tut-card">
    <div class="tut-card-title" id="tut-title"></div>
    <div class="tut-card-body" id="tut-body"></div>
    <button class="tut-dismiss" id="tut-btn">OK</button>
  </div>
</div>
` : ''}
</body>
</html>`;
}

function getBridgeScript(startingCode: string, solution: string, editorBg: string, colorScheme: "light" | "dark", exerciseNumber?: number, codeFontSize?: number): string {
  const isDark = colorScheme === "dark";
  const codeArg = jsString(startingCode);
  const solutionArg = jsString(solution);

    const fg = isDark ? '#E3E2E7' : '#1F2937';
  const gutterFg = isDark ? '#6B7280' : '#9CA3AF';
  const gutterBorder = isDark ? '#292A2E' : '#E5E7EB';
  const activeBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const selBg = isDark ? 'rgba(237,34,93,0.2)' : 'rgba(237,34,93,0.15)';
  const fnColor = isDark ? '#FFB2BB' : '#BE185D';
  const commentColor = isDark ? '#6B7280' : '#6B7280';
  const numColor = isDark ? '#FF4F75' : '#D31D4E';
  const strColor = isDark ? '#22C55E' : '#16A34A';
  const opColor = isDark ? '#E3E2E7' : '#374151';
  const kwColor = isDark ? '#ED225D' : '#ED225D';
  const typeColor = isDark ? '#FFB2BB' : '#BE185D';
  const constColor = isDark ? '#FF4F75' : '#D31D4E';

  return `
let view;
const INITIAL_CODE = ${codeArg};
const SOLUTION_CODE = ${solutionArg};
const CODE_FONT_SIZE = ${codeFontSize ?? 22};
const EDITOR_BG = '${editorBg}';

var _CM = typeof CM !== 'undefined' ? CM : null;
if (!_CM) {
  var editorEl = document.getElementById('editor');
  if (editorEl) {
    editorEl.innerHTML = '<div style="color:#6B7280;padding:20px;font-family:sans-serif;text-align:center">Code editor bundle unavailable. Type code below.</div><textarea id="cm-fallback" style="width:100%;height:400px;background:' + EDITOR_BG + ';color:${fg};font-family:JetBrains Mono,monospace;font-size:' + CODE_FONT_SIZE + 'px;border:none;outline:none;resize:none;padding:12px">' + INITIAL_CODE + '</textarea>';
  }
  postReady();
  postEditorReady();
  throw new Error('CM bundle not loaded');
}

var basicSetup = _CM.basicSetup;
var EditorView = _CM.EditorView;
var keymap = _CM.keymap;
var ViewPlugin = _CM.ViewPlugin;
var Decoration = _CM.Decoration;
var DecorationSet = _CM.DecorationSet;
var EditorState = _CM.EditorState;
var syntaxHighlighting = _CM.syntaxHighlighting;
var HighlightStyle = _CM.HighlightStyle;
var syntaxTree = _CM.syntaxTree;
var javascript = _CM.javascript;
var indentSelection = _CM.indentSelection;
var autocompletion = _CM.autocompletion;
var tags = _CM.tags;

try {
    var p5FnMark = Decoration.mark({ class: 'cm-p5-fn' });
    function computeP5Decos(v) {
      var decos = [];
      syntaxTree(v.state).iterate({
        enter: function(n) {
          if (n.name === 'CallExpression' || n.name === 'NewExpression') {
            var callee = n.node.firstChild;
            if (callee && callee.name === 'Identifier') {
              var name = v.state.sliceDoc(callee.from, callee.to);
              if (${JSON.stringify(P5_FUNCTION_NAMES)}.indexOf(name) >= 0) {
                decos.push(p5FnMark.range(callee.from, callee.to));
              }
            }
          }
        }
      });
      return DecorationSet.create(v.state, decos);
    }
    function P5FnPlugin(view) { this.decorations = computeP5Decos(view); }
    P5FnPlugin.prototype.update = function(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = computeP5Decos(update.view);
      }
    };
    var p5FnPlugin = ViewPlugin.fromClass(P5FnPlugin, {
      decorations: function(v) { return v.decorations; }
    });

    var p5Completions = ${JSON.stringify(P5_SYMBOLS.map(s => ({ label: s.name + '()', type: 'function', detail: s.syntax, info: s.description })))}.map(function(c) { return { label: c.label, type: c.type, detail: c.detail, info: c.info }; });

    var p5CompletionSource = function(context) {
      var word = context.matchBefore(/\\b[p5\\.]?[a-zA-Z]\\w*/);
      if (!word && !context.explicit) return null;
      if (word && word.from === word.to && !context.explicit) return null;
      var matches = p5Completions.filter(function(c) {
        return c.label.indexOf(word ? word.text : '') === 0;
      });
      return { from: word ? word.from : context.pos, options: matches, validFor: /^[\\w.]+$/ };
    };

    const p5Theme = EditorView.theme({
      '&': { backgroundColor: '${editorBg}', color: '${fg}' },
      '.cm-content': { caretColor: '#ED225D', fontFamily: "'JetBrains Mono', monospace" },
      '.cm-gutters': { backgroundColor: '${editorBg}', color: '${gutterFg}', borderRight: '1px solid ${gutterBorder}' },
      '.cm-activeLineGutter': { backgroundColor: '${activeBg}' },
      '.cm-activeLine': { backgroundColor: '${activeBg}' },
      '.cm-cursor': { borderLeftColor: '#ED225D', borderLeftWidth: '2px' },
      '.cm-selectionBackground': { backgroundColor: '${selBg}' },
      '.cm-matchingBracket': { backgroundColor: 'rgba(237, 34, 93, 0.3)', outline: '1px solid #ED225D' },
      '.cm-p5-fn': { fontWeight: '600' },
    });

    const p5Highlight = HighlightStyle.define([
      { tag: tags.keyword, color: '${kwColor}' },
      { tag: tags.definitionKeyword, color: '${kwColor}', fontWeight: 'bold' },
      { tag: tags.moduleKeyword, color: '${kwColor}' },
      { tag: tags.controlKeyword, color: '${kwColor}' },
      { tag: tags.operator, color: '${opColor}' },
      { tag: tags.arithmeticOperator, color: '${opColor}' },
      { tag: tags.logicOperator, color: '${opColor}' },
      { tag: tags.compareOperator, color: '${opColor}' },
      { tag: tags.punctuation, color: '${opColor}' },
      { tag: tags.separator, color: '${opColor}' },
      { tag: tags.brace, color: '${opColor}' },
      { tag: tags.bracket, color: '${opColor}' },
      { tag: tags.paren, color: '${opColor}' },
      { tag: tags.number, color: '${numColor}' },
      { tag: tags.string, color: '${strColor}' },
      { tag: tags.bool, color: '${numColor}' },
      { tag: tags.null, color: '${numColor}' },
      { tag: tags.variableName, color: '${fg}' },
      { tag: tags.definition(tags.variableName), color: '${fnColor}' },
      { tag: tags.function(tags.variableName), color: '${fnColor}' },
      { tag: tags.definition(tags.function(tags.variableName)), color: '${fnColor}' },
      { tag: tags.propertyName, color: '${fnColor}' },
      { tag: tags.attributeName, color: '${fnColor}' },
      { tag: tags.labelName, color: '${fnColor}' },
      { tag: tags.comment, color: '${commentColor}', fontStyle: 'italic' },
      { tag: tags.self, color: '${kwColor}' },
      { tag: tags.typeName, color: '${typeColor}' },
      { tag: tags.className, color: '${typeColor}' },
      { tag: tags.standard(tags.tagName), color: '${kwColor}' },
      { tag: tags.meta, color: '${fnColor}' },
      { tag: tags.invalid, color: '${kwColor}' },
      { tag: tags.modifier, color: '${kwColor}' },
      { tag: tags.constant(tags.variableName), color: '${constColor}' },
      { tag: tags.special(tags.variableName), color: '${constColor}' },
    ]);

    const state = EditorState.create({
      doc: INITIAL_CODE || '',
      extensions: [
        basicSetup,
        javascript(),
        autocompletion({ override: [p5CompletionSource] }),
        p5Theme,
        syntaxHighlighting(p5Highlight),
        p5FnPlugin,
        keymap.of([{ key: 'Ctrl-s', run: function() { return true; } }, { key: 'Cmd-s', run: function() { return true; } }]),
        EditorView.updateListener.of(function(update) {
          if (update.docChanged) {
            postCodeChange(update.state.doc.toString());
            if (typeof window.__tutEdit === 'function') window.__tutEdit();
          }
        }),
      ],
    });
    view = new EditorView({ state, parent: document.getElementById('editor') });
    if (CODE_FONT_SIZE) {
      var scroller = view.dom.querySelector('.cm-scroller');
      if (scroller) scroller.style.fontSize = CODE_FONT_SIZE + 'px';
    }
    var cmContent = view.dom.querySelector('.cm-content');
    if (cmContent) cmContent.setAttribute('inputmode', 'none');
    postReady();
    postEditorReady();
    setTimeout(function() {
      view.dom.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  } catch(e) {
    console.error('Editor init failed:', e);
    var editorEl = document.getElementById('editor');
    if (editorEl) {
      editorEl.innerHTML = '<div style="color:#ED225D;padding:16px;font-family:sans-serif">\\u26A0 Editor failed to load. Check your connection.</div>';
    }
    postReady();
    postEditorReady();
  }

function postCodeChange(code) {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'codeChange', code: code }));
  }
}

function postReady() {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  }
}

function postEditorReady() {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'editorReady', ready: !!view }));
  }
}

function postOpenRef(symbol) {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'openRef', symbol: symbol }));
  }
}

function wrapInstanceCode(code) {
  return code.replace(
    /\\bfunction\\s+(setup|draw|preload|mousePressed|mouseReleased|mouseClicked|mouseMoved|mouseDragged|mouseWheel|keyPressed|keyReleased|keyTyped|touchStarted|touchMoved|touchEnded|windowResized|doubleClicked|deviceMoved|deviceTurned|deviceShaken)\\s*\\(/g,
    'p.$1 = function('
  );
}

function renderSketch(containerId, code) {
  var container = document.getElementById(containerId);
  if (!container) return;

  if (container.__p5) {
    container.__p5.remove();
    container.__p5 = null;
  }
  container.innerHTML = '';

  if (!code) return;

  try {
    var wrapped = wrapInstanceCode(code);
    container.__p5 = new p5(function(p) {
      with(p) {
        eval(wrapped);
      }
    }, container);
  } catch(e) {
    console.error('Sketch render error:', e);
    container.innerHTML = '<div style="color:#ED225D;padding:16px;font-family:sans-serif">\\u26A0 ' + e.message + '</div>';
  }
}

function smoothScrollTo(el, duration) {
  var start = window.scrollY;
  var rect = el.getBoundingClientRect();
  var end = rect.top + start - 24;
  var distance = end - start;
  if (Math.abs(distance) < 10) { el.scrollIntoView({ behavior: 'auto', block: 'nearest' }); return; }
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var p = Math.min((ts - startTime) / duration, 1);
    var ease = 1 - Math.pow(1 - p, 3);
    window.scrollTo(0, start + distance * ease);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function normalizeCode(code) {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\*[\s\S]*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function handleMessage(data) {
  try {
    var msg = typeof data === 'string' ? JSON.parse(data) : data;
    switch (msg.type) {
      case 'setCode':
        if (view && msg.code !== view.state.doc.toString()) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: msg.code },
          });
        }
        break;
      case 'insert':
        if (view) {
          var sel = view.state.selection.main;
          view.dispatch({
            changes: { from: sel.from, to: sel.to, insert: msg.text },
            selection: { anchor: sel.from + (msg.cursorOffset !== undefined ? msg.cursorOffset : msg.text.length) },
          });
          view.focus();
        } else {
          postEditorReady();
        }
        break;
      case 'focus':
        if (view) {
          var cont = view.dom.querySelector('.cm-content');
          if (cont) cont.removeAttribute('inputmode');
          view.dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(function() { view.focus(); }, 200);
        }
        break;
      case 'setFontSize':
        var scroller = view && view.dom && view.dom.querySelector('.cm-scroller');
        if (scroller) scroller.style.fontSize = msg.fontSize + 'px';
        break;
      case 'backspace':
        if (view) {
          var sel = view.state.selection.main;
          var bsFrom = sel.from;
          var bsTo = sel.to;
          if (bsFrom < bsTo) {
            view.dispatch({
              changes: { from: bsFrom, to: bsTo },
              selection: { anchor: bsFrom },
            });
          } else if (bsFrom > 0) {
            view.dispatch({
              changes: { from: bsFrom - 1, to: bsFrom },
              selection: { anchor: bsFrom - 1 },
            });
          }
          view.focus();
        }
        break;
      case 'cursorMove':
        if (view) {
          var curPos = view.state.selection.main.head;
          switch (msg.direction) {
            case 'left':
              if (curPos > 0) view.dispatch({ selection: { anchor: curPos - 1 } });
              break;
            case 'right':
              if (curPos < view.state.doc.length) view.dispatch({ selection: { anchor: curPos + 1 } });
              break;
            case 'up':
              var curLine = view.state.doc.lineAt(curPos);
              if (curLine.number > 1) {
                var prevLine = view.state.doc.line(curLine.number - 1);
                var col = curPos - curLine.from;
                view.dispatch({ selection: { anchor: Math.min(prevLine.from + col, prevLine.to) } });
              }
              break;
            case 'down':
              var curLine2 = view.state.doc.lineAt(curPos);
              if (curLine2.number < view.state.doc.lines) {
                var nextLine = view.state.doc.line(curLine2.number + 1);
                var col2 = curPos - curLine2.from;
                view.dispatch({ selection: { anchor: Math.min(nextLine.from + col2, nextLine.to) } });
              }
              break;
          }
          view.focus();
        }
        break;
      case 'format':
        if (view) {
          view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
          indentSelection({ state: view.state, dispatch: view.dispatch });
          view.dispatch({ selection: { anchor: view.state.doc.length } });
          view.focus();
        }
        break;
      case 'runSketch':
        var userCode;
        if (view) {
          userCode = view.state.doc.toString();
        } else {
          var ta = document.getElementById('cm-fallback');
          userCode = ta ? ta.value : '';
        }
        if (!userCode) break;
        renderSketch('user-sketch', userCode);
        if (typeof window.__tutRun === 'function') window.__tutRun();
        if (SOLUTION_CODE && normalizeCode(userCode) === normalizeCode(SOLUTION_CODE)) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'exerciseComplete' }));
          }
        }
        setTimeout(function() {
          var el = document.getElementById('user-sketch');
          if (el) smoothScrollTo(el, 600);
        }, 100);
        break;

    }
  } catch(e) {
    console.error('handleMessage error:', e);
  }
}

window.addEventListener('message', function(event) { handleMessage(event.data); });
document.addEventListener('message', function(event) { handleMessage(event.data); });

document.querySelectorAll('.symbol').forEach(function(el) {
  el.addEventListener('click', function() {
    postOpenRef(el.getAttribute('data-symbol'));
  });
});

var solutionToggle = document.getElementById('solution-toggle');
if (solutionToggle) {
  solutionToggle.addEventListener('click', function() {
    var section = document.getElementById('solution-section');
    var chevron = document.getElementById('solution-chevron');
    if (section) {
      var isVisible = section.style.display !== 'none';
      section.style.display = isVisible ? 'none' : '';
      if (chevron) chevron.innerHTML = isVisible ? '&#9660;' : '&#9650;';
    }
  });
}

var copyBtn = document.getElementById('copyBtn');
if (copyBtn) {
  copyBtn.addEventListener('click', function() {
    var code = view ? view.state.doc.toString() : (document.getElementById('cm-fallback') ? document.getElementById('cm-fallback').value : '');
    if (code) {
      navigator.clipboard.writeText(code).then(function() {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(function() {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    }
  });
}

var solRunBtn = document.getElementById('solution-run-btn');
var solutionHasRun = false;
if (solRunBtn) {
  solRunBtn.addEventListener('click', function() {
    if (SOLUTION_CODE) {
      renderSketch('solution-sketch', SOLUTION_CODE);
      if (!solutionHasRun) {
        solutionHasRun = true;
        solRunBtn.innerHTML = '&#x21bb; Replay';
      }
      if (typeof window.__tutRun === 'function') window.__tutRun();
      setTimeout(function() {
        var el = document.getElementById('solution-sketch');
        if (el) smoothScrollTo(el, 600);
      }, 100);
    }
  });
}

renderSketch('user-sketch', INITIAL_CODE);
if (typeof window.__tutPreview === 'function') window.__tutPreview();

${exerciseNumber === 1 ? `
(function() {
  var TUT_KEY = 'tutorial_shapes_exercise1_done';
  if (localStorage.getItem(TUT_KEY)) return;
  var tutStep = -1;
  var ov = document.getElementById('tut-overlay');
  if (!ov) return;
  var cut = document.getElementById('tut-cutout');
  var card = document.getElementById('tut-card');
  var title = document.getElementById('tut-title');
  var body = document.getElementById('tut-body');
  var btn = document.getElementById('tut-btn');

  var steps = [
    { title: 'Welcome!', body: "Let's draw your first shape \\u2014 a pink ball on a white canvas! Tap to begin.", trigger: 'tap' },
    { title: 'Code Editor', body: 'Write your p5.js code here. Try typing or use the custom keyboard below.', trigger: 'edit', sel: '.editor-section', dir: 'above' },
    { title: 'Run Button', body: 'Press the Run button above to see your sketch output.', trigger: 'run', sel: '.preview-section', dir: 'above' },
    { title: 'Preview', body: 'Your sketch appears here. When it matches the solution, you complete the exercise!', trigger: 'preview', sel: '#user-sketch', dir: 'above' },
    { title: "You're Ready!", body: 'Now complete the exercise to continue. Good luck!', trigger: 'tap' },
  ];

  function show(i) {
    tutStep = i;
    var s = steps[i];
    title.textContent = s.title;
    body.textContent = s.body;
    ov.style.display = 'block';
    if (!s.sel) {
      card.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center';
      cut.style.display = 'none';
      btn.style.display = 'inline-block';
      btn.textContent = i === 0 ? "Let's start!" : 'Got it';
    } else {
      var el = document.querySelector(s.sel);
      if (!el) return;
      var r = el.getBoundingClientRect();
      cut.style.display = 'block';
      cut.style.top = r.top + 'px';
      cut.style.left = r.left + 'px';
      cut.style.width = r.width + 'px';
      cut.style.height = r.height + 'px';
      card.style.transform = 'none';
      card.style.textAlign = 'left';
      btn.style.display = 'none';
      if (s.dir === 'above') {
        card.style.bottom = (window.innerHeight - r.top + 12) + 'px';
        card.style.left = Math.max(16, r.left) + 'px';
        card.style.position = 'absolute';
      } else if (s.dir === 'left') {
        card.style.top = r.top + 'px';
        card.style.right = (window.innerWidth - r.left + 12) + 'px';
        card.style.position = 'absolute';
      }
    }
  }

  function next() {
    if (tutStep < 0) return;
    if (tutStep >= steps.length - 1) {
      ov.style.display = 'none';
      localStorage.setItem(TUT_KEY, '1');
      return;
    }
    show(tutStep + 1);
  }

  window.__tutEdit = function() { if (steps[tutStep] && steps[tutStep].trigger === 'edit') next(); };
  window.__tutRun = function() { if (steps[tutStep] && steps[tutStep].trigger === 'run') next(); };
  window.__tutPreview = function() { if (steps[tutStep] && steps[tutStep].trigger === 'preview') next(); };

  document.getElementById('tut-bg').addEventListener('click', function() { if (steps[tutStep] && steps[tutStep].trigger === 'tap') next(); });
  btn.addEventListener('click', next);
  show(0);
})();
` : ''}
`;
}
