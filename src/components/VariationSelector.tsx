import React from 'react';
import { Variation } from '../types/chess';
import { Layers, Lock, Sparkles, Crown } from 'lucide-react';
import { PaidPlanTier, isVariationLocked } from '../utils/pricingLocks';

interface VariationSelectorProps {
  variations: Variation[];
  selectedVariationId: string;
  onSelectVariation: (variationId: string) => void;
  userPlan: PaidPlanTier;
  isOwner?: boolean;
  onLockedVariationClick: (variation: Variation, index: number) => void;
}

export const VariationSelector: React.FC<VariationSelectorProps> = ({
  variations,
  selectedVariationId,
  onSelectVariation,
  userPlan,
  isOwner = false,
  onLockedVariationClick,
}) => {
  return (
    <div id="variation-selector" className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>12 Variations</span>
          {!isOwner && userPlan !== '999' && userPlan !== '599' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> 5 Locked (Requires ₹999/-)
            </span>
          )}
        </div>
        <span className="text-[11px] text-zinc-500">
          Select any variation to explore move-by-move
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {variations.map((v, idx) => {
          const isSelected = v.id === selectedVariationId;
          const locked = isVariationLocked(idx, userPlan, isOwner);

          return (
            <button
              key={v.id}
              id={`variation-btn-${v.id}`}
              onClick={() => {
                if (locked) {
                  onLockedVariationClick(v, idx);
                } else {
                  onSelectVariation(v.id);
                }
              }}
              className={`text-left p-2.5 rounded-lg border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-900/10 ring-1 ring-amber-500/40'
                  : locked
                  ? 'bg-[#15171d]/90 border-zinc-800/90 hover:border-amber-500/50 hover:bg-[#1c1e27]'
                  : 'bg-[#1a1d24] border-zinc-800/80 hover:bg-[#222631] hover:border-zinc-700/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-zinc-800 text-amber-400 rounded">
                    {v.eco}
                  </span>
                  <div className="flex items-center gap-1">
                    {locked ? (
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        <span>₹999</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500">#{idx + 1}</span>
                    )}
                  </div>
                </div>

                <div
                  className={`text-xs font-semibold leading-tight line-clamp-2 ${
                    isSelected ? 'text-amber-300' : locked ? 'text-zinc-400' : 'text-zinc-200'
                  }`}
                  title={v.name}
                >
                  {v.name}
                </div>
              </div>

              <div className="mt-2 pt-1 border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-400">
                <span>{v.moves.length} ply</span>
                {locked ? (
                  <span className="text-amber-400/90 text-[10px] font-medium flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                ) : (
                  <span className="font-mono text-zinc-400 truncate max-w-[60px]">
                    {v.moves[v.moves.length - 1]}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

