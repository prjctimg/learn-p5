# Expo v55 — Project Conventions

Read exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

## Styling

Use React Native's `StyleSheet.create()` API — **no Tailwind/NativeWind**.

- Each component defines `const styles = StyleSheet.create({...})` at the bottom of the file.
- For theme-aware colors, use `useThemeContext()` from `src/components/ThemeProvider.tsx` and import `Colors` from `src/constants/Colors.ts`. Resolve colors at render time: `const colors = Colors[colorScheme === "dark" ? "dark" : "light"]`.
- For Pressable press-state styles, use the `({ pressed }) => [styles.base, pressed && styles.active]` pattern.
- Font families: `"SpaceGrotesk"` (headings), `"Inter"` (body/label), `"JetBrainsMono"` (code).

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
