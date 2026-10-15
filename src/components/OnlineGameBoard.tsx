import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Flag, Handshake } from 'lucide-react';
import { Chessboard } from './Chessboard';
import { formatClock, getTimeControl } from '../types/timeControl';
import { OnlineChessGame, OnlineGameAction } from '../types/onlineGame';

interface OnlineGameBoardProps {
  game: OnlineChessGame;
  boardTheme: string;
  displayClock: { w: number; b: number } | null;
  isBusy: boolean;
  notice: string | null;
  error: string | null;
  onMove: (from: string, to: string, san: string) => void;
  onAction: (action: OnlineGameAction) => void;
}

function PlayerBar({ name, color, clock, active, isYou }: {
  name: string;
  color: 'w' | 'b';
  clock: number | null;
  active: boolean;
  isYou: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 sm:px-4 sm:py-2.5 ${
      active ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100' : 'border-zinc-800 bg-black/25 text-zinc-300'
    }`}>
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 rounded-full border ${color === 'w' ? 'border-zinc-400 bg-zinc-100' : 'border-zinc-500 bg-zinc-900'}`} />
        <span className="truncate text-sm font-semibold">{name}{isYou ? ' (You)' : ''}</span>
      </div>
      {clock !== null && <span className="font-mono text-lg font-extrabold tabular-nums sm:text-xl">{formatClock(clock)}</span>}
    </div>
  );
}

