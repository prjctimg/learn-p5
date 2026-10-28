# Building

Expo SDK 55 project. Do not edit generated artifacts directly; regenerate them (see below).

## Setup

```bash
npm install
```

`postinstall` runs the app build generators (validation core and reference data).
The p5.js runtime and course content ship in the separate content pack.

## Run

```bash
npm start        # regenerates build artifacts, then starts Expo
npm run android  # expo start --android
npm run web      # expo start --web
```

## Scripts

| Script | Purpose |
|---|---|
| `gen-reference` | Scrape p5js.org into `src/data/reference.generated.json` (`--stub` for offline) |
| `bundle-editor` | Build the CodeMirror bundle into `codemirror-bundle.generated.ts` |
| `bundle-validation` | Build the validation core into `validation-core.generated.ts` |
| `check-exercises` | Validate exercise tasks against the shared validation core and block extra p5 calls |
| `check-symbols` | Ensure exercise code references known p5 symbols |
| `lint` | `expo lint` |
| `test` | Jest |

Run `check-exercises` and `check-symbols` after editing course YAML.

## Generated artifacts

The following are build outputs and are never edited by hand:
`src/data/*.generated.json`, `src/utils/editor/*.generated.ts`, `src/constants/fontBase64.generated.ts`.

## Validation core

Shared validation lives in `src/utils/editor/validation.ts` — a dependency-free module that runs identically in the exercise WebView and in Node dev checks.

Rule types: `functionCall`, `functionExists`, `canvasSize`, `pixelMatch`, `expectedPixels`. Rule schemas and `schemaErrors()` reject malformed task rules. `analyze()` walks a lezer parse tree (`@lezer/javascript`) for calls, function definitions, and `createCanvas`; `evaluateRules()` runs synchronous rules; pixel rules are sampled by the WebView bridge in `exerciseHtml.ts` using `pixelMatches` (default tolerance 30) and `effectiveMinPassFraction` (default 0.9).

## Release

A push to `main` must bump `version` in `package.json` and carry a matching `vX.Y.Z` tag (enforced by the pre-push hook). Use `sh scripts/bump-version.sh`, commit, then `git tag v<version>`. GitHub Actions builds and publishes the Android APK.
