import type { ReactElement } from "react";
import { render } from "@testing-library/react-native";
import ThemeProvider from "../components/ThemeProvider";
import DrawerProvider from "../contexts/DrawerContext";

interface RenderWithProvidersOptions {
  withDrawer?: boolean;
}

/**
 * Render a component wrapped in the app's real providers. ThemeProvider reads
 * AsyncStorage (mocked in jest.setup.js) and derives colors, which most
 * components depend on via useThemeContext().
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
) {
  const { withDrawer = false } = options;
  const wrapped = withDrawer ? <DrawerProvider>{ui}</DrawerProvider> : ui;
  return render(<ThemeProvider>{wrapped}</ThemeProvider>);
}
