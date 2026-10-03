import { describe, it, expect } from "@jest/globals";
import {
  exerciseReducer,
  getExerciseCodeKey,
  initialExerciseState,
  ExerciseState,
} from "./exerciseState";
import { Exercise } from "../data/types";

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "exercise-1",
    title: "First strokes",
    module: "Shapes",
    description: "Draw something.",
    instruction: "Draw a line.",
    startingCode: "// starter\n",
    ...overrides,
  };
}

function loaded(exercise: Exercise | null): ExerciseState {
  return exerciseReducer({ ...initialExerciseState, loading: false }, {
    type: "LOAD_DONE",
    exercise,
  });
}

describe("getExerciseCodeKey", () => {
  it("namespaces the key by course so identical exercise ids stay distinct", () => {
    expect(getExerciseCodeKey("shapes", "exercise-1")).not.toBe(
      getExerciseCodeKey("color", "exercise-1")
    );
  });

  it("is stable for the same course and exercise", () => {
    expect(getExerciseCodeKey("shapes", "exercise-1")).toBe(
      getExerciseCodeKey("shapes", "exercise-1")
    );
  });

  it("does not collide with the STORAGE_KEYS progress keys", () => {
    // The exact values are asserted so a future prefix collision is loud.
    expect(getExerciseCodeKey("shapes", "exercise-1")).toBe(
      "exerciseCode:shapes/exercise-1"
    );
  });
});

describe("exerciseReducer", () => {
  it("seeds the editor with startingCode on load", () => {
    const state = loaded(makeExercise());
    expect(state.code).toBe("// starter\n");
    expect(state.startingCode).toBe("// starter\n");
    expect(state.loading).toBe(false);
    expect(state.completed).toBe(false);
    expect(state.currentTaskIndex).toBe(0);
    expect(state.completedTasks).toEqual([]);
  });

  it("lets a restored draft override the starter code without losing startingCode", () => {
    // LOAD_DONE then SET_CODE is exactly the order the screen dispatches them.
    const afterLoad = loaded(makeExercise());
    const restored = exerciseReducer(afterLoad, { type: "SET_CODE", code: "line(0,0,9,9);" });
    expect(restored.code).toBe("line(0,0,9,9);");
    // RESET_CODE depends on this surviving the draft restore.
    expect(restored.startingCode).toBe("// starter\n");
  });

  it("clears the previous exercise's progress when a new one loads", () => {
    const dirty = exerciseReducer(loaded(makeExercise()), { type: "EXERCISE_COMPLETE" });
    const next = exerciseReducer(dirty, {
      type: "LOAD_DONE",
      exercise: makeExercise({ id: "exercise-2" }),
    });
    expect(next.completed).toBe(false);
    expect(next.currentTaskIndex).toBe(0);
    expect(next.completedTasks).toEqual([]);
    expect(next.code).toBe("// starter\n");
  });

  it("surfaces a load error and stops loading", () => {
    const state = exerciseReducer({ ...initialExerciseState }, {
      type: "LOAD_ERROR",
      error: "boom",
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe("boom");
    expect(state.exercise).toBeNull();
  });

  it("clears a stale error when a load is retried", () => {
    const failed = exerciseReducer({ ...initialExerciseState }, {
      type: "LOAD_ERROR",
      error: "boom",
    });
    const retrying = exerciseReducer(failed, { type: "LOAD_START" });
    expect(retrying.loading).toBe(true);
    expect(retrying.error).toBeNull();
  });

  it("restores the starter code on reset and un-completes the exercise", () => {
    let state = loaded(makeExercise());
    state = exerciseReducer(state, { type: "SET_CODE", code: "// user edit" });
    state = exerciseReducer(state, { type: "EXERCISE_COMPLETE" });
    const reset = exerciseReducer(state, { type: "RESET_CODE" });
    expect(reset.code).toBe("// starter\n");
    // Prevents the completion effect from double-counting progress.
    expect(reset.completed).toBe(false);
  });

  it("toggles isRunning across RUN_START / RUN_DONE", () => {
    const running = exerciseReducer(loaded(makeExercise()), { type: "RUN_START" });
    expect(running.isRunning).toBe(true);
    expect(exerciseReducer(running, { type: "RUN_DONE" }).isRunning).toBe(false);
  });

  it("marks the exercise complete and stops the spinner", () => {
    const running = exerciseReducer(loaded(makeExercise()), { type: "RUN_START" });
    const done = exerciseReducer(running, { type: "EXERCISE_COMPLETE" });
    expect(done.completed).toBe(true);
    expect(done.isRunning).toBe(false);
  });

  it("advances to the next task and records it as completed", () => {
    const exercise = makeExercise({
      tasks: [
        { id: "t1", title: "One", instruction: "do", validation: [] },
        { id: "t2", title: "Two", instruction: "do", validation: [] },
        { id: "t3", title: "Three", instruction: "do", validation: [] },
      ],
    });
    let state = loaded(exercise);
    state = exerciseReducer(state, { type: "TASK_COMPLETE", taskIndex: 0 });
    expect(state.currentTaskIndex).toBe(1);
    expect(state.completedTasks).toEqual([0]);
    state = exerciseReducer(state, { type: "TASK_COMPLETE", taskIndex: 1 });
    expect(state.currentTaskIndex).toBe(2);
    expect(state.completedTasks).toEqual([0, 1]);
  });

  it("clamps at the last task instead of running off the end", () => {
    const exercise = makeExercise({
      tasks: [
        { id: "t1", title: "One", instruction: "do", validation: [] },
        { id: "t2", title: "Two", instruction: "do", validation: [] },
      ],
    });
    const state = exerciseReducer(loaded(exercise), { type: "TASK_COMPLETE", taskIndex: 1 });
    expect(state.currentTaskIndex).toBe(1);
    expect(state.exercise?.tasks?.[state.currentTaskIndex]).toBeDefined();
  });

  it("does not record the same task twice", () => {
    const exercise = makeExercise({
      tasks: [
        { id: "t1", title: "One", instruction: "do", validation: [] },
        { id: "t2", title: "Two", instruction: "do", validation: [] },
      ],
    });
    let state = loaded(exercise);
    state = exerciseReducer(state, { type: "TASK_COMPLETE", taskIndex: 0 });
    const before = state;
    state = exerciseReducer(state, { type: "TASK_COMPLETE", taskIndex: 0 });
    expect(state.completedTasks).toEqual([0]);
    // Unchanged tasks array is returned by reference, so React can skip the re-render.
    expect(state.completedTasks).toBe(before.completedTasks);
  });

  it("stops the spinner when a task validates", () => {
    const running = exerciseReducer(loaded(makeExercise()), { type: "RUN_START" });
    expect(exerciseReducer(running, { type: "TASK_COMPLETE", taskIndex: 0 }).isRunning).toBe(false);
  });

  it("handles a missing exercise without throwing", () => {
    const state = loaded(null);
    expect(state.exercise).toBeNull();
    expect(state.code).toBe("");
    expect(exerciseReducer(state, { type: "TASK_COMPLETE", taskIndex: 0 }).currentTaskIndex).toBe(0);
  });
});
