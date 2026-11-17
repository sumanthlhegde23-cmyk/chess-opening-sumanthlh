import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, Dices, Eye, EyeOff, KeyRound, LoaderCircle, RefreshCw, ShieldCheck, Swords, TriangleAlert, User, X } from 'lucide-react';
import { TimeControlPicker } from './TimeControlPicker';
import { OnlineGameBoard } from './OnlineGameBoard';
import { OnlineGameReview } from './OnlineGameReview';
import { OnlinePostGameDialog } from './OnlinePostGameDialog';
import { getTimeControl } from '../types/timeControl';
import { getOnlineGameOutcome, OnlineChessGame, OnlineGameAction } from '../types/onlineGame';

interface OnlineChessGameModalProps {
  isOpen: boolean;
  username: string;
  boardTheme: string;
  onClose: () => void;
  onGameCompleted: (result: 'win' | 'loss' | 'draw') => void;
}

interface SavedSession {
  code: string;
  token: string;
}

type SetupStep = 'time' | 'codes' | 'waiting' | 'playing';

type MatchResponse =
  | { matchToken?: string; status: 'waiting' }
  | { matchToken?: string; status: 'mismatch'; opponentTimeControlId: string }
  | { matchToken?: string; status: 'matched'; game: OnlineChessGame };

const SESSION_KEY = 'chess-openings-online-game';
const PLAYER_CODE_KEY = 'chess-openings-online-player-code';
const CODE_PATTERN = /^[A-Z0-9]{4,12}$/;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || 'The online game request failed.');
  return payload;
}

function loadSavedSession(): SavedSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedSession>;
    return typeof parsed.code === 'string' && typeof parsed.token === 'string'
      ? { code: parsed.code, token: parsed.token }
      : null;
  } catch (error) {
    console.error('Could not restore the online game session.', error);
    return null;
  }
}

function saveSession(session: SavedSession | null): void {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Could not store the online game session.', error);
  }
}

function loadCompletedGameId(): string | null {
  try {
    return sessionStorage.getItem(`${SESSION_KEY}:completed`);
  } catch (error) {
    console.error('Could not restore online game completion state.', error);
    return null;
  }
}

function generateSecretCode(): string {
  const values = new Uint32Array(6);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('');
}

function loadPlayerCode(): string {
  try {
    const stored = localStorage.getItem(PLAYER_CODE_KEY);
    if (stored && CODE_PATTERN.test(stored)) return stored;
  } catch (error) {
    console.error('Could not restore the player code.', error);
  }
  return generateSecretCode();
}

function savePlayerCode(code: string): void {
  try {
    localStorage.setItem(PLAYER_CODE_KEY, code);
  } catch (error) {
    console.error('Could not store the player code.', error);
  }
}

const cleanCodeInput = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

const STEPS = [
  { id: 1, label: 'Time Control', desc: 'Sync timers' },
  { id: 2, label: 'Dual Secret Codes', desc: 'Our code & Opponent code' },
  { id: 3, label: 'Verification & Match', desc: 'Handshake & Launch' },
] as const;

const StepHeader: React.FC<{ current: 1 | 2 | 3 }> = ({ current }) => (
  <nav aria-label="Online game setup steps" className="mx-auto mb-4 w-full max-w-xl">
    <ol className="flex items-center justify-between gap-1 sm:gap-2">
      {STEPS.map((stepItem) => {
        const done = stepItem.id < current;
        const active = stepItem.id === current;
        return (
          <li
            key={stepItem.id}
            aria-current={active ? 'step' : undefined}
            className={`flex flex-1 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 transition-all sm:gap-2 sm:px-3 sm:py-2 ${
              active
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold shadow-sm'
                : done
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-zinc-700/60 bg-black/20 text-zinc-400'
            }`}
            style={{
              borderColor: active ? undefined : 'var(--border-color, #3f3f46)',
              color: active ? undefined : 'var(--text-color-muted, #94a3b8)',
            }}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                active
                  ? 'bg-emerald-500 text-zinc-950'
                  : done
                  ? 'bg-emerald-500/30 text-emerald-300'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {done ? <Check className="h-3 w-3 stroke-[3]" /> : stepItem.id}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{stepItem.label}</p>
            </div>
          </li>
        );
      })}
    </ol>
  </nav>
);

