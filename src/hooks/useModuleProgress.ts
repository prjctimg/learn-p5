import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPLETED_COURSES_KEY = "completedCourses";

// Maps symbol module names to course slugs
const MODULE_TO_COURSE: Record<string, string> = {
  shapes: "shapes",
};

export function useModuleProgress() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(COMPLETED_COURSES_KEY).then((val) => {
      if (val) {
        try {
          setCompletedCourses(JSON.parse(val));
        } catch {
          setCompletedCourses([]);
        }
      }
    });
  }, []);

  const isModuleUnlocked = (moduleName: string): boolean => {
    const courseSlug = MODULE_TO_COURSE[moduleName.toLowerCase()];
    if (!courseSlug) return true;
    return completedCourses.includes(courseSlug);
  };

  const getLockedCourseName = (moduleName: string, currentCourseSlug?: string): string | null => {
    const courseSlug = MODULE_TO_COURSE[moduleName.toLowerCase()];
    if (!courseSlug) return null;
    if (courseSlug === currentCourseSlug) return null;
    if (completedCourses.includes(courseSlug)) return null;
    return courseSlug;
  };

  const markCourseCompleted = async (courseSlug: string) => {
    const updated = completedCourses.includes(courseSlug)
      ? completedCourses
      : [...completedCourses, courseSlug];
    setCompletedCourses(updated);
    await AsyncStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify(updated));
  };

  return { isModuleUnlocked, getLockedCourseName, markCourseCompleted };
}