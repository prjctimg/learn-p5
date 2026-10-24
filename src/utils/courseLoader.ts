import { Course, Exercise } from "../data/types";
import { getContentPack } from "../content/store";

let cachedCourses: Course[] | null = null;
let cachedPackRef: object | null = null;

function loadCoursesFromYamlIfPresent(): Course[] | null {
  try {
    const fs = require("fs");
    const path = require("path");
    const jsyaml = require("js-yaml");
    const coursesDir = path.resolve("src/data/courses");
    if (!fs.existsSync(coursesDir)) return null;
    const yamlFiles = fs
      .readdirSync(coursesDir)
      .filter((f: string) => f.endsWith(".yaml") || f.endsWith(".yml"));
    if (yamlFiles.length === 0) return null;
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
  } catch {
    return null;
  }
}

export async function loadAllCourses(): Promise<Course[]> {
  const pack = getContentPack();
  if (pack) {
    const courses = Array.isArray(pack.courses) && pack.courses.length > 0 ? pack.courses : null;
    if (courses) {
      if (cachedCourses && cachedPackRef === pack) {
        return cachedCourses;
      }
      cachedPackRef = pack;
      cachedCourses = courses;
      return cachedCourses;
    }
  }

  const yamlCourses = loadCoursesFromYamlIfPresent();
  if (yamlCourses) {
    if (cachedCourses && cachedPackRef === null && cachedCourses === yamlCourses) {
      return cachedCourses;
    }
    cachedCourses = yamlCourses;
    cachedPackRef = null;
    return cachedCourses;
  }

  if (pack) {
    if (cachedCourses && cachedPackRef === pack) {
      return cachedCourses;
    }
    cachedPackRef = pack;
    cachedCourses = Array.isArray(pack.courses) ? pack.courses : [];
    return cachedCourses;
  }

  throw new Error("Course content has not been loaded yet.");
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
