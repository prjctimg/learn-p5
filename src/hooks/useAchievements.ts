import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  rule: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-strokes",
    title: "First Strokes",
    subtitle: "Complete your first exercise",
    icon: "brush-variant",
    rule: "first completion event",
  },
  {
    id: "daily-3",
    title: "Daily 3",
    subtitle: "Complete 3 exercises in one day",
    icon: "calendar-check",
    rule: "3 exercises on the same calendar day",
  },
  {
    id: "quickdraw",
    title: "Quickdraw",
    subtitle: "Complete an exercise in under 30 seconds",
    icon: "timer-sand",
    rule: "durationMs < 30000",
  },
  {
    id: "on-a-roll",
    title: "On a Roll",
    subtitle: "Complete 3 exercises within 10 minutes",
    icon: "lightning-bolt",
    rule: "3 events within a 10-minute window",
  },
  {
    id: "weekender",
    title: "Weekender",
    subtitle: "Reach a 7-day streak",
    icon: "trophy",
    rule: "streak_count >= 7",
  },
];

interface CompletionEvent {
  ts: number;
  exerciseId: string;
  durationMs?: number;
}

const UNLOCKED_KEY = "achievements_unlocked";
const UNLOCKED_AT_KEY = "achievements_unlocked_at";
const EVENTS_KEY = "completion_events";

function dateKey(ts: number): string {
  return new Date(ts).toISOString().split("T")[0];
}

/**
 * Record a completion event and return the list of achievement IDs that
 * became newly unlocked as a result (idempotent on exerciseId per day —
 * re-running the same exercise on the same day does not double-count).
 */
export async function recordCompletion(
  exerciseId: string,
  durationMs?: number
): Promise<string[]> {
  const eventsRaw = await AsyncStorage.getItem(EVENTS_KEY);
  const events: CompletionEvent[] = eventsRaw ? JSON.parse(eventsRaw) : [];

  // De-duplicate by exerciseId within today's date bucket.
  const today = dateKey(Date.now());
  const alreadyToday = events.some(
    (e) => e.exerciseId === exerciseId && dateKey(e.ts) === today
  );
  if (!alreadyToday) {
    events.push({ ts: Date.now(), exerciseId, durationMs });
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }

  const unlockedRaw = await AsyncStorage.getItem(UNLOCKED_KEY);
  const unlocked: string[] = unlockedRaw ? JSON.parse(unlockedRaw) : [];
  const unlockedAtRaw = await AsyncStorage.getItem(UNLOCKED_AT_KEY);
  const unlockedAt: Record<string, string> = unlockedAtRaw ? JSON.parse(unlockedAtRaw) : {};
  const newlyUnlocked: string[] = [];

  function grant(id: string, predicate: () => boolean) {
    if (!unlocked.includes(id) && !newlyUnlocked.includes(id) && predicate()) {
      newlyUnlocked.push(id);
      unlocked.push(id);
      if (!unlockedAt[id]) unlockedAt[id] = new Date().toISOString();
    }
  }

  const todays = events.filter((e) => dateKey(e.ts) === today);

  grant("first-strokes", () => events.length >= 1);
  grant("daily-3", () => todays.length >= 3);
  grant("quickdraw", () => events.some((e) => (e.durationMs ?? Infinity) < 30000));

  // On a Roll: 3 events within any 10-minute window.
  grant("on-a-roll", () => {
    if (events.length < 3) return false;
    const sorted = [...events].sort((a, b) => a.ts - b.ts);
    for (let i = 2; i < sorted.length; i++) {
      if (sorted[i].ts - sorted[i - 2].ts <= 10 * 60 * 1000) return true;
    }
    return false;
  });

  // Weekender: streak >= 7. Read live so the badge can unlock the moment
  // the streak crosses the threshold, independent of completion timing.
  const streakCountStr = await AsyncStorage.getItem("streak_count");
  const streakCount = streakCountStr ? parseInt(streakCountStr, 10) : 0;
  grant("weekender", () => streakCount >= 7);

  // Backfill: any achievement unlocked before timestamps were tracked gets
// today's date so its badge modal can still show an "earned" date.
  let backfilled = false;
  for (const id of unlocked) {
    if (!unlockedAt[id]) {
      unlockedAt[id] = new Date().toISOString();
      backfilled = true;
    }
  }

  if (newlyUnlocked.length > 0 || backfilled) {
    await AsyncStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
    await AsyncStorage.setItem(UNLOCKED_AT_KEY, JSON.stringify(unlockedAt));
  }

  return newlyUnlocked;
}

export async function getUnlockedAchievements(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(UNLOCKED_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getUnlockedAchievementsAt(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(UNLOCKED_AT_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [unlockedAt, setUnlockedAt] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    setUnlocked(await getUnlockedAchievements());
    setUnlockedAt(await getUnlockedAchievementsAt());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { unlocked, unlockedAt, refresh };
}