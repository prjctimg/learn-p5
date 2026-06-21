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
