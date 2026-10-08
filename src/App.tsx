import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { openings, getOpeningById } from './data/openings';
import { BadMoveRefutation, Variation } from './types/chess';
import { Chessboard } from './components/Chessboard';
import { MoveExplanationPanel } from './components/MoveExplanationPanel';
import { OpeningExplorer } from './components/OpeningExplorer';
import { AllOpeningsScreen, OpeningVariationsScreen } from './components/OpeningNavigationScreens';
import { DeviationRefutationCard } from './components/DeviationRefutationCard';
import { analyzeDeviation, DeviationAnalysis } from './utils/deviationAnalyzer';
import { Navbar, type LanguageCode } from './components/Navbar';
import { OnboardingExperience } from './components/OnboardingExperience';
import { isRightToLeftLanguage, isSupportedLanguage } from './data/languages';
import { startLiveTranslation } from './utils/liveTranslation';
import { LanguageSetup } from './components/LanguageSetup';
import { HelpModal } from './components/HelpModal';
import { PremiumModal } from './components/PremiumModal';
import { LockedVariationModal } from './components/LockedVariationModal';
import { PracticeModeModal } from './components/PracticeModeModal';
import { ChatWithAiWindow } from './components/ChatWithAiWindow';
import { chessAudio } from './utils/sound';
import { getGamesForVariation } from './data/grandmasterGames';
import { getGrandmasterGameExplanations } from './utils/gameExplainer';
import { GrandmasterShowcaseHeader } from './components/GrandmasterShowcaseHeader';
import { OpeningCinematic } from './components/OpeningCinematic';
import { UserProfileModal } from './components/UserProfileModal';
import { StreakRewardModal, DailyReward } from './components/StreakRewardModal';
import { VariationUnlockModal } from './components/VariationUnlockModal';
import { OnlineChessGameModal } from './components/OnlineChessGameModal';
import { loadUserProfile, saveUserProfile, UserProfile } from './utils/userProfile';
import {
  PaidPlanTier,
  UserRole,
  getStoredPaidPlan,
  saveStoredPaidPlan,
  getStoredUserRole,
  saveStoredUserRole,
  isVariationLocked,
  isOpeningLocked,
} from './utils/pricingLocks';
import {
  BookOpen,
  Sparkles,
  Info,
  Shield,
  Swords,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
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
  const [isLanguageSetupComplete, setIsLanguageSetupComplete] = useState(() =>
    Boolean(localStorage.getItem('chess-openings-language-setup') || localStorage.getItem('chess-openings-language'))
  );
  const [showOpeningCinematic, setShowOpeningCinematic] = useState(true);
  const [onboardingMode, setOnboardingMode] = useState<'tour' | 'basics' | null>(null);
  const [selectedOpeningId, setSelectedOpeningId] = useState<string>('ruy-lopez');
  const [selectedVariationId, setSelectedVariationId] = useState<string>('ruy-lopez-berlin');
  const [navigationScreen, setNavigationScreen] = useState<'home' | 'openings' | 'variations' | 'study'>('home');
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1); // -1 = start position
  const [viewMode, setViewMode] = useState<'repertoire' | 'grandmaster'>('repertoire');
  const [activeGmGameId, setActiveGmGameId] = useState<string | null>(null);
  const [gmMoveIndex, setGmMoveIndex] = useState<number>(-1);
  const [activeRefutation, setActiveRefutation] = useState<ActiveRefutationState | null>(null);
  const [userDeviation, setUserDeviation] = useState<UserDeviationState | null>(null);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [boardTheme, setBoardTheme] = useState<string>('maple');
  const [colorMode, setColorMode] = useState<'dark' | 'light'>(() =>
    localStorage.getItem('chess-openings-color-mode') === 'light' ? 'light' : 'dark'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const storedLanguage = localStorage.getItem('chess-openings-language');
    return isSupportedLanguage(storedLanguage) ? storedLanguage : 'en';
  });
  const [translationAttempt, setTranslationAttempt] = useState(0);
  const [translationStatus, setTranslationStatus] = useState<string | null>(null);
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
  const [isLockedVariationModalOpen, setIsLockedVariationModalOpen] = useState<boolean>(false);
  const [lockedVariationTarget, setLockedVariationTarget] = useState<Variation | null>(null);
  const [premiumInitialPlan, setPremiumInitialPlan] = useState<'999' | '699'>('999');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(!userProfile.username);
  const [dailyReward, setDailyReward] = useState<DailyReward | null>(null);
  const [isVariationUnlocksOpen, setIsVariationUnlocksOpen] = useState(false);
  const [isOnlineChessGameOpen, setIsOnlineChessGameOpen] = useState(false);
  const hasRecordedLoginRef = useRef(false);
  const sessionTickRef = useRef<number | null>(null);

  useEffect(() => {
    window.history.replaceState({ chessAppScreen: 'intro' }, '', window.location.href);
    const handlePopState = (event: PopStateEvent) => {
      setShowOpeningCinematic(event.state?.chessAppScreen !== 'main-menu');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    localStorage.setItem('chess-openings-color-mode', colorMode);
  }, [colorMode]);

  useEffect(() => {
    try {
      saveUserProfile(userProfile);
    } catch (error) {
      console.error('Could not save the player profile to this browser.', error);
    }
  }, [userProfile]);

  useEffect(() => {
    if (hasRecordedLoginRef.current) return;
    hasRecordedLoginRef.current = true;
    const now = new Date();
    const loginAt = now.toISOString();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const previousDate = userProfile.lastActiveDate;
    const previousMidnight = previousDate ? new Date(`${previousDate}T00:00:00`) : null;
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayGap = previousMidnight && !Number.isNaN(previousMidnight.getTime())
      ? Math.round((todayMidnight.getTime() - previousMidnight.getTime()) / 86400000)
      : null;
    const alreadyRewardedToday = previousDate === localDate;
    const nextStreak = alreadyRewardedToday
      ? userProfile.currentStreak
      : dayGap === 1
        ? userProfile.currentStreak + 1
        : 1;
    const nextPoints = userProfile.totalPoints + (alreadyRewardedToday ? 0 : 4);
    setUserProfile((profile) => ({
      ...profile,
      currentStreak: nextStreak,
      longestStreak: Math.max(profile.longestStreak, nextStreak),
      totalPoints: nextPoints,
      lastActiveDate: alreadyRewardedToday ? profile.lastActiveDate : localDate,
      lastLoginAt: loginAt,
      loginHistory: [...profile.loginHistory, loginAt].slice(-25),
    }));
    if (!alreadyRewardedToday) {
      setDailyReward({
        streak: nextStreak,
        totalPoints: nextPoints,
        milestone: [10, 50, 100, 101].includes(nextStreak),
      });
    }
  }, []);

  useEffect(() => {
    const recordVisibleTime = () => {
      if (sessionTickRef.current === null) return;
      const now = Date.now();
      const elapsedSeconds = Math.min(60, Math.floor((now - sessionTickRef.current) / 1000));
      sessionTickRef.current = now;
      if (elapsedSeconds > 0) {
        setUserProfile((profile) => ({ ...profile, totalSeconds: profile.totalSeconds + elapsedSeconds }));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordVisibleTime();
        sessionTickRef.current = null;
      } else {
        sessionTickRef.current = Date.now();
      }
    };

    sessionTickRef.current = document.visibilityState === 'visible' ? Date.now() : null;
    const timer = window.setInterval(recordVisibleTime, 15000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', recordVisibleTime);
    return () => {
      recordVisibleTime();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', recordVisibleTime);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('chess-openings-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRightToLeftLanguage(language) ? 'rtl' : 'ltr';
    setTranslationStatus(null);
    return startLiveTranslation(language, setTranslationStatus);
  }, [language, translationAttempt]);

  const handleChangeLanguage = useCallback((nextLanguage: LanguageCode) => {
    setTranslationStatus(null);
    if (nextLanguage === language) {
      setTranslationAttempt((attempt) => attempt + 1);
    } else {
      setLanguage(nextLanguage);
    }
  }, [language]);

  const handleLanguageSetupContinue = useCallback((countryCode: string, nextLanguage: LanguageCode) => {
    localStorage.setItem('chess-openings-country', countryCode);
    localStorage.setItem('chess-openings-language-setup', 'complete');
    setLanguage(nextLanguage);
    setIsLanguageSetupComplete(true);
  }, []);

  const isOwner = userRole === 'owner';
  const isPremiumUser = isOwner || paidPlanTier !== 'none';

  const startOnboarding = useCallback((mode: 'tour' | 'basics') => {
    setShowOpeningCinematic(false);
    setIsPracticeOpen(false);
    setOnboardingMode(mode);
  }, []);

  const finishOnboarding = useCallback((skipped: boolean) => {
    localStorage.setItem('chess-openings-onboarding-status', skipped ? 'skipped' : 'completed');
    setOnboardingMode(null);
    setIsPracticeOpen(false);
  }, []);

  const handleActivateTier = useCallback((tier: PaidPlanTier) => {
    saveStoredPaidPlan(tier);
    setPaidPlanTier(tier);
  }, []);

  const handleUnlockVariation = useCallback((variationId: string): boolean => {
    const variationTarget = openings
      .flatMap((opening) => opening.variations.map((variation, index) => ({ openingId: opening.id, variation, index })))
      .find(({ variation }) => variation.id === variationId);
    const pointCost = variationTarget?.variation.pointUnlockCost || 100;
    if (
      isPremiumUser ||
      !variationTarget ||
      !variationTarget.variation.isPointUnlockable ||
      !isVariationLocked(variationTarget.index, paidPlanTier, isOwner, variationTarget.openingId) ||
      userProfile.unlockedVariationIds.includes(variationId) ||
      userProfile.totalPoints < pointCost
    ) return false;
    setUserProfile((profile) => {
      if (profile.unlockedVariationIds.includes(variationId) || profile.totalPoints < pointCost) return profile;
      const unlockedVariationIds = [...profile.unlockedVariationIds, variationId];
      return {
        ...profile,
        totalPoints: profile.totalPoints - pointCost,
        unlockedVariationIds,
        totalVariationsUnlocked: unlockedVariationIds.length,
      };
    });
    return true;
  }, [isOwner, isPremiumUser, paidPlanTier, userProfile.totalPoints, userProfile.unlockedVariationIds]);

  const handleProceedToPay999FromVariation = useCallback(() => {
    setIsLockedVariationModalOpen(false);
    setPremiumInitialPlan('999');
    setIsPremiumOpen(true);
  }, []);

  const handleProceedToPay699FromVariation = useCallback(() => {
    setIsLockedVariationModalOpen(false);
    setPremiumInitialPlan('699');
    setIsPremiumOpen(true);
  }, []);

  const handleOpenPremiumModal = useCallback((plan: '999' | '699' = '999') => {
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
  const isCurrentVariationLocked = isVariationLocked(currentVariationIndex, paidPlanTier, isOwner, currentOpening.id)
    && !userProfile.unlockedVariationIds.includes(currentVariation.id);
  const canStudyCurrentVariation =
    (!isCurrentOpeningLocked && !isCurrentVariationLocked) ||
    userProfile.unlockedVariationIds.includes(currentVariation.id);

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
    setUserProfile((profile) => profile.learnedOpeningIds.includes(openingId)
      ? profile
      : { ...profile, learnedOpeningIds: [...profile.learnedOpeningIds, openingId] });
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
    setNavigationScreen('variations');
  }, []);

  // When variation changes, reset move index
  const handleSelectVariation = useCallback((variationId: string) => {
    setSelectedVariationId(variationId);
    setUserProfile((profile) => profile.learnedVariationIds.includes(variationId)
      ? profile
      : { ...profile, learnedVariationIds: [...profile.learnedVariationIds, variationId] });
    setActiveRefutation(null);
    setUserDeviation(null);
    setActiveGmGameId(null);
    setGmMoveIndex(-1);
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
  }, []);

  const handleOpenVariation = useCallback((variationId: string) => {
    handleSelectVariation(variationId);
    setNavigationScreen('study');
  }, [handleSelectVariation]);

  const handleLockedVariationClick = useCallback((variation: Variation, _index: number) => {
    if (userProfile.unlockedVariationIds.includes(variation.id)) {
      handleOpenVariation(variation.id);
      return;
    }
    if (!isPremiumUser && userProfile.totalPoints >= (variation.pointUnlockCost || 100)) {
      setIsVariationUnlocksOpen(true);
      return;
    }
    if (isOwner) {
      setSelectedVariationId(variation.id);
      return;
    }
    setLockedVariationTarget(variation);
    setIsLockedVariationModalOpen(true);
  }, [handleOpenVariation, isOwner, isPremiumUser, userProfile.totalPoints, userProfile.unlockedVariationIds]);

  const handleEngineGameCompleted = useCallback((result: 'win' | 'loss' | 'draw') => {
    setUserProfile((profile) => ({
      ...profile,
      engineGames: {
        ...profile.engineGames,
        wins: profile.engineGames.wins + (result === 'win' ? 1 : 0),
        losses: profile.engineGames.losses + (result === 'loss' ? 1 : 0),
        draws: profile.engineGames.draws + (result === 'draw' ? 1 : 0),
      },
    }));
  }, []);

  const handleOnlineGameCompleted = useCallback((result: 'win' | 'loss' | 'draw') => {
    setUserProfile((profile) => ({
      ...profile,
      onlineGames: {
        ...profile.onlineGames,
        wins: profile.onlineGames.wins + (result === 'win' ? 1 : 0),
        losses: profile.onlineGames.losses + (result === 'loss' ? 1 : 0),
        draws: profile.onlineGames.draws + (result === 'draw' ? 1 : 0),
      },
    }));
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

  const handleEnterMainMenu = useCallback(() => {
    window.history.pushState({ chessAppScreen: 'main-menu' }, '', window.location.href);
    setShowOpeningCinematic(false);
    if (!localStorage.getItem('chess-openings-onboarding-status')) {
      setOnboardingMode('tour');
    }
  }, []);

  if (!isLanguageSetupComplete) {
    return <LanguageSetup currentLanguage={language} onContinue={handleLanguageSetupContinue} />;
  }

  if (showOpeningCinematic) {
    return <OpeningCinematic onEnter={handleEnterMainMenu} />;
  }

  return (
    <div data-color-mode={colorMode} className="app-shell min-h-screen text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        flipped={flipped}
        onToggleFlip={() => setFlipped((prev) => !prev)}
        colorMode={colorMode}
        onToggleColorMode={() => setColorMode((mode) => mode === 'dark' ? 'light' : 'dark')}
        boardTheme={boardTheme}
        onChangeBoardTheme={setBoardTheme}
        language={language}
        onChangeLanguage={handleChangeLanguage}
        translationStatus={translationStatus}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPremium={() => handleOpenPremiumModal(paidPlanTier === '999' ? '999' : '699')}
        onOpenPractice={() => setIsPracticeOpen(true)}
        onReplayAppTour={() => startOnboarding('tour')}
        onReplayChessBasics={() => startOnboarding('basics')}
        onOpenChatAi={() => setIsChatAiOpen(true)}
        isPremium={isPremiumUser}
        userTier={paidPlanTier}
        username={userProfile.username}
        avatarDataUrl={userProfile.avatarDataUrl}
        onOpenProfile={() => setIsUserProfileOpen(true)}
      />

      <StreakRewardModal
        reward={dailyReward}
        unlockCredits={Math.floor(userProfile.totalPoints / 100)}
        onClose={() => setDailyReward(null)}
        onUnlockVariations={() => {
          setDailyReward(null);
          setIsVariationUnlocksOpen(true);
        }}
      />

      <VariationUnlockModal
        isOpen={isVariationUnlocksOpen}
        points={userProfile.totalPoints}
        unlockedVariationIds={userProfile.unlockedVariationIds}
        userPlan={paidPlanTier}
        isOwner={isOwner}
        isPremiumUser={isPremiumUser}
        onClose={() => setIsVariationUnlocksOpen(false)}
        onUnlock={handleUnlockVariation}
      />
      {translationStatus && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed right-4 top-16 z-[70] max-w-sm rounded-lg border border-amber-500/35 bg-[#111812]/95 p-3 text-sm text-amber-100 shadow-xl backdrop-blur"
        >
          {translationStatus}
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {navigationScreen === 'home' && (
          <>
            <section aria-label="Featured opening explorer">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Build your repertoire</p>
                  <h1 className="mt-1 text-2xl font-black text-white">Explore Chess Openings</h1>
                  <p className="mt-1 text-sm text-zinc-400">Choose an opening to browse its variations, or view the full library.</p>
                </div>
                <button type="button" onClick={() => setNavigationScreen('openings')} className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-3 text-sm font-extrabold text-zinc-950 shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5 hover:from-amber-300 hover:to-yellow-400">
                  <BookOpen className="h-4 w-4" /> See All Openings <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <OpeningExplorer
                openings={openings}
                selectedOpeningId={selectedOpeningId}
                onSelectOpening={handleSelectOpening}
                sideFilter={sideFilter}
                onSideFilterChange={setSideFilter}
                userPlan={paidPlanTier}
                isOwner={isOwner}
                onOpenPremium={handleOpenPremiumModal}
              />
            </section>
          </>
        )}

        {navigationScreen === 'openings' && (
          <AllOpeningsScreen
            openings={openings}
            userPlan={paidPlanTier}
            isOwner={isOwner}
            onBack={() => setNavigationScreen('home')}
            onSelectOpening={handleSelectOpening}
          />
        )}

        {navigationScreen === 'variations' && (
          <OpeningVariationsScreen
            opening={currentOpening}
            selectedVariationId={selectedVariationId}
            userPlan={paidPlanTier}
            isOwner={isOwner}
            totalPoints={userProfile.totalPoints}
            unlockedVariationIds={userProfile.unlockedVariationIds}
            onBack={() => setNavigationScreen('openings')}
            onOpenVariation={handleOpenVariation}
            onLockedVariationClick={handleLockedVariationClick}
          />
        )}

        {navigationScreen === 'study' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#15171e] p-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">{currentOpening.name} · {currentOpening.ecoCode}</p>
                <h1 className="truncate text-lg font-bold text-white">{currentVariation.name}</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setNavigationScreen('variations')} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-200"><ArrowLeft className="h-3.5 w-3.5" /> Variations</button>
                <button type="button" onClick={() => setNavigationScreen('openings')} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-200"><BookOpen className="h-3.5 w-3.5" /> All Openings</button>
                <button type="button" onClick={() => setNavigationScreen('home')} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-200">Main</button>
              </div>
            </div>
            {isCurrentOpeningLocked && userProfile.unlockedVariationIds.includes(currentVariation.id) && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-100">
                Individual variation unlocked with points. The complete opening and its other variations remain locked.
              </div>
            )}
            {!canStudyCurrentVariation && (
              <div className="flex flex-col gap-3 rounded-xl border border-amber-500/35 bg-gradient-to-r from-[#241e17] via-[#1a1c24] to-[#151720] p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-amber-100"><Lock className="mr-2 inline h-4 w-4" />This variation is locked. Unlock only this line with points, or access it with your subscription.</p>
                <button type="button" onClick={() => {
                  if (userProfile.totalPoints >= (currentVariation.pointUnlockCost || 100)) setIsVariationUnlocksOpen(true);
                  else handleLockedVariationClick(currentVariation, currentVariationIndex);
                }} className="shrink-0 rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-zinc-950 transition hover:bg-amber-300">
                  {userProfile.totalPoints >= (currentVariation.pointUnlockCost || 100) ? `Unlock with ${currentVariation.pointUnlockCost || 100} points` : 'View unlock options'}
                </button>
              </div>
            )}
          </div>
        )}

        {navigationScreen === 'study' && <>
        {/* Grandmaster Showcase & Repertoire Mode Selector */}
        {canStudyCurrentVariation && <GrandmasterShowcaseHeader
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
        />}

        {/* Central Workspace: Interactive Board & Move Explanations Panel */}
        {!canStudyCurrentVariation ? (
          <section aria-label="Locked variation" className="flex min-h-[320px] items-center justify-center rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#1b1c19] via-[#141820] to-[#111713] p-6 text-center shadow-lg">
            <div className="max-w-lg space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/35 bg-amber-500/10 text-amber-300">
                <Lock className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-amber-300">{currentOpening.accessType === 'PREMIUM' ? 'Premium variation' : 'Variation access'}</p>
                <h3 className="text-xl font-bold text-zinc-100">{currentVariation.name}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {isCurrentOpeningLocked
                    ? 'This opening remains reserved. You can unlock only this variation with points; other variations stay locked.'
                    : 'This variation is reserved on your current plan. Unlock this variation with points or choose a plan with access.'}
                </p>
              </div>
              <button type="button" onClick={() => {
                if (userProfile.totalPoints >= (currentVariation.pointUnlockCost || 100)) setIsVariationUnlocksOpen(true);
                else if (currentOpening.accessType === 'PREMIUM') handleOpenPremiumModal('999');
                else handleLockedVariationClick(currentVariation, currentVariationIndex);
              }} className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-400">
                {userProfile.totalPoints >= (currentVariation.pointUnlockCost || 100)
                  ? `Unlock this variation · ${currentVariation.pointUnlockCost || 100} points`
                  : currentOpening.accessType === 'PREMIUM' ? 'Explore Premium Access' : 'View unlock options'}
              </button>
            </div>
          </section>
        ) : (
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

            {onboardingMode && (
              <OnboardingExperience
                initialMode={onboardingMode}
                language={language}
                onFinish={finishOnboarding}
                onOpenPractice={() => setIsPracticeOpen(true)}
                onClosePractice={() => setIsPracticeOpen(false)}
              />
            )}
          </div>
        </section>
        )}
        </>}
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

      {/* Locked Variation Modal (5 variations per opening requiring ₹999/-) */}
      <LockedVariationModal
        isOpen={isLockedVariationModalOpen}
        onClose={() => setIsLockedVariationModalOpen(false)}
        variation={lockedVariationTarget}
        openingName={currentOpening.name}
        requiredPlan={isOpeningLocked(currentOpening.id, '699') ? '999' : '699'}
        onProceedToPay699={handleProceedToPay699FromVariation}
        onProceedToPay999={handleProceedToPay999FromVariation}
      />

      {/* Practice Mode Modal (Stockfish Level 1 to 18 Engine & 200 Puzzles per Variation) */}
      <PracticeModeModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        boardTheme={boardTheme}
        initialOpeningId={currentOpening?.id}
        initialVariationId={currentVariation?.id}
        onEngineGameCompleted={handleEngineGameCompleted}
        onOpenChatAiWithFen={(fen) => {
          setChatAiInitialFen(fen);
          setIsChatAiOpen(true);
        }}
      />

      <UserProfileModal
        isOpen={isUserProfileOpen}
        profile={userProfile}
        onClose={() => setIsUserProfileOpen(false)}
        onSave={setUserProfile}
        onOpenVariationUnlocks={() => setIsVariationUnlocksOpen(true)}
        onStartOnlineGame={() => {
          setIsUserProfileOpen(false);
          setIsOnlineChessGameOpen(true);
        }}
      />

      <OnlineChessGameModal
        isOpen={isOnlineChessGameOpen}
        username={userProfile.username}
        boardTheme={boardTheme}
        onClose={() => setIsOnlineChessGameOpen(false)}
        onGameCompleted={handleOnlineGameCompleted}
      />

      {/* Floating Chat with AI Window */}
      <ChatWithAiWindow
        isOpen={isChatAiOpen}
        onClose={() => setIsChatAiOpen(false)}
        currentOpeningName={currentOpening?.name}
        currentVariationName={currentVariation?.name}
        initialFen={chatAiInitialFen}
        language={language}
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
