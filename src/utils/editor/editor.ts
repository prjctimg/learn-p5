import { CODEMIRROR_BUNDLE } from "./codemirror-bundle.generated";
import { styles } from "./styles";
import { bridgeScript } from "./bridge";

export function getEditorHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${styles}</style>
</head>
<body>
<div class="editor-wrapper">
  <div class="toolbar">
    <button id="formatBtn">Format</button>
  </div>
  <div id="editor"></div>
</div>

<script>${CODEMIRROR_BUNDLE}<\/script>
<script>${bridgeScript}<\/script>
</body>
</html>`;
}
