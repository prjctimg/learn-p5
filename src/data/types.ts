export interface ValidationRule {
  type: "functionCall";
  name: string;
  exactArgs?: number;
  minArgs?: number;
}

export interface Lesson {
  id: string;
  title: string;
  module: string;
  description: string;
  instruction: string;
  startingCode?: string;
  solution?: string;
  validation?: ValidationRule[];
}

export interface Course {
  slug: string;
  title: string;
  moduleName: string;
  description: string;
  lessons: Lesson[];
}


