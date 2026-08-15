export const Colors = {
  light: {
    primary: "#ED225D",
    onPrimary: "#FFFFFF",
    surface: "#FFFFFF",
    onSurface: "#000000",
    surfaceDim: "#F3F4F6",
    outline: "#000000",
    textSecondary: "#6B7280",
  },
  dark: {
    primary: "#ED225D",
    onPrimary: "#FFFFFF",
    surface: "#121212",
    onSurface: "#F5F5F5",
    surfaceDim: "#1E1E1E",
    outline: "#757575",
    textSecondary: "#9CA3AF",
  },
} as const;

export type ThemeColorScheme = keyof typeof Colors;
