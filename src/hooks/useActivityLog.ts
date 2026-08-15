import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVITY_LOG_KEY = "activity_log";

export type ActivityMap = Record<string, number>;

function dateKey(ts: number): string {
  return new Date(ts).toISOString().split("T")[0];
}

export async function recordActivity(atMs?: number): Promise<void> {
  const ts = atMs ?? Date.now();
  const key = dateKey(ts);
  const raw = await AsyncStorage.getItem(ACTIVITY_LOG_KEY);
  const map: ActivityMap = raw ? JSON.parse(raw) : {};
  map[key] = (map[key] ?? 0) + 1;
  await AsyncStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(map));
}

export async function getActivityMap(): Promise<ActivityMap> {
  const raw = await AsyncStorage.getItem(ACTIVITY_LOG_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function useActivityLog() {
  const [activity, setActivity] = useState<ActivityMap>({});

  const refresh = useCallback(async () => {
    setActivity(await getActivityMap());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { activity, refresh };
}