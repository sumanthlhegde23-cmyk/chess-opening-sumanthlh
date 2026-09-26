import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { openings, getOpeningById } from './data/openings';
import { BadMoveRefutation, Variation } from './types/chess';
import { Chessboard } from './components/Chessboard';
import { MoveExplanationPanel } from './components/MoveExplanationPanel';
import { OpeningExplorer } from './components/OpeningExplorer';
import { VariationSelector } from './components/VariationSelector';
import { DeviationRefutationCard } from './components/DeviationRefutationCard';
import { analyzeDeviation, DeviationAnalysis } from './utils/deviationAnalyzer';
import { Navbar } from './components/Navbar';
import { HelpModal } from './components/HelpModal';
import { PremiumModal } from './components/PremiumModal';
import { PoliteUpgradeModal } from './components/PoliteUpgradeModal';
import { LockedVariationModal } from './components/LockedVariationModal';
import { PracticeModeModal } from './components/PracticeModeModal';
import { ChatWithAiWindow } from './components/ChatWithAiWindow';
import { chessAudio } from './utils/sound';
import { getGamesForVariation } from './data/grandmasterGames';
import { getGrandmasterGameExplanations } from './utils/gameExplainer';
import { GrandmasterShowcaseHeader } from './components/GrandmasterShowcaseHeader';
import {
  PaidPlanTier,
  UserRole,
  getStoredPaidPlan,
  saveStoredPaidPlan,
  getStoredUserRole,
  saveStoredUserRole,
  isVariationLocked,
  isOpeningLocked,
  getOpeningLockDetails,
} from './utils/pricingLocks';
import {
  BookOpen,
  Sparkles,
  Info,
  Shield,
  Swords,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  X,
  Cpu,
  Lock,
  Crown
} from 'lucide-react';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface ActiveRefutationState {
  refutation: BadMoveRefutation;
  fenBefore: string;
  stepIndex: number;
  fens: string[];
  movesPlayed: { from: string; to: string; san: string }[];
}

interface UserDeviationState {
  analysis: DeviationAnalysis;
  fenBefore: string;
  userMove: { from: string; to: string; san: string };
  stepIndex: number; // 0 = position after user's move, 1 = after 1st engine reply, etc.
  fens: string[];
  moves: { from: string; to: string; san: string; turn: 'White' | 'Black' }[];
  isAutoPlaying: boolean;
}

