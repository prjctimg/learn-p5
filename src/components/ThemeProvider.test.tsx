import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ThemeProvider, { useThemeContext } from "./ThemeProvider";
import { DEFAULTS } from "../constants/Defaults";

function Probe() {
  const { colorScheme, ctaColor, derivedColors, toggleTheme, setCtaColor } =
    useThemeContext();
  return (
    <>
      <Text testID="scheme">{colorScheme}</Text>
      <Text testID="cta">{ctaColor}</Text>
      <Text testID="primary">{derivedColors.primary}</Text>
      <Pressable testID="toggle" onPress={toggleTheme} />
      <Pressable testID="setcolor" onPress={() => setCtaColor("#123456")} />
    </>
  );
}

function renderProbe() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  );
}

afterEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

describe("ThemeProvider", () => {
  it("provides light scheme with the default accent by default", () => {
    const { getByTestId } = renderProbe();
    expect(getByTestId("scheme").props.children).toBe("light");
    expect(getByTestId("cta").props.children).toBe(DEFAULTS.ctaColor);
    expect(getByTestId("primary").props.children).toBe(DEFAULTS.ctaColor);
  });

  it("toggles the color scheme", () => {
    const { getByTestId } = renderProbe();
    fireEvent.press(getByTestId("toggle"));
    expect(getByTestId("scheme").props.children).toBe("dark");
    fireEvent.press(getByTestId("toggle"));
    expect(getByTestId("scheme").props.children).toBe("light");
  });

  it("persists the accent color to AsyncStorage", async () => {
    const { getByTestId } = renderProbe();
    fireEvent.press(getByTestId("setcolor"));
    expect(getByTestId("cta").props.children).toBe("#123456");
    await waitFor(() =>
      expect(AsyncStorage.getItem("setting_ctaColor")).resolves.toBe("#123456")
    );
  });

  it("restores a persisted color scheme", async () => {
    await AsyncStorage.setItem("userColorScheme", "dark");
    const { getByTestId } = renderProbe();
    await waitFor(() =>
      expect(getByTestId("scheme").props.children).toBe("dark")
    );
  });

  it("restores a persisted accent color", async () => {
    await AsyncStorage.setItem("setting_ctaColor", "#ABCDEF");
    const { getByTestId } = renderProbe();
    await waitFor(() =>
      expect(getByTestId("cta").props.children).toBe("#ABCDEF")
    );
  });
});
