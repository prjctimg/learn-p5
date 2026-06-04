import { createContext, useContext, type ReactNode } from "react";
import { useColorScheme } from "nativewind";

type ThemeColorScheme = "light" | "dark";

interface ThemeContextValue {
  colorScheme: ThemeColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ThemeColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: "light",
  toggleTheme: () => {},
  setColorScheme: () => {},
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: colorScheme ?? "light",
        toggleTheme: toggleColorScheme,
        setColorScheme: (scheme) => setColorScheme(scheme),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
