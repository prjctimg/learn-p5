export interface EditorThemeColors {
  name: string;
  bg: string;
  fg: string;
  gutterFg: string;
  gutterBorder: string;
  activeBg: string;
  selBg: string;
  keyword: string;
  definitionKeyword: string;
  string: string;
  number: string;
  comment: string;
  type: string;
  function: string;
  operator: string;
  constant: string;
}

interface ThemeDefinition {
  id: string;
  label: string;
  light: EditorThemeColors;
  dark: EditorThemeColors;
}

export const EDITOR_THEMES: Record<string, ThemeDefinition> = {
  "p5-learn": {
    id: "p5-learn",
    label: "p5 Learn",
    light: {
      name: "p5 Light",
      bg: "#FFFFFF",
      fg: "#1F2937",
      gutterFg: "#9CA3AF",
      gutterBorder: "#E5E7EB",
      activeBg: "rgba(0,0,0,0.03)",
      selBg: "rgba(237,34,93,0.15)",
      keyword: "#ED225D",
      definitionKeyword: "#ED225D",
      string: "#16A34A",
      number: "#D31D4E",
      comment: "#6B7280",
      type: "#BE185D",
      function: "#BE185D",
      operator: "#374151",
      constant: "#D31D4E",
    },
    dark: {
      name: "p5 Dark",
      bg: "#0D0E12",
      fg: "#E3E2E7",
      gutterFg: "#6B7280",
      gutterBorder: "#292A2E",
      activeBg: "rgba(255,255,255,0.03)",
      selBg: "rgba(237,34,93,0.2)",
      keyword: "#ED225D",
      definitionKeyword: "#ED225D",
      string: "#22C55E",
      number: "#FF4F75",
      comment: "#6B7280",
      type: "#FFB2BB",
      function: "#FFB2BB",
      operator: "#E3E2E7",
      constant: "#FF4F75",
    },
  },
  "tokyonight": {
    id: "tokyonight",
    label: "Tokyo Night",
    light: {
      name: "Tokyo Night Light",
      bg: "#F5F6FA",
      fg: "#343B58",
      gutterFg: "#9699A3",
      gutterBorder: "#D5D8E1",
      activeBg: "rgba(89,103,176,0.08)",
      selBg: "rgba(89,103,176,0.15)",
      keyword: "#8C4351",
      definitionKeyword: "#8C4351",
      string: "#33635C",
      number: "#965027",
      comment: "#9699A3",
      type: "#5A4A78",
      function: "#5A4A78",
      operator: "#343B58",
      constant: "#965027",
    },
    dark: {
      name: "Tokyo Night Dark",
      bg: "#1A1B26",
      fg: "#A9B1D6",
      gutterFg: "#565F89",
      gutterBorder: "#292E42",
      activeBg: "rgba(169,177,214,0.03)",
      selBg: "rgba(169,177,214,0.08)",
      keyword: "#BB9AF7",
      definitionKeyword: "#BB9AF7",
      string: "#9ECE6A",
      number: "#FF9E64",
      comment: "#565F89",
      type: "#7AA2F7",
      function: "#7AA2F7",
      operator: "#A9B1D6",
      constant: "#FF9E64",
    },
  },
  "github": {
    id: "github",
    label: "GitHub",
    light: {
      name: "GitHub Light",
      bg: "#FFFFFF",
      fg: "#24292F",
      gutterFg: "#6E7781",
      gutterBorder: "#D0D7DE",
      activeBg: "rgba(0,0,0,0.03)",
      selBg: "rgba(9,105,218,0.15)",
      keyword: "#CF222E",
      definitionKeyword: "#CF222E",
      string: "#0A3069",
      number: "#0550AE",
      comment: "#6E7781",
      type: "#0550AE",
      function: "#8250DF",
      operator: "#24292F",
      constant: "#953800",
    },
    dark: {
      name: "GitHub Dark",
      bg: "#0D1117",
      fg: "#E6EDF3",
      gutterFg: "#8B949E",
      gutterBorder: "#30363D",
      activeBg: "rgba(255,255,255,0.03)",
      selBg: "rgba(56,139,253,0.2)",
      keyword: "#FF7B72",
      definitionKeyword: "#FF7B72",
      string: "#A5D6FF",
      number: "#D2A8FF",
      comment: "#8B949E",
      type: "#D2A8FF",
      function: "#D2A8FF",
      operator: "#E6EDF3",
      constant: "#79C0FF",
    },
  },
  "github-cvd": {
    id: "github-cvd",
    label: "GitHub CVD",
    light: {
      name: "GitHub CVD Light",
      bg: "#FFFFFF",
      fg: "#24292F",
      gutterFg: "#6E7781",
      gutterBorder: "#D0D7DE",
      activeBg: "rgba(0,0,0,0.03)",
      selBg: "rgba(9,105,218,0.15)",
      keyword: "#953800",
      definitionKeyword: "#953800",
      string: "#0550AE",
      number: "#0A3069",
      comment: "#6E7781",
      type: "#0A3069",
      function: "#8250DF",
      operator: "#24292F",
      constant: "#953800",
    },
    dark: {
      name: "GitHub CVD Dark",
      bg: "#0D1117",
      fg: "#E6EDF3",
      gutterFg: "#8B949E",
      gutterBorder: "#30363D",
      activeBg: "rgba(255,255,255,0.03)",
      selBg: "rgba(56,139,253,0.2)",
      keyword: "#FFA657",
      definitionKeyword: "#FFA657",
      string: "#A5D6FF",
      number: "#79C0FF",
      comment: "#8B949E",
      type: "#79C0FF",
      function: "#79C0FF",
      operator: "#E6EDF3",
      constant: "#FFA657",
    },
  },
};

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

function lightenHex(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const lr = Math.round(r + (255 - r) * factor);
  const lg = Math.round(g + (255 - g) * factor);
  const lb = Math.round(b + (255 - b) * factor);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

function darkenHex(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const dr = Math.round(r * (1 - factor));
  const dg = Math.round(g * (1 - factor));
  const db = Math.round(b * (1 - factor));
  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
}

export function getThemeSwatches(themeId: string, colorScheme: "light" | "dark"): string[] {
  const themeDef = EDITOR_THEMES[themeId] || EDITOR_THEMES["p5-learn"];
  const colors = colorScheme === "dark" ? themeDef.dark : themeDef.light;
  return [colors.keyword, colors.string, colors.number, colors.type];
}

export function getEditorTheme(themeId: string, colorScheme: "light" | "dark", ctaColor?: string): EditorThemeColors {
  const themeDef = EDITOR_THEMES[themeId] || EDITOR_THEMES["p5-learn"];
  const base = colorScheme === "dark" ? { ...themeDef.dark } : { ...themeDef.light };

  if (!ctaColor || themeId !== "p5-learn") return base;

  const isDark = colorScheme === "dark";
  base.keyword = ctaColor;
  base.definitionKeyword = ctaColor;
  base.number = isDark ? lightenHex(ctaColor, 0.15) : darkenHex(ctaColor, 0.15);
  base.type = isDark ? lightenHex(ctaColor, 0.35) : darkenHex(ctaColor, 0.25);
  base.function = base.type;
  base.constant = base.number;
  base.selBg = `rgba(${hexToRgb(ctaColor)},0.2)`;

  return base;
}
