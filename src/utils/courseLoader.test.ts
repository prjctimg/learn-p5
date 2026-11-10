import { describe, it, expect, beforeAll } from "@jest/globals";
import {
  loadAllCourses,
  loadCourse,
  loadExercise,
} from "./courseLoader";
import { setContentPack } from "../content/store";
import type { ContentPack } from "../content/types";
import type { Course } from "../data/types";

// Course content is not vendored in this repo (it ships in the downloadable
// pack from learn-p5-content), so tests use inline fixtures instead of files.
const shapeCourse: Course = {
  slug: "shapes",
  title: "Shapes",
  moduleName: "Fundamentals",
  description: "Draw your first shapes.",
  exercises: [
    {
      id: "exercise-1",
      title: "The First Circle",
      module: "Shapes",
      description: "Draw a circle.",
      instruction: "Draw a circle.",
    },
  ],
};

const colorCourse: Course = {
  slug: "color",
  title: "Color",
  moduleName: "Fundamentals",
  description: "Paint with code.",
  exercises: [
    {
      id: "exercise-1",
      title: "Fill It Up",
      module: "Color",
      description: "Fill a shape.",
      instruction: "Fill a shape.",
    },
  ],
};

function fixturePack(): ContentPack {
  return {
    schemaVersion: 2,
    contentVersion: "fixture",
    generatedAt: new Date().toISOString(),
    p5Assets: {},
    courses: [shapeCourse, colorCourse],
    reference: {
      byName: {},
      functionNames: [],
      metadata: { generatedAt: "", p5Version: "", symbolCount: 0 },
    },
  };
}

describe("courseLoader", () => {
  let courses: Course[];

  beforeAll(async () => {
    setContentPack(fixturePack());
    courses = await loadAllCourses();
  });

  it("loads the courses from the active content pack", () => {
    expect(courses).toEqual([shapeCourse, colorCourse]);
  });

  it("loads a course by slug", async () => {
    expect((await loadCourse("shapes"))?.slug).toBe("shapes");
    expect(await loadCourse("not-a-course")).toBeNull();
  });

  it("loads an exercise by course slug and exercise id", async () => {
    const exercise = await loadExercise("shapes", "exercise-1");
    expect(exercise?.id).toBe("exercise-1");
    expect(exercise?.title).toBe("The First Circle");
    expect(await loadExercise("shapes", "missing-id")).toBeNull();
    expect(await loadExercise("missing-course", "exercise-1")).toBeNull();
  });
});
