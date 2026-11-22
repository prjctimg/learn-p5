# Contributing

## Local setup

**Prereqs:** Node 26+ (current LTS), npm, Android SDK/Android Studio for device builds (Expo Go works for quick iteration). [Grimoire](https://github.com/Vaishnav-Sabari-Girish/grimoire) is optional for task shortcuts (`grimoire cast <sigil>`).

```sh
git clone https://github.com/prjctimg/learn-p5.git
cd learn-p5
npm ci
```

`npm ci` runs `postinstall`, which generates bundled runtime artifacts (`validation`, `p5`, `polyfill`). `npm start` also regenerates the editor bundle before launching Expo.

## Common commands

```sh
npm start          # bundle editor/runtime deps + expo start
npm run android    # expo start --android
npm run web        # expo start --web
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # jest
npm run check      # version consistency + typecheck + tests
```

## Notes

- **Generated files:** `src/utils/editor/*.generated.ts` are built by `scripts/bundle-*.mjs` and are gitignored. Regenerate with `npm run bundle-editor`, `bundle-p5`, `bundle-polyfill`, or `bundle-validation` as needed.
- **Native projects:** `android/` and `ios/` are gitignored (Expo CNG). Use `npx expo prebuild --platform android --clean` when you need a local native project.
- **Version bumps:** Use `./scripts/bump-version.sh [X.Y.Z]` to keep `package.json`, `package-lock.json`, and `app.json` (including Android `versionCode`) in sync.
- **Exercise content:** Course content lives in [prjctimg/learn-p5-content](https://github.com/prjctimg/learn-p5-content), not this repo.
- **Before opening a PR:** Run `npm run check` and `npm run lint`. Keep changes focused and follow existing project patterns.
