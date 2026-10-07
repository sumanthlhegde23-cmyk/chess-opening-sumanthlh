import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Copy, Flag, Handshake, LoaderCircle, RotateCcw, Swords, X } from 'lucide-react';
import { Chessboard } from './Chessboard';
import { TimeControlPicker } from './TimeControlPicker';
import { analyzePositionStockfish18, explainPlayedMove, EngineAnalysisResult, MoveExplanationItem } from '../utils/stockfishService';
import { formatClock, getTimeControl } from '../types/timeControl';

interface OnlineChessGame {
  code: string;
  token?: string;
  yourColor: 'w' | 'b';
  opponentName: string | null;
  hostName: string;
  guestName: string | null;
  moves: string[];
  fen: string;
  status: 'waiting' | 'playing' | 'finished';
  currentTurn: 'w' | 'b';
  drawOfferBy: 'w' | 'b' | null;
  result: '1-0' | '0-1' | '1/2-1/2' | null;
  termination: string | null;
  pgn: string;
  timeControlId: string;
  remainingMs: { w: number; b: number } | null;
  serverNow: number;
}

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

const SESSION_KEY = 'chess-openings-online-game';

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

export const OnlineChessGameModal: React.FC<OnlineChessGameModalProps> = ({
  isOpen,
  username,
  boardTheme,
  onClose,
  onGameCompleted,
}) => {
  const [game, setGame] = useState<OnlineChessGame | null>(null);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(() => loadSavedSession());
  const [gameCode, setGameCode] = useState('');
  const [isTimeControlPickerOpen, setIsTimeControlPickerOpen] = useState(false);
  const [selectedTimeControlId, setSelectedTimeControlId] = useState('blitz-5-0');
  const [displayClock, setDisplayClock] = useState<{ w: number; b: number } | null>(null);
  const [clockReceivedAt, setClockReceivedAt] = useState(Date.now());
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAnalysisPrompt, setShowAnalysisPrompt] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<EngineAnalysisResult | null>(null);
  const [moveExplanations, setMoveExplanations] = useState<MoveExplanationItem[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const completionRef = useRef<string | null>(loadCompletedGameId());
  const promptGameRef = useRef<string | null>(null);

  const applyGame = useCallback((nextGame: OnlineChessGame) => {
    setGame(nextGame);
    if (!nextGame.token) throw new Error('The game server did not issue a player session token.');
    const session = { code: nextGame.code, token: nextGame.token };
    setSavedSession(session);
    saveSession(session);
    completionRef.current = null;
    promptGameRef.current = null;
    try {
      sessionStorage.removeItem(`${SESSION_KEY}:completed`);
    } catch (error) {
      console.error('Could not reset online game completion state.', error);
    }
  }, []);

  const requestWithToken = useCallback(async <T,>(url: string, method = 'GET', body?: object): Promise<T> => {
    if (!savedSession) throw new Error('Create a new game or join with a game code.');
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

  useEffect(() => {
    if (!isOpen || !savedSession) return;
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
  }, [isOpen, savedSession, requestWithToken]);

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
    if (promptGameRef.current !== gameId) {
      promptGameRef.current = gameId;
      setShowAnalysisPrompt(true);
    }
    if (completionRef.current !== gameId) {
      completionRef.current = gameId;
      try {
        sessionStorage.setItem(`${SESSION_KEY}:completed`, gameId);
      } catch (error) {
        console.error('Could not save online game completion state.', error);
      }
      const didWin = (game.result === '1-0' && game.yourColor === 'w') || (game.result === '0-1' && game.yourColor === 'b');
      onGameCompleted(game.result === '1/2-1/2' ? 'draw' : didWin ? 'win' : 'loss');
    }
  }, [game, onGameCompleted]);

  const openTimeControlPicker = () => {
    if (!username.trim()) {
      setError('Set a username in your profile before creating a game.');
      return;
    }
    setError(null);
    setIsTimeControlPickerOpen(true);
  };

  const createGame = async (timeControlId: string) => {
    setIsBusy(true);
    setError(null);
    setIsTimeControlPickerOpen(false);
    try {
      const response = await fetch('/api/online-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, timeControlId }),
      });
      const created = await readApiResponse<OnlineChessGame>(response);
      if (!created.token) throw new Error('The game server did not issue a player session token.');
      applyGame(created);
      setDisplayClock(created.remainingMs);
      setClockReceivedAt(Date.now());
      setNotice('Share this code with your opponent. The game begins when they join.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create the game.');
    } finally {
      setIsBusy(false);
    }
  };

  const joinGame = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim()) {
      setError('Set a username in your profile before joining a game.');
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      const code = gameCode.trim().toUpperCase();
      const response = await fetch(`/api/online-games/${encodeURIComponent(code)}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const joined = await readApiResponse<OnlineChessGame>(response);
      if (!joined.token) throw new Error('The game server did not issue a player session token.');
      applyGame(joined);
      setDisplayClock(joined.remainingMs);
      setClockReceivedAt(Date.now());
      setNotice('Game joined. You are playing Black.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not join the game.');
    } finally {
      setIsBusy(false);
    }
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

  const sendAction = async (action: 'resign' | 'draw-offer' | 'draw-accept' | 'draw-decline' | 'draw-reject') => {
    if (!game || isBusy) return;
    if (action === 'resign' && !window.confirm('Resign this game?')) return;
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

  const copyGameCode = async () => {
    if (!game) return;
    try {
      await navigator.clipboard.writeText(game.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      console.error('Could not copy the online game code.', copyError);
      setError('Could not copy the code. Select and copy it manually.');
    }
  };

  const startNewGame = () => {
    saveSession(null);
    try {
      sessionStorage.removeItem(`${SESSION_KEY}:completed`);
    } catch (storageError) {
      console.error('Could not clear online game completion state.', storageError);
    }
    setSavedSession(null);
    setGame(null);
    setGameCode('');
    setError(null);
    setNotice(null);
    setShowAnalysisPrompt(false);
    setAnalysis(null);
    setMoveExplanations([]);
    setAnalysisError(null);
    setDisplayClock(null);
    completionRef.current = null;
    promptGameRef.current = null;
  };

  const analyzeGame = async () => {
    if (!game) return;
    setShowAnalysisPrompt(false);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    setMoveExplanations([]);
    try {
      const chess = new Chess();
      const explanations: MoveExplanationItem[] = [];
      for (const san of game.moves) {
        const explanation = explainPlayedMove(chess.fen(), san);
        if (explanation) explanations.push(explanation);
        chess.move(san);
      }
      const result = await analyzePositionStockfish18(chess.fen());
      setMoveExplanations(explanations);
      setAnalysis(result);
    } catch (analysisRequestError) {
      setAnalysisError(analysisRequestError instanceof Error ? analysisRequestError.message : 'Could not analyze this game.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const isYourTurn = game?.status === 'playing' && game.currentTurn === game.yourColor;
  const drawOfferedByOpponent = !!game?.drawOfferBy && game.drawOfferBy !== game.yourColor;
  const resultText = game?.result === '1/2-1/2'
    ? 'Draw agreed'
    : game?.result
      ? ((game.result === '1-0' && game.yourColor === 'w') || (game.result === '0-1' && game.yourColor === 'b'))
        ? 'You won!'
        : 'Your opponent won'
      : '';
  const gameTimeControl = game ? getTimeControl(game.timeControlId) : null;
  const shownClock = game?.remainingMs && displayClock
    ? {
        ...displayClock,
        [game.currentTurn]: Math.max(0, displayClock[game.currentTurn]),
      }
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="online-chess-title" className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-700 bg-[#141916] p-4 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300"><Swords className="h-4 w-4" /> Online two-player chess</p>
            <h2 id="online-chess-title" className="mt-1 text-xl font-bold text-zinc-100 sm:text-2xl">Play a friend</h2>
            <p className="mt-1 text-xs text-zinc-400">Connect through a private game code on this app’s server. Bluetooth is not used.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close online game" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        {!game && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-4">
              <h3 className="font-bold text-zinc-100">Create a game</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">You play White. Share the generated six-character code with your opponent.</p>
              <button type="button" onClick={openTimeControlPicker} disabled={isBusy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50">
                {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />} Create game
              </button>
            </div>
            <form onSubmit={joinGame} className="rounded-xl border border-zinc-800 bg-black/20 p-4">
              <h3 className="font-bold text-zinc-100">Join a game</h3>
              <label htmlFor="online-game-code" className="mt-3 block text-xs font-semibold text-zinc-300">Opponent’s game code</label>
              <input id="online-game-code" value={gameCode} onChange={(event) => setGameCode(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 6))} maxLength={6} placeholder="e.g. 7C2A91" className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-[#0e1210] px-3 py-3 font-mono text-lg tracking-[0.2em] text-zinc-100 outline-none focus:border-emerald-400" />
              <button type="submit" disabled={isBusy || gameCode.length !== 6} className="mt-3 w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50">Join as Black</button>
            </form>
          </div>
        )}

        {game && (
          <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-800 bg-black/20 p-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{game.status === 'waiting' ? 'Waiting for opponent' : game.status === 'finished' ? 'Game finished' : isYourTurn ? 'Your turn' : 'Opponent’s turn'}</p>
                <p className="mt-1 text-sm font-bold text-zinc-100">{game.hostName} (White) <span className="font-normal text-zinc-500">vs</span> {game.guestName || 'Waiting…'} (Black)</p>
                {gameTimeControl && <p className="mt-1 text-[11px] text-zinc-500">{gameTimeControl.label === 'Unlimited' ? 'No Time Control' : `${gameTimeControl.label} · ${gameTimeControl.minutes} min${gameTimeControl.incrementSeconds ? ` + ${gameTimeControl.incrementSeconds}s` : ''}`}</p>}
              </div>
              {game.status === 'waiting' && (
                <button type="button" onClick={copyGameCode} className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 font-mono text-lg font-bold tracking-widest text-amber-200">
                  {game.code}<Copy className="h-4 w-4" />
                  <span className="font-sans text-xs tracking-normal">{copied ? 'Copied' : 'Copy code'}</span>
                </button>
              )}
              {game.status !== 'waiting' && <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">You are {game.yourColor === 'w' ? 'White' : 'Black'}</span>}
            </div>

            {shownClock && (
              <div className="mx-auto grid w-full max-w-[min(78vh,620px)] grid-cols-2 gap-2">
                {(['b', 'w'] as const).map((color) => (
                  <div key={color} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                    game.currentTurn === color && game.status === 'playing'
                      ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100'
                      : 'border-zinc-800 bg-black/20 text-zinc-300'
                  }`}>
                    <span className="text-xs font-semibold">{color === game.yourColor ? 'You' : game.status === 'waiting' ? (color === 'w' ? game.hostName : 'Opponent') : game.opponentName} ({color === 'w' ? 'White' : 'Black'})</span>
                    <span className="font-mono text-xl font-extrabold tabular-nums">{formatClock(shownClock[color])}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mx-auto w-full max-w-[min(78vh,620px)]">
              <Chessboard
                fen={game.fen}
                flipped={game.yourColor === 'b'}
                theme={boardTheme}
                interactive={!!isYourTurn && !isBusy}
                onMoveAttempt={sendMove}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-zinc-800 pt-4">
              {game.status === 'playing' && (
                <>
                  {drawOfferedByOpponent ? (
                    <>
                      <span className="w-full text-center text-sm text-amber-200">Your opponent offers a draw.</span>
                      <button type="button" disabled={isBusy} onClick={() => void sendAction('draw-accept')} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50"><Handshake className="h-4 w-4" /> Accept draw</button>
                      <button type="button" disabled={isBusy} onClick={() => void sendAction('draw-reject')} className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-50">Decline draw</button>
                    </>
                  ) : game.drawOfferBy === game.yourColor ? (
                    <button type="button" disabled={isBusy} onClick={() => void sendAction('draw-decline')} className="rounded-lg border border-amber-500/40 px-4 py-2.5 text-sm font-semibold text-amber-200 disabled:opacity-50">Draw offered · Cancel offer</button>
                  ) : (
                    <button type="button" disabled={isBusy} onClick={() => void sendAction('draw-offer')} className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/10 disabled:opacity-50"><Handshake className="h-4 w-4" /> Offer draw</button>
                  )}
                  <button type="button" disabled={isBusy} onClick={() => void sendAction('resign')} className="inline-flex items-center gap-2 rounded-lg border border-rose-500/35 px-4 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/10 disabled:opacity-50"><Flag className="h-4 w-4" /> Resign</button>
                </>
              )}
              {game.status === 'finished' && (
                <div className="w-full rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-4 text-center">
                  <h3 className="text-lg font-bold text-zinc-100">{resultText}</h3>
                  <p className="mt-1 text-xs text-zinc-400">{game.termination} · {game.pgn || 'No moves played'}</p>
                  {showAnalysisPrompt && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      <p className="text-sm text-zinc-200">Would you like to analyze the game?</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button type="button" onClick={() => void analyzeGame()} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-400">Analyze game</button>
                        <button type="button" onClick={() => setShowAnalysisPrompt(false)} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800">Not now</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isAnalyzing && <p role="status" className="flex items-center justify-center gap-2 text-sm text-emerald-200"><LoaderCircle className="h-4 w-4 animate-spin" /> Analyzing the final position…</p>}
            {analysisError && <p role="alert" className="text-center text-sm text-rose-300">{analysisError}</p>}
            {analysis && (
              <section className="space-y-3 rounded-xl border border-zinc-800 bg-black/20 p-4">
                <div>
                  <h3 className="font-bold text-zinc-100">Game analysis</h3>
                  <p className="mt-1 text-sm text-emerald-200">Final evaluation: {analysis.evalScore}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300">{analysis.thoroughAssessment.overallSummary}</p>
                  <p className="mt-1 text-xs text-zinc-400">Suggested continuation: {analysis.pv.slice(0, 8).join(' ') || 'No moves available'}</p>
                </div>
                <details>
                  <summary className="cursor-pointer text-sm font-semibold text-amber-200">Review move-by-move ideas ({moveExplanations.length} moves)</summary>
                  <ol className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                    {moveExplanations.map((move) => (
                      <li key={move.ply} className="rounded-lg border border-zinc-800 bg-[#111512] p-2.5 text-xs">
                        <p className="font-mono font-bold text-amber-200">{move.moveNumber}{move.color === 'Black' ? '...' : '.'} {move.san} <span className="font-sans text-zinc-400">· {move.tacticalConcept}</span></p>
                        <p className="mt-1 leading-relaxed text-zinc-300">{move.explanation}</p>
                      </li>
                    ))}
                  </ol>
                </details>
              </section>
            )}

            {game.status === 'finished' && (
              <button type="button" onClick={startNewGame} className="mx-auto flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800">
                <RotateCcw className="h-4 w-4" /> New online game
              </button>
            )}
          </div>
        )}

        {notice && <p role="status" className="mt-4 text-center text-sm text-emerald-200">{notice}</p>}
        {error && <p role="alert" className="mt-4 text-center text-sm text-rose-300">{error}</p>}
        <p className="mt-5 border-t border-zinc-800 pt-3 text-center text-[11px] leading-relaxed text-zinc-500">
          Game codes and match data are held temporarily by this app server. Both devices must be online and connected to the same app server.
        </p>
      </section>
      <TimeControlPicker
        isOpen={isTimeControlPickerOpen}
        selectedTimeControlId={selectedTimeControlId}
        onSelect={(control) => setSelectedTimeControlId(control.id)}
        onContinue={(control) => void createGame(control.id)}
        onClose={() => setIsTimeControlPickerOpen(false)}
      />
    </div>
  );
};
