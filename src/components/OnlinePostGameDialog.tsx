import React from 'react';
import { Home, RotateCcw, Search } from 'lucide-react';
import { OnlineChessGame, getOnlineGameOutcome } from '../types/onlineGame';

interface OnlinePostGameDialogProps {
  game: OnlineChessGame;
  onReview: () => void;
  onMainMenu: () => void;
  onPlayAgain: () => void;
}

const OUTCOME_COPY = {
  win: { title: 'You won!', tone: 'border-emerald-400/50 text-emerald-200' },
  loss: { title: 'You lost', tone: 'border-rose-400/50 text-rose-200' },
  draw: { title: 'Draw', tone: 'border-amber-300/50 text-amber-100' },
} as const;

export const OnlinePostGameDialog: React.FC<OnlinePostGameDialogProps> = ({ game, onReview, onMainMenu, onPlayAgain }) => {
  const outcome = getOnlineGameOutcome(game) ?? 'draw';
  const copy = OUTCOME_COPY[outcome];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="online-post-game-title" className={`w-full max-w-sm animate-fadeIn rounded-2xl border bg-[#141916] p-5 shadow-2xl ${copy.tone}`}>
        <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Game over</p>
        <h2 id="online-post-game-title" className="mt-1 text-center text-2xl font-extrabold">{copy.title}</h2>
        <p className="mt-1 text-center text-sm text-zinc-400">{game.termination ?? 'Game finished'} · {game.result}</p>
        <p className="mt-5 text-center text-sm font-semibold text-zinc-200">What would you like to do next?</p>
        <div className="mt-3 flex flex-col gap-2">
          <button type="button" onClick={onReview} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400">
            <Search className="h-4 w-4" /> Review the Game
          </button>
          <button type="button" onClick={onPlayAgain} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100 hover:bg-emerald-500/20">
            <RotateCcw className="h-4 w-4" /> Play Again
          </button>
          <button type="button" onClick={onMainMenu} className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800">
            <Home className="h-4 w-4" /> Go to Main Menu
          </button>
        </div>
      </section>
    </div>
  );
};
