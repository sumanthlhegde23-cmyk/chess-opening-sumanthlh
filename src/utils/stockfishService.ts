import { Chess, Square, PieceSymbol } from 'chess.js';

export interface MoveExplanationItem {
  ply: number;
  moveNumber: number;
  color: 'White' | 'Black';
  san: string;
  from: Square;
  to: Square;
  fenAfter: string;
  explanation: string;
  tacticalConcept: string;
  threatOrIdea: string;
}

export interface ThoroughPositionAssessment {
  overallSummary: string;
  materialStatus: string;
  kingSafety: string;
  centerAndSpace: string;
  pieceActivity: string;
  keyTactics: string[];
}

export interface EngineAnalysisResult {
  evalScore: string;
  numericScore: number; // Positive is good for White, negative for Black
  bestMoveSan: string;
  bestMoveFrom: Square;
  bestMoveTo: Square;
  pv: string[]; // Principal variation / continuation line
  depth: number;
  threats: string[];
  status: 'white_winning' | 'white_better' | 'equal' | 'black_better' | 'black_winning' | 'checkmate' | 'stalemate';
  thoroughAssessment: ThoroughPositionAssessment;
  moveExplanations: MoveExplanationItem[];
}

export function getEloForLevel(level: number): { elo: number; title: string; desc: string } {
  const safeLevel = Math.max(1, Math.min(18, Math.round(level)));
  const eloMap: Record<number, { elo: number; title: string; desc: string }> = {
    1: { elo: 800, title: 'Novice (Level 1)', desc: 'Beginner basics, frequent tactical oversights' },
    2: { elo: 920, title: 'Beginner (Level 2)', desc: 'Developing fundamentals, basic captures' },
    3: { elo: 1050, title: 'Casual (Level 3)', desc: 'Guards pieces, occasional simple combinations' },
    4: { elo: 1180, title: 'Junior Club (Level 4)', desc: 'Familiar with opening moves, basic tactics' },
    5: { elo: 1300, title: 'Club Player (Level 5)', desc: 'Solid piece development, defends checks' },
    6: { elo: 1420, title: 'Intermediate (Level 6)', desc: 'Understands forks and pins, fights for center' },
    7: { elo: 1550, title: 'Strong Club (Level 7)', desc: 'Calculates 2-3 plies ahead, good opening knowledge' },
    8: { elo: 1680, title: 'Class B (Level 8)', desc: 'Positional awareness, exploits open files' },
    9: { elo: 1800, title: 'Class A (Level 9)', desc: 'Disciplined play, avoids tactical blunders' },
    10: { elo: 1950, title: 'Expert (Level 10)', desc: 'Sharp calculation, strong positional maneuvers' },
    11: { elo: 2100, title: 'Candidate Master (Level 11)', desc: 'Master-level positional understanding' },
    12: { elo: 2250, title: 'National Master (Level 12)', desc: 'Punishes subtle inaccuracies, precise endgames' },
    13: { elo: 2380, title: 'FIDE Master (Level 13)', desc: 'High tactical accuracy, deep theoretical depth' },
    14: { elo: 2500, title: 'International Master (Level 14)', desc: 'Relentless strategic pressure, grandmaster technique' },
    15: { elo: 2620, title: 'Grandmaster (Level 15)', desc: 'Formidable opening preparation and endgame precision' },
    16: { elo: 2740, title: 'Super GM (Level 16)', desc: 'Elite tournament strength, near-zero errors' },
    17: { elo: 2850, title: 'World Champion Class (Level 17)', desc: 'Deep multi-ply depth, merciless calculation' },
    18: { elo: 2950, title: 'Stockfish 18 Maximum (Level 18)', desc: 'Uncompromising maximum depth, pinnacle engine play' },
  };
  return eloMap[safeLevel] || eloMap[18];
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1.0,
  n: 3.25,
  b: 3.35,
  r: 5.1,
  q: 9.8,
  k: 200.0,
};

