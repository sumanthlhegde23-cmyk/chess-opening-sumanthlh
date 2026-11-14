import assert from 'assert';
import {
  getLocalDateKey,
  getCalendarDayDifference,
  calculateStreakUpdate,
  loadStreakData,
  saveStreakData,
  StreakData,
  STREAK_STORAGE_KEYS,
} from '../src/utils/streakManager';
import { loadUserProfile, saveUserProfile, createDefaultUserProfile } from '../src/utils/userProfile';

// Mock localStorage for node environment
const storage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, val: string) => storage.set(key, String(val)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};

console.log('--- Starting Streak Tracking System Tests ---');

// Test 1: Date formatting and calendar day difference calculations
{
  console.log('Test 1: Calendar day difference calculations');
  assert.strictEqual(getCalendarDayDifference('2026-11-14', '2026-11-14'), 0, 'Same day gap must be 0');
  assert.strictEqual(getCalendarDayDifference('2026-11-13', '2026-11-14'), 1, 'Consecutive day gap must be 1');
  assert.strictEqual(getCalendarDayDifference('2026-11-12', '2026-11-14'), 2, '2 days ago gap must be 2');
  assert.strictEqual(getCalendarDayDifference('2026-10-31', '2026-11-01'), 1, 'Month boundary consecutive day');
  assert.strictEqual(getCalendarDayDifference('2025-12-31', '2026-01-01'), 1, 'Year boundary consecutive day');
  assert.strictEqual(getCalendarDayDifference('2024-02-28', '2024-02-29'), 1, 'Leap year consecutive day');
  console.log('✓ Test 1 passed');
}

// Test 2: Startup does NOT alter or award free streak
{
  console.log('Test 2: Startup does NOT alter or award free streak');
  localStorage.clear();
  localStorage.setItem(STREAK_STORAGE_KEYS.CURRENT_STREAK, '5');
  localStorage.setItem(STREAK_STORAGE_KEYS.LONGEST_STREAK, '10');
  localStorage.setItem(STREAK_STORAGE_KEYS.LAST_ACTIVE_DATE, '2026-11-10'); // 4 days ago

  // Load streak on startup
  const startupStreak = loadStreakData();
  assert.strictEqual(startupStreak.currentStreak, 5, 'Must reflect saved value (5) on startup');
  assert.strictEqual(startupStreak.longestStreak, 10, 'Must reflect saved longest (10) on startup');
  assert.strictEqual(startupStreak.lastActiveDate, '2026-11-10', 'Must reflect saved lastActiveDate');

  // Ensure storage was not mutated on startup
  assert.strictEqual(localStorage.getItem(STREAK_STORAGE_KEYS.CURRENT_STREAK), '5', 'localStorage was not altered');
  assert.strictEqual(localStorage.getItem(STREAK_STORAGE_KEYS.LAST_ACTIVE_DATE), '2026-11-10');

  // Also check loadUserProfile on startup
  const profile = loadUserProfile();
  assert.strictEqual(profile.currentStreak, 5, 'Profile currentStreak matches saved localStorage');
  assert.strictEqual(profile.longestStreak, 10, 'Profile longestStreak matches saved localStorage');
  assert.strictEqual(profile.lastActiveDate, '2026-11-10');
  console.log('✓ Test 2 passed');
}

// Test 3: First-ever qualifying activity starts streak at 1
{
  console.log('Test 3: First-ever qualifying activity');
  const initialStreak: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  };
  const today = new Date('2026-11-14T10:00:00');
  const update = calculateStreakUpdate(initialStreak, today);

  assert.strictEqual(update.isNewActivityToday, true);
  assert.strictEqual(update.status, 'started');
  assert.strictEqual(update.nextStreak.currentStreak, 1);
  assert.strictEqual(update.nextStreak.longestStreak, 1);
  assert.strictEqual(update.nextStreak.lastActiveDate, '2026-11-14');
  console.log('✓ Test 3 passed');
}

