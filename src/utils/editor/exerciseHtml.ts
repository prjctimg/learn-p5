import { CODEMIRROR_BUNDLE } from "./codemirror-bundle.generated";
import { p5Source } from "../p5Source";
import { P5_FUNCTION_NAMES } from "../../data/reference";
import { Colors } from "../../constants/Colors";
import { getEditorTheme, EditorThemeColors } from "./themes";
import { ExerciseTask } from "../../data/types";
import {
  JETBRAINS_MONO_REGULAR_BASE64,
  JETBRAINS_MONO_BOLD_BASE64,
} from "../../constants/fontBase64.generated";

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
  editorTheme?: string;
  codeFontSize?: number;
  ctaColor?: string;
  wordWrap?: boolean;
  tasks?: ExerciseTask[];
  activeTaskIndex?: number;
  disableSystemKeyboard?: boolean;
}): string {
  const colors = Colors[params.colorScheme === "dark" ? "dark" : "light"];
  const ctaColor = params.ctaColor ?? colors.cta;
  const cta = ctaColor;
  const ctaH = cta.replace('#', '');
  const ctaRgb = `${parseInt(ctaH.substring(0,2),16)},${parseInt(ctaH.substring(2,4),16)},${parseInt(ctaH.substring(4,6),16)}`;
  const themeColors = getEditorTheme(params.editorTheme || "p5-learn", params.colorScheme, ctaColor);
  const editorBg = themeColors.bg;
  const fontSize = params.codeFontSize ?? 22;
  const instructionHtml = parseInstructionHtml(params.instruction);
  const tasksJson = JSON.stringify(params.tasks ?? []);
  const activeTaskIdx = params.activeTaskIndex ?? 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  @font-face {
    font-family: 'JetBrains Mono';
    font-style: normal;
    font-weight: 400;
    src: url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_MONO_REGULAR_BASE64}) format('truetype');
  }
  @font-face {
    font-family: 'JetBrains Mono';
    font-style: normal;
    font-weight: 700;
    src: url(data:font/truetype;charset=utf-8;base64,${JETBRAINS_MONO_BOLD_BASE64}) format('truetype');
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { min-height: 100%; background: ${colors.surface}; font-family: "JetBrains Mono", monospace; }

  .description {
    padding: 16px;
    background: ${colors.surfaceContainer};
  }
  .description-text {
    font-size: 15px;
    line-height: 22px;
    color: ${colors.onSurfaceVariant};
    white-space: pre-line;
    /* Material 3 Fade-through: 450ms envelope, Emphasized path (path easing
       cannot be expressed as a single cubic-bezier, so we use the M3 Standard
       cubic-bezier(0.2,0,0,1) as the accepted single-curve approximation).
       Outgoing fades in the first 35% (~158ms), incoming fades + scales
       0.92→1 in the last 65% (~293ms). */
    animation-fill-mode: both;
  }
  @keyframes task-fade-through-out {
    0%   { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1); }
  }
  @keyframes task-fade-through-in {
    0%   { opacity: 0; transform: scale(0.92); }
    100% { opacity: 1; transform: scale(1); }
  }
  .task-fading-out {
    animation: task-fade-through-out 158ms cubic-bezier(0.3, 0, 0.8, 0.2) both;
  }
  .task-fading-in {
    animation: task-fade-through-in 292ms cubic-bezier(0.2, 0, 0, 1) both;
  }
  .symbol {
    font-weight: 700;
    text-decoration: underline;
    color: ${cta};
    cursor: pointer;
  }

  .preview-section {
    margin-top: 16px;
    padding: 0;
    position: relative;
  }
  .preview-label {
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${colors.onSurfaceVariant};
    margin-bottom: 8px;
  }
  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 0 16px;
  }
  .maximize-btn {
    background: ${colors.surfaceContainerHigh};
    border: 1px solid ${colors.outlineVariant};
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  .maximize-btn:active { opacity: 0.7; }
  .sketch-box {
    height: 180px;
    background: #000000;
    border-radius: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: height 0.3s ease;
  }
  .sketch-box.expanded {
    height: 400px;
    border-radius: 0;
  }
   .sketch-box canvas { display: block; touch-action: pan-y !important; }
  /* Fullscreen: cover the entire OS viewport when the sketch box is the
     active fullscreen element (HTML Fullscreen API). */
  .sketch-box:fullscreen {
    width: 100vw;
    height: 100vh;
    background: #000000;
    border-radius: 0;
  }
  .sketch-box:-webkit-full-screen {
    width: 100vw;
    height: 100vh;
    background: #000000;
    border-radius: 0;
  }
  .sketch-box:fullscreen canvas,
  .sketch-box:-webkit-full-screen canvas {
    max-width: 100%;
    max-height: 100%;
  }
  .run-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: ${ctaColor};
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
    margin-bottom: 12px;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    padding: 10px 14px;
    border-radius: 10px;
    background: ${colors.surfaceContainerHigh};
  }
  .solution-header:active { opacity: 0.7; }

  .editor-section {
    margin-top: 20px;
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: hidden;
    background: ${editorBg};
    min-height: 120px;
    position: relative;
    display: flex;
    flex-direction: column;
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
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${colors.onSurfaceVariant};
  }
  .lang-tag {
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${cta};
    background: rgba(${ctaRgb}, 0.12);
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
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .editor-header-btn:active {
    background: ${colors.primaryContainer}44;
  }
  .cm-editor { height: 100%; font-size: ${fontSize}px; background: ${editorBg}; }
  .cm-editor .cm-scroller { font-family: 'JetBrains Mono', monospace; overflow: auto; max-height: ${Math.round(fontSize * 1.6 * 20)}px; }
  #editor { display: flex; flex-direction: column; max-height: ${Math.round(fontSize * 1.6 * 20)}px; }
  .cm-editor.cm-focused { outline: none; }
  .cm-editor .cm-cursor { display: block !important; }
  .cm-editor .cm-gutters { background: ${editorBg}; border-right: 1px solid ${params.colorScheme === 'dark' ? '#292A2E' : '#E5E7EB'}; color: ${params.colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}; }
  .cm-editor .cm-activeLineGutter { background: ${params.colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}; }
  .cm-editor .cm-activeLine { background: ${params.colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}; }
  .cm-editor .cm-selectionBackground,
  .cm-editor.cm-focused .cm-selectionBackground { background: ${params.colorScheme === 'dark' ? 'rgba(255, 105, 180, 0.2)' : 'rgba(255, 105, 180, 0.15)'} !important; }
  .cm-editor .cm-matchingBracket {
    background: rgba(255, 105, 180, 0.3);
  }
  body { padding-bottom: 16px; }

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
    border-radius: 14px;
    padding: 20px 24px;
    max-width: 320px;
    font-family: "JetBrains Mono", monospace;
    font-size: 14px;
    line-height: 22px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.25);
    z-index: 10000;
  }
  .tut-card-title {
    font-family: "JetBrains Mono", monospace;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${colors.primary};
    margin-bottom: 8px;
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
    margin-top: 12px;
    background: ${ctaColor};
    color: ${colors.onPrimary};
    border: none;
    border-radius: 8px;
    padding: 8px 20px;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
  }
  ` : ''}
</style>
</head>
<body>

<div class="description">
  <div class="description-text">${instructionHtml}</div>
</div>

${
  params.solution
    ? `<div class="solution-section" id="solution-section">
  <button class="solution-header" id="solution-toggle">
    <span class="preview-label" style="margin-bottom:0; font-size:13px; letter-spacing:0.8px; color:${colors.onSurface}">Target Solution</span>
    <span class="solution-chevron" id="solution-chevron" style="font-size:14px; color:${colors.onSurfaceVariant}">&#9650;</span>
  </button>
  <div id="solution-content">
    <div style="position:relative">
      <div id="solution-sketch" class="sketch-box"></div>
      <button id="solution-run-btn" class="run-btn">&#9654; Run</button>
    </div>
  </div>
