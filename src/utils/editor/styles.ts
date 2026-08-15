export const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; overflow: hidden; background: #0D0E12; }
  .editor-wrapper { height: 100%; position: relative; }
  .cm-editor {
    height: 100%;
    font-size: 33px;
    background: #0D0E12;
  }
  .cm-editor .cm-scroller {
    font-family: 'JetBrains Mono', monospace;
    overflow: auto;
  }
  .cm-editor.cm-focused { outline: none; }
  .cm-editor .cm-gutters {
    background: #0D0E12;
    border-right: 1px solid #292A2E;
    color: #6B7280;
  }
  .cm-editor .cm-activeLineGutter { background: rgba(255,255,255,0.03); }
  .cm-editor .cm-activeLine { background: rgba(255,255,255,0.03); }
  .cm-editor .cm-cursor { border-left-color: #ED225D; }
  .cm-editor .cm-selectionBackground,
  .cm-editor.cm-focused .cm-selectionBackground { background: rgba(237, 34, 93, 0.2) !important; }
  .cm-editor .cm-matchingBracket {
    background: rgba(237, 34, 93, 0.3);
    outline: 1px solid #ED225D;
  }
  .cm-editor .cm-foldPlaceholder {
    background: transparent;
    color: #6B7280;
    border: 1px solid #6B7280;
  }
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
`;
