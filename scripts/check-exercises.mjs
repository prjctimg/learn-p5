#!/usr/bin/env node
// Dev-only invariant: assert each task's validation rules are satisfiable
// and that the exercise's `solution` (final task state) is internally consistent.
// Run via: npm run check-exercises
import fs from "fs";
import path from "path";
import jsyaml from "js-yaml";

const COURSES_DIR = path.resolve("src/data/courses");

const yamlFiles = fs
  .readdirSync(COURSES_DIR)
  .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

let failures = 0;

function stripIgnored(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], c2 = src[i + 1];
    if (c === "/" && c2 === "/") { while (i < n && src[i] !== "\n") i++; continue; }
    if (c === "/" && c2 === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
    if (c === '"' || c === "'" || c === "`") {
      const q = c; out += c; i++;
      while (i < n) {
        if (src[i] === "\\") { out += src[i]; if (i + 1 < n) out += src[i + 1]; i += 2; continue; }
        if (src[i] === q) { out += src[i]; i++; break; }
        out += src[i]; i++;
      }
      continue;
    }
    out += c; i++;
  }
  return out;
}

function findCallsByName(code, name) {
  const sanitized = stripIgnored(code);
  const calls = [];
  const re = new RegExp("\\b" + name + "\\b", "g");
  const idxs = [];
  let m;
  while ((m = re.exec(sanitized)) !== null) idxs.push(m.index + m[0].length);
  for (const start of idxs) {
    let i = start;
    while (i < sanitized.length && sanitized[i] !== "(") i++;
    if (sanitized[i] !== "(") continue;
    let depth = 0, argStart = i + 1; const args = [];
    for (let j = i; j < sanitized.length; j++) {
      const ch = sanitized[j];
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          const raw = sanitized.slice(argStart, j);
          if (raw.trim().length > 0) args.push(raw);
          calls.push(args.map(a => a.trim()).filter(a => a.length > 0));
          break;
        }
      } else if (ch === "," && depth === 1) {
        args.push(sanitized.slice(argStart, j));
        argStart = j + 1;
      }
    }
  }
  return calls;
}

function checkExercise(ex) {
  if (!ex.tasks || ex.tasks.length === 0) return;
  const finalTask = ex.tasks[ex.tasks.length - 1];
  const solution = ex.solution ?? "";
  for (let ti = 0; ti < ex.tasks.length; ti++) {
    const task = ex.tasks[ti];
    for (const rule of task.validation ?? []) {
      if (rule.type === "functionCall") {
        const calls = findCallsByName(solution, rule.name);
        if (calls.length === 0) {
          // only a failure if this rule is on the final task (solution = final state)
          if (ti === ex.tasks.length - 1) {
            console.error(`  ✗ ${ex.id}/${task.id}: solution missing ${rule.name}() call`);
            failures++;
          }
        } else if (rule.exactArgs !== undefined) {
          const ok = calls.some(a => a.length === rule.exactArgs);
          if (!ok && ti === ex.tasks.length - 1) {
            console.error(`  ✗ ${ex.id}/${task.id}: solution ${rule.name}() has ${calls.map(c=>c.length).join(",")} args, expected ${rule.exactArgs}`);
            failures++;
          }
        }
      } else if (rule.type === "canvasSize") {
        const re = /createCanvas\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/;
        const mm = re.exec(solution);
        if (mm && (parseInt(mm[1]) !== rule.width || parseInt(mm[2]) !== rule.height)) {
          if (ti === ex.tasks.length - 1) {
            console.error(`  ✗ ${ex.id}/${task.id}: solution canvas ${mm[1]}x${mm[2]}, expected ${rule.width}x${rule.height}`);
            failures++;
          }
        }
      } else if (rule.type === "expectedPixels") {
        if (!Array.isArray(rule.points) || rule.points.length === 0) {
          console.error(`  ✗ ${ex.id}/${task.id}: expectedPixels has no points`);
          failures++;
        }
        if (rule.minPassFraction !== undefined && (rule.minPassFraction < 0 || rule.minPassFraction > 1)) {
          console.error(`  ✗ ${ex.id}/${task.id}: expectedPixels minPassFraction out of [0,1]`);
          failures++;
        }
        for (const p of rule.points ?? []) {
          if (!Array.isArray(p.expected) || p.expected.length !== 3) {
            console.error(`  ✗ ${ex.id}/${task.id}: expectedPixels point missing expected[3]`);
            failures++;
          }
        }
      } else if (rule.type === "pixelMatch") {
        if (!Array.isArray(rule.expected) || rule.expected.length !== 3) {
          console.error(`  ✗ ${ex.id}/${task.id}: pixelMatch missing expected[3]`);
          failures++;
        }
      }
    }
  }
}

for (const file of yamlFiles) {
  const yamlPath = path.join(COURSES_DIR, file);
  const raw = fs.readFileSync(yamlPath, "utf8");
  const course = jsyaml.load(raw);
  console.log(`Checking course: ${course.slug}`);
  for (const ex of course.exercises ?? []) {
    checkExercise(ex);
  }
}

if (failures > 0) {
  console.error(`\n${failures} validation invariant failure(s).`);
  process.exit(1);
} else {
  console.log("\nAll exercise validation invariants OK.");
}
