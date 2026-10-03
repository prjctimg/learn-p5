import { shapesCourse } from "../data/courses/shapes";
import { colorCourse } from "../data/courses/color";
import { transformCourse } from "../data/courses/transform";
import { customShapesCourse } from "../data/courses/custom-shapes";
import { curvesCourse } from "../data/courses/curves";
import { typographyCourse } from "../data/courses/typography";
import { imageCourse } from "../data/courses/image";
import { mathCourse } from "../data/courses/math";
import { vectorsCourse } from "../data/courses/vectors";
import { randomNoiseCourse } from "../data/courses/random-noise";
import { domCourse } from "../data/courses/dom";
import { eventsCourse } from "../data/courses/events";
import { timeCourse } from "../data/courses/time";
import { ioCourse } from "../data/courses/io";
import { dataCourse } from "../data/courses/data";
import { webglCourse } from "../data/courses/webgl";
import { Course, Exercise } from "../data/types";

const COURSE_FILES = [
  shapesCourse,
  colorCourse,
  transformCourse,
  customShapesCourse,
  curvesCourse,
  typographyCourse,
  imageCourse,
  mathCourse,
  vectorsCourse,
  randomNoiseCourse,
  domCourse,
  eventsCourse,
  timeCourse,
  ioCourse,
  dataCourse,
  webglCourse,
];

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
