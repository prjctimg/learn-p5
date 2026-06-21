import { importMap } from "./importmap";
import { p5Source } from "../p5Source";
import { P5_FUNCTION_NAMES } from "../../data/p5Symbols";
import { Colors } from "../../constants/Colors";

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
}): string {
  const colors = Colors[params.colorScheme === "dark" ? "dark" : "light"];
  const editorBg = params.codeBackground || colors.surfaceContainerLowest;
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
  }
  .sketch-box canvas { display: block; }

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
    margin-top: 16px;
    margin-left: 16px;
    margin-right: 16px;
    border-radius: 8px;
    overflow: hidden;
    background: ${editorBg};
    min-height: 400px;
    position: relative;
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
  .scroll-whitespace {
    height: 700px;
  }
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
  <div id="solution-sketch" class="sketch-box"></div>
</div>`
    : ""
}

<div class="preview-section">
  <div class="preview-label">Your Output</div>
  <div id="user-sketch" class="sketch-box"></div>
</div>

<div class="editor-section">
  <div id="editor" style="min-height:400px"></div>
</div>

<div class="scroll-whitespace"></div>

<script>${p5Source}</script>

<script type="importmap">
${JSON.stringify({ imports: importMap }, null, 2)}
</script>

<script type="module">
${getBridgeScript(params.startingCode, params.solution, editorBg, params.colorScheme)}
</script>

</body>
</html>`;
}

