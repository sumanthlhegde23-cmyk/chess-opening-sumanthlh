import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import {
  Puzzle,
  CheckCircle2,
  HelpCircle,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Flame,
  Award,
  Sparkles,
  Filter,
  Layers,
  BookOpen,
  ArrowRight,
  Cpu,
  Bot,
  Compass,
  Undo2,
  TrendingUp,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { openings, getOpeningById, getVariationById } from '../data/openings';
import {
  OpeningPuzzle,
  PUZZLE_VARIETIES,
  getPuzzleForVariation,
  getSolvedPuzzleIds,
  saveSolvedPuzzle,
} from '../utils/puzzleEngine';
import { chessAudio } from '../utils/sound';
import {
  analyzePositionStockfish18,
  EngineAnalysisResult,
  MoveExplanationItem,
} from '../utils/stockfishService';

export interface PlayedMoveItem {
  san: string;
  from?: Square;
  to?: Square;
  fen: string;
  ply: number;
  moveNum: number;
  color: 'White' | 'Black';
  isSolutionMove: boolean;
  expectedMove?: string;
  tacticalConcept?: string;
  explanation?: string;
}

interface OpeningPuzzlesSectionProps {
  currentFen: string;
  onUpdateBoardFen: (fen: string) => void;
  onSetIsFlipped: (flipped: boolean) => void;
  onRegisterMoveAttempt?: (
    fn: ((san: string, fen: string, from?: Square, to?: Square) => void) | null
  ) => void;
  initialOpeningId?: string;
  initialVariationId?: string;
  onOpenChatAiWithFen?: (fen: string) => void;
  onPreviewFenChange?: (fen: string | null) => void;
}

export const OpeningPuzzlesSection: React.FC<OpeningPuzzlesSectionProps> = ({
  currentFen,
  onUpdateBoardFen,
  onSetIsFlipped,
  onRegisterMoveAttempt,
  initialOpeningId,
  initialVariationId,
  onOpenChatAiWithFen,
  onPreviewFenChange,
}) => {
  // Selected Opening & Variation
  const [selectedOpeningId, setSelectedOpeningId] = useState<string>(
    initialOpeningId || 'ruy-lopez'
  );
  const [selectedVariationId, setSelectedVariationId] = useState<string>(
    initialVariationId || 'ruy-berlin'
  );

  // Selected Puzzle Number (1 to 200) and Palette input value
  const [puzzleNumber, setPuzzleNumber] = useState<number>(1);
  const [puzzleInputVal, setPuzzleInputVal] = useState<string>('1');
  const [selectedVarietyFilter, setSelectedVarietyFilter] = useState<number | 'all'>('all');

  // Solver interactive states
  const [currentMoveStep, setCurrentMoveStep] = useState<number>(0);
  const [puzzleStatus, setPuzzleStatus] = useState<
    'playing' | 'exploring' | 'correct' | 'solved'
  >('playing');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [solvedList, setSolvedList] = useState<number[]>([]);

  // Played moves tracking (enables free play & move-by-move explanation)
  const [playedMoves, setPlayedMoves] = useState<PlayedMoveItem[]>([]);
  const [activePreviewMoveIndex, setActivePreviewMoveIndex] = useState<number | null>(null);

  // Engine Analysis & Move-by-Move explanation states
  const [engineAnalysis, setEngineAnalysis] = useState<EngineAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [autoAnalyseEnabled, setAutoAnalyseEnabled] = useState<boolean>(false);
  const [showAnalysisSection, setShowAnalysisSection] = useState<boolean>(true);
  const [expandedMoveIdx, setExpandedMoveIdx] = useState<number | null>(null);

  // Current opening and variation objects
  const currentOpening = useMemo(() => {
    return getOpeningById(selectedOpeningId) || openings[0];
  }, [selectedOpeningId]);

  const currentVariation = useMemo(() => {
    return getVariationById(selectedOpeningId, selectedVariationId) || currentOpening.variations[0];
  }, [selectedOpeningId, selectedVariationId, currentOpening]);

  // Load solved list from local storage
  useEffect(() => {
    const solved = getSolvedPuzzleIds(selectedOpeningId, selectedVariationId);
    setSolvedList(solved);
  }, [selectedOpeningId, selectedVariationId]);

  // Retrieve the active puzzle data (1 to 200)
  const currentPuzzle: OpeningPuzzle = useMemo(() => {
    return getPuzzleForVariation(selectedOpeningId, selectedVariationId, puzzleNumber);
  }, [selectedOpeningId, selectedVariationId, puzzleNumber]);

  // Execute Stockfish 18 analysis for a given position
  const runStockfishAnalysis = useCallback(
    async (fenToAnalyze: string) => {
      setIsAnalyzing(true);
      try {
        const result = await analyzePositionStockfish18(fenToAnalyze);
        setEngineAnalysis(result);
      } catch (err) {
        console.error('Stockfish puzzle analysis error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  // Load the puzzle into the board
  const loadPuzzle = useCallback(
    (num: number) => {
      const safeNum = Math.max(1, Math.min(200, Math.round(num)));
      const p = getPuzzleForVariation(selectedOpeningId, selectedVariationId, safeNum);

      setPuzzleNumber(safeNum);
      setPuzzleInputVal(String(safeNum));
      setCurrentMoveStep(0);
      setPuzzleStatus('playing');
      setFeedbackMessage(null);
      setShowHint(false);
      setShowSolution(false);
      setPlayedMoves([]);
      setActivePreviewMoveIndex(null);
      setEngineAnalysis(null);
      onPreviewFenChange?.(null);

      // Set position on board
      onUpdateBoardFen(p.fen);
      onSetIsFlipped(p.sideToPlay === 'black');
      chessAudio.playMove();
    },
    [selectedOpeningId, selectedVariationId, onUpdateBoardFen, onSetIsFlipped, onPreviewFenChange]
  );

  // Track previous opening/variation to only reset when the opening actually changes
  const prevOpeningVarRef = useRef<{ opId: string; varId: string }>({
    opId: selectedOpeningId,
    varId: selectedVariationId,
  });

  useEffect(() => {
    if (
      prevOpeningVarRef.current.opId !== selectedOpeningId ||
      prevOpeningVarRef.current.varId !== selectedVariationId
    ) {
      prevOpeningVarRef.current = { opId: selectedOpeningId, varId: selectedVariationId };
      loadPuzzle(1);
    }
  }, [selectedOpeningId, selectedVariationId, loadPuzzle]);

  // Initial load on mount
  useEffect(() => {
    loadPuzzle(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to construct a tactical explanation for a played move
  const generateMoveExplanation = (
    san: string,
    color: 'White' | 'Black',
    isSolution: boolean,
    expectedSan?: string
  ): { concept: string; explanation: string } => {
    if (isSolution) {
      return {
        concept: `${currentPuzzle.varietyName} Tactical Execution`,
        explanation: `${color} executes the key move ${san} precisely as required by the tactical combination, exerting decisive pressure and converting the opening advantage.`,
      };
    }

    if (expectedSan) {
      return {
        concept: 'Alternative Move Exploration',
        explanation: `${color} played ${san}. While playable, the intended tactical continuation was ${expectedSan}, which directly strikes at the weakness identified in the ${currentPuzzle.varietyName} motif.`,
      };
    }

    return {
      concept: 'Free Position Exploration',
      explanation: `${color} played ${san}, shifting piece coordination. Use the Move-by-Move analysis below to assess its strategic impact against Stockfish 18 evaluation.`,
    };
  };

  // Handle move verification when user plays on the board
  // ALLOW EVERY TYPE OF MOVE WITHOUT IMMEDIATE ERROR
  const handleUserMoveAttempt = useCallback(
    (san: string, nextFen: string, from?: Square, to?: Square) => {
      const ply = playedMoves.length + 1;
      const moveNum = Math.floor((ply - 1) / 2) + 1;
      const color: 'White' | 'Black' = currentPuzzle.sideToPlay === 'white' ? 'White' : 'Black';

      // Determine if this matches the expected solution step
      const expectedPlayerMove = currentPuzzle.solutionMoves[currentMoveStep];
      const isSolution = san === expectedPlayerMove;

      const expl = generateMoveExplanation(san, color, isSolution, expectedPlayerMove);

      const userMoveItem: PlayedMoveItem = {
        san,
        from,
        to,
        fen: nextFen,
        ply,
        moveNum,
        color,
        isSolutionMove: isSolution,
        expectedMove: expectedPlayerMove,
        tacticalConcept: expl.concept,
        explanation: expl.explanation,
      };

      const updatedMoves = [...playedMoves, userMoveItem];
      setPlayedMoves(updatedMoves);
      setActivePreviewMoveIndex(null);
      onPreviewFenChange?.(null);

      if (autoAnalyseEnabled) {
        runStockfishAnalysis(nextFen);
      }

      if (isSolution) {
        // Correct tactical move!
        const nextStep = currentMoveStep + 1;

        if (nextStep >= currentPuzzle.solutionMoves.length) {
          // Puzzle completed!
          setPuzzleStatus('solved');
          setFeedbackMessage('Tactical execution complete! Puzzle solved.');
          saveSolvedPuzzle(selectedOpeningId, selectedVariationId, puzzleNumber);
          setSolvedList((prev) => (prev.includes(puzzleNumber) ? prev : [...prev, puzzleNumber]));
          chessAudio.playCheck();
        } else {
          // Opponent has a reply move in the sequence
          const opponentMove = currentPuzzle.solutionMoves[nextStep];
          setPuzzleStatus('correct');
          setFeedbackMessage(`Great move (${san})! Playing opponent response...`);

          setTimeout(() => {
            try {
              const chess = new Chess(nextFen);
              const m = chess.move(opponentMove);
              if (m) {
                if (m.captured) chessAudio.playCapture();
                else chessAudio.playMove();

                const oppFen = chess.fen();
                onUpdateBoardFen(oppFen);
                setCurrentMoveStep(nextStep + 1);

                const oppPly = updatedMoves.length + 1;
                const oppMoveNum = Math.floor((oppPly - 1) / 2) + 1;
                const oppColor: 'White' | 'Black' = color === 'White' ? 'Black' : 'White';

                const oppItem: PlayedMoveItem = {
                  san: m.san,
                  from: m.from as Square,
                  to: m.to as Square,
                  fen: oppFen,
                  ply: oppPly,
                  moveNum: oppMoveNum,
                  color: oppColor,
                  isSolutionMove: true,
                  tacticalConcept: 'Opponent Forced Defense',
                  explanation: `${oppColor} plays ${m.san} under tactical compulsion. Find the follow-up move to clinch the position!`,
                };

                setPlayedMoves([...updatedMoves, oppItem]);
                setFeedbackMessage(`Your turn: play the decisive finish!`);

                if (autoAnalyseEnabled) {
                  runStockfishAnalysis(oppFen);
                }
              }
            } catch {
              // Opponent move fallback
            }
          }, 600);
        }
      } else {
        // User made an alternative move
        // ALLOW IT AND DO NOT GIVE AN IMMEDIATE ERROR!
        setPuzzleStatus('exploring');
        setFeedbackMessage(
          `Move played: ${san} • Exploring position (${updatedMoves.length} moves on board). Click 'Analyse & Explain' below to inspect this line.`
        );
      }
    },
    [
      playedMoves,
      currentPuzzle,
      currentMoveStep,
      selectedOpeningId,
      selectedVariationId,
      puzzleNumber,
      autoAnalyseEnabled,
      runStockfishAnalysis,
      onUpdateBoardFen,
      onPreviewFenChange,
    ]
  );

  // Register the callback with the parent board
  useEffect(() => {
    if (onRegisterMoveAttempt) {
      onRegisterMoveAttempt(handleUserMoveAttempt);
    }
    return () => {
      if (onRegisterMoveAttempt) {
        onRegisterMoveAttempt(null);
      }
    };
  }, [onRegisterMoveAttempt, handleUserMoveAttempt]);

  // Undo the last played move on the board
  const handleUndoMove = () => {
    if (playedMoves.length === 0) return;
    const nextMoves = playedMoves.slice(0, -1);
    setPlayedMoves(nextMoves);
    setActivePreviewMoveIndex(null);
    onPreviewFenChange?.(null);

    const prevFen = nextMoves.length > 0 ? nextMoves[nextMoves.length - 1].fen : currentPuzzle.fen;
    onUpdateBoardFen(prevFen);
    chessAudio.playMove();

    // Adjust step
    if (currentMoveStep > 0 && currentMoveStep <= nextMoves.length) {
      setCurrentMoveStep(nextMoves.length);
    } else {
      setCurrentMoveStep(0);
    }

    setFeedbackMessage(
      nextMoves.length > 0
        ? `Stepped back to move ${nextMoves.length}. Board ready.`
        : 'Reset to puzzle starting position.'
    );

    if (autoAnalyseEnabled) {
      runStockfishAnalysis(prevFen);
    }
  };

  // Reset current puzzle back to starting position
  const handleResetPuzzle = () => {
    loadPuzzle(puzzleNumber);
  };

  // Step through previous moves for review
  const handleSelectMoveForPreview = (index: number) => {
    if (index === activePreviewMoveIndex) {
      setActivePreviewMoveIndex(null);
      onPreviewFenChange?.(null);
    } else {
      setActivePreviewMoveIndex(index);
      const targetFen = playedMoves[index]?.fen;
      if (targetFen) {
        onPreviewFenChange?.(targetFen);
      }
    }
  };

  // Filtered puzzle list for quick jump
  const filteredPuzzleNumbers = useMemo(() => {
    const list: number[] = [];
    for (let i = 1; i <= 200; i++) {
      if (selectedVarietyFilter === 'all') {
        list.push(i);
      } else {
        const varietyIndex = ((i - 1) % 20) + 1;
        if (varietyIndex === selectedVarietyFilter) {
          list.push(i);
        }
      }
    }
    return list;
  }, [selectedVarietyFilter]);

  const solvedCount = solvedList.length;

  return (
    <div className="space-y-4 text-zinc-100" id="opening-puzzles-container">
      {/* Header Banner & Stats */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#141724] to-[#181b2a] border border-cyan-500/20 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Opening Tactical Puzzles
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  200 Puzzles • 20 Varieties
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Interactive puzzle solver with free-move exploration & Stockfish 18 move-by-move explanations
              </p>
            </div>
          </div>

          {/* Solved Progress Counter */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0e1017] border border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>
                {solvedCount} / 200 Solved
              </span>
            </div>
            <div className="w-20 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(solvedCount / 200) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Opening & Variation Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-zinc-800/80">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Opening:
            </label>
            <select
              id="select-puzzle-opening"
              value={selectedOpeningId}
              onChange={(e) => {
                setSelectedOpeningId(e.target.value);
                const op = getOpeningById(e.target.value);
                if (op && op.variations.length > 0) {
                  setSelectedVariationId(op.variations[0].id);
                }
              }}
              className="w-full bg-[#181a24] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {openings.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} ({op.ecoCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Variation:
            </label>
            <select
              id="select-puzzle-variation"
              value={selectedVariationId}
              onChange={(e) => setSelectedVariationId(e.target.value)}
              className="w-full bg-[#181a24] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {currentOpening.variations.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.eco})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Puzzle Bar & Direct Number Input */}
      <div className="p-3.5 rounded-xl bg-[#11131c] border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-cyan-500 text-zinc-950 font-black text-xs">
              #{currentPuzzle.puzzleNumber}
            </span>
            <div>
              <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                {currentPuzzle.variationName} — {currentPuzzle.varietyName}
                {solvedList.includes(puzzleNumber) && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                )}
              </h4>
              <p className="text-[11px] text-zinc-400">
                Variety #{currentPuzzle.varietyIndex}: {currentPuzzle.varietyName} •{' '}
                <span className="text-cyan-300 font-semibold">
                  {currentPuzzle.sideToPlay === 'white' ? 'White to Play' : 'Black to Play'}
                </span>
              </p>
            </div>
          </div>

          {/* Jump directly to any Puzzle Number (1 to 200) */}
          <div className="flex items-center gap-2 bg-[#181a26] px-2.5 py-1.5 rounded-lg border border-zinc-700/80">
            <span className="text-xs font-bold text-zinc-300">Set Puzzle #:</span>
            <input
              id="input-puzzle-number-direct"
              type="number"
              min={1}
              max={200}
              value={puzzleInputVal}
              onChange={(e) => {
                setPuzzleInputVal(e.target.value);
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num) && num >= 1 && num <= 200) {
                  loadPuzzle(num);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const num = parseInt(puzzleInputVal, 10);
                  if (!isNaN(num) && num >= 1 && num <= 200) {
                    loadPuzzle(num);
                  }
                }
              }}
              className="w-16 px-2 py-1 text-center font-mono font-bold rounded bg-[#10121a] border border-cyan-500/50 text-cyan-300 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="1-200"
            />
            <button
              id="btn-set-up-board-direct"
              type="button"
              onClick={() => {
                const num = parseInt(puzzleInputVal, 10);
                if (!isNaN(num) && num >= 1 && num <= 200) {
                  loadPuzzle(num);
                }
              }}
              className="px-2.5 py-1 text-xs font-bold rounded bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors cursor-pointer shadow"
            >
              Set Up Board
            </button>
          </div>
        </div>

        {/* Tactical Objective Prompt */}
        <div className="p-2.5 rounded-lg bg-[#161824] border border-cyan-500/20 flex items-start gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-cyan-300">Goal: </span>
            <span className="text-zinc-200">{currentPuzzle.hint}</span>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Click pieces on the board to play your moves. Free moves are allowed without immediate error.
            </div>
          </div>
        </div>

        {/* Status / Feedback message */}
        {feedbackMessage && (
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
              puzzleStatus === 'solved'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                : puzzleStatus === 'correct'
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-zinc-800/60 border-zinc-700 text-zinc-300'
            }`}
          >
            <span>{feedbackMessage}</span>
            {playedMoves.length > 0 && (
              <button
                type="button"
                onClick={handleUndoMove}
                className="px-2 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Undo2 className="w-3 h-3" />
                Undo
              </button>
            )}
          </div>
        )}

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              id="btn-prev-puzzle"
              type="button"
              disabled={puzzleNumber <= 1}
              onClick={() => loadPuzzle(puzzleNumber - 1)}
              className="px-2.5 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#232638] disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>

            <button
              id="btn-next-puzzle"
              type="button"
              disabled={puzzleNumber >= 200}
              onClick={() => loadPuzzle(puzzleNumber + 1)}
              className="px-2.5 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#232638] disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-random-puzzle"
              type="button"
              onClick={() => {
                const rand = Math.floor(Math.random() * 200) + 1;
                loadPuzzle(rand);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#232638] border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              Random
            </button>

            <button
              id="btn-reset-puzzle"
              type="button"
              onClick={handleResetPuzzle}
              className="px-2.5 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#232638] border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset to puzzle starting position"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              Reset
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-toggle-hint"
              type="button"
              onClick={() => setShowHint(!showHint)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                showHint
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-[#181a26] border-zinc-700 text-zinc-300 hover:bg-[#232638]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? 'Hide Hint' : 'Hint'}
            </button>

            <button
              id="btn-toggle-solution"
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                showSolution
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-[#181a26] border-zinc-700 text-zinc-300 hover:bg-[#232638]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {showSolution ? 'Hide Solution' : 'Solution'}
            </button>
          </div>
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <HelpCircle className="w-3.5 h-3.5" />
              Grandmaster Hint:
            </div>
            <p className="text-zinc-200">{currentPuzzle.hint}</p>
          </div>
        )}

        {/* Solution Box */}
        {showSolution && (
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              Solution Line:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentPuzzle.solutionMoves.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[#181a26] border border-cyan-500/30 text-cyan-300 font-mono font-bold"
                >
                  {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
                  {m}
                </span>
              ))}
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              {currentPuzzle.explanation}
            </p>
          </div>
        )}
      </div>

      {/* MOVE-BY-MOVE ANALYSIS & GRANDMASTER EXPLANATION SECTION */}
      <div className="p-3.5 rounded-xl bg-[#11131c] border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-200">
              Move-by-Move Analysis & GM Explanation
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-analyse toggle */}
            <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAnalyseEnabled}
                onChange={(e) => setAutoAnalyseEnabled(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span>Auto-analyse moves</span>
            </label>

            {/* Run Analysis Button */}
            <button
              id="btn-run-puzzle-analysis"
              type="button"
              disabled={isAnalyzing}
              onClick={() => runStockfishAnalysis(currentFen)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
            >
              <Cpu className="w-3.5 h-3.5" />
              {isAnalyzing ? 'Analyzing...' : 'Analyse & Explain'}
            </button>
          </div>
        </div>

        {/* Moves Played List & Step-by-Step Breakdown */}
        {playedMoves.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">
                Moves Played ({playedMoves.length}):
              </span>
              <span className="text-[11px] text-zinc-500">
                Click any move to review board position
              </span>
            </div>

            {/* Move cards list */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {playedMoves.map((m, idx) => {
                const isSelectedForPreview = activePreviewMoveIndex === idx;
                const isExpanded = expandedMoveIdx === idx;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition-all text-xs ${
                      isSelectedForPreview
                        ? 'bg-cyan-500/15 border-cyan-400/60 ring-1 ring-cyan-400'
                        : 'bg-[#161824] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        onClick={() => handleSelectMoveForPreview(idx)}
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <span className="font-mono font-bold text-zinc-400 text-[11px]">
                          {m.ply % 2 !== 0 ? `${m.moveNum}.` : `${m.moveNum}...`}
                        </span>
                        <span className="font-bold text-zinc-100 px-2 py-0.5 rounded bg-[#1c1f2e] border border-zinc-700 font-mono">
                          {m.san}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {m.color}
                        </span>

                        {m.isSolutionMove ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Solution Move
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Alternative Move
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedMoveIdx(isExpanded ? null : idx)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        title="Toggle detailed explanation"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Move Explanation Text */}
                    {(isExpanded || isSelectedForPreview) && (
                      <div className="mt-2 pt-2 border-t border-zinc-800/80 space-y-1 text-zinc-300 text-[11px]">
                        <div className="font-semibold text-cyan-300 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-cyan-400" />
                          {m.tacticalConcept}
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                          {m.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step back or clear */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleUndoMove}
                className="px-2.5 py-1 rounded bg-[#181a26] hover:bg-[#222536] border border-zinc-700 text-xs text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5 text-zinc-400" />
                Undo Last Move
              </button>

              <button
                type="button"
                onClick={handleResetPuzzle}
                className="px-2.5 py-1 rounded bg-[#181a26] hover:bg-[#222536] border border-zinc-700 text-xs text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                Reset Puzzle Board
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[#141724] border border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-200">No moves played yet. </span>
              Click any piece on the board to play your first move, or click{' '}
              <span className="text-cyan-300 font-bold">Analyse & Explain</span> to evaluate the starting puzzle setup.
            </div>
          </div>
        )}

        {/* Stockfish 18 Evaluation Card */}
        {engineAnalysis && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-[#121522] to-[#171a29] border border-cyan-500/30 space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-semibold">Stockfish 18 Evaluation:</span>
                <span className="px-2 py-0.5 rounded font-mono font-black text-sm bg-cyan-500 text-zinc-950">
                  {engineAnalysis.evalScore}
                </span>
                <span className="text-[11px] text-zinc-400 capitalize">
                  ({engineAnalysis.status.replace('_', ' ')})
                </span>
              </div>

              {engineAnalysis.bestMoveSan && (
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-zinc-400">Best Engine Move:</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    {engineAnalysis.bestMoveSan}
                  </span>
                </div>
              )}
            </div>

            {/* Principal Continuation Variation (PV) */}
            {engineAnalysis.pv && engineAnalysis.pv.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400">
                  Recommended Continuation Line:
                </span>
                <div className="flex flex-wrap gap-1">
                  {engineAnalysis.pv.map((san, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-[#1a1d2d] border border-zinc-700 text-cyan-300 font-mono text-[11px]"
                    >
                      {i + 1}. {san}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Thorough Position Assessment */}
            {engineAnalysis.thoroughAssessment && (
              <div className="pt-2 border-t border-zinc-800 space-y-1.5 text-[11px]">
                <div className="font-bold text-zinc-300">Grandmaster Position Assessment:</div>
                <p className="text-zinc-300 leading-relaxed">
                  {engineAnalysis.thoroughAssessment.overallSummary}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-zinc-400">
                  <div>
                    <span className="font-semibold text-zinc-300">King Safety: </span>
                    {engineAnalysis.thoroughAssessment.kingSafety}
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-300">Center & Space: </span>
                    {engineAnalysis.thoroughAssessment.centerAndSpace}
                  </div>
                </div>
              </div>
            )}

            {/* Ask AI Grandmaster Assistant */}
            {onOpenChatAiWithFen && (
              <div className="pt-2 border-t border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => onOpenChatAiWithFen(currentFen)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Ask AI Grandmaster About This Position
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 200 Puzzles Quick Navigator Grid & Variety Filter */}
      <div className="p-3.5 rounded-xl bg-[#11131c] border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-zinc-300">Filter by Variety (20 Varieties):</span>
          </div>

          <select
            id="select-puzzle-variety-filter"
            value={selectedVarietyFilter}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedVarietyFilter(val === 'all' ? 'all' : parseInt(val, 10));
            }}
            className="bg-[#181a24] border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All 20 Tactical Varieties (200 Puzzles)</option>
            {PUZZLE_VARIETIES.map((v) => (
              <option key={v.index} value={v.index}>
                #{v.index} {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick jump buttons for all 200 puzzles */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Showing {filteredPuzzleNumbers.length} Puzzles:</span>
            <span className="text-[10px]">Click any number to play immediately</span>
          </div>

          <div className="max-h-36 overflow-y-auto pr-1 grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-1 select-none">
            {filteredPuzzleNumbers.map((num) => {
              const isCurrent = num === puzzleNumber;
              const isSolved = solvedList.includes(num);

              return (
                <button
                  key={num}
                  id={`btn-jump-puzzle-${num}`}
                  type="button"
                  onClick={() => loadPuzzle(num)}
                  className={`h-7 rounded text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-cyan-500 text-zinc-950 ring-2 ring-cyan-300 font-black shadow-md'
                      : isSolved
                      ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40'
                      : 'bg-[#181a26] text-zinc-400 hover:text-zinc-100 hover:bg-[#222536] border border-zinc-800'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
