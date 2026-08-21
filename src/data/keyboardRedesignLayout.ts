// Layout specification for the redesigned QWERTY keyboard.
// Pure data only — icons are resolved by the keyboard component via the
// key's `action` field, keeping this file free of component imports.

export type KeyAction = "shift" | "backspace" | "enter" | "space" | "symbolToggle";

export interface KeySpec {
  // Insertable glyph; action keys use a stable id instead.
  primary: string;
  secondary?: string[];
  widthUnits: number;
  action?: KeyAction;
}

export interface RowSpec {
  keyHeight: number; // design pixels at the 1000px-wide reference canvas
  insetUnits?: number; // leading inset expressed in units (1U = 90px)
  keys: KeySpec[];
}

export const DESIGN = {
  canvasWidth: 1000,
  unit: 90,
  hGap: 8,
  vGap: 10,
  outerPadding: 12,
} as const;

const U = 1;
const num = (primary: string, secondary?: string[]): KeySpec => ({ primary, secondary, widthUnits: U });
const letter = (primary: string, secondary?: string[]): KeySpec => ({ primary, secondary, widthUnits: U });

export const KEYBOARD_ROWS: RowSpec[] = [
  {
    // Row 1 — numbers (10 keys)
    keyHeight: 110,
    keys: [
      num("1", ["!"]),
      num("2", ["@"]),
      num("3", ["#"]),
      num("4", ["$"]),
      num("5", ["%"]),
      num("6", ["^"]),
      num("7", ["&"]),
      num("8", ["*"]),
      num("9", ["("]),
      num("0", [")"]),
    ],
  },
  {
    // Row 2 — top letters (10 keys)
    keyHeight: 125,
    keys: [
      letter("q"),
      letter("w"),
      letter("e", ["é", "è", "ê", "ë"]),
      letter("r"),
      letter("t"),
      letter("y"),
      letter("u", ["ú", "ù", "û", "ü"]),
      letter("i", ["í", "ì", "î", "ï"]),
      letter("o", ["ó", "ò", "ô", "ö", "õ"]),
      letter("p"),
    ],
  },
  {
    // Row 3 — middle letters (9 keys, staggered by 0.5U)
    keyHeight: 125,
    insetUnits: 0.5,
    keys: [
      letter("a", ["@", "á", "à", "â", "ä", "ã"]),
      letter("s", ["$", "ß"]),
      letter("d"),
      letter("f"),
      letter("g"),
      letter("h"),
      letter("j"),
      letter("k"),
      letter("l", [";", ":"]),
    ],
  },
  {
    // Row 4 — shift + bottom letters + backspace
    keyHeight: 125,
    keys: [
      { primary: "shift", widthUnits: 1.33, action: "shift" },
      letter("z"),
      letter("x", ["*"]),
      letter("c", ["ç", "("]),
      letter("v", [")"]),
      letter("b", ["["]),
      letter("n", ["ñ", "]"]),
      letter("m", ["-"]),
      { primary: "backspace", widthUnits: 1.33, action: "backspace" },
    ],
  },
  {
    // Row 5 — symbol toggle, comma, space, period, enter
    keyHeight: 110,
    keys: [
      { primary: "!#1", widthUnits: 1.44, action: "symbolToggle" },
      { primary: ",", secondary: ["<"], widthUnits: 0.89 },
      { primary: "space", widthUnits: 5.22, action: "space" },
      { primary: ".", secondary: [">"], widthUnits: 0.89 },
      { primary: "enter", widthUnits: 1.44, action: "enter" },
    ],
  },
];

export const LONG_PRESS_DELAY = 280;
export const POPUP_DISMISS_DELAY = 1200;
export const ALT_CELL_WIDTH = 38;
export const ALT_CELL_HEIGHT = 58;
export const POPUP_TOP_OFFSET = 6;
