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
] as const;

export type ChessAvatarId = (typeof chessAvatars)[number]['id'];

export function getChessAvatarDataUrl(id: ChessAvatarId): string {
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
