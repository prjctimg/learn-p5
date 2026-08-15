# Learn P5 — Feature Roadmap

> This document tracks the implementation status of all planned features.  
> See the [README](README.md) for project overview and getting started.

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ **Done** | Fully implemented, tested, and working |
| 🟡 **Partial** | Core functionality exists, but missing polish/edge cases |
| 🔄 **In Progress** | Actively being worked on |
| ⬜ **Planned** | Designed/specced, not yet started |
| ❌ **Not Planned** | Explicitly not in scope |

---

## Core Learning Experience

### Onboarding
| Feature | Status | Notes |
|---------|--------|-------|
| Welcome slide | ✅ Done | `src/app/onboarding/[slide].tsx` slide 1 |
| Experience level selection | ✅ Done | 3 options: Beginner/Intermediate/Advanced |
| Learning path selection | ✅ Done | 4 paths: Generative Art, Interactive, Design, Curiosity |
| Display name entry | ✅ Done | Stored locally for greetings |
| Completion → Dashboard | ✅ Done | Navigates to `/dashboard` |

### Courses & Exercises
| Feature | Status | Notes |
|---------|--------|-------|
| Course listing screen | ✅ Done | `src/app/learn/index.tsx` — loads from `courseLoader.ts` |
| Course detail / exercise list | ✅ Done | `src/app/learn/[course]/index.tsx` |
| Exercise screen | ✅ Done | `src/app/learn/[course]/[id].tsx` (951 lines) |
| — Code editor (CodeMirror 6 in WebView) | ✅ Done | Syntax highlighting, p5.js autocomplete, vim mode |
| — Sketch preview (p5.js in WebView) | ✅ Done | Runs user code, shows canvas output |
| — Run / Reset / Copy / Format buttons | ✅ Done | In editor header |
| — Fullscreen sketch toggle | ✅ Done | Maximize button in preview header |
| — Target solution viewer | ✅ Done | Collapsible section with "Run" button |
| — Exercise completion detection | ✅ Done | Compares user code to solution on run |
| — Sequential exercise unlocking | ✅ Done | Dashboard locks future exercises |
| — Starting code persistence (AsyncStorage) | ✅ Done | Per-exercise code saved/restored |
| Tutorial overlay (exercise 1) | ✅ Done | Step-by-step coach marks in WebView |
| Reference link from symbol in description | ✅ Done | Tap symbol → opens reference page |
| Multiple courses support | 🟡 Partial | Loader supports multiple; only **Shapes** (7 exercises) exists |

### Reference (p5.js API Docs)
| Feature | Status | Notes |
|---------|--------|-------|
| Full symbol index (generated from p5.js website) | ✅ Done | `src/data/reference.generated.json` (gitignored) |
| Fuzzy search (Fuse.js) | ✅ Done | Searches name, description, module |
| Module-grouped browsing | ✅ Done | `src/app/ref/index.tsx` |
| Symbol detail page | ✅ Done | Description, syntax, params, examples |
| Live example sketches in reference | ✅ Done | WebView renders p5.js examples |
| Next/Previous navigation | ✅ Done | Bottom of detail page |
| Link to official p5js.org docs | ✅ Done | "View on p5js.org" button |
| Module locking (course completion required) | ✅ Done | `useModuleProgress` hook |

### Dashboard
| Feature | Status | Notes |
|---------|--------|-------|
| Overall progress bar | ✅ Done | Animated progress ring/bar |
| Stats cards (Level, Completed, Streak) | ✅ Done | Animated counters |
| Continue where left off | ✅ Done | Jumps to next incomplete exercise |
| Up next list (with lock indicators) | ✅ Done | Shows 5 upcoming exercises |
| Streak toast on new day | ✅ Done | `StreakToast` component |

---

## Gamification & Progress

| Feature | Status | Notes |
|---------|--------|-------|
| Exercise completion tracking | ✅ Done | `completedLessons` in AsyncStorage |
| Course completion tracking | ✅ Done | `completedCourses` in AsyncStorage |
| Daily streak counter | ✅ Done | `useStreak` hook with tiers (3, 7, 14, 30, 100, 365) |
| Streak tier progress | ✅ Done | Visual progress to next tier |
| Longest streak record | ✅ Done | Persisted in AsyncStorage |
| Level calculation (1–10 based on %) | ✅ Done | Shown on dashboard |
| Points/XP system | ❌ Not Planned | Only streak + level for now |
| Achievements/badges | ❌ Not Planned | Not in current scope |
| Leaderboards / social | ❌ Not Planned | Offline-first, no backend |

---

## Editor & Keyboard

