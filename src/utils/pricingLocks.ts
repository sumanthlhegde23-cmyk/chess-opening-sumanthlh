export type PaidPlanTier =
  | 'none'
  | '699'
  | '699_plus_399'
  | '999'
  | '399'
  | '399_plus_179'
  | '599';
export type UserRole = 'owner' | 'visitor';

export type OpeningClassification = 'Major' | 'Semi-Major' | 'Minor';

export const OPENING_CLASSIFICATION: Record<string, OpeningClassification> = {
  'ruy-lopez': 'Major',
  'italian-game': 'Major',
  'queens-gambit': 'Major',
  'english-opening': 'Major',
  'catalan-opening': 'Major',
  'london-system': 'Major',
  'scotch-game': 'Semi-Major',
  'kings-indian-attack': 'Semi-Major',
  'vienna-game': 'Semi-Major',
  'reti-opening': 'Semi-Major',
  'kings-gambit': 'Semi-Major',
  'danish-gambit': 'Semi-Major',
  'ponziani-opening': 'Semi-Major',
  'birds-opening': 'Semi-Major',
  'colle-system': 'Minor',
  'nimzo-larsen-attack': 'Minor',
  'sicilian-defense': 'Major',
  'french-defense': 'Major',
  'caro-kann-defense': 'Major',
  'kings-indian-defense': 'Major',
  'nimzo-indian-defense': 'Major',
  'slav-defense': 'Major',
  'grunfeld-defense': 'Semi-Major',
  'queens-indian-defense': 'Semi-Major',
  'scandinavian-defense': 'Semi-Major',
  'pirc-defense': 'Semi-Major',
  'dutch-defense': 'Semi-Major',
  'alekhine-defense': 'Semi-Major',
  'petrov-defense': 'Semi-Major',
  'philidor-defense': 'Minor',
  'benoni-defense': 'Semi-Major',
  'benko-gambit': 'Minor',
};

const WHITE_SEMI_MAJOR_OPENINGS = [
  'scotch-game', 'kings-indian-attack', 'vienna-game', 'reti-opening',
  'kings-gambit', 'danish-gambit', 'ponziani-opening', 'birds-opening',
];
const BLACK_SEMI_MAJOR_OPENINGS = [
  'grunfeld-defense', 'queens-indian-defense', 'scandinavian-defense', 'pirc-defense',
  'dutch-defense', 'alekhine-defense', 'petrov-defense', 'benoni-defense',
];

function sampleOpenings(candidates: string[]): string[] {
  const shuffled = [...candidates];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, 6);
}

function getFreeOpeningSelection(): { white: string[]; black: string[] } {
  const storageKey = 'chess_openings_free_lock_selection_v1';
  if (typeof window !== 'undefined') {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      const validSelection = stored &&
        Array.isArray(stored.white) && stored.white.length === 6 &&
        Array.isArray(stored.black) && stored.black.length === 6 &&
        stored.white.every((id: string) => WHITE_SEMI_MAJOR_OPENINGS.includes(id)) &&
        stored.black.every((id: string) => BLACK_SEMI_MAJOR_OPENINGS.includes(id)) &&
        new Set(stored.white).size === 6 && new Set(stored.black).size === 6;
      if (validSelection) return stored;

      const selection = {
        white: sampleOpenings(WHITE_SEMI_MAJOR_OPENINGS),
        black: sampleOpenings(BLACK_SEMI_MAJOR_OPENINGS),
      };
      localStorage.setItem(storageKey, JSON.stringify(selection));
      return selection;
    } catch {}
  }

  return {
    white: sampleOpenings(WHITE_SEMI_MAJOR_OPENINGS),
    black: sampleOpenings(BLACK_SEMI_MAJOR_OPENINGS),
  };
}

const freeOpeningSelection = getFreeOpeningSelection();
export const LOCKED_WHITE_OPENINGS = freeOpeningSelection.white;
export const LOCKED_BLACK_OPENINGS = freeOpeningSelection.black;
export const LOCKED_OPENING_IDS: string[] = [...LOCKED_WHITE_OPENINGS, ...LOCKED_BLACK_OPENINGS];

export const THREE_YEAR_LOCKED_WHITE_OPENINGS = [
  'scotch-game',
  'kings-indian-attack',
  'vienna-game',
  'danish-gambit',
];
export const THREE_YEAR_LOCKED_BLACK_OPENINGS = [
  'scandinavian-defense',
  'pirc-defense',
  'dutch-defense',
  'alekhine-defense',
];
export const THREE_YEAR_LOCKED_OPENING_IDS: string[] = [
  ...THREE_YEAR_LOCKED_WHITE_OPENINGS,
  ...THREE_YEAR_LOCKED_BLACK_OPENINGS,
];

export const LOCKED_FREE_VARIATION_INDICES = [8, 9, 10, 11];

const openingNames: Record<string, string> = {
  'scotch-game': 'Scotch Game',
  'kings-indian-attack': "King's Indian Attack",
  'vienna-game': 'Vienna Game & Gambit',
  'danish-gambit': 'Danish Gambit',
  'ponziani-opening': 'Ponziani Opening',
  'birds-opening': "Bird's Opening",
  'scandinavian-defense': 'Scandinavian Defense',
  'pirc-defense': 'Pirc / Modern Defense',
  'dutch-defense': 'Dutch Defense',
  'alekhine-defense': 'Alekhine Defense',
  'petrov-defense': 'Petrov Defense',
  'benoni-defense': 'Benoni Defense',
};

export function getOpeningClassification(openingId: string): OpeningClassification {
  return OPENING_CLASSIFICATION[openingId] || 'Minor';
}

