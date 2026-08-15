export const bridgeScript = `
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
  '&': { backgroundColor: '#0D0E12', color: '#E3E2E7' },
  '.cm-content': { caretColor: '#ED225D', fontFamily: "'JetBrains Mono', monospace" },
  '.cm-gutters': { backgroundColor: '#0D0E12', color: '#6B7280', borderRight: '1px solid #292A2E' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,0.03)' },
  '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.03)' },
  '.cm-cursor': { borderLeftColor: '#ED225D', borderLeftWidth: '2px' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(237, 34, 93, 0.2)' },
  '.cm-matchingBracket': { backgroundColor: 'rgba(237, 34, 93, 0.3)', outline: '1px solid #ED225D' },
  '.cm-foldPlaceholder': { backgroundColor: 'transparent', color: '#6B7280', border: '1px solid #6B7280' },
  '.cm-foldGutter .cm-gutterElement': { color: '#6B7280', cursor: 'pointer' },
  '.cm-foldGutter .cm-gutterElement.cm-activeLineGutter': { color: '#ED225D' },
});

const p5Highlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#ED225D' },
  { tag: tags.definitionKeyword, color: '#ED225D', fontWeight: 'bold' },
  { tag: tags.moduleKeyword, color: '#ED225D' },
  { tag: tags.controlKeyword, color: '#ED225D' },
  { tag: tags.operator, color: '#E3E2E7' },
  { tag: tags.arithmeticOperator, color: '#E3E2E7' },
  { tag: tags.logicOperator, color: '#E3E2E7' },
  { tag: tags.compareOperator, color: '#E3E2E7' },
  { tag: tags.punctuation, color: '#E3E2E7' },
  { tag: tags.separator, color: '#E3E2E7' },
  { tag: tags.brace, color: '#E3E2E7' },
  { tag: tags.bracket, color: '#E3E2E7' },
  { tag: tags.paren, color: '#E3E2E7' },
  { tag: tags.number, color: '#FF4F75' },
  { tag: tags.string, color: '#22C55E' },
  { tag: tags.bool, color: '#FF4F75' },
  { tag: tags.null, color: '#FF4F75' },
  { tag: tags.variableName, color: '#E3E2E7' },
  { tag: tags.definition(tags.variableName), color: '#FFB2BB' },
  { tag: tags.function(tags.variableName), color: '#FFB2BB' },
  { tag: tags.definition(tags.function(tags.variableName)), color: '#FFB2BB' },
  { tag: tags.propertyName, color: '#FFB2BB' },
  { tag: tags.attributeName, color: '#FFB2BB' },
  { tag: tags.labelName, color: '#FFB2BB' },
  { tag: tags.comment, color: '#6B7280', fontStyle: 'italic' },
  { tag: tags.self, color: '#ED225D' },
  { tag: tags.typeName, color: '#FFB2BB' },
  { tag: tags.className, color: '#FFB2BB' },
  { tag: tags.standard(tags.tagName), color: '#ED225D' },
  { tag: tags.meta, color: '#FFB2BB' },
  { tag: tags.invalid, color: '#ED225D' },
  { tag: tags.modifier, color: '#ED225D' },
  { tag: tags.constant(tags.variableName), color: '#FF4F75' },
  { tag: tags.special(tags.variableName), color: '#FF4F75' },
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