</div>`
    : ""
}

<div class="preview-section">
  <div class="preview-header">
    <div class="preview-label">Your Output</div>
    <button class="maximize-btn" id="maximize-btn" title="Toggle fullscreen preview">
      <span id="maximize-icon" style="font-size:16px; color:${colors.onSurfaceVariant}">&#x26F6;</span>
    </button>
  </div>
  <div id="user-sketch" class="sketch-box"></div>
</div>

<div class="editor-section">
  <div class="editor-header">
    <div class="editor-header-left">
      <span class="lang-tag">JS</span>
    </div>
    <div class="editor-header-right">
      <button class="editor-header-btn" id="resetBtn">Reset</button>
      <button class="editor-header-btn" id="copyBtn">Copy</button>
    </div>
  </div>
  <div id="editor"></div>
</div>


<script>${p5Source}</script>
<script>${CODEMIRROR_BUNDLE}</script>
<script>
 ${getBridgeScript(params.startingCode, params.solution, themeColors, params.colorScheme, params.exerciseNumber, ctaColor, params.wordWrap, tasksJson, activeTaskIdx, params.disableSystemKeyboard)}
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

function getBridgeScript(startingCode: string, solution: string, theme: EditorThemeColors, colorScheme: "light" | "dark", exerciseNumber?: number, ctaColor?: string, wordWrap?: boolean, tasksJson?: string, activeTaskIdx?: number, disableSystemKeyboard?: boolean): string {
  const codeArg = jsString(startingCode);
  const solutionArg = jsString(solution);
  const cta = ctaColor ?? '#FF69B4';
  const ctaH = cta.replace('#', '');
  const ctaRgb = `${parseInt(ctaH.substring(0,2),16)},${parseInt(ctaH.substring(2,4),16)},${parseInt(ctaH.substring(4,6),16)}`;

  const {
    bg: editorBg,
    fg,
    gutterFg,
    gutterBorder,
    activeBg,
    selBg,
    keyword: kwColor,
    string: strColor,
    number: numColor,
    comment: commentColor,
    type: typeColor,
    function: fnColor,
    operator: opColor,
    constant: constColor,
  } = theme;

  return `
