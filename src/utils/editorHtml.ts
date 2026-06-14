export function getEditorHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/codemirror.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/fold/foldgutter.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/theme/material-darker.min.css">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; overflow: hidden; background: #0D0E12; }
  .editor-wrapper { height: 100%; position: relative; }
  .CodeMirror {
    height: 100%;
    font-family: 'JetBrains Mono', monospace;
    font-size: 22px;
    line-height: 1.6;
    background: #0D0E12;
    color: #E3E2E7;
  }
  .CodeMirror-gutters { background: #0D0E12; border-right: 1px solid #292A2E; }
  .CodeMirror-linenumber { color: #6B7280; font-size: 11px; padding: 0 8px 0 4px; }
  .CodeMirror-foldgutter-open, .CodeMirror-foldgutter-closed { color: #6B7280; }
  .CodeMirror-cursor { border-left: 2px solid #ED225D; }
  .CodeMirror-selected { background: rgba(237, 34, 93, 0.2); }
  .cm-s-material-darker .CodeMirror-activeline-background { background: rgba(255,255,255,0.03); }
  .toolbar { position: absolute; top: 4px; right: 8px; z-index: 10; display: flex; gap: 4px; }
  .toolbar button {
    background: rgba(237, 34, 93, 0.2);
    border: none;
    color: #ED225D;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .toolbar button:active { background: rgba(237, 34, 93, 0.4); }
  span.cm-keyword { color: #ED225D; }
  span.cm-atom { color: #FF4F75; }
  span.cm-number { color: #FF4F75; }
  span.cm-def { color: #FFB2BB; }
  span.cm-variable { color: #E3E2E7; }
  span.cm-variable-2 { color: #E3E2E7; }
  span.cm-variable-3 { color: #E3E2E7; }
  span.cm-property { color: #FFB2BB; }
  span.cm-operator { color: #E3E2E7; }
  span.cm-comment { color: #6B7280; font-style: italic; }
  span.cm-string { color: #22C55E; }
  span.cm-string-2 { color: #22C55E; }
  span.cm-builtin { color: #ED225D; }
  span.cm-tag { color: #ED225D; }
  span.cm-attribute { color: #FFB2BB; }
  span.cm-bracket { color: #E3E2E7; }
  span.cm-meta { color: #FFB2BB; }
</style>
</head>
<body>
<div class="editor-wrapper">
  <div class="toolbar">
    <button id="formatBtn" onclick="formatCode()">Format</button>
  </div>
  <div id="editor"></div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/codemirror.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/mode/javascript/javascript.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/fold/foldcode.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/fold/foldgutter.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/fold/brace-fold.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/fold/indent-fold.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/edit/closebrackets.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18/addon/comment/comment.min.js"><\/script>
<script>
var editor = CodeMirror(document.getElementById('editor'), {
  value: '',
  mode: 'javascript',
  theme: 'material-darker',
  lineNumbers: true,
  lineWrapping: false,
  indentUnit: 2,
  tabSize: 2,
  indentWithTabs: false,
  autoCloseBrackets: true,
  matchBrackets: true,
  foldGutter: true,
  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  extraKeys: {
    'Ctrl-S': function() {},
    'Cmd-S': function() {},
    'Ctrl-/': 'toggleComment',
    'Cmd-/': 'toggleComment'
  }
});
editor.on('change', function() {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'codeChange',
      code: editor.getValue()
    }));
  }
});
window.addEventListener('message', function(event) { handleMessage(event.data); });
window.document.addEventListener('message', function(event) { handleMessage(event.data); });
function handleMessage(data) {
  try {
    var msg = typeof data === 'string' ? JSON.parse(data) : data;
    if (msg.type === 'setCode') {
      if (msg.code !== editor.getValue()) {
        editor.setValue(msg.code);
      }
    } else if (msg.type === 'insert') {
      var doc = editor.getDoc();
      var cursor = doc.getCursor();
      doc.replaceRange(msg.text, cursor);
      if (msg.cursorOffset !== undefined) {
        doc.setCursor({ line: cursor.line, ch: cursor.ch + msg.cursorOffset });
      }
      editor.focus();
    } else if (msg.type === 'setFontSize') {
      document.querySelector('.CodeMirror').style.fontSize = msg.fontSize + 'px';
    }
  } catch(e) {}
}
function formatCode() {
  var totalLines = editor.lineCount();
  for (var i = 0; i < totalLines; i++) {
    editor.indentLine(i);
  }
}
if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
}
<\/script>
</body>
</html>`;
}
