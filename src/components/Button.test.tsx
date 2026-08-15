import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "./Button";
import { renderWithProviders } from "../test/renderWithProviders";

describe("Button", () => {
  const onPress = jest.fn();

  beforeEach(() => {
    onPress.mockClear();
  });

  it("renders the title and fires onPress when pressed", () => {
    const { getByText } = renderWithProviders(
      <Button title="Go" onPress={onPress} />
    );
    fireEvent.press(getByText("Go"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("uses the title as the default accessibility label", () => {
    const { getByLabelText } = renderWithProviders(
      <Button title="Start" onPress={onPress} />
    );
    expect(getByLabelText("Start")).toBeTruthy();
  });

  it("honors an explicit accessibilityLabel", () => {
    const { getByLabelText } = renderWithProviders(
      <Button title="Start" onPress={onPress} accessibilityLabel="Launch" />
    );
    expect(getByLabelText("Launch")).toBeTruthy();
  });

  it("does not fire when disabled", () => {
    const { getByLabelText } = renderWithProviders(
      <Button title="Start" onPress={onPress} disabled />
    );
    fireEvent.press(getByLabelText("Start"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders both variants without throwing", () => {
    renderWithProviders(<Button title="Primary" onPress={onPress} variant="primary" />);
    renderWithProviders(<Button title="Outline" onPress={onPress} variant="outline" />);
  });
});
