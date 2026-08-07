import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import Breadcrumbs from "./Breadcrumbs";
import { renderWithProviders } from "../test/renderWithProviders";
import { mockRouterModule, mockRouter } from "../test/expoRouterMock";

jest.mock("expo-router", () => mockRouterModule);

describe("Breadcrumbs", () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
  });

  it("renders every segment label", () => {
    const { getByText } = renderWithProviders(
      <Breadcrumbs
        segments={[
          { label: "Courses", href: "/" },
          { label: "Shapes", href: "/courses/shapes" },
          { label: "Circles" },
        ]}
      />
    );
    expect(getByText("Courses")).toBeTruthy();
    expect(getByText("Shapes")).toBeTruthy();
    expect(getByText("Circles")).toBeTruthy();
  });

  it("navigates to a href when a non-last segment is pressed", () => {
    const { getByLabelText } = renderWithProviders(
      <Breadcrumbs
        segments={[
          { label: "Courses", href: "/" },
          { label: "Shapes" },
        ]}
      />
    );
    fireEvent.press(getByLabelText("Go to Courses"));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("does not make the last segment clickable", () => {
    const { queryByLabelText } = renderWithProviders(
      <Breadcrumbs
        segments={[
          { label: "Courses", href: "/" },
          { label: "Shapes", href: "/courses/shapes" },
        ]}
      />
    );
    expect(queryByLabelText("Go to Shapes")).toBeNull();
  });
});
