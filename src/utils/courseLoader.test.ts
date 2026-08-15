import { describe, it, expect, beforeAll } from "@jest/globals";
import {
  loadAllCourses,
  loadCourse,
  loadExercise,
} from "./courseLoader";
import type { Course } from "../data/types";

describe("courseLoader", () => {
  let courses: Course[];

  beforeAll(async () => {
    courses = await loadAllCourses();
  });

  it("loads every expected module", () => {
    const slugs = courses.map((c) => c.slug);
    for (const expected of [
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
    ]) {
      expect(slugs).toContain(expected);
    }
  });

  it("gives every course a slug, title and at least one exercise", () => {
    for (const course of courses) {
      expect(course.slug).toMatch(/^[a-z0-9-]+$/);
      expect(course.title.length).toBeGreaterThan(0);
      expect(course.exercises.length).toBeGreaterThan(0);
    }
  });

  it("gives every course a unique slug", () => {
    const slugs = courses.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every exercise a unique id within its course", () => {
    for (const course of courses) {
      const ids = course.exercises.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        expect(id).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it("loads a course by slug", async () => {
    expect((await loadCourse("shapes"))?.slug).toBe("shapes");
    expect(await loadCourse("not-a-course")).toBeNull();
  });

  it("loads an exercise by course slug and exercise id", async () => {
    const first = courses[0];
    const exercise = await loadExercise(first.slug, first.exercises[0].id);
    expect(exercise?.id).toBe(first.exercises[0].id);
    expect(await loadExercise(first.slug, "missing-id")).toBeNull();
    expect(await loadExercise("missing-course", "x")).toBeNull();
  });
});
