import openingsJson from './openingsData.json';
import { Opening } from '../types/chess';

export const openings: Opening[] = openingsJson as unknown as Opening[];

export const whiteOpenings = openings.filter(o => o.side === 'white');
export const blackOpenings = openings.filter(o => o.side === 'black');

export function getOpeningById(id: string): Opening | undefined {
  return openings.find(o => o.id === id);
}

export function getVariationById(openingId: string, variationId: string) {
  const opening = getOpeningById(openingId);
  if (!opening) return undefined;
  return opening.variations.find(v => v.id === variationId);
}
