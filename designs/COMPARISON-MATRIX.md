# Comparison Matrix — 5 Approaches Side-by-Side

> Compare across 12 dimensions.  
> Ratings: ✅ Strong, ⚠️ Moderate, ❌ Weak

```
Legend for effort:  🟢 = days,  🟡 = weeks,  🔴 = months
```

## 1. Core Problems Solved

| Dimension | A (Codegen) | B (Runtime) | C (Fix Only) | D (Comments) | E (YAML/DSL) |
|-----------|-------------|-------------|--------------|--------------|--------------|
| **Fixes validation bugs** | ⚠️ (still need WebView fixes) | ⚠️ (still need WebView fixes) | ✅ (primary goal) | ❌ (not addressed) | ⚠️ (still need WebView fixes) |
| **Removes .md ↔ .ts duplication** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Single source of truth** | ✅ (.md) | ✅ (.md) | ❌ (both) | ⚠️ (.ts, but comments in code) | ✅ (.yaml) |
| **Prevents drift** | ✅ (generated) | ✅ (parsed) | ❌ (manual) | ⚠️ (comments in code can still drift from docs) | ✅ (schema-validated) |

## 2. Implementation & Effort

| Dimension | A (Codegen) | B (Runtime) | C (Fix Only) | D (Comments) | E (YAML/DSL) |
|-----------|-------------|-------------|--------------|--------------|--------------|
| **Lines of new code** | ~200 (script) | ~300 (parser + loader) | ~85 | ~150 | ~250 (script + schema) |
| **Implementation effort** | 🟢 3–5 days | 🟡 5–10 days | 🟢 1–2 days | 🟢 2–3 days | 🟡 4–8 days |
| **New dependencies** | `gray-matter`, `glob` (dev) | `expo-asset`, `expo-file-system`, frontmatter parser | None | None | `yaml` or `js-yaml`, `ajv` (dev) |
| **CI/CD changes** | Add `generate:exercises` | Schema validation script | None | None | Add `validate:exercises` |

## 3. Developer Experience

| Dimension | A (Codegen) | B (Runtime) | C (Fix Only) | D (Comments) | E (YAML/DSL) |
|-----------|-------------|-------------|--------------|--------------|--------------|
| **Authoring workflow** | Edit `.md` → run script | Edit `.md` → reload app | Edit `.ts` | Edit `.ts` with comments | Edit `.yaml` |
| **Non-developer friendly** | ✅ (Markdown) | ✅ (Markdown) | ❌ (TypeScript) | ❌ (TypeScript) | ✅ (YAML) |
| **Hot-reload content** | ❌ (must re-run script) | ✅ (via Expo asset reload) | ✅ (TypeScript HMR) | ✅ (TypeScript HMR) | ⚠️ (if runtime; ❌ if build) |
| **IDE support / autocomplete** | ✅ (generated .ts) | ❌ (.md files) | ✅ (native .ts) | ✅ (native .ts) | ⚠️ (YAML schema, not as good as TS) |
| **Mental model** | "Write docs, generate code" | "Write docs, app reads them" | "Fix the bugs, keep status quo" | "Validation is code comments" | "Course is a config file" |

## 4. Runtime Characteristics

| Dimension | A (Codegen) | B (Runtime) | C (Fix Only) | D (Comments) | E (YAML/DSL) |
|-----------|-------------|-------------|--------------|--------------|--------------|
| **Cold start cost** | None (bundled JS) | ~100–300ms (parse .md) | None | None | None (if codegen) / ~50ms (if runtime YAML parse) |
| **Bundle size increase** | None | + parser code (~5KB) | None | None | YAML parser (~5KB gzipped) |
| **Async load required?** | No | Yes (Asset.loadAsync) | No | No | No (codegen) / Yes (runtime) |
| **Validation at build time** | ✅ | ❌ (CI script possible) | ❌ | ❌ | ✅ (JSON Schema) |

## 5. Risk & Downsides

| Dimension | A (Codegen) | B (Runtime) | C (Fix Only) | D (Comments) | E (YAML/DSL) |
|-----------|-------------|-------------|--------------|--------------|--------------|
| **Biggest risk** | Generated code in repo; script must be run | Parser crashes at runtime on malformed .md | Doesn't solve duplication; only a stopgap | Brittle comment extraction; confusing for users | YAML whitespace errors; another format to maintain |
| **Failure mode** | Stale generated .ts if script not run | App crashes on load if .md is malformed | Validation still works, but content drifts | Validation silently skips on parse failure | YAML syntax error crashes build/load |
| **Rollback complexity** | Revert generated .ts | Revert .md + rebuild | Revert .ts | Revert .ts | Revert .yaml |
| **Future migration cost** | Low (standard codegen) | Medium (parser is custom) | High (will need to migrate later) | High (comments embedded everywhere) | Medium (custom format) |

## 6. Which Approach for Which Scenario?

```
YOUR SITUATION                                  BEST APPROACH
─────────────────────────────────────────────────────────────────────
"App is broken RIGHT NOW, users can't progress"  → C first, then A or E
"Just me, one developer, small project"           → C + A combined
"Team has content writers, no TypeScript"         → E (YAML)
"Team has content writers, knows Markdown"        → A or B
"We want the most robust solution"                → A (codegen) or E (YAML build-time)
"We want zero build steps"                        → B (runtime)
"We want validation as part of the code"          → D
"We start with C, then evolve"                    → C → A (migrate .ts → .md codegen)
```

## 7. Recommended Hybrid (My Pick)

**Combine C + E for the strongest outcome:**

```
Phase 1 (Week 1):  Approach C — Fix WebView validation bugs
  Get the app working. Users can progress through exercises.
  ~85 lines changed, 1-2 days.

Phase 2 (Week 2-3): Approach E — Convert to YAML course files
  Move shapes.ts → courses/shapes.yaml.
  Add JSON Schema validation.
  Add build-time script to generate .ts from .yaml.
  Retire the exercises/*.md design docs (or generate them from YAML).
  ~250 lines new code, 4-8 days.

Phase 3 (Future):  Optional runtime YAML loading
  If cold-start cost is acceptable, switch to runtime YAML parsing
  for instant content iteration without rebuilds.
```

**Why this hybrid?**
- Fix the bugs first (C) — no one wants to use a broken app
- Then fix the content pipeline (E) — YAML is the most non-developer-friendly structured format
- The YAML schema validation catches errors before the app builds
- The .md design docs become an auto-generated artifact, not the source

## 8. Summary Scoring

| Dimension | Weight | A | B | C | D | E |
|-----------|--------|---|---|---|---|---|
| Validation correctness | 30% | 7 | 7 | 9 | 4 | 7 |
| Content pipeline quality | 25% | 9 | 9 | 3 | 5 | 9 |
| Authoring DX | 20% | 7 | 8 | 4 | 6 | 9 |
| Implementation ease | 15% | 6 | 4 | 9 | 7 | 5 |
| Future-proofing | 10% | 8 | 7 | 3 | 4 | 9 |
| **Weighted Total** | 100% | **7.4** | **7.2** | **5.7** | **4.9** | **7.8** |

> Scores out of 10. The hybrid C+E approach scores ~8.5+ by getting both the bugs fixed and the content pipeline right.
