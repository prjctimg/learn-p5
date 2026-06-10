export interface EditorAssets {
  p5: string;
  css: string[];
  js: string[];
}

let cached: EditorAssets | null = null;

async function readAsset(moduleRef: unknown): Promise<string> {
  try {
    const { Asset } = require("expo-asset");
    const FileSystem = require("expo-file-system");
    const asset = Asset.fromModule(moduleRef);
    await asset.downloadAsync();
    return await FileSystem.readAsStringAsync(asset.localUri);
  } catch {
    return "";
  }
}

export async function loadEditorAssets(): Promise<EditorAssets> {
  if (cached) return cached;

  const [p5, cmCss, fgCss, themeCss, cmJs, jsMode, matchBrackets, activeLine, foldcode, braceFold, indentFold, foldgutter] =
    await Promise.all([
      readAsset(require("../../assets/p5/p5.min.js")),
      readAsset(require("../../assets/codemirror/codemirror.css")),
      readAsset(require("../../assets/codemirror/foldgutter.css")),
      readAsset(require("../../assets/codemirror/material.css")),
      readAsset(require("../../assets/codemirror/codemirror.cmjs")),
      readAsset(require("../../assets/codemirror/javascript.cmjs")),
      readAsset(require("../../assets/codemirror/matchbrackets.cmjs")),
      readAsset(require("../../assets/codemirror/active-line.cmjs")),
      readAsset(require("../../assets/codemirror/foldcode.cmjs")),
      readAsset(require("../../assets/codemirror/brace-fold.cmjs")),
      readAsset(require("../../assets/codemirror/indent-fold.cmjs")),
      readAsset(require("../../assets/codemirror/foldgutter.cmjs")),
    ]);

  cached = {
    p5,
    css: [cmCss, fgCss, themeCss],
    js: [
      cmJs,
      jsMode,
      matchBrackets,
      activeLine,
      foldcode,
      braceFold,
      indentFold,
      foldgutter,
    ],
  };

  return cached;
}
