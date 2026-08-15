import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { render, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StatusBarAccent from "./StatusBarAccent";
import { renderWithProviders } from "../test/renderWithProviders";

const mockStatusBar = jest.fn().mockImplementation(() => null);

jest.mock("expo-status-bar", () => ({
  StatusBar: mockStatusBar,
}));

function lastStatusBarProps() {
  const calls = mockStatusBar.mock.calls;
  return calls[calls.length - 1][0];
}

afterEach(async () => {
  jest.restoreAllMocks();
  mockStatusBar.mockClear();
  await AsyncStorage.clear();
});

describe("StatusBarAccent", () => {
  it("renders a visible status bar by default with a light-style accent", () => {
    renderWithProviders(<StatusBarAccent />);
    expect(mockStatusBar).toHaveBeenCalledTimes(1);
    expect(lastStatusBarProps()).toMatchObject({
      hidden: false,
      style: "dark",
      backgroundColor: "#FF69B4",
    });
  });

  it("hides the status bar when the user setting is 'false'", async () => {
    await AsyncStorage.setItem("setting_showStatusBar", "false");
    renderWithProviders(<StatusBarAccent />);
    await waitFor(() => expect(mockStatusBar).toHaveBeenCalled());
    expect(lastStatusBarProps().hidden).toBe(true);
  });

  it("renders in the dark scheme with the surface background", async () => {
    await AsyncStorage.setItem("userColorScheme", "dark");
    renderWithProviders(<StatusBarAccent />);
    await waitFor(() => expect(mockStatusBar).toHaveBeenCalled());
    expect(lastStatusBarProps().backgroundColor).toBe("#121317");
  });
});
