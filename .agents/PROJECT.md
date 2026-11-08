# Project Notes — learn-p5

- Consult the official versioned docs of the main dependencies before writing code:
  - p5.js: <https://p5js.org/reference/>
  - Expo SDK: <https://docs.expo.dev/versions/v55.0.0/>
- Never run `npm install` on the dev machine. Edit `package.json` only; the user handles installation.
- Course content is published from the separate content pack repository (`prjctimg/learn-p5-content`); no course data is vendored in this repo. The app downloads the published pack at runtime. The exercise/symbol checks that validate that content (`check-exercises`, `check-symbols`) live in `learn-p5-content`.
- Exercise validation shares one dependency-free core, `src/utils/editor/validation.ts`, used by both the WebView bridge (`src/utils/editor/exerciseHtml.ts`) and the dev checks. Rule types: `functionCall`, `functionExists`, `canvasSize`, `pixelMatch`, `expectedPixels`. The learn-p5-content repo holds a byte-identical synced copy of this core for its checks (same pattern as the mirrored `p5-version.mjs`); keep the two copies in sync. Do not fork the logic.
- Generated artifacts (`src/utils/editor/*.generated.ts`, `src/constants/fontBase64.generated.ts`) are build outputs — never commit or hand-edit them.
