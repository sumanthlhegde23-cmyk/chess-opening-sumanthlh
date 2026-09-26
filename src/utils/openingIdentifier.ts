import { openings } from '../data/openings';
import { EXPLORER_DATABASE } from '../data/openingExplorerData';

export interface IdentifiedOpening {
  openingName: string;
  variationName: string;
  eco: string;
  isBook: boolean;
  movesText: string;
  fullTitle: string;
}

// Well-known early moves and core opening lines
interface OpeningRule {
  moves: string[];
  opening: string;
  variation: string;
  eco: string;
}

const COMMON_OPENING_RULES: OpeningRule[] = [
  // 1-move openers
  { moves: ['e4'], opening: "King's Pawn Opening", variation: "1. e4", eco: 'B00' },
  { moves: ['d4'], opening: "Queen's Pawn Opening", variation: "1. d4", eco: 'A40' },
  { moves: ['c4'], opening: 'English Opening', variation: 'King’s English / Symmetrical Line', eco: 'A10' },
  { moves: ['Nf3'], opening: 'Zukertort / Réti Opening', variation: 'King’s Indian Attack Setup', eco: 'A04' },
  { moves: ['f4'], opening: "Bird's Opening", variation: 'Dutch Attack', eco: 'A02' },
  { moves: ['b3'], opening: 'Nimzo-Larsen Attack', variation: 'Modern Setup', eco: 'A01' },
  { moves: ['g3'], opening: "King's Fianchetto Opening", variation: 'Benko System', eco: 'A00' },
  { moves: ['Nc3'], opening: 'Van Geet Opening', variation: 'Dunst Opening', eco: 'A00' },
  { moves: ['b4'], opening: 'Sokolsky Opening', variation: 'Polish / Orangutan', eco: 'A00' },

  // 1... responses to 1.e4
  { moves: ['e4', 'e5'], opening: 'Open Game', variation: "King's Pawn Game", eco: 'C20' },
  { moves: ['e4', 'c5'], opening: 'Sicilian Defense', variation: 'Open Setup', eco: 'B20' },
  { moves: ['e4', 'e6'], opening: 'French Defense', variation: 'Normal Setup', eco: 'C00' },
  { moves: ['e4', 'c6'], opening: 'Caro-Kann Defense', variation: 'Classical Setup', eco: 'B10' },
  { moves: ['e4', 'd5'], opening: 'Scandinavian Defense', variation: 'Center Counter', eco: 'B01' },
  { moves: ['e4', 'd6'], opening: 'Pirc Defense', variation: 'Main Line', eco: 'B07' },
  { moves: ['e4', 'g6'], opening: 'Modern Defense', variation: 'Robatsch Defense', eco: 'B06' },
  { moves: ['e4', 'Nf6'], opening: "Alekhine's Defense", variation: 'Main Line', eco: 'B02' },
  { moves: ['e4', 'Nc6'], opening: 'Nimzowitsch Defense', variation: 'Scandinavian Setup', eco: 'B00' },

  // Open Game (1.e4 e5) continuations
  { moves: ['e4', 'e5', 'Nf3'], opening: "King's Knight Opening", variation: 'Normal Line', eco: 'C40' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6'], opening: 'Open Game', variation: 'Two Knights / Normal Defense', eco: 'C44' },
  { moves: ['e4', 'e5', 'Nf3', 'Nf6'], opening: "Petrov's Defense", variation: 'Russian Game', eco: 'C42' },
  { moves: ['e4', 'e5', 'Nf3', 'd6'], opening: 'Philidor Defense', variation: 'Main Line', eco: 'C41' },
  { moves: ['e4', 'e5', 'f4'], opening: "King's Gambit", variation: 'Main Line', eco: 'C30' },
  { moves: ['e4', 'e5', 'f4', 'exf4'], opening: "King's Gambit", variation: 'King’s Gambit Accepted', eco: 'C33' },
  { moves: ['e4', 'e5', 'f4', 'd5'], opening: "King's Gambit", variation: 'Falkbeer Counter-Gambit', eco: 'C31' },
  { moves: ['e4', 'e5', 'Nc3'], opening: 'Vienna Game', variation: 'Main Line', eco: 'C25' },
  { moves: ['e4', 'e5', 'd4'], opening: 'Center Game', variation: 'Danish Gambit Setup', eco: 'C21' },
  { moves: ['e4', 'e5', 'Bc4'], opening: "Bishop's Opening", variation: 'Berlin Defense Setup', eco: 'C23' },

  // Ruy Lopez Lines
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'], opening: 'Ruy Lopez', variation: 'Spanish Opening (Main)', eco: 'C60' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'], opening: 'Ruy Lopez', variation: 'Morphy Defense', eco: 'C70' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4'], opening: 'Ruy Lopez', variation: 'Morphy Defense: Columbus', eco: 'C70' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6'], opening: 'Ruy Lopez', variation: 'Morphy Defense: Closed System', eco: 'C80' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6'], opening: 'Ruy Lopez', variation: 'Exchange Variation', eco: 'C68' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'], opening: 'Ruy Lopez', variation: 'Berlin Defense', eco: 'C65' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O'], opening: 'Ruy Lopez', variation: 'Berlin Defense: L’Hermet Line', eco: 'C65' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4'], opening: 'Ruy Lopez', variation: 'Berlin Defense: Open Line', eco: 'C67' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'd6'], opening: 'Ruy Lopez', variation: 'Steinitz Defense', eco: 'C62' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'f5'], opening: 'Ruy Lopez', variation: 'Schliemann Defense (Jaenisch Gambit)', eco: 'C63' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Bc5'], opening: 'Ruy Lopez', variation: 'Classical Defense (Cordel)', eco: 'C64' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'g6'], opening: 'Ruy Lopez', variation: 'Fianchetto Defense (Smyslov)', eco: 'C60' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nd4'], opening: 'Ruy Lopez', variation: 'Bird Defense', eco: 'C61' },

  // Italian Game Lines
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], opening: 'Italian Game', variation: 'Main Line', eco: 'C50' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], opening: 'Italian Game', variation: 'Giuoco Piano', eco: 'C50' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3'], opening: 'Italian Game', variation: 'Giuoco Piano: Main Line', eco: 'C53' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3'], opening: 'Italian Game', variation: 'Giuoco Pianissimo', eco: 'C50' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'], opening: 'Italian Game', variation: 'Evans Gambit', eco: 'C51' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'], opening: 'Italian Game', variation: 'Two Knights Defense', eco: 'C55' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5'], opening: 'Italian Game', variation: 'Fried Liver / Knight Attack', eco: 'C57' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd3'], opening: 'Italian Game', variation: 'Modern Italian: Two Knights', eco: 'C55' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Be7'], opening: 'Italian Game', variation: 'Hungarian Defense', eco: 'C50' },

  // Scotch Game
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'], opening: 'Scotch Game', variation: 'Main Line', eco: 'C45' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'], opening: 'Scotch Game', variation: 'Classical Variation', eco: 'C45' },
  { moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4'], opening: 'Scotch Game', variation: 'Scotch Gambit', eco: 'C44' },

  // Sicilian Lines
  { moves: ['e4', 'c5', 'Nf3'], opening: 'Sicilian Defense', variation: "King's Knight Variation", eco: 'B27' },
  { moves: ['e4', 'c5', 'Nf3', 'd6'], opening: 'Sicilian Defense', variation: 'Modern Setup', eco: 'B50' },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4'], opening: 'Sicilian Defense', variation: 'Open Sicilian', eco: 'B52' },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'], opening: 'Sicilian Defense', variation: 'Najdorf Variation', eco: 'B90' },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'], opening: 'Sicilian Defense', variation: 'Dragon Variation', eco: 'B70' },
  { moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6'], opening: 'Sicilian Defense', variation: 'Scheveningen Variation', eco: 'B80' },
  { moves: ['e4', 'c5', 'Nf3', 'Nc6'], opening: 'Sicilian Defense', variation: 'Old Sicilian', eco: 'B30' },
  { moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6'], opening: 'Sicilian Defense', variation: 'Accelerated Dragon', eco: 'B34' },
  { moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5'], opening: 'Sicilian Defense', variation: 'Sveshnikov (Pelikan) Variation', eco: 'B33' },
  { moves: ['e4', 'c5', 'Nf3', 'e6'], opening: 'Sicilian Defense', variation: 'French Variation (Paulsen/Kan)', eco: 'B40' },
  { moves: ['e4', 'c5', 'c3'], opening: 'Sicilian Defense', variation: 'Alapin Variation', eco: 'B22' },
  { moves: ['e4', 'c5', 'Nc3'], opening: 'Sicilian Defense', variation: 'Closed Sicilian', eco: 'B23' },

  // French Lines
  { moves: ['e4', 'e6', 'd4', 'd5'], opening: 'French Defense', variation: 'Main Line', eco: 'C01' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'e5'], opening: 'French Defense', variation: 'Advance Variation', eco: 'C02' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'exd5'], opening: 'French Defense', variation: 'Exchange Variation', eco: 'C01' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nc3'], opening: 'French Defense', variation: 'Paulsen / Classical', eco: 'C10' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6'], opening: 'French Defense', variation: 'Classical Defense', eco: 'C11' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'], opening: 'French Defense', variation: 'Winawer Variation', eco: 'C15' },
  { moves: ['e4', 'e6', 'd4', 'd5', 'Nd2'], opening: 'French Defense', variation: 'Tarrasch Variation', eco: 'C03' },

  // Caro-Kann Lines
  { moves: ['e4', 'c6', 'd4', 'd5'], opening: 'Caro-Kann Defense', variation: 'Main Line', eco: 'B12' },
  { moves: ['e4', 'c6', 'd4', 'd5', 'e5'], opening: 'Caro-Kann Defense', variation: 'Advance Variation', eco: 'B12' },
  { moves: ['e4', 'c6', 'd4', 'd5', 'Nc3'], opening: 'Caro-Kann Defense', variation: 'Classical Variation', eco: 'B18' },
  { moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5'], opening: 'Caro-Kann Defense', variation: 'Exchange Variation', eco: 'B13' },
  { moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4'], opening: 'Caro-Kann Defense', variation: 'Panov-Botvinnik Attack', eco: 'B13' },

  // 1.d4 responses
  { moves: ['d4', 'd5'], opening: "Queen's Pawn Game", variation: 'Classical Line', eco: 'D00' },
  { moves: ['d4', 'd5', 'c4'], opening: "Queen's Gambit", variation: 'Main Line', eco: 'D06' },
  { moves: ['d4', 'd5', 'c4', 'e6'], opening: "Queen's Gambit Declined", variation: 'Orthodox Defense', eco: 'D30' },
  { moves: ['d4', 'd5', 'c4', 'c6'], opening: 'Slav Defense', variation: 'Main Line', eco: 'D10' },
  { moves: ['d4', 'd5', 'c4', 'dxc4'], opening: "Queen's Gambit Accepted", variation: 'Classical Line', eco: 'D20' },
  { moves: ['d4', 'd5', 'Bf4'], opening: 'London System', variation: 'Classical Line', eco: 'D02' },
  { moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'], opening: 'London System', variation: 'Main Line', eco: 'D02' },

  // 1.d4 Nf6 Indian Defenses
  { moves: ['d4', 'Nf6'], opening: 'Indian Defense', variation: 'Main Line Setup', eco: 'A45' },
  { moves: ['d4', 'Nf6', 'c4'], opening: 'Indian Defense', variation: 'Main Setup', eco: 'A50' },
  { moves: ['d4', 'Nf6', 'c4', 'g6'], opening: "King's Indian / Grünfeld", variation: 'Fianchetto Setup', eco: 'E60' },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'], opening: "King's Indian Defense", variation: 'Main Setup', eco: 'E60' },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'], opening: "King's Indian Defense", variation: 'Classical Variation', eco: 'E60' },
  { moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5'], opening: 'Grünfeld Defense', variation: 'Exchange / Classical Line', eco: 'D80' },
  { moves: ['d4', 'Nf6', 'c4', 'e6'], opening: 'East Indian Defense', variation: 'Nimzo / Queen’s Indian Setup', eco: 'E00' },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'], opening: 'Nimzo-Indian Defense', variation: 'Classical / Rubinstein', eco: 'E20' },
  { moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6'], opening: "Queen's Indian Defense", variation: 'Classical Line', eco: 'E12' },
  { moves: ['d4', 'Nf6', 'c4', 'c5'], opening: 'Benoni Defense', variation: 'Main Line', eco: 'A56' },
  { moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5'], opening: 'Benko Gambit', variation: 'Volga Gambit', eco: 'A57' },

  // Dutch Defense
  { moves: ['d4', 'f5'], opening: 'Dutch Defense', variation: 'Main Line', eco: 'A80' },
  { moves: ['d4', 'f5', 'c4', 'Nf6', 'g3'], opening: 'Dutch Defense', variation: 'Leningrad / Classical', eco: 'A84' },

  // English Opening Lines
  { moves: ['c4', 'e5'], opening: 'English Opening', variation: "King's English Variation", eco: 'A20' },
  { moves: ['c4', 'c5'], opening: 'English Opening', variation: 'Symmetrical Variation', eco: 'A30' },
  { moves: ['c4', 'Nf6'], opening: 'English Opening', variation: 'Anglo-Indian Defense', eco: 'A15' },
  { moves: ['c4', 'e6'], opening: 'English Opening', variation: 'Agincourt Defense', eco: 'A13' },
];

/**
 * Normalizes moves for comparison (strips check/checkmate suffixes like +, #)
 */
function normalizeMove(m: string): string {
  return m.replace(/[+#?!]/g, '').trim();
}

/**
 * Identifies the exact Opening and Variation for any given move sequence and position.
 */
export function identifyOpeningAndVariation(
  moves: string[],
  currentFen?: string
): IdentifiedOpening {
  if (!moves || moves.length === 0) {
    return {
      openingName: 'Starting Position',
      variationName: 'Initial Board',
      eco: 'A00',
      isBook: true,
      movesText: 'Game start',
      fullTitle: 'Starting Position',
    };
  }

  const normMoves = moves.map(normalizeMove);

  // Formatted moves text (e.g. "1. e4 e5 2. Nf3 Nc6 3. Bb5")
  let formattedMoves = '';
  for (let i = 0; i < moves.length; i++) {
    if (i % 2 === 0) {
      formattedMoves += `${Math.floor(i / 2) + 1}. ${moves[i]} `;
    } else {
      formattedMoves += `${moves[i]} `;
    }
  }
  formattedMoves = formattedMoves.trim();

  // 1. Priority Match: Deep search across all 20 openings and 240 variations in the master app database
  let bestDbMatch: {
    openingName: string;
    variationName: string;
    eco: string;
    matchLen: number;
    exact: boolean;
  } | null = null;

  for (const opening of openings) {
    for (const variation of opening.variations) {
      const vNormMoves = variation.moves.map(normalizeMove);

      // Check how many moves match sequentially from the start
      let matchCount = 0;
      const checkLen = Math.min(normMoves.length, vNormMoves.length);
      for (let i = 0; i < checkLen; i++) {
        if (normMoves[i] === vNormMoves[i]) {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount > 0) {
        // If user's moves matched the variation
        const isUserPrefixOfVariation = matchCount === normMoves.length;
        const isVariationPrefixOfUser = matchCount === vNormMoves.length;

        if (isUserPrefixOfVariation || isVariationPrefixOfUser) {
          if (!bestDbMatch || matchCount > bestDbMatch.matchLen) {
            bestDbMatch = {
              openingName: opening.name,
              variationName: variation.name,
              eco: variation.eco,
              matchLen: matchCount,
              exact: matchCount === normMoves.length && matchCount === vNormMoves.length,
            };
          }
        }
      }
    }
  }

  // If we found a full match from our 240 variations database where matchLen covers all played moves
  if (bestDbMatch && bestDbMatch.matchLen === normMoves.length) {
    return {
      openingName: bestDbMatch.openingName,
      variationName: bestDbMatch.variationName,
      eco: bestDbMatch.eco,
      isBook: true,
      movesText: formattedMoves,
      fullTitle: `${bestDbMatch.openingName}: ${bestDbMatch.variationName}`,
    };
  }

  // 2. Check the curated COMMON_OPENING_RULES for exact move sequences
  // Sort by longest move sequence first
  const sortedRules = [...COMMON_OPENING_RULES].sort((a, b) => b.moves.length - a.moves.length);

  for (const rule of sortedRules) {
    const rNorm = rule.moves.map(normalizeMove);
    if (rNorm.length <= normMoves.length) {
      // Check if normMoves starts with rNorm
      let matches = true;
      for (let i = 0; i < rNorm.length; i++) {
        if (normMoves[i] !== rNorm[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        // If user made more moves past the rule, check if bestDbMatch is more specific
        if (bestDbMatch && bestDbMatch.matchLen > rNorm.length) {
          return {
            openingName: bestDbMatch.openingName,
            variationName: bestDbMatch.variationName,
            eco: bestDbMatch.eco,
            isBook: true,
            movesText: formattedMoves,
            fullTitle: `${bestDbMatch.openingName}: ${bestDbMatch.variationName}`,
          };
        }

        const isExact = rNorm.length === normMoves.length;
        return {
          openingName: rule.opening,
          variationName: rule.variation,
          eco: rule.eco,
          isBook: isExact,
          movesText: formattedMoves,
          fullTitle: `${rule.opening}: ${rule.variation}`,
        };
      }
    }
  }

  // 3. Check EXPLORER_DATABASE by FEN prefix
  if (currentFen) {
    const fenPrefix = currentFen.trim().split(' ').slice(0, 4).join(' ');
    const explorerData = EXPLORER_DATABASE[fenPrefix];
    if (explorerData) {
      return {
        openingName: explorerData.openingName,
        variationName: 'Book Position',
        eco: explorerData.eco,
        isBook: true,
        movesText: formattedMoves,
        fullTitle: `${explorerData.openingName} (${explorerData.eco})`,
      };
    }
  }

  // 4. Fallback: If bestDbMatch found some prefix
  if (bestDbMatch) {
    return {
      openingName: bestDbMatch.openingName,
      variationName: `${bestDbMatch.variationName} (Continuation)`,
      eco: bestDbMatch.eco,
      isBook: false,
      movesText: formattedMoves,
      fullTitle: `${bestDbMatch.openingName}: ${bestDbMatch.variationName}`,
    };
  }

  // 5. Generic fallback
  return {
    openingName: 'Unclassified Opening',
    variationName: 'Custom Continuation',
    eco: 'A00',
    isBook: false,
    movesText: formattedMoves,
    fullTitle: 'Custom Opening Variation',
  };
}