// Test 4: Consecutive day activity increments streak by 1
{
  console.log('Test 4: Consecutive day increments streak by 1');
  const currentStreak: StreakData = {
    currentStreak: 3,
    longestStreak: 5,
    lastActiveDate: '2026-11-13', // yesterday
  };
  const today = new Date('2026-11-14T15:30:00'); // > 24 hours later (e.g. active yesterday 9am, today 3:30pm)
  const update = calculateStreakUpdate(currentStreak, today);

  assert.strictEqual(update.isNewActivityToday, true);
  assert.strictEqual(update.status, 'incremented');
  assert.strictEqual(update.nextStreak.currentStreak, 4, 'Streak must increment from 3 to 4');
  assert.strictEqual(update.nextStreak.longestStreak, 5, 'Longest streak remains 5');
  assert.strictEqual(update.nextStreak.lastActiveDate, '2026-11-14');

  // If new streak exceeds longest, longest is updated
  const streakBreakingRecord: StreakData = {
    currentStreak: 5,
    longestStreak: 5,
    lastActiveDate: '2026-11-13',
  };
  const recordUpdate = calculateStreakUpdate(streakBreakingRecord, today);
  assert.strictEqual(recordUpdate.nextStreak.currentStreak, 6);
  assert.strictEqual(recordUpdate.nextStreak.longestStreak, 6);
  console.log('✓ Test 4 passed');
}

// Test 5: Multiple activities on the same calendar day keep streak unchanged
{
  console.log('Test 5: Multiple activities on the same day keep streak count the same');
  const alreadyActiveToday: StreakData = {
    currentStreak: 4,
    longestStreak: 6,
    lastActiveDate: '2026-11-14',
  };
  const todayLater = new Date('2026-11-14T20:00:00');
  const update = calculateStreakUpdate(alreadyActiveToday, todayLater);

  assert.strictEqual(update.isNewActivityToday, false, 'Must not count as a new activity day');
  assert.strictEqual(update.status, 'already_active');
  assert.strictEqual(update.nextStreak.currentStreak, 4, 'Streak count must remain 4');
  assert.strictEqual(update.nextStreak.longestStreak, 6);
  assert.strictEqual(update.nextStreak.lastActiveDate, '2026-11-14');
  console.log('✓ Test 5 passed');
}

// Test 6: Missed days (> 1 calendar day gap) resets streak to 1 upon completing action
{
  console.log('Test 6: Missed day(s) resets streak to 1 upon completing today activity');
  const missedDaysStreak: StreakData = {
    currentStreak: 12,
    longestStreak: 20,
    lastActiveDate: '2026-11-11', // 3 days ago (missed 12th and 13th)
  };
  const today = new Date('2026-11-14T09:00:00');
  const update = calculateStreakUpdate(missedDaysStreak, today);

  assert.strictEqual(update.isNewActivityToday, true);
  assert.strictEqual(update.status, 'reset');
  assert.strictEqual(update.nextStreak.currentStreak, 1, 'Streak must reset to 1');
  assert.strictEqual(update.nextStreak.longestStreak, 20, 'Longest streak must preserve highest historical value (20)');
  assert.strictEqual(update.nextStreak.lastActiveDate, '2026-11-14');
  console.log('✓ Test 6 passed');
}

// Test 7: Persistence in localStorage across sessions
{
  console.log('Test 7: Persistence in localStorage');
  localStorage.clear();

  const toSave: StreakData = {
    currentStreak: 7,
    longestStreak: 14,
    lastActiveDate: '2026-11-14',
  };
  saveStreakData(toSave);

  assert.strictEqual(localStorage.getItem(STREAK_STORAGE_KEYS.CURRENT_STREAK), '7');
  assert.strictEqual(localStorage.getItem(STREAK_STORAGE_KEYS.LONGEST_STREAK), '14');
  assert.strictEqual(localStorage.getItem(STREAK_STORAGE_KEYS.LAST_ACTIVE_DATE), '2026-11-14');

  const loaded = loadStreakData();
  assert.deepStrictEqual(loaded, toSave);

  // Profile save and load sync
  const defaultProfile = createDefaultUserProfile();
  defaultProfile.currentStreak = 7;
  defaultProfile.longestStreak = 14;
  defaultProfile.lastActiveDate = '2026-11-14';
  saveUserProfile(defaultProfile);

  const loadedProfile = loadUserProfile();
  assert.strictEqual(loadedProfile.currentStreak, 7);
  assert.strictEqual(loadedProfile.longestStreak, 14);
  assert.strictEqual(loadedProfile.lastActiveDate, '2026-11-14');
  console.log('✓ Test 7 passed');
}

console.log('All tests passed successfully! 🎉');
