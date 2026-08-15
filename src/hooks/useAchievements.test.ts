import { describe, it, expect, jest, afterEach, beforeEach } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  recordCompletion,
  getUnlockedAchievements,
  getUnlockedAchievementsAt,
  ACHIEVEMENTS,
} from "./useAchievements";

const RealDate = globalThis.Date;
let clock: number;

function setClock(iso: string) {
  clock = new RealDate(iso).getTime();
}

function advanceMinutes(minutes: number) {
  clock += minutes * 60 * 1000;
}

beforeEach(() => {
  setClock("2026-01-10T12:00:00.000Z");
  jest.spyOn(globalThis, "Date").mockImplementation(
    ((...args: unknown[]) =>
      args.length === 0 ? new RealDate(clock) : new RealDate(...(args as []))) as unknown as typeof RealDate
  );
  jest.spyOn(globalThis.Date, "now").mockReturnValue(clock);
});

afterEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

describe("ACHIEVEMENTS catalog", () => {
  it("defines the five known achievements with unique ids", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(ids).toEqual([
      "first-strokes",
      "daily-3",
      "quickdraw",
      "on-a-roll",
      "weekender",
    ]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of ACHIEVEMENTS) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("recordCompletion", () => {
  it("unlocks first-strokes on the first completion", async () => {
    const newly = await recordCompletion("ex-a");
    expect(newly).toContain("first-strokes");
    expect(await getUnlockedAchievements()).toContain("first-strokes");
  });

  it("unlocks daily-3 after three distinct exercises on the same day", async () => {
    await recordCompletion("ex-a");
    await recordCompletion("ex-b");
    const newly = await recordCompletion("ex-c");
    expect(newly).toContain("daily-3");
  });

  it("does not count the same exercise twice on one day", async () => {
    await recordCompletion("ex-a");
    await recordCompletion("ex-a");
    await recordCompletion("ex-b");
    const newly = await recordCompletion("ex-b");
    expect(newly).not.toContain("daily-3");
  });

  it("counts the same exercise again on a different day", async () => {
    await recordCompletion("ex-a");
    await recordCompletion("ex-a"); // same day, ignored
    await recordCompletion("ex-b");
    advanceMinutes(60 * 24); // next day
    await recordCompletion("ex-a"); // different day, counted again
    const eventsRaw = await AsyncStorage.getItem("completion_events");
    const events = JSON.parse(eventsRaw ?? "[]") as Array<{ exerciseId: string }>;
    expect(events.filter((e) => e.exerciseId === "ex-a")).toHaveLength(2);
  });

  it("unlocks quickdraw for a completion under 30 seconds", async () => {
    const newly = await recordCompletion("ex-a", 20000);
    expect(newly).toContain("quickdraw");
  });

  it("does not unlock quickdraw for slow completions", async () => {
    await recordCompletion("ex-a", 60000);
    expect(await getUnlockedAchievements()).not.toContain("quickdraw");
  });

  it("unlocks on-a-roll when three completions land within ten minutes", async () => {
    await recordCompletion("ex-a", 1000);
    advanceMinutes(5);
    await recordCompletion("ex-b", 1000);
    advanceMinutes(5);
    const newly = await recordCompletion("ex-c", 1000);
    expect(newly).toContain("on-a-roll");
  });

  it("does not unlock on-a-roll when completions span more than ten minutes", async () => {
    await recordCompletion("ex-a");
    advanceMinutes(6);
    await recordCompletion("ex-b");
    advanceMinutes(6);
    await recordCompletion("ex-c");
    expect(await getUnlockedAchievements()).not.toContain("on-a-roll");
  });

  it("unlocks weekender when the streak has reached seven", async () => {
    await AsyncStorage.setItem("streak_count", "7");
    const newly = await recordCompletion("ex-a");
    expect(newly).toContain("weekender");
  });

  it("does not unlock weekender below a seven-day streak", async () => {
    await AsyncStorage.setItem("streak_count", "6");
    await recordCompletion("ex-a");
    expect(await getUnlockedAchievements()).not.toContain("weekender");
  });

  it("is idempotent and never re-reports an unlocked badge", async () => {
    const first = await recordCompletion("ex-a");
    const again = await recordCompletion("ex-b");
    expect(again).not.toContain("first-strokes");
    expect(first).toContain("first-strokes");
  });

  it("records unlock timestamps", async () => {
    await recordCompletion("ex-a");
    const at = await getUnlockedAchievementsAt();
    expect(Object.keys(at)).toContain("first-strokes");
    expect(at["first-strokes"]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