/**
 * Plan amounts and renewal rates requested by the user:
 * Plan 1 (Lifetime): ₹999/-, renewal every year for ₹199/-.
 * Plan 2 (3-Year): ₹699/-, renewal every year till completion of 3 years of amount ₹159/-.
 * Add-up Plan: ₹399/- (unlocks remaining openings).
 */
export const LIFETIME_PLAN_AMOUNT = 999;
export const LIFETIME_RENEWAL_AMOUNT = 199;
export const THREE_YEAR_PLAN_AMOUNT = 699;
export const THREE_YEAR_RENEWAL_AMOUNT = 159;
export const ADDON_PLAN_AMOUNT = 399;

/**
 * Creator / Owner mode detection.
 * Defaults to 'owner' for Sumanth Hegde so that you have full unrestricted access.
 * Others (visitors / test mode) have the openings and variations locked.
 */
export function getStoredUserRole(): UserRole {
  try {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('visitor')) {
        return 'visitor';
      }
      if (urlParams.has('owner') || urlParams.has('sumanth') || urlParams.has('admin')) {
        localStorage.setItem('chess_openings_user_role', 'owner');
        return 'owner';
      }

      // In local dev or cloud dev container, always Sumanth (Owner)
      const hostname = window.location.hostname;
      if (
        hostname.includes('ais-dev') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1'
      ) {
        return 'owner';
      }

      const savedRole = localStorage.getItem('chess_openings_user_role');
      if (savedRole === 'owner') return 'owner';
      if (savedRole === 'visitor') return 'visitor';

      // Default for unknown visitors on shared links
      return 'visitor';
    }
  } catch {}
  return 'owner';
}

export function saveStoredUserRole(role: UserRole): void {
  try {
    localStorage.setItem('chess_openings_user_role', role);
  } catch {}
}

export function getStoredPaidPlan(): PaidPlanTier {
  try {
    const saved = localStorage.getItem('chess_openings_paid_tier');
    if (
      saved === '999' ||
      saved === '699' ||
      saved === '699_plus_399' ||
      saved === '599' ||
      saved === '399' ||
      saved === '399_plus_179'
    ) {
      return saved as PaidPlanTier;
    }
    // Backward compatibility with previous key
    const oldActive = localStorage.getItem('chess_openings_premium_active');
    const oldPlan = localStorage.getItem('chess_openings_premium_plan');
    if (oldActive === 'true') {
      if (oldPlan === 'lifetime') return '999';
      if (oldPlan === '3year') return '699';
      return '999';
    }
  } catch {}
  return 'none';
}

export function saveStoredPaidPlan(tier: PaidPlanTier): void {
  try {
    localStorage.setItem('chess_openings_paid_tier', tier);
    if (tier === '999' || tier === '599') {
      localStorage.setItem('chess_openings_premium_active', 'true');
      localStorage.setItem('chess_openings_premium_plan', 'lifetime');
    } else if (
      tier === '699' ||
      tier === '699_plus_399' ||
      tier === '399' ||
      tier === '399_plus_179'
    ) {
      localStorage.setItem('chess_openings_premium_active', 'true');
      localStorage.setItem('chess_openings_premium_plan', '3year');
    } else {
      localStorage.removeItem('chess_openings_premium_active');
      localStorage.removeItem('chess_openings_premium_plan');
    }
  } catch {}
}

/**
 * Free users can preview 8 lines of the 12 selected semi-major openings.
 * The ₹699 plan has no variation locks in its accessible openings; the 8 reserved
 * openings are locked as a whole. The ₹999 plan removes all locks.
 */
export function isVariationLocked(
  variationIndex: number,
  tier: PaidPlanTier,
  isOwner: boolean = false,
  openingId?: string
): boolean {
  if (isOwner) return false;
  if (tier === '999' || tier === '599' || tier === '699_plus_399' || tier === '399_plus_179') return false;
  if (tier === '699' || tier === '399') return openingId ? THREE_YEAR_LOCKED_OPENING_IDS.includes(openingId) : false;
  return Boolean(
    openingId &&
    LOCKED_OPENING_IDS.includes(openingId) &&
    LOCKED_FREE_VARIATION_INDICES.includes(variationIndex)
  );
}

/**
 * Checks if an opening is fully reserved on the selected paid tier.
 * Free-tier semi-major openings stay previewable; only selected lines are gated.
 */
export function isOpeningLocked(
  openingId: string,
  tier: PaidPlanTier,
  isOwner: boolean = false
): boolean {
  if (isOwner) return false;
  if (
    tier === '999' ||
    tier === '599' ||
    tier === '699_plus_399' ||
    tier === '399_plus_179'
  ) {
    return false;
  }
  if (tier === '699' || tier === '399') {
    return THREE_YEAR_LOCKED_OPENING_IDS.includes(openingId);
  }
  return false;
}

export function isOpeningAccessRestricted(
  openingId: string,
  tier: PaidPlanTier,
  isOwner: boolean = false
): boolean {
  if (isOwner || tier === '999' || tier === '599' || tier === '699_plus_399' || tier === '399_plus_179') {
    return false;
  }
  if (tier === '699' || tier === '399') return THREE_YEAR_LOCKED_OPENING_IDS.includes(openingId);
  return LOCKED_OPENING_IDS.includes(openingId);
}

export function getOpeningLockDetails(openingId: string): {
  isLockedOpening: boolean;
  side: 'white' | 'black' | null;
  name: string;
} {
  const isWhite = LOCKED_WHITE_OPENINGS.includes(openingId);
  const isBlack = LOCKED_BLACK_OPENINGS.includes(openingId);
  return {
    isLockedOpening: isWhite || isBlack,
    side: isWhite ? 'white' : isBlack ? 'black' : null,
    name: openingNames[openingId] || '',
  };
}
