/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ED225D",
        },
        "on-primary": {
          DEFAULT: "#FFFFFF",
        },
        p5: {
          pink: "#ED225D",
          dark: "#222222",
          light: "#F5F5F5",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#121212",
        },
        "on-surface": {
          DEFAULT: "#000000",
          dark: "#F5F5F5",
        },
        "surface-dim": {
          DEFAULT: "#F3F4F6",
          dark: "#1E1E1E",
        },
        outline: {
          DEFAULT: "#000000",
          dark: "#757575",
        },
        "text-secondary": {
          DEFAULT: "#6B7280",
          dark: "#9CA3AF",
        },
      },
      fontFamily: {
        headline: ["SpaceGrotesk", "sans-serif"],
        display: ["SpaceGrotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
        mono: ["JetBrainsMono", "monospace"],
      },
    },
  },
  plugins: [],
};
