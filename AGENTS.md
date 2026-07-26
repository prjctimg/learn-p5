- Read exact versioned docs at <https://docs.expo.dev/versions/v55.0.0/> before writing any code.
- **Never run `npm install` on the dev machine.** Only edit `package.json` to add/change dependencies. The user handles installation separately.
- After editing `package.json`, update `AGENTS.md` if the change introduces new conventions or build steps.
- Run `npm run check-exercises` after editing `src/data/courses/*.ts`. It asserts each task's validation rules are consistent with the exercise's `solution` (final task state) and that `expectedPixels`/`pixelMatch` rules are well-formed.
- Validation rule model (see `src/data/types.ts`): `functionCall`, `functionExists`, `canvasSize`, `pixelMatch` (single strict point), `expectedPixels` (multi-point, passes if matching fraction >= `minPassFraction`, default 0.9). The exercise-level `solution` represents the FINAL task's target state.

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
