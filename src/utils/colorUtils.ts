function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  const l1 = luminance(a.r, a.g, a.b);
  const l2 = luminance(b.r, b.g, b.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function bestOnColor(bgHex: string): string {
  return contrastRatio(bgHex, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#1C1B1F";
}

export interface DerivedColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  primaryFixedDim: string;
  inversePrimary: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  outline: string;
  outlineVariant: string;
}

export function deriveColorsFromAccent(accentHex: string, isDark: boolean): DerivedColors {
  const rgb = hexToRgb(accentHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const h = hsl.h;
  const s = hsl.s;
  const l = hsl.l;

  if (isDark) {
    return {
      primary: accentHex,
      onPrimary: bestOnColor(accentHex),
      primaryContainer: hslToHex(h, Math.min(100, s + 10), Math.min(85, l + 20)),
      onPrimaryContainer: hslToHex(h, Math.min(100, s + 15), Math.max(10, l - 30)),
      primaryFixedDim: hslToHex(h, Math.min(100, s - 5), Math.min(90, l + 30)),
      inversePrimary: hslToHex(h, Math.min(100, s - 10), Math.max(25, l - 15)),
      secondary: hslToHex(h, Math.min(100, s - 20), Math.min(90, l + 25)),
      onSecondary: hslToHex(h, Math.min(100, s - 10), Math.max(15, l - 20)),
      secondaryContainer: hslToHex(h, Math.min(100, s - 15), Math.max(20, l - 10)),
      onSecondaryContainer: hslToHex(h, Math.min(100, s - 5), Math.min(90, l + 30)),
      tertiary: hslToHex(h, Math.min(100, s - 25), Math.min(90, l + 25)),
      onTertiary: hslToHex(h, Math.min(100, s - 15), Math.max(15, l - 20)),
      tertiaryContainer: hslToHex(h, Math.min(100, s - 20), Math.max(20, l - 10)),
      onTertiaryContainer: hslToHex(h, Math.min(100, s - 10), Math.min(90, l + 30)),
      outline: hslToHex(h, Math.min(100, s - 30), Math.min(70, l + 10)),
      outlineVariant: hslToHex(h, Math.min(100, s - 40), Math.max(15, l - 15)),
    };
  }

  return {
    primary: accentHex,
    onPrimary: bestOnColor(accentHex),
    primaryContainer: hslToHex(h, Math.min(100, s + 5), Math.min(97, l + 30)),
    onPrimaryContainer: hslToHex(h, Math.min(100, s + 15), Math.max(10, l - 35)),
    primaryFixedDim: hslToHex(h, Math.min(100, s - 5), Math.min(85, l + 15)),
    inversePrimary: hslToHex(h, Math.min(100, s - 5), Math.max(30, l - 10)),
    secondary: hslToHex(h, Math.min(100, s - 25), Math.max(25, l - 15)),
    onSecondary: "#FFFFFF",
    secondaryContainer: hslToHex(h, Math.min(100, s + 5), Math.min(97, l + 30)),
    onSecondaryContainer: hslToHex(h, Math.min(100, s - 10), Math.max(10, l - 35)),
    tertiary: hslToHex(h, Math.min(100, s - 30), Math.max(25, l - 15)),
    onTertiary: "#FFFFFF",
    tertiaryContainer: hslToHex(h, Math.min(100, s), Math.min(96, l + 28)),
    onTertiaryContainer: hslToHex(h, Math.min(100, s - 15), Math.max(10, l - 35)),
    outline: hslToHex(h, Math.min(100, s - 35), Math.max(35, l - 5)),
    outlineVariant: hslToHex(h, Math.min(100, s - 45), Math.min(85, l + 15)),
  };
}

export function deriveAccentShades(accentHex: string): {
  dark: string;
  medium: string;
  light: string;
  veryLight: string;
} {
  const rgb = hexToRgb(accentHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const h = hsl.h;
  const s = hsl.s;
  return {
    dark: hslToHex(h, Math.min(100, s + 10), Math.max(15, hsl.l - 25)),
    medium: accentHex,
    light: hslToHex(h, Math.min(100, s - 5), Math.min(90, hsl.l + 20)),
    veryLight: hslToHex(h, Math.min(100, s + 5), Math.min(97, hsl.l + 35)),
  };
}
