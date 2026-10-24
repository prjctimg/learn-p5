#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import { PINNED_P5_VERSION } from "./p5-version.mjs";

const OUT_DIR = path.resolve("content");
const PACK_FILE = path.join(OUT_DIR, "pack.json");
const MANIFEST_FILE = path.join(OUT_DIR, "manifest.json");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readP5Source() {
  const src = fs.readFileSync(path.resolve("src/utils/p5Source.ts"), "utf8");
  const match = src.match(/export const p5Source: string = (_p\.join\(["'][^"']*["']\)|(?:.|\n)*?)\n/s);
  // The generated file uses _p array joined; reconstruct by evaluating.
  // Simpler: extract array content and join.
  const arrayMatch = src.match(/const _p = \[([\s\S]*?)\];/);
  if (!arrayMatch) throw new Error("Could not parse p5Source.ts");
  // Use node to eval safely.
  const joined = execSync(`node -e ${JSON.stringify(`const _p=[${arrayMatch[1]}];console.log(_p.join(""));`)}`, { encoding: "utf8" });
  return joined;
}

function main() {
  ensureDir(OUT_DIR);

  // Ensure artifacts exist.
  try {
    require.resolve("../src/utils/p5Source.ts");
  } catch {
    run("node scripts/bundle-p5.mjs");
  }

  try {
    require.resolve("../src/data/reference.generated.json");
  } catch {
    run("node scripts/generate-reference.mjs");
  }

  const { loadAllCoursesFromFiles } = awaitImport("./build-content-courses.mjs");
  const courses = loadAllCoursesFromFiles();
  const reference = JSON.parse(fs.readFileSync(path.resolve("src/data/reference.generated.json"), "utf8"));
  const p5Assets = fs.existsSync(path.resolve("src/data/p5Assets.generated.json"))
    ? JSON.parse(fs.readFileSync(path.resolve("src/data/p5Assets.generated.json"), "utf8"))
    : {};
  const p5Source = readP5Source();

  const contentVersion =
    process.env.CONTENT_VERSION ||
    new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);

  const pack = {
    schemaVersion: 1,
    contentVersion,
    generatedAt: new Date().toISOString(),
    p5: { version: PINNED_P5_VERSION, source: p5Source },
    p5Assets,
    courses,
    reference: {
      byName: reference.byName,
      functionNames: reference.functionNames,
      metadata: reference.metadata,
    },
  };

  const packJson = JSON.stringify(pack);
  fs.writeFileSync(PACK_FILE, packJson, "utf8");

  const sha256 = crypto.createHash("sha256").update(packJson).digest("hex");
  const manifest = {
    schemaVersion: 1,
    contentVersion,
    generatedAt: pack.generatedAt,
    p5Version: PINNED_P5_VERSION,
    packUrl: "content.json",
    packSize: Buffer.byteLength(packJson),
    packSha256: sha256,
    courseCount: Array.isArray(courses) ? courses.length : 0,
    symbolCount: reference.metadata?.symbolCount || 0,
  };

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Wrote ${PACK_FILE} (${manifest.packSize} bytes)`);
  console.log(`Wrote ${MANIFEST_FILE}`);
}

async function awaitImport(spec) {
  const mod = await import(new URL(spec, import.meta.url).href);
  return mod;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
