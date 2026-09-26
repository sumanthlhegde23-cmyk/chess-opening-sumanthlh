import React from 'react';
import { Crown, Sparkles, Lock, X, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { Variation } from '../types/chess';

interface LockedVariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  variation: Variation | null;
  openingName: string;
  onProceedToPay599?: () => void;
  onProceedToPay999?: () => void;
}

export const LockedVariationModal: React.FC<LockedVariationModalProps> = ({
  isOpen,
  onClose,
  variation,
  openingName,
  onProceedToPay599,
  onProceedToPay999,
}) => {
  if (!isOpen || !variation) return null;

  const handleProceed = onProceedToPay999 || onProceedToPay599 || onClose;

  return (
    <div
      id="locked-variation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="locked-variation-modal-container"
        className="relative w-full max-w-md bg-[#14161f] border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-950/40 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-yellow-500" />

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#171922]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Variation Locked</h3>
              <span className="text-[10px] text-amber-400 font-semibold">Requires ₹999/- Lifetime Pass</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {variation.eco}
              </span>
              <span className="text-[11px] text-zinc-400">{openingName}</span>
            </div>
            <div className="text-base font-bold text-zinc-100">{variation.name}</div>
            <p className="text-xs text-zinc-400 line-clamp-2">{variation.overview}</p>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-r from-[#201d15] to-[#171a24] border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>₹999/- Lifetime Unlock</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Any <strong>5 variations of all openings</strong> unlock when a user acquires the Lifetime membership for <strong>₹999/-</strong>.
            </p>
            <ul className="space-y-1 text-xs text-zinc-300">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unlocks all 5 locked variations across all 20 openings</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unlocks all 240 master variations in total</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Annual renewal: ₹199/- every year</span>
              </li>
            </ul>
            <div className="mt-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-200">
              Please renew membership every year for ₹199/- to maintain active updates & engine support.
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              id="btn-unlock-variation-999"
              type="button"
              onClick={handleProceed}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center gap-2 shadow transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Unlock All Variations for ₹999/-</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="px-5 py-2.5 border-t border-zinc-800 bg-[#12131a] flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>UPI to Sumanth Hegde</span>
          </div>
          <span>Safe & Secure</span>
        </div>
      </div>
    </div>
  );
};
