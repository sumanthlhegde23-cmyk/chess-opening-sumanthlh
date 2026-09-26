import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { BadMoveRefutation, Opening, Variation } from '../types/chess';

export interface DeviationAnalysis {
  attemptedSan: string;
  expectedSan: string;
  severity: 'blunder' | 'mistake' | 'inaccuracy';
  evalScore: string;
  whyBad: string;
  engineLine: string;
  continuationMoves: string[]; // SAN array starting from opponent's immediate reply
  fullSequenceMoves: string[]; // [attemptedSan, ...continuationMoves]
  fullSequenceFens: string[]; // [fenAfterAttempt, ...fensAfterContinuations]
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1.0,
  n: 3.2,
  b: 3.3,
  r: 5.0,
  q: 9.5,
  k: 200.0,
};

// Evaluate board position from White's perspective
function evaluatePosition(chess: Chess): number {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -999 : 999;
    }
    return 0;
  }

  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type];
      const sign = piece.color === 'w' ? 1 : -1;

      score += val * sign;

      // Positional bonuses:
      // Central pawns
      if (piece.type === 'p') {
        if ((r === 3 || r === 4) && (c === 3 || c === 4)) {
          score += 0.35 * sign;
        } else if ((r === 2 || r === 5) && (c === 2 || c === 5)) {
          score += 0.15 * sign;
        }
      }

      // Knights on rim penalty
      if (piece.type === 'n') {
        if (c === 0 || c === 7) {
          score -= 0.35 * sign;
        }
      }
    }
  }

  return score;
}

// Alpha-Beta minimax to find best continuation
function findBestMove(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; bestMove?: string } {
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluatePosition(chess) };
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return { score: evaluatePosition(chess) };
  }

  // Prioritize captures and checks for better search
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
    if (b.captured) scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
    if (a.san.includes('+')) scoreA += 5;
    if (b.san.includes('+')) scoreB += 5;
    return scoreB - scoreA;
  });

  let bestMoveSan = moves[0].san;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      chess.move(m.san);
      const ev = findBestMove(chess, depth - 1, alpha, beta, false).score;
      chess.undo();

      if (ev > maxEval) {
        maxEval = ev;
        bestMoveSan = m.san;
      }
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return { score: maxEval, bestMove: bestMoveSan };
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      chess.move(m.san);
      const ev = findBestMove(chess, depth - 1, alpha, beta, true).score;
      chess.undo();

      if (ev < minEval) {
        minEval = ev;
        bestMoveSan = m.san;
      }
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return { score: minEval, bestMove: bestMoveSan };
  }
}

/**
 * Strips SAN string of check/checkmate/annotation characters for safe comparison
 */
