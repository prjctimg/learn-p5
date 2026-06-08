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
        "primary-container": {
          DEFAULT: "#FF4F75",
        },
        "on-primary-container": {
          DEFAULT: "#5A001C",
        },
        "primary-fixed-dim": {
          DEFAULT: "#FFB2BB",
        },
        p5: {
          pink: "#ED225D",
          dark: "#222222",
          light: "#F5F5F5",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#121317",
        },
        "on-surface": {
          DEFAULT: "#000000",
          dark: "#E3E2E7",
        },
        "surface-dim": {
          DEFAULT: "#F3F4F6",
          dark: "#121317",
        },
        "surface-bright": {
          DEFAULT: "#FFFFFF",
          dark: "#38393D",
        },
        "surface-container": {
          DEFAULT: "#F5F5F5",
          dark: "#1E1F23",
        },
        "surface-container-low": {
          DEFAULT: "#FAFAFA",
          dark: "#1A1B1F",
        },
        "surface-container-high": {
          DEFAULT: "#EFEFEF",
          dark: "#292A2E",
        },
        "surface-container-highest": {
          DEFAULT: "#E5E5E5",
          dark: "#343539",
        },
        "surface-container-lowest": {
          DEFAULT: "#FFFFFF",
          dark: "#0D0E12",
        },
        "on-surface-variant": {
          DEFAULT: "#49454F",
          dark: "#E4BDC0",
        },
        outline: {
          DEFAULT: "#000000",
          dark: "#AB888B",
        },
        "outline-variant": {
          DEFAULT: "#C4C4C4",
          dark: "#5C3F42",
        },
        "text-secondary": {
          DEFAULT: "#6B7280",
          dark: "#9CA3AF",
        },
        "inverse-surface": {
          DEFAULT: "#000000",
          dark: "#E3E2E7",
        },
        "inverse-on-surface": {
          DEFAULT: "#FFFFFF",
          dark: "#2F3034",
        },
        error: {
          DEFAULT: "#BA1A1A",
          dark: "#FFB4AB",
        },
        "error-container": {
          DEFAULT: "#FFDAD6",
          dark: "#93000A",
        },
        "on-error": {
          DEFAULT: "#FFFFFF",
          dark: "#690005",
        },
        "on-error-container": {
          DEFAULT: "#410002",
          dark: "#FFDAD6",
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
