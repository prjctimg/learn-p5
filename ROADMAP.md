# Learn P5 — Roadmap

## Implemented

### Onboarding
- Welcome slide, experience level, learning path, display name
- Completion flows to the dashboard

### Courses & exercises
- 16 courses / 66 exercises: shapes, color, curves, custom-shapes, data, dom,
  events, image, io, math, random-noise, time, transform, typography, vectors, webgl
- Course overview with next exercise, up-next list, and completed list
- Exercise screen with CodeMirror 6 editor and live p5.js preview in a WebView
- Run / reset / copy / format controls, fullscreen preview, target solution viewer
- Task-based validation (`functionCall`, `functionExists`, `canvasSize`,
  `pixelMatch`, `expectedPixels`), auto-advance, and completion tracking
- Sequential exercise unlocking, per-exercise starting code persisted to AsyncStorage
- Tutorial overlay on the first exercise, shake-to-hint quick actions

### Reference
- Symbols generated from the p5js.org content repo by `scripts/generate-reference.mjs`
- Fuzzy search (Fuse.js), module-grouped browsing, symbol detail pages
- Live example sketches, prev/next navigation, link to p5js.org

### Dashboard & gamification
- Progress bar, stats (level, completed, streak), continue where you left off
- Streak tiers and 5 progress/streak achievements
- Badge gallery with unlock timestamps

### Editor & keyboard
- Offline CodeMirror 6 bundle, p5.js autocomplete, syntax highlighting, bracket matching
- 6 editor themes, font size, code background, word wrap
- Programming keyboard with p5.js shortcuts, QWERTY keyboard with long-press alternates
- Keyboard height presets, cursor movement keys, in-editor formatting

### Offline-first
- Vendored p5.js, **pinned** to an exact version in `scripts/bundle-p5.mjs` and
  inlined into every WebView that needs it — no CDN at runtime
- Embedded reference data and fonts; all user data in AsyncStorage

### Settings, navigation & UI
- Side drawer navigation, header, toasts, tips screen, about screen
- Theme (light/dark + accent color), notifications, editor settings, drawer FAB,
  status bar toggle, dev mode
- Splash screen wired to app entry
- Accessibility labels/roles on components

### Tooling
- Jest test suite (19 files), `expo lint`
- Build-time generators: reference data, p5.js bundle, CodeMirror bundle,
  validation core, courses
- GitHub Actions release workflow; husky pre-push hook enforces a version bump
  and matching tag

## Not implemented

### Minigames

Minigames are **not implemented**. No minigame code, data, route, or achievement
ships in the app. Everything below was removed rather than left half-wired, so
nothing dead or unreachable remains in the bundle:

- 6 playable p5 games (`snake-classic`, `bounce-2d`, `space-impact`, `breakout`,
  `memory-match`, `frozen-bubble`) — were never actually playable: they were
  built against the p5 1.x API (`touchStarted`, `keyCode === UP_ARROW`,
  `curveVertex`) while the app bundles p5 2.x, so input was dead in every one
- `src/utils/minigames/` and its WebView message bridge, the
  `learn/[course]/minigame/*` route group, `MinigameCard`, and the
  AsyncStorage high-score store
- `src/data/courses/minigames.yaml` (16 entries and ~700 lines of hand-authored
  unlock exercises), the `Minigame` type, the `minigames` branch in all three
  course build/check scripts, and the 16 corresponding achievements
- `grantAchievement()` from `src/hooks/useAchievements.ts` — its only caller was
  the deleted minigame complete screen, and all 5 remaining achievements are
  granted by `recordCompletion()`

Recoverable from git history if the feature is ever rebuilt.

## Partial

- **Daily reminder notifications**: scheduling works and now checks the
  permission result before scheduling, but there is no notification-tap or
  foreground handler anywhere (`src/app/_layout.tsx` is notification-free).
- **Web build**: most features work; WebView-dependent features are limited.

## Known gaps

- The reference symbol count is not verifiable in-repo: `src/data/reference.ts`
  and `src/data/reference.generated.json` are gitignored build artifacts.

## Not planned

- Playground, points/XP, leaderboards, cloud sync, analytics
- iOS build, F-Droid / Play Store listing, export/import of progress
- Friendly Error System integration, landscape mode, sound effects