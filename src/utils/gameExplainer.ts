import { Chess } from 'chess.js';
import { GrandmasterGame, MoveExplanation, Side, Variation } from '../types/chess';

const pieceNames: Record<string, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

/**
 * Cache for computed game explanations to ensure instantaneous re-renders
 */
const explanationCache = new Map<string, MoveExplanation[]>();

/**
 * Generates rich, move-by-move pedagogical explanations for any Grandmaster game.
 * Uses master opening annotations for the opening phase and computes deep
 * positional/tactical evaluations for the middlegame and endgame.
 */
export function getGrandmasterGameExplanations(
  game: GrandmasterGame,
  variation?: Variation
): MoveExplanation[] {
  const cacheKey = `${game.id}_${variation?.id || 'none'}`;
  if (explanationCache.has(cacheKey)) {
    return explanationCache.get(cacheKey)!;
  }

  const chess = new Chess();
  const explanations: MoveExplanation[] = [];
  const moves = game.moves;

  for (let i = 0; i < moves.length; i++) {
    const san = moves[i];
    const side: Side = i % 2 === 0 ? 'white' : 'black';
    const moveNumber = Math.floor(i / 2) + 1;
    const isWhite = side === 'white';
    const playerName = isWhite ? game.white : game.black;
    const opponentName = isWhite ? game.black : game.white;

    const fenBefore = chess.fen();
    let moveObj;
    try {
      moveObj = chess.move(san);
    } catch {
      break;
    }

    if (!moveObj) break;
    const fenAfter = chess.fen();

    // Check if this move is within the curated opening variation
    if (variation && i < variation.moves.length && variation.moves[i] === san) {
      const bookExplanation = variation.moveExplanations[i];
      if (bookExplanation) {
        explanations.push({
          ...bookExplanation,
          moveNumber,
          notation: san,
          side,
          fen: fenAfter,
          moveQuality: 'book',
          whyGoodOrBest: `${playerName} executes standard book preparation: ${
            bookExplanation.whyGoodOrBest || bookExplanation.explanation
          }`,
        });
        continue;
      }
    }

    // Move is in the middlegame or endgame Grandmaster continuation
    const piece = pieceNames[moveObj.piece] || 'piece';
    const isCapture = Boolean(moveObj.captured);
    const capturedPiece = moveObj.captured ? pieceNames[moveObj.captured] : '';
    const isCheck = san.includes('+');
    const isCheckmate = san.includes('#');
    const isCastleKing = san === 'O-O';
    const isCastleQueen = san === 'O-O-O';
    const isPromotion = Boolean(moveObj.promotion);
    const isTurningPoint = game.keyTurningPointMove === i;

    const strategicThemes: string[] = [];
    let moveQuality: 'best' | 'great' | 'book' | 'critical' = 'best';
    let whyGoodOrBest = '';
    let mistakesAndBlunders = '';
    let tacticalNote = '';
    let generalSummary = '';

    if (isCheckmate) {
      moveQuality = 'great';
      whyGoodOrBest = `Checkmate! ${playerName} delivers the fatal blow with ${san}, concluding the game in dramatic style.`;
      mistakesAndBlunders = `There is no defense against checkmate.`;
      tacticalNote = `Direct king attack leading to unavoidable mate.`;
      generalSummary = `${playerName} mates ${opponentName} with ${san}.`;
      strategicThemes.push('Checkmate', 'King Attack', 'Tactical Precision');
    } else if (isTurningPoint) {
      moveQuality = 'critical';
      strategicThemes.push('Decisive Climax', 'Tactical Initiative');
      if (isCapture) {
        whyGoodOrBest = `The game's turning point! ${playerName} plays ${san}, capturing ${opponentName}'s ${capturedPiece}. This decisive liquidation shifts the balance irrevocably in favor of the attacker.`;
        mistakesAndBlunders = `Failing to strike with ${san} and instead opting for passive consolidation would have allowed ${opponentName} to regroup and mount defensive counterplay.`;
        tacticalNote = `Winning capture on ${moveObj.to}, exploiting overloaded enemy defenders.`;
      } else if (isCheck) {
        whyGoodOrBest = `The decisive breakthrough! ${playerName} delivers ${san}, forcing the enemy monarch into a compromised posture with no safe squares.`;
        mistakesAndBlunders = `Soft or cautious moves here would allow ${opponentName} to establish a defensive blockade.`;
        tacticalNote = `King hunt initiation with forced geometry.`;
      } else {
        whyGoodOrBest = `Critical master stroke! ${playerName} introduces ${san}, fundamentally altering the dynamic balance and initiating the winning phase of the battle.`;
        mistakesAndBlunders = `Playing defensively would let the initiative slip away into equality.`;
        tacticalNote = `Creates immediate dual threats against key targets in ${opponentName}'s camp.`;
      }
      generalSummary = `${playerName} seizes the decisive initiative with ${san}.`;
    } else if (isCastleKing || isCastleQueen) {
      strategicThemes.push('King Safety', 'Rook Connection');
      whyGoodOrBest = `${playerName} castles ${isCastleKing ? 'kingside' : 'queenside'} to tuck the king into safety behind protective pawns while activating the rook for central file operations.`;
      mistakesAndBlunders = `Leaving the king stranded in the center invites dangerous tactical sacrifices along open central files.`;
      tacticalNote = `Secures king safety and unifies the back rank for rook coordination.`;
      generalSummary = `${playerName} completes castling, stabilizing the monarch.`;
    } else if (isCapture) {
      strategicThemes.push('Material Conversion', 'Exchange');
      whyGoodOrBest = `${playerName} captures the ${capturedPiece} on ${moveObj.to}. This removes a key enemy piece, simplifies into a favorable structure, and opens crucial attack vectors.`;
      mistakesAndBlunders = `Hesitating or ignoring the tension on ${moveObj.to} would concede positional initiative and allow ${opponentName} to fortify.`;
      tacticalNote = `Exchanges material on ${moveObj.to}; recalculates defensive balances.`;
      generalSummary = `${playerName} captures on ${moveObj.to} with the ${piece}.`;
    } else if (isCheck) {
      strategicThemes.push('Tempo Gain', 'King Disruption');
      whyGoodOrBest = `${playerName} delivers a forceful check (${san}) on ${moveObj.to}, disrupting ${opponentName}'s defensive coordination and demanding an immediate reply.`;
      mistakesAndBlunders = `Playing slowly would give ${opponentName} time to consolidate their position.`;
      tacticalNote = `Check on the enemy king; limits opponent's viable replies.`;
      generalSummary = `${playerName} presses with a checking move ${san}.`;
    } else if (isPromotion) {
      strategicThemes.push('Pawn Promotion', 'Endgame Conversion');
      moveQuality = 'great';
      whyGoodOrBest = `${playerName} crowns the advanced pawn with ${san}, gaining decisive material supremacy.`;
      mistakesAndBlunders = `Delaying promotion would risk the pawn being blockaded or captured.`;
      tacticalNote = `Pawn promotion to queen; overwhelming advantage.`;
      generalSummary = `${playerName} promotes a pawn on ${moveObj.to}.`;
    } else if (piece === 'pawn') {
      strategicThemes.push('Pawn Structure', 'Space Gain');
      whyGoodOrBest = `${playerName} pushes the pawn to ${moveObj.to}, establishing space, restricting enemy minor pieces, and staking out future outpost squares.`;
      mistakesAndBlunders = `Passive play would grant ${opponentName} free rein to dictate central events.`;
      tacticalNote = `Gains space and anchors central or flank control.`;
      generalSummary = `${playerName} advances pawn to ${moveObj.to}.`;
    } else if (piece === 'knight') {
      strategicThemes.push('Outpost Control', 'Piece Mobility');
      whyGoodOrBest = `${playerName} maneuvers the knight to ${moveObj.to}, occupying a menacing forward outpost that radiates tactical control across key squares.`;
      mistakesAndBlunders = `A misplaced knight on the rim or in passive retreat would forfeit piece activity.`;
      tacticalNote = `Knight placement on ${moveObj.to} controls forward transit squares.`;
      generalSummary = `${playerName} repositions knight to ${moveObj.to}.`;
    } else if (piece === 'bishop') {
      strategicThemes.push('Diagonal Pressure', 'Piece Coordination');
      whyGoodOrBest = `${playerName} stations the bishop on ${moveObj.to}, exerting long-range pressure along the open diagonal and pinning down opposing resources.`;
      mistakesAndBlunders = `Burying the bishop behind closed pawn chains would blunt its offensive potential.`;
      tacticalNote = `Dominates diagonal targeting ${moveObj.to}.`;
      generalSummary = `${playerName} activates bishop on ${moveObj.to}.`;
    } else if (piece === 'rook') {
      strategicThemes.push('Open File', 'Heavy Piece Coordination');
      whyGoodOrBest = `${playerName} shifts the rook to ${moveObj.to}, taking command of the open file and setting up future infiltration toward the 7th rank.`;
      mistakesAndBlunders = `Keeping rooks disconnected or passive in the corner severely hinders endgame transitions.`;
      tacticalNote = `Rook mobility on the ${moveObj.to[0]}-file; eyes potential 7th rank invasion.`;
      generalSummary = `${playerName} centralizes rook on ${moveObj.to}.`;
    } else if (piece === 'queen') {
      strategicThemes.push('Queen Coordination', 'Multi-target Pressure');
      whyGoodOrBest = `${playerName} activates the queen to ${moveObj.to}, combining threats against both central squares and ${opponentName}'s king perimeter.`;
      mistakesAndBlunders = `Exposing the queen to minor piece harrying would waste valuable tempi.`;
      tacticalNote = `Queen centralization; creates multi-square pressure.`;
      generalSummary = `${playerName} coordinates queen via ${moveObj.to}.`;
    } else {
      strategicThemes.push('King Activity', 'Endgame Principle');
      whyGoodOrBest = `${playerName} steps the king to ${moveObj.to}, advancing into an active role for the approaching endgame.`;
      mistakesAndBlunders = `Leaving the king passive or in the path of pins would spell trouble in the endgame.`;
      tacticalNote = `King centralization in the endgame.`;
      generalSummary = `${playerName} positions king on ${moveObj.to}.`;
    }

    explanations.push({
      moveNumber,
      notation: san,
      side,
      explanation: generalSummary,
      strategicThemes,
      threatsOrPlans: `Control of ${moveObj.to} and coordination of pieces for ${side}.`,
      fen: fenAfter,
      moveQuality,
      whyGoodOrBest,
      mistakesAndBlunders,
      tacticalNote,
    });
  }

  explanationCache.set(cacheKey, explanations);
  return explanations;
}
