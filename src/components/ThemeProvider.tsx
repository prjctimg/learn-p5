import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULTS } from "../constants/Defaults";
import { STORAGE_KEYS } from "../constants/StorageKeys";
import { deriveColorsFromAccent, type DerivedColors } from "../utils/colorUtils";

type ThemeColorScheme = "light" | "dark";

interface ThemeContextValue {
  colorScheme: ThemeColorScheme;
  toggleTheme: () => void;
  ctaColor: string;
  setCtaColor: (color: string) => void;
  derivedColors: DerivedColors;
}

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
  const [ctaColor, setStoredCtaColor] = useState(DEFAULTS.ctaColor);

  useEffect(() => {
    AsyncStorage.multiGet([STORAGE_KEYS.userColorScheme, STORAGE_KEYS.settingCtaColor])
      .then(([schemeEntry, ctaEntry]) => {
        if (schemeEntry[1] === "light" || schemeEntry[1] === "dark") {
          setUserScheme(schemeEntry[1]);
        }
        if (ctaEntry[1]) {
          setStoredCtaColor(ctaEntry[1]);
        }
      })
      .catch(() => {});
  }, []);

  const colorScheme: ThemeColorScheme = userScheme ?? (systemScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    if (userScheme !== null) {
      AsyncStorage.setItem(STORAGE_KEYS.userColorScheme, userScheme).catch(() => {});
    }
  }, [userScheme]);

  const toggleTheme = useCallback(() => {
    setUserScheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setCtaColor = useCallback((color: string) => {
    setStoredCtaColor(color);
    AsyncStorage.setItem(STORAGE_KEYS.settingCtaColor, color).catch(() => {});
  }, []);

  const derivedColors = useMemo(
    () => deriveColorsFromAccent(ctaColor, colorScheme === "dark"),
    [ctaColor, colorScheme]
  );

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme, ctaColor, setCtaColor, derivedColors }}>
      {children}
    </ThemeContext.Provider>
  );
}
