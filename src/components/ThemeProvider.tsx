import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULTS } from "../constants/Defaults";
import { deriveColorsFromAccent, type DerivedColors } from "../utils/colorUtils";
import { applyAccentIcon } from "../utils/dynamicIcon";

type ThemeColorScheme = "light" | "dark";

interface ThemeContextValue {
  colorScheme: ThemeColorScheme;
  toggleTheme: () => void;
  ctaColor: string;
  setCtaColor: (color: string) => void;
  derivedColors: DerivedColors;
}

const THEME_KEY = "userColorScheme";
const CTA_COLOR_KEY = "setting_ctaColor";

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: "light",
  toggleTheme: () => {},
  ctaColor: DEFAULTS.ctaColor,
  setCtaColor: () => {},
  derivedColors: deriveColorsFromAccent(DEFAULTS.ctaColor, false),
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useRNColorScheme();
  const [userScheme, setUserScheme] = useState<ThemeColorScheme | null>(null);
  const [ctaColor, setCtaColorState] = useState(DEFAULTS.ctaColor);

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, CTA_COLOR_KEY])
      .then(([schemeEntry, ctaEntry]) => {
        if (schemeEntry[1] === "light" || schemeEntry[1] === "dark") {
          setUserScheme(schemeEntry[1]);
        }
        if (ctaEntry[1]) {
          setCtaColorState(ctaEntry[1]);
        }
      })
      .catch(() => {});
  }, []);

  const colorScheme: ThemeColorScheme = userScheme ?? (systemScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    if (userScheme !== null) {
      AsyncStorage.setItem(THEME_KEY, userScheme).catch(() => {});
    }
  }, [userScheme]);

  const toggleTheme = useCallback(() => {
    setUserScheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setCtaColor = useCallback((color: string) => {
    setCtaColorState(color);
    AsyncStorage.setItem(CTA_COLOR_KEY, color).catch(() => {});
  }, []);

  const derivedColors = useMemo(
    () => deriveColorsFromAccent(ctaColor, colorScheme === "dark"),
    [ctaColor, colorScheme]
  );

  useEffect(() => {
    applyAccentIcon(ctaColor);
  }, [ctaColor]);

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme, ctaColor, setCtaColor, derivedColors }}>
      {children}
    </ThemeContext.Provider>
  );
}
