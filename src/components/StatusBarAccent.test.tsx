import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { waitFor } from "@testing-library/react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StatusBarAccent from "./StatusBarAccent";
import { renderWithProviders } from "../test/renderWithProviders";

jest.mock("expo-status-bar", () => ({
  StatusBar: jest.fn(() => null),
}));

const mockStatusBar = jest.mocked(StatusBar);

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
  it("renders a visible status bar by default with a light-style accent", async () => {
    await renderWithProviders(<StatusBarAccent />);
    await waitFor(() => expect(mockStatusBar).toHaveBeenCalledTimes(1));
    expect(lastStatusBarProps().hidden).toBeUndefined();
    expect(lastStatusBarProps()).toMatchObject({
      style: "light",
      backgroundColor: "#FF69B4",
    });
  });

  it("hides the status bar when the user setting is 'false'", async () => {
    await AsyncStorage.setItem("setting_showStatusBar", "false");
    await renderWithProviders(<StatusBarAccent />);
    await waitFor(() => expect(lastStatusBarProps().hidden).toBe(true));
  });

  it("renders in the dark scheme with the surface background", async () => {
    await AsyncStorage.setItem("userColorScheme", "dark");
    await renderWithProviders(<StatusBarAccent />);
    await waitFor(() => expect(lastStatusBarProps().backgroundColor).toBe("#121317"));
  });
});
