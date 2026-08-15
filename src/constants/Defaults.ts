export const DEFAULTS = {
  codeFontSize: 22,
  codeFontSizeMin: 14,
  codeFontSizeMax: 48,
  codeFontSizeStep: 2,
  keyboardHeight: "medium" as const,
  keyboardHeightPixels: {
    small: 230,
    medium: 280,
    tall: 360,
  } as Record<string, number>,
  codeBackground: "auto",
};
