import React from 'react';
import { Flag, Handshake, Home, RotateCcw, Search, Sparkles, Trophy } from 'lucide-react';
import { OnlineChessGame, getOnlineGameOutcome } from '../types/onlineGame';

interface OnlinePostGameDialogProps {
  game: OnlineChessGame;
  onReview: () => void;
  onMainMenu: () => void;
  onPlayAgain: () => void;
}

export const OnlinePostGameDialog: React.FC<OnlinePostGameDialogProps> = ({
  game,
  onReview,
  onMainMenu,
  onPlayAgain,
}) => {
  const outcome = getOnlineGameOutcome(game) ?? 'draw';

  const outcomeHeader = {
    win: {
      title: 'Victory!',
      subtitle: game.termination ? `${game.termination} — You won!` : 'You won the match!',
      icon: <Trophy className="h-10 w-10 text-emerald-400" />,
      badge: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
      border: 'border-emerald-500/50',
    },
    loss: {
      title: 'Defeat',
      subtitle: game.termination ? `${game.termination} — Opponent won.` : 'Opponent won the match.',
      icon: <Flag className="h-10 w-10 text-rose-400" />,
      badge: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
      border: 'border-rose-500/50',
    },
    draw: {
      title: 'Game Drawn',
      subtitle: game.termination ? `${game.termination}` : 'The game concluded in a draw.',
      icon: <Handshake className="h-10 w-10 text-amber-400" />,
      badge: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
      border: 'border-amber-500/50',
    },
  }[outcome];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="online-post-game-title"
        className={`w-full max-w-md animate-fadeIn rounded-2xl border p-6 text-center shadow-2xl ${outcomeHeader.border}`}
        style={{
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderColor: 'var(--border-color, #cbd5e1)',
          color: 'var(--text-color, #0f172a)',
        }}
      >
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border bg-black/20 p-2 shadow-inner" style={{ borderColor: 'var(--border-color, #cbd5e1)' }}>
          {outcomeHeader.icon}
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2" style={{ backgroundColor: 'var(--bg-card-subtle, #f8fafc)', borderColor: 'var(--border-color, #cbd5e1)' }}>
          <Sparkles className="h-3.5 w-3.5" />
          <span>Match Concluded ({game.result ?? 'Final'})</span>
        </div>

        <h2 id="online-post-game-title" className="text-2xl font-black sm:text-3xl" style={{ color: 'var(--text-color, #0f172a)' }}>
          {outcomeHeader.title}
        </h2>
        <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-color-muted, #475569)' }}>
          {outcomeHeader.subtitle}
        </p>

        <div className="my-5 rounded-xl border p-3 text-xs" style={{ backgroundColor: 'var(--bg-card-subtle, #f8fafc)', borderColor: 'var(--border-color, #cbd5e1)' }}>
          <div className="flex items-center justify-between font-semibold">
            <span style={{ color: 'var(--text-color-muted, #475569)' }}>White: {game.hostName}</span>
            <span className="font-mono font-bold" style={{ color: 'var(--text-color, #0f172a)' }}>{game.result}</span>
            <span style={{ color: 'var(--text-color-muted, #475569)' }}>Black: {game.guestName ?? 'Opponent'}</span>
          </div>
          <div className="mt-1 text-center font-mono text-[11px]" style={{ color: 'var(--text-color-subtle, #64748b)' }}>
            Total Moves: {game.moves.length} ({Math.ceil(game.moves.length / 2)} turns)
          </div>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-left" style={{ color: 'var(--text-color-muted, #475569)' }}>
          What would you like to do next?
        </p>

        <div className="flex flex-col gap-2.5">
          {/* Choice 1: Review the Game */}
          <button
            id="btn-post-game-review"
            type="button"
            onClick={onReview}
            className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3.5 text-left font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-teal-500 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/20">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold">Review the Game</div>
                <div className="text-[11px] font-normal text-emerald-100">Analyze every move and engine evaluations</div>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Analyze →</span>
          </button>

          {/* Choice 2: Go to Main Menu */}
          <button
            id="btn-post-game-main-menu"
            type="button"
            onClick={onMainMenu}
            className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-bold transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-surface, #ffffff)',
              borderColor: 'var(--border-color, #cbd5e1)',
              color: 'var(--text-color, #0f172a)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-500/10">
                <Home className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <div className="text-sm font-bold">Go to Main Menu</div>
                <div className="text-[11px] font-normal" style={{ color: 'var(--text-color-muted, #475569)' }}>Return to opening explorer &amp; dashboard</div>
              </div>
            </div>
            <span className="text-xs opacity-60">Home</span>
          </button>

          {/* Choice 3: Play Again */}
          <button
            id="btn-post-game-play-again"
            type="button"
            onClick={onPlayAgain}
            className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-bold transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card-subtle, #f8fafc)',
              borderColor: 'var(--border-color, #cbd5e1)',
              color: 'var(--text-color, #0f172a)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
                <RotateCcw className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-bold">Play Again</div>
                <div className="text-[11px] font-normal" style={{ color: 'var(--text-color-muted, #475569)' }}>Start a rematch with the same or new peer code</div>
              </div>
            </div>
            <span className="text-xs opacity-60">Rematch</span>
          </button>
        </div>
      </section>
    </div>
  );
};
