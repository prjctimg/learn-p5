# Loop Constraints — learn-p5

> The `loop-triage` and `loop-verifier` skills read this file at the start of every run.
> Constraints here are **binding** — the agent MUST follow them.

## Push & Merge
- Never auto-merge to main without human approval
- Always create a draft PR first
- Every push to main must bump version + create git tag (enforced by pre-push hook)

## Paths
- Never edit `.git/`, `.gitignore`, or hidden config files
- Never auto-edit `node_modules/`, `.expo/`, or build artifacts
- Never run `npm install` — user handles installation

## Code
- Read Expo v55.0.0 docs before writing any code
- Always run `npm run check-exercises` after editing `src/data/courses/*.ts`
- Never disable tests or validation to make CI green
- Never refactor unrelated code — one fix per run
- Max 3 fix attempts per item; escalate after
- Follow the validation rule model: `functionCall`, `functionExists`, `canvasSize`, `pixelMatch`, `expectedPixels`

## Communication
- Always tell the user what you're about to do before doing it
- Never close an issue or PR without approval

## Budget
- If token spend hits 80% of daily cap, switch to report-only
- If loop-pause-all is active, exit immediately
