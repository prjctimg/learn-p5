# Exercise Content & Validation Architecture — Design Approaches

This directory explores **5 distinct approaches** to solving two interconnected problems in the learn-p5 app:

1. **Broken solution validation** — even correct code fails to progress to the next task
2. **Disconnected content authoring** — exercises are authored as `.md` design docs and hand-copied into TypeScript, causing drift

Each file below documents one approach in isolation with:
- ASCII architecture diagrams  
- How it solves (or doesn't solve) each problem  
- Concrete pseudocode  
- Trade-offs (cost, complexity, DX, correctness)

## Files

| File | Approach | Theme |
|------|----------|-------|
| `CURRENT-ISSUES.md` | Root-cause analysis with flow diagrams | Diagnosis |
| `APPROACH-A-BUILD-TIME-GENERATOR.md` | Codegen: `.md` → `.ts` at build time | Automation |
| `APPROACH-B-RUNTIME-PARSER.md` | Parse `.md` files inside the app at runtime | Dynamic |
| `APPROACH-C-HYBRID-FIX-ONLY.md` | Fix WebView bugs; keep manual `.ts` authoring | Minimal |
| `APPROACH-D-COMMENT-ANNOTATIONS.md` | Keep `.ts` as source; embed validation in code comments | Developer-centric |
| `APPROACH-E-DOMAIN-SPECIFIC-LANGUAGE.md` | Custom YAML/JSON DSL for exercises | Structured |
| `COMPARISON-MATRIX.md` | Side-by-side trade-off table across 12 dimensions | Decision |

## Quick Verdict Table

| Dim | A (Codegen) | B (Runtime) | C (Fix only) | D (Comments) | E (DSL) |
|-----|-------------|-------------|--------------|--------------|---------|
| Fixes validation | ✅ | ✅ | ✅ | ❌ | ✅ |
| Removes duplication | ✅ | ✅ | ❌ | ❌ | ✅ |
| Implementation effort | Medium | High | Low | Low | High |
| Authoring DX | Good | Good | Poor | Good | Best |
| Runtime perf | Perfect | Slow startup | Perfect | Perfect | Perfect |
| Barrier to new exercises | Low | Low | High | Medium | Lowest |
