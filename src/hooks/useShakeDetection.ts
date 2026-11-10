import { useEffect, useRef, useCallback } from "react";
import { Accelerometer } from "expo-sensors";
import * as Haptics from "expo-haptics";

// Shake is reserved for opening the bug-report dialog. The detector is
// deliberately conservative so picking up or setting down the device does not
// trigger it: one sharp jolt is ignored, and two strong peaks must happen in
// quick succession before the callback fires.
const SHAKE_THRESHOLD = 8;
const SHAKE_PEAKS_REQUIRED = 2;
const SHAKE_PEAK_WINDOW_MS = 700;
const SHAKE_COOLDOWN_MS = 2500;
const UPDATE_INTERVAL_MS = 50;
const WINDOW_SIZE = 3;

export function useShakeDetection(
  onShake: () => void,
  options?: { enabled?: boolean; haptic?: boolean }
) {
  const { enabled = true, haptic = true } = options ?? {};
  const lastShakeRef = useRef(0);
  const historyRef = useRef<{ x: number; y: number; z: number }[]>([]);
  const peaksRef = useRef<number[]>([]);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  const triggerShake = useCallback(() => {
    const now = Date.now();
    if (now - lastShakeRef.current < SHAKE_COOLDOWN_MS) return;
    lastShakeRef.current = now;
    peaksRef.current = [];
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onShakeRef.current();
  }, [haptic]);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
    peaksRef.current = [];

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

      if (magnitude <= SHAKE_THRESHOLD) return;

      const now = Date.now();
      const peaks = peaksRef.current.filter(
        (peak) => now - peak < SHAKE_PEAK_WINDOW_MS
      );
      peaks.push(now);
      peaksRef.current = peaks;

      if (peaks.length >= SHAKE_PEAKS_REQUIRED) {
        triggerShake();
      }
    });

    return () => {
      subscription.remove();
      historyRef.current = [];
      peaksRef.current = [];
    };
  }, [enabled, triggerShake]);
}
