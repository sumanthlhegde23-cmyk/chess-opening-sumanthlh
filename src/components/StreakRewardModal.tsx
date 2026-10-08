import React from 'react';
import { Flame, Sparkles, Trophy, X } from 'lucide-react';

export interface DailyReward {
  streak: number;
  totalPoints: number;
  milestone: boolean;
}

interface StreakRewardModalProps {
  reward: DailyReward | null;
  unlockCredits: number;
  onClose: () => void;
  onUnlockVariations: () => void;
}

function flameTone(streak: number): { color: string; glow: string } {
  if (streak >= 101) return { color: 'text-rose-400', glow: 'drop-shadow-[0_0_28px_rgba(244,63,94,0.75)]' };
  if (streak >= 11) return { color: 'text-amber-300', glow: 'drop-shadow-[0_0_22px_rgba(245,158,11,0.65)]' };
  return { color: 'text-yellow-300', glow: 'drop-shadow-[0_0_18px_rgba(250,204,21,0.5)]' };
}

export const StreakRewardModal: React.FC<StreakRewardModalProps> = ({
  reward,
  unlockCredits,
  onClose,
  onUnlockVariations,
}) => {
  if (!reward) return null;
  const tone = flameTone(reward.streak);
  const legendary = reward.streak === 101;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-reward-title"
        className={`relative w-full max-w-sm overflow-hidden rounded-3xl border bg-[#15191a] p-6 text-center shadow-2xl ${
          legendary ? 'border-rose-500/60 shadow-rose-950/40' : 'border-amber-500/30 shadow-black/60'
        }`}
      >
        <div className={`pointer-events-none absolute inset-0 opacity-25 ${legendary ? 'bg-rose-950' : 'bg-amber-950'}`} />
        <button type="button" onClick={onClose} aria-label="Close daily reward" className="absolute right-3 top-3 z-10 rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="relative">
          <div className={`mx-auto flex h-28 w-28 items-center justify-center ${legendary ? 'streak-legendary-flame' : reward.milestone ? 'streak-milestone-arrive' : ''}`}>
            <Flame className={`h-24 w-24 ${tone.color} ${tone.glow}`} strokeWidth={1.8} />
            {legendary && <span className="absolute top-9 text-3xl text-rose-50 drop-shadow-lg" aria-label="chess king">♔</span>}
          </div>
          {legendary ? (
            <>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-black tracking-[0.15em] text-rose-300">
                <Trophy className="h-4 w-4" /> LEGENDARY STREAK!
              </p>
              <h2 id="daily-reward-title" className="mt-2 text-2xl font-black text-white">101 days of dedication.</h2>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Daily reward</p>
              <h2 id="daily-reward-title" className="mt-2 text-2xl font-black text-white">Day {reward.streak} Streak!</h2>
            </>
          )}
          {reward.milestone && !legendary && (
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-amber-300">Milestone reached · {reward.streak} days</p>
          )}
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="flex items-center justify-center gap-2 text-xl font-extrabold text-emerald-300">
              <Sparkles className="h-5 w-5" /> +4 Points
            </p>
            <p className="mt-2 text-sm text-zinc-400">Total Points <strong className="ml-1 text-zinc-100">{reward.totalPoints}</strong></p>
          </div>
          {unlockCredits > 0 && (
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
              <p className="text-sm font-semibold text-amber-100">
                🔓 You have {unlockCredits} variation unlock {unlockCredits === 1 ? 'credit' : 'credits'} available!
              </p>
              <button type="button" onClick={onUnlockVariations} className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-zinc-950 transition hover:bg-amber-300">
                Unlock Variations
              </button>
            </div>
          )}
          <button type="button" onClick={onClose} className="mt-4 w-full rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800">
            Keep it going
          </button>
        </div>
      </section>
    </div>
  );
};
