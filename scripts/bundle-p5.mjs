#!/usr/bin/env node
// Bundles the pinned p5.js distribution into the app as a generated TS
// string (src/utils/editor/p5-runtime.generated.ts), the same pattern as
// the CodeMirror and validation bundles. The runtime is transpiled to
// ES2015 so it can be parsed by older Android WebViews; the ES5 polyfill
// in src/utils/editor/p5Html.ts runs before it in every preview document
// and supplies the newer runtime APIs p5 uses. Nothing is fetched at
// runtime: the app works offline and a content-pack update can no longer
// ship a broken or incompatible p5 build.
// Run via: npm run bundle-p5
import { execSync } from "child_process";
import fs from "fs";
import https from "https";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const PINNED_P5_VERSION = "2.4.0-rc.1";
const CDN_URL = `https://cdn.jsdelivr.net/npm/p5@${PINNED_P5_VERSION}/lib/p5.min.js`;
const MIN_BUNDLE_BYTES = 100_000;
const P5_BANNER_RE = /^\/\*![\s\S]*?\*\//;
// esbuild transpiles syntax but not regular-expression features. p5 2.4
// uses a named-capture-group regex and one Unicode property escape, both
// newer than the ES2015 target. Rewrite those spots before minifying so
// older WebViews can parse the runtime; validateRuntime rejects leftovers.
const P5_REGEX_COMPAT_REPLACEMENTS = [
  {
    label: "named capture groups",
    from: "/^(?<type><[a-z]+>)(\\[(?<min>-?[.\\d]+),\\s*(?<max>-?[.\\d]+)\\])?$/",
    to: "/^(<[a-z]+>)(\\[(-?[.\\d]+),\\s*(-?[.\\d]+)\\])?$/",
  },
  {
    label: "named group access",
    from: "this.type=n.groups.type;let{min:r,max:i}=n.groups;",
    to: "this.type=n[1];let r=n[3],i=n[4];",
  },
  {
    label: "Unicode property escape",
    from: "/\\P{ASCII}/u",
    to: "/[^\\x00-\\x7F]/",
  },
];

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
        }
        const chunks = [];
        res.on("data", (d) => chunks.push(d));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

