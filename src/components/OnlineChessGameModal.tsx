import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, Dices, Eye, EyeOff, LoaderCircle, Swords, TriangleAlert, X } from 'lucide-react';
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
  const payload = await response.json() as T & { error?: string };
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

const STEPS = ['Time control', 'Secret codes', 'Connect'] as const;

const StepHeader: React.FC<{ current: 1 | 2 | 3 }> = ({ current }) => (
  <ol aria-label="Online game setup steps" className="on-scrim mx-auto mb-3 flex w-full max-w-3xl items-center justify-center gap-2 text-xs font-semibold">
    {STEPS.map((label, index) => {
      const number = index + 1;
      const done = number < current;
      const active = number === current;
      return (
        <li key={label} aria-current={active ? 'step' : undefined} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${
          active ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100' : done ? 'border-emerald-500/30 text-emerald-300' : 'border-zinc-700 text-zinc-500'
        }`}>
          {done ? <Check className="h-3 w-3" /> : <span>{number}</span>}
          <span className="hidden sm:inline">{label}</span>
        </li>
      );
    })}
  </ol>
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
    setNotice(`Opponent verified. You are playing ${nextGame.yourColor === 'w' ? 'White' : 'Black'}.`);
  }, []);

  const requestWithToken = useCallback(async <T,>(url: string, method = 'GET', body?: object): Promise<T> => {
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
  }, [savedSession]);

  const cancelPendingMatch = useCallback((token: string | null) => {
    if (!token) return;
    fetch('/api/online-games/match', { method: 'DELETE', headers: { 'x-match-token': token } })
      .catch((cancelError) => console.error('Could not cancel the pending match.', cancelError));
  }, []);

  // Poll the server until the opponent enters the mirrored code pair with the same time control.
  useEffect(() => {
    if (!isOpen || step !== 'waiting' || !matchToken) return;
    let cancelled = false;
    const checkMatch = async () => {
      try {
        const response = await fetch('/api/online-games/match/status', { headers: { 'x-match-token': matchToken } });
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

  // Rematch: the same codes and time control pair up automatically when both players choose this.
  const playAgain = () => {
    endSession();
    setStep('time');
  };

  const startCodeEntry = () => {
    if (!username.trim()) {
      setError('Set a username in your profile before playing online.');
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
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      console.error('Could not copy the player code.', copyError);
      setError('Could not copy the code. Select and copy it manually.');
    }
  };

  const verifyAndConnect = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!CODE_PATTERN.test(playerCode)) {
      setError('Your code must be 4–12 letters or numbers.');
      return;
    }
    if (!CODE_PATTERN.test(opponentCode)) {
      setError('Enter your opponent’s secret code (4–12 letters or numbers).');
      return;
    }
    if (playerCode === opponentCode) {
      setError('Your code and your opponent’s code must be different.');
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
      setError(requestError instanceof Error ? requestError.message : 'Could not connect to your opponent.');
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
      if (action === 'draw-offer') setNotice('Draw offer sent.');
      if (action === 'draw-decline') setNotice('Draw offer withdrawn.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The game action could not be completed.');
    } finally {
      setIsBusy(false);
    }
  };

  if (!isOpen) return null;

  if (step === 'playing') {
    if (!game) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-label="Reconnecting to online game" className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#141916] p-6 text-center">
            <p role="status" className="flex items-center justify-center gap-2 text-sm text-emerald-200"><LoaderCircle className="h-4 w-4 animate-spin" /> Reconnecting to your game…</p>
            {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
            <button type="button" onClick={leaveToMainMenu} className="mt-4 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800">Back to main menu</button>
          </section>
        </div>
      );
    }
    if (view === 'review' && game.status === 'finished') {
      return <OnlineGameReview game={game} boardTheme={boardTheme} onMainMenu={leaveToMainMenu} onPlayAgain={playAgain} />;
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
          <OnlinePostGameDialog game={game} onReview={() => setView('review')} onMainMenu={leaveToMainMenu} onPlayAgain={playAgain} />
        )}
      </>
    );
  }

  if (step === 'time') {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 p-3 backdrop-blur-sm">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center py-3">
          <StepHeader current={1} />
          <p className="on-scrim mx-auto mb-3 max-w-xl text-center text-xs text-zinc-300">Pick the time control for this match. The game only starts if your opponent picks the same one.</p>
          <TimeControlPicker
            isOpen
            inline
            continueLabel="Next: Secret Codes"
            selectedTimeControlId={selectedTimeControlId}
            onSelect={(control) => setSelectedTimeControlId(control.id)}
            onContinue={startCodeEntry}
            onClose={leaveToMainMenu}
            onBack={leaveToMainMenu}
          />
          {error && <p role="alert" className="mt-3 text-center text-sm text-rose-300">{error}</p>}
        </div>
      </div>
    );
  }

  const isMismatch = step === 'waiting' && opponentTimeControlId !== null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="online-chess-title" className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-700 bg-[#141916] p-4 shadow-2xl sm:p-6">
        <StepHeader current={step === 'codes' ? 2 : 3} />
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300"><Swords className="h-4 w-4" /> Online two-player chess</p>
            <h2 id="online-chess-title" className="mt-1 text-xl font-bold text-zinc-100 sm:text-2xl">{step === 'codes' ? 'Enter both secret codes' : 'Verifying your opponent'}</h2>
            <p className="mt-1 text-xs text-zinc-400">Time control: <span className="font-semibold text-zinc-200">{timeControlLabel(selectedTimeControlId)}</span></p>
          </div>
          <button type="button" onClick={leaveToMainMenu} aria-label="Close online game" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        {step === 'codes' && (
          <form onSubmit={verifyAndConnect} className="space-y-4">
            <div>
              <label htmlFor="online-player-code" className="block text-xs font-semibold text-zinc-300">Your code <span className="font-normal text-zinc-500">— share this with your opponent</span></label>
              <div className="mt-1.5 flex gap-2">
                <input id="online-player-code" value={playerCode} onChange={(event) => setPlayerCode(cleanCodeInput(event.target.value))} autoComplete="off" spellCheck={false} maxLength={12} className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-[#0e1210] px-3 py-3 font-mono text-lg tracking-[0.2em] text-zinc-100 outline-none focus:border-emerald-400" />
                <button type="button" onClick={regeneratePlayerCode} aria-label="Generate a new code" title="Generate a new code" className="rounded-lg border border-zinc-700 px-3 text-zinc-300 hover:bg-zinc-800"><Dices className="h-5 w-5" /></button>
                <button type="button" onClick={() => void copyPlayerCode()} aria-label="Copy your code" title="Copy your code" className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 text-amber-200 hover:bg-amber-500/20">{copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}</button>
              </div>
            </div>

            <div>
              <label htmlFor="online-opponent-code" className="block text-xs font-semibold text-zinc-300">Opponent’s secret code <span className="font-normal text-zinc-500">— the code they share with you</span></label>
              <div className="mt-1.5 flex gap-2">
                <input id="online-opponent-code" type={showOpponentCode ? 'text' : 'password'} value={opponentCode} onChange={(event) => setOpponentCode(cleanCodeInput(event.target.value))} autoComplete="off" spellCheck={false} maxLength={12} placeholder="e.g. K7M2QX" className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-[#0e1210] px-3 py-3 font-mono text-lg tracking-[0.2em] text-zinc-100 outline-none focus:border-emerald-400" />
                <button type="button" onClick={() => setShowOpponentCode((value) => !value)} aria-label={showOpponentCode ? 'Hide opponent code' : 'Show opponent code'} className="rounded-lg border border-zinc-700 px-3 text-zinc-300 hover:bg-zinc-800">{showOpponentCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-500">Your opponent enters your code as their opponent’s code, and yours is what you type above. Want a rematch? Use the same codes and time control again.</p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep('time')} className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"><ArrowLeft className="h-4 w-4" /> Time control</button>
              <button type="submit" disabled={isBusy || playerCode.length < 4 || opponentCode.length < 4} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50">
                {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />} Verify &amp; start game
              </button>
            </div>
          </form>
        )}

        {step === 'waiting' && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-zinc-800 bg-black/25 p-2.5">
                <dt className="text-[11px] uppercase tracking-wider text-zinc-500">Your code</dt>
                <dd className="mt-1 font-mono text-base font-bold tracking-widest text-zinc-100">{playerCode}</dd>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-black/25 p-2.5">
                <dt className="text-[11px] uppercase tracking-wider text-zinc-500">Opponent’s code</dt>
                <dd className="mt-1 font-mono text-base font-bold tracking-widest text-zinc-100">{opponentCode}</dd>
              </div>
            </dl>

            {isMismatch ? (
              <div role="alert" className="rounded-xl border border-amber-400/40 bg-amber-950/30 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-amber-100"><TriangleAlert className="h-4 w-4" /> Time controls don’t match</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-100/80">You chose <strong>{timeControlLabel(selectedTimeControlId)}</strong> but your opponent chose <strong>{timeControlLabel(opponentTimeControlId!)}</strong>. Both players must pick the same one before the game can start.</p>
                <button type="button" onClick={changeTimeControl} className="mt-3 w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400">Change my time control</button>
              </div>
            ) : (
              <p role="status" className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-4 text-sm text-emerald-100"><LoaderCircle className="h-4 w-4 animate-spin" /> Waiting for your opponent to enter your code…</p>
            )}

            <button type="button" onClick={editCodes} className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800">Edit codes</button>
          </div>
        )}

        {error && <p role="alert" className="mt-4 text-center text-sm text-rose-300">{error}</p>}
        <p className="mt-5 border-t border-zinc-800 pt-3 text-center text-[11px] leading-relaxed text-zinc-500">
          Codes and match data are held temporarily by this app server. Both devices must be online and connected to the same app server.
        </p>
      </section>
    </div>
  );
};
