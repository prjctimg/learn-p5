import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { fireEvent } from "@testing-library/react-native";
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

  it("renders title and subtitle", async () => {
    const { getByText } = await renderWithProviders(
      <Header title="Shapes" subtitle="Module 1" />
    );
    expect(getByText("Shapes")).toBeTruthy();
    expect(getByText("Module 1")).toBeTruthy();
  });

  it("goes back via the router by default", async () => {
    const { getByLabelText } = await renderWithProviders(<Header title="Shapes" />);
    await fireEvent.press(getByLabelText("Go back"));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it("uses the provided onBack instead of the router", async () => {
    const onBack = jest.fn();
    const { getByLabelText } = await renderWithProviders(
      <Header title="Shapes" onBack={onBack} />
    );
    await fireEvent.press(getByLabelText("Go back"));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it("renders the hamburger and opens the drawer when showBack is false", async () => {
    const { getByLabelText, getByTestId } = await renderWithProviders(
      <>
        <Header title="Home" showBack={false} />
        <DrawerProbe />
      </>,
      { withDrawer: true }
    );
    await fireEvent.press(getByLabelText("Open navigation drawer"));
    expect(getByTestId("drawer-state").props.children).toBe("open");
  });

  it("renders the right slot", async () => {
    const { getByTestId } = await renderWithProviders(
      <Header title="Shapes" right={<Text testID="right-slot">extra</Text>} />
    );
    expect(getByTestId("right-slot")).toBeTruthy();
  });
});
