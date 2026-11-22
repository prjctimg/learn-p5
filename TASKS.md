# Tasks

## Completed

- [x] **Package ID:** Changed Android package to `com.prjctimg.learnp5` (`app.json`).
- [x] **Node LTS:** Updated workflows to Node 26 and refreshed local-dev docs (`.github/workflows/*`, `CONTRIBUTING.md`).
- [x] **Grimoire:** Added `Grimoire.toml` wrapping common project commands.
- [x] **CONTRIBUTING:** Added terse local development/setup guide (`CONTRIBUTING.md`).
- [x] **CI cleanup/fixes:** Fixed failed Update GitHub Actions run cause (`workflows: write`), removed redundant workflow steps/retries, removed `what-changed` workflow, and closed related issues.
- [x] **Lint:** Fixed all ESLint errors/warnings; `npm run lint` is clean.
- [x] **CI quality gate:** Added lint to `npm run check`; CI runs check.
- [x] **AAB artifact:** Release workflow now builds/uploads release AAB in addition to split APKs (signing/Play upload still pending).
- [x] **Dependency license audit (initial):** Verified deps are FOSS (MIT/ISC/Apache/BSD/MPL/LGPL/Python-2.0/CC-BY data, etc.); added `license: GPL-3.0-or-later` to `package.json`.
- [x] **F-Droid metadata pushed:** Pushed fdroiddata fix to `prjctimg/fdroiddata@com.prjctimg.learnp5` (`0dc885887`) with filename/email/schema/lint/rewritemeta/scanner fixes. Metadata/schema/lint/rewritemeta/checkupdates jobs pass; build/tools checks still fail.
- [x] **Privacy policy draft:** Added `PRIVACY.md` (needs public URL for Play Console and review against final behavior).
- [x] **Fastlane changelog:** Added `fastlane/metadata/android/en-US/changelogs/153.txt`.

## F-Droid

- [ ] **Fix fdroiddata build (CI failing):** Pipeline `3097520194` (`com.prjctimg.learnp5`, `0dc885887`) fails in `fdroid build` and `tools check scripts`.
  - [ ] **`fdroid build`:** `npx expo prebuild --platform android --clean` completes, but F-Droid scanner removes `android/gradle/wrapper/gradle-wrapper.jar`; build then fails with `./gradlew: No such file or directory`. Fix by using F-Droid’s Gradle/gradlew-fdroid approach or restoring an accepted wrapper, and verify APK output path.
  - [ ] **`tools check scripts`:** fails at `make-summary-translatable.py` (no clear stdout error in tail; inspect `codequality.json` artifact or run script locally in fdroiddata) and resolve.
  - [ ] Re-run fdroiddata CI until all jobs pass, including `check apk`.
- [ ] **fdroiddata MR:** Open MR from `prjctimg/fdroiddata:com.prjctimg.learnp5` to fdroiddata after CI passes. Confirm commit hash, Node install/checksum, output path, scanner exclusions, and categories.
- [ ] **Verify F-Droid buildability locally/container:** Validate with fdroidserver (`fdroid readmeta`, `fdroid rewritemeta`, `fdroid lint`, `fdroid checkupdates --allow-dirty`, `fdroid build -v -l com.prjctimg.learnp5`). Resolve Node/toolchain/scanner issues.
- [ ] **FOSS/anti-feature audit:** Confirm no proprietary SDKs, trackers, or non-free network services in F-Droid build. Verify `expo-notifications` Android implementation/dependencies are acceptable.
- [ ] **Fastlane metadata for F-Droid:** Add phone screenshots; keep per-version changelogs at `fastlane/metadata/android/en-US/changelogs/<versionCode>.txt` (153 added, add future releases).
- [ ] **Signing/reproducible build decision:** Choose F-Droid signing or reproducible builds. For RB, publish upstream APK/signing metadata (`Binaries`/`AllowedAPKSigningKeys`) and document the reproducible build process.
- [ ] **RFP/Submission:** Open an F-Droid RFP issue or submit fdroiddata MR after metadata and build recipe are validated.

## Google Play

- [ ] **Play Console app setup:** Create app in Play Console, set package `com.prjctimg.learnp5`, default language, category, contact details.
- [ ] **Play App Signing:** Configure Play App Signing and upload key strategy before first production release.
- [ ] **Play release pipeline:** Produce signed AAB for Play upload (release workflow currently builds unsigned/CI artifacts; wire signing + upload path).
- [ ] **Target API compliance:** Verify generated Android target meets current Play requirement (new apps/updates: API 36 by Aug 31, 2026; plan extension if needed). Confirm Expo prebuild output.
- [ ] **Store listing assets:** Provide screenshots (phone required; tablet/foldable recommended), feature graphic, app icon (512x512), and localized descriptions as needed.
- [ ] **Privacy policy:** Publish a privacy policy URL (draft added in `PRIVACY.md`). Confirm it matches final behavior of notifications and accelerometer/shake detection (`expo-notifications`, `expo-sensors`) and any stored data.
- [ ] **Data Safety form:** Complete Play Data Safety declaration accurately based on actual data collection/sharing.
- [ ] **Content rating / app content:** Complete content rating questionnaire, target audience, ads declaration, app access, and any required policy declarations.
- [ ] **Testing track:** If using a new personal developer account, satisfy Play closed testing requirements before production. Otherwise, validate internal/closed testing flow.
- [ ] **Release review:** Run pre-launch report, resolve policy issues, and roll out staged release.

## Code / Repo Follow-up

- [ ] **Copyright review:** Confirm all bundled assets/fonts/icons have compatible licenses and attribution where required (JetBrains Mono, p5.js, app icons/artwork).
- [ ] **Periodic dependency/license audit:** Re-run license checks when dependencies change; keep record of reviewed exceptions.