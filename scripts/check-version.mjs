import { readFileSync } from "node:fs";

function readJson(path) {
  return JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
}

const pkg = readJson("package.json");
const app = readJson("app.json");
const lock = readJson("package-lock.json");

const expected = pkg.version;
const problems = [];

if (!expected) {
  problems.push("package.json is missing a version");
}
if (app.expo?.version !== expected) {
  problems.push(`app.json expo.version is ${app.expo?.version ?? "<missing>"}, expected ${expected}`);
}
if (lock.version !== expected) {
  problems.push(`package-lock.json version is ${lock.version ?? "<missing>"}, expected ${expected}`);
}
if (lock.packages?.[""]?.version !== expected) {
  problems.push(
    `package-lock.json packages[""].version is ${lock.packages?.[""]?.version ?? "<missing>"}, expected ${expected}`
  );
}

if (problems.length > 0) {
  console.error("Version mismatch — the app would display a stale version:");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("Run ./scripts/bump-version.sh to update every version reference.");
  process.exit(1);
}

console.log(`Version references are consistent: ${expected}`);
