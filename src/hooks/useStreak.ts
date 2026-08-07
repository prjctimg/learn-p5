import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  STREAK_TIERS,
  getTierInfo,
  computeStreakTransition,
} from "../utils/streakLogic";

const STREAK_COUNT_KEY = "streak_count";
const LAST_VISIT_KEY = "streak_last_visit";
const LONGEST_STREAK_KEY = "streak_longest";
const STREAK_TOAST_PENDING_KEY = "streak_toast_pending";

export { STREAK_TIERS };

interface StreakData {
  count: number;
  longest: number;
  isNewDay: boolean;
  currentTier: number;
  nextTier: number;
  tierProgress: number;
}

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function useStreak(): StreakData & {
  checkStreak: () => Promise<boolean>;
  consumePendingToast: () => Promise<StreakData | null>;
} {
  const [streakData, setStreakData] = useState<StreakData>({
    count: 0,
    longest: 0,
    isNewDay: false,
    currentTier: 0,
    nextTier: STREAK_TIERS[0],
    tierProgress: 0,
  });

  const checkStreak = useCallback(async (): Promise<boolean> => {
    const today = getDateString(new Date());
    const lastVisit = await AsyncStorage.getItem(LAST_VISIT_KEY);
    const prevCount = parseInt(await AsyncStorage.getItem(STREAK_COUNT_KEY) || "0", 10);
    const prevLongest = parseInt(await AsyncStorage.getItem(LONGEST_STREAK_KEY) || "0", 10);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const transition = computeStreakTransition({
      lastVisit,
      today,
      yesterday: getDateString(yesterday),
      prevCount,
      prevLongest,
    });

    const { count, longest, isNewDay } = transition;
    const tier = getTierInfo(count);

    if (isNewDay) {
      await AsyncStorage.multiSet([
        [STREAK_COUNT_KEY, count.toString()],
        [LAST_VISIT_KEY, today],
        [LONGEST_STREAK_KEY, longest.toString()],
        [STREAK_TOAST_PENDING_KEY, "true"],
      ]);
    }

    setStreakData({
      count,
      longest,
      isNewDay,
      currentTier: tier.currentTier,
      nextTier: tier.nextTier,
      tierProgress: tier.tierProgress,
    });

    return isNewDay;
  }, []);

  const consumePendingToast = useCallback(async (): Promise<StreakData | null> => {
    const pending = await AsyncStorage.getItem(STREAK_TOAST_PENDING_KEY);
    if (pending !== "true") return null;
    await AsyncStorage.removeItem(STREAK_TOAST_PENDING_KEY);
    return streakData;
  }, [streakData]);

  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  return { ...streakData, checkStreak, consumePendingToast };
}

export async function getStreakFromStorage(): Promise<{ count: number; longest: number }> {
  const count = parseInt(await AsyncStorage.getItem(STREAK_COUNT_KEY) || "0", 10);
  const longest = parseInt(await AsyncStorage.getItem(LONGEST_STREAK_KEY) || "0", 10);
  return { count, longest };
}