function applyRegexCompat(source) {
  let result = source;
  for (const { label, from, to } of P5_REGEX_COMPAT_REPLACEMENTS) {
    const first = result.indexOf(from);
    if (first === -1) continue;
    if (result.indexOf(from, first + from.length) !== -1) {
      throw new Error(`p5.js has multiple ${label} occurrences; update bundle-p5.mjs.`);
    }
    result = result.slice(0, first) + to + result.slice(first + from.length);
    console.log(`[bundle-p5] Rewrote ${label} for ES2015`);
  }
  const unsupported = result.match(/\(\?<|\\[pP]\{|\\k</);
  if (unsupported) {
    throw new Error(`p5.js still contains unsupported regex syntax: ${unsupported[0]}`);
  }
  return result;
}

// Reject syntax that esbuild's ES2015 target should have lowered but a
// future p5 build might leak through: optional chaining, nullish
// coalescing, logical assignment, BigInt literals, private fields, and
// regex features older WebViews cannot parse. Strings and comments can
// contain these characters, so walk the TypeScript AST instead of
// matching raw text.
function validateEs2015(runtime) {
  let ts;
  try {
    ts = require("typescript");
  } catch {
    ts = null;
  }
  if (!ts) return;
  const sourceFile = ts.createSourceFile(
    "p5.min.js",
    runtime,
    ts.ScriptTarget.ES2015,
    true
  );
  const bad = [];
  const visit = (node) => {
    const kind = node.kind;
    if (
      kind === ts.SyntaxKind.BigIntLiteral ||
      kind === ts.SyntaxKind.PrivateIdentifier ||
      kind === ts.SyntaxKind.ClassStaticBlockDeclaration
    ) {
      bad.push(ts.SyntaxKind[kind]);
    }
    if (
      kind === ts.SyntaxKind.BinaryExpression &&
      [
        ts.SyntaxKind.QuestionQuestionToken,
        ts.SyntaxKind.BarBarEqualsToken,
        ts.SyntaxKind.AmpersandAmpersandEqualsToken,
        ts.SyntaxKind.QuestionQuestionEqualsToken,
      ].includes(node.operatorToken.kind)
    ) {
      bad.push(ts.SyntaxKind[node.operatorToken.kind]);
    }
    if (
      (kind === ts.SyntaxKind.CallExpression ||
        kind === ts.SyntaxKind.ElementAccessExpression ||
        kind === ts.SyntaxKind.PropertyAccessExpression) &&
      node.questionDotToken
    ) {
      bad.push("OptionalChain");
    }
    if (kind === ts.SyntaxKind.RegularExpressionLiteral) {
      const text = node.getText();
      if (/\(\?<|\\[pP]\{|\\k</.test(text)) bad.push(`regex ${text.slice(0, 32)}`);
    }
    node.forEachChild(visit);
  };
  visit(sourceFile);
  if (bad.length > 0) {
    throw new Error(`Transpiled p5.js runtime is not ES2015: ${[...new Set(bad)].join(", ")}`);
  }
}

function validateRuntime(runtime) {
  if (!runtime.startsWith(`/*! p5.js v${PINNED_P5_VERSION}`)) {
    throw new Error("Transpiled p5.js runtime lost its version banner.");
  }
  if (runtime.length < MIN_BUNDLE_BYTES) {
    throw new Error(`Transpiled p5.js runtime is incomplete (${runtime.length} bytes).`);
  }
  if (!runtime.trimEnd().endsWith(");")) {
    throw new Error("Transpiled p5.js runtime is truncated.");
  }
  // Parse in a modern engine to catch outright syntax errors, then check
  // the AST for ES2015-incompatible features esbuild should have lowered.
  new Function(runtime);
  validateEs2015(runtime);
}

async function buildRuntime(source) {
  const bannerMatch = source.match(P5_BANNER_RE);
  if (!bannerMatch) {
    throw new Error("p5.js download is missing its version banner.");
  }
  if (!bannerMatch[0].includes(`p5.js v${PINNED_P5_VERSION}`)) {
    throw new Error(`p5.js banner does not match pinned version ${PINNED_P5_VERSION}.`);
  }
  const body = applyRegexCompat(source.slice(bannerMatch[0].length));
  const esbuild = path.resolve("node_modules/.bin/esbuild");
  if (!fs.existsSync(esbuild)) {
    throw new Error(`esbuild not found at ${esbuild}. Run "npm install" first.`);
  }
  // esbuild is a devDependency; invoke it through a temp file so the
  // transform options stay explicit and errors are not swallowed.
  const tmpIn = path.resolve("node_modules/.cache/bundle-p5-input.js");
  fs.mkdirSync(path.dirname(tmpIn), { recursive: true });
  fs.writeFileSync(tmpIn, body, "utf-8");
  let transformed;
  try {
    transformed = execSync(
      `"${esbuild}" "${tmpIn}" --target=es2015 --minify --charset=utf8 --legal-comments=inline`,
      { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }
    );
  } finally {
    fs.rmSync(tmpIn, { force: true });
  }
  const runtime = `${bannerMatch[0]}\n${transformed.trim()}\n`;
  validateRuntime(runtime);
  return runtime;
}

async function main() {
  const outFile = path.resolve("src/utils/editor/p5-runtime.generated.ts");
  console.log(`[bundle-p5] p5.js version: ${PINNED_P5_VERSION}`);
  console.log(`[bundle-p5] Fetching ${CDN_URL}`);
  const source = await download(CDN_URL);
  const runtime = await buildRuntime(source);
  const tsContent = `// Auto-generated by scripts/bundle-p5.mjs — DO NOT EDIT
export const P5_RUNTIME_VERSION = ${JSON.stringify(PINNED_P5_VERSION)};
export const P5_RUNTIME_SOURCE = ${JSON.stringify(runtime)};
`;
  fs.writeFileSync(outFile, tsContent, "utf-8");
  console.log(`[bundle-p5] Wrote ${outFile} (${runtime.length} bytes, ES2015)`);
}

main().catch((err) => {
  console.error("[bundle-p5] FAILED:", err);
  process.exit(1);
});
