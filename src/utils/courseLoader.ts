import { Course, Exercise } from "../data/types";
import { getContentPack } from "../content/store";

let cachedCourses: Course[] | null = null;
let cachedPackRef: object | null = null;

export async function loadAllCourses(): Promise<Course[]> {
  const pack = getContentPack();
  if (!pack) {
    throw new Error("Course content has not been loaded yet.");
  }

  if (cachedCourses && cachedPackRef === pack) {
    return cachedCourses;
  }

  cachedPackRef = pack;
  cachedCourses = Array.isArray(pack.courses) ? pack.courses : [];
  return cachedCourses;
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