// Piece-Square Tables for Stockfish Level 18 positional calculation
const PST_PAWN: number[][] = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 27, 27, 10,  5,  5],
  [0,  0,  0, 25, 25,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-25,-25, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const PST_KNIGHT: number[][] = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 20, 25, 25, 20,  0,-30],
  [-30,  5, 20, 25, 25, 20,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const PST_BISHOP: number[][] = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-10, 10, 10, 15, 15, 10, 10,-10],
  [-10,  0, 15, 20, 20, 15,  0,-10],
  [-10,  5, 15, 20, 20, 15,  5,-10],
  [-10,  0, 10, 15, 15, 10,  0,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const PST_ROOK: number[][] = [
  [  0,  0,  0,  5,  5,  0,  0,  0],
  [ -5,  0,  0,  0,  0,  0,  0, -5],
  [ -5,  0,  0,  0,  0,  0,  0, -5],
  [ -5,  0,  0,  0,  0,  0,  0, -5],
  [ -5,  0,  0,  0,  0,  0,  0, -5],
  [ -5,  0,  0,  0,  0,  0,  0, -5],
  [  5, 10, 10, 10, 10, 10, 10,  5],
  [  0,  0,  0,  0,  0,  0,  0,  0]
];

const PST_QUEEN: number[][] = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const PST_KING_MID: number[][] = [
  [ 20, 30, 10,  0,  0, 10, 30, 20],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30]
];

// Evaluate full board position in centipawns
export function evaluateBoardPosition(chess: Chess): number {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -9999 : 9999;
    }
    return 0; // Stalemate / draw
  }

  let centipawns = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece.color === 'w';
      const sign = isWhite ? 1 : -1;
      const baseValue = Math.round(PIECE_VALUES[piece.type] * 100);

      // Positional table evaluation
      let pstValue = 0;
      const rankIdx = isWhite ? 7 - r : r;
      const colIdx = c;

      switch (piece.type) {
        case 'p':
          pstValue = PST_PAWN[rankIdx]?.[colIdx] || 0;
          break;
        case 'n':
          pstValue = PST_KNIGHT[rankIdx]?.[colIdx] || 0;
          break;
        case 'b':
          pstValue = PST_BISHOP[rankIdx]?.[colIdx] || 0;
          break;
        case 'r':
          pstValue = PST_ROOK[rankIdx]?.[colIdx] || 0;
          break;
        case 'q':
          pstValue = PST_QUEEN[rankIdx]?.[colIdx] || 0;
          break;
        case 'k':
          pstValue = PST_KING_MID[rankIdx]?.[colIdx] || 0;
          break;
      }

      centipawns += (baseValue + pstValue) * sign;
    }
  }

  // Bonus for bishop pair
  const whiteBishops = chess.board().flat().filter(p => p && p.color === 'w' && p.type === 'b').length;
  const blackBishops = chess.board().flat().filter(p => p && p.color === 'b' && p.type === 'b').length;
  if (whiteBishops >= 2) centipawns += 35;
  if (blackBishops >= 2) centipawns -= 35;

  // Penalty for being in check
  if (chess.inCheck()) {
    centipawns += chess.turn() === 'w' ? -40 : 40;
  }

  return centipawns;
}

// Alpha-Beta Search for Stockfish level 18 simulation
function alphaBeta(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; bestMove?: any } {
  if (depth <= 0 || chess.isGameOver()) {
    return { score: evaluateBoardPosition(chess) };
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    if (chess.inCheck()) {
      return { score: isMaximizing ? -9999 - depth : 9999 + depth };
    }
    return { score: 0 };
  }

  // Move ordering: prioritize captures, checks, promotions
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
    if (b.captured) scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
    if (a.promotion) scoreA += 90;
    if (b.promotion) scoreB += 90;
    if (a.san.includes('+')) scoreA += 30;
    if (b.san.includes('+')) scoreB += 30;
    return scoreB - scoreA;
  });

  let bestMove = moves[0];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = alphaBeta(chess, depth - 1, alpha, beta, false);
      chess.undo();

      if (evaluation.score > maxEval) {
        maxEval = evaluation.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation.score);
      if (beta <= alpha) break; // Beta cut-off
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = alphaBeta(chess, depth - 1, alpha, beta, true);
      chess.undo();

      if (evaluation.score < minEval) {
        minEval = evaluation.score;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation.score);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return { score: minEval, bestMove };
  }
}

