export interface OnlineChessGame {
  code: string;
  token?: string;
  yourColor: 'w' | 'b';
  opponentName: string | null;
  hostName: string;
  guestName: string | null;
  moves: string[];
  fen: string;
  status: 'waiting' | 'playing' | 'finished';
  currentTurn: 'w' | 'b';
  drawOfferBy: 'w' | 'b' | null;
  result: '1-0' | '0-1' | '1/2-1/2' | null;
  termination: string | null;
  pgn: string;
  timeControlId: string;
  remainingMs: { w: number; b: number } | null;
  serverNow: number;
}

export type OnlineGameAction = 'resign' | 'draw-offer' | 'draw-accept' | 'draw-decline' | 'draw-reject';

export type OnlineGameOutcome = 'win' | 'loss' | 'draw';

export function getOnlineGameOutcome(game: OnlineChessGame): OnlineGameOutcome | null {
  if (!game.result) return null;
  if (game.result === '1/2-1/2') return 'draw';
  const whiteWon = game.result === '1-0';
  return whiteWon === (game.yourColor === 'w') ? 'win' : 'loss';
}