| Feature | Status | Notes |
|---------|--------|-------|
| CodeMirror 6 editor (bundled) | ✅ Done | `scripts/bundle-editor.mjs` → `codemirror-bundle.generated.ts` |
| p5.js function autocomplete | ✅ Done | From generated reference data |
| Syntax highlighting (p5.js aware) | ✅ Done | Highlights p5 functions in custom color |
| Bracket matching | ✅ Done | CodeMirror built-in |
| Vim mode (via @replit/codemirror-vim) | ✅ Done | Toggle in exercise settings modal |
| Multiple editor themes | ✅ Done | 6 themes: p5-learn, dark, light, monokai, dracula, nord |
| Font size adjustment | ✅ Done | 14–30px, persisted |
| Code background (auto/light/dark) | ✅ Done | Persisted |
| Programming keyboard (p5.js shortcuts) | ✅ Done | `ProgrammingKeyboard.tsx` — context-aware keys |
| QWERTY keyboard (long-press alternates) | ✅ Done | `QwertyKeyboard.tsx` — numbers/symbols on long-press |
| Keyboard height presets (S/M/T) | ✅ Done | Persisted |
| Cursor movement keys (←→↑↓) | ✅ Done | On programming keyboard |
| Format code (Prettier-style) | ✅ Done | CodeMirror `indentSelection` |

---

## Offline-First Architecture

| Feature | Status | Notes |
|---------|--------|-------|
| Vendored p5.js (v1.11.3) | ✅ Done | `src/utils/p5Source.ts` — no CDN |
| Vendored CodeMirror bundle | ✅ Done | Generated at build time |
| Reference data embedded | ✅ Done | Generated JSON imported at build |
| Font embedded (JetBrains Mono Base64) | ✅ Done | `constants/fontBase64.generated.ts` |
| AsyncStorage for all user data | ✅ Done | Progress, settings, streak, code |
| No required network calls at runtime | ✅ Done | Fully offline after install |

---

## Settings & Customization

| Feature | Status | Notes |
|---------|--------|-------|
| Dark/Light theme (system + manual toggle) | ✅ Done | `ThemeProvider` + Settings |
| Display name (for greetings) | ✅ Done | Stored in onboarding data |
| Daily reminder notification | 🟡 Partial | UI + scheduling code exists; needs permission handling polish |
| Notification time picker | ✅ Done | `TimePicker` component |
| Snippet alternatives toggle | 🟡 Partial | Setting exists; UI not fully wired to exercise variants |
| Drawer FAB toggle | ✅ Done | Accessibility setting |
| Dev/Debug mode | ✅ Done | Toast trigger, streak mock, complete/reset all exercises |

---

## Navigation & UI Chrome

| Feature | Status | Notes |
|---------|--------|-------|
| Side drawer navigation | ✅ Done | `SideDrawer.tsx` + `DrawerContent.tsx` — animated, gestureable |
| Header component (reusable) | ✅ Done | `Header.tsx` |
| Toast system | ✅ Done | `Toast.tsx` + `StreakToast.tsx` |
| About screen | ✅ Done | p5.js & Processing info, animated sketch, version badge |
| Support screen (FAQ + GitHub Issues) | ✅ Done | `src/app/support/index.tsx` |
| Splash screen | 🟡 Partial | `SplashScreen.tsx` exists; not wired to app entry |
| Logo / mascot | ❌ Not Planned | Issue #57 in roadmap |

---

## Notifications

| Feature | Status | Notes |
|---------|--------|-------|
| Daily reminder (expo-notifications) | 🟡 Partial | Scheduling code in Settings; needs foreground handling + permission flow |
| Streak milestone toast | ✅ Done | `StreakToast` shown on new day |
| Exercise completion toast | ✅ Done | "✓ Exercise completed!" with "Next →" action |
| Scheduled notifications (general) | ⬜ Planned | Infrastructure exists; more types TBD |

---

## Reference Data Generation (Build-Time)

| Feature | Status | Notes |
|---------|--------|-------|
| `generate-reference.mjs` (clones p5.js-website) | ✅ Done | CI: `node scripts/generate-reference.mjs` |
| Local stub mode (`--stub`) | ✅ Done | `node scripts/generate-reference.mjs --stub` (76 core symbols) |
| Keyboard layout derived from reference | ✅ Done | `src/data/keyboardLayout.ts` reads param types |
| CodeMirror bundle generator | ✅ Done | `scripts/bundle-editor.mjs` |

---

## Planned / Future Work

### Courses & Content
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Additional courses (Color, Motion, Interactivity, etc.) | ⬜ Planned | High | Course loader supports it; need content authoring |
| Exercise hint system | ⬜ Planned | Medium | Progressive hints per exercise |
| Exercise difficulty variants | ❌ Not Planned | — | Single track per exercise |
| Community-contributed exercises | ❌ Not Planned | — | No backend |
| Exercise search/filter | ⬜ Planned | Low | Dashboard has "up next"; full search later |