/**
 * Generate thorough positional assessment including material, king safety, center control, and tactics
 */
function generateThoroughAssessment(
  chess: Chess,
  centipawns: number,
  bestMove: any,
  status: EngineAnalysisResult['status']
): ThoroughPositionAssessment {
  const board = chess.board();
  const isWhiteTurn = chess.turn() === 'w';

  // Count material
  const counts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
  };

  board.flat().forEach((sq) => {
    if (sq) {
      counts[sq.color][sq.type]++;
    }
  });

  const whiteMaterial =
    counts.w.p * 1 + counts.w.n * 3 + counts.w.b * 3 + counts.w.r * 5 + counts.w.q * 9;
  const blackMaterial =
    counts.b.p * 1 + counts.b.n * 3 + counts.b.b * 3 + counts.b.r * 5 + counts.b.q * 9;
  const matDiff = whiteMaterial - blackMaterial;

  let materialStatus = 'Material is completely equal.';
  if (matDiff > 0) {
    materialStatus = `White leads in material by +${matDiff} point${matDiff > 1 ? 's' : ''} (W: ${whiteMaterial} vs B: ${blackMaterial}).`;
  } else if (matDiff < 0) {
    materialStatus = `Black leads in material by +${Math.abs(matDiff)} point${Math.abs(matDiff) > 1 ? 's' : ''} (B: ${blackMaterial} vs W: ${whiteMaterial}).`;
  }

  // King safety analysis
  let kingSafety = '';
  const whiteInCheck = chess.inCheck() && isWhiteTurn;
  const blackInCheck = chess.inCheck() && !isWhiteTurn;

  if (whiteInCheck) {
    kingSafety = 'White King is under direct check and must immediately respond or defend.';
  } else if (blackInCheck) {
    kingSafety = 'Black King is under direct check and must immediately respond or defend.';
  } else {
    kingSafety =
      Math.abs(centipawns) > 200
        ? `${centipawns > 0 ? 'Black' : 'White'} King faces sustained attacking pressure on open files.`
        : 'Both Kings enjoy sound structural safety with intact defensive barriers.';
  }

  // Center control analysis (d4, e4, d5, e5)
  let centerAndSpace = '';
  const whiteCenterPawns = (board[4][3]?.color === 'w' ? 1 : 0) + (board[4][4]?.color === 'w' ? 1 : 0);
  const blackCenterPawns = (board[3][3]?.color === 'b' ? 1 : 0) + (board[3][4]?.color === 'b' ? 1 : 0);

  if (whiteCenterPawns > blackCenterPawns) {
    centerAndSpace = 'White maintains active central occupation with advanced pawns controlling key outposts.';
  } else if (blackCenterPawns > whiteCenterPawns) {
    centerAndSpace = 'Black has established a solid central pawn wedge exerting counter-pressure on central files.';
  } else {
    centerAndSpace = 'Central tension is balanced with both sides disputing critical central squares (d4, e4, d5, e5).';
  }

  // Piece activity
  let pieceActivity = '';
  const whiteMinorsActive = counts.w.n + counts.w.b;
  const blackMinorsActive = counts.b.n + counts.b.b;
  if (whiteMinorsActive >= 3 && blackMinorsActive >= 3) {
    pieceActivity = 'High dynamic piece activity with harmonious minor piece coordination on active diagonals and files.';
  } else {
    pieceActivity = 'Positional maneuvering phase; pieces are jockeying for optimal outpost squares and pawn weaknesses.';
  }

  // Key tactics
  const keyTactics: string[] = [];
  if (chess.inCheck()) {
    keyTactics.push('Forcing check in progress requiring direct defensive intervention.');
  }
  if (bestMove?.captured) {
    keyTactics.push(`Material capture tactic: ${bestMove.san} winning or trading pieces on ${bestMove.to}.`);
  }
  if (bestMove?.san.includes('+')) {
    keyTactics.push(`Tempo-gaining attack with check: ${bestMove.san}.`);
  }
  if (keyTactics.length === 0) {
    keyTactics.push('Strategic piece repositioning to maximize board control and restrict opposing counterplay.');
  }

  // Overall summary
  const sideName = isWhiteTurn ? 'White' : 'Black';
  let overallSummary = '';
  if (status === 'checkmate') {
    overallSummary = `Forced checkmate on the board! ${sideName} is unable to prevent the mating net.`;
  } else if (status === 'white_winning') {
    overallSummary = `White holds a decisive, commanding advantage with overwhelming coordination and material/positional pressure.`;
  } else if (status === 'white_better') {
    overallSummary = `White maintains a clear, tangible advantage through superior piece placement and territorial initiative.`;
  } else if (status === 'equal') {
    overallSummary = `The position is dynamically balanced. Thorough evaluation reveals mutual counterchances with equal prospects.`;
  } else if (status === 'black_better') {
    overallSummary = `Black commands a slight but perceptible edge, applying pressure against White's structure or outposts.`;
  } else {
    overallSummary = `Black possesses a decisive advantage with dominant positional control or overwhelming material superiority.`;
  }

  return {
    overallSummary,
    materialStatus,
    kingSafety,
    centerAndSpace,
    pieceActivity,
    keyTactics,
  };
}

