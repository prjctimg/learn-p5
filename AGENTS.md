# Expo v55 — Project Conventions

Read exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

## Styling

Use React Native's `StyleSheet.create()` API — **no Tailwind/NativeWind**.

- Each component defines `const styles = StyleSheet.create({...})` at the bottom of the file.
- For theme-aware colors, use `useThemeContext()` from `src/components/ThemeProvider.tsx` and import `Colors` from `src/constants/Colors.ts`. Resolve colors at render time: `const colors = Colors[colorScheme === "dark" ? "dark" : "light"]`.
- For Pressable press-state styles, use the `({ pressed }) => [styles.base, pressed && styles.active]` pattern.
- Font families: `"JetBrainsMono"` (all text). Import `Fonts` from `src/constants/Fonts.ts` and `Typography` from `src/constants/Typography.ts` to use tokenized font values.

## Package Management

- **Never run `npm install` on the dev machine.** Only edit `package.json` to add/change dependencies. The user handles installation separately.
- After editing `package.json`, update `AGENTS.md` if the change introduces new conventions or build steps.

## Reference Data Generation

Reference data (symbol descriptions, params, modules) is sourced from the p5.js website repo (`processing/p5.js-website`, `main` branch).

- **CI**: `node scripts/generate-reference.mjs` clones the repo shallowly and generates `src/data/reference.generated.json`.
- **Local dev**: `node scripts/generate-reference.mjs --stub` generates a minimal stub file with ~76 core symbols (no clone needed).
- The generated file is `.gitignore`d and never committed.
- `src/data/reference.ts` is the import hub — it reads `reference.generated.json` and re-exports `P5_SYMBOLS`, `P5_SYMBOLS_BY_NAME`, `P5_FUNCTION_NAMES`, `ONCE_ONLY_P5_FUNCTIONS`, and `GENERATED_REFERENCE` (raw data).
- Keyboard layout (`src/data/keyboardLayout.ts`) derives `p5Functions` param types from the reference data instead of hardcoding them.

## Code Editor (WebView)

The code editor uses CodeMirror 6 bundled via `scripts/bundle-editor.mjs` into `src/utils/editor/codemirror-bundle.generated.ts`.
- To add a new CodeMirror extension, add it to `src/utils/editor/bundleEntry.ts` re-export list, add npm dependency, then regenerate the bundle by running `node scripts/bundle-editor.mjs`.

## Vim Mode

Vim editing is provided by `@replit/codemirror-vim` (v6.2.0). It is toggled via the settings modal's "Vim Mode" switch. When enabled, a `toggleVimMode` message is sent to the WebView which recreates the CodeMirror EditorState with the `vim()` extension.

## QWERTY Keyboard

The custom `QwertyKeyboard` component (`src/components/QwertyKeyboard.tsx`) provides a standard QWERTY layout with long-press alternates for numbers/symbols. It replaces the former system keyboard integration. The `SystemKeyboardToolbar` component has been removed entirely.

## Fuzzy Finder

The reference page (`src/app/ref/index.tsx`) uses `fuse.js` v7.1.0 for fuzzy searching of p5.js symbols by name, description, and module.

## Offline p5.js

The p5.js source is vendored in `src/utils/p5Source.ts` (v1.11.3) and used directly in both exercise HTML (`exerciseHtml.ts`) and example HTML (`exampleHtml.ts`) — no CDN dependency.

## Keyboard System

- `ProgrammingKeyboard` and `QwertyKeyboard` are toggled via `keyboardMode` state (`"programming" | "qwerty"`) in `[id].tsx`.
- The system keyboard integration has been removed entirely. The editor always uses the custom input model (`inputmode='none'`, `contentEditable='false'`).
- The `onRequestSystemKeyboard` prop has been replaced with `onToggleQwerty` on `ProgrammingKeyboard`.
