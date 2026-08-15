/**
 * Pure streak bookkeeping, extracted from useStreak so the day-transition and
 * tier math can be unit-tested without a React renderer.
 */

export const STREAK_TIERS: number[] = [3, 7, 14, 30, 100, 365];

export function getCurrentTierIndex(days: number): number {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (days >= STREAK_TIERS[i]) return i;
  }
  return -1;
}

export interface TierInfo {
  currentTier: number;
  nextTier: number;
  tierProgress: number;
}

export function getTierInfo(days: number): TierInfo {
  const idx = getCurrentTierIndex(days);
  const nextTier =
    idx >= STREAK_TIERS.length - 1
      ? STREAK_TIERS[STREAK_TIERS.length - 1]
      : STREAK_TIERS[idx + 1];
  return {
    currentTier: idx >= 0 ? STREAK_TIERS[idx] : 0,
    nextTier,
    tierProgress: nextTier > 0 ? days / nextTier : 1,
  };
}

export interface StreakTransitionInput {
  lastVisit: string | null;
  today: string;
  yesterday: string;
  prevCount: number;
  prevLongest: number;
}

export interface StreakTransitionResult {
  count: number;
  longest: number;
  isNewDay: boolean;
}

/**
 * Compute the new streak state for a visit.
 * - Same calendar day as the last visit: nothing changes.
 * - Yesterday: streak continues (+1).
 * - Anything else (gap, first visit): resets to 1.
 * Longest is never reduced.
 */
export function computeStreakTransition(
  input: StreakTransitionInput
): StreakTransitionResult {
  const { lastVisit, today, yesterday, prevCount, prevLongest } = input;

  if (lastVisit === today) {
    return { count: prevCount, longest: prevLongest, isNewDay: false };
  }

  const count = lastVisit === yesterday ? prevCount + 1 : 1;
  const longest = Math.max(prevLongest, count);
  return { count, longest, isNewDay: true };
}
