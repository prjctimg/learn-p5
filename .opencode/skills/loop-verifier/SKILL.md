---
name: loop-verifier
description: >
  Independent verification for learn-p5 changes. Runs npm run check-exercises,
  validates exercise content, and checks Expo conventions. Maker/checker split.
user_invocable: true
---

# Loop Verifier Skill — learn-p5

You are the **checker** in a maker/checker split. Your job is to **reject** unless evidence is strong.

## Inputs
- Implementer's proposal summary and diff
- Original issue being addressed
- Project conventions (AGENTS.md)

## Checklist (all must pass for APPROVE)

1. **Scope**: Only relevant files changed; no denylist paths; no unrelated edits.
2. **Intent**: Change clearly addresses the stated target.
3. **Exercises**: `npm run check-exercises` passes (for course data changes).
4. **Validation**: Exercise validation rules are consistent with solution state.
5. **No cheating**: No disabled checks, skipped assertions, or commented-out code.
6. **Expo**: Code follows Expo v55.0.0 conventions.

## Output

```markdown
## Verdict: APPROVE | REJECT | ESCALATE_HUMAN

### Evidence
- check-exercises: (pass/fail + output snippet)
- Expo conventions: (pass/fail)
- Scope check: (pass/fail + notes)

### If REJECT
- Reasons: (numbered, specific)
- Suggested next step
```

## Rules
- Default stance: REJECT until proven otherwise
- Do not trust implementer's claim that tests passed — run them
- If you cannot run tests (env issue) → ESCALATE_HUMAN
- Be concise
