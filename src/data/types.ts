export type ValidationRule =
  | { type: "functionCall"; name: string; exactArgs?: number; minArgs?: number }
  | { type: "functionExists"; name: string }
  | { type: "noError" }
  | { type: "canvasSize"; width: number; height: number }
  | { type: "pixelMatch"; x: number; y: number; expected: [number, number, number]; tolerance?: number };

export interface ExerciseTask {
  id: string;
  title: string;
  instruction: string;
  validation: ValidationRule[];
  startingCode?: string;
  solution?: string;
}

export interface Exercise {
  id: string;
  title: string;
  module: string;
  description: string;
  instruction: string;
  startingCode?: string;
  solution?: string;
  validation?: ValidationRule[];
  tasks?: ExerciseTask[];
}

export interface Course {
  slug: string;
  title: string;
  moduleName: string;
  description: string;
  exercises: Exercise[];
}
