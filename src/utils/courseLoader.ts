import { shapesCourse } from "../data/courses/shapes";
import { Course, Exercise } from "../data/types";

const COURSE_FILES = [shapesCourse];

let cachedCourses: Course[] | null = null;

export async function loadAllCourses(): Promise<Course[]> {
  if (cachedCourses) {
    return cachedCourses;
  }
  cachedCourses = COURSE_FILES;
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
