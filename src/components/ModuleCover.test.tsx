import { describe, it, expect } from "@jest/globals";
import { screen, render } from "@testing-library/react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ModuleCover from "./ModuleCover";
import { renderWithProviders } from "../test/renderWithProviders";

describe("ModuleCover", () => {
  it("renders a lock icon when locked", () => {
    renderWithProviders(<ModuleCover slug="shapes" color="#ED225D" locked />);
    expect(screen.UNSAFE_queryAllByType(MaterialCommunityIcons).length).toBe(1);
  });

  it("renders a check icon when completed", () => {
    renderWithProviders(<ModuleCover slug="shapes" color="#ED225D" completed />);
    expect(screen.UNSAFE_queryAllByType(MaterialCommunityIcons).length).toBe(1);
  });

  it("renders the animated variant for unlocked covers (no icon)", () => {
    renderWithProviders(<ModuleCover slug="shapes" color="#ED225D" />);
    expect(screen.UNSAFE_queryAllByType(MaterialCommunityIcons).length).toBe(0);
  });

  it("falls back to the default variant for unknown slugs", () => {
    expect(() =>
      renderWithProviders(<ModuleCover slug="unknown-slug" color="#ED225D" />)
    ).not.toThrow();
  });

  it("renders without a provider tree when passed minimal props", () => {
    expect(() =>
      render(<ModuleCover slug="math" color="#000000" />)
    ).not.toThrow();
  });
});