### Playground (Free-form Coding)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Playground screen | ❌ Not Started | Medium | Currently "Coming Soon" placeholder |
| Save/load sketches locally | ⬜ Planned | Medium | AsyncStorage or file picker |
| Export as GIF/video | ⬜ Planned | Low | Requires canvas capture |
| Export as GitHub Gist | ⬜ Planned | Low | Needs GitHub OAuth |
| Share sketch link (deep link) | ⬜ Planned | Low | Requires encoding state in URL |

### Minigames
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Minigame framework | ⬜ Planned | Medium | Separate module type |
| First minigame (e.g., "Draw the Shape") | ⬜ Planned | Medium | Prototype in GSoC proposal |
| Minigame progression/rewards | ⬜ Planned | Low | Tie into streak/XP |

### Accessibility (a11y)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Basic a11y (labels, roles, contrast) | 🟡 Partial | High | Most components have accessibilityRole/Label |
| Screen reader support (TalkBack/VoiceOver) | ⬜ Planned | High | Need audit |
| Dynamic type / large text | ⬜ Planned | Medium | Font size setting only affects editor |
| High contrast mode | ❌ Not Planned | — | Dark/light themes only |
| Keyboard navigation (HW keyboard) | ❌ Not Planned | — | Mobile-first; custom keyboard primary |
| Reduced motion | ⬜ Planned | Low | Respect `prefers-reduced-motion` |

### Data & Sync
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Cloud sync (progress across devices) | ⬜ Planned | Low | Needs backend/auth; post-GSoC |
| Export/import progress (JSON) | ⬜ Planned | Medium | Backup/restore via file picker |
| Anonymous analytics (opt-in) | ❌ Not Planned | — | Privacy-first; no tracking |

### Platform & Distribution
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Android APK/AAB builds | ✅ Done | — | GitHub Actions workflow |
| iOS build | ⬜ Planned | Medium | Expo supports; needs Apple Developer account |
| Web build (Expo Router) | ⬜ Planned | Low | Most features work; WebView limitations |
| F-Droid / Play Store listing | ⬜ Planned | Medium | Post-stabilization |
| Auto-update (CodePush/EAS Update) | ⬜ Planned | Low | Expo Updates configured |

### Polish & UX
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Logo / app icon / mascot | ⬜ Planned | Medium | Issue #57 |
| Splash screen animation | 🟡 Partial | Low | Component exists |
| Onboarding animation polish | 🟡 Partial | Low | Reanimated transitions exist |
| Haptic feedback (keyboard, buttons) | ⬜ Planned | Low | `expo-haptics` available |
| Sound effects (optional) | ❌ Not Planned | — | Distraction risk |
| Landscape mode support | ❌ Not Planned | — | Portrait only for now |

### Friendly Error System (FES)
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| p5.js FES integration | ⬜ Planned | Medium | Show friendly errors in sketch preview |
| Custom error overlay in editor | ⬜ Planned | Medium | Highlight error line in CodeMirror |

### Sharing & Social
| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Share exercise progress (OG image) | ⬜ Planned | Low | "I completed Exercise 3!" card |
| Share sketch from playground | ⬜ Planned | Low | Deep link + OG meta |
| Community gallery | ❌ Not Planned | — | Requires backend |

---

## Technical Debt / Refactors

| Area | Status | Notes |
|------|--------|-------|
| Exercise screen size (950+ lines) | ⬜ Planned | Split into sub-components/hooks |
| WebView bridge (exerciseHtml.ts) | ⬜ Planned | Large inline script; consider modularization |
| TypeScript strictness | 🟡 Partial | Some `any` in bridge code |
| Test coverage | ❌ Not Started | No test runner configured |
| CI lint/typecheck | ⬜ Planned | Add to GitHub Actions |
| Bundle size audit | ⬜ Planned | WebView + CodeMirror + p5.js are heavy |

---

## Version Milestones

| Version | Target | Key Deliverables |
|---------|--------|------------------|
| **v0.1 (Current)** | GSoC 2026 mid-term | ✅ Onboarding, 1 course (7 exercises), Reference, Dashboard, Streak, Settings, Offline |
| **v0.2** | GSoC 2026 final | 🟡 3+ courses, Playground MVP, Notifications polished, a11y audit |
| **v1.0** | Post-GSoC | ⬜ iOS build, Minigame framework, Cloud sync (opt-in), FES, Store listing |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) (to be created) for development setup, code style, and PR process.

> **Note**: This roadmap is a living document. Priorities may shift based on user feedback and GSoC mentor guidance. Check GitHub Issues for the latest discussion.
