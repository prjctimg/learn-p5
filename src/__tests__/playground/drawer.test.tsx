import React from "react";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import DrawerContent from "../../components/DrawerContent";
import ThemeProvider from "../../components/ThemeProvider";

jest.mock("expo-router", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("DrawerContent", () => {
  it("includes Playground nav item", async () => {
    render(
      <ThemeProvider>
        <DrawerContent onClose={() => {}} />
      </ThemeProvider>
    );
    expect(await screen.findByLabelText("Playground")).toBeTruthy();
  });
});