export const OnlineChessGameModal: React.FC<OnlineChessGameModalProps> = ({
  isOpen,
  username,
  boardTheme,
  onClose,
  onGameCompleted,
}) => {
  const [game, setGame] = useState<OnlineChessGame | null>(null);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(() => loadSavedSession());
  const [step, setStep] = useState<SetupStep>(() => (loadSavedSession() ? 'playing' : 'time'));
  const [view, setView] = useState<'board' | 'review'>('board');
  const [selectedTimeControlId, setSelectedTimeControlId] = useState('blitz-5-0');
  const [playerCode, setPlayerCode] = useState(() => loadPlayerCode());
  const [opponentCode, setOpponentCode] = useState('');
  const [showOpponentCode, setShowOpponentCode] = useState(false);
  const [matchToken, setMatchToken] = useState<string | null>(null);
  const [opponentTimeControlId, setOpponentTimeControlId] = useState<string | null>(null);
  const [displayClock, setDisplayClock] = useState<{ w: number; b: number } | null>(null);
  const [clockReceivedAt, setClockReceivedAt] = useState(Date.now());
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const completionRef = useRef<string | null>(loadCompletedGameId());

  // Reset to Step 1 when opened without an ongoing game
  useEffect(() => {
    if (isOpen && !game && !savedSession && step !== 'time') {
      setStep('time');
    }
  }, [isOpen, game, savedSession, step]);

  const timeControlLabel = (id: string) => {
    const control = getTimeControl(id);
    return control.minutes === null ? 'No time control' : `${control.minutes} min${control.incrementSeconds ? ` + ${control.incrementSeconds}s` : ''}`;
  };

  const applyGame = useCallback((nextGame: OnlineChessGame) => {
    if (!nextGame.token) throw new Error('The game server did not issue a player session token.');
    const session = { code: nextGame.code, token: nextGame.token };
    setGame(nextGame);
    setDisplayClock(nextGame.remainingMs);
    setClockReceivedAt(Date.now());
    setSavedSession(session);
    saveSession(session);
    completionRef.current = null;
    try {
      sessionStorage.removeItem(`${SESSION_KEY}:completed`);
    } catch (storageError) {
      console.error('Could not reset online game completion state.', storageError);
    }
    setView('board');
    setStep('playing');
    setMatchToken(null);
    setNotice(`Opponent verified! You are playing ${nextGame.yourColor === 'w' ? 'White' : 'Black'}.`);
  }, []);

  const requestWithToken = useCallback(
    async <T,>(url: string, method = 'GET', body?: object): Promise<T> => {
      if (!savedSession) throw new Error('Start a new online game first.');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-game-token': savedSession.token,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return readApiResponse<T>(response);
    },
    [savedSession]
  );

  const cancelPendingMatch = useCallback((token: string | null) => {
    if (!token) return;
    fetch('/api/online-games/match', { method: 'DELETE', headers: { 'x-match-token': token } }).catch(
      (cancelError) => console.error('Could not cancel the pending match.', cancelError)
    );
  }, []);

  // Poll match status in Step 3 until opponent enters mirrored code pair with synchronized time control
  useEffect(() => {
    if (!isOpen || step !== 'waiting' || !matchToken) return;
    let cancelled = false;
    const checkMatch = async () => {
      try {
        const response = await fetch('/api/online-games/match/status', {
          headers: { 'x-match-token': matchToken },
        });
        const result = await readApiResponse<MatchResponse>(response);
        if (cancelled) return;
        if (result.status === 'matched') {
          applyGame(result.game);
        } else {
          setOpponentTimeControlId(result.status === 'mismatch' ? result.opponentTimeControlId : null);
        }
      } catch (requestError) {
        if (cancelled) return;
        setMatchToken(null);
        setStep('codes');
        setError(requestError instanceof Error ? requestError.message : 'Lost connection while waiting for your opponent.');
      }
    };
    const timer = window.setInterval(() => void checkMatch(), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isOpen, step, matchToken, applyGame]);

  const isFinished = game?.status === 'finished';

  // Game update polling
  useEffect(() => {
    if (!isOpen || !savedSession || isFinished) return;
    let cancelled = false;
    const refreshGame = async () => {
      try {
        const nextGame = await requestWithToken<OnlineChessGame>(`/api/online-games/${savedSession.code}`);
        if (!cancelled) {
          setGame(nextGame);
          setDisplayClock(nextGame.remainingMs);
          setClockReceivedAt(Date.now());
          setError(null);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Could not refresh this game.');
      }
    };
    void refreshGame();
    const timer = window.setInterval(() => void refreshGame(), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isOpen, savedSession, isFinished, requestWithToken]);

  // Clock tick
  useEffect(() => {
    if (!game || game.status !== 'playing' || game.remainingMs === null) return;
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - clockReceivedAt;
      const next = { ...game.remainingMs! };
      next[game.currentTurn] = Math.max(0, game.remainingMs![game.currentTurn] - elapsed);
      setDisplayClock(next);
    }, 100);
    return () => window.clearInterval(timer);
  }, [game, clockReceivedAt]);

  // Completion notification
  useEffect(() => {
    if (!game || game.status !== 'finished' || !game.result) return;
    const gameId = `${game.code}:${game.moves.length}:${game.result}`;
    if (completionRef.current === gameId) return;
    completionRef.current = gameId;
    try {
      sessionStorage.setItem(`${SESSION_KEY}:completed`, gameId);
    } catch (storageError) {
      console.error('Could not save online game completion state.', storageError);
    }
    const outcome = getOnlineGameOutcome(game);
    if (outcome) onGameCompleted(outcome);
  }, [game, onGameCompleted]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const endSession = useCallback(() => {
    saveSession(null);
    try {
      sessionStorage.removeItem(`${SESSION_KEY}:completed`);
    } catch (storageError) {
      console.error('Could not clear online game completion state.', storageError);
    }
    completionRef.current = null;
    setSavedSession(null);
    setGame(null);
    setDisplayClock(null);
    setView('board');
    setMatchToken(null);
    setOpponentTimeControlId(null);
    setError(null);
    setNotice(null);
  }, []);

  const leaveToMainMenu = () => {
    cancelPendingMatch(matchToken);
    endSession();
    setStep('time');
    setOpponentCode('');
    onClose();
  };

  const playAgain = () => {
    endSession();
    setStep('time');
  };

  const startCodeEntry = () => {
    if (!username.trim()) {
      setError('Save a username in your profile before playing online.');
      return;
    }
    setError(null);
    setStep('codes');
  };

  const regeneratePlayerCode = () => {
    const code = generateSecretCode();
    setPlayerCode(code);
    savePlayerCode(code);
  };

  const copyPlayerCode = async () => {
    try {
      await navigator.clipboard.writeText(playerCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.error('Could not copy the player code.', copyError);
      setError('Could not copy automatically. Select and copy your code manually.');
    }
  };

  const verifyAndConnect = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!CODE_PATTERN.test(playerCode)) {
      setError('Our / Player code must be 4–12 letters or numbers.');
      return;
    }
    if (!CODE_PATTERN.test(opponentCode)) {
      setError("Please enter your opponent's secret code (4–12 letters or numbers).");
      return;
    }
    if (playerCode === opponentCode) {
      setError("Our code and Opponent's secret code must be different.");
      return;
    }
    setIsBusy(true);
    setError(null);
    savePlayerCode(playerCode);
    try {
      const response = await fetch('/api/online-games/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, timeControlId: selectedTimeControlId, playerCode, opponentCode }),
      });
      const result = await readApiResponse<MatchResponse>(response);
      if (result.status === 'matched') {
        applyGame(result.game);
      } else {
        setMatchToken(result.matchToken ?? null);
        setOpponentTimeControlId(result.status === 'mismatch' ? result.opponentTimeControlId : null);
        setStep('waiting');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not connect to online match server.');
    } finally {
      setIsBusy(false);
    }
  };

  // One-click synchronization when opponent picked a different time control
  const syncWithOpponentTimeControl = async () => {
    if (!opponentTimeControlId) return;
    setIsBusy(true);
    setError(null);
    cancelPendingMatch(matchToken);
    const targetTimeControlId = opponentTimeControlId;
    setSelectedTimeControlId(targetTimeControlId);
    try {
      const response = await fetch('/api/online-games/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          timeControlId: targetTimeControlId,
          playerCode,
          opponentCode,
        }),
      });
      const result = await readApiResponse<MatchResponse>(response);
      if (result.status === 'matched') {
        applyGame(result.game);
      } else {
        setMatchToken(result.matchToken ?? null);
        setOpponentTimeControlId(result.status === 'mismatch' ? result.opponentTimeControlId : null);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not synchronize time control.');
    } finally {
      setIsBusy(false);
    }
  };

  const editCodes = () => {
    cancelPendingMatch(matchToken);
    setMatchToken(null);
    setOpponentTimeControlId(null);
    setStep('codes');
  };

  const changeTimeControl = () => {
    cancelPendingMatch(matchToken);
    setMatchToken(null);
    setOpponentTimeControlId(null);
    setStep('time');
  };

  const sendMove = async (_from: string, _to: string, san: string) => {
    if (!game || game.status !== 'playing' || game.currentTurn !== game.yourColor || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      const updated = await requestWithToken<OnlineChessGame>(`/api/online-games/${game.code}/move`, 'POST', { san });
      setGame(updated);
      setDisplayClock(updated.remainingMs);
      setClockReceivedAt(Date.now());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The move could not be sent.');
    } finally {
      setIsBusy(false);
    }
  };

  const sendAction = async (action: OnlineGameAction) => {
    if (!game || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      const updated = await requestWithToken<OnlineChessGame>(`/api/online-games/${game.code}/action`, 'POST', { action });
      setGame(updated);
      setDisplayClock(updated.remainingMs);
      setClockReceivedAt(Date.now());
      if (action === 'draw-offer') setNotice('Draw offer sent to opponent.');
      if (action === 'draw-decline') setNotice('Draw offer declined.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The game action could not be completed.');
    } finally {
      setIsBusy(false);
    }
  };

  if (!isOpen) return null;

  // STEP 4 / ACTIVE PLAYING OR REVIEW
  if (step === 'playing') {
    if (!game) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Reconnecting to online game"
            className="w-full max-w-sm rounded-2xl border p-6 text-center shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-surface, #181a20)',
              borderColor: 'var(--border-color, #27272a)',
              color: 'var(--text-color, #f4f4f5)',
            }}
          >
            <p role="status" className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Reconnecting to your online game…
            </p>
            {error && <p role="alert" className="mt-3 text-sm text-rose-400">{error}</p>}
            <button
              type="button"
              onClick={leaveToMainMenu}
              className="mt-4 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:opacity-90"
              style={{
                backgroundColor: 'var(--bg-card-subtle, #27272a)',
                borderColor: 'var(--border-color, #3f3f46)',
                color: 'var(--text-color, #f4f4f5)',
              }}
            >
              Back to Main Menu
            </button>
          </section>
        </div>
      );
    }

    if (view === 'review' && game.status === 'finished') {
      return (
        <OnlineGameReview
          game={game}
          boardTheme={boardTheme}
          onMainMenu={leaveToMainMenu}
          onPlayAgain={playAgain}
        />
      );
    }

    return (
      <>
        <OnlineGameBoard
          game={game}
          boardTheme={boardTheme}
          displayClock={game.remainingMs ? displayClock : null}
          isBusy={isBusy}
          notice={notice}
          error={error}
          onMove={sendMove}
          onAction={(action) => void sendAction(action)}
        />
        {game.status === 'finished' && (
          <OnlinePostGameDialog
            game={game}
            onReview={() => setView('review')}
            onMainMenu={leaveToMainMenu}
            onPlayAgain={playAgain}
          />
        )}
      </>
    );
  }

  // STEP 1: TIME CONTROL SELECTION (Must be completed first before asking for any codes)
  if (step === 'time') {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 p-3 backdrop-blur-sm">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center py-4">
          <StepHeader current={1} />

          <div
            className="mx-auto mb-3 w-full max-w-xl rounded-xl border p-3 text-center text-xs"
            style={{
              backgroundColor: 'var(--bg-card-subtle, #181a20)',
              borderColor: 'var(--border-color, #27272a)',
              color: 'var(--text-color-muted, #a1a1aa)',
            }}
          >
            <span className="font-bold text-emerald-400">Step 1: Time Control Selection.</span>{' '}
            Select your desired time control. Both players must choose the same time control for the match to begin.
          </div>

          <TimeControlPicker
            isOpen
            inline
            continueLabel="Next: Dual Secret Codes"
            selectedTimeControlId={selectedTimeControlId}
            onSelect={(control) => setSelectedTimeControlId(control.id)}
            onContinue={startCodeEntry}
            onClose={leaveToMainMenu}
            onBack={leaveToMainMenu}
          />
          {error && <p role="alert" className="mt-3 text-center text-sm font-semibold text-rose-400">{error}</p>}
        </div>
      </div>
    );
  }

  const isMismatch = step === 'waiting' && opponentTimeControlId !== null;

  // STEPS 2 & 3: DUAL CODE INPUT & VERIFICATION
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="online-chess-title"
        className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-2xl border p-4 shadow-2xl sm:p-6"
        style={{
          backgroundColor: 'var(--bg-surface, #141916)',
          borderColor: 'var(--border-color, #27272a)',
          color: 'var(--text-color, #f4f4f5)',
        }}
      >
        <StepHeader current={step === 'codes' ? 2 : 3} />

        {/* Modal Header */}
        <div className="mb-4 flex items-start justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--border-color, #27272a)' }}>
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
              <Swords className="h-4 w-4" /> Peer-to-Peer Online Match
            </p>
            <h2 id="online-chess-title" className="mt-1 text-xl font-bold sm:text-2xl" style={{ color: 'var(--text-color, #f4f4f5)' }}>
              {step === 'codes' ? 'Dual Code Setup' : 'Verifying & Synchronizing Match'}
            </h2>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-card-subtle, #1c211e)',
                  borderColor: 'var(--border-color, #3f3f46)',
                  color: 'var(--text-color, #f4f4f5)',
                }}
              >
                Time Control: <strong className="text-emerald-400">{timeControlLabel(selectedTimeControlId)}</strong>
              </span>
              {step === 'codes' && (
                <button
                  type="button"
                  onClick={() => setStep('time')}
                  className="text-xs text-sky-400 underline hover:text-sky-300"
                >
                  Change
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={leaveToMainMenu}
            aria-label="Close online game setup"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 2: DUAL CODE INPUT */}
        {step === 'codes' && (
          <form onSubmit={verifyAndConnect} className="space-y-4">
            {/* Card 1: Our / Player's Code */}
            <div
              className="rounded-xl border p-4 shadow-sm"
              style={{
                backgroundColor: 'var(--bg-card-subtle, #0e1210)',
                borderColor: 'var(--border-color, #27272a)',
              }}
            >
              <div className="flex items-center justify-between">
                <label htmlFor="online-player-code" className="flex items-center gap-2 text-xs font-bold tracking-wide text-emerald-400">
                  <User className="h-4 w-4" /> 1. Our / Player's Code (Your Identifier)
                </label>
                <span className="text-[11px] text-zinc-400">Share with opponent</span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                Give this secret code to your friend. They must type it as their Opponent's Code.
              </p>
              <div className="mt-2.5 flex gap-2">
                <input
                  id="online-player-code"
                  value={playerCode}
                  onChange={(event) => setPlayerCode(cleanCodeInput(event.target.value))}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={12}
                  className="min-w-0 flex-1 rounded-xl border px-3.5 py-2.5 font-mono text-lg font-bold tracking-[0.25em] outline-none transition focus:border-emerald-400"
                  style={{
                    backgroundColor: 'var(--bg-surface, #141916)',
                    borderColor: 'var(--border-color, #3f3f46)',
                    color: 'var(--text-color, #f4f4f5)',
                  }}
                />
                <button
                  type="button"
                  onClick={regeneratePlayerCode}
                  aria-label="Generate new code"
                  title="Generate a new code"
                  className="inline-flex items-center justify-center rounded-xl border px-3 text-zinc-300 hover:bg-zinc-800/80 transition"
                  style={{ borderColor: 'var(--border-color, #3f3f46)' }}
                >
                  <Dices className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => void copyPlayerCode()}
                  aria-label="Copy your code"
                  title="Copy your code"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="hidden sm:inline text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Opponent's Secret Code */}
            <div
              className="rounded-xl border p-4 shadow-sm"
              style={{
                backgroundColor: 'var(--bg-card-subtle, #0e1210)',
                borderColor: 'var(--border-color, #27272a)',
              }}
            >
              <div className="flex items-center justify-between">
                <label htmlFor="online-opponent-code" className="flex items-center gap-2 text-xs font-bold tracking-wide text-sky-400">
                  <KeyRound className="h-4 w-4" /> 2. Opponent's Secret Code
                </label>
                <span className="text-[11px] text-zinc-400">Required</span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                Enter the secret code provided by your opponent to pair your devices.
              </p>
              <div className="mt-2.5 flex gap-2">
                <input
                  id="online-opponent-code"
                  type={showOpponentCode ? 'text' : 'password'}
                  value={opponentCode}
                  onChange={(event) => setOpponentCode(cleanCodeInput(event.target.value))}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={12}
                  placeholder="e.g. K7M2QX"
                  className="min-w-0 flex-1 rounded-xl border px-3.5 py-2.5 font-mono text-lg font-bold tracking-[0.25em] outline-none transition focus:border-sky-400"
                  style={{
                    backgroundColor: 'var(--bg-surface, #141916)',
                    borderColor: 'var(--border-color, #3f3f46)',
                    color: 'var(--text-color, #f4f4f5)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOpponentCode((value) => !value)}
                  aria-label={showOpponentCode ? 'Hide opponent code' : 'Show opponent code'}
                  title={showOpponentCode ? 'Hide opponent code' : 'Show opponent code'}
                  className="inline-flex items-center justify-center rounded-xl border px-3 text-zinc-300 hover:bg-zinc-800/80 transition"
                  style={{ borderColor: 'var(--border-color, #3f3f46)' }}
                >
                  {showOpponentCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Handshake Explainer */}
            <div
              className="rounded-xl border p-3 text-xs leading-relaxed"
              style={{
                backgroundColor: 'var(--bg-card-subtle, #141916)',
                borderColor: 'var(--border-color, #27272a)',
                color: 'var(--text-color-muted, #a1a1aa)',
              }}
            >
              <p className="font-semibold text-emerald-400">Handshake Requirement:</p>
              <p className="mt-0.5">
                Both players must enter each other's codes and choose matching time controls. As soon as both sides confirm, the dedicated game board launches automatically.
              </p>
            </div>

            {/* Navigation & Submit Buttons */}
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setStep('time')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:opacity-90 transition"
                style={{
                  backgroundColor: 'var(--bg-card-subtle, #181a20)',
                  borderColor: 'var(--border-color, #3f3f46)',
                  color: 'var(--text-color, #f4f4f5)',
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Change Time Control
              </button>
              <button
                id="btn-verify-start-game"
                type="submit"
                disabled={isBusy || playerCode.length < 4 || opponentCode.length < 4}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-black text-zinc-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 transition cursor-pointer"
              >
                {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
                Verify &amp; Start Game
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: VERIFICATION & MATCH INITIATION */}
        {step === 'waiting' && (
          <div className="space-y-4">
            {/* Dual Codes Summary */}
            <dl className="grid grid-cols-2 gap-3 text-center">
              <div
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: 'var(--bg-card-subtle, #0e1210)',
                  borderColor: 'var(--border-color, #27272a)',
                }}
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Our Code</dt>
                <dd className="mt-1 font-mono text-base font-extrabold tracking-widest text-zinc-100">{playerCode}</dd>
              </div>
              <div
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: 'var(--bg-card-subtle, #0e1210)',
                  borderColor: 'var(--border-color, #27272a)',
                }}
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Opponent's Code</dt>
                <dd className="mt-1 font-mono text-base font-extrabold tracking-widest text-zinc-100">{opponentCode}</dd>
              </div>
            </dl>

            {/* Time Control Status */}
            {isMismatch ? (
              <div role="alert" className="rounded-xl border border-amber-400/50 bg-amber-950/30 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-amber-200">
                  <TriangleAlert className="h-5 w-5 text-amber-400" /> Time Controls Do Not Match
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-100/90">
                  You selected <strong>{timeControlLabel(selectedTimeControlId)}</strong>, but your opponent selected{' '}
                  <strong className="text-amber-300">{timeControlLabel(opponentTimeControlId!)}</strong>.
                  Both players must agree on the same time control to start.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    id="btn-sync-time-control"
                    type="button"
                    disabled={isBusy}
                    onClick={() => void syncWithOpponentTimeControl()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-zinc-950 hover:bg-amber-400 disabled:opacity-50 transition cursor-pointer shadow-md"
                  >
                    <RefreshCw className={`h-4 w-4 ${isBusy ? 'animate-spin' : ''}`} />
                    Sync to Opponent's Time Control ({timeControlLabel(opponentTimeControlId!)})
                  </button>
                  <button
                    type="button"
                    onClick={changeTimeControl}
                    className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
                  >
                    Change My Time Control Manually
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="status"
                className="flex flex-col items-center justify-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-300">
                    Verifying Codes &amp; Synchronizing Match…
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Waiting for your opponent to submit your code with matching time control ({timeControlLabel(selectedTimeControlId)}).
                  </p>
                </div>
              </div>
            )}

            {/* Back / Edit Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={editCodes}
                className="rounded-xl border px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition"
                style={{
                  backgroundColor: 'var(--bg-card-subtle, #181a20)',
                  borderColor: 'var(--border-color, #3f3f46)',
                  color: 'var(--text-color, #f4f4f5)',
                }}
              >
                Edit Secret Codes
              </button>
              <button
                type="button"
                onClick={leaveToMainMenu}
                className="rounded-xl border px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition"
                style={{
                  backgroundColor: 'var(--bg-card-subtle, #181a20)',
                  borderColor: 'var(--border-color, #3f3f46)',
                  color: 'var(--text-color, #f4f4f5)',
                }}
              >
                Cancel &amp; Exit
              </button>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-rose-500/10 p-2.5 text-center text-xs font-semibold text-rose-400">
            {error}
          </p>
        )}

        <div className="mt-5 border-t pt-3 text-center text-[11px] text-zinc-500" style={{ borderColor: 'var(--border-color, #27272a)' }}>
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Peer handshake verified securely. Codes and clock synchronization are managed in real time.
          </p>
        </div>
      </section>
    </div>
  );
};
