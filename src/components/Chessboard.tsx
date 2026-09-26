import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { boardThemes, BoardTheme } from '../utils/boardThemes';
import { chessAudio } from '../utils/sound';

interface ChessboardProps {
  fen: string;
  flipped?: boolean;
  theme?: string;
  lastMove?: { from: string; to: string } | null;
  interactive?: boolean;
  trainingMode?: boolean;
  expectedNextMove?: string; // SAN e.g. "Nf3"
  onMoveAttempt?: (from: string, to: string, san: string, isCorrect: boolean) => void;
  className?: string;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  fen,
  flipped = false,
  theme = 'emerald',
  lastMove = null,
  interactive = true,
  trainingMode = false,
  expectedNextMove,
  onMoveAttempt,
  className = '',
}) => {
  const currentTheme: BoardTheme = boardThemes[theme] || boardThemes.maple || boardThemes.emerald;
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const [feedbackEffect, setFeedbackEffect] = useState<'success' | 'deviation' | null>(null);

  // Initialize a chess.js instance based on current FEN to compute legal moves & check state
  const chessInstance = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const inCheck = chessInstance.inCheck();
  const turn = chessInstance.turn();

  // Find king square if in check
  const kingInCheckSquare = useMemo(() => {
    if (!inCheck) return null;
    const board = chessInstance.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          const file = String.fromCharCode(97 + c);
          const rank = 8 - r;
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }, [inCheck, chessInstance, turn]);

  // Compute legal destination squares for currently selected square
  const legalDestinations = useMemo(() => {
    if (!selectedSquare || !interactive) return [];
    try {
      const moves = chessInstance.moves({ square: selectedSquare, verbose: true });
      return moves.map(m => m.to as Square);
    } catch {
      return [];
    }
  }, [selectedSquare, chessInstance, interactive]);

  // Clear selection when FEN changes
  useEffect(() => {
    setSelectedSquare(null);
  }, [fen]);

  const handleSquareClick = useCallback((square: Square) => {
    if (!interactive) return;

    // If already selected the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // If another piece is already selected, try to execute the move
    if (selectedSquare) {
      const moves = chessInstance.moves({ square: selectedSquare, verbose: true });
      const matchedMove = moves.find(m => m.to === square);

      if (matchedMove) {
        const isCorrect = expectedNextMove ? matchedMove.san === expectedNextMove : true;

        if (matchedMove.captured) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }

        if (isCorrect) {
          setFeedbackEffect('success');
          setTimeout(() => setFeedbackEffect(null), 600);
        } else {
          setFeedbackEffect('deviation');
          setTimeout(() => setFeedbackEffect(null), 700);
        }

        if (onMoveAttempt) {
          onMoveAttempt(selectedSquare, square, matchedMove.san, isCorrect);
        }

        setSelectedSquare(null);
        return;
      }
    }

    // Otherwise, select the square if it has a piece of the active side (or any piece if not in strict training)
    const piece = chessInstance.get(square);
    if (piece) {
      if (trainingMode && piece.color !== turn) {
        return; // In training mode only select active side
      }
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  }, [selectedSquare, chessInstance, interactive, trainingMode, turn, expectedNextMove, onMoveAttempt]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = flipped ? [...files].reverse() : files;
  const displayRanks = flipped ? [...ranks].reverse() : ranks;

  return (
    <div
      id="chessboard-container"
      className={`relative select-none aspect-square w-full max-w-[540px] mx-auto rounded-xl shadow-2xl border-4 ${
        currentTheme.frameClass || 'border-[#272b35]'
      } overflow-hidden bg-[#181a20] transition-all duration-300 ${className}`}
      style={
        currentTheme.boardImage
          ? {
              backgroundImage: `url(${currentTheme.boardImage})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank, rankIdx) =>
          displayFiles.map((file, fileIdx) => {
            const square = `${file}${rank}` as Square;
            const isLight = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 !== 0;
            const piece = chessInstance.get(square);

            const isSelected = selectedSquare === square;
            const isLegalDest = legalDestinations.includes(square);
            const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
            const isKingInCheck = kingInCheckSquare === square;

            // Base square background (transparent if wood image board, otherwise solid theme color)
            const squareBaseBg = currentTheme.boardImage
              ? 'bg-transparent'
              : isLight
              ? currentTheme.lightSquare
              : currentTheme.darkSquare;

            // Coordinate labels (show rank on first column, file on last row)
            const showRank = fileIdx === 0;
            const showFile = rankIdx === 7;

            const coordTextColor = isLight
              ? currentTheme.coordinateLight || 'text-zinc-600'
              : currentTheme.coordinateDark || 'text-zinc-300';

            return (
              <div
                key={square}
                id={`square-${square}`}
                onClick={() => handleSquareClick(square)}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedSquare && draggedSquare !== square) {
                    handleSquareClick(square);
                  }
                  setDraggedSquare(null);
                }}
                className={`relative w-full h-full flex items-center justify-center cursor-pointer transition-colors duration-150 ${squareBaseBg} ${
                  isLastMoveSquare ? currentTheme.highlightSquare : ''
                } ${isSelected ? currentTheme.selectSquare : ''} ${
                  isKingInCheck ? 'bg-red-500/60 ring-4 ring-red-600 ring-inset' : ''
                }`}
              >
                {/* Legal destination indicators */}
                {isLegalDest && (
                  <div
                    className={`absolute z-20 pointer-events-none rounded-full ${
                      piece
                        ? 'w-full h-full ring-4 ring-black/25 ring-inset bg-black/10'
                        : 'w-3.5 h-3.5 bg-black/25'
                    }`}
                  />
                )}

                {/* Coordinate label: Rank */}
                {showRank && (
                  <span
                    className={`absolute top-0.5 left-1 text-[10px] font-mono font-bold pointer-events-none select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] ${coordTextColor}`}
                  >
                    {rank}
                  </span>
                )}

                {/* Coordinate label: File */}
                {showFile && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] font-mono font-bold pointer-events-none select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] ${coordTextColor}`}
                  >
                    {file}
                  </span>
                )}

                {/* Piece rendering with drag support */}
                {piece && (
                  <div
                    draggable={interactive}
                    onDragStart={() => {
                      setSelectedSquare(square);
                      setDraggedSquare(square);
                    }}
                    onDragEnd={() => setDraggedSquare(null)}
                    className={`w-[90%] h-[90%] relative z-10 flex items-center justify-center transition-transform select-none ${
                      interactive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                    } ${isSelected ? 'scale-105 drop-shadow-xl' : ''}`}
                  >
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Success / Error flash overlay */}
      {feedbackEffect === 'success' && (
        <div className="absolute inset-0 pointer-events-none bg-emerald-500/20 ring-4 ring-emerald-400 ring-inset animate-pulse z-30 flex items-center justify-center">
          <div className="bg-emerald-900/90 text-emerald-200 border border-emerald-500 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm">
            Correct Move!
          </div>
        </div>
      )}
      {feedbackEffect === 'deviation' && (
        <div className="absolute inset-0 pointer-events-none bg-amber-500/15 ring-2 ring-amber-400/60 ring-inset z-30 flex items-center justify-center">
          <div className="bg-zinc-950/90 text-amber-200 border border-amber-500/50 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm">
            Alternative Move Played — Analyzing Refutation
          </div>
        </div>
      )}
    </div>
  );
};
