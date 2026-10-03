import { Exercise } from "../data/types";

/**
 * Per-exercise editor state and the AsyncStorage key that persists it.
 *
 * The exercise screen drives all of its load/run/complete transitions through
 * `exerciseReducer` so that the editor, the preview WebView and the draft-save
 * effect can never disagree about what the current code is.
 */

// Prefix keeps these drafts in their own AsyncStorage namespace so they can't
// collide with the progress keys in `STORAGE_KEYS`.
const CODE_KEY_PREFIX = "exerciseCode";

/**
 * AsyncStorage key holding the learner's in-progress code for one exercise.
 * Namespaced by course slug so ids stay unique across courses.
 */
export function getExerciseCodeKey(courseSlug: string, exerciseId: string): string {
  return `${CODE_KEY_PREFIX}:${courseSlug}/${exerciseId}`;
}

export interface ExerciseState {
  /** The loaded exercise, or null while loading / after a load failure. */
  exercise: Exercise | null;
  loading: boolean;
  /** Live editor contents. Mirrors the CodeMirror instance in the WebView. */
  code: string;
  /** The exercise's `startingCode`, kept so RESET_CODE never needs to reload. */
  startingCode: string;
  /** True between RUN_START and RUN_DONE; drives the Run button's spinner. */
  isRunning: boolean;
  /** True once the preview reports the whole exercise validated. */
  completed: boolean;
  error: string | null;
  /** Index into `exercise.tasks` of the task currently being worked on. */
  currentTaskIndex: number;
  /** Indices of tasks the preview has already validated. */
  completedTasks: number[];
}

export type ExerciseAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_DONE"; exercise: Exercise | null }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "SET_CODE"; code: string }
  | { type: "RESET_CODE" }
  | { type: "RUN_START" }
  | { type: "RUN_DONE" }
  | { type: "EXERCISE_COMPLETE" }
  | { type: "TASK_COMPLETE"; taskIndex: number };

export const initialExerciseState: ExerciseState = {
  exercise: null,
  loading: true,
  code: "",
  startingCode: "",
  isRunning: false,
  completed: false,
  error: null,
  currentTaskIndex: 0,
  completedTasks: [],
};

export function exerciseReducer(
  state: ExerciseState,
  action: ExerciseAction
): ExerciseState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loading: true, error: null };

    case "LOAD_DONE": {
      const startingCode = action.exercise?.startingCode ?? "";
      // Seed the editor with the starter code. A saved draft arrives as a
      // separate SET_CODE immediately after, so it wins when one exists.
      return {
        ...state,
        loading: false,
        error: null,
        exercise: action.exercise,
        code: startingCode,
        startingCode,
        isRunning: false,
        completed: false,
        currentTaskIndex: 0,
        completedTasks: [],
      };
    }

    case "LOAD_ERROR":
      return { ...state, loading: false, error: action.error, exercise: null };

    case "SET_CODE":
      return { ...state, code: action.code };

    case "RESET_CODE":
      // Resetting un-completes the exercise so the completion effect cannot
      // re-fire and double-count progress or achievements.
      return {
        ...state,
        code: state.startingCode,
        completed: false,
        currentTaskIndex: 0,
        completedTasks: [],
      };

    case "RUN_START":
      return { ...state, isRunning: true };

    case "RUN_DONE":
      return { ...state, isRunning: false };

    case "EXERCISE_COMPLETE":
      return { ...state, isRunning: false, completed: true };

    case "TASK_COMPLETE": {
      const total = state.exercise?.tasks?.length ?? 0;
      // Clamp so the final task's completion leaves the cursor on that task
      // instead of running off the end of the array.
      const nextIndex =
        total > 0 ? Math.min(action.taskIndex + 1, total - 1) : action.taskIndex;
      return {
        ...state,
        isRunning: false,
        currentTaskIndex: nextIndex,
        completedTasks: state.completedTasks.includes(action.taskIndex)
          ? state.completedTasks
          : [...state.completedTasks, action.taskIndex],
      };
    }

    default:
      return state;
  }
}
