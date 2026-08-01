- Read exact versioned docs at <https://docs.expo.dev/versions/v55.0.0/> before writing code.
- **Never run `npm install` on the dev machine.** Only edit `package.json`; the user handles installation separately.
- After editing `package.json`, update this file only if new conventions or build steps were introduced.

## Course data (YAML)

- Edit `src/data/courses/*.yaml` only — the generated `.ts` files are gitignored build artifacts.
- After YAML edits, re-run `npm run build-courses`, then `npm run check-exercises` (validates each task's rules against its `solution`).

## Generated artifacts

- `src/data/courses/*.ts`, `src/utils/p5Source.ts`, `src/utils/p5Version.ts`, and `src/data/reference.generated.json` are gitignored and regenerated on `postinstall`/`npm start`. Never commit them.

## Release cadence

- Every push to `main` must bump the version and create a matching `vX.Y.Z` tag (enforced by the Husky `pre-push` hook).
- Bump with `sh scripts/bump-version.sh` — no args auto-increments the patch (`0.6.118 → 0.6.119`); pass an explicit `<X.Y.Z>` to override.
- Workflow: edit → `sh scripts/bump-version.sh` → `git add -A` → commit `v0.6.119: <subject>` → `git tag v0.6.119` → `git push origin main && git push origin v0.6.119`.

## Loop Engineering

- See `.opencode/`: `STATE.md` (loop memory), `LOOP.md` (active loops), `loop-budget.md` (token caps), `loop-constraints.md` (binding rules), `loop-run-log.md` (history), `gate.yaml` (path denylist + auto-merge allowlist), `skills/` (triage + verifier).
- Start a loop: `opencode run "Run loop-triage. Update .opencode/STATE.md."`
- Verify changes: `opencode run "Verify diff in worktree" --agent verifier`
