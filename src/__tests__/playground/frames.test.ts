import { describe, expect, it } from "@jest/globals";
import { parseFrameInput } from "../../utils/playground/frames";

describe("parseFrameInput", () => {
  it("parses comma-separated frames", () => {
    expect(parseFrameInput("0, 30, 60", 60)).toEqual([0, 30, 60]);
  });

  it("parses ranges with step", () => {
    expect(parseFrameInput("0-10 step 5", 60)).toEqual([0, 5, 10]);
  });

  it("dedupes and sorts", () => {
    expect(parseFrameInput("10, 0, 5, 5", 60)).toEqual([0, 5, 10]);
  });

  it("caps at maxFrames", () => {
    expect(parseFrameInput("0-100 step 1", 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("ignores invalid input", () => {
    expect(parseFrameInput("a, , -1x, 3", 60)).toEqual([3]);
  });
});
