export interface ExperienceOption {
  label: string;
  description: string;
  value: string;
}

export interface PathOption {
  title: string;
  description: string;
  value: string;
}

export interface OnboardingSlide {
  id: string;
  type: "welcome" | "experience" | "path" | "ready";
}

export interface OnboardingData {
  experience: string | null;
  path: string | null;
}

const slides: OnboardingSlide[] = [
  { id: "1", type: "welcome" },
  { id: "2", type: "experience" },
  { id: "3", type: "path" },
  { id: "4", type: "ready" },
];

export const experienceOptions: ExperienceOption[] = [
  {
    label: "No experience",
    description: "Brand new to code",
    value: "beginner",
  },
  {
    label: "Some experience",
    description: "I know basic syntax",
    value: "intermediate",
  },
  {
    label: "A lot of experience",
    description: "I code complex projects",
    value: "advanced",
  },
];

export const pathOptions: PathOption[] = [
  {
    title: "Make generative art",
    description:
      "Explore algorithms that create beautiful, infinite visual complexity.",
    value: "generative-art",
  },
  {
    title: "Build interactive installations",
    description:
      "Learn how to connect code to sensors, cameras, and physical space.",
    value: "interactive",
  },
  {
    title: "Gain design skills",
    description:
      "Bridge the gap between design theory and technical implementation.",
    value: "design",
  },
  {
    title: "Just curious about code",
    description:
      "Start a fun hobby and learn logic through visual experimentation.",
    value: "curiosity",
  },
];

export function getSlideIndex(id: string): number {
  return slides.findIndex((s) => s.id === id);
}

export function getNextSlideId(id: string): string | null {
  const idx = getSlideIndex(id);
  if (idx < 0 || idx >= slides.length - 1) return null;
  return slides[idx + 1].id;
}

export function getPrevSlideId(id: string): string | null {
  const idx = getSlideIndex(id);
  if (idx <= 0) return null;
  return slides[idx - 1].id;
}

export function isLastSlide(id: string): boolean {
  return getSlideIndex(id) === slides.length - 1;
}

export function isFirstSlide(id: string): boolean {
  return getSlideIndex(id) === 0;
}

export default slides;
