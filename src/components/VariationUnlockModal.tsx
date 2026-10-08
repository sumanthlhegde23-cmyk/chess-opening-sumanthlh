import React, { useMemo, useState } from 'react';
import { Check, Lock, Search, Sparkles, X } from 'lucide-react';
import { openings } from '../data/openings';

interface VariationUnlockModalProps {
  isOpen: boolean;
  points: number;
  unlockedVariationIds: string[];
  onClose: () => void;
  onUnlock: (variationId: string) => boolean;
}

export const VariationUnlockModal: React.FC<VariationUnlockModalProps> = ({
  isOpen,
  points,
  unlockedVariationIds,
  onClose,
  onUnlock,
}) => {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const unlocked = useMemo(() => new Set(unlockedVariationIds), [unlockedVariationIds]);
  const variations = useMemo(() => openings.flatMap((opening) =>
    opening.variations.map((variation) => ({ ...variation, openingId: opening.id, openingName: opening.name }))
  ), []);
  const filtered = variations.filter((variation) =>
    `${variation.openingName} ${variation.name} ${variation.eco}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  if (!isOpen) return null;
  const credits = Math.floor(points / 100);

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md">
      <section role="dialog" aria-modal="true" aria-labelledby="variation-unlock-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-amber-500/30 bg-[#15191a] shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-zinc-800 p-5 sm:p-6">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-400"><Sparkles className="h-4 w-4" /> Streak rewards</p>
            <h2 id="variation-unlock-title" className="mt-1 text-xl font-bold text-white sm:text-2xl">Choose a variation to unlock</h2>
            <p className="mt-1 text-sm text-zinc-400">Spend 100 points per variation. Pick any opening line to add permanently to your repertoire.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close variation unlocks" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-black/20 px-5 py-3 sm:px-6">
          <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-200">⭐ {points} points</span>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-200">🔓 {credits} available {credits === 1 ? 'credit' : 'credits'}</span>
          <label className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search openings or lines" className="w-full rounded-lg border border-zinc-700 bg-[#101312] py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-amber-500" />
          </label>
        </div>
        {message && <p role="status" className="border-b border-zinc-800 px-5 py-2 text-sm text-emerald-300 sm:px-6">{message}</p>}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map((variation) => {
              const isUnlocked = unlocked.has(variation.id);
              const canUnlock = credits > 0;
              return (
                <article key={variation.id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${isUnlocked ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-zinc-800 bg-black/20'}`}>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono font-bold text-amber-400">{variation.eco} <span className="ml-1 text-zinc-500">· {variation.openingName}</span></p>
                    <p className="mt-1 truncate text-sm font-semibold text-zinc-100" title={variation.name}>{variation.name}</p>
                  </div>
                  {isUnlocked ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-2 text-xs font-bold text-emerald-300"><Check className="h-4 w-4" /> Unlocked</span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canUnlock}
                      onClick={() => {
                        setMessage(null);
                        if (onUnlock(variation.id)) setMessage(`${variation.name} unlocked permanently.`);
                      }}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-400 px-2.5 py-2 text-xs font-bold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                      aria-label={`Unlock ${variation.name} for 100 points`}
                    >
                      <Lock className="h-3.5 w-3.5" /> 100 pts
                    </button>
                  )}
                </article>
              );
            })}
          </div>
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-zinc-500">No variations match that search.</p>}
        </div>
      </section>
    </div>
  );
};
