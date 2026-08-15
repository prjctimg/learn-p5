import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_COUNT_KEY = "streak_count";
const LAST_VISIT_KEY = "streak_last_visit";
const LONGEST_STREAK_KEY = "streak_longest";
const STREAK_TOAST_PENDING_KEY = "streak_toast_pending";

export const STREAK_TIERS = [3, 7, 14, 30, 100, 365];

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

function getCurrentTierIndex(days: number): number {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (days >= STREAK_TIERS[i]) return i;
  }
  return -1;
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

    if (lastVisit === today) {
      const idx = getCurrentTierIndex(prevCount);
      const nextTierVal = idx >= STREAK_TIERS.length - 1 ? STREAK_TIERS[STREAK_TIERS.length - 1] : STREAK_TIERS[idx + 1];
      const tierProgressVal = nextTierVal > 0 ? prevCount / nextTierVal : 1;
      setStreakData({
        count: prevCount,
        longest: prevLongest,
        isNewDay: false,
        currentTier: idx >= 0 ? STREAK_TIERS[idx] : 0,
        nextTier: nextTierVal,
        tierProgress: tierProgressVal,
      });
      return false;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getDateString(yesterday);

    let newCount: number;
    if (lastVisit === yesterdayStr) {
      newCount = prevCount + 1;
    } else {
      newCount = 1;
    }

    const newLongest = Math.max(prevLongest, newCount);
    const idx = getCurrentTierIndex(newCount);
    const nextTierVal = idx >= STREAK_TIERS.length - 1 ? STREAK_TIERS[STREAK_TIERS.length - 1] : STREAK_TIERS[idx + 1];
    const tierProgressVal = nextTierVal > 0 ? newCount / nextTierVal : 1;

    await AsyncStorage.multiSet([
      [STREAK_COUNT_KEY, newCount.toString()],
      [LAST_VISIT_KEY, today],
      [LONGEST_STREAK_KEY, newLongest.toString()],
      [STREAK_TOAST_PENDING_KEY, "true"],
    ]);

    setStreakData({
      count: newCount,
      longest: newLongest,
      isNewDay: true,
      currentTier: idx >= 0 ? STREAK_TIERS[idx] : 0,
      nextTier: nextTierVal,
      tierProgress: tierProgressVal,
    });

    return true;
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
