export type PaidPlanTier =
  | 'none'
  | '699'
  | '699_plus_399'
  | '999'
  | '399'
  | '399_plus_179'
  | '599';
export type UserRole = 'owner' | 'visitor';

/**
 * 2 Openings from White and 2 Openings from Black locked under the ₹699/- (or legacy ₹399/-) plan.
 * (Can be unlocked with an extra polite payment of ₹399/-, or fully via ₹999/-).
 */
export const LOCKED_WHITE_OPENINGS: string[] = ['catalan-opening', 'reti-opening'];
export const LOCKED_BLACK_OPENINGS: string[] = ['dutch-defense', 'alekhine-defense'];
export const LOCKED_OPENING_IDS: string[] = [...LOCKED_WHITE_OPENINGS, ...LOCKED_BLACK_OPENINGS];

/**
 * 5 variations in ALL openings are locked and require the ₹999/- (or legacy ₹599/-) plan to open.
 * In our database, each opening has 12 variations (indices 0 through 11).
 * Variations at index 7, 8, 9, 10, 11 (the 5 elite lines) are locked!
 */
export const LOCKED_VARIATION_START_INDEX = 7; // 5 variations (8, 9, 10, 11, 12)

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
 * Checks if a variation is locked.
 * NEVER locked for Sumanth Hegde (Owner mode).
 * For others (visitors), 5 variations of ALL openings are locked unless user paid ₹999/- (or legacy ₹599/-).
 */
export function isVariationLocked(
  variationIndex: number,
  tier: PaidPlanTier,
  isOwner: boolean = false
): boolean {
  if (isOwner) return false;
  if (tier === '999' || tier === '599') return false;
  return variationIndex >= LOCKED_VARIATION_START_INDEX;
}

/**
 * Checks if an opening is locked.
 * NEVER locked for Sumanth Hegde (Owner mode).
 * For others (visitors), 2 White openings and 2 Black openings are locked under ₹699/- (or free),
 * unless user paid ₹999/- (or legacy ₹599/-) or paid the extra ₹399/- (or legacy ₹179/-).
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
    name:
      openingId === 'catalan-opening'
        ? 'Catalan Opening'
        : openingId === 'reti-opening'
        ? 'Réti Opening'
        : openingId === 'dutch-defense'
        ? 'Dutch Defense'
        : openingId === 'alekhine-defense'
        ? 'Alekhine Defense'
        : '',
  };
}
