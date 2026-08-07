import { describe, it, expect } from "@jest/globals";
import {
  STREAK_TIERS,
  getCurrentTierIndex,
  getTierInfo,
  computeStreakTransition,
} from "./streakLogic";

describe("STREAK_TIERS", () => {
  it("is sorted ascending with the expected milestones", () => {
    expect(STREAK_TIERS).toEqual([3, 7, 14, 30, 100, 365]);
  });
});

describe("getCurrentTierIndex", () => {
  it("returns -1 below the first tier", () => {
    expect(getCurrentTierIndex(0)).toBe(-1);
    expect(getCurrentTierIndex(2)).toBe(-1);
  });

  it("matches the tier at exact milestone values", () => {
    expect(getCurrentTierIndex(3)).toBe(0);
    expect(getCurrentTierIndex(7)).toBe(1);
    expect(getCurrentTierIndex(365)).toBe(5);
  });

  it("picks the highest tier not exceeded", () => {
    expect(getCurrentTierIndex(10)).toBe(1);
    expect(getCurrentTierIndex(1000)).toBe(5);
  });
});

describe("getTierInfo", () => {
  it("reports currentTier 0 with the first tier as next below the floor", () => {
    const info = getTierInfo(1);
    expect(info.currentTier).toBe(0);
    expect(info.nextTier).toBe(3);
  });

  it("reports progress toward the next tier", () => {
    const info = getTierInfo(5);
    expect(info.currentTier).toBe(3);
    expect(info.nextTier).toBe(7);
    expect(info.tierProgress).toBeCloseTo(5 / 7, 10);
  });

  it("saturates at the top tier", () => {
    const info = getTierInfo(400);
    expect(info.currentTier).toBe(365);
    expect(info.nextTier).toBe(365);
    expect(info.tierProgress).toBe(1);
  });
});

describe("computeStreakTransition", () => {
  const base = {
    lastVisit: null,
    today: "2026-01-10",
    yesterday: "2026-01-09",
    prevCount: 0,
    prevLongest: 0,
  };

  it("starts a fresh streak at 1 with no prior visit", () => {
    expect(computeStreakTransition(base)).toEqual({
      count: 1,
      longest: 1,
      isNewDay: true,
    });
  });

  it("continues the streak when the last visit was yesterday", () => {
    expect(
      computeStreakTransition({ ...base, lastVisit: "2026-01-09", prevCount: 4, prevLongest: 6 })
    ).toEqual({ count: 5, longest: 6, isNewDay: true });
  });

  it("extends the longest when the continued streak surpasses it", () => {
    expect(
      computeStreakTransition({ ...base, lastVisit: "2026-01-09", prevCount: 6, prevLongest: 6 })
    ).toEqual({ count: 7, longest: 7, isNewDay: true });
  });

  it("is a no-op when visiting again on the same day", () => {
    expect(
      computeStreakTransition({ ...base, lastVisit: "2026-01-10", prevCount: 5, prevLongest: 9 })
    ).toEqual({ count: 5, longest: 9, isNewDay: false });
  });

  it("resets to 1 after a gap of more than one day", () => {
    expect(
      computeStreakTransition({ ...base, lastVisit: "2026-01-07", prevCount: 3, prevLongest: 8 })
    ).toEqual({ count: 1, longest: 8, isNewDay: true });
  });

  it("resets to 1 after a gap crossing from yesterday back to today", () => {
    expect(
      computeStreakTransition({ ...base, lastVisit: "2026-01-08", prevCount: 2, prevLongest: 2 })
    ).toEqual({ count: 1, longest: 2, isNewDay: true });
  });

  it("never reduces longest on reset", () => {
    expect(
      computeStreakTransition({ ...base, lastVisit: "2026-01-01", prevCount: 1, prevLongest: 30 })
    ).toEqual({ count: 1, longest: 30, isNewDay: true });
  });
});
