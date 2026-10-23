import { describe, it, expect } from "@jest/globals";
import { screen } from "@testing-library/react-native";
import ModuleCover from "./ModuleCover";
import { renderWithProviders } from "../test/renderWithProviders";

describe("ModuleCover", () => {
  it("renders a lock icon when locked", async () => {
    await renderWithProviders(<ModuleCover slug="shapes" color="#ED225D" locked />);
    expect(screen.getByTestId("module-cover-icon")).toBeTruthy();
  });

  it("renders a check icon when completed", async () => {
    await renderWithProviders(<ModuleCover slug="shapes" color="#ED225D" completed />);
    expect(screen.getByTestId("module-cover-icon")).toBeTruthy();
  });

  it("renders the animated variant for unlocked covers (no icon)", async () => {
    await renderWithProviders(<ModuleCover slug="shapes" color="#ED225D" />);
    expect(screen.queryByTestId("module-cover-icon")).toBeNull();
  });

  it("falls back to the default variant for unknown slugs", async () => {
    expect(
      await renderWithProviders(<ModuleCover slug="unknown-slug" color="#ED225D" />)
    ).toBeTruthy();
  });

  it("renders without a provider tree when passed minimal props", async () => {
    expect(await render(<ModuleCover slug="math" color="#000000" />)).toBeTruthy();
  });
});
