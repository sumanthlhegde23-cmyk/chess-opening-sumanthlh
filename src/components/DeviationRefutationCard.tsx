import React from 'react';
import {
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Swords
} from 'lucide-react';
import { DeviationAnalysis } from '../utils/deviationAnalyzer';

interface DeviationRefutationCardProps {
  analysis: DeviationAnalysis;
  currentStep: number;
  totalSteps: number;
  stepMoveSan?: string;
  stepTurn?: 'White' | 'Black';
  isAutoPlaying: boolean;
  onStep: (direction: 1 | -1) => void;
  onToggleAutoPlay: () => void;
  onResetToBook: () => void;
  variationName: string;
}

export const DeviationRefutationCard: React.FC<DeviationRefutationCardProps> = ({
  analysis,
  currentStep,
  totalSteps,
  stepMoveSan,
  stepTurn,
  isAutoPlaying,
  onStep,
  onToggleAutoPlay,
  onResetToBook,
  variationName,
}) => {
  const isBlunder = analysis.severity === 'blunder';
  const isMistake = analysis.severity === 'mistake';

  return (
    <div
      id="deviation-refutation-card"
      className="w-full max-w-[540px] rounded-xl border border-rose-500/50 bg-gradient-to-br from-[#271317] via-[#1d1014] to-[#160c0f] p-4 shadow-2xl space-y-3.5 transition-all"
    >
      {/* Header: Badge + Comparison */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-rose-500/25">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
              isBlunder
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 ring-1 ring-rose-500/30'
                : isMistake
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                : 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{analysis.severity}</span>
          </span>
          <span className="text-xs text-rose-200/90 font-medium">Off-Book Move Accepted</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-zinc-900/90 text-amber-400 font-mono text-xs font-bold border border-zinc-700">
            Eval {analysis.evalScore}
          </span>
          <button
            onClick={onResetToBook}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors border border-zinc-700 font-medium"
            title="Return to the opening book line"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Return to {variationName}</span>
          </button>
        </div>
      </div>

      {/* Move Comparison Row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-between">
          <span className="text-zinc-400">You Played:</span>
          <span className="font-mono font-bold text-rose-300 text-sm">
            {analysis.attemptedSan}
            <span className="text-xs text-rose-400 ml-0.5 font-sans">
              {isBlunder ? '??' : isMistake ? '?' : '?!'}
            </span>
          </span>
        </div>
        <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
          <span className="text-zinc-400">Book Move:</span>
          <span className="font-mono font-bold text-emerald-300 text-sm">
            {analysis.expectedSan}
            <span className="text-xs text-emerald-400 ml-0.5 font-sans">★</span>
          </span>
        </div>
      </div>

      {/* Section 1: Why That Was a Bad Move */}
      <div className="space-y-1.5 p-3 rounded-lg bg-black/40 border border-rose-500/20">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Why That Was a Bad Move</span>
        </div>
        <p className="text-xs text-rose-100/90 leading-relaxed font-sans">
          {analysis.whyBad}
        </p>
      </div>

      {/* Section 2: Further Lines If Played With That Sequence */}
      <div className="space-y-2 p-3 rounded-lg bg-black/40 border border-rose-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Further Lines If Played With That Sequence</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Punishing Line</span>
        </div>

        {/* Formatted Engine Continuation Line */}
        <div className="p-2 rounded bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-200 leading-relaxed break-words">
          <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold mr-1.5">Engine Line:</span>
          <span className="text-rose-300 font-semibold">{analysis.engineLine}</span>
        </div>

        {/* Step-by-Step Interactive Controls */}
        <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-mono">
              Step {currentStep} of {totalSteps}
            </span>
            {stepMoveSan && (
              <span className="font-mono font-bold text-rose-200 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                {stepTurn}: {stepMoveSan}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onStep(-1)}
              disabled={currentStep === 0}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 text-xs flex items-center gap-1 transition-colors"
              title="Previous move in refutation line"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => onStep(1)}
              disabled={currentStep >= totalSteps}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-sm"
              title="Next punishing move in refutation line"
            >
              <span>Next Move</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleAutoPlay}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                isAutoPlaying
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
              title={isAutoPlaying ? 'Pause demonstration' : 'Auto-play punishing line'}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Auto-Play</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
