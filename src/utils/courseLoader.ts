import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { load as parseYaml } from "js-yaml";
import { Course, Lesson } from "../data/types";

const COURSE_FILES = [
  require("../../assets/data/courses/shapes.md"),
];

let cachedCourses: Course[] | null = null;

interface RawCourse {
  slug: string;
  title: string;
  moduleName: string;
  description: string;
  lessons: RawLesson[];
}

interface RawLesson {
  id: string;
  title: string;
  module: string;
  description: string;
  instruction: string;
  startingCode?: string;
  solution?: string;
}

function parseFrontmatter(text: string): { data: Record<string, unknown> } {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error("No YAML frontmatter found");
  }
  const yaml = match[1];
  const data = parseYaml(yaml) as Record<string, unknown>;
  return { data };
}

function validateCourse(raw: RawCourse): Course {
  if (!raw.slug || !raw.title || !raw.lessons) {
    throw new Error(`Invalid course data: missing slug, title, or lessons`);
  }
  const lessons: Lesson[] = raw.lessons.map((l, i) => {
    if (!l.id || !l.title || !l.module || !l.instruction) {
      throw new Error(
        `Lesson at index ${i} in course "${raw.slug}" is missing required fields`
      );
    }
    return {
      id: l.id,
      title: l.title,
      module: l.module,
      description: l.description || "",
      instruction: l.instruction,
      startingCode: l.startingCode,
      solution: l.solution,
    };
  });
  return {
    slug: raw.slug,
    title: raw.title,
    moduleName: raw.moduleName || raw.title,
    description: raw.description || "",
    lessons,
  };
}

async function loadCourseFile(
  assetModule: number
): Promise<Course> {
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  const content = await FileSystem.readAsStringAsync(asset.localUri!);
  const { data } = parseFrontmatter(content);
  return validateCourse(data as unknown as RawCourse);
}

export async function loadAllCourses(): Promise<Course[]> {
  if (cachedCourses) {
    return cachedCourses;
  }
  const courses = await Promise.all(COURSE_FILES.map(loadCourseFile));
  cachedCourses = courses;
  return courses;
}

export async function loadCourse(slug: string): Promise<Course | null> {
  const courses = await loadAllCourses();
  return courses.find((c) => c.slug === slug) ?? null;
}

export async function loadExercise(
  courseSlug: string,
  exerciseId: string
): Promise<Lesson | null> {
  const course = await loadCourse(courseSlug);
  if (!course) return null;
  return course.lessons.find((l) => l.id === exerciseId) ?? null;
}

function invalidateCourseCache(): void {
  cachedCourses = null;
}
