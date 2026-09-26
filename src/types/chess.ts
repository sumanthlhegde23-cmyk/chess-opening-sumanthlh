export type Side = 'white' | 'black';

export type PlayStyle = 'Aggressive' | 'Positional' | 'Tactical' | 'Solid' | 'Dynamic' | 'Counterattacking' | 'Gambit';

export interface BadMoveRefutation {
  badMove: string; // e.g. "2...f6?", "5...Nxd5?", "3...b5?"
  severity: 'blunder' | 'mistake' | 'inaccuracy';
  evalScore: string; // e.g. "+8.4", "-2.3", "+4.2"
  engineLine: string; // e.g. "3.Nxe5! fxe5 4.Qh5+ Ke7 5.Qxe5+ Kf7 6.Bc4+ d5 7.Bxd5+ Kg6"
  refutationMoves?: string[]; // array of moves starting with bad move then responses
  whyPunished: string; // engine reasoning for punishment
}

export interface MoveExplanation {
  moveNumber: number;
  notation: string; // e.g., "e4", "Nf3", "O-O"
  side: Side;
  explanation: string;
  strategicThemes?: string[];
  threatsOrPlans?: string;
  fen?: string; // computed or supplied
  moveQuality?: 'best' | 'great' | 'book' | 'critical' | 'good' | 'blunder_trap';
  whyGoodOrBest?: string;
  mistakesAndBlunders?: string;
  tacticalNote?: string;
  badMoveRefutations?: BadMoveRefutation[];
}

export interface GrandmasterGame {
  id: string;
  gameNumber: number;
  variationId: string;
  variationName: string;
  openingId: string;
  openingName: string;
  eco: string;
  white: string;
  whiteElo: number;
  black: string;
  blackElo: number;
  event: string;
  year: number | string;
  result: '1-0' | '0-1' | '1/2-1/2';
  resultDescription: string;
  moves: string[]; // SAN moves
  keyTurningPointMove?: number;
}

export interface Variation {
  id: string;
  name: string;
  eco: string;
  moves: string[]; // SAN array e.g. ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"]
  overview: string;
  evalRecommendation?: string;
  keyPlans: {
    white: string;
    black: string;
  };
  moveExplanations: MoveExplanation[];
  grandmasterGames?: GrandmasterGame[];
}

export interface Opening {
  id: string;
  name: string;
  side: Side;
  ecoCode: string;
  category: string; // e.g. "Open Game (1.e4 e5)", "Semi-Open", "Closed Game (1.d4)", "Flank"
  initialMoves: string[]; // main line starter e.g. ["e4", "e5", "Nf3", "Nc6", "Bb5"]
  description: string;
  historicalContext: string;
  playStyle: PlayStyle;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  popularity: number; // 1-100
  keyThemes: string[];
  variations: Variation[]; // Exactly 12 variations!
}
