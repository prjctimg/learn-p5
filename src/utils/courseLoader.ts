import { Course, Exercise } from "../data/types";
import { getContentPack } from "../content/store";

let cachedCourses: Course[] | null = null;
let cachedPackRef: object | null = null;

function loadCoursesFromYamlFallback(): Course[] {
  const fs = require("fs");
  const path = require("path");
  const jsyaml = require("js-yaml");
  const coursesDir = path.resolve("src/data/courses");
  if (!fs.existsSync(coursesDir)) {
    return [];
  }
  const yamlFiles = fs
    .readdirSync(coursesDir)
    .filter((f: string) => f.endsWith(".yaml") || f.endsWith(".yml"));
  const courses: Course[] = [];
  for (const file of yamlFiles) {
    const raw = fs.readFileSync(path.join(coursesDir, file), "utf8");
    const data = jsyaml.load(raw) as Course;
    if (data && data.slug) courses.push(data);
  }
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

export async function loadAllCourses(): Promise<Course[]> {
  const pack = getContentPack();
  if (pack) {
    if (Array.isArray(pack.courses) && pack.courses.length > 0) {
      if (cachedCourses && cachedPackRef === pack) {
        return cachedCourses;
      }
      cachedPackRef = pack;
      cachedCourses = pack.courses;
      return cachedCourses;
    }
  }

  if (cachedCourses && !cachedPackRef) {
    return cachedCourses;
  }

  try {
    cachedCourses = loadCoursesFromYamlFallback();
    cachedPackRef = null;
    return cachedCourses;
  } catch {
    if (pack && Array.isArray(pack.courses)) {
      cachedPackRef = pack;
      cachedCourses = pack.courses;
      return cachedCourses;
    }
    cachedCourses = [];
    return cachedCourses;
  }
}

export async function loadCourse(slug: string): Promise<Course | null> {
  const courses = await loadAllCourses();
  return courses.find((c) => c.slug === slug) ?? null;
}

export async function loadExercise(
  courseSlug: string,
  exerciseId: string
): Promise<Exercise | null> {
  const course = await loadCourse(courseSlug);
  if (!course) return null;
  return course.exercises.find((l) => l.id === exerciseId) ?? null;
}