var _CM = typeof CM !== 'undefined' ? CM : null;
if (!_CM) {
  var editorEl = document.getElementById('editor');
  if (editorEl) editorEl.innerHTML = '<div style="color:#FF4444;padding:16px;font-family:monospace">\\u26A0 CodeMirror failed to load. Run: npm run bundle-editor</div>';
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'editorReady', ready: false }));
  }
  throw new Error('CodeMirror bundle not loaded — run: npm run bundle-editor');
}
var basicSetup = _CM.basicSetup;
var EditorView = _CM.EditorView;
var EditorState = _CM.EditorState;
var keymap = _CM.keymap;
var syntaxHighlighting = _CM.syntaxHighlighting;
var HighlightStyle = _CM.HighlightStyle;
var javascript = _CM.javascript;
var tags = _CM.tags;
var indentSelection = _CM.indentSelection;
var syntaxTree = _CM.syntaxTree;
var ViewPlugin = _CM.ViewPlugin;
var Decoration = _CM.Decoration;
var autocompletion = _CM.autocompletion;
var CompletionContext = _CM.CompletionContext;
var lineWrapping = _CM.EditorView.lineWrapping;
var prettierLib = _CM.prettier;
var prettierEstree = _CM.prettierPluginEstree;
var prettierAcorn = _CM.prettierPluginAcorn;

var WORD_WRAP = ${wordWrap ?? false};

let view;
const INITIAL_CODE = ${codeArg};
const SOLUTION_CODE = ${solutionArg};
const VALIDATION_RULES = [];
const TASKS = ${tasksJson};
var ACTIVE_TASK_INDEX = ${activeTaskIdx};
var P5_COMPLETIONS = ${JSON.stringify(P5_FUNCTION_NAMES)};

function p5CompletionSource(context) {
  var word = context.matchBefore(/\\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  var options = [];
  var prefix = word.text.toLowerCase();
  for (var i = 0; i < P5_COMPLETIONS.length; i++) {
    (function() {
      var name = P5_COMPLETIONS[i];
      if (name.toLowerCase().startsWith(prefix)) {
        options.push({
          label: name + '()',
          type: 'function',
          detail: 'p5.js',
          apply: function(view, completion, from, to) {
            var rest = view.state.doc.sliceString(to, to + 2);
            var hasParens = rest === '()';
            view.dispatch({
              changes: { from: from, to: to, insert: hasParens ? name : name + '()' },
              selection: { anchor: from + (hasParens ? name.length : name.length + 1) }
            });
          }
        });
      }
    })();
  }
  return { from: word.from, options: options };
}

const p5FnMark = Decoration.mark({ class: 'cm-p5-fn' });

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
  return Decoration.set(decos, true);
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

var p5Theme = EditorView.theme({
  '&': { backgroundColor: '${editorBg}', color: '${fg}' },
  '.cm-content': { caretColor: '${cta}', fontFamily: "'JetBrains Mono', monospace" },
  '.cm-gutters': { backgroundColor: '${editorBg}', color: '${gutterFg}', borderRight: '1px solid ${gutterBorder}' },
  '.cm-activeLineGutter': { backgroundColor: '${activeBg}' },
  '.cm-activeLine': { backgroundColor: '${activeBg}' },
  '.cm-cursor': { borderLeft: '2px solid ${cta}', animation: 'cm-blink 1s step-end infinite' },
  '@keyframes cm-blink': { '50%': { borderLeftColor: 'transparent' } },
  '.cm-selectionBackground': { backgroundColor: '${selBg}' },
  '.cm-matchingBracket': { backgroundColor: 'rgba(${ctaRgb}, 0.3)' },
  '.cm-p5-fn': { fontWeight: '600' },
});

var p5Highlight = HighlightStyle.define([
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

function getExtensions() {
  var exts = [
    basicSetup,
    javascript(),
    p5Theme,
    syntaxHighlighting(p5Highlight),
    p5FnPlugin,
    autocompletion({ override: [p5CompletionSource] }),
    keymap.of([{ key: 'Ctrl-s', run: function() { return true; } }, { key: 'Cmd-s', run: function() { return true; } }]),
    EditorView.updateListener.of(function(update) {
      if (update.docChanged) {
        postCodeChange(update.state.doc.toString());
        if (typeof window.__tutEdit === 'function') window.__tutEdit();
      }
    }),
  ];
  if (WORD_WRAP && lineWrapping) { exts.push(lineWrapping); }
  return exts;
}

function applyEditorMaxHeight() {
  if (!view || !view.defaultLineHeight) return;
  var lh = view.defaultLineHeight;
  var maxH = Math.round(lh * 20) + 'px';
  var editorEl = document.getElementById('editor');
  if (editorEl) editorEl.style.maxHeight = maxH;
  var scroller = document.querySelector('.cm-scroller');
  if (scroller) scroller.style.maxHeight = maxH;
}

function initEditorView(code) {
  const state = EditorState.create({
    doc: code || '',
    extensions: getExtensions(),
  });
  view = new EditorView({ state, parent: document.getElementById('editor') });
  applyEditorMaxHeight();
  view.dom.addEventListener('mousedown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var coords = { x: e.clientX, y: e.clientY };
    var pos = view.posAtCoords(coords);
    if (pos !== null) {
      view.dispatch({ selection: { anchor: pos, head: pos } });
    }
    view.focus();
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'editorTapped' }));
    }
  });
  var touchStartY = 0;
  var touchStartX = 0;
  var isScrolling = false;
  view.dom.addEventListener('touchstart', function(e) {
    var touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isScrolling = false;
  }, { passive: true });
  view.dom.addEventListener('touchmove', function(e) {
    if (!isScrolling) {
      var touch = e.touches[0];
      var dx = Math.abs(touch.clientX - touchStartX);
      var dy = Math.abs(touch.clientY - touchStartY);
      if (dy > 10 || dx > 10) {
        isScrolling = true;
      }
    }
  }, { passive: true });
  view.dom.addEventListener('touchend', function(e) {
    if (!isScrolling) {
      e.preventDefault();
      e.stopPropagation();
      var touch = e.changedTouches[0];
      var coords = { x: touch.clientX, y: touch.clientY };
      var pos = view.posAtCoords(coords);
      if (pos !== null) {
        view.dispatch({ selection: { anchor: pos, head: pos } });
      }
      view.focus();
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'editorTapped' }));
      }
    }
  }, { passive: false });
}

