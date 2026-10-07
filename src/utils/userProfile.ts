export interface UserProfile {
  username: string;
  avatarDataUrl: string | null;
  createdAt: string;
  lastLoginAt: string;
  loginHistory: string[];
  totalSeconds: number;
  learnedOpeningIds: string[];
  learnedVariationIds: string[];
  engineGames: {
    wins: number;
    losses: number;
    draws: number;
  };
}

const PROFILE_STORAGE_KEY = 'chess-openings-user-profile';

export function createDefaultUserProfile(): UserProfile {
  const now = new Date().toISOString();
  return {
    username: '',
    avatarDataUrl: null,
    createdAt: now,
    lastLoginAt: now,
    loginHistory: [],
    totalSeconds: 0,
    learnedOpeningIds: [],
    learnedVariationIds: [],
    engineGames: { wins: 0, losses: 0, draws: 0 },
  };
}

export function loadUserProfile(): UserProfile {
  let storedProfile: string | null;
  try {
    storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.error('Could not access the saved player profile in this browser.', error);
    return createDefaultUserProfile();
  }
  if (!storedProfile) return createDefaultUserProfile();

  try {
    const parsed = JSON.parse(storedProfile) as Partial<UserProfile>;
    const defaults = createDefaultUserProfile();
    const engineGames = parsed.engineGames;
    return {
      ...defaults,
      ...parsed,
      username: typeof parsed.username === 'string' ? parsed.username : '',
      avatarDataUrl: typeof parsed.avatarDataUrl === 'string' ? parsed.avatarDataUrl : null,
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : defaults.createdAt,
      lastLoginAt: typeof parsed.lastLoginAt === 'string' ? parsed.lastLoginAt : defaults.lastLoginAt,
      loginHistory: Array.isArray(parsed.loginHistory) ? parsed.loginHistory.filter((value): value is string => typeof value === 'string') : [],
      totalSeconds: typeof parsed.totalSeconds === 'number' && Number.isFinite(parsed.totalSeconds) ? parsed.totalSeconds : 0,
      learnedOpeningIds: Array.isArray(parsed.learnedOpeningIds) ? parsed.learnedOpeningIds.filter((value): value is string => typeof value === 'string') : [],
      learnedVariationIds: Array.isArray(parsed.learnedVariationIds) ? parsed.learnedVariationIds.filter((value): value is string => typeof value === 'string') : [],
      engineGames: {
        wins: typeof engineGames?.wins === 'number' && Number.isFinite(engineGames.wins) ? engineGames.wins : 0,
        losses: typeof engineGames?.losses === 'number' && Number.isFinite(engineGames.losses) ? engineGames.losses : 0,
        draws: typeof engineGames?.draws === 'number' && Number.isFinite(engineGames.draws) ? engineGames.draws : 0,
      },
    };
  } catch (error) {
    console.error('Could not read the saved player profile.', error);
    return createDefaultUserProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function formatStudyTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}