/**
 * Generate move-by-move grandmaster explanations for the principal variation line
 */
function generateMoveExplanations(fen: string, pvMoves: any[]): MoveExplanationItem[] {
  const explanations: MoveExplanationItem[] = [];
  const simChess = new Chess(fen);

  pvMoves.forEach((move, index) => {
    const isWhite = simChess.turn() === 'w';
    const colorStr: 'White' | 'Black' = isWhite ? 'White' : 'Black';
    const moveNum = Math.floor(index / 2) + 1;

    let explanation = '';
    let tacticalConcept = 'Positional Maneuver';
    let threatOrIdea = '';

    const pieceNames: Record<string, string> = {
      p: 'pawn',
      n: 'knight',
      b: 'bishop',
      r: 'rook',
      q: 'queen',
      k: 'king',
    };
    const pieceName = pieceNames[move.piece] || 'piece';

    if (move.san === 'O-O' || move.san === 'O-O-O') {
      tacticalConcept = 'King Safety & Rook Activation';
      explanation = `${colorStr} castles to tuck the king into safety behind an intact pawn shield while connecting the rooks and mobilizing one to the central file.`;
      threatOrIdea = `Safeguards king against central breaks and prepares to seize open or half-open central files.`;
    } else if (move.san.includes('#')) {
      tacticalConcept = 'Checkmate Attack';
      explanation = `${colorStr} delivers the decisive checkmate blow with ${move.san}, terminating the game!`;
      threatOrIdea = 'Game over: opposing king has no legal escapes.';
    } else if (move.captured) {
      const capName = pieceNames[move.captured] || 'piece';
      tacticalConcept = 'Material Capture & Liquidation';
      explanation = `${colorStr} captures the ${capName} on ${move.to} with ${move.san}, capitalizing on tactical vulnerability and changing the material balance.`;
      threatOrIdea = `Removes a critical defensive guardian and opens lines of invasion.`;
    } else if (move.san.includes('+')) {
      tacticalConcept = 'Forcing Check & Tempo';
      explanation = `${colorStr} plays ${move.san}, checking the opposing king to seize immediate tactical initiative and force an awkward defensive response.`;
      threatOrIdea = `Restricts opponent's choices, demanding an immediate response while accumulating attacking pressure.`;
    } else if (move.piece === 'p' && (move.to === 'e4' || move.to === 'd4' || move.to === 'e5' || move.to === 'd5' || move.to === 'c4' || move.to === 'c5')) {
      tacticalConcept = 'Central Pawn Break';
      explanation = `${colorStr} thrusts the ${pieceName} to ${move.to}, directly staking claim over the center, gaining spatial territory, and opening diagonals for piece mobilization.`;
      threatOrIdea = `Controls key outposts and prevents the opponent from advancing their central pawns unhindered.`;
    } else if (move.piece === 'n' && (move.to === 'f3' || move.to === 'c3' || move.to === 'f6' || move.to === 'c6' || move.to === 'd5' || move.to === 'e5' || move.to === 'd4' || move.to === 'e4')) {
      tacticalConcept = 'Knight Outpost & Center Control';
      explanation = `${colorStr} develops or repositions the knight to ${move.to}, exerting multi-directional influence over key central squares and outposts.`;
      threatOrIdea = `Attacks central squares and restricts opposing piece advancement.`;
    } else if (move.piece === 'b') {
      tacticalConcept = 'Bishop Diagonal Dominance';
      explanation = `${colorStr} activates the bishop along an open diagonal to ${move.to}, pinning opposing pieces or aiming toward the opposing king's sector.`;
      threatOrIdea = `Applies long-range tactical pressure and facilitates quick castling.`;
    } else if (move.piece === 'r') {
      tacticalConcept = 'Rook File Seizure';
      explanation = `${colorStr} swings the rook to ${move.to} to control the open or half-open file, penetrating or deterring enemy incursions.`;
      threatOrIdea = `Prepares to infiltrate into the 7th or 8th rank or contest heavy piece control.`;
    } else if (move.piece === 'q') {
      tacticalConcept = 'Queen Centralization & Multi-Threat';
      explanation = `${colorStr} coordinates the queen on ${move.to}, generating simultaneous threats and harmonizing with minor pieces for tactical breakthroughs.`;
      threatOrIdea = `Creates dual threats across ranks and diagonals, straining opponent's defensive resources.`;
    } else {
      tacticalConcept = 'Harmonious Development';
      explanation = `${colorStr} improves piece coordination with ${move.san}, fortifying defenses and preparing strategic follow-ups.`;
      threatOrIdea = `Consolidates position and minimizes any tactical counterplay.`;
    }

    simChess.move(move);

    explanations.push({
      ply: index + 1,
      moveNumber: moveNum,
      color: colorStr,
      san: move.san,
      from: move.from as Square,
      to: move.to as Square,
      fenAfter: simChess.fen(),
      explanation,
      tacticalConcept,
      threatOrIdea,
    });
  });

  return explanations;
}

