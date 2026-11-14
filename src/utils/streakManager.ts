export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export const STREAK_STORAGE_KEYS = {
  CURRENT_STREAK: 'currentStreak',
  LONGEST_STREAK: 'longestStreak',
  LAST_ACTIVE_DATE: 'lastActiveDate',
  PROFILE: 'chess-openings-user-profile',
} as const;

/**
 * Returns the calendar date string in YYYY-MM-DD format using local time.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the exact difference in calendar days between two YYYY-MM-DD date strings.
 * Uses Date.UTC to prevent daylight-savings or local timezone drift.
 *
 * Example:
 *   getCalendarDayDifference('2026-11-13', '2026-11-14') === 1 (consecutive day)
 *   getCalendarDayDifference('2026-11-12', '2026-11-14') === 2 (> 1 day, missed day)
 *   getCalendarDayDifference('2026-11-14', '2026-11-14') === 0 (same day)
 */
export function getCalendarDayDifference(fromDateStr: string, toDateStr: string): number {
  const [y1, m1, d1] = fromDateStr.split('-').map(Number);
  const [y2, m2, d2] = toDateStr.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
}

/**
 * Safely loads streak data from localStorage without mutating or resetting it.
 * Reads dedicated localStorage keys ('currentStreak', 'longestStreak', 'lastActiveDate')
 * as well as the composite user profile if present.
 */
export function loadStreakData(): StreakData {
  let currentStreak = 0;
  let longestStreak = 0;
  let lastActiveDate: string | null = null;

  try {
    const rawCurrent = localStorage.getItem(STREAK_STORAGE_KEYS.CURRENT_STREAK);
    const rawLongest = localStorage.getItem(STREAK_STORAGE_KEYS.LONGEST_STREAK);
    const rawDate = localStorage.getItem(STREAK_STORAGE_KEYS.LAST_ACTIVE_DATE);

    if (rawCurrent !== null) {
      const parsed = parseInt(rawCurrent, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        currentStreak = parsed;
      }
    }
    if (rawLongest !== null) {
      const parsed = parseInt(rawLongest, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        longestStreak = parsed;
      }
    }
    if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      lastActiveDate = rawDate;
    }

    // If individual keys were not found or need fallback, inspect composite profile
    const rawProfile = localStorage.getItem(STREAK_STORAGE_KEYS.PROFILE);
    if (rawProfile) {
      const profile = JSON.parse(rawProfile);
      if (rawCurrent === null && typeof profile.currentStreak === 'number' && profile.currentStreak >= 0) {
        currentStreak = Math.floor(profile.currentStreak);
      }
      if (rawLongest === null && typeof profile.longestStreak === 'number' && profile.longestStreak >= 0) {
        longestStreak = Math.floor(profile.longestStreak);
      }
      if (!lastActiveDate && typeof profile.lastActiveDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(profile.lastActiveDate)) {
        lastActiveDate = profile.lastActiveDate;
      }
    }
  } catch (error) {
    console.error('Could not load streak data from localStorage:', error);
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastActiveDate,
  };
}

/**
 * Persists streak variables to localStorage across sessions.
 * Writes to both dedicated keys and updates the composite user profile.
 */
export function saveStreakData(streak: StreakData): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEYS.CURRENT_STREAK, String(streak.currentStreak));
    localStorage.setItem(STREAK_STORAGE_KEYS.LONGEST_STREAK, String(streak.longestStreak));
    if (streak.lastActiveDate) {
      localStorage.setItem(STREAK_STORAGE_KEYS.LAST_ACTIVE_DATE, streak.lastActiveDate);
    } else {
      localStorage.removeItem(STREAK_STORAGE_KEYS.LAST_ACTIVE_DATE);
    }

    // Sync into composite user profile if one exists in storage
    const rawProfile = localStorage.getItem(STREAK_STORAGE_KEYS.PROFILE);
    if (rawProfile) {
      try {
        const profile = JSON.parse(rawProfile);
        profile.currentStreak = streak.currentStreak;
        profile.longestStreak = streak.longestStreak;
        profile.lastActiveDate = streak.lastActiveDate;
        localStorage.setItem(STREAK_STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      } catch {
        // Ignore json parse issues
      }
    }
  } catch (error) {
    console.error('Could not save streak data to localStorage:', error);
  }
}

export type StreakTransitionStatus = 'incremented' | 'started' | 'reset' | 'already_active';

export interface StreakUpdateResult {
  nextStreak: StreakData;
  isNewActivityToday: boolean;
  status: StreakTransitionStatus;
}

/**
 * Validates and calculates streak progression based on calendar day logic:
 *
 * 1. If activity already completed today: keep current streak unchanged.
 * 2. If activity completed today and completed yesterday (gap === 1): increment currentStreak by 1.
 * 3. If first activity ever: start streak at 1.
 * 4. If more than one calendar day passed (gap > 1): reset streak to 1 upon completing today's action.
 */
export function calculateStreakUpdate(
  current: StreakData,
  today: Date = new Date()
): StreakUpdateResult {
  const todayKey = getLocalDateKey(today);
  const prevDate = current.lastActiveDate;

  // Already completed an activity today: keep current streak count the same
  if (prevDate === todayKey) {
    return {
      nextStreak: {
        currentStreak: current.currentStreak,
        longestStreak: Math.max(current.longestStreak, current.currentStreak),
        lastActiveDate: todayKey,
      },
      isNewActivityToday: false,
      status: 'already_active',
    };
  }

  let nextStreakCount: number;
  let status: StreakTransitionStatus;

  if (!prevDate || current.currentStreak <= 0) {
    // First-ever qualifying activity
    nextStreakCount = 1;
    status = 'started';
  } else {
    const gap = getCalendarDayDifference(prevDate, todayKey);
    if (gap === 1) {
      // Completed yesterday: consecutive day -> increment
      nextStreakCount = current.currentStreak + 1;
      status = 'incremented';
    } else if (gap > 1) {
      // More than one full calendar day passed without engagement -> reset to 1
      nextStreakCount = 1;
      status = 'reset';
    } else {
      // gap <= 0 (e.g. slight time drift or timezone adjustment)
      nextStreakCount = current.currentStreak;
      status = 'already_active';
    }
  }

  const nextLongest = Math.max(current.longestStreak, nextStreakCount);

  return {
    nextStreak: {
      currentStreak: nextStreakCount,
      longestStreak: nextLongest,
      lastActiveDate: todayKey,
    },
    isNewActivityToday: status !== 'already_active',
    status,
  };
}
