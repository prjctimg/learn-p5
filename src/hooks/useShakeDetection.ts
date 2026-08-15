import { useEffect, useRef, useCallback } from "react";
import { Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";

const SHAKE_THRESHOLD = 2.0;
const SHAKE_COOLDOWN_MS = 800;
const UPDATE_INTERVAL_MS = 50;
const WINDOW_SIZE = 3;

export function useShakeDetection(
  onShake: () => void,
  options?: { enabled?: boolean; haptic?: boolean }
) {
  const { enabled = true, haptic = true } = options ?? {};
  const lastShakeRef = useRef(0);
  const historyRef = useRef<{ x: number; y: number; z: number }[]>([]);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  const triggerShake = useCallback(() => {
    const now = Date.now();
    if (now - lastShakeRef.current < SHAKE_COOLDOWN_MS) return;
    lastShakeRef.current = now;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onShakeRef.current();
  }, [haptic]);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);

    const subscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y, z } = accelerometerData;
      const history = historyRef.current;

      history.push({ x, y, z });
      if (history.length > WINDOW_SIZE) {
        history.shift();
      }

      if (history.length < 2) return;

      const prev = history[history.length - 2];
      const deltaX = Math.abs(x - prev.x);
      const deltaY = Math.abs(y - prev.y);
      const deltaZ = Math.abs(z - prev.z);
      const magnitude = deltaX + deltaY + deltaZ;

      if (magnitude > SHAKE_THRESHOLD) {
        triggerShake();
      }
    });

    return () => {
      subscription.remove();
      historyRef.current = [];
    };
  }, [enabled, triggerShake]);
}