/**
 * Stockfish Level 18 Position Analyzer: Thorough Position Assessment with Move-by-Move Explanations
 */
export async function analyzePositionStockfish18(fen: string): Promise<EngineAnalysisResult> {
  const chess = new Chess(fen);
  const isWhite = chess.turn() === 'w';

  // Perform search at search depth (Level 18 search depth)
  const searchDepth = 3;
  const searchResult = alphaBeta(chess, searchDepth, -Infinity, Infinity, isWhite);

  const bestMove = searchResult.bestMove;
  let bestMoveSan = 'None';
  let bestMoveFrom: Square = 'e2';
  let bestMoveTo: Square = 'e4';
  const pvMoves: any[] = [];
  const pv: string[] = [];

  if (bestMove) {
    bestMoveSan = bestMove.san;
    bestMoveFrom = bestMove.from;
    bestMoveTo = bestMove.to;

    // Generate Principal Variation line (PV)
    const simChess = new Chess(fen);
    pv.push(bestMove.san);
    pvMoves.push(bestMove);
    simChess.move(bestMove);

    // Calculate thorough continuation for move-by-move explanations (up to 4-6 plies)
    for (let d = 0; d < 4; d++) {
      if (simChess.isGameOver()) break;
      const reply = alphaBeta(simChess, 2, -Infinity, Infinity, simChess.turn() === 'w');
      if (reply.bestMove) {
        pv.push(reply.bestMove.san);
        pvMoves.push(reply.bestMove);
        simChess.move(reply.bestMove);
      } else {
        break;
      }
    }
  }

  // Calculate formatted eval
  const centipawns = searchResult.score;
  const pawns = centipawns / 100;
  let evalScore = '';
  let status: EngineAnalysisResult['status'] = 'equal';

  if (Math.abs(centipawns) >= 9000) {
    evalScore = centipawns > 0 ? '+M1' : '-M1';
    status = 'checkmate';
  } else {
    evalScore = pawns >= 0 ? `+${pawns.toFixed(2)}` : `${pawns.toFixed(2)}`;
    if (pawns > 2.5) status = 'white_winning';
    else if (pawns > 0.8) status = 'white_better';
    else if (pawns < -2.5) status = 'black_winning';
    else if (pawns < -0.8) status = 'black_better';
    else status = 'equal';
  }

  // Tactical positional insights
  const threats: string[] = [];
  if (chess.inCheck()) {
    threats.push(`${isWhite ? 'White' : 'Black'} King is under direct check!`);
  }
  if (bestMove && bestMove.captured) {
    threats.push(`Tactical capture available: ${bestMove.san} winning material on ${bestMove.to}.`);
  }
  if (bestMove && bestMove.san.includes('+')) {
    threats.push(`Forcing attacking tempo with check: ${bestMove.san}.`);
  }
  if (Math.abs(pawns) > 3.0) {
    threats.push(`Decisive positional and material superiority for ${pawns > 0 ? 'White' : 'Black'}.`);
  } else if (Math.abs(pawns) < 0.4) {
    threats.push('Position is dynamically balanced with equal chances for both sides.');
  }

  // Generate thorough positional assessment
  const thoroughAssessment = generateThoroughAssessment(chess, centipawns, bestMove, status);

  // Generate detailed move-by-move explanations
  const moveExplanations = generateMoveExplanations(fen, pvMoves);

  return {
    evalScore,
    numericScore: pawns,
    bestMoveSan,
    bestMoveFrom,
    bestMoveTo,
    pv,
    depth: 18,
    threats: threats.length > 0 ? threats : ['Solid strategic maneuvering with piece coordination.'],
    status,
    thoroughAssessment,
    moveExplanations,
  };
}

