export function getBridgeScript(colorScheme: 'light' | 'dark'): string {
  const isDark = colorScheme === 'dark';
  const bg = isDark ? '#0D0E12' : '#FFFFFF';
  const fg = isDark ? '#E3E2E7' : '#1F2937';
  const gutterFg = isDark ? '#6B7280' : '#9CA3AF';
  const gutterBorder = isDark ? '#292A2E' : '#E5E7EB';
  const activeBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const selBg = isDark ? 'rgba(237,34,93,0.2)' : 'rgba(237,34,93,0.15)';
  const fnColor = isDark ? '#FFB2BB' : '#BE185D';
  const commentColor = '#6B7280';
  const numColor = isDark ? '#FF4F75' : '#D31D4E';
  const strColor = isDark ? '#22C55E' : '#16A34A';
  const opColor = isDark ? '#E3E2E7' : '#374151';
  const kwColor = '#ED225D';
  const typeColor = isDark ? '#FFB2BB' : '#BE185D';
  const constColor = isDark ? '#FF4F75' : '#D31D4E';

  return `
var _CM = typeof CM !== 'undefined' ? CM : null;

var basicSetup = _CM.basicSetup;
var EditorView = _CM.EditorView;
var EditorState = _CM.EditorState;
var keymap = _CM.keymap;
var javascript = _CM.javascript;
var syntaxHighlighting = _CM.syntaxHighlighting;
var HighlightStyle = _CM.HighlightStyle;
var tags = _CM.tags;
var indentSelection = _CM.indentSelection;

const p5Theme = EditorView.theme({
  '&': { backgroundColor: '${bg}', color: '${fg}' },
  '.cm-content': { caretColor: '#ED225D', fontFamily: "'JetBrains Mono', monospace" },
  '.cm-gutters': { backgroundColor: '${bg}', color: '${gutterFg}', borderRight: '1px solid ${gutterBorder}' },
  '.cm-activeLineGutter': { backgroundColor: '${activeBg}' },
  '.cm-activeLine': { backgroundColor: '${activeBg}' },
  '.cm-cursor': { borderLeftColor: '#ED225D', borderLeftWidth: '2px' },
  '.cm-selectionBackground': { backgroundColor: '${selBg}' },
  '.cm-matchingBracket': { backgroundColor: 'rgba(237, 34, 93, 0.3)', outline: '1px solid #ED225D' },
  '.cm-foldPlaceholder': { backgroundColor: 'transparent', color: '${gutterFg}', border: '1px solid ${gutterFg}' },
  '.cm-foldGutter .cm-gutterElement': { color: '${gutterFg}', cursor: 'pointer' },
  '.cm-foldGutter .cm-gutterElement.cm-activeLineGutter': { color: '#ED225D' },
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

let view;

function createEditor(initialCode) {
  const state = EditorState.create({
    doc: initialCode || '',
    extensions: [
      basicSetup,
      javascript(),
      p5Theme,
      syntaxHighlighting(p5Highlight),
      keymap.of([{
        key: 'Ctrl-s',
        run: () => true,
      }, {
        key: 'Cmd-s',
        run: () => true,
      }]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          postCodeChange(update.state.doc.toString());
        }
      }),
    ],
  });

  view = new EditorView({
    state,
    parent: document.getElementById('editor'),
  });

  postReady();
}

function postCodeChange(code) {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'codeChange',
      code: code,
    }));
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

function handleMessage(data) {
  try {
    var msg = typeof data === 'string' ? JSON.parse(data) : data;
    if (msg.type === 'setCode') {
      if (view && msg.code !== view.state.doc.toString()) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: msg.code },
        });
      }
    } else if (msg.type === 'insert') {
      if (view) {
        var cursor = view.state.selection.main.head;
        view.dispatch({
          changes: { from: cursor, insert: msg.text },
          selection: { anchor: cursor + (msg.cursorOffset !== undefined ? msg.cursorOffset : msg.text.length) },
        });
        view.focus();
      } else {
        postEditorReady();
      }
    } else if (msg.type === 'focus') {
      if (view) {
        view.focus();
      }
    } else if (msg.type === 'setFontSize') {
      var scroller = view?.dom.querySelector('.cm-scroller');
      if (scroller) {
        scroller.style.fontSize = msg.fontSize + 'px';
      }
    } else if (msg.type === 'copyCode') {
      if (view) {
        var code = view.state.doc.toString();
        navigator.clipboard.writeText(code).then(function() {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'codeCopied' }));
          }
        });
      }
    } else if (msg.type === 'backspace') {
      if (view) {
        var cursor = view.state.selection.main.head;
        if (cursor > 0) {
          view.dispatch({
            changes: { from: cursor - 1, to: cursor },
            selection: { anchor: cursor - 1 },
          });
          view.focus();
        }
      }
    } else if (msg.type === 'format') {
      if (view) {
        view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
        indentSelection({ state: view.state, dispatch: view.dispatch });
        view.dispatch({ selection: { anchor: view.state.doc.length } });
        view.focus();
      }
    }
  } catch(e) {}
}

window.addEventListener('message', function(event) { handleMessage(event.data); });
document.addEventListener('message', function(event) { handleMessage(event.data); });

document.getElementById('formatBtn').addEventListener('click', function() {
  if (view) {
    view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
    indentSelection({ state: view.state, dispatch: view.dispatch });
    view.dispatch({ selection: { anchor: view.state.doc.length } });
  }
});

createEditor('');
`;
}
