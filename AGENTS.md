# AGENTS.md

- Consult the official versioned docs of the main dependencies before writing code:
  - p5.js: <https://p5js.org/reference/>
  - Expo SDK: <https://docs.expo.dev/versions/v55.0.0/>
- Never run `npm install` on the dev machine. Edit `package.json` only; the user handles installation.
- Course content lives in `src/data/courses/*.yaml`. After editing it, run `npm run build-courses`, then `npm run check-exercises` and `npm run check-symbols`.
- Exercise validation shares one dependency-free core, `src/utils/editor/validation.ts`, used by both the WebView bridge (`src/utils/editor/exerciseHtml.ts`) and the dev checks. Rule types: `functionCall`, `functionExists`, `canvasSize`, `pixelMatch`, `expectedPixels`. Do not fork it.
- Generated artifacts (`src/data/courses/*.ts`, `src/utils/p5Source.ts`, `src/utils/p5Version.ts`, `src/data/*.generated.json`, `src/utils/editor/*.generated.ts`, `src/constants/fontBase64.generated.ts`) are build outputs — never commit or hand-edit them.
