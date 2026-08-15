export interface Lesson {
  id: string;
  title: string;
  module: string;
  description: string;
  instruction: string;
  startingCode?: string;
  solution?: string;
}

export interface Course {
  slug: string;
  title: string;
  moduleName: string;
  description: string;
  lessons: Lesson[];
}

export interface P5Symbol {
  name: string;
  module: string;
  description: string;
  syntax: string;
  parameters: { name: string; type: string; description: string }[];
  url: string;
}

export interface CourseManifest {
  slug: string;
  title: string;
  moduleName: string;
  description: string;
  lessons: string[];
}

export interface LessonFrontmatter {
  id: string;
  title: string;
  symbols: string[];
}
