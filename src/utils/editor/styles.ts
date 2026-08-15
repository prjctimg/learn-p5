export function getStyles(colorScheme: 'light' | 'dark'): string {
  const isDark = colorScheme === 'dark';
  const bg = isDark ? '#0D0E12' : '#FFFFFF';
  const gutterFg = isDark ? '#6B7280' : '#9CA3AF';
  const gutterBorder = isDark ? '#292A2E' : '#E5E7EB';
  const activeBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const selBg = isDark ? 'rgba(237,34,93,0.2)' : 'rgba(237,34,93,0.15)';

  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; overflow: hidden; background: ${bg}; }
  .editor-wrapper { height: 100%; position: relative; }
  .cm-editor {
    height: 100%;
    font-size: 33px;
    background: ${bg};
  }
  .cm-editor .cm-scroller {
    font-family: 'JetBrains Mono', monospace;
    overflow: auto;
  }
  .cm-editor.cm-focused { outline: none; }
  .cm-editor .cm-gutters {
    background: ${bg};
    border-right: 1px solid ${gutterBorder};
    color: ${gutterFg};
  }
  .cm-editor .cm-activeLineGutter { background: ${activeBg}; }
  .cm-editor .cm-activeLine { background: ${activeBg}; }
  .cm-editor .cm-cursor { border-left-color: #ED225D; }
  .cm-editor .cm-selectionBackground,
  .cm-editor.cm-focused .cm-selectionBackground { background: ${selBg} !important; }
  .cm-editor .cm-matchingBracket {
    background: rgba(237, 34, 93, 0.3);
    outline: 1px solid #ED225D;
  }
  .cm-editor .cm-foldPlaceholder {
    background: transparent;
    color: ${gutterFg};
    border: 1px solid ${gutterFg};
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
}
