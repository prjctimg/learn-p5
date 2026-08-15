# Learn P5 — Roadmap

## Implemented

### Onboarding
- Welcome slide, experience level, learning path, display name
- Completion flows to the dashboard

### Courses & exercises
- 16 courses: shapes, color, curves, custom-shapes, data, dom, events, image, io, math, random-noise, time, transform, typography, vectors, webgl
- Course overview with next exercise, up-next list, and completed list
- Exercise screen with CodeMirror 6 editor and live p5.js preview in a WebView
- Run / reset / copy / format controls, fullscreen preview, target solution viewer
- Task-based validation (`functionCall`, `functionExists`, `canvasSize`, `pixelMatch`, `expectedPixels`), auto-advance, and completion tracking
- Sequential exercise unlocking, per-exercise starting code persisted to AsyncStorage
- Tutorial overlay on the first exercise, shake-to-hint quick actions

### Reference
- 807 symbols generated from p5js.org
- Fuzzy search (Fuse.js), module-grouped browsing, symbol detail pages
- Live example sketches, prev/next navigation, link to p5js.org

### Dashboard & gamification
- Progress bar, stats (level, completed, streak), continue where you left off
- Streak tiers, achievements (first strokes, daily 3, quickdraw, on a roll, weekender)

### Editor & keyboard
- Offline CodeMirror 6 bundle, p5.js autocomplete, syntax highlighting, bracket matching
- 6 editor themes, font size, code background, word wrap
- Programming keyboard with p5.js shortcuts, QWERTY keyboard with long-press alternates
- Keyboard height presets, cursor movement keys, in-editor formatting

### Offline-first
- Vendored p5.js v2.3.2 (no CDN), embedded reference data and fonts
- All user data in AsyncStorage

### Settings, navigation & UI
- Side drawer navigation, header, toasts, tips screen, about screen
- Theme (light/dark + accent color), notifications, editor settings, drawer FAB, status bar toggle, dev mode
- Splash screen wired to app entry
- Accessibility labels/roles on components

### Tooling
- Jest test suite (18 files), `expo lint`
- Build-time generators: reference data, p5.js bundle, CodeMirror bundle, validation core, courses
- GitHub Actions release workflow; husky pre-push hook enforces a version bump and matching tag

## Partial
- Daily reminder notifications: scheduling exists; permission and foreground handling need polish
- Web build: most features work; WebView-dependent features are limited

## Not planned
- Playground, minigames, points/XP, leaderboards, cloud sync, analytics
- iOS build, F-Droid / Play Store listing, export/import of progress
- Friendly Error System integration, landscape mode, sound effects
