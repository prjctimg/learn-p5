# LOOP.md — learn-p5

Expo/React Native mobile app for learning p5.js through bite-sized exercises. GSoC 2026 project for Processing Foundation.

## Active Loops

### Daily Triage (L1 — report only)
- Cadence: 1d weekdays
- Skill: `loop-triage`
- State: STATE.md
- Phase: Report-only initially. L2 after trust established.
- Handoff: Design decisions, new exercise content, breaking changes.

### PR Review (L2 — assisted)
- Cadence: on PR creation
- Skill: `loop-triage` + `loop-verifier`
- State: STATE.md
- Phase: Assisted — verifier runs `npm run check-exercises` in worktree.
- Handoff: Anything touching src/data/courses/, exercise validation logic.

## Worktrees

- Use isolated git worktrees for any L2 code changes.
- One worktree per fix attempt; discard after verifier REJECT or escalation.

## Budget & Observability

- Token caps: `loop-budget.md`
- Run history: `loop-run-log.md`
- Kill switch: `loop-pause-all` label in STATE.md

## Safety

- Never auto-merge changes to `src/data/courses/` (exercise content).
- Exercise validation changes require human review.
- Version bumps follow the pre-push hook workflow.