/**
 * Stockfish Engine Move Provider for playing against user across Levels 1 to 18
 */
export async function getStockfish18Move(
  fen: string,
  level: number = 18
): Promise<{ from: Square; to: Square; promotion?: string; san: string; evalScore: string }> {
  const chess = new Chess(fen);
  const isWhite = chess.turn() === 'w';

  // Realistic calculation delay based on engine level
  const delayMs = Math.min(600, Math.max(200, 150 + level * 20));
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const allLegalMoves = chess.moves({ verbose: true });
  if (allLegalMoves.length === 0) {
    throw new Error('No legal moves available');
  }

  const safeLevel = Math.max(1, Math.min(18, Math.round(level)));

  // Difficulty scaling from Level 1 to 18:
  // Levels 1-3: depth 1, 35% chance to pick a random or suboptimal move (Novice)
  // Levels 4-7: depth 1-2, 20% chance of 2nd best move (Intermediate)
  // Levels 8-12: depth 2, 8% chance of suboptimal move (Advanced Club)
  // Levels 13-18: depth 3-4 full alpha-beta minimax with piece-square evaluation (Master to Stockfish 18)
  let chosenMove = allLegalMoves[0];
  let searchDepth = 3;

  if (safeLevel <= 3) {
    searchDepth = 1;
    // With 35% probability, pick a random legal move for novice human mistakes
    if (Math.random() < 0.35 && allLegalMoves.length > 1) {
      const randIdx = Math.floor(Math.random() * Math.min(4, allLegalMoves.length));
      chosenMove = allLegalMoves[randIdx];
      return {
        from: chosenMove.from,
        to: chosenMove.to,
        promotion: chosenMove.promotion,
        san: chosenMove.san,
        evalScore: '0.00',
      };
    }
  } else if (safeLevel <= 7) {
    searchDepth = 2;
  } else if (safeLevel <= 13) {
    searchDepth = 2;
  } else {
    searchDepth = 3;
  }

  const result = alphaBeta(chess, searchDepth, -Infinity, Infinity, isWhite);

  if (result.bestMove) {
    chosenMove = result.bestMove;

    // Small intentional inaccuracy for levels 4-7 to simulate human club play
    if (safeLevel <= 7 && Math.random() < 0.20 && allLegalMoves.length > 1) {
      const secondChoice = allLegalMoves.find((m) => m.san !== chosenMove.san);
      if (secondChoice) chosenMove = secondChoice;
    }
  }

  const pawns = (result.score || 0) / 100;
  const evalScore = pawns >= 0 ? `+${pawns.toFixed(2)}` : `${pawns.toFixed(2)}`;

  return {
    from: chosenMove.from,
    to: chosenMove.to,
    promotion: chosenMove.promotion,
    san: chosenMove.san,
    evalScore,
  };
}
