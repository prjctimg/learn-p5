import { describe, it, expect } from "@jest/globals";
import { isExerciseLocked } from "./isExerciseLocked";
import type { Exercise } from "../data/types";

const exercises: Exercise[] = [
  { id: "e1", title: "One", module: "m", description: "d", instruction: "i", startingCode: "", solution: "" },
  { id: "e2", title: "Two", module: "m", description: "d", instruction: "i", startingCode: "", solution: "" },
  { id: "e3", title: "Three", module: "m", description: "d", instruction: "i", startingCode: "", solution: "" },
];

describe("isExerciseLocked", () => {
  it("never locks the first exercise", () => {
    expect(isExerciseLocked([], "shapes", "e1", exercises)).toBe(false);
  });

  it("unlocks an exercise once all predecessors are completed", () => {
    expect(isExerciseLocked(["shapes/e1"], "shapes", "e2", exercises)).toBe(false);
    expect(isExerciseLocked(["shapes/e1", "shapes/e2"], "shapes", "e3", exercises)).toBe(false);
  });

  it("locks an exercise when an immediate predecessor is missing", () => {
    expect(isExerciseLocked([], "shapes", "e2", exercises)).toBe(true);
    expect(isExerciseLocked(["shapes/e1"], "shapes", "e3", exercises)).toBe(true);
  });

  it("requires the course-slug-prefixed completion id", () => {
    expect(isExerciseLocked(["e1"], "shapes", "e2", exercises)).toBe(true);
  });

  it("returns false for unknown exercise ids", () => {
    expect(isExerciseLocked([], "shapes", "nope", exercises)).toBe(false);
  });
});
