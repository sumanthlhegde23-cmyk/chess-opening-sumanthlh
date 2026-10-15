import React, { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Home, LoaderCircle, RotateCcw } from 'lucide-react';
import { Chessboard } from './Chessboard';
import { analyzePositionStockfish18, explainPlayedMove, EngineAnalysisResult, MoveExplanationItem } from '../utils/stockfishService';
import { OnlineChessGame } from '../types/onlineGame';

interface OnlineGameReviewProps {
  game: OnlineChessGame;
  boardTheme: string;
  onMainMenu: () => void;
  onPlayAgain: () => void;
}

export const OnlineGameReview: React.FC<OnlineGameReviewProps> = ({ game, boardTheme, onMainMenu, onPlayAgain }) => {
  const [ply, setPly] = useState(game.moves.length);
  const [analysis, setAnalysis] = useState<EngineAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const review = useMemo(() => {
    const chess = new Chess();
    const fens = [chess.fen()];
    const explanations: (MoveExplanationItem | null)[] = [];
    const squares: ({ from: string; to: string } | null)[] = [null];
    for (const san of game.moves) {
      explanations.push(explainPlayedMove(chess.fen(), san));
      const move = chess.move(san);
      fens.push(chess.fen());
      squares.push({ from: move.from, to: move.to });
    }
    return { fens, explanations, squares };
  }, [game.moves]);

  useEffect(() => {
    let current = true;
    setIsAnalyzing(true);
    setAnalysisError(null);
    analyzePositionStockfish18(review.fens[ply])
      .then((result) => { if (current) setAnalysis(result); })
      .catch(() => { if (current) setAnalysisError('Could not evaluate this position.'); })
      .finally(() => { if (current) setIsAnalyzing(false); });
    return () => { current = false; };
  }, [review.fens, ply]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') setPly((value) => Math.max(0, value - 1));
      if (event.key === 'ArrowRight') setPly((value) => Math.min(game.moves.length, value + 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game.moves.length]);

  const currentMove = ply > 0 ? review.explanations[ply - 1] : null;
  const stepButton = 'rounded-lg border border-zinc-700 p-2.5 text-zinc-200 hover:bg-zinc-800 disabled:opacity-40';

  return (
    <div role="dialog" aria-modal="true" aria-label="Game review" className="fixed inset-0 z-[100] overflow-y-auto bg-[#0e1210] text-zinc-100">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-3 p-3 sm:p-5 lg:flex-row lg:items-start lg:justify-center lg:gap-6">
        <div className="mx-auto flex w-full max-w-[min(100%,calc(100dvh-9rem),540px)] flex-col gap-3 lg:mx-0 lg:max-w-[min(100%,calc(100dvh-6rem),540px)]">
          <Chessboard
            fen={review.fens[ply]}
            flipped={game.yourColor === 'b'}
            theme={boardTheme}
            lastMove={review.squares[ply]}
            interactive={false}
          />
          <div className="flex items-center justify-center gap-2">
            <button type="button" aria-label="First position" disabled={ply === 0} onClick={() => setPly(0)} className={stepButton}><ChevronsLeft className="h-5 w-5" /></button>
            <button type="button" aria-label="Previous move" disabled={ply === 0} onClick={() => setPly(ply - 1)} className={stepButton}><ChevronLeft className="h-5 w-5" /></button>
            <span className="min-w-20 text-center font-mono text-sm text-zinc-300">{ply} / {game.moves.length}</span>
            <button type="button" aria-label="Next move" disabled={ply === game.moves.length} onClick={() => setPly(ply + 1)} className={stepButton}><ChevronRight className="h-5 w-5" /></button>
            <button type="button" aria-label="Last position" disabled={ply === game.moves.length} onClick={() => setPly(game.moves.length)} className={stepButton}><ChevronsRight className="h-5 w-5" /></button>
          </div>
        </div>

        <aside className="mx-auto flex w-full max-w-[640px] flex-col gap-3 lg:mx-0 lg:w-96 lg:max-w-none lg:shrink-0">
          <div className="rounded-xl border border-zinc-800 bg-[#141916] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">Game review</p>
            <p className="mt-1 text-sm font-bold text-zinc-100">{game.hostName} (White) vs {game.guestName ?? 'Opponent'} (Black)</p>
            <p className="mt-0.5 text-xs text-zinc-400">{game.termination ?? 'Game finished'} · {game.result}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#141916] p-3" aria-live="polite">
            {currentMove ? (
              <>
                <p className="font-mono text-sm font-bold text-amber-200">{currentMove.moveNumber}{currentMove.color === 'Black' ? '...' : '.'} {currentMove.san} <span className="font-sans font-normal text-zinc-400">· {currentMove.tacticalConcept}</span></p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">{currentMove.explanation}</p>
              </>
            ) : (
              <p className="text-xs text-zinc-400">{ply === 0 ? 'Starting position. Step through the game with the arrows or ← → keys.' : 'No explanation available for this move.'}</p>
            )}
            <div className="mt-3 border-t border-zinc-800 pt-3 text-xs">
              {isAnalyzing && <p className="flex items-center gap-2 text-emerald-200"><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Evaluating position…</p>}
              {analysisError && <p role="alert" className="text-rose-300">{analysisError}</p>}
              {!isAnalyzing && analysis && (
                <>
                  <p className="text-sm text-emerald-200">Evaluation: <span className="font-mono font-bold">{analysis.evalScore}</span></p>
                  <p className="mt-1 leading-relaxed text-zinc-300">{analysis.thoroughAssessment.overallSummary}</p>
                  {ply < game.moves.length && analysis.bestMoveSan && <p className="mt-1 text-zinc-400">Engine suggestion here: <span className="font-mono text-zinc-200">{analysis.bestMoveSan}</span></p>}
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#141916] p-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Moves</h3>
            <ol className="mt-2 flex max-h-48 flex-wrap gap-1 overflow-y-auto font-mono text-xs lg:max-h-64">
              {game.moves.map((san, index) => (
                <li key={index}>
                  <button type="button" onClick={() => setPly(index + 1)} aria-current={ply === index + 1} className={`rounded px-1.5 py-1 ${ply === index + 1 ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-200 hover:bg-zinc-800'}`}>
                    {index % 2 === 0 ? `${index / 2 + 1}. ` : ''}{san}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onPlayAgain} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400"><RotateCcw className="h-4 w-4" /> Play Again</button>
            <button type="button" onClick={onMainMenu} className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"><Home className="h-4 w-4" /> Main Menu</button>
          </div>
        </aside>
      </div>
    </div>
  );
};
