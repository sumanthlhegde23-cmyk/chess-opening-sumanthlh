import { loadStreakData, saveStreakData } from './streakManager';
import { customAvatarDataUrls } from './customAvatarsData';

export interface UserProfile {
  username: string;
  avatarDataUrl: string | null;
  createdAt: string;
  lastLoginAt: string;
  loginHistory: string[];
  totalSeconds: number;
  learnedOpeningIds: string[];
  learnedVariationIds: string[];
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastActiveDate: string | null;
  unlockedVariationIds: string[];
  totalVariationsUnlocked: number;
  engineGames: {
    wins: number;
    losses: number;
    draws: number;
  };
  onlineGames: {
    wins: number;
    losses: number;
    draws: number;
  };
}

const PROFILE_STORAGE_KEY = 'chess-openings-user-profile';

export const chessAvatars = [
  { id: 'white-king', name: 'White King', piece: '♔', background: '#e8dfc4', foreground: '#354238' },
  { id: 'white-queen', name: 'White Queen', piece: '♕', background: '#e5d8b8', foreground: '#684d76' },
  { id: 'white-rook', name: 'White Rook', piece: '♖', background: '#d4dfcf', foreground: '#344737' },
  { id: 'white-bishop', name: 'White Bishop', piece: '♗', background: '#e7d8ca', foreground: '#80583f' },
  { id: 'white-knight', name: 'White Knight', piece: '♘', background: '#d6e2e7', foreground: '#385e79' },
  { id: 'white-pawn', name: 'White Pawn', piece: '♙', background: '#e6e6cf', foreground: '#536843' },
  { id: 'black-king', name: 'Black King', piece: '♚', background: '#313c36', foreground: '#e8d29b' },
  { id: 'black-queen', name: 'Black Queen', piece: '♛', background: '#392f43', foreground: '#e7c4db' },
  { id: 'black-rook', name: 'Black Rook', piece: '♜', background: '#293b3c', foreground: '#aed9cb' },
  { id: 'black-knight', name: 'Black Knight', piece: '♞', background: '#40342d', foreground: '#efd2a9' },
  { id: 'purple-knight', name: 'Royal Knight', piece: '♞', background: '#594c9d', foreground: '#ffffff' },
  { id: 'emerald-queen', name: 'Emerald Queen', piece: '♛', background: '#157256', foreground: '#f9bf41' },
  { id: 'grandmaster', name: 'Grandmaster', piece: '♔', background: '#cb5331', foreground: '#f5dfc6' },
  { id: 'pink-rook', name: 'Castle Rook', piece: '♜', background: '#a03b63', foreground: '#ffffff' },
] as const;

export type ChessAvatarId = (typeof chessAvatars)[number]['id'];

export function getChessAvatarDataUrl(id: ChessAvatarId): string {
  if (customAvatarDataUrls[id]) {
    return customAvatarDataUrls[id];
  }
  const avatar = chessAvatars.find((item) => item.id === id);
  if (!avatar) throw new Error(`Unknown chess avatar: ${id}`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="18" fill="${avatar.background}"/><path d="M14 100h100" stroke="${avatar.foreground}" stroke-opacity=".22" stroke-width="3"/><text x="64" y="87" text-anchor="middle" font-size="82" fill="${avatar.foreground}" font-family="Segoe UI Symbol, Noto Sans Symbols 2, serif">${avatar.piece}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

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
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    lastActiveDate: null,
    unlockedVariationIds: [],
    totalVariationsUnlocked: 0,
    engineGames: { wins: 0, losses: 0, draws: 0 },
    onlineGames: { wins: 0, losses: 0, draws: 0 },
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

  const streakData = loadStreakData();

  if (!storedProfile) {
    const defaults = createDefaultUserProfile();
    return {
      ...defaults,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastActiveDate: streakData.lastActiveDate,
    };
  }

  try {
    const parsed = JSON.parse(storedProfile) as Partial<UserProfile>;
    const defaults = createDefaultUserProfile();
    const engineGames = parsed.engineGames;
    const onlineGames = parsed.onlineGames;

    // Favor streakData from dedicated localStorage keys / composite profile
    const currentStreak = streakData.currentStreak;
    const longestStreak = streakData.longestStreak;
    const lastActiveDate = streakData.lastActiveDate;

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
      currentStreak,
      longestStreak,
      totalPoints: typeof parsed.totalPoints === 'number' && Number.isFinite(parsed.totalPoints) && parsed.totalPoints >= 0 ? Math.floor(parsed.totalPoints) : 0,
      lastActiveDate,
      unlockedVariationIds: Array.isArray(parsed.unlockedVariationIds) ? [...new Set(parsed.unlockedVariationIds.filter((value): value is string => typeof value === 'string'))] : [],
      totalVariationsUnlocked: typeof parsed.totalVariationsUnlocked === 'number' && Number.isFinite(parsed.totalVariationsUnlocked) && parsed.totalVariationsUnlocked >= 0
        ? Math.floor(parsed.totalVariationsUnlocked)
        : Array.isArray(parsed.unlockedVariationIds) ? new Set(parsed.unlockedVariationIds).size : 0,
      engineGames: {
        wins: typeof engineGames?.wins === 'number' && Number.isFinite(engineGames.wins) ? engineGames.wins : 0,
        losses: typeof engineGames?.losses === 'number' && Number.isFinite(engineGames.losses) ? engineGames.losses : 0,
        draws: typeof engineGames?.draws === 'number' && Number.isFinite(engineGames.draws) ? engineGames.draws : 0,
      },
      onlineGames: {
        wins: typeof onlineGames?.wins === 'number' && Number.isFinite(onlineGames.wins) ? onlineGames.wins : 0,
        losses: typeof onlineGames?.losses === 'number' && Number.isFinite(onlineGames.losses) ? onlineGames.losses : 0,
        draws: typeof onlineGames?.draws === 'number' && Number.isFinite(onlineGames.draws) ? onlineGames.draws : 0,
      },
    };
  } catch (error) {
    console.error('Could not read the saved player profile.', error);
    return createDefaultUserProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    saveStreakData({
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lastActiveDate: profile.lastActiveDate,
    });
  } catch (error) {
    console.error('Could not save user profile to localStorage', error);
  }
}

export function formatStudyTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}
