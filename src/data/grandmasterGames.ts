import gmGamesJson from './grandmasterGamesData.json';
import { GrandmasterGame } from '../types/chess';

export const grandmasterGamesByVariation: Record<string, GrandmasterGame[]> =
  gmGamesJson as unknown as Record<string, GrandmasterGame[]>;

/**
 * Returns 3-4 Grandmaster games for a specific variation
 */
export function getGamesForVariation(variationId: string): GrandmasterGame[] {
  return grandmasterGamesByVariation[variationId] || [];
}

/**
 * Returns a specific Grandmaster game by ID
 */
export function getGameById(gameId: string): GrandmasterGame | undefined {
  for (const games of Object.values(grandmasterGamesByVariation)) {
    const found = games.find((g) => g.id === gameId);
    if (found) return found;
  }
  return undefined;
}
