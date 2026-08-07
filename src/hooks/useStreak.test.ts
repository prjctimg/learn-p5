import { describe, it, expect, jest, afterEach, beforeEach } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStreak, getStreakFromStorage } from "./useStreak";

const RealDate = globalThis.Date;
let clock: number;

function mockClock(iso: string) {
  clock = new RealDate(iso).getTime();
}

beforeEach(() => {
  mockClock("2026-01-10T12:00:00.000Z");
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

describe("useStreak", () => {
  it("starts a fresh streak and persists the visit", async () => {
    const { result } = renderHook(() => useStreak());
    await waitFor(() => expect(result.current.count).toBe(1));
    expect(result.current.longest).toBe(1);
    expect(result.current.isNewDay).toBe(true);
    expect(await AsyncStorage.getItem("streak_count")).toBe("1");
    expect(await AsyncStorage.getItem("streak_last_visit")).toBe("2026-01-10");
    expect(await AsyncStorage.getItem("streak_longest")).toBe("1");
  });

  it("continues an existing streak visited yesterday", async () => {
    await AsyncStorage.setItem("streak_count", "4");
    await AsyncStorage.setItem("streak_longest", "6");
    await AsyncStorage.setItem("streak_last_visit", "2026-01-09");
    const { result } = renderHook(() => useStreak());
    await waitFor(() => expect(result.current.count).toBe(5));
    expect(result.current.longest).toBe(6);
    expect(result.current.isNewDay).toBe(true);
  });

  it("extends longest when the streak surpasses the previous record", async () => {
    await AsyncStorage.setItem("streak_count", "6");
    await AsyncStorage.setItem("streak_longest", "6");
    await AsyncStorage.setItem("streak_last_visit", "2026-01-09");
    const { result } = renderHook(() => useStreak());
    await waitFor(() => expect(result.current.count).toBe(7));
    expect(result.current.longest).toBe(7);
  });

  it("is a no-op on a same-day visit", async () => {
    await AsyncStorage.setItem("streak_count", "4");
    await AsyncStorage.setItem("streak_longest", "4");
    await AsyncStorage.setItem("streak_last_visit", "2026-01-10");
    const { result } = renderHook(() => useStreak());
    await waitFor(() => expect(result.current.count).toBe(4));
    expect(result.current.isNewDay).toBe(false);
    expect(await AsyncStorage.getItem("streak_last_visit")).toBe("2026-01-10");
  });

  it("resets to 1 after a gap longer than a day", async () => {
    await AsyncStorage.setItem("streak_count", "9");
    await AsyncStorage.setItem("streak_longest", "30");
    await AsyncStorage.setItem("streak_last_visit", "2026-01-05");
    const { result } = renderHook(() => useStreak());
    await waitFor(() => expect(result.current.count).toBe(1));
    expect(result.current.longest).toBe(30);
    expect(result.current.isNewDay).toBe(true);
  });

  it("reports tier info for the current count", async () => {
    await AsyncStorage.setItem("streak_count", "5");
    await AsyncStorage.setItem("streak_longest", "5");
    await AsyncStorage.setItem("streak_last_visit", "2026-01-09");
    const { result } = renderHook(() => useStreak());
    await waitFor(() => expect(result.current.currentTier).toBe(3));
    expect(result.current.nextTier).toBe(7);
    expect(result.current.tierProgress).toBeCloseTo(5 / 7, 10);
  });

  it("consumes a pending toast exactly once", async () => {
    await AsyncStorage.setItem("streak_toast_pending", "true");
    const { result } = renderHook(() => useStreak());
    await waitFor(() => expect(result.current.count).toBe(1));
    const toast = await result.current.consumePendingToast();
    expect(toast?.count).toBe(1);
    expect(await AsyncStorage.getItem("streak_toast_pending")).toBeNull();
    expect(await result.current.consumePendingToast()).toBeNull();
  });

  it("returns null from consumePendingToast when nothing is pending", async () => {
    const { result } = renderHook(() => useStreak());
    await waitFor(() => expect(result.current.count).toBe(1));
    expect(await result.current.consumePendingToast()).toBeNull();
  });
});

describe("getStreakFromStorage", () => {
  it("returns persisted values, defaulting to zero", async () => {
    expect(await getStreakFromStorage()).toEqual({ count: 0, longest: 0 });
    await AsyncStorage.setItem("streak_count", "3");
    await AsyncStorage.setItem("streak_longest", "9");
    expect(await getStreakFromStorage()).toEqual({ count: 3, longest: 9 });
  });
});
