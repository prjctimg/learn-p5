import { Exercise } from "../data/types";

export function isExerciseLocked(
  completedLessons: string[],
  courseSlug: string,
  exerciseId: string,
  exercises: Exercise[]
): boolean {
  const idx = exercises.findIndex((l) => l.id === exerciseId);
  if (idx <= 0) return false;
  for (let j = 0; j < idx; j++) {
    if (!completedLessons.includes(`${courseSlug}/${exercises[j].id}`)) {
      return true;
    }
  }
  return false;
}