function getBridgeScript(startingCode: string, solution: string, editorBg: string, colorScheme: "light" | "dark"): string {
  const isDark = colorScheme === "dark";
  const codeArg = jsString(startingCode);
  const solutionArg = jsString(solution);

  const fg = isDark ? '#E3E2E7' : '#1F2937';
  const gutterFg = isDark ? '#6B7280' : '#9CA3AF';
  const gutterBorder = isDark ? '#292A2E' : '#E5E7EB';
  const activeBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const selBg = isDark ? 'rgba(237,34,93,0.2)' : 'rgba(237,34,93,0.15)';
  const fnColor = isDark ? '#FFB2BB' : '#ED225D';
  const commentColor = isDark ? '#6B7280' : '#9CA3AF';

  return `
let view;
const INITIAL_CODE = ${codeArg};
const SOLUTION_CODE = ${solutionArg};

async function initEditor() {
  try {
    const { basicSetup, EditorView } = await import('codemirror');
    const { javascript } = await import('@codemirror/lang-javascript');
    const { syntaxHighlighting, HighlightStyle } = await import('@codemirror/language');
    const { EditorState } = await import('@codemirror/state');
    const { keymap } = await import('@codemirror/view');
    const { tags } = await import('@lezer/highlight');

    const p5Theme = EditorView.theme({
      '&': { backgroundColor: '${editorBg}', color: '${fg}' },
      '.cm-content': { caretColor: '#ED225D', fontFamily: "'JetBrains Mono', monospace" },
      '.cm-gutters': { backgroundColor: '${editorBg}', color: '${gutterFg}', borderRight: '1px solid ${gutterBorder}' },
      '.cm-activeLineGutter': { backgroundColor: '${activeBg}' },
      '.cm-activeLine': { backgroundColor: '${activeBg}' },
      '.cm-cursor': { borderLeftColor: '#ED225D', borderLeftWidth: '2px' },
      '.cm-selectionBackground': { backgroundColor: '${selBg}' },
      '.cm-matchingBracket': { backgroundColor: 'rgba(237, 34, 93, 0.3)', outline: '1px solid #ED225D' },
    });

    const p5Highlight = HighlightStyle.define([
      { tag: tags.keyword, color: '#ED225D' },
      { tag: tags.definitionKeyword, color: '#ED225D', fontWeight: 'bold' },
      { tag: tags.moduleKeyword, color: '#ED225D' },
      { tag: tags.controlKeyword, color: '#ED225D' },
      { tag: tags.operator, color: '${fg}' },
      { tag: tags.arithmeticOperator, color: '${fg}' },
      { tag: tags.logicOperator, color: '${fg}' },
      { tag: tags.compareOperator, color: '${fg}' },
      { tag: tags.punctuation, color: '${fg}' },
      { tag: tags.separator, color: '${fg}' },
      { tag: tags.brace, color: '${fg}' },
      { tag: tags.bracket, color: '${fg}' },
      { tag: tags.paren, color: '${fg}' },
      { tag: tags.number, color: '#FF4F75' },
      { tag: tags.string, color: '#22C55E' },
      { tag: tags.bool, color: '#FF4F75' },
      { tag: tags.null, color: '#FF4F75' },
      { tag: tags.variableName, color: '${fg}' },
      { tag: tags.definition(tags.variableName), color: '${fnColor}' },
      { tag: tags.function(tags.variableName), color: '${fnColor}' },
      { tag: tags.definition(tags.function(tags.variableName)), color: '${fnColor}' },
      { tag: tags.propertyName, color: '${fnColor}' },
      { tag: tags.attributeName, color: '${fnColor}' },
      { tag: tags.labelName, color: '${fnColor}' },
      { tag: tags.comment, color: '${commentColor}', fontStyle: 'italic' },
      { tag: tags.self, color: '#ED225D' },
      { tag: tags.typeName, color: '${fnColor}' },
      { tag: tags.className, color: '${fnColor}' },
      { tag: tags.standard(tags.tagName), color: '#ED225D' },
      { tag: tags.meta, color: '${fnColor}' },
      { tag: tags.invalid, color: '#ED225D' },
      { tag: tags.modifier, color: '#ED225D' },
      { tag: tags.constant(tags.variableName), color: '#FF4F75' },
      { tag: tags.special(tags.variableName), color: '#FF4F75' },
    ]);

    const state = EditorState.create({
      doc: INITIAL_CODE || '',
      extensions: [
        basicSetup,
        javascript(),
        p5Theme,
        syntaxHighlighting(p5Highlight),
        keymap.of([{ key: 'Ctrl-s', run: function() { return true; } }, { key: 'Cmd-s', run: function() { return true; } }]),
        EditorView.updateListener.of(function(update) {
          if (update.docChanged) {
            postCodeChange(update.state.doc.toString());
          }
        }),
      ],
    });
    view = new EditorView({ state, parent: document.getElementById('editor') });
    postReady();
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

function postOpenRef(symbol) {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'openRef', symbol: symbol }));
  }
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

  delete window.setup;
  delete window.draw;

  var script = document.createElement('script');
  script.textContent = code;
  document.body.appendChild(script);

  try {
    container.__p5 = new p5(undefined, container);
  } catch(e) {
    console.error('Sketch render error:', e);
    container.innerHTML = '<div style="color:#ED225D;padding:16px;font-family:sans-serif">\\u26A0 ' + e.message + '</div>';
  }
}

function renderAllSketches(userCode, solutionCode) {
  renderSketch('user-sketch', userCode);
  if (solutionCode) {
    renderSketch('solution-sketch', solutionCode);
  }
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
          var cursor = view.state.selection.main.head;
          view.dispatch({
            changes: { from: cursor, insert: msg.text },
            selection: { anchor: cursor + (msg.cursorOffset !== undefined ? msg.cursorOffset : msg.text.length) },
          });
          view.focus();
        }
        break;
      case 'focus':
        if (view) {
          view.dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(function() { view.focus(); }, 200);
        }
        break;
      case 'setFontSize':
        var scroller = view && view.dom && view.dom.querySelector('.cm-scroller');
        if (scroller) scroller.style.fontSize = msg.fontSize + 'px';
        break;
      case 'runSketch':
        if (!view) { console.error('Editor not initialized'); break; }
        var userCode = view.state.doc.toString();
        renderAllSketches(userCode, SOLUTION_CODE);
        if (SOLUTION_CODE && userCode.trim() === SOLUTION_CODE.trim()) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'exerciseComplete' }));
          }
        }
        setTimeout(function() {
          var el = document.getElementById('user-sketch');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        break;
      case 'showCompletion':
        var banner = document.getElementById('completion-banner');
        if (!banner) {
          banner = document.createElement('div');
          banner.id = 'completion-banner';
          banner.style.cssText = 'background:#22C55E;color:#fff;padding:12px 16px;font-family:sans-serif;display:flex;align-items:center;justify-content:space-between;font-size:16px';
          banner.innerHTML = '<span style="font-weight:700">\\u2713 Exercise completed!</span><a id="next-lesson-link" style="color:#fff;text-decoration:underline;font-weight:700;cursor:pointer">Next \\u2192</a>';
          document.body.insertBefore(banner, document.body.firstChild);
          document.getElementById('next-lesson-link').addEventListener('click', function() {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'goToNextLesson' }));
            }
          });
        }
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

initEditor();
`;
}
