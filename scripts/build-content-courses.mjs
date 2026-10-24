import fs from "fs";
import path from "path";
import jsyaml from "js-yaml";

const COURSES_DIR = path.resolve("src/data/courses");

function slugToVarName(slug) {
  return slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + "Course";
}

export function loadAllCoursesFromFiles() {
  const yamlFiles = fs
    .readdirSync(COURSES_DIR)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  const courses = [];
  for (const file of yamlFiles) {
    const yamlPath = path.join(COURSES_DIR, file);
    const raw = fs.readFileSync(yamlPath, "utf8");
    const data = jsyaml.load(raw);
    if (data && data.slug) courses.push(data);
  }

  // Keep stable order matching existing course order.
  const order = [
    "shapes",
    "color",
    "transform",
    "custom-shapes",
    "curves",
    "typography",
    "image",
    "math",
    "vectors",
    "random-noise",
    "dom",
    "events",
    "time",
    "io",
    "data",
    "webgl",
  ];

  courses.sort((a, b) => {
    const ai = order.indexOf(a.slug);
    const bi = order.indexOf(b.slug);
    if (ai === -1 && bi === -1) return a.slug.localeCompare(b.slug);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return courses;
}
