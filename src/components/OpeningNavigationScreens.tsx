import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Crown, Lock, Search, Sparkles } from 'lucide-react';
import { Opening, Variation } from '../types/chess';
import { PaidPlanTier, getOpeningClassification, isOpeningLocked, isVariationLocked } from '../utils/pricingLocks';
import { VariationSelector } from './VariationSelector';

interface AllOpeningsScreenProps {
  openings: Opening[];
  userPlan: PaidPlanTier;
  isOwner: boolean;
  onBack: () => void;
  onSelectOpening: (openingId: string) => void;
}

export const AllOpeningsScreen: React.FC<AllOpeningsScreenProps> = ({
  openings,
  userPlan,
  isOwner,
  totalPoints,
  onBack,
  onSelectOpening,
}) => {
  const [query, setQuery] = useState('');
  const [side, setSide] = useState<'all' | 'white' | 'black'>('all');
  const filteredOpenings = useMemo(() => openings.filter((opening) => {
    if (side !== 'all' && opening.side !== side) return false;
    return `${opening.name} ${opening.ecoCode} ${opening.category}`.toLowerCase().includes(query.trim().toLowerCase());
  }), [openings, query, side]);

  return (
    <section aria-labelledby="all-openings-title" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-2.5 text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-200" aria-label="Back to main screen">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Opening library</p>
            <h1 id="all-openings-title" className="text-2xl font-black text-white sm:text-3xl">All Openings</h1>
          </div>
        </div>
        <span className="rounded-full border border-zinc-700 bg-black/20 px-3 py-1.5 text-xs font-semibold text-zinc-300">{filteredOpenings.length} of {openings.length} openings</span>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-[#15171e] p-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input id="all-openings-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search openings or ECO codes" className="w-full rounded-xl border border-zinc-700 bg-[#101312] py-2.5 pl-9 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-amber-500" />
        </label>
        <div className="flex rounded-xl border border-zinc-800 bg-black/20 p-1">
          {(['all', 'white', 'black'] as const).map((filter) => (
            <button key={filter} type="button" onClick={() => setSide(filter)} aria-pressed={side === filter} className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${side === filter ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'}`}>
              {filter === 'all' ? 'All' : filter === 'white' ? 'White' : 'Black'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOpenings.map((opening) => {
          const openingLocked = isOpeningLocked(opening.id, userPlan, isOwner);
          const restrictedVariations = opening.variations.filter((variation, index) =>
            isVariationLocked(index, userPlan, isOwner, opening.id)
          ).length;
          const classification = getOpeningClassification(opening.id);
          return (
            <button key={opening.id} type="button" onClick={() => onSelectOpening(opening.id)} className="group flex min-h-36 flex-col justify-between rounded-2xl border border-zinc-800 bg-gradient-to-br from-[#1b2022] to-[#14171d] p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-xl hover:shadow-black/25">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wider ${opening.accessType === 'PREMIUM' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                      {opening.accessType === 'PREMIUM' ? '⭐ PREMIUM' : 'FREE'}
                    </span>
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[9px] font-semibold text-zinc-400">{opening.side === 'white' ? 'White' : 'Black'}</span>
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[9px] font-semibold text-zinc-400">{classification}</span>
                  </div>
                  <h2 className="mt-2 text-base font-bold text-white group-hover:text-amber-200">{opening.name}</h2>
                  <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{opening.category}</p>
                </div>
                <span className={`shrink-0 rounded-lg border px-2 py-1 font-mono text-[10px] font-bold ${opening.side === 'white' ? 'border-zinc-600 bg-zinc-100 text-zinc-900' : 'border-zinc-700 bg-zinc-900 text-amber-300'}`}>{opening.ecoCode}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-zinc-400"><BookOpen className="h-3.5 w-3.5 text-amber-400" />{opening.variations.length} variations</span>
                {openingLocked ? (
                  <span className="flex items-center gap-1 font-bold text-amber-300"><Lock className="h-3 w-3" /> Opening reserved</span>
                ) : restrictedVariations ? (
                  <span className="flex items-center gap-1 font-semibold text-amber-300"><Crown className="h-3 w-3" /> {restrictedVariations} lines restricted</span>
                ) : (
                  <span className="flex items-center gap-1 font-semibold text-emerald-300"><Sparkles className="h-3 w-3" /> Explore lines</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {filteredOpenings.length === 0 && <p className="py-12 text-center text-sm text-zinc-500">No openings match your search.</p>}
    </section>
  );
};

interface OpeningVariationsScreenProps {
  opening: Opening;
  selectedVariationId: string;
  userPlan: PaidPlanTier;
  isOwner: boolean;
  totalPoints: number;
  unlockedVariationIds: string[];
  onBack: () => void;
  onOpenVariation: (variationId: string) => void;
  onLockedVariationClick: (variation: Variation, index: number) => void;
}

export const OpeningVariationsScreen: React.FC<OpeningVariationsScreenProps> = ({
  opening,
  selectedVariationId,
  userPlan,
  isOwner,
  totalPoints,
  unlockedVariationIds,
  onBack,
  onOpenVariation,
  onLockedVariationClick,
}) => (
  <section aria-labelledby="opening-variations-title" className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-2.5 text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-200" aria-label="Back to all openings">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">{opening.side === 'white' ? 'White opening' : 'Black defense'} · {opening.ecoCode}</p>
          <h1 id="opening-variations-title" className="text-2xl font-black text-white sm:text-3xl">{opening.name}</h1>
          <p className="mt-1 text-xs text-zinc-400">Choose one of {opening.variations.length} variations to study.</p>
        </div>
      </div>
      <span className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-wider ${opening.accessType === 'PREMIUM' ? 'border border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-200'}`}>
        {opening.accessType === 'PREMIUM' ? '⭐ PREMIUM OPENING' : 'FREE OPENING'}
      </span>
    </div>
    {opening.accessType === 'PREMIUM' && !isOwner && userPlan === 'none' && (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-100">
        The complete opening is premium-locked. Individually point-unlocked variations remain available without unlocking the opening or its other lines.
      </div>
    )}
    <div className="rounded-2xl border border-zinc-800 bg-[#15171e] p-3 sm:p-4">
      <VariationSelector
        variations={opening.variations}
        openingId={opening.id}
        openingLocked={false}
        selectedVariationId={selectedVariationId}
        onSelectVariation={onOpenVariation}
        userPlan={userPlan}
        isOwner={isOwner}
        unlockedVariationIds={unlockedVariationIds}
        totalPoints={totalPoints}
        onLockedVariationClick={onLockedVariationClick}
      />
    </div>
  </section>
);
