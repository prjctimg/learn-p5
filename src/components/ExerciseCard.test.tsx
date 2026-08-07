import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";
import ExerciseCard from "./ExerciseCard";
import { renderWithProviders } from "../test/renderWithProviders";

describe("ExerciseCard", () => {
  const onContinue = jest.fn();

  beforeEach(() => {
    onContinue.mockClear();
  });

  it("renders title, module name and description", () => {
    const { getByText } = renderWithProviders(
      <ExerciseCard
        title="Circles"
        moduleName="Shapes"
        description="Draw a circle."
      />
    );
    expect(getByText("Circles")).toBeTruthy();
    expect(getByText("Shapes")).toBeTruthy();
    expect(getByText("Draw a circle.")).toBeTruthy();
  });

  it("fires onContinue when the unlocked card is pressed", () => {
    const { getByText } = renderWithProviders(
      <ExerciseCard
        title="Circles"
        moduleName="Shapes"
        description="Draw a circle."
        onContinue={onContinue}
      />
    );
    fireEvent.press(getByText("Circles"));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("shows the Continue button only for the current unlocked exercise", () => {
    const { getByText, rerender } = renderWithProviders(
      <ExerciseCard
        title="Circles"
        moduleName="Shapes"
        description="Draw a circle."
        isCurrent
        onContinue={onContinue}
      />
    );
    expect(getByText("Continue")).toBeTruthy();

    rerender(
      <ExerciseCard
        title="Circles"
        moduleName="Shapes"
        description="Draw a circle."
        onContinue={onContinue}
      />
    );
    expect(() => getByText("Continue")).toThrow();
  });

  it("marks the card as locked and refuses presses", () => {
    const { getByLabelText, getByText } = renderWithProviders(
      <ExerciseCard
        title="Circles"
        moduleName="Shapes"
        description="Draw a circle."
        locked
        lockHint="Ellipses"
        onContinue={onContinue}
      />
    );
    expect(getByLabelText(/Circles \(locked/)).toBeTruthy();
    expect(getByText('Complete "Ellipses" to unlock this one.')).toBeTruthy();
    fireEvent.press(getByLabelText(/Circles \(locked/));
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("shows the generic lock message when no lock hint is given", () => {
    const { getByText } = renderWithProviders(
      <ExerciseCard
        title="Circles"
        moduleName="Shapes"
        description="Draw a circle."
        locked
      />
    );
    expect(getByText("Complete the current module to unlock this one.")).toBeTruthy();
  });
});
