import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { fireEvent } from "@testing-library/react-native";
import Button from "./Button";
import { renderWithProviders } from "../test/renderWithProviders";

describe("Button", () => {
  const onPress = jest.fn();

  beforeEach(() => {
    onPress.mockClear();
  });

  it("renders the title and fires onPress when pressed", async () => {
    const { getByText } = await renderWithProviders(
      <Button title="Go" onPress={onPress} />
    );
    await fireEvent.press(getByText("Go"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("uses the title as the default accessibility label", async () => {
    const { getByLabelText } = await renderWithProviders(
      <Button title="Start" onPress={onPress} />
    );
    expect(getByLabelText("Start")).toBeTruthy();
  });

  it("honors an explicit accessibilityLabel", async () => {
    const { getByLabelText } = await renderWithProviders(
      <Button title="Start" onPress={onPress} accessibilityLabel="Launch" />
    );
    expect(getByLabelText("Launch")).toBeTruthy();
  });

  it("does not fire when disabled", async () => {
    const { getByLabelText } = await renderWithProviders(
      <Button title="Start" onPress={onPress} disabled />
    );
    await fireEvent.press(getByLabelText("Start"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders both variants without throwing", async () => {
    await renderWithProviders(<Button title="Primary" onPress={onPress} variant="primary" />);
    await renderWithProviders(<Button title="Outline" onPress={onPress} variant="outline" />);
  });
});
