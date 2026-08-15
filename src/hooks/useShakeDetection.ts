import { useEffect, useRef, useCallback } from "react";
import { Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";

const SHAKE_THRESHOLD = 2.5;
const SHAKE_COOLDOWN_MS = 1000;
const UPDATE_INTERVAL_MS = 100;

export function useShakeDetection(
  onShake: () => void,
  options?: { enabled?: boolean; haptic?: boolean }
) {
  const { enabled = true, haptic = true } = options ?? {};
  const lastShakeRef = useRef(0);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });
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
      const last = lastAccelRef.current;

      const deltaX = Math.abs(x - last.x);
      const deltaY = Math.abs(y - last.y);
      const deltaZ = Math.abs(z - last.z);

      if (deltaX + deltaY + deltaZ > SHAKE_THRESHOLD) {
        triggerShake();
      }

      lastAccelRef.current = { x, y, z };
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, triggerShake]);
}
