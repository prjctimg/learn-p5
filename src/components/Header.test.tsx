import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import { Text } from "react-native";
import Header from "./Header";
import { useDrawerContext } from "../contexts/DrawerContext";
import { renderWithProviders } from "../test/renderWithProviders";
import { mockRouterModule, mockRouter } from "../test/expoRouterMock";

jest.mock("expo-router", () => mockRouterModule);

function DrawerProbe() {
  const { isOpen } = useDrawerContext();
  return <Text testID="drawer-state">{isOpen ? "open" : "closed"}</Text>;
}

describe("Header", () => {
  beforeEach(() => {
    mockRouter.back.mockClear();
  });

  it("renders title and subtitle", () => {
    const { getByText } = renderWithProviders(
      <Header title="Shapes" subtitle="Module 1" />
    );
    expect(getByText("Shapes")).toBeTruthy();
    expect(getByText("Module 1")).toBeTruthy();
  });

  it("goes back via the router by default", () => {
    const { getByLabelText } = renderWithProviders(<Header title="Shapes" />);
    fireEvent.press(getByLabelText("Go back"));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it("uses the provided onBack instead of the router", () => {
    const onBack = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <Header title="Shapes" onBack={onBack} />
    );
    fireEvent.press(getByLabelText("Go back"));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it("renders the hamburger and opens the drawer when showBack is false", () => {
    const { getByLabelText, getByTestId } = renderWithProviders(
      <>
        <Header title="Home" showBack={false} />
        <DrawerProbe />
      </>,
      { withDrawer: true }
    );
    fireEvent.press(getByLabelText("Open navigation drawer"));
    expect(getByTestId("drawer-state").props.children).toBe("open");
  });

  it("renders the right slot", () => {
    const { getByTestId } = renderWithProviders(
      <Header title="Shapes" right={<Text testID="right-slot">extra</Text>} />
    );
    expect(getByTestId("right-slot")).toBeTruthy();
  });
});