export const OnlineGameBoard: React.FC<OnlineGameBoardProps> = ({
  game,
  boardTheme,
  displayClock,
  isBusy,
  notice,
  error,
  onMove,
  onAction,
}) => {
  const [confirmingResign, setConfirmingResign] = useState(false);
  const moveListRef = useRef<HTMLOListElement>(null);

  const isPlaying = game.status === 'playing';
  const isYourTurn = isPlaying && game.currentTurn === game.yourColor;
  const drawOfferedByOpponent = !!game.drawOfferBy && game.drawOfferBy !== game.yourColor;
  const drawOfferedByYou = game.drawOfferBy === game.yourColor;
  const opponentColor = game.yourColor === 'w' ? 'b' : 'w';
  const yourName = game.yourColor === 'w' ? game.hostName : game.guestName || 'You';
  const opponentName = game.opponentName || 'Opponent';
  const timeControl = getTimeControl(game.timeControlId);

  const lastMove = useMemo(() => {
    if (game.moves.length === 0) return null;
    try {
      const chess = new Chess();
      let last: { from: string; to: string } | null = null;
      for (const san of game.moves) {
        const move = chess.move(san);
        last = { from: move.from, to: move.to };
      }
      return last;
    } catch {
      return null;
    }
  }, [game.moves]);

  const movePairs = useMemo(() => {
    const pairs: { number: number; white: string; black?: string }[] = [];
    game.moves.forEach((san, index) => {
      if (index % 2 === 0) pairs.push({ number: index / 2 + 1, white: san });
      else pairs[pairs.length - 1].black = san;
    });
    return pairs;
  }, [game.moves]);

  useEffect(() => {
    const list = moveListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [game.moves.length]);

  useEffect(() => {
    if (!isPlaying || game.drawOfferBy === null) return;
    setConfirmingResign(false);
  }, [isPlaying, game.drawOfferBy]);

  const statusText = !isPlaying
    ? 'Game over'
    : drawOfferedByOpponent
      ? 'Your opponent offers a draw'
      : isYourTurn
        ? 'Your turn'
        : `${opponentName}’s turn`;

  return (
    <div role="dialog" aria-modal="true" aria-label="Online chess game" className="fixed inset-0 z-[100] overflow-y-auto bg-[#0e1210] text-zinc-100">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-3 p-3 sm:p-5 lg:flex-row lg:items-start lg:justify-center lg:gap-6">
        <div className="mx-auto flex w-full max-w-[min(100%,calc(100dvh-13rem),540px)] flex-col gap-2 lg:mx-0 lg:max-w-[min(100%,calc(100dvh-9rem),540px)]">
          <PlayerBar name={opponentName} color={opponentColor} clock={displayClock ? displayClock[opponentColor] : null} active={isPlaying && game.currentTurn === opponentColor} isYou={false} />
          <Chessboard
            fen={game.fen}
            flipped={game.yourColor === 'b'}
            theme={boardTheme}
            lastMove={lastMove}
            interactive={isYourTurn && !isBusy}
            onMoveAttempt={onMove}
          />
          <PlayerBar name={yourName} color={game.yourColor} clock={displayClock ? displayClock[game.yourColor] : null} active={isPlaying && game.currentTurn === game.yourColor} isYou />
        </div>

        <aside className="mx-auto flex w-full max-w-[640px] flex-col gap-3 lg:mx-0 lg:w-80 lg:max-w-none lg:shrink-0">
          <div className="rounded-xl border border-zinc-800 bg-[#141916] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">Online match · {timeControl.minutes === null ? 'No time control' : timeControl.label}</p>
            <p role="status" aria-live="polite" className={`mt-1 text-base font-bold ${drawOfferedByOpponent ? 'text-amber-200' : 'text-zinc-100'}`}>{statusText}</p>
            <p className="mt-0.5 text-xs text-zinc-400">You are playing {game.yourColor === 'w' ? 'White' : 'Black'}</p>
          </div>

          {isPlaying && (
            <div className="rounded-xl border border-zinc-800 bg-[#141916] p-3">
              {drawOfferedByOpponent ? (
                <div className="space-y-2">
                  <p className="text-sm text-amber-200">{opponentName} offered a draw.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" disabled={isBusy} onClick={() => onAction('draw-accept')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"><Handshake className="h-4 w-4" /> Accept</button>
                    <button type="button" disabled={isBusy} onClick={() => onAction('draw-reject')} className="rounded-lg border border-zinc-700 px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-50">Decline</button>
                  </div>
                </div>
              ) : confirmingResign ? (
                <div className="space-y-2">
                  <p className="text-sm text-rose-200">Resign this game? You will lose.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" disabled={isBusy} onClick={() => { setConfirmingResign(false); onAction('resign'); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-3 py-2.5 text-sm font-bold text-white hover:bg-rose-400 disabled:opacity-50"><Flag className="h-4 w-4" /> Yes, resign</button>
                    <button type="button" onClick={() => setConfirmingResign(false)} className="rounded-lg border border-zinc-700 px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800">Keep playing</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {drawOfferedByYou ? (
                    <button type="button" disabled={isBusy} onClick={() => onAction('draw-decline')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-3 text-sm font-semibold text-amber-100 hover:bg-amber-500/20 disabled:opacity-50"><Handshake className="h-4 w-4" /> Cancel offer</button>
                  ) : (
                    <button type="button" disabled={isBusy} onClick={() => onAction('draw-offer')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 px-3 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-500/10 disabled:opacity-50"><Handshake className="h-4 w-4" /> Draw</button>
                  )}
                  <button type="button" disabled={isBusy} onClick={() => setConfirmingResign(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/40 px-3 py-3 text-sm font-semibold text-rose-200 hover:bg-rose-500/10 disabled:opacity-50"><Flag className="h-4 w-4" /> Resign</button>
                </div>
              )}
              {drawOfferedByYou && !confirmingResign && <p className="mt-2 text-xs text-zinc-400">Draw offer sent. Waiting for {opponentName}.</p>}
            </div>
          )}

          <div className="rounded-xl border border-zinc-800 bg-[#141916] p-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Moves</h3>
            {movePairs.length === 0 ? (
              <p className="mt-2 text-xs text-zinc-500">No moves yet. White moves first.</p>
            ) : (
              <ol ref={moveListRef} className="mt-2 max-h-40 space-y-0.5 overflow-y-auto pr-1 font-mono text-sm lg:max-h-72">
                {movePairs.map((pair) => (
                  <li key={pair.number} className="grid grid-cols-[2rem_1fr_1fr] gap-2">
                    <span className="text-zinc-500">{pair.number}.</span>
                    <span className="text-zinc-100">{pair.white}</span>
                    <span className="text-zinc-100">{pair.black ?? ''}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {notice && <p role="status" className="text-center text-sm text-emerald-200">{notice}</p>}
          {error && <p role="alert" className="text-center text-sm text-rose-300">{error}</p>}
        </aside>
      </div>
    </div>
  );
};
