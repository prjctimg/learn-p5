interface EditorAssets {
  p5: string;
  css: string[];
  js: string[];
}

export function buildExerciseHtml(
  code: string,
  assets: EditorAssets,
  isTablet: boolean
): string {
  const escaped = escapeHtml(code);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
${assets.css.join("\n")}
${extraStyles(isTablet)}
</style>
</head>
<body>
<div id="container">
  <div id="editor-wrap">
    <textarea id="editor">${escaped}</textarea>
  </div>
  <div id="output-wrap">
    <div id="p5canvas"></div>
    <div class="placeholder" id="placeholder">Canvas Rendering...</div>
  </div>
</div>

<script>${assets.p5}<\/script>
<script>${assets.js.join("\n")}<\/script>
<script>
${editorScript}
<\/script>
</body>
</html>`;
}

function extraStyles(isTablet: boolean): string {
  return `
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;overflow:hidden;background:#263238;font-family:system-ui,-apple-system,sans-serif}
#container{display:flex;height:100%;width:100%;${isTablet ? "flex-direction:row" : "flex-direction:column"}}
#editor-wrap{${isTablet ? "flex:1;border-right:2px solid #37474f" : "height:60%;border-bottom:2px solid #37474f"};overflow:hidden;position:relative}
#output-wrap{${isTablet ? "flex:1" : "height:40%"};display:flex;align-items:center;justify-content:center;background:#f5f5f5;position:relative;overflow:hidden}
#p5canvas{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
#p5canvas canvas{display:block;max-width:100%;max-height:100%}
.placeholder{color:#999;font-size:14px;font-family:monospace;position:absolute}
.CodeMirror{height:100%!important;font-size:13px;line-height:1.7;font-family:'JetBrains Mono','Fira Code',monospace!important}
.CodeMirror-gutters{background:#1e272c!important;border-right:1px solid #37474f}
.CodeMirror-linenumber{color:#546e7a!important}
.CodeMirror-foldgutter-open,.CodeMirror-foldgutter-folded{cursor:pointer;color:#546e7a!important}
.CodeMirror-foldgutter-open:after{content:"\\25BE"}
.CodeMirror-foldgutter-folded:after{content:"\\25B8"}
.CodeMirror-cursor{border-left:2px solid #ffb2bb!important}
.cm-matchhighlight{background:#ffff0040}
div.CodeMirror span.CodeMirror-matchingbracket{color:inherit!important;border-bottom:2px solid #80cbc4!important}
div.CodeMirror span.CodeMirror-nonmatchingbracket{color:inherit!important;border-bottom:2px solid #ef5350!important}
`;
}

const editorScript = `
;(function() {
  var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "javascript",
    theme: "material",
    lineNumbers: true,
    matchBrackets: true,
    styleActiveLine: true,
    foldGutter: true,
    gutters: ["CodeMirror-foldgutter", "CodeMirror-linenumbers"],
    extraKeys: {
      "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }
    },
    viewportMargin: Infinity,
    tabSize: 2,
    indentUnit: 2,
    indentWithTabs: false
  });

  var sketch = null;
  var placeholderEl = document.getElementById("placeholder");

  function cleanup() {
    if (sketch) {
      sketch.remove();
      sketch = null;
    }
    var cv = document.getElementById("p5canvas");
    var canvases = cv.querySelectorAll("canvas");
    for (var i = 0; i < canvases.length; i++) { canvases[i].remove(); }
    cv.innerHTML = "";
  }

  function globalFnNames() {
    return ["setup","draw","preload","mousePressed","mouseReleased",
            "mouseClicked","mouseMoved","mouseDragged","mouseWheel",
            "keyPressed","keyReleased","keyTyped",
            "touchStarted","touchMoved","touchEnded",
            "deviceMoved","deviceTurned","deviceShaken",
            "doubleClicked","windowResized"];
  }

  function runSketch() {
    cleanup();
    placeholderEl.style.display = "none";
    var code = editor.getValue();
    if (!code.trim()) {
      placeholderEl.textContent = "No code to run";
      placeholderEl.style.display = "block";
      return;
    }
    try {
      sketch = new p5(function(p) {
        var patched = code;
        var fns = globalFnNames();
        for (var i = 0; i < fns.length; i++) {
          var name = fns[i];
          var re = new RegExp("function\\\\s+" + name + "\\\\s*\\\\(([^)]*)\\\\)", "g");
          patched = patched.replace(re, function(match, args) {
            return "p." + name + " = function(" + args + ")";
          });
        }
        with (p) { eval(patched); }
      }, "p5canvas");
    } catch(e) {
      placeholderEl.textContent = "Error: " + e.message;
      placeholderEl.style.display = "block";
    }
  }

  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: "ready",
      code: editor.getValue()
    }));
  }

  var changeTimer = null;
  editor.on("changes", function() {
    if (window.ReactNativeWebView) {
      clearTimeout(changeTimer);
      changeTimer = setTimeout(function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "codeChange",
          code: editor.getValue()
        }));
      }, 300);
    }
  });
  editor.on("cursorActivity", function() {
    var pos = editor.getCursor();
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: "cursorChange",
        line: pos.line,
        ch: pos.ch
      }));
    }
  });

  function handleMessage(data) {
    try {
      var msg = typeof data === "string" ? JSON.parse(data) : data;
      switch (msg.type) {
        case "insert":
          if (msg.text) {
            var cursor = editor.getCursor();
            editor.replaceRange(msg.text, cursor);
            editor.focus();
          }
          break;
        case "run":
          runSketch();
          break;
        case "reset":
          if (msg.code) { editor.setValue(msg.code); runSketch(); }
          break;
        case "setCode":
          if (msg.code) { editor.setValue(msg.code); }
          break;
      }
    } catch(e) {}
  }

  window.addEventListener("message", function(e) { handleMessage(e.data); });
  document.addEventListener("message", function(e) { handleMessage(e.data); });
})();
`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
