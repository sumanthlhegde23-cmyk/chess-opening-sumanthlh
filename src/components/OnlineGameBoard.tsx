import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { AlertCircle, Flag, Handshake, Swords, X } from 'lucide-react';
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

function PlayerBar({
  name,
  color,
  clock,
  active,
  isYou,
}: {
  name: string;
  color: 'w' | 'b';
  clock: number | null;
  active: boolean;
  isYou: boolean;
}) {
  return (
    <div
      className={`online-player-bar flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition-all sm:px-4 ${
        active
          ? 'online-player-bar--active border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-2 ring-emerald-500/30'
          : 'online-player-bar--inactive border-zinc-700/60'
      }`}
      style={{
        backgroundColor: active ? undefined : 'var(--bg-surface, #181a20)',
        borderColor: active ? undefined : 'var(--border-color, #27272a)',
        color: active ? undefined : 'var(--text-color, #f4f4f5)',
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 rounded-full border shadow-sm ${
            color === 'w' ? 'border-zinc-300 bg-zinc-100' : 'border-zinc-700 bg-zinc-900'
          }`}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold" style={{ color: active ? undefined : 'var(--text-color, #f4f4f5)' }}>
            {name}
            {isYou ? (
              <span className="ml-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400">
                You
              </span>
            ) : null}
          </p>
          <p className="text-[10px] uppercase tracking-wider opacity-70">
            {color === 'w' ? 'White' : 'Black'}
          </p>
        </div>
      </div>
      {clock !== null && (
        <span
          className={`online-match-clock font-mono text-xl font-black tabular-nums sm:text-2xl ${
            active ? 'text-emerald-400' : 'opacity-90'
          }`}
          style={{ color: active ? undefined : 'var(--text-color, #f4f4f5)' }}
        >
          {formatClock(clock)}
        </span>
      )}
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
  const drawOfferedByOpponent = Boolean(game.drawOfferBy && game.drawOfferBy !== game.yourColor);
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
    ? `${opponentName} offered a draw`
    : isYourTurn
    ? 'Your turn'
    : `${opponentName}’s turn`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Online chess game"
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{
        backgroundColor: 'var(--bg-main, #0e1210)',
        color: 'var(--text-color, #f4f4f5)',
      }}
    >
      {/* Resignation Confirmation Modal */}
      {confirmingResign && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="resign-title"
            aria-describedby="resign-desc"
            className="w-full max-w-sm rounded-2xl border p-5 text-center shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-surface, #181a20)',
              borderColor: 'var(--border-color, #27272a)',
              color: 'var(--text-color, #f4f4f5)',
            }}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Flag className="h-6 w-6" />
            </div>
            <h3 id="resign-title" className="text-lg font-bold" style={{ color: 'var(--text-color, #f4f4f5)' }}>
              Confirm Resignation
            </h3>
            <p id="resign-desc" className="mt-1.5 text-xs" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
              Are you sure you want to resign? This will immediately forfeit the match and grant victory to {opponentName}.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmingResign(false)}
                className="rounded-xl border px-3.5 py-2.5 text-xs font-semibold hover:opacity-90"
                style={{
                  backgroundColor: 'var(--bg-card-subtle, #27272a)',
                  borderColor: 'var(--border-color, #3f3f46)',
                  color: 'var(--text-color, #f4f4f5)',
                }}
              >
                Keep Playing
              </button>
              <button
                type="button"
                id="btn-confirm-resign"
                disabled={isBusy}
                onClick={() => {
                  setConfirmingResign(false);
                  onAction('resign');
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50 transition shadow-md shadow-rose-950/40"
              >
                <Flag className="h-3.5 w-3.5" /> Yes, Resign
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-3 p-3 sm:p-5 lg:flex-row lg:items-start lg:justify-center lg:gap-6">
        {/* Main Chessboard Column */}
        <div className="mx-auto flex w-full max-w-[min(100%,calc(100dvh-13rem),540px)] flex-col gap-2.5 lg:mx-0 lg:max-w-[min(100%,calc(100dvh-7rem),540px)]">
          {/* Opponent Bar */}
          <PlayerBar
            name={opponentName}
            color={opponentColor}
            clock={displayClock ? displayClock[opponentColor] : null}
            active={isPlaying && game.currentTurn === opponentColor}
            isYou={false}
          />

          {/* Interactive Chessboard */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: 'var(--border-color, #27272a)' }}>
            <Chessboard
              fen={game.fen}
              flipped={game.yourColor === 'b'}
              theme={boardTheme}
              lastMove={lastMove}
              interactive={isYourTurn && !isBusy}
              onMoveAttempt={onMove}
            />
          </div>

          {/* User Bar */}
          <PlayerBar
            name={yourName}
            color={game.yourColor}
            clock={displayClock ? displayClock[game.yourColor] : null}
            active={isPlaying && game.currentTurn === game.yourColor}
            isYou
          />

          {/* Dedicated In-Board Quick Action Bar (Accessible on all screens directly below board) */}
          {isPlaying && (
            <div
              className="rounded-xl border p-2.5 shadow-md flex items-center justify-between gap-2"
              style={{
                backgroundColor: 'var(--bg-surface, #141916)',
                borderColor: 'var(--border-color, #27272a)',
              }}
            >
              {/* Draw State Handling */}
              {drawOfferedByOpponent ? (
                <div className="flex flex-1 items-center justify-between gap-2 bg-amber-500/10 border border-amber-500/40 rounded-lg px-3 py-1.5">
                  <span className="text-xs font-bold text-amber-300 truncate">
                    {opponentName} offered a draw!
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      id="btn-accept-draw"
                      disabled={isBusy}
                      onClick={() => onAction('draw-accept')}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
                    >
                      <Handshake className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      type="button"
                      id="btn-decline-draw"
                      disabled={isBusy}
                      onClick={() => onAction('draw-reject')}
                      className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--bg-card-subtle, #1f2420)',
                        borderColor: 'var(--border-color, #3f3f46)',
                        color: 'var(--text-color, #f4f4f5)',
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ) : drawOfferedByYou ? (
                <div className="flex flex-1 items-center justify-between gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-amber-300 truncate">
                    Draw offer sent to {opponentName}…
                  </span>
                  <button
                    type="button"
                    id="btn-cancel-draw-offer"
                    disabled={isBusy}
                    onClick={() => onAction('draw-decline')}
                    className="rounded-lg border border-amber-500/40 px-2.5 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
                  >
                    Cancel Offer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-offer-draw"
                  disabled={isBusy}
                  onClick={() => onAction('draw-offer')}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 transition cursor-pointer"
                >
                  <Handshake className="h-4 w-4" /> Offer Draw
                </button>
              )}

              {/* Resign Action Button */}
              <button
                type="button"
                id="btn-trigger-resign"
                disabled={isBusy}
                onClick={() => setConfirmingResign(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                <Flag className="h-4 w-4" /> Resign
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Column (Match Info, Move List & Notices) */}
        <aside className="mx-auto flex w-full max-w-[640px] flex-col gap-3 lg:mx-0 lg:w-80 lg:max-w-none lg:shrink-0">
          {/* Match Info Card */}
          <div
            className="rounded-xl border p-4 shadow-sm"
            style={{
              backgroundColor: 'var(--bg-surface, #141916)',
              borderColor: 'var(--border-color, #27272a)',
              color: 'var(--text-color, #f4f4f5)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-400">
                Online Peer Match
              </span>
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: 'var(--bg-card-subtle, #1f2420)',
                  borderColor: 'var(--border-color, #3f3f46)',
                  color: 'var(--text-color, #f4f4f5)',
                }}
              >
                {timeControl.minutes === null ? 'No time control' : timeControl.label}
              </span>
            </div>
            <p
              role="status"
              aria-live="polite"
              className={`mt-2 text-base font-black ${
                drawOfferedByOpponent ? 'text-amber-400' : isYourTurn ? 'text-emerald-400' : ''
              }`}
              style={{ color: drawOfferedByOpponent || isYourTurn ? undefined : 'var(--text-color, #f4f4f5)' }}
            >
              {statusText}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
              You are playing <strong className="font-semibold text-zinc-200">{game.yourColor === 'w' ? 'White' : 'Black'}</strong>
            </p>
          </div>

          {/* Move History Card */}
          <div
            className="rounded-xl border p-4 shadow-sm flex flex-col"
            style={{
              backgroundColor: 'var(--bg-surface, #141916)',
              borderColor: 'var(--border-color, #27272a)',
              color: 'var(--text-color, #f4f4f5)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color, #27272a)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                Move History
              </h3>
              <span className="font-mono text-xs font-semibold text-zinc-400">
                {game.moves.length} moves
              </span>
            </div>

            {movePairs.length === 0 ? (
              <p className="mt-3 text-xs text-zinc-400 italic" style={{ color: 'var(--text-color-subtle, #64748b)' }}>
                No moves played yet. White makes the opening move.
              </p>
            ) : (
              <ol
                ref={moveListRef}
                className="mt-3 max-h-48 space-y-1 overflow-y-auto pr-1 font-mono text-xs sm:text-sm lg:max-h-72"
              >
                {movePairs.map((pair) => (
                  <li
                    key={pair.number}
                    className="grid grid-cols-[2.5rem_1fr_1fr] items-center rounded-lg px-2 py-1 transition hover:bg-black/10"
                  >
                    <span className="text-zinc-500 font-semibold" style={{ color: 'var(--text-color-subtle, #64748b)' }}>
                      {pair.number}.
                    </span>
                    <span className="font-bold" style={{ color: 'var(--text-color, #f4f4f5)' }}>
                      {pair.white}
                    </span>
                    <span className="font-bold" style={{ color: 'var(--text-color, #f4f4f5)' }}>
                      {pair.black ?? ''}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Feedback Notices */}
          {notice && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300"
            >
              <Swords className="h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