export default function App() {
  const [selectedOpeningId, setSelectedOpeningId] = useState<string>('ruy-lopez');
  const [selectedVariationId, setSelectedVariationId] = useState<string>('ruy-lopez-berlin');
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1); // -1 = start position
  const [viewMode, setViewMode] = useState<'repertoire' | 'grandmaster'>('repertoire');
  const [activeGmGameId, setActiveGmGameId] = useState<string | null>(null);
  const [gmMoveIndex, setGmMoveIndex] = useState<number>(-1);
  const [activeRefutation, setActiveRefutation] = useState<ActiveRefutationState | null>(null);
  const [userDeviation, setUserDeviation] = useState<UserDeviationState | null>(null);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [boardTheme, setBoardTheme] = useState<string>('maple');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed] = useState<number>(2200); // 2.2s interval
  const [trainingMode, setTrainingMode] = useState<boolean>(false);
  const [sideFilter, setSideFilter] = useState<'all' | 'white' | 'black'>('all');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState<boolean>(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState<boolean>(false);
  const [isChatAiOpen, setIsChatAiOpen] = useState<boolean>(false);
  const [chatAiInitialFen, setChatAiInitialFen] = useState<string | undefined>(undefined);
  const [paidPlanTier, setPaidPlanTier] = useState<PaidPlanTier>(() => getStoredPaidPlan());
  const [userRole, setUserRole] = useState<UserRole>(() => getStoredUserRole());
  const [isPoliteUpgradeOpen, setIsPoliteUpgradeOpen] = useState<boolean>(false);
  const [politeTargetOpeningName, setPoliteTargetOpeningName] = useState<string | undefined>(undefined);
  const [isLockedVariationModalOpen, setIsLockedVariationModalOpen] = useState<boolean>(false);
  const [lockedVariationTarget, setLockedVariationTarget] = useState<Variation | null>(null);
  const [premiumInitialPlan, setPremiumInitialPlan] = useState<'999' | '699' | '399'>('999');

  const isOwner = userRole === 'owner';
  const isPremiumUser = isOwner || paidPlanTier !== 'none';

  const handleActivateTier = useCallback((tier: PaidPlanTier) => {
    saveStoredPaidPlan(tier);
    setPaidPlanTier(tier);
  }, []);

  const handleLockedOpeningClick = useCallback((openingId: string) => {
    if (isOwner) {
      setSelectedOpeningId(openingId);
      return;
    }
    const details = getOpeningLockDetails(openingId);
    setPoliteTargetOpeningName(details.name || undefined);
    setIsPoliteUpgradeOpen(true);
  }, [isOwner]);

  const handleLockedVariationClick = useCallback((variation: Variation, _index: number) => {
    if (isOwner) {
      setSelectedVariationId(variation.id);
      return;
    }
    setLockedVariationTarget(variation);
    setIsLockedVariationModalOpen(true);
  }, [isOwner]);

  const handleProceedToPay999FromVariation = useCallback(() => {
    setIsLockedVariationModalOpen(false);
    setPremiumInitialPlan('999');
    setIsPremiumOpen(true);
  }, []);

  const handleOpenPremiumModal = useCallback((plan: '999' | '699' | '399' = '999') => {
    setPremiumInitialPlan(plan);
    setIsPremiumOpen(true);
  }, []);

  // Get current opening
  const currentOpening = useMemo(() => {
    return getOpeningById(selectedOpeningId) || openings[0];
  }, [selectedOpeningId]);

  // Get current variation
  const currentVariation = useMemo(() => {
    return (
      currentOpening.variations.find((v) => v.id === selectedVariationId) ||
      currentOpening.variations[0]
    );
  }, [currentOpening, selectedVariationId]);

  const currentVariationIndex = useMemo(() => {
    return currentOpening.variations.findIndex((v) => v.id === currentVariation.id);
  }, [currentOpening, currentVariation]);

  const isCurrentOpeningLocked = isOpeningLocked(currentOpening.id, paidPlanTier, isOwner);
  const isCurrentVariationLocked = isVariationLocked(currentVariationIndex, paidPlanTier, isOwner);

  // Grandmaster games for current variation
  const variationGmGames = useMemo(() => {
    return getGamesForVariation(currentVariation.id);
  }, [currentVariation.id]);

  const activeGmGame = useMemo(() => {
    if (!variationGmGames || variationGmGames.length === 0) return null;
    if (!activeGmGameId) return variationGmGames[0];
    return variationGmGames.find((g) => g.id === activeGmGameId) || variationGmGames[0];
  }, [variationGmGames, activeGmGameId]);

  const activeGmExplanations = useMemo(() => {
    if (!activeGmGame) return [];
    return getGrandmasterGameExplanations(activeGmGame, currentVariation);
  }, [activeGmGame, currentVariation]);

  // When opening changes, default to its first variation and reset move index
  const handleSelectOpening = useCallback((openingId: string) => {
    setSelectedOpeningId(openingId);
    setActiveRefutation(null);
    setUserDeviation(null);
    setActiveGmGameId(null);
    setGmMoveIndex(-1);
    const op = getOpeningById(openingId);
    if (op && op.variations.length > 0) {
      setSelectedVariationId(op.variations[0].id);
      // Auto-flip board to Black POV if user selects a Black opening
      setFlipped(op.side === 'black');
    }
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
  }, []);

  // When variation changes, reset move index
  const handleSelectVariation = useCallback((variationId: string) => {
    setSelectedVariationId(variationId);
    setActiveRefutation(null);
    setUserDeviation(null);
    setActiveGmGameId(null);
    setGmMoveIndex(-1);
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
  }, []);

  // Deviation controls (step, auto-play, reset to book)
  const handleStepDeviation = useCallback((direction: 1 | -1) => {
    setUserDeviation((prev) => {
      if (!prev) return null;
      const nextStep = prev.stepIndex + direction;
      if (nextStep < 0 || nextStep >= prev.moves.length) return prev;
      chessAudio.playMove();
      return {
        ...prev,
        stepIndex: nextStep,
      };
    });
  }, []);

  const handleToggleAutoPlayDeviation = useCallback(() => {
    setUserDeviation((prev) => {
      if (!prev) return null;
      if (prev.isAutoPlaying) {
        return { ...prev, isAutoPlaying: false };
      }
      const startStep = prev.stepIndex >= prev.moves.length - 1 ? 0 : prev.stepIndex;
      return { ...prev, stepIndex: startStep, isAutoPlaying: true };
    });
  }, []);

  const handleResetDeviation = useCallback(() => {
    setUserDeviation(null);
    chessAudio.playMove();
  }, []);

  // Auto-play interval for deviation continuation moves
  useEffect(() => {
    if (!userDeviation?.isAutoPlaying) return;

    const timer = setInterval(() => {
      setUserDeviation((prev) => {
        if (!prev || !prev.isAutoPlaying) return prev;
        if (prev.stepIndex >= prev.moves.length - 1) {
          return { ...prev, isAutoPlaying: false };
        }
        chessAudio.playMove();
        return {
          ...prev,
          stepIndex: prev.stepIndex + 1,
        };
      });
    }, 1350);

    return () => clearInterval(timer);
  }, [userDeviation?.isAutoPlaying]);

  // Refutation interactive playback handlers
  const handleStartRefutation = useCallback((refutation: BadMoveRefutation, fenBefore: string) => {
    setIsPlaying(false);
    setUserDeviation(null);
    try {
      const chess = new Chess(fenBefore);
      const fens = [fenBefore];
      const movesPlayed: { from: string; to: string; san: string }[] = [];

      for (const m of refutation.refutationMoves || []) {
        const res = chess.move(m);
        if (res) {
          fens.push(chess.fen());
          movesPlayed.push({ from: res.from, to: res.to, san: res.san });
        }
      }

      // Start at step 1 so bad move is immediately visible on board
      const startStep = Math.min(1, movesPlayed.length);
      setActiveRefutation({
        refutation,
        fenBefore,
        stepIndex: startStep,
        fens,
        movesPlayed,
      });
      chessAudio.playMove();
    } catch (e) {
      console.error('Failed to parse refutation line:', e);
    }
  }, []);

  const handleStopRefutation = useCallback(() => {
    setActiveRefutation(null);
  }, []);

  const handleStepRefutation = useCallback((direction: 1 | -1) => {
    setActiveRefutation((prev) => {
      if (!prev) return null;
      const nextStep = prev.stepIndex + direction;
      if (nextStep < 0 || nextStep > prev.movesPlayed.length) return prev;
      chessAudio.playMove();
      return {
        ...prev,
        stepIndex: nextStep,
      };
    });
  }, []);

  // Sound sync
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      chessAudio.setEnabled(next);
      return next;
    });
  }, []);

  // Auto-play timer
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        if (viewMode === 'grandmaster' && activeGmGame) {
          setGmMoveIndex((prev) => {
            if (prev < activeGmGame.moves.length - 1) {
              const nextIdx = prev + 1;
              chessAudio.playMove();
              return nextIdx;
            } else {
              setIsPlaying(false);
              return prev;
            }
          });
        } else {
          setCurrentMoveIndex((prev) => {
            if (prev < currentVariation.moves.length - 1) {
              const nextIdx = prev + 1;
              chessAudio.playMove();
              return nextIdx;
            } else {
              setIsPlaying(false);
              return prev;
            }
          });
        }
      }, playSpeed);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying, playSpeed, viewMode, activeGmGame, currentVariation.moves.length]);

  // Current FEN calculation (supports main line, GM games, off-book deviation continuation, and curated refutation demo)
  const currentFen = useMemo(() => {
    if (userDeviation) {
      return userDeviation.fens[userDeviation.stepIndex] || userDeviation.fenBefore;
    }
    if (activeRefutation) {
      return activeRefutation.fens[activeRefutation.stepIndex] || activeRefutation.fenBefore;
    }
    if (viewMode === 'grandmaster' && activeGmGame) {
      if (gmMoveIndex === -1) return START_FEN;
      const explanation = activeGmExplanations[gmMoveIndex];
      return explanation ? explanation.fen || START_FEN : START_FEN;
    }
    if (currentMoveIndex === -1) return START_FEN;
    const explanation = currentVariation.moveExplanations[currentMoveIndex];
    return explanation ? explanation.fen || START_FEN : START_FEN;
  }, [
    userDeviation,
    activeRefutation,
    viewMode,
    activeGmGame,
    gmMoveIndex,
    activeGmExplanations,
    currentVariation,
    currentMoveIndex,
  ]);

  // Calculate last move {from, to} for square highlight
  const lastMoveHighlight = useMemo(() => {
    if (userDeviation) {
      const m = userDeviation.moves[userDeviation.stepIndex];
      if (m) {
        return { from: m.from, to: m.to };
      }
      return null;
    }
    if (activeRefutation) {
      if (activeRefutation.stepIndex > 0 && activeRefutation.movesPlayed[activeRefutation.stepIndex - 1]) {
        const m = activeRefutation.movesPlayed[activeRefutation.stepIndex - 1];
        return { from: m.from, to: m.to };
      }
      return null;
    }
    if (viewMode === 'grandmaster' && activeGmGame) {
      if (gmMoveIndex === -1) return null;
      try {
        const chess = new Chess();
        for (let i = 0; i <= gmMoveIndex; i++) {
          const move = chess.move(activeGmGame.moves[i]);
          if (i === gmMoveIndex && move) {
            return { from: move.from, to: move.to };
          }
        }
      } catch {
        return null;
      }
      return null;
    }
    if (currentMoveIndex === -1) return null;
    try {
      const chess = new Chess();
      for (let i = 0; i <= currentMoveIndex; i++) {
        const move = chess.move(currentVariation.moves[i]);
        if (i === currentMoveIndex && move) {
          return { from: move.from, to: move.to };
        }
      }
    } catch {
      return null;
    }
    return null;
  }, [userDeviation, activeRefutation, viewMode, activeGmGame, gmMoveIndex, currentVariation, currentMoveIndex]);

  // Next expected move in training mode
  const expectedNextMove = useMemo(() => {
    if (userDeviation || activeRefutation) return undefined;
    const nextIdx = currentMoveIndex + 1;
    if (nextIdx < currentVariation.moves.length) {
      return currentVariation.moves[nextIdx];
    }
    return undefined;
  }, [userDeviation, activeRefutation, currentVariation, currentMoveIndex]);

  // Handle board move attempt in Training Mode or Free Practice
  const handleMoveAttempt = useCallback(
    (_from: string, _to: string, san: string, isCorrect: boolean) => {
      if (activeRefutation) {
        setActiveRefutation(null);
      }

      // If user is already exploring an off-book deviation and makes another move
      if (userDeviation) {
        const currentBoardFen =
          userDeviation.fens[userDeviation.stepIndex] || userDeviation.fenBefore;
        try {
          const testChess = new Chess(currentBoardFen);
          const res = testChess.move(san);
          if (res) {
            const analysis = analyzeDeviation(
              currentBoardFen,
              san,
              '',
              currentMoveIndex + 1 + userDeviation.stepIndex,
              currentOpening,
              currentVariation
            );

            const sim = new Chess(currentBoardFen);
            const parsedMoves: { from: string; to: string; san: string; turn: 'White' | 'Black' }[] = [];
            const parsedFens: string[] = [];

            const m1 = sim.move(san);
            if (m1) {
              parsedMoves.push({
                from: m1.from,
                to: m1.to,
                san: m1.san,
                turn: m1.color === 'w' ? 'White' : 'Black',
              });
              parsedFens.push(sim.fen());
            }

            for (const cm of analysis.continuationMoves) {
              try {
                const r = sim.move(cm);
                if (r) {
                  parsedMoves.push({
                    from: r.from,
                    to: r.to,
                    san: r.san,
                    turn: r.color === 'w' ? 'White' : 'Black',
                  });
                  parsedFens.push(sim.fen());
                } else break;
              } catch {
                break;
              }
            }

            setUserDeviation({
              analysis,
              fenBefore: currentBoardFen,
              userMove: { from: _from, to: _to, san },
              stepIndex: 0,
              fens: parsedFens,
              moves: parsedMoves,
              isAutoPlaying: false,
            });
            chessAudio.playMove();
            return;
          }
        } catch (e) {
          console.error('Invalid move in deviation state:', e);
        }
        return;
      }

      // Main line move attempt
      if (isCorrect) {
        setUserDeviation(null);
        setCurrentMoveIndex((prev) => Math.min(currentVariation.moves.length - 1, prev + 1));
      } else {
        // INCORRECT MOVE:
        // Do NOT reject it! Provide why that was a bad move and further lines if he played with that sequence!
        const fenBefore =
          currentMoveIndex === -1
            ? START_FEN
            : currentVariation.moveExplanations[currentMoveIndex]?.fen || START_FEN;

        try {
          const analysis = analyzeDeviation(
            fenBefore,
            san,
            expectedNextMove || '',
            currentMoveIndex + 1,
            currentOpening,
            currentVariation
          );

          const sim = new Chess(fenBefore);
          const parsedMoves: { from: string; to: string; san: string; turn: 'White' | 'Black' }[] = [];
          const parsedFens: string[] = [];

          // Move 0: the user's attempted move
          const m1 = sim.move(san);
          if (m1) {
            parsedMoves.push({
              from: m1.from,
              to: m1.to,
              san: m1.san,
              turn: m1.color === 'w' ? 'White' : 'Black',
            });
            parsedFens.push(sim.fen());
          }

          // Subsequent punishing continuation moves
          for (const cm of analysis.continuationMoves) {
            try {
              const r = sim.move(cm);
              if (r) {
                parsedMoves.push({
                  from: r.from,
                  to: r.to,
                  san: r.san,
                  turn: r.color === 'w' ? 'White' : 'Black',
                });
                parsedFens.push(sim.fen());
              } else {
                break;
              }
            } catch {
              break;
            }
          }

          setUserDeviation({
            analysis,
            fenBefore,
            userMove: { from: _from, to: _to, san },
            stepIndex: 0, // Immediately display the position AFTER user played the move!
            fens: parsedFens,
            moves: parsedMoves,
            isAutoPlaying: false,
          });
          chessAudio.playMove();
        } catch (e) {
          console.error('Failed to parse deviation move:', e);
        }
      }
    },
    [
      activeRefutation,
      userDeviation,
      currentMoveIndex,
      currentVariation,
      currentOpening,
      expectedNextMove,
    ]
  );

  const handleSelectMove = useCallback(
    (index: number) => {
      setActiveRefutation(null);
      setUserDeviation(null);
      if (viewMode === 'grandmaster') {
        setGmMoveIndex(index);
      } else {
        setCurrentMoveIndex(index);
      }
      chessAudio.playMove();
    },
    [viewMode]
  );

  const handleJumpToTurningPoint = useCallback(() => {
    if (activeGmGame && activeGmGame.keyTurningPointMove !== undefined) {
      setGmMoveIndex(activeGmGame.keyTurningPointMove);
      chessAudio.playMove();
    }
  }, [activeGmGame]);

  return (
    <div className="min-h-screen bg-[#0f1115] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        flipped={flipped}
        onToggleFlip={() => setFlipped((prev) => !prev)}
        boardTheme={boardTheme}
        onChangeBoardTheme={setBoardTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPremium={() => handleOpenPremiumModal(paidPlanTier === '399' ? '179' : '599')}
        onOpenPractice={() => setIsPracticeOpen(true)}
        onOpenChatAi={() => setIsChatAiOpen(true)}
        isPremium={isPremiumUser}
        userTier={paidPlanTier}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Top Opening Browser Bar */}
        <section aria-label="Openings Explorer">
          <OpeningExplorer
            openings={openings}
            selectedOpeningId={selectedOpeningId}
            onSelectOpening={handleSelectOpening}
            sideFilter={sideFilter}
            onSideFilterChange={setSideFilter}
            userPlan={paidPlanTier}
            isOwner={isOwner}
            onLockedOpeningClick={handleLockedOpeningClick}
          />
        </section>

        {/* Selected Opening Overview Header & 12 Variations Selector */}
        <section
          aria-label="Variation Selector"
          className="bg-[#15171e] p-3.5 sm:p-4 rounded-xl border border-zinc-800/80 shadow-md space-y-3"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentOpening.side === 'white'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'bg-zinc-800 text-amber-300 border border-zinc-700'
                  }`}
                >
                  {currentOpening.side === 'white' ? 'White Opening' : 'Black Defense'}
                </span>
                <h2 className="text-lg font-bold text-zinc-100">{currentOpening.name}</h2>
                <span className="text-xs font-mono text-amber-400 font-semibold">
                  ({currentOpening.ecoCode})
                </span>
                {isCurrentOpeningLocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked Opening
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
                {currentOpening.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {currentOpening.keyThemes.slice(0, 2).map((theme, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-[#1f232c] text-zinc-300 border border-zinc-700/60"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Polite Locked Opening Banner */}
          {isCurrentOpeningLocked && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#291f16] via-[#1f1d26] to-[#161822] border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-2.5 text-amber-200">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-300">Notice:</span> 2 White & 2 Black openings are reserved on the standard plan. Would you kindly consider an add-up payment of <strong>₹399/-</strong> to unlock this opening?
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleLockedOpeningClick(currentOpening.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow transition-all cursor-pointer"
                >
                  Politely Unlock for ₹399/-
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPremiumModal('999')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                >
                  All 20 for ₹999
                </button>
              </div>
            </div>
          )}

          {/* 12 Variations Grid */}
          <VariationSelector
            variations={currentOpening.variations}
            selectedVariationId={selectedVariationId}
            onSelectVariation={handleSelectVariation}
            userPlan={paidPlanTier}
            isOwner={isOwner}
            onLockedVariationClick={handleLockedVariationClick}
          />

          {/* Current Variation Locked Notice */}
          {isCurrentVariationLocked && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#291f16] via-[#1f1d26] to-[#161822] border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-2.5 text-amber-200">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-300">{currentVariation.name} is Locked:</span> 5 variations across all openings require Lifetime membership of <strong>₹999/-</strong> (with annual renewal ₹199/-).
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenPremiumModal('999')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow transition-all cursor-pointer shrink-0"
              >
                Unlock All 5 Variations for ₹999/-
              </button>
            </div>
          )}
        </section>

        {/* Grandmaster Showcase & Repertoire Mode Selector */}
        <GrandmasterShowcaseHeader
          viewMode={viewMode}
          onSelectViewMode={(mode) => {
            setViewMode(mode);
            setIsPlaying(false);
            setUserDeviation(null);
            setActiveRefutation(null);
            if (mode === 'grandmaster' && !activeGmGameId && variationGmGames.length > 0) {
              setActiveGmGameId(variationGmGames[0].id);
              setGmMoveIndex(-1);
            }
          }}
          games={variationGmGames}
          activeGameId={activeGmGame?.id || null}
          onSelectGame={(gameId) => {
            setActiveGmGameId(gameId);
            setGmMoveIndex(-1);
            setIsPlaying(false);
            setUserDeviation(null);
            setActiveRefutation(null);
          }}
          onJumpToTurningPoint={handleJumpToTurningPoint}
        />

        {/* Central Workspace: Interactive Board & Move Explanations Panel */}
        <section aria-label="Interactive Board & Analysis" className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left / Center Column: Interactive Chessboard */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center justify-start space-y-3">
            <div className="w-full max-w-[540px] flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                <span className="text-xs font-semibold text-zinc-300">
                  {flipped ? 'Black Perspective' : 'White Perspective'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{trainingMode ? 'Training Mode' : 'Learn Mode'}</span>
                {trainingMode && expectedNextMove && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                    Play move for {currentMoveIndex % 2 === 0 ? 'Black' : 'White'}
                  </span>
                )}
              </div>
            </div>

            {/* Active Engine Refutation Interactive Demo Banner */}
            {activeRefutation && (
              <div className="w-full max-w-[540px] p-3 rounded-xl bg-gradient-to-r from-[#2c1317] via-[#211116] to-[#1a1114] border border-rose-500/50 shadow-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-rose-400" />
                      <span>Engine Refutation Demo</span>
                    </span>
                    <span className="font-mono font-bold text-rose-200">
                      {activeRefutation.refutation.badMove}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-zinc-900 text-amber-400 border border-zinc-700">
                      Eval: {activeRefutation.refutation.evalScore}
                    </span>
                    <button
                      onClick={handleStopRefutation}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800/90 hover:bg-zinc-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Exit Demo</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-rose-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300 font-mono text-[11px]">
                      Step {activeRefutation.stepIndex} of {activeRefutation.movesPlayed.length}
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {activeRefutation.stepIndex === 0
                        ? '(Before bad move)'
                        : activeRefutation.stepIndex === 1
                        ? `(Bad move: ${activeRefutation.movesPlayed[0].san})`
                        : `(Refutation: ${activeRefutation.movesPlayed[activeRefutation.stepIndex - 1].san})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStepRefutation(-1)}
                      disabled={activeRefutation.stepIndex === 0}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
                      title="Previous move in refutation"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStepRefutation(1)}
                      disabled={activeRefutation.stepIndex >= activeRefutation.movesPlayed.length}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium flex items-center gap-1 text-xs"
                      title="Next move in refutation"
                    >
                      <span>Next Move</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-rose-200/90 leading-relaxed font-sans bg-zinc-950/60 p-2 rounded border border-rose-500/20">
                  <strong className="text-rose-400">Why punished: </strong>
                  {activeRefutation.refutation.whyPunished}
                </div>
              </div>
            )}

            {/* Chessboard */}
            <Chessboard
              fen={currentFen}
              flipped={flipped}
              theme={boardTheme}
              lastMove={lastMoveHighlight}
              interactive={true}
              trainingMode={trainingMode}
              expectedNextMove={expectedNextMove}
              onMoveAttempt={handleMoveAttempt}
            />

            {/* Interactive Deviation Analysis & Refutation Card (when user plays an off-book or bad move) */}
            {userDeviation && (
              <DeviationRefutationCard
                analysis={userDeviation.analysis}
                currentStep={userDeviation.stepIndex}
                totalSteps={userDeviation.moves.length - 1}
                stepMoveSan={userDeviation.moves[userDeviation.stepIndex]?.san}
                stepTurn={userDeviation.moves[userDeviation.stepIndex]?.turn}
                isAutoPlaying={userDeviation.isAutoPlaying}
                onStep={handleStepDeviation}
                onToggleAutoPlay={handleToggleAutoPlayDeviation}
                onResetToBook={handleResetDeviation}
                variationName={currentVariation.name}
              />
            )}

            {/* Quick tips under board */}
            <div className="w-full max-w-[540px] flex items-center justify-between text-[11px] text-zinc-500 px-1 pt-1">
              <span>Click or drag pieces on the board</span>
              <span>Use ← → arrow keys to step moves</span>
            </div>
          </div>

          {/* Right Column: Move-by-Move Master Explanation & Navigation Panel */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col min-h-[500px]">
            <MoveExplanationPanel
              variation={currentVariation}
              currentMoveIndex={viewMode === 'grandmaster' ? gmMoveIndex : currentMoveIndex}
              onSelectMove={handleSelectMove}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((prev) => !prev)}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              trainingMode={trainingMode && viewMode === 'repertoire'}
              onToggleTrainingMode={() => setTrainingMode((prev) => !prev)}
              activeRefutationBadMove={activeRefutation?.refutation.badMove}
              onPreviewRefutation={handleStartRefutation}
              onStopRefutation={handleStopRefutation}
              userDeviationSan={userDeviation?.analysis.attemptedSan}
              onResetDeviation={handleResetDeviation}
              customMoves={viewMode === 'grandmaster' && activeGmGame ? activeGmGame.moves : undefined}
              customMoveExplanations={viewMode === 'grandmaster' ? activeGmExplanations : undefined}
              gameHeaderInfo={
                viewMode === 'grandmaster' && activeGmGame
                  ? {
                      title: `Game ${activeGmGame.gameNumber}: ${activeGmGame.white} vs ${activeGmGame.black}`,
                      white: activeGmGame.white,
                      black: activeGmGame.black,
                      event: activeGmGame.event,
                      year: activeGmGame.year,
                      result: activeGmGame.result,
                      synopsis: activeGmGame.resultDescription,
                    }
                  : undefined
              }
            />
          </div>
        </section>
      </main>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Go Premium Modal (₹999 Lifetime / ₹699 3-Year / ₹399 Addon) */}
      <PremiumModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
        isPremium={isPremiumUser}
        currentTier={paidPlanTier}
        onActivateTier={handleActivateTier}
        initialSelectedPlan={premiumInitialPlan}
      />

      {/* Polite Upgrade Modal (₹399/- add-up plan to unlock remaining 4 openings) */}
      <PoliteUpgradeModal
        isOpen={isPoliteUpgradeOpen}
        onClose={() => setIsPoliteUpgradeOpen(false)}
        currentTier={paidPlanTier}
        onActivateTier={handleActivateTier}
        targetOpeningName={politeTargetOpeningName}
      />

      {/* Locked Variation Modal (5 variations per opening requiring ₹999/-) */}
      <LockedVariationModal
        isOpen={isLockedVariationModalOpen}
        onClose={() => setIsLockedVariationModalOpen(false)}
        variation={lockedVariationTarget}
        openingName={currentOpening.name}
        onProceedToPay999={handleProceedToPay999FromVariation}
      />

      {/* Practice Mode Modal (Stockfish Level 1 to 18 Engine & 200 Puzzles per Variation) */}
      <PracticeModeModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        boardTheme={boardTheme}
        initialOpeningId={currentOpening?.id}
        initialVariationId={currentVariation?.id}
        onOpenChatAiWithFen={(fen) => {
          setChatAiInitialFen(fen);
          setIsChatAiOpen(true);
        }}
      />

      {/* Floating Chat with AI Window */}
      <ChatWithAiWindow
        isOpen={isChatAiOpen}
        onClose={() => setIsChatAiOpen(false)}
        currentOpeningName={currentOpening?.name}
        currentVariationName={currentVariation?.name}
        initialFen={chatAiInitialFen}
      />

      {/* Floating Trigger Button for "chat with ai" when window is closed */}
      {!isChatAiOpen && (
        <button
          id="floating-chat-with-ai-btn"
          onClick={() => setIsChatAiOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-bold text-xs rounded-full shadow-xl shadow-black/60 border border-amber-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Chat with AI - Grandmaster Chess Assistant"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-zinc-950 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-950 animate-pulse" />
          </div>
          <span className="tracking-wide">chat with ai</span>
        </button>
      )}
    </div>
  );
}