function initEditor() {
  try {
    initEditorView(INITIAL_CODE);
    var cmContent = document.querySelector('.cm-content');
    if (cmContent && view && view.defaultLineHeight) {
      var lh = view.defaultLineHeight;
      var maxH = Math.round(lh * 20) + 'px';
      var editorEl = document.getElementById('editor');
      if (editorEl) editorEl.style.maxHeight = maxH;
      var scroller = document.querySelector('.cm-scroller');
      if (scroller) scroller.style.maxHeight = maxH;
    }
    if (${disableSystemKeyboard ? 'true' : 'false'}) {
      var cmContent = document.querySelector('.cm-content');
      if (cmContent) cmContent.setAttribute('inputmode', 'none');
    }
    postReady();
    postEditorReady();
    setTimeout(function() {
      if (view) {
        view.focus();
        view.dom.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 300);
  } catch(e) {
    console.error('Editor init failed:', e);
    var editorEl = document.getElementById('editor');
    if (editorEl) {
      editorEl.innerHTML = '<div style="color:${cta};padding:16px;font-family:\\"JetBrains Mono\\",monospace">\\u26A0 Editor failed to load. Check your connection.</div>';
    }
    postReady();
    postEditorReady();
  }
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

async function renderSketch(containerId, code) {
  var container = document.getElementById(containerId);
  if (!container) return;

  if (container.__p5) {
    try {
      await Promise.race([
        container.__p5.remove(),
        new Promise(function(_, reject) { setTimeout(function() { reject(new Error('p5 remove timeout')); }, 1000); })
      ]);
    } catch (e) { console.error('Error removing p5 instance:', e); }
    container.__p5 = null;
  }
  container.innerHTML = '';

  if (!code) return;

  var tagId = 'sketch-script-' + containerId;
  var oldScript = document.getElementById(tagId);
  if (oldScript) oldScript.remove();

  delete window.setup;
  delete window.draw;

  var script = document.createElement('script');
  script.id = tagId;
  script.textContent = code;
  document.body.appendChild(script);

  try {
    container.__p5 = new p5(undefined, container);
    var cnv = container.querySelector('canvas');
    if (cnv) {
      cnv.style.touchAction = 'pan-y';
      cnv.onwheel = null;
    }
  } catch(e) {
    console.error('Sketch render error:', e);
    container.innerHTML = '<div style="color:${cta};padding:16px;font-family:\\"JetBrains Mono\\",monospace">\\u26A0 ' + e.message + '</div>';
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'sketchError', error: e.message, container: containerId }));
    }
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
      case 'setActiveTask':
        ACTIVE_TASK_INDEX = typeof msg.taskIndex === 'number' ? msg.taskIndex : 0;
        // Replace the editor document with the next task's starter code so the
        // codeblock resets across task transitions (rather than persisting the
        // previous task's editor contents). Done inside the fade-out handler
        // so the swap lands during the opacity dip (no visible flash).
        var applyTaskCode = function() {
          if (msg.code != null && view && msg.code !== view.state.doc.toString()) {
            view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: msg.code } });
          }
        };
        if (msg.instructionHtml || msg.instruction) {
          var descEl = document.querySelector('.description-text');
          if (descEl) {
            // Material 3 Fade through: outgoing fades out (~158ms), then the
            // content swaps and the incoming panel fades + scales up. If
            // the element is mid-transition (re-entrant setActiveTask) we
            // cancel and restart cleanly.
            if (descEl.classList.contains('task-fading-out') || descEl.classList.contains('task-fading-in')) {
              descEl.classList.remove('task-fading-out', 'task-fading-in');
              applyTaskCode();
              descEl.innerHTML = msg.instructionHtml || msg.instruction;
              descEl.classList.add('task-fading-in');
              return;
            }
            descEl.classList.add('task-fading-out');
            descEl.addEventListener('animationend', function fadeOutHandler(e) {
              if (e.animationName !== 'task-fade-through-out') return;
              descEl.removeEventListener('animationend', fadeOutHandler);
              descEl.classList.remove('task-fading-out');
              applyTaskCode();
              descEl.innerHTML = msg.instructionHtml || msg.instruction;
              // Re-bind symbol taps for the freshly-swapped instruction.
              descEl.querySelectorAll('.symbol').forEach(function(sym) {
                sym.addEventListener('click', function() {
                  postOpenRef(sym.getAttribute('data-symbol'));
                });
              });
              descEl.classList.add('task-fading-in');
              descEl.addEventListener('animationend', function fadeInHandler(e2) {
                if (e2.animationName !== 'task-fade-through-in') return;
                descEl.removeEventListener('animationend', fadeInHandler);
                descEl.classList.remove('task-fading-in');
              });
            });
          }
        } else {
          // No instruction update; still apply the code reset.
          applyTaskCode();
        }
        break;
      case 'insert':
        if (view) {
          var sel = view.state.selection.main;
          var cursor = sel.head;
          var insertText = msg.text;
          var offset = msg.cursorOffset !== undefined ? msg.cursorOffset : insertText.length;
          if (sel.from !== sel.to) {
            view.dispatch({
              changes: { from: sel.from, to: sel.to, insert: insertText },
              selection: { anchor: sel.from + offset },
            });
          } else {
            view.dispatch({
              changes: { from: cursor, insert: insertText },
              selection: { anchor: cursor + offset },
            });
          }
          view.focus();
        } else {
          postEditorReady();
        }
        break;
      case 'focus':
        if (view) {
          view.focus();
        }
        break;
      case 'setFontSize':
        var scroller = view && view.dom && view.dom.querySelector('.cm-scroller');
        if (scroller) scroller.style.fontSize = msg.fontSize + 'px';
        applyEditorMaxHeight();
        break;
      case 'setWordWrap':
        if (view && msg.wordWrap !== WORD_WRAP) {
          WORD_WRAP = msg.wordWrap;
          var savedDoc = view.state.doc.toString();
          var savedSel = view.state.selection.main.head;
          try {
            view.destroy();
            view = new EditorView({
              state: EditorState.create({
                doc: savedDoc,
                extensions: getExtensions(),
              }),
              parent: document.getElementById('editor'),
            });
            view.dispatch({ selection: { anchor: savedSel, head: savedSel } });
            view.focus();
            applyEditorMaxHeight();
          } catch (err) {
            // A plugin failure during reconstruction must not wedge the
            // WebView permanently. Roll back the flag and attempt a bare
            // recovery so the user can keep editing.
            console.warn('setWordWrap rebuild failed:', err);
            WORD_WRAP = !msg.wordWrap;
            if (!view) {
              try {
                view = new EditorView({
                  state: EditorState.create({ doc: savedDoc, extensions: getExtensions() }),
                  parent: document.getElementById('editor'),
                });
              } catch (e2) { console.warn('setWordWrap recovery failed:', e2); }
            }
          }
          if (${disableSystemKeyboard ? 'true' : 'false'}) {
            var cmContent2 = document.querySelector('.cm-content');
            if (cmContent2) cmContent2.setAttribute('inputmode', 'none');
          }
        }
        break;
      case 'backspace':
        if (view) {
          var cur = view.state.selection.main.head;
          var sel = view.state.selection.main;
          if (sel.from !== sel.to) {
            view.dispatch({
              changes: { from: sel.from, to: sel.to },
              selection: { anchor: sel.from },
            });
          } else if (cur > 0) {
            view.dispatch({
              changes: { from: cur - 1, to: cur },
              selection: { anchor: cur - 1 },
            });
          }
          view.focus();
        }
        break;
      case 'cursorMove':
        if (view) {
          var dir = msg.direction;
          var sel = view.state.selection.main;
          var pos = sel.head;
          var doc = view.state.doc;
          if (dir === 'left' && pos > 0) {
            pos = pos - 1;
          } else if (dir === 'right' && pos < doc.length) {
            pos = pos + 1;
          } else if (dir === 'up' || dir === 'down') {
            var line = doc.lineAt(pos);
            var lineNum = line.number;
            var col = pos - line.from;
            var targetLineNum = dir === 'up' ? lineNum - 1 : lineNum + 1;
            if (targetLineNum >= 1 && targetLineNum <= doc.lines) {
              var targetLine = doc.line(targetLineNum);
              pos = Math.min(targetLine.from + col, targetLine.to);
            }
          }
          view.dispatch({
            selection: { anchor: pos, head: pos },
            scrollIntoView: true,
          });
          view.focus();
        }
        break;
      case 'format':
        if (view) {
          try {
            var codeToFormat = view.state.doc.toString();
            // Use mobile-friendly printWidth (60) for better readability on small screens
            var pw = 60;
            if (typeof prettierLib !== 'undefined' && prettierLib.format) {
              prettierLib.format(codeToFormat, {
                parser: 'acorn',
                plugins: [prettierEstree, prettierAcorn],
                printWidth: pw,
                semi: true,
                singleQuote: false,
                trailingComma: 'es5',
                bracketSpacing: true,
                arrowParens: 'avoid',
                endOfLine: 'lf',
              }).then(function(formatted) {
                // Also strip trailing whitespace from each line
                var lines = formatted.split('\\n');
                var cleaned = lines.map(function(line) { return line.replace(/\\s+$/, ''); }).join('\\n');
                if (cleaned !== codeToFormat) {
                  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: cleaned } });
                }
                view.focus();
              }).catch(function() { view.focus(); });
            } else {
              view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
              indentSelection({ state: view.state, dispatch: view.dispatch });
              view.dispatch({ selection: { anchor: view.state.doc.length } });
              view.focus();
            }
          } catch(e) { view.focus(); }
        }
        break;
      case 'runSketch':
        if (!view) { console.error('Editor not initialized'); break; }
        var userCode = view.state.doc.toString();
        if (!userCode || !userCode.trim()) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'validationFailed', reason: 'Editor is empty — write some code first' }));
          }
          break;
        }
        renderSketch('user-sketch', userCode).then(function() {
          if (typeof window.__tutRun === 'function') window.__tutRun();

          function stripIgnoredRegions(src) {
            var out = '';
            var i = 0;
            var n = src.length;
            while (i < n) {
              var c2 = src[i];
              var c3 = src[i + 1];
              if (c2 === '/' && c3 === '/') {
                while (i < n && src[i] !== '\\n') i++;
                continue;
              }
              if (c2 === '/' && c3 === '*') {
                i += 2;
                while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
                i += 2;
                continue;
              }
              if (c2 === '"' || c2 === '\\'' || c2 === '\`') {
                var quote = c2;
                out += c2;
                i++;
                while (i < n) {
                  if (src[i] === '\\\\') { out += src[i]; if (i + 1 < n) { out += src[i + 1]; } i += 2; continue; }
                  if (src[i] === quote) { out += src[i]; i++; break; }
                  out += src[i]; i++;
                }
                continue;
              }
              out += c2;
              i++;
            }
            return out;
          }
          function findCallArgsList(sanitized, startIdx) {
            var i2 = startIdx;
            while (i2 < sanitized.length && sanitized[i2] !== '(') i2++;
            if (sanitized[i2] !== '(') return null;
            var depth = 0;
            var argStart = i2 + 1;
            var args = [];
            for (var j = i2; j < sanitized.length; j++) {
              var ch = sanitized[j];
              if (ch === '(') depth++;
              else if (ch === ')') {
                depth--;
                if (depth === 0) {
                  var raw = sanitized.slice(argStart, j);
                  if (raw.trim().length > 0) args.push(raw);
                  return args;
                }
              } else if (ch === ',' && depth === 1) {
                args.push(sanitized.slice(argStart, j));
                argStart = j + 1;
              }
            }
            return null;
          }
          function findCallsByName(code, name) {
            var sanitized = stripIgnoredRegions(code);
            var calls = [];
            var nameRe = new RegExp('\\\\b' + name + '\\\\b', 'g');
            var m;
            var idxs = [];
            while ((m = nameRe.exec(sanitized)) !== null) { idxs.push(m.index + m[0].length); }
            for (var k = 0; k < idxs.length; k++) {
              var argList = findCallArgsList(sanitized, idxs[k]);
              if (argList !== null) {
                calls.push(argList.map(function(a) { return a.trim(); }).filter(function(a) { return a.length > 0; }));
              }
            }
            return calls;
          }
          function normalizeForCompare(src) {
            var stripped = stripIgnoredRegions(src);
            return stripped.replace(/\\s+/g, ' ').trim();
          }
          function codeMatchesSolution(userCode, solutionCode) {
            if (!solutionCode) return true;
            return normalizeForCompare(userCode) === normalizeForCompare(solutionCode);
          }
          function validateSync(code, rules) {
            for (var ri = 0; ri < rules.length; ri++) {
              var rule = rules[ri];
              if (rule.type === 'functionCall') {
                var matches = findCallsByName(code, rule.name);
                if (matches.length === 0) return { passed: false, reason: 'Add a ' + rule.name + '() call' };
                if (rule.exactArgs !== undefined) {
                  var hasCorrect = false;
                  for (var mi = 0; mi < matches.length; mi++) {
                    if (matches[mi].length === rule.exactArgs) { hasCorrect = true; break; }
                  }
                  if (!hasCorrect) return { passed: false, reason: rule.name + '() needs ' + rule.exactArgs + ' arguments' };
                }
                if (rule.minArgs !== undefined) {
                  var hasMin = false;
                  for (var mi2 = 0; mi2 < matches.length; mi2++) {
                    if (matches[mi2].length >= rule.minArgs) { hasMin = true; break; }
                  }
                  if (!hasMin) return { passed: false, reason: rule.name + '() needs at least ' + rule.minArgs + ' arguments' };
                }
              } else if (rule.type === 'functionExists') {
                var fnRe = new RegExp('\\b' + rule.name + '\\s*[=:]\\s*function|function\\s+' + rule.name + '\\s*\\(', 'g');
                if (!fnRe.test(code)) return { passed: false, reason: 'Define a ' + rule.name + '() function' };
              } else if (rule.type === 'canvasSize') {
                var canvasRe = /createCanvas\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g;
                var canvasMatch = canvasRe.exec(code);
                if (!canvasMatch) return { passed: false, reason: 'Use createCanvas() to set canvas size' };
                var w = parseInt(canvasMatch[1], 10);
                var h = parseInt(canvasMatch[2], 10);
                if (w !== rule.width || h !== rule.height) return { passed: false, reason: 'Canvas should be ' + rule.width + 'x' + rule.height };
              }
            }
            return { passed: true, reason: '' };
          }

          var syncResult = { passed: false, reason: '' };
          var hasPixelRules = false;
          var activeRules = TASKS.length > 0 && TASKS[ACTIVE_TASK_INDEX]
            ? (TASKS[ACTIVE_TASK_INDEX].validation || [])
            : [];
          try {
            if (activeRules.length > 0) {
              var nonPixelRules = activeRules.filter(function(r) { return r.type !== 'pixelMatch' && r.type !== 'expectedPixels'; });
              hasPixelRules = activeRules.some(function(r) { return r.type === 'pixelMatch' || r.type === 'expectedPixels'; });
              syncResult = validateSync(userCode, nonPixelRules);
            } else if (SOLUTION_CODE) {
              syncResult = { passed: codeMatchesSolution(userCode, SOLUTION_CODE), reason: '' };
            } else {
              syncResult = { passed: true, reason: '' };
            }
          } catch(ve) { console.error('Validation error:', ve); }

          if (!syncResult.passed) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'validationFailed', reason: syncResult.reason }));
            }
            return;
          }

          if (!hasPixelRules) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              if (TASKS.length > 0 && ACTIVE_TASK_INDEX < TASKS.length - 1) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'taskComplete', taskIndex: ACTIVE_TASK_INDEX }));
              } else {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'exerciseComplete' }));
              }
            }
            return;
          }

          var pixelMatches = activeRules.filter(function(r) { return r.type === 'pixelMatch'; });
          var expectedPixelsRules = activeRules.filter(function(r) { return r.type === 'expectedPixels'; });
          function postValidationFailed(reason) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'validationFailed', reason: reason }));
            }
          }
          function postSuccess() {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              if (TASKS.length > 0 && ACTIVE_TASK_INDEX < TASKS.length - 1) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'taskComplete', taskIndex: ACTIVE_TASK_INDEX }));
              } else {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'exerciseComplete' }));
              }
            }
          }
          function waitForFrame(p5Inst, cb) {
            var start = Date.now();
            function check() {
              var fc = 0;
              try { fc = typeof p5Inst.frameCount === 'function' ? p5Inst.frameCount() : p5Inst.frameCount; } catch(e) {}
              if (fc > 0) { cb(true); return; }
              if (Date.now() - start > 2000) { cb(false); return; }
              if (typeof requestAnimationFrame === 'function') { requestAnimationFrame(check); } else { setTimeout(check, 32); }
            }
            check();
          }
          function sampleAllPoints(p5Instance) {
            var cnv = p5Instance.canvas;
            if (!cnv) { postValidationFailed('Canvas not found'); return false; }
            var ctx = cnv.getContext('2d');
            if (!ctx) { postValidationFailed('Cannot read canvas pixels'); return false; }
            var d = (p5Instance.width && cnv.width) ? (cnv.width / p5Instance.width) : 1;
            function checkPoint(pt) {
              var tol = pt.tolerance !== undefined ? pt.tolerance : 30;
              var px = Math.min(Math.max(0, Math.floor(pt.x * d)), cnv.width - 1);
              var py = Math.min(Math.max(0, Math.floor(pt.y * d)), cnv.height - 1);
              var dat = ctx.getImageData(px, py, 1, 1).data;
              var rDiff = Math.abs(dat[0] - pt.expected[0]);
              var gDiff = Math.abs(dat[1] - pt.expected[1]);
              var bDiff = Math.abs(dat[2] - pt.expected[2]);
              return (rDiff <= tol && gDiff <= tol && bDiff <= tol);
            }
            for (var pi = 0; pi < pixelMatches.length; pi++) {
              var pr = pixelMatches[pi];
              if (!checkPoint(pr)) {
                var px2 = Math.min(Math.max(0, Math.floor(pr.x * d)), cnv.width - 1);
                var py2 = Math.min(Math.max(0, Math.floor(pr.y * d)), cnv.height - 1);
                var d2 = ctx.getImageData(px2, py2, 1, 1).data;
                postValidationFailed('Color at (' + pr.x + ',' + pr.y + ') is wrong — expected rgb(' + pr.expected.join(',') + ') but got rgb(' + d2[0] + ',' + d2[1] + ',' + d2[2] + ')');
                return false;
              }
            }
            for (var ei = 0; ei < expectedPixelsRules.length; ei++) {
              var er = expectedPixelsRules[ei];
              var pts = er.points || [];
              if (pts.length === 0) continue;
              var passed = 0;
              for (var pi2 = 0; pi2 < pts.length; pi2++) {
                if (checkPoint(pts[pi2])) passed++;
              }
              var minFrac = er.minPassFraction !== undefined ? er.minPassFraction : 0.9;
              if (passed / pts.length < minFrac) {
                postValidationFailed('Sketch output does not match (' + passed + '/' + pts.length + ' pixels matched)');
                return false;
              }
            }
            return true;
          }
          var frameContainer = document.getElementById('user-sketch');
          if (!frameContainer || !frameContainer.__p5) {
            postValidationFailed('Sketch did not render');
            return;
          }
          waitForFrame(frameContainer.__p5, function(rendered) {
            if (!rendered) { postValidationFailed('Sketch did not render in time — try again'); return; }
            try {
              if (sampleAllPoints(frameContainer.__p5)) postSuccess();
            } catch(e) {
              console.error('Pixel validation error:', e);
              postValidationFailed('Could not verify sketch output');
            }
          });

          if (typeof prettierLib !== 'undefined' && prettierLib.format) {
            var postCode = view.state.doc.toString();
            var pw2 = 60;
            prettierLib.format(postCode, { parser: 'acorn', plugins: [prettierEstree, prettierAcorn], printWidth: pw2, semi: true, singleQuote: false, trailingComma: 'es5', bracketSpacing: true, arrowParens: 'avoid', endOfLine: 'lf' }).then(function(formatted) {
              var lines = formatted.split('\\n');
              var cleaned = lines.map(function(line) { return line.replace(/\\s+$/, ''); }).join('\\n');
              if (cleaned !== postCode) {
                view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: cleaned } });
              }
            }).catch(function() {});
          }
          setTimeout(function() {
            var el = document.getElementById('user-sketch');
            if (el) smoothScrollTo(el, 600);
          }, 100);
        }).catch(function(e) { console.error('Render error:', e); });
        break;

      case 'editorReady':
        postEditorReady();
        break;

    }
  } catch(e) {
    console.error('handleMessage error:', e);
  }
}

function handleMessageEvent(event) { handleMessage(event.data); }
window.addEventListener('message', handleMessageEvent);
document.addEventListener('message', handleMessageEvent);

(function() {
  var lastScrollY = window.scrollY || 0;
  var scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      requestAnimationFrame(function() {
        var currentY = window.scrollY || 0;
        var diff = currentY - lastScrollY;
        if (Math.abs(diff) > 10) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: diff > 0 ? 'scrollDown' : 'scrollUp' }));
          }
          lastScrollY = currentY;
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
})();

document.querySelectorAll('.symbol').forEach(function(el) {
  el.addEventListener('click', function() {
    postOpenRef(el.getAttribute('data-symbol'));
  });
});

var solutionToggle = document.getElementById('solution-toggle');
if (solutionToggle) {
  solutionToggle.addEventListener('click', function() {
    var content = document.getElementById('solution-content');
    var chevron = document.getElementById('solution-chevron');
    if (content) {
      var isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : '';
      if (chevron) chevron.innerHTML = isVisible ? '&#9660;' : '&#9650;';
    }
  });
}

var maximizeBtn = document.getElementById('maximize-btn');
function setMaximizeIcon(isExpanded) {
  var icon = document.getElementById('maximize-icon');
  if (icon) icon.innerHTML = isExpanded ? '&#x2715;' : '&#x26F6;';
}
if (maximizeBtn) {
  maximizeBtn.addEventListener('click', function() {
    var sketch = document.getElementById('user-sketch');
    var el = sketch;
    var fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement;
    var isExpanded = !!fsElement || (sketch && sketch.classList.contains('expanded'));
    if (isExpanded) {
      if (document.exitFullscreen) { document.exitFullscreen().catch(function(){}); }
      else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
      if (sketch) sketch.classList.remove('expanded');
      setMaximizeIcon(false);
    } else if (el) {
      var req = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen;
      if (req) {
        var p = req.call(el);
        if (p && p.catch) p.catch(function(){});
        el.classList.add('expanded');
      } else {
        // Fullscreen API unavailable (older WebView) — fall back to the
        // inline expanded box so the control still does something useful.
        el.classList.add('expanded');
        setTimeout(function() { smoothScrollTo(el, 300); }, 350);
      }
      setMaximizeIcon(true);
    }
  });
}
// Keep the toggle icon in sync if the user exits fullscreen via Esc/back.
function onFsChange() {
  var fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement;
  var sketch = document.getElementById('user-sketch');
  if (sketch) {
    if (fsElement) { sketch.classList.add('expanded'); setMaximizeIcon(true); }
    else { sketch.classList.remove('expanded'); setMaximizeIcon(false); }
  }
}
document.addEventListener('fullscreenchange', onFsChange);
document.addEventListener('webkitfullscreenchange', onFsChange);
document.addEventListener('webkitcurrentfullscreenchange', onFsChange);

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function(resolve, reject) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch(e) {
      reject(e);
    }
    document.body.removeChild(ta);
  });
}

var resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', function() {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'resetCode' }));
    }
  });
}

var copyBtn = document.getElementById('copyBtn');
if (copyBtn) {
  copyBtn.addEventListener('click', function() {
    if (view) {
      var code = view.state.doc.toString();
      copyToClipboard(code).then(function() {
        copyBtn.innerHTML = '<span style="color:#22C55E">&#10003;</span> Copied';
        copyBtn.style.backgroundColor = '#22C55E22';
        copyBtn.style.borderColor = '#22C55E';
        copyBtn.style.color = '#22C55E';
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'codeCopied' }));
        }
        setTimeout(function() {
          copyBtn.innerHTML = 'Copy';
          copyBtn.style.backgroundColor = '';
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
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
    if (view && SOLUTION_CODE) {
      renderSketch('solution-sketch', SOLUTION_CODE).then(function() {
        setTimeout(function() {
          var el = document.getElementById('solution-sketch');
          if (el) smoothScrollTo(el, 600);
        }, 100);
      }).catch(function(e) { console.error('Solution render error:', e); });
      if (!solutionHasRun) {
        solutionHasRun = true;
        solRunBtn.innerHTML = '<span style="font-size:1.3em">&#x21bb;</span> Replay';
      }
      if (typeof window.__tutRun === 'function') window.__tutRun();
    }
  });
}

initEditor();
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
    { title: 'Welcome!', body: "Let's draw your first shape \\u2014 a pink ball on a white canvas! This exercise will walk you through the interface.", trigger: 'tap', btnLabel: "Let's go!" },
    { title: 'Code Editor', body: 'This is where you write your p5.js code. The code below already draws a circle — try running it first!', trigger: 'edit', sel: '.editor-section', dir: 'above' },
    { title: 'Run Button', body: 'Tap the Run button to execute your code and see the result in the preview area.', trigger: 'run', sel: '.preview-section', dir: 'above' },
    { title: 'Preview', body: 'Your sketch renders here. When your output matches the target solution, you complete the exercise!', trigger: 'preview', sel: '#user-sketch', dir: 'above' },
    { title: "You're Ready!", body: 'The code already solves this exercise — tap Run to complete it. Try modifying the values to explore!', trigger: 'tap', btnLabel: 'Got it' },
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
      btn.textContent = s.btnLabel || (i === 0 ? "Let's start!" : 'Got it');
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
