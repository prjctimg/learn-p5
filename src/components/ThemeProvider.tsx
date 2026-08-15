import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeColorScheme = "light" | "dark";

interface ThemeContextValue {
  colorScheme: ThemeColorScheme;
  toggleTheme: () => void;
}

const THEME_KEY = "userColorScheme";

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: "light",
  toggleTheme: () => {},
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

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark") {
          setUserScheme(stored);
        }
      })
      .catch(() => {});
  }, []);

  const colorScheme: ThemeColorScheme = userScheme ?? (systemScheme === "dark" ? "dark" : "light");

  const toggleTheme = () => {
    const next = colorScheme === "light" ? "dark" : "light";
    setUserScheme(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
