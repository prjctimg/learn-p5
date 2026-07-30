- Read exact versioned docs at <https://docs.expo.dev/versions/v55.0.0/> before writing any code.
- **Never run `npm install` on the dev machine.** Only edit `package.json` to add/change dependencies. The user handles installation separately.
- After editing `package.json`, update `AGENTS.md` if the change introduces new conventions or build steps.
- Run `npm run check-exercises` after editing `src/data/courses/*.yaml`. It asserts each task's validation rules are consistent with the exercise's `solution` (final task state) and that `expectedPixels`/`pixelMatch` rules are well-formed.
- Validation rule model (see `src/data/types.ts`): `functionCall`, `functionExists`, `canvasSize`, `pixelMatch` (single strict point), `expectedPixels` (multi-point, passes if matching fraction >= `minPassFraction`, default 0.9). The exercise-level `solution` represents the FINAL task's target state.

## Course modules (YAML → TS build artifacts)

- **Source of truth: `src/data/courses/*.yaml`** — edit YAML, never the `.ts` files.
- `scripts/build-courses.mjs` reads every `.yaml` in `src/data/courses/` and emits a matching `.ts` next to it (`<slug>Course` export).
- `build-courses` runs automatically via `postinstall` (so a fresh clone is buildable) and via `npm start` (so local edits propagate). CI's release workflow runs it explicitly after `npm install`.
- **`src/data/courses/*.ts` are gitignored build artifacts** (see `.gitignore`, same convention as `src/data/reference.generated.json`). Never commit them.
- `expo-clipboard` is used for copy-to-clipboard on symbol reference pages. Add it to `package.json` if the feature requires it (already present as of v0.7.4). Type declarations live in `src/types/expo-clipboard.d.ts`.
- After editing any `.yaml`, re-run `npm run build-courses` before type-checking or starting the app.

## p5.js bundling (always latest)

- `scripts/bundle-p5.mjs` queries the npm registry for the latest `p5` release, downloads `lib/p5.min.js`, and regenerates `src/utils/p5Source.ts` (the vendored minified source as `const _p = [...]; export const p5Source = _p.join("")`) plus `src/utils/p5Version.ts` (`export const p5Version = "X.Y.Z"`).
- `bundle-p5` runs first in `postinstall` (before `gen-reference`) and first in `npm start`, so the app always bundles the newest p5.js. `scripts/generate-reference.mjs` reads the version stamp from `src/utils/p5Version.ts` instead of hardcoding it.
- **`src/utils/p5Source.ts` and `src/utils/p5Version.ts` are gitignored build artifacts** — never commit them. A fresh clone regenerates them on `npm install`.

## Release cadence

- **Every push to `main` must bump the app version and create a matching git tag.** This is enforced by a `pre-push` git hook (`scripts/hooks/pre-push`, repo tracks `core.hooksPath = scripts/hooks`).
- To bump atomically, run `sh scripts/bump-version.sh <X.Y.Z>` — it updates `app.json` (`expo.version`) and `package.json` (`version`) together.
- Workflow: edit → `sh scripts/bump-version.sh 0.6.10X` → `git add -A` → `git commit -m "v0.6.10X: <subject>"` → `git tag vX.Y.Z` → `git push origin main && git push origin vX.Y.Z`.
- Patch bumps (`0.6.10X`) for bug fixes / small UX changes; minor bumps (`0.7.0`) for new features; major bumps for breaking changes. The hook refuses a `main` push if the pushed commit range doesn't include a version bump in `package.json` or if the matching `vX.Y.Z` tag doesn't exist locally.

## Loop Engineering

This repo uses loop engineering patterns. See:
- `.opencode/STATE.md` — current loop memory
- `.opencode/LOOP.md` — active loops and cadence
- `.opencode/loop-budget.md` — token caps
- `.opencode/loop-constraints.md` — binding agent rules
- `.opencode/loop-run-log.md` — run history
- `.opencode/gate.yaml` — path denylist + auto-merge allowlist
- `.opencode/skills/` — triage and verifier skills

Start a loop: `opencode run "Run loop-triage. Update .opencode/STATE.md."`
Verify changes: `opencode run "Verify diff in worktree" --agent verifier`
