// Content is published independently of the app binary so course data and
// reference examples can be updated without reinstalling. The p5.js
// runtime is bundled with the app (see scripts/bundle-p5.mjs) instead of
// being fetched with the pack, so sketches work offline on any WebView
// that can parse ES2015 plus the ES5 polyfill in p5Html.ts.
// Point this at a dedicated content repo for easier editing and smaller app size.
export const CONTENT_MANIFEST_URL =
  "https://github.com/prjctimg/learn-p5-content/releases/download/content-latest/manifest.json";

export const CONTENT_SCHEMA_VERSION = 2;
export const SUPPORTED_CONTENT_SCHEMA_VERSIONS = [1, 2] as const;
export const CONTENT_MANIFEST_TIMEOUT_MS = 10_000;
