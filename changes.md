# Learn P5 — Changelog (0.6.15 → 0.6.84)

### Editor & Code Experience
- p5.js upgraded to v2 — sketches now use instance mode; fixed async `remove()` race condition
- CodeMirror 6 fully bundled offline (IIFE) — no CDN dependency
- Autocomplete for p5.js functions with correct cursor placement
- Prettier in-app code formatting (acorn parser)
- Word wrap toggle, JetBrains Mono font throughout
- QWERTY keyboard overhaul + programming keyboard improvements (cursor keys, backspace, newline)
- System keyboard toggle, cursor blink, backspace/delete fixes
- Full-width sketch canvas with height constraint

### Exercise & Verification Engine
- Multi-step exercise engine with task auto-transition and completion tracking
- Semantic validation: `functionCall`, `functionExists`, `canvasSize`, `pixelMatch` rules
- Task descriptions update in-place via WebView postMessage (no full reload)
- Exercise completion persists to AsyncStorage, course progress tracks all done
- Shake-to-hint modal with contextual actions (hint, reset, reference)
- "Exercise" terminology standardized app-wide (was "Lesson")

### Navigation & Layout
- Side drawer navigation with swipe-to-open gesture, FAB toggle, headings restored
- Bottom tab nav tried (v0.6.70) then reverted to side drawer (v0.6.75)
- Course overview screen redesigned to Stitch CourseOverview layout
- Dashboard: "Up Next" module, streak toast animation, greeter toast, stat animation
- About page: CTAs as links, hierarchy fixed, dev mode toggle in settings

### Theming & Colors
- Accent-driven color system — single CTA hex generates full MD3 palette via `deriveColorsFromAccent()`
- Dynamic CTA color picker in settings, persisted to AsyncStorage
- Editor theme adapts to accent color (p5-learn, Tokyo Night, GitHub)
- Status bar tinted with accent color
- Light/dark mode with full token palette (30+ color tokens per scheme)
- Syntax highlighting + matching bracket highlight use accent color

### UI Polish
- Splash screen: animated p5 asterisk snowflakes on white background
- Loading screen uses user's accent color
- Floating run button with accent background
- Copy button with clipboard feedback
- Solution toggle (expand/collapse target sketch)
- Fullscreen preview toggle
- Keyboard popup styled with accent color
- Sentence case headings throughout

### Build & Platform
- Expo 55, React Native 0.83, React 19
- Removed expo-updates to unblock Android build on Gradle 9
- Patches `expo-structured-headers` for Gradle 9+ compat
- Removed dynamic icon plugin (until icon assets exist)
- CI-generated p5.js reference data (replaces hand-maintained symbols)
- React Compiler experiment enabled

### Bug Fixes
- Exercise verification now advances tasks and persists completion correctly
- Fixed sketch reload regression in p5.js v2 (async remove race)
- Fixed exercise crash from `ctaColor` TDZ scope in exerciseHtml bridge script
- Fixed word wrap crash (`lineWrapping` is `EditorView.lineWrapping`, not `CM.lineWrapping`)
- Fixed light mode syntax highlighting and dark mode icon colors
- Fixed autocomplete parentheses offset and cursor placement
- Fixed settings JSX nesting bug, import path breakage after route restructuring
- Canvas touch-action override prevents scroll hijack by p5.js
- Fixed `react-native-svg` named imports