function cleanSan(s: string): string {
  return s.replace(/[+#!?]/g, '').trim();
}

/**
 * Main Deviation Analyzer: takes the position, user's move, and expected book move,
 * and produces a comprehensive educational refutation with engine continuation lines.
 */
export function analyzeDeviation(
  fenBefore: string,
  userSan: string,
  expectedSan: string,
  currentMoveIndex: number,
  opening: Opening,
  variation: Variation
): DeviationAnalysis {
  const chessBefore = new Chess(fenBefore);
  const sideToMove = chessBefore.turn(); // 'w' or 'b'
  const isWhite = sideToMove === 'w';
  const mover = isWhite ? 'White' : 'Black';
  const opponent = isWhite ? 'Black' : 'White';

  // Execute user move
  const chessAfterUser = new Chess(fenBefore);
  const moveObj = chessAfterUser.move(userSan);
  const fenAfterUser = chessAfterUser.fen();

  // 1. Check if the current variation already has curated bad move refutations matching this move
  const currentExp = currentMoveIndex >= 0 ? variation.moveExplanations[currentMoveIndex] : undefined;
  const curatedRefutations: BadMoveRefutation[] = currentExp?.badMoveRefutations || [];

  const matchedCurated = curatedRefutations.find((ref) => {
    const rawBadMove = ref.badMove.replace(/^\d+\.{1,3}/, '').trim();
    const cleanedBad = cleanSan(rawBadMove);
    const cleanedUser = cleanSan(userSan);
    return (
      cleanedBad === cleanedUser ||
      cleanedBad.startsWith(cleanedUser) ||
      cleanedUser.startsWith(cleanedBad) ||
      rawBadMove.includes(cleanedUser)
    );
  });

  if (matchedCurated && matchedCurated.refutationMoves && matchedCurated.refutationMoves.length > 0) {
    // Generate full sequence of FENs for curated line
    const simChess = new Chess(fenBefore);
    const fullSequenceMoves: string[] = [];
    const fullSequenceFens: string[] = [];

    for (const m of matchedCurated.refutationMoves) {
      try {
        const res = simChess.move(m);
        if (res) {
          fullSequenceMoves.push(res.san);
          fullSequenceFens.push(simChess.fen());
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    const continuationMoves = fullSequenceMoves.slice(1);

    return {
      attemptedSan: userSan,
      expectedSan,
      severity: matchedCurated.severity,
      evalScore: matchedCurated.evalScore,
      whyBad: matchedCurated.whyPunished,
      engineLine: matchedCurated.engineLine,
      continuationMoves,
      fullSequenceMoves,
      fullSequenceFens,
    };
  }

  // 2. Dynamic heuristic & engine analysis
  const reasons: string[] = [];
  let severity: 'blunder' | 'mistake' | 'inaccuracy' = 'mistake';

  // A. Check if the user hung a piece
  const oppMoves = chessAfterUser.moves({ verbose: true });
  let hungPieceFound = false;
  let maxHungValue = 0;
  let hungPieceCapture = '';

  for (const om of oppMoves) {
    if (om.captured) {
      const capturedVal = PIECE_VALUES[om.captured];
      const attackingVal = PIECE_VALUES[om.piece];
      // If capturing without defense or capturing higher value
      const testChess = new Chess(fenAfterUser);
      testChess.move(om.san);
      const counterMoves = testChess.moves({ verbose: true });
      const canRecapture = counterMoves.some((cm) => cm.to === om.to);

      if (!canRecapture || capturedVal > attackingVal) {
        hungPieceFound = true;
        const loss = canRecapture ? capturedVal - attackingVal : capturedVal;
        if (loss > maxHungValue) {
          maxHungValue = loss;
          hungPieceCapture = `${om.san} winning the ${om.captured.toUpperCase()} on ${om.to}`;
        }
      }
    }
  }

  if (hungPieceFound && maxHungValue >= 3) {
    severity = 'blunder';
    reasons.push(
      `Tactical Blunder: Leaves material undefended. ${opponent} can immediately punish this with ${hungPieceCapture}.`
    );
  } else if (hungPieceFound && maxHungValue >= 1) {
    severity = 'mistake';
    reasons.push(`Material drop: Drops a pawn or allows a favorable trade with ${hungPieceCapture}.`);
  }

  // B. Check King exposure and checks
  if (chessAfterUser.inCheck()) {
    severity = 'blunder';
    reasons.push(`Direct check: Leaves the king vulnerable to ongoing tactical threats.`);
  }

  if (userSan.startsWith('K')) {
    severity = 'blunder';
    reasons.push(
      `Forfeits Castling Rights: Prematurely wandering with the King deprives you of castling safety and leaves the monarch stranded in open crossfire.`
    );
  }

  // C. King diagonal weakness (f-pawn moves)
  if (userSan === 'f3' || userSan === 'f6' || userSan === 'f4' || userSan === 'f5') {
    if (userSan === 'f3' || userSan === 'f6') {
      severity = 'blunder';
      reasons.push(
        `Critical diagonal weakness: Moving the f-pawn critically opens the ${
          isWhite ? 'e1-h4' : 'e8-h5'
        } diagonal to queen and bishop infiltration while depriving the knight of its ideal f-file square.`
      );
    } else {
      reasons.push(
        `Loosens kingside defenses prematurely before completing piece development.`
      );
    }
  }

  // D. Knight to the rim
  if (['Na3', 'Nh3', 'Na6', 'Nh6'].includes(userSan)) {
    severity = 'mistake';
    reasons.push(
      `"A knight on the rim is dim": Developing to the edge controls only 4 squares instead of 8, ceding central dominance to ${opponent}.`
    );
  }

  // E. Blocking development
  if (userSan === 'Bd3' && chessBefore.get('d2')?.type === 'p') {
    severity = 'mistake';
    reasons.push(
      `Clogs pawn structure: Playing Bd3 awkwardly blocks the d2 pawn, trapping White's dark-squared bishop.`
    );
  }
  if (userSan === 'Bd6' && chessBefore.get('d7')?.type === 'p') {
    severity = 'mistake';
    reasons.push(
      `Clogs pawn structure: Playing Bd6 blocks the d7 pawn, severely restricting Black's light-squared bishop.`
    );
  }

  // F. Flank pawn pushes (a3, h3, a6, h6, g4, g5)
  if (['g4', 'g5', 'h4', 'h5', 'a4', 'b4'].includes(userSan)) {
    reasons.push(
      `Unprovoked wing aggression: Pushing flank pawns in the opening squanders precious development tempos and creates permanent weaknesses without contesting the center.`
    );
  } else if (['a3', 'h3', 'a6', 'h6'].includes(userSan)) {
    reasons.push(
      `Tempo loss: Passive prophylactic pawn push when active piece mobilization and king safety are urgently required.`
    );
  }

  // G. Premature Queen move
  if (userSan.startsWith('Q') && currentMoveIndex <= 3) {
    severity = 'inaccuracy';
    reasons.push(
      `Premature queen sortie: Bringing the Queen out too early invites ${opponent} to develop minor pieces with tempo by repeatedly harassing the exposed Queen.`
    );
  }

  // Default reason if no specific tactical rule triggered
  if (reasons.length === 0) {
    reasons.push(
      `Deviates from standard opening theory: Concedes the central fight to ${opponent}, forfeiting the initiative and giving up key strategic squares.`
    );
  }

  // 3. Search continuation line (4-6 plies ahead) using minimax
  const sim = new Chess(fenAfterUser);
  const continuationMoves: string[] = [];
  const fullSequenceMoves: string[] = [userSan];
  const fullSequenceFens: string[] = [fenAfterUser];

  for (let ply = 0; ply < 6; ply++) {
    if (sim.isGameOver()) break;
    const isMax = sim.turn() === 'w';
    const best = findBestMove(sim, 2, -Infinity, Infinity, isMax);
    if (!best.bestMove) break;

    try {
      const res = sim.move(best.bestMove);
      if (!res) break;
      continuationMoves.push(res.san);
      fullSequenceMoves.push(res.san);
      fullSequenceFens.push(sim.fen());
    } catch {
      break;
    }
  }

  // Format engine line
  let formattedEngineLine = '';
  const currentMoveNum = Math.floor(currentMoveIndex / 2) + 1;
  let simTurnWhite = !isWhite; // opponent moves first in continuation
  let moveCounter = isWhite ? currentMoveNum : currentMoveNum + 1;

  formattedEngineLine = `${userSan}${severity === 'blunder' ? '??' : severity === 'mistake' ? '?' : '?!'} `;

  continuationMoves.forEach((m, idx) => {
    if (simTurnWhite) {
      formattedEngineLine += `${moveCounter}.${m} `;
    } else {
      if (idx === 0) {
        formattedEngineLine += `${moveCounter}...${m} `;
      } else {
        formattedEngineLine += `${m} `;
      }
      moveCounter++;
    }
    simTurnWhite = !simTurnWhite;
  });

  // Calculate approximate evaluation
  const postEval = evaluatePosition(new Chess(fenAfterUser));
  const evalScoreNum = (postEval).toFixed(1);
  const evalScore = postEval > 0 ? `+${evalScoreNum}` : `${evalScoreNum}`;

  return {
    attemptedSan: userSan,
    expectedSan,
    severity,
    evalScore,
    whyBad: reasons.join(' '),
    engineLine: formattedEngineLine.trim(),
    continuationMoves,
    fullSequenceMoves,
    fullSequenceFens,
  };
}
