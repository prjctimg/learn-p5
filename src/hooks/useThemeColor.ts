import { useColorScheme } from "react-native";

export function useThemeColor() {
  const systemScheme = useColorScheme();
  return systemScheme ?? "light";
}
