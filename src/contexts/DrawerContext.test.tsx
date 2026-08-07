import { describe, it, expect } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import DrawerProvider, { useDrawerContext } from "./DrawerContext";

function Probe() {
  const { isOpen, openDrawer, closeDrawer, toggleDrawer } = useDrawerContext();
  return (
    <>
      <Text testID="state">{isOpen ? "open" : "closed"}</Text>
      <Pressable testID="open" onPress={openDrawer} />
      <Pressable testID="close" onPress={closeDrawer} />
      <Pressable testID="toggle" onPress={toggleDrawer} />
    </>
  );
}

function renderProbe() {
  return render(
    <DrawerProvider>
      <Probe />
    </DrawerProvider>
  );
}

describe("DrawerProvider", () => {
  it("starts closed", () => {
    const { getByTestId } = renderProbe();
    expect(getByTestId("state").props.children).toBe("closed");
  });

  it("openDrawer and closeDrawer update the state", () => {
    const { getByTestId } = renderProbe();
    fireEvent.press(getByTestId("open"));
    expect(getByTestId("state").props.children).toBe("open");
    fireEvent.press(getByTestId("close"));
    expect(getByTestId("state").props.children).toBe("closed");
  });

  it("toggleDrawer flips the state", () => {
    const { getByTestId } = renderProbe();
    fireEvent.press(getByTestId("toggle"));
    expect(getByTestId("state").props.children).toBe("open");
    fireEvent.press(getByTestId("toggle"));
    expect(getByTestId("state").props.children).toBe("closed");
  });
});
