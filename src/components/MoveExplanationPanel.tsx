import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Compass,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Award,
  Cpu,
  RotateCcw
} from 'lucide-react';
import { BadMoveRefutation, MoveExplanation, Variation } from '../types/chess';
import { chessAudio } from '../utils/sound';

interface MoveExplanationPanelProps {
  variation: Variation;
  currentMoveIndex: number; // -1 for start position, 0 to moves.length - 1
  onSelectMove: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  trainingMode: boolean;
  onToggleTrainingMode: () => void;
  activeRefutationBadMove?: string | null;
  onPreviewRefutation?: (refutation: BadMoveRefutation, fenBefore: string) => void;
  onStopRefutation?: () => void;
  userDeviationSan?: string | null;
  onResetDeviation?: () => void;
  customMoves?: string[];
  customMoveExplanations?: MoveExplanation[];
  gameHeaderInfo?: {
    title: string;
    white: string;
    black: string;
    event: string;
    year: number | string;
    result: string;
    synopsis?: string;
  };
}

export const MoveExplanationPanel: React.FC<MoveExplanationPanelProps> = ({
  variation,
  currentMoveIndex,
  onSelectMove,
  isPlaying,
  onTogglePlay,
  soundEnabled,
  onToggleSound,
  trainingMode,
  onToggleTrainingMode,
  activeRefutationBadMove,
  onPreviewRefutation,
  onStopRefutation,
  userDeviationSan,
  onResetDeviation,
  customMoves,
  customMoveExplanations,
  gameHeaderInfo,
}) => {
  const [analysisTab, setAnalysisTab] = useState<'all' | 'best' | 'mistakes'>('all');
  const effectiveMoves = customMoves || variation.moves;
  const effectiveExplanations = customMoveExplanations || variation.moveExplanations;
  const totalMoves = effectiveExplanations.length;
  const currentExplanation: MoveExplanation | undefined =
    currentMoveIndex >= 0 ? effectiveExplanations[currentMoveIndex] : undefined;

  const fenBefore =
    currentMoveIndex <= 0
      ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      : effectiveExplanations[currentMoveIndex - 1]?.fen ||
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  // Keyboard navigation shortcuts (Arrow keys, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentMoveIndex < totalMoves - 1) {
          onSelectMove(currentMoveIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentMoveIndex >= 0) {
          onSelectMove(currentMoveIndex - 1);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        onSelectMove(-1);
      } else if (e.key === 'End') {
        e.preventDefault();
        onSelectMove(totalMoves - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        onTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMoveIndex, totalMoves, onSelectMove, onTogglePlay]);

  // Render move pair rows for notation list
  const movePairs: { moveNumber: number; white?: { index: number; notation: string }; black?: { index: number; notation: string } }[] = [];
  for (let i = 0; i < effectiveMoves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    movePairs.push({
      moveNumber,
      white: { index: i, notation: effectiveMoves[i] },
      black: i + 1 < effectiveMoves.length ? { index: i + 1, notation: effectiveMoves[i + 1] } : undefined,
    });
  }

  // Quality badge renderer
  const renderQualityBadge = (quality?: string) => {
    switch (quality) {
      case 'best':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Best Move</span>
          </span>
        );
      case 'great':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Great Move</span>
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Critical Move</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Master Book Move</span>
          </span>
        );
    }
  };

  return (
    <div id="move-explanation-panel" className="flex flex-col h-full bg-[#181a20] rounded-xl border border-zinc-800/80 shadow-xl overflow-hidden">
      {/* Top Header: Variation info & mode controls */}
      <div className="p-4 border-b border-zinc-800 bg-[#1e222b] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
              {variation.eco}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {totalMoves} moves ({Math.ceil(totalMoves / 2)} full moves)
            </span>
          </div>
          <h2 className="text-base font-semibold text-zinc-100 truncate mt-0.5" title={variation.name}>
            {variation.name}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="toggle-training-mode-btn"
            onClick={onToggleTrainingMode}
            title={trainingMode ? 'Switch to Study Explanations' : 'Switch to Interactive Training Mode'}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              trainingMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-zinc-800/70 text-zinc-300 border-zinc-700/60 hover:bg-zinc-700'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{trainingMode ? 'Practice Mode' : 'Learn Mode'}</span>
          </button>

          <button
            id="toggle-sound-btn"
            onClick={() => {
              onToggleSound();
              chessAudio.playMove();
            }}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>
      </div>

      {/* Deviation status notification if board is displaying an alternative move */}
      {userDeviationSan && (
        <div className="mx-4 mt-3 p-2.5 rounded-lg bg-gradient-to-r from-rose-950/90 to-[#1f0f13] border border-rose-500/40 text-xs flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-rose-200">
              Off-book move <strong className="font-mono text-rose-300 font-bold">{userDeviationSan}</strong> analyzed with engine refutation.
            </span>
          </div>
          {onResetDeviation && (
            <button
              onClick={onResetDeviation}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-[11px] font-medium border border-zinc-700 transition-colors shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3 text-emerald-400" />
              <span>Back to Book</span>
            </button>
          )}
        </div>
      )}

      {/* Main explanation content area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {currentMoveIndex === -1 ? (
          /* Starting position overview */
          <div className="space-y-4 animate-fadeIn">
            {gameHeaderInfo ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#251f18] via-[#1c1a16] to-[#16181d] border border-amber-500/40 shadow-lg space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Grandmaster Masterclass</span>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-zinc-800/90 text-amber-300 border border-amber-500/30">
                    Result: {gameHeaderInfo.result}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-bold text-zinc-100 flex items-center gap-2 flex-wrap">
                    <span>{gameHeaderInfo.white}</span>
                    <span className="text-zinc-400 text-xs font-normal">vs</span>
                    <span>{gameHeaderInfo.black}</span>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    <span>{gameHeaderInfo.event}</span>
                    <span>•</span>
                    <span className="font-mono">{gameHeaderInfo.year}</span>
                    <span>•</span>
                    <span className="text-amber-300/80 font-mono">{totalMoves} Total Moves</span>
                  </div>
                </div>

                {gameHeaderInfo.synopsis && (
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans pt-1 border-t border-amber-500/20">
                    {gameHeaderInfo.synopsis}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Variation Strategic Overview</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {variation.overview}
                </p>
              </div>
            )}

            {!gameHeaderInfo && variation.keyPlans && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-[#222733] border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                    <span className="w-2 h-2 rounded-full bg-zinc-200 inline-block" />
                    <span>White Strategic Plan</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-normal">
                    {variation.keyPlans.white}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#1f242e] border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
                    <span>Black Strategic Plan</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-normal">
                    {variation.keyPlans.black}
                  </p>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 to-amber-950/20 border border-emerald-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Move-by-Move Master Explanations Active</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                {gameHeaderInfo
                  ? 'Every single move in this Grandmaster battle is explained move-by-move with strategic ideas, tactical notes, and positional plans:'
                  : 'Every single move in this variation is analyzed with:'}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <li className="flex items-start gap-1.5 text-emerald-200 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Why this move is best:</strong> Positional purpose, central control, and harmonic coordination.</span>
                </li>
                <li className="flex items-start gap-1.5 text-rose-200 bg-rose-950/40 p-2 rounded-lg border border-rose-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Mistakes & blunders:</strong> Tactical traps, passive alternatives, and common errors to avoid.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                Click <strong>Next (→)</strong> or click any move in the notation tree below to inspect move-by-move master explanations.
              </span>
            </div>
          </div>
        ) : currentExplanation ? (
          /* Active move explanation */
          <div className="space-y-3.5 animate-fadeIn">
            {/* Move summary header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 gap-2.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner shrink-0 ${
                    currentExplanation.side === 'white'
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  }`}
                >
                  {currentExplanation.side === 'white'
                    ? `${currentExplanation.moveNumber}.`
                    : `${currentExplanation.moveNumber}...`}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono text-zinc-100">
                      {currentExplanation.notation}
                    </span>
                    {renderQualityBadge(currentExplanation.moveQuality)}
                  </div>
                  <div className="text-xs text-zinc-400 capitalize">
                    {currentExplanation.side} to play • Move {currentMoveIndex + 1} of {totalMoves}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-center">
                <span className="px-2 py-1 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {currentMoveIndex + 1 < totalMoves
                    ? 'Next: ' + effectiveMoves[currentMoveIndex + 1]
                    : gameHeaderInfo
                    ? 'Game End'
                    : 'Variation End'}
                </span>
              </div>
            </div>

            {/* Analysis perspective tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/60 rounded-lg border border-zinc-800/80 text-xs">
              <button
                onClick={() => setAnalysisTab('all')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  analysisTab === 'all'
                    ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Analysis
              </button>
              <button
                onClick={() => setAnalysisTab('best')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  analysisTab === 'best'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Why Best / Good</span>
              </button>
              <button
                onClick={() => setAnalysisTab('mistakes')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  analysisTab === 'mistakes'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-rose-300'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Mistakes & Blunders</span>
              </button>
            </div>

            {/* SECTION 1: WHY THIS MOVE IS BEST / GOOD */}
            {(analysisTab === 'all' || analysisTab === 'best') && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#182a20] to-[#121c17] border border-emerald-500/30 shadow-md space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Why this move is best / good</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
                  {currentExplanation.whyGoodOrBest || currentExplanation.explanation}
                </p>
              </div>
            )}

            {/* SECTION 2: WHY OTHER MOVES ARE BAD / MISTAKES / BLUNDERS */}
            {(analysisTab === 'all' || analysisTab === 'mistakes') && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#2a171a] to-[#1d1214] border border-rose-500/30 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Why alternative moves are bad, a mistake, or a blunder</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed font-sans">
                  {currentExplanation.mistakesAndBlunders ||
                    'Playing carelessly or deviating with passive moves relinquishes central control and allows the opposing player to seize an aggressive developmental initiative.'}
                </p>

                {/* Engine Lines for Bad Moves */}
                {currentExplanation.badMoveRefutations && currentExplanation.badMoveRefutations.length > 0 && (
                  <div className="pt-2 border-t border-rose-500/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                        <Cpu className="w-3.5 h-3.5 text-rose-400" />
                        <span>Engine Refutation Lines for Bad Moves</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">Stockfish Depth 18+</span>
                    </div>

                    <div className="space-y-2">
                      {currentExplanation.badMoveRefutations.map((ref, idx) => {
                        const isBlunder = ref.severity === 'blunder';
                        const isMistake = ref.severity === 'mistake';
                        const isActive = activeRefutationBadMove === ref.badMove;

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border transition-all ${
                              isActive
                                ? 'bg-rose-950/80 border-rose-400 ring-1 ring-rose-400'
                                : 'bg-[#1e1417] border-rose-500/25 hover:border-rose-500/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    isBlunder
                                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                                      : isMistake
                                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                      : 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/40'
                                  }`}
                                >
                                  {ref.severity}
                                </span>
                                <span className="text-xs font-bold font-mono text-zinc-100">
                                  {ref.badMove}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-900/90 text-amber-400 border border-zinc-700">
                                  Eval {ref.evalScore}
                                </span>
                              </div>
                            </div>

                            {/* Engine Continuation Line */}
                            <div className="p-2 rounded bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-rose-200/95 tracking-wide flex items-center justify-between gap-2 flex-wrap my-1.5">
                              <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                                <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold shrink-0">Line:</span>
                                <span className="select-all font-semibold text-zinc-200">{ref.engineLine}</span>
                              </div>
                              {onPreviewRefutation && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isActive) {
                                      onStopRefutation?.();
                                    } else {
                                      onPreviewRefutation(ref, fenBefore);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded text-xs font-sans font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                                    isActive
                                      ? 'bg-rose-500 text-white shadow-sm'
                                      : 'bg-zinc-800 hover:bg-rose-900/60 text-zinc-200 hover:text-white border border-zinc-700'
                                  }`}
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>{isActive ? 'Exit Demo' : 'Play on Board'}</span>
                                </button>
                              )}
                            </div>

                            {/* Why Punished explanation */}
                            <p className="text-xs text-rose-100/80 leading-relaxed font-sans mt-1.5">
                              <span className="font-semibold text-rose-300">Why punished: </span>
                              {ref.whyPunished}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: TACTICAL TARGET & FOLLOW-UP PLAN */}
            {currentExplanation.tacticalNote && (
              <div className="p-3 rounded-xl bg-[#1e2330] border border-sky-500/25 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <Target className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Tactical Target & Follow-up</span>
                </div>
                <p className="text-xs text-zinc-300 leading-normal font-sans">
                  {currentExplanation.tacticalNote}
                </p>
              </div>
            )}

            {/* Progress indicator */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                <span>Variation Progress</span>
                <span>{Math.round(((currentMoveIndex + 1) / totalMoves) * 100)}% ({currentMoveIndex + 1}/{totalMoves})</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-200"
                  style={{ width: `${((currentMoveIndex + 1) / totalMoves) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Interactive Move List / Score Sheet */}
      <div className="px-4 py-2 border-t border-zinc-800/80 bg-[#16181d] max-h-36 overflow-y-auto">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center justify-between">
          <span>Move Notation Tree</span>
          <span className="text-[10px] text-zinc-500">Click any move to jump & inspect</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 font-mono text-xs">
          {movePairs.map((pair) => {
            const isWhiteActive = pair.white && pair.white.index === currentMoveIndex;
            const isBlackActive = pair.black && pair.black.index === currentMoveIndex;

            return (
              <div key={pair.moveNumber} className="flex items-center bg-zinc-900/60 rounded px-1.5 py-0.5 border border-zinc-800/60">
                <span className="text-zinc-500 w-5 shrink-0 text-[11px]">{pair.moveNumber}.</span>
                {pair.white && (
                  <button
                    onClick={() => onSelectMove(pair.white!.index)}
                    className={`px-1 py-0.5 rounded text-left transition-colors flex-1 ${
                      isWhiteActive
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {pair.white.notation}
                  </button>
                )}
                {pair.black && (
                  <button
                    onClick={() => onSelectMove(pair.black!.index)}
                    className={`px-1 py-0.5 rounded text-left transition-colors flex-1 ${
                      isBlackActive
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {pair.black.notation}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Playback & Navigation Controls Bar */}
      <div className="p-3 border-t border-zinc-800 bg-[#1c2029] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            id="nav-first-btn"
            onClick={() => onSelectMove(-1)}
            disabled={currentMoveIndex === -1}
            title="Start Position (Home)"
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            id="nav-prev-btn"
            onClick={() => onSelectMove(Math.max(-1, currentMoveIndex - 1))}
            disabled={currentMoveIndex === -1}
            title="Previous Move (Left Arrow)"
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <button
          id="nav-autoplay-btn"
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
            isPlaying
              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-900/30'
              : 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-md shadow-amber-900/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Auto-Play</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            id="nav-next-btn"
            onClick={() => onSelectMove(Math.min(totalMoves - 1, currentMoveIndex + 1))}
            disabled={currentMoveIndex === totalMoves - 1}
            title="Next Move (Right Arrow)"
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            id="nav-last-btn"
            onClick={() => onSelectMove(totalMoves - 1)}
            disabled={currentMoveIndex === totalMoves - 1}
            title="Final Move (End)"
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-zinc-300 transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

