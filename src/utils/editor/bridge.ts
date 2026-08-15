import { getEditorTheme } from './themes';

export function getBridgeScript(colorScheme: 'light' | 'dark', themeId?: string, ctaColor?: string, wordWrap?: boolean): string {
  const theme = getEditorTheme(themeId || 'p5-learn', colorScheme, ctaColor);
  const cta = ctaColor || '#ED225D';
  const ctaH = cta.replace('#', '');
  const ctaRgb = `${parseInt(ctaH.substring(0,2),16)},${parseInt(ctaH.substring(2,4),16)},${parseInt(ctaH.substring(4,6),16)}`;
  const {
    bg,
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
var javascript = _CM.javascript;
var syntaxHighlighting = _CM.syntaxHighlighting;
var HighlightStyle = _CM.HighlightStyle;
var tags = _CM.tags;
var indentSelection = _CM.indentSelection;
var autocompletion = _CM.autocompletion;
var CompletionContext = _CM.CompletionContext;
var lineWrapping = _CM.lineWrapping;
var prettierLib = _CM.prettier;
var prettierEstree = _CM.prettierPluginEstree;
var prettierAcorn = _CM.prettierPluginAcorn;

var WORD_WRAP = ${wordWrap ?? false};

var P5_COMPLETIONS = ["setup","draw","createCanvas","background","fill","circle","stroke","strokeWeight","line","rect","ellipse","noStroke","noFill","noLoop","arc","point","quad","square","triangle","ellipseMode","rectMode"];

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

const p5Theme = EditorView.theme({
  '&': { backgroundColor: '${bg}', color: '${fg}' },
  '.cm-content': { caretColor: '${cta}', fontFamily: "'JetBrains Mono', monospace" },
  '.cm-gutters': { backgroundColor: '${bg}', color: '${gutterFg}', borderRight: '1px solid ${gutterBorder}' },
  '.cm-activeLineGutter': { backgroundColor: '${activeBg}' },
  '.cm-activeLine': { backgroundColor: '${activeBg}' },
  '.cm-cursor': { borderLeft: '2px solid ${cta}', animation: 'cm-blink 1s step-end infinite' },
  '@keyframes cm-blink': { '50%': { borderLeftColor: 'transparent' } },

  '.cm-selectionBackground': { backgroundColor: '${selBg}' },
  '.cm-matchingBracket': { backgroundColor: 'rgba(${ctaRgb}, 0.3)' },
  '.cm-foldPlaceholder': { backgroundColor: 'transparent', color: '${gutterFg}', border: '1px solid ${gutterFg}' },
  '.cm-foldGutter .cm-gutterElement': { color: '${gutterFg}', cursor: 'pointer' },
  '.cm-foldGutter .cm-gutterElement.cm-activeLineGutter': { color: '${cta}' },
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

function getExtensions() {
  var exts = [
    basicSetup,
    javascript(),
    p5Theme,
    syntaxHighlighting(p5Highlight),
    autocompletion({ override: [p5CompletionSource] }),
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
  ];
  if (WORD_WRAP) exts.push(lineWrapping);
  return exts;
}

function createEditor(initialCode) {
  const state = EditorState.create({
    doc: initialCode || '',
    extensions: getExtensions(),
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
    } else if (msg.type === 'setWordWrap') {
      if (view) {
        WORD_WRAP = msg.wordWrap;
        var savedDoc = view.state.doc.toString();
        var savedSel = view.state.selection.main.head;
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
        var sel = view.state.selection.main;
        if (sel.from !== sel.to) {
          view.dispatch({
            changes: { from: sel.from, to: sel.to },
            selection: { anchor: sel.from },
          });
        } else if (sel.head > 0) {
          view.dispatch({
            changes: { from: sel.head - 1, to: sel.head },
            selection: { anchor: sel.head - 1 },
          });
        }
        view.focus();
      }
    } else if (msg.type === 'cursorMove') {
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
    } else if (msg.type === 'format') {
      if (view) {
        try {
          var codeToFormat = view.state.doc.toString();
          var pw = WORD_WRAP ? 80 : 120;
          if (typeof prettierLib !== 'undefined' && prettierLib.format) {
            prettierLib.format(codeToFormat, {
              parser: 'acorn',
              plugins: [prettierEstree, prettierAcorn],
              printWidth: pw,
              semi: true,
              singleQuote: false,
            }).then(function(formatted) {
              if (formatted !== codeToFormat) {
                view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted } });
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
    }
  } catch(e) {}
}

function handleMessageEvent(event) { handleMessage(event.data); }
window.addEventListener('message', handleMessageEvent);
document.addEventListener('message', handleMessageEvent);

document.getElementById('formatBtn').addEventListener('click', function() {
  if (view) {
    try {
      var codeToFormat = view.state.doc.toString();
      var pw = WORD_WRAP ? 80 : 120;
      if (typeof prettierLib !== 'undefined' && prettierLib.format) {
        prettierLib.format(codeToFormat, {
          parser: 'acorn',
          plugins: [prettierEstree, prettierAcorn],
          printWidth: pw,
          semi: true,
          singleQuote: false,
        }).then(function(formatted) {
          if (formatted !== codeToFormat) {
            view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted } });
          }
        }).catch(function() {});
      } else {
        view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
        indentSelection({ state: view.state, dispatch: view.dispatch });
        view.dispatch({ selection: { anchor: view.state.doc.length } });
      }
    } catch(e) {}
  }
});

createEditor('');
`;
}
