import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import {
  Cpu,
  RotateCcw,
  Repeat,
  Trash2,
  X,
  Play,
  ChevronLeft,
  Zap,
  Check,
  Flame,
  Globe,
  Copy,
  Sliders,
  Compass,
  Swords,
  Layers,
  Award,
  Move,
  MousePointer,
  BookOpen,
  Sparkles,
  Star,
  Eye,
  EyeOff,
  TrendingUp,
  Gauge,
  Shield,
  ArrowRight,
  Info,
  Lock,
  Unlock,
  Undo2,
  Puzzle,
} from 'lucide-react';
import { ChessPiece } from './ChessPiece';
import { boardThemes, BoardTheme } from '../utils/boardThemes';
import { chessAudio } from '../utils/sound';
import {
  analyzePositionStockfish18,
  getStockfish18Move,
  getEloForLevel,
  EngineAnalysisResult,
  MoveExplanationItem,
} from '../utils/stockfishService';
import {
  PlatformType,
  getOpeningStatsForPosition,
} from '../data/openingExplorerData';
import {
  identifyOpeningAndVariation,
  IdentifiedOpening,
} from '../utils/openingIdentifier';
import { OpeningPuzzlesSection } from './OpeningPuzzlesSection';

interface PracticeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTheme?: string;
  onOpenChatAiWithFen?: (fen: string) => void;
  initialOpeningId?: string;
  initialVariationId?: string;
}

type PracticeTab = 'editor' | 'explorer' | 'play_engine' | 'puzzles';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';

// Helper: Safely parses any FEN string into an 8x8 piece grid (handles empty board & partial boards)
function fenToMatrix(fen: string): ({ type: PieceSymbol; color: Color } | null)[][] {
  const matrix: ({ type: PieceSymbol; color: Color } | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  try {
    const boardPart = fen.trim().split(' ')[0] || '';
    const rows = boardPart.split('/');

    for (let r = 0; r < Math.min(8, rows.length); r++) {
      let c = 0;
      for (const char of rows[r]) {
        if (c >= 8) break;
        if (char >= '1' && char <= '8') {
          c += parseInt(char, 10);
        } else {
          const color: Color = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase() as PieceSymbol;
          matrix[r][c] = { type, color };
          c++;
        }
      }
    }
  } catch {
    // fallback
  }

  return matrix;
}

// Helper: Converts an 8x8 piece grid into a standard FEN string
function matrixToFen(
  matrix: ({ type: PieceSymbol; color: Color } | null)[][],
  turn: Color = 'w',
  castling: string = '-'
): string {
  const rows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let emptyCount = 0;
    let rowStr = '';
    for (let c = 0; c < 8; c++) {
      const piece = matrix[r][c];
      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowStr += emptyCount;
          emptyCount = 0;
        }
        const symbol = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
        rowStr += symbol;
      }
    }
    if (emptyCount > 0) {
      rowStr += emptyCount;
    }
    rows.push(rowStr);
  }
  return `${rows.join('/')} ${turn} ${castling} - 0 1`;
}

export const PracticeModeModal: React.FC<PracticeModeModalProps> = ({
  isOpen,
  onClose,
  boardTheme = 'maple',
  onOpenChatAiWithFen,
  initialOpeningId,
  initialVariationId,
}) => {
  // Current active sub-mode (starts in editor with playable board)
  const [activeTab, setActiveTab] = useState<PracticeTab>('editor');

  // Callback ref for puzzles move attempt
  const onPuzzleMoveAttemptRef = useRef<((san: string, nextFen: string, from?: Square, to?: Square) => void) | null>(null);

  // Board FEN state (defaults to standard starting position)
  const [boardFen, setBoardFen] = useState<string>(START_FEN);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Board Editor states
  // 'move' means interactive play mode: user can click and move pieces on the board!
  // Any piece code (e.g. 'wQ', 'bP') or 'trash' means placement brush mode.
  const [selectedTool, setSelectedTool] = useState<string>('move');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [engineAnalysis, setEngineAnalysis] = useState<EngineAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [customFenInput, setCustomFenInput] = useState<string>(START_FEN);
  const [copiedFen, setCopiedFen] = useState<boolean>(false);

  // Analysis Mode states: locks editing tools and makes board strictly playable for moves & engine suggestions
  const [isAnalysisMode, setIsAnalysisMode] = useState<boolean>(false);
  const [analyzedBaseFen, setAnalyzedBaseFen] = useState<string | null>(null);
  const [analysisMoveHistory, setAnalysisMoveHistory] = useState<string[]>([]);
  const [analysisFenHistory, setAnalysisFenHistory] = useState<string[]>([]);

  // Opening Explorer states
  const [explorerPlatform, setExplorerPlatform] = useState<PlatformType>('chess.com');
  const [explorerMoveHistory, setExplorerMoveHistory] = useState<string[]>([]);
  const [explorerFenHistory, setExplorerFenHistory] = useState<string[]>([START_FEN]);
  const [showPopularMoveOnBoard, setShowPopularMoveOnBoard] = useState<boolean>(true);

  // Engine Level Selection (Levels 1 to 18)
  const [engineLevel, setEngineLevel] = useState<number>(18);
  const [previewFen, setPreviewFen] = useState<string | null>(null);
  const [activeExplanationIndex, setActiveExplanationIndex] = useState<number | null>(null);

  // Play Engine states
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [engineGameHistory, setEngineGameHistory] = useState<{ san: string; from: string; to: string }[]>([]);
  const [isEngineThinking, setIsEngineThinking] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [engineEvalBar, setEngineEvalBar] = useState<string>('0.00');

  const currentTheme: BoardTheme = boardThemes[boardTheme] || boardThemes.maple;

  // Effective FEN displayed on the board (allows stepping and previewing move-by-move explanations)
  const effectiveFen = previewFen || boardFen;

  // Board matrix representation safely computed from effectiveFen (works even for empty boards!)
  const boardMatrix = useMemo(() => {
    return fenToMatrix(effectiveFen);
  }, [effectiveFen]);

  // Side to move parsed from FEN
  const currentTurn: Color = useMemo(() => {
    const parts = boardFen.trim().split(' ');
    return parts[1] === 'b' ? 'b' : 'w';
  }, [boardFen]);

  // Compute legal destination squares for the currently selected piece
  const legalDestinations = useMemo(() => {
    if (!selectedSquare) return [];

    // Attempt using chess.js if the position has valid kings
    try {
      const chess = new Chess(boardFen);
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      return moves.map((m) => m.to as Square);
    } catch {
      // If position has custom layout without standard rules, allow moving to any square
      return [];
    }
  }, [boardFen, selectedSquare]);

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle Tab changes
  const handleTabChange = (tab: PracticeTab) => {
    setActiveTab(tab);
    setAnalysisError(null);
    setSelectedSquare(null);
    setIsAnalysisMode(false);
    setEngineAnalysis(null);
    setAnalyzedBaseFen(null);
    setAnalysisMoveHistory([]);
    setAnalysisFenHistory([]);
    setPreviewFen(null);
    setActiveExplanationIndex(null);

    if (tab === 'explorer') {
      setBoardFen(START_FEN);
      setCustomFenInput(START_FEN);
      setExplorerMoveHistory([]);
      setExplorerFenHistory([START_FEN]);
    } else if (tab === 'play_engine') {
      startNewEngineGame(playerColor);
    } else if (tab === 'editor') {
      setSelectedTool('move'); // Board is playable by default!
    } else if (tab === 'puzzles') {
      setSelectedSquare(null);
      setPreviewFen(null);
    }
  };

  // Stable callback for updating board FEN from the Puzzles section
  const handleUpdateBoardFenFromPuzzles = useCallback((newFen: string) => {
    setBoardFen(newFen);
    setCustomFenInput(newFen);
    setPreviewFen(null);
    setSelectedSquare(null);
  }, []);

  // ----------------------------------------------------
  // BOARD SQUARE CLICK HANDLERS (PLAYABLE ACROSS ALL TABS)
  // ----------------------------------------------------

  // Board Editor Square Click
  const handleSquareClickEditor = (square: Square) => {
    setAnalysisError(null);

    // =========================================================================
    // ANALYSIS MODE: BOARD IS STRICTLY PLAYABLE! ALL EDITING OPTIONS ARE LOCKED.
    // User can make legal moves on the board or play the engine's suggested move.
    // =========================================================================
    if (isAnalysisMode) {
      const file = square.charCodeAt(0) - 97;
      const rank = 8 - parseInt(square[1], 10);
      const clickedPiece = boardMatrix[rank]?.[file];

      // If user clicks while previewing an explanation step, return to live board
      if (previewFen) {
        setPreviewFen(null);
        setActiveExplanationIndex(null);
      }

      // 1. No piece selected yet: only allow selecting pieces of the side to move
      if (!selectedSquare) {
        if (clickedPiece && clickedPiece.color === currentTurn) {
          setSelectedSquare(square);
        }
        return;
      }

      // 2. Clicked the same square -> deselect
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      // 3. Clicked another piece of the current player's side -> switch selection
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedSquare(square);
        return;
      }

      // 4. Target square clicked -> execute standard legal move via chess.js
      try {
        const chess = new Chess(boardFen);
        const move = chess.move({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });

        if (move) {
          if (move.captured) chessAudio.playCapture();
          else chessAudio.playMove();

          const nextFen = chess.fen();
          setBoardFen(nextFen);
          setCustomFenInput(nextFen);
          setSelectedSquare(null);
          setPreviewFen(null);
          setActiveExplanationIndex(null);
          setAnalysisMoveHistory((prev) => [...prev, move.san]);
          setAnalysisFenHistory((prev) => [...prev, nextFen]);

          // Automatically analyze the new position with Stockfish
          setIsAnalyzing(true);
          analyzePositionStockfish18(nextFen)
            .then((res) => {
              setEngineAnalysis(res);
            })
            .catch(() => {})
            .finally(() => {
              setIsAnalyzing(false);
            });
          return;
        }
      } catch {
        // Invalid or illegal move
      }

      setSelectedSquare(null);
      return;
    }

    // =========================================================================
    // STANDARD BOARD EDITOR (BEFORE ANALYSIS): EDITING AND SETUP MODE
    // =========================================================================

    // If a piece placement brush or erase tool is active
    if (selectedTool !== 'move') {
      const matrix = fenToMatrix(boardFen);
      const file = square.charCodeAt(0) - 97;
      const rank = 8 - parseInt(square[1], 10);

      if (selectedTool === 'trash') {
        matrix[rank][file] = null;
      } else {
        const color = selectedTool[0] as Color;
        const type = selectedTool[1].toLowerCase() as PieceSymbol;
        matrix[rank][file] = { type, color };
      }

      const newFen = matrixToFen(matrix, currentTurn);
      setBoardFen(newFen);
      setCustomFenInput(newFen);
      setEngineAnalysis(null);
      chessAudio.playMove();
      return;
    }

    // Play/Move mode (interactive playable board):
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    const clickedPiece = boardMatrix[rank]?.[file];

    // Case 1: No square currently selected
    if (!selectedSquare) {
      if (clickedPiece) {
        setSelectedSquare(square);
      }
      return;
    }

    // Case 2: Clicked the same square -> deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // Case 3: Destination square clicked -> execute move!
    try {
      // First attempt standard legal move via chess.js
      const chess = new Chess(boardFen);
      const move = chess.move({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });

      if (move) {
        if (move.captured) chessAudio.playCapture();
        else chessAudio.playMove();

        const newFen = chess.fen();
        setBoardFen(newFen);
        setCustomFenInput(newFen);
        setSelectedSquare(null);
        setEngineAnalysis(null);
        return;
      }
    } catch {
      // Position might be custom arrangement
    }

    // Fallback move for custom board arrangements
    const matrix = fenToMatrix(boardFen);
    const fromFile = selectedSquare.charCodeAt(0) - 97;
    const fromRank = 8 - parseInt(selectedSquare[1], 10);
    const pieceToMove = matrix[fromRank]?.[fromFile];

    if (pieceToMove) {
      // If user clicked another piece of the same color, switch selection
      if (clickedPiece && clickedPiece.color === pieceToMove.color) {
        setSelectedSquare(square);
        return;
      }

      const isCapture = !!matrix[rank]?.[file];
      matrix[fromRank][fromFile] = null;
      matrix[rank][file] = pieceToMove;

      if (isCapture) chessAudio.playCapture();
      else chessAudio.playMove();

      const nextTurn: Color = currentTurn === 'w' ? 'b' : 'w';
      const newFen = matrixToFen(matrix, nextTurn);
      setBoardFen(newFen);
      setCustomFenInput(newFen);
      setSelectedSquare(null);
      setEngineAnalysis(null);
    } else {
      setSelectedSquare(null);
    }
  };

  // Opening Explorer Square Click (Playable board that updates statistics)
  const handleSquareClickExplorer = (square: Square) => {
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    const clickedPiece = boardMatrix[rank]?.[file];

    if (!selectedSquare) {
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    try {
      const chess = new Chess(boardFen);
      const move = chess.move({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });

      if (move) {
        if (move.captured) chessAudio.playCapture();
        else chessAudio.playMove();

        const newFen = chess.fen();
        setBoardFen(newFen);
        setExplorerMoveHistory((prev) => [...prev, move.san]);
        setExplorerFenHistory((prev) => [...prev, newFen]);
        setSelectedSquare(null);
      } else {
        if (clickedPiece && clickedPiece.color === currentTurn) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      }
    } catch {
      setSelectedSquare(null);
    }
  };

  // Play Engine Square Click (Play against Stockfish Level 18)
  const handleSquareClickPlayEngine = async (square: Square) => {
    if (isEngineThinking || gameResult) return;

    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    const clickedPiece = boardMatrix[rank]?.[file];

    if (currentTurn !== playerColor) return;

    if (!selectedSquare) {
      if (clickedPiece && clickedPiece.color === playerColor) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    try {
      const chess = new Chess(boardFen);
      const move = chess.move({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });

      if (!move) {
        if (clickedPiece && clickedPiece.color === playerColor) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
        return;
      }

      // Execute Player move
      setSelectedSquare(null);
      if (move.captured) chessAudio.playCapture();
      else chessAudio.playMove();

      const fenAfterPlayer = chess.fen();
      setBoardFen(fenAfterPlayer);
      setEngineGameHistory((prev) => [...prev, { san: move.san, from: move.from, to: move.to }]);

      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          setGameResult(`Victory! You defeated Stockfish Level ${engineLevel} by checkmate!`);
        } else {
          setGameResult('Game drawn by stalemate or repetition.');
        }
        return;
      }

      // Stockfish Engine Response scaled by Level (1 to 18)
      setIsEngineThinking(true);
      try {
        const engineMove = await getStockfish18Move(fenAfterPlayer, engineLevel);
        const engineChess = new Chess(fenAfterPlayer);
        const engineResult = engineChess.move({
          from: engineMove.from,
          to: engineMove.to,
          promotion: engineMove.promotion || 'q',
        });

        if (engineResult.captured) chessAudio.playCapture();
        else chessAudio.playMove();

        setBoardFen(engineChess.fen());
        setEngineGameHistory((prev) => [
          ...prev,
          { san: engineResult.san, from: engineResult.from, to: engineResult.to },
        ]);
        setEngineEvalBar(engineMove.evalScore);

        if (engineChess.isGameOver()) {
          if (engineChess.isCheckmate()) {
            setGameResult(`Stockfish Level ${engineLevel} won by checkmate.`);
          } else {
            setGameResult('Game drawn by stalemate or repetition.');
          }
        }
      } catch {
        // Handle engine exception
      } finally {
        setIsEngineThinking(false);
      }
    } catch {
      setSelectedSquare(null);
    }
  };

  // Puzzle Square Click (interactive solving and free move exploration on board)
  const handleSquareClickPuzzles = (square: Square) => {
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    const clickedPiece = boardMatrix[rank]?.[file];

    if (!selectedSquare) {
      // Pick up any piece of the current turn
      if (clickedPiece && clickedPiece.color === currentTurn) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // Switch selection if user clicked another piece of the current turn's side
    if (clickedPiece && clickedPiece.color === currentTurn) {
      setSelectedSquare(square);
      return;
    }

    // Execute move via chess.js
    try {
      const chess = new Chess(boardFen);
      const move = chess.move({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });

      if (move) {
        if (move.captured) chessAudio.playCapture();
        else chessAudio.playMove();

        const nextFen = chess.fen();
        setBoardFen(nextFen);
        setCustomFenInput(nextFen);
        setPreviewFen(null);
        setSelectedSquare(null);

        if (onPuzzleMoveAttemptRef.current) {
          onPuzzleMoveAttemptRef.current(move.san, nextFen, move.from as Square, move.to as Square);
        }
        return;
      }
    } catch {
      // Illegal move attempt
    }

    // If move was not legal, check if user clicked another piece of the same side
    if (clickedPiece && clickedPiece.color === currentTurn) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  // ----------------------------------------------------
  // CLEAR ALL & RESET HANDLERS
  // ----------------------------------------------------
  const handleClearBoard = () => {
    // Set 64 squares completely empty
    setBoardFen(EMPTY_FEN);
    setCustomFenInput(EMPTY_FEN);
    setSelectedSquare(null);
    setEngineAnalysis(null);
    setAnalysisError(null);
    chessAudio.playMove();
  };

  const handleResetStartingPosition = () => {
    setBoardFen(START_FEN);
    setCustomFenInput(START_FEN);
    setSelectedSquare(null);
    setSelectedTool('move'); // Reset to playable move mode
    setEngineAnalysis(null);
    setAnalysisError(null);
    chessAudio.playMove();
  };

  const handleApplyCustomFen = () => {
    const input = customFenInput.trim();
    if (!input) return;
    setBoardFen(input);
    setSelectedSquare(null);
    setEngineAnalysis(null);
    setAnalysisError(null);
    chessAudio.playMove();
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(boardFen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  // Stockfish Level 18 Position Analysis & Playable Mode Transition
  const handleAnalyzeWithStockfish = async () => {
    setAnalysisError(null);
    try {
      const matrix = fenToMatrix(boardFen);
      const whiteKing = matrix.flat().some((p) => p && p.type === 'k' && p.color === 'w');
      const blackKing = matrix.flat().some((p) => p && p.type === 'k' && p.color === 'b');

      if (!whiteKing || !blackKing) {
        setAnalysisError(
          'Both White and Black Kings must be placed on the board to run Stockfish Level 18 analysis.'
        );
        return;
      }

      // Check standard chess legality with chess.js
      try {
        new Chess(boardFen);
      } catch {
        setAnalysisError(
          'The position layout is not a valid chess state (e.g. pawns on 1st/8th rank, or king in illegal check). Please adjust before analyzing.'
        );
        return;
      }

      // LOCK board editing options and enter Playable Analysis Mode
      setIsAnalysisMode(true);
      setSelectedTool('move');
      setSelectedSquare(null);
      setPreviewFen(null);
      setActiveExplanationIndex(null);
      setAnalyzedBaseFen(boardFen);
      setAnalysisFenHistory([boardFen]);
      setAnalysisMoveHistory([]);

      setIsAnalyzing(true);
      const result = await analyzePositionStockfish18(boardFen);
      setEngineAnalysis(result);
      chessAudio.playMove();
    } catch {
      setAnalysisError('Could not analyze position. Please check board legality.');
      setIsAnalysisMode(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Exit Analysis Mode and unlock board editing options
  const handleUnlockBoardEditor = () => {
    setIsAnalysisMode(false);
    setEngineAnalysis(null);
    setSelectedSquare(null);
    setPreviewFen(null);
    setActiveExplanationIndex(null);
    setAnalysisError(null);
    setAnalysisMoveHistory([]);
    setAnalysisFenHistory([]);
    setSelectedTool('move');
  };

  // Play the move suggested by Stockfish 18
  const handlePlaySuggestedMove = async () => {
    if (!engineAnalysis || isAnalyzing) return;
    try {
      const chess = new Chess(boardFen);
      let move = null;
      if (engineAnalysis.bestMoveFrom && engineAnalysis.bestMoveTo) {
        move = chess.move({
          from: engineAnalysis.bestMoveFrom,
          to: engineAnalysis.bestMoveTo,
          promotion: 'q',
        });
      }
      if (!move && engineAnalysis.bestMoveSan) {
        move = chess.move(engineAnalysis.bestMoveSan);
      }

      if (move) {
        if (move.captured) chessAudio.playCapture();
        else chessAudio.playMove();

        const nextFen = chess.fen();
        setBoardFen(nextFen);
        setCustomFenInput(nextFen);
        setSelectedSquare(null);
        setPreviewFen(null);
        setActiveExplanationIndex(null);
        setAnalysisMoveHistory((prev) => [...prev, move.san]);
        setAnalysisFenHistory((prev) => [...prev, nextFen]);

        // Re-analyze position immediately for the next move
        setIsAnalyzing(true);
        try {
          const nextResult = await analyzePositionStockfish18(nextFen);
          setEngineAnalysis(nextResult);
        } catch {
          // retain
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (err) {
      console.error('Failed to play suggested move:', err);
    }
  };

  // Play a specific move from the explanation continuation line
  const handlePlayExplanationMove = async (item: MoveExplanationItem) => {
    if (isAnalyzing) return;
    try {
      const chess = new Chess(boardFen);
      let move = null;
      if (item.from && item.to) {
        move = chess.move({
          from: item.from,
          to: item.to,
          promotion: 'q',
        });
      }
      if (!move && item.san) {
        move = chess.move(item.san);
      }

      if (move) {
        if (move.captured) chessAudio.playCapture();
        else chessAudio.playMove();

        const nextFen = chess.fen();
        setBoardFen(nextFen);
        setCustomFenInput(nextFen);
        setSelectedSquare(null);
        setPreviewFen(null);
        setActiveExplanationIndex(null);
        setAnalysisMoveHistory((prev) => [...prev, move.san]);
        setAnalysisFenHistory((prev) => [...prev, nextFen]);

        setIsAnalyzing(true);
        try {
          const nextResult = await analyzePositionStockfish18(nextFen);
          setEngineAnalysis(nextResult);
        } catch {
          // retain
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (err) {
      console.error('Failed to play explanation move:', err);
    }
  };

  // Undo last played move during analysis
  const handleAnalysisUndo = async () => {
    if (analysisFenHistory.length <= 1 || isAnalyzing) return;
    const newFenHistory = [...analysisFenHistory];
    newFenHistory.pop();
    const prevFen = newFenHistory[newFenHistory.length - 1];

    setAnalysisFenHistory(newFenHistory);
    setAnalysisMoveHistory((prev) => prev.slice(0, -1));
    setBoardFen(prevFen);
    setCustomFenInput(prevFen);
    setSelectedSquare(null);
    setPreviewFen(null);
    setActiveExplanationIndex(null);

    chessAudio.playMove();
    setIsAnalyzing(true);
    try {
      const newResult = await analyzePositionStockfish18(prevFen);
      setEngineAnalysis(newResult);
    } catch {
      // retain
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset to original position when analysis was first run
  const handleResetToAnalyzedBase = async () => {
    if (!analyzedBaseFen || isAnalyzing) return;
    setBoardFen(analyzedBaseFen);
    setCustomFenInput(analyzedBaseFen);
    setAnalysisFenHistory([analyzedBaseFen]);
    setAnalysisMoveHistory([]);
    setSelectedSquare(null);
    setPreviewFen(null);
    setActiveExplanationIndex(null);
    chessAudio.playMove();

    setIsAnalyzing(true);
    try {
      const newResult = await analyzePositionStockfish18(analyzedBaseFen);
      setEngineAnalysis(newResult);
    } catch {
      // retain
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ----------------------------------------------------
  // OPENING EXPLORER HANDLERS
  // ----------------------------------------------------
  const openingStats = useMemo(() => {
    if (activeTab !== 'explorer') return null;
    return getOpeningStatsForPosition(boardFen, explorerPlatform);
  }, [activeTab, boardFen, explorerPlatform]);

  // Dynamically identify the Opening, Variation, and ECO based on move history and board position
  const identifiedOpening = useMemo<IdentifiedOpening>(() => {
    return identifyOpeningAndVariation(explorerMoveHistory, boardFen);
  }, [explorerMoveHistory, boardFen]);

  // Augment candidate moves with their resulting opening variation, ECO, and popularity statistics
  const candidateMovesWithDetails = useMemo(() => {
    if (!openingStats?.moves || openingStats.moves.length === 0) return [];
    const totalCandidateGames = openingStats.moves.reduce((sum, m) => sum + m.gamesCount, 0);
    const maxGames = openingStats.moves[0]?.gamesCount || 1;

    return openingStats.moves.map((move, index) => {
      const nextIdentified = identifyOpeningAndVariation(
        [...explorerMoveHistory, move.san]
      );
      const popularityPct =
        totalCandidateGames > 0
          ? Math.round((move.gamesCount / totalCandidateGames) * 1000) / 10
          : 0;
      const relativePopularity = Math.round((move.gamesCount / maxGames) * 100);

      return {
        ...move,
        rank: index + 1,
        isMostPopular: index === 0,
        popularityPct,
        relativePopularity,
        nextOpeningName: nextIdentified.openingName,
        nextVariationName: nextIdentified.variationName,
        nextEco: nextIdentified.eco,
      };
    });
  }, [openingStats, explorerMoveHistory]);

  // The #1 most popular move played from this position
  const mostPopularMove = useMemo(() => {
    if (!candidateMovesWithDetails || candidateMovesWithDetails.length === 0) return null;
    return candidateMovesWithDetails[0];
  }, [candidateMovesWithDetails]);

  // Dynamic board coordinates and square mapping for the most popular move
  const popularMoveCoords = useMemo(() => {
    if (activeTab !== 'explorer' || !mostPopularMove) return null;
    try {
      const chess = new Chess(boardFen);
      const m = chess.move(mostPopularMove.san);
      if (!m) return null;
      const fromSquare = m.from as Square;
      const toSquare = m.to as Square;

      const getColRow = (sq: string) => {
        const fileCode = sq.charCodeAt(0) - 97; // 0..7 for a..h
        const rankNum = parseInt(sq[1], 10); // 1..8
        const col = isFlipped ? 7 - fileCode : fileCode;
        const row = isFlipped ? rankNum - 1 : 8 - rankNum;
        return { col, row };
      };

      const fromCoord = getColRow(fromSquare);
      const toCoord = getColRow(toSquare);

      return {
        fromSquare,
        toSquare,
        san: mostPopularMove.san,
        fromX: (fromCoord.col + 0.5) * 12.5,
        fromY: (fromCoord.row + 0.5) * 12.5,
        toX: (toCoord.col + 0.5) * 12.5,
        toY: (toCoord.row + 0.5) * 12.5,
      };
    } catch {
      return null;
    }
  }, [activeTab, mostPopularMove, boardFen, isFlipped]);

  // Dynamic board coordinates and arrow mapping for Stockfish suggested move in Analysis Mode
  const suggestedMoveCoords = useMemo(() => {
    if (activeTab !== 'editor' || !engineAnalysis) return null;
    const fromSquare = engineAnalysis.bestMoveFrom;
    const toSquare = engineAnalysis.bestMoveTo;
    if (!fromSquare || !toSquare) return null;

    const getColRow = (sq: string) => {
      const fileCode = sq.charCodeAt(0) - 97; // 0..7 for a..h
      const rankNum = parseInt(sq[1], 10); // 1..8
      const col = isFlipped ? 7 - fileCode : fileCode;
      const row = isFlipped ? rankNum - 1 : 8 - rankNum;
      return { col, row };
    };

    const fromCoord = getColRow(fromSquare);
    const toCoord = getColRow(toSquare);

    return {
      fromSquare,
      toSquare,
      san: engineAnalysis.bestMoveSan,
      fromX: (fromCoord.col + 0.5) * 12.5,
      fromY: (fromCoord.row + 0.5) * 12.5,
      toX: (toCoord.col + 0.5) * 12.5,
      toY: (toCoord.row + 0.5) * 12.5,
    };
  }, [activeTab, engineAnalysis, isFlipped]);

  const handleExplorerMoveSelect = (san: string) => {
    try {
      const chess = new Chess(boardFen);
      const move = chess.move(san);
      if (move) {
        if (move.captured) chessAudio.playCapture();
        else chessAudio.playMove();

        const newFen = chess.fen();
        setBoardFen(newFen);
        setExplorerMoveHistory((prev) => [...prev, san]);
        setExplorerFenHistory((prev) => [...prev, newFen]);
        setSelectedSquare(null);
      }
    } catch {
      // Invalid move
    }
  };

  const handleExplorerStepBack = () => {
    if (explorerFenHistory.length <= 1) return;
    const nextFens = explorerFenHistory.slice(0, -1);
    const nextMoves = explorerMoveHistory.slice(0, -1);
    setExplorerFenHistory(nextFens);
    setExplorerMoveHistory(nextMoves);
    setBoardFen(nextFens[nextFens.length - 1]);
    setSelectedSquare(null);
    chessAudio.playMove();
  };

  const handleExplorerReset = () => {
    setBoardFen(START_FEN);
    setExplorerMoveHistory([]);
    setExplorerFenHistory([START_FEN]);
    setSelectedSquare(null);
    chessAudio.playMove();
  };

  // ----------------------------------------------------
  // PLAY ENGINE START & UNDO
  // ----------------------------------------------------
  const startNewEngineGame = useCallback((color: Color) => {
    const chess = new Chess(START_FEN);
    setBoardFen(START_FEN);
    setEngineGameHistory([]);
    setGameResult(null);
    setSelectedSquare(null);
    setEngineEvalBar('0.00');
    setIsFlipped(color === 'b');

    if (color === 'b') {
      setIsEngineThinking(true);
      setTimeout(async () => {
        try {
          const move = await getStockfish18Move(START_FEN, engineLevel);
          chess.move({ from: move.from, to: move.to, promotion: move.promotion });
          setBoardFen(chess.fen());
          setEngineGameHistory([{ san: move.san, from: move.from, to: move.to }]);
          setEngineEvalBar(move.evalScore);
          chessAudio.playMove();
        } catch {
          // ignore
        } finally {
          setIsEngineThinking(false);
        }
      }, 400);
    }
  }, [engineLevel]);

  const handleUndoMoveEngine = () => {
    if (engineGameHistory.length < 2 || isEngineThinking) return;
    try {
      const chess = new Chess(START_FEN);
      const historyToKeep = engineGameHistory.slice(0, -2);
      for (const m of historyToKeep) {
        chess.move(m.san);
      }
      setBoardFen(chess.fen());
      setEngineGameHistory(historyToKeep);
      setGameResult(null);
      setSelectedSquare(null);
      chessAudio.playMove();
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="practice-mode-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="practice-mode-container"
        className="relative w-full max-w-5xl bg-[#13151e] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-500" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80 bg-gradient-to-r from-[#181a24] via-[#141620] to-[#10121a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-zinc-950 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-bold">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  Practice Mode
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Flame className="w-3 h-3 text-cyan-400 fill-current" />
                  <span>Stockfish Level {engineLevel}</span>
                  <span className="text-zinc-400 font-mono">({getEloForLevel(engineLevel).elo} Elo)</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Interactive Playable Board with Board Editor & Engine Analysis, Opening Explorer, and Play Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-flip-practice-board"
              onClick={() => setIsFlipped((prev) => !prev)}
              title="Flip Board Perspective"
              className="p-2 rounded-lg bg-[#1a1d27] hover:bg-[#222533] border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            >
              <Repeat className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              id="btn-close-practice-modal"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Top Board & Status Layout */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5">
            {/* Left Column: Board + Dedicated Bottom-of-Board FEN Bar */}
            <div className="w-full max-w-[380px] sm:max-w-[420px] flex flex-col items-center gap-2.5">
              {previewFen && (
                <div className="w-full px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200 shadow-md">
                  <div className="flex items-center gap-2 font-semibold">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>
                      Previewing Move {activeExplanationIndex !== null ? `#${activeExplanationIndex + 1}` : ''} on Board
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewFen(null);
                      setActiveExplanationIndex(null);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded bg-amber-500/30 hover:bg-amber-500/50 text-amber-100 cursor-pointer transition-colors"
                  >
                    Reset View
                  </button>
                </div>
              )}

              {/* The Fully Playable Chessboard */}
              <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-800/90 relative select-none">
              <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {(isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]).map((r) =>
                  (isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7]).map((c) => {
                    const piece = boardMatrix[r][c];
                    const file = String.fromCharCode(97 + c);
                    const rank = 8 - r;
                    const square = `${file}${rank}` as Square;
                    const isLight = (r + c) % 2 === 0;
                    const squareColorClass = isLight ? currentTheme.lightSquare : currentTheme.darkSquare;

                    const isSelected = selectedSquare === square;
                    const isLegalDest = legalDestinations.includes(square);
                    const isBestMoveSq =
                      engineAnalysis &&
                      (engineAnalysis.bestMoveFrom === square || engineAnalysis.bestMoveTo === square);

                    const isBestMoveFrom =
                      activeTab === 'editor' &&
                      isAnalysisMode &&
                      engineAnalysis?.bestMoveFrom === square;

                    const isBestMoveTo =
                      activeTab === 'editor' &&
                      isAnalysisMode &&
                      engineAnalysis?.bestMoveTo === square;

                    const isPopularFrom =
                      activeTab === 'explorer' &&
                      showPopularMoveOnBoard &&
                      popularMoveCoords?.fromSquare === square;

                    const isPopularTo =
                      activeTab === 'explorer' &&
                      showPopularMoveOnBoard &&
                      popularMoveCoords?.toSquare === square;

                    return (
                      <div
                        key={square}
                        onClick={() => {
                          if (activeTab === 'editor') handleSquareClickEditor(square);
                          else if (activeTab === 'explorer') handleSquareClickExplorer(square);
                          else if (activeTab === 'play_engine') handleSquareClickPlayEngine(square);
                          else if (activeTab === 'puzzles') handleSquareClickPuzzles(square);
                        }}
                        className={`relative flex items-center justify-center cursor-pointer transition-colors ${squareColorClass} ${
                          isSelected ? 'ring-4 ring-amber-400 ring-inset z-10' : ''
                        } ${
                          isBestMoveFrom ? 'ring-2 ring-cyan-400 ring-inset bg-cyan-500/25' : ''
                        } ${
                          isBestMoveTo ? 'ring-2 ring-cyan-400 ring-inset bg-cyan-500/35' : ''
                        } ${isBestMoveSq && !isBestMoveFrom && !isBestMoveTo ? 'bg-cyan-500/20' : ''} ${
                          isPopularFrom ? 'ring-2 ring-emerald-400 ring-inset bg-emerald-500/20' : ''
                        } ${isPopularTo ? 'bg-emerald-500/25 ring-2 ring-emerald-400 ring-inset' : ''}`}
                      >
                        {/* Piece Display */}
                        {piece && (
                          <div className="w-full h-full p-0.5">
                            <ChessPiece type={piece.type} color={piece.color} />
                          </div>
                        )}

                        {/* Playable Move Indicator: Legal Move Dot or Capture Ring */}
                        {isLegalDest && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            {piece ? (
                              <div className="w-full h-full border-4 border-amber-400/90 rounded-full" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full bg-amber-400/90 shadow-md ring-2 ring-black/40" />
                            )}
                          </div>
                        )}

                        {/* Destination Indicator Badge for Stockfish Suggested Move in Analysis Mode */}
                        {isBestMoveTo && !isSelected && !isLegalDest && (
                          <div className="absolute top-0.5 right-0.5 z-20 pointer-events-none">
                            <span className="px-1 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-500 text-zinc-950 shadow-sm flex items-center gap-0.5">
                              ⚡ {engineAnalysis?.bestMoveSan}
                            </span>
                          </div>
                        )}

                        {/* Destination Indicator Badge for Most Popular Move in Explorer */}
                        {isPopularTo && !isSelected && !isLegalDest && (
                          <div className="absolute top-0.5 right-0.5 z-20 pointer-events-none">
                            <span className="px-1 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-0.5">
                              ★ {popularMoveCoords?.san}
                            </span>
                          </div>
                        )}

                        {/* Coordinate labels */}
                        {c === (isFlipped ? 7 : 0) && (
                          <span
                            className={`absolute top-0.5 left-1 text-[9px] font-bold font-mono select-none ${
                              isLight
                                ? currentTheme.coordinateLight || 'text-zinc-700'
                                : currentTheme.coordinateDark || 'text-zinc-200'
                            }`}
                          >
                            {rank}
                          </span>
                        )}
                        {r === (isFlipped ? 0 : 7) && (
                          <span
                            className={`absolute bottom-0.5 right-1 text-[9px] font-bold font-mono select-none ${
                              isLight
                                ? currentTheme.coordinateLight || 'text-zinc-700'
                                : currentTheme.coordinateDark || 'text-zinc-200'
                            }`}
                          >
                            {file}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Visual Directional Arrow for Most Popular Move in Opening Explorer */}
              {activeTab === 'explorer' && showPopularMoveOnBoard && popularMoveCoords && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <marker
                      id="popular-move-arrowhead"
                      markerWidth="6"
                      markerHeight="6"
                      refX="4.5"
                      refY="3"
                      orient="auto"
                    >
                      <path d="M 0 0.8 L 5.5 3 L 0 5.2 z" fill="#10b981" />
                    </marker>
                  </defs>
                  <line
                    x1={`${popularMoveCoords.fromX}`}
                    y1={`${popularMoveCoords.fromY}`}
                    x2={`${popularMoveCoords.toX}`}
                    y2={`${popularMoveCoords.toY}`}
                    stroke="#10b981"
                    strokeWidth="2.4"
                    strokeOpacity="0.85"
                    strokeLinecap="round"
                    markerEnd="url(#popular-move-arrowhead)"
                  />
                </svg>
              )}

              {/* Visual Directional Arrow for Stockfish Suggested Move in Board Editor Analysis Mode */}
              {activeTab === 'editor' && isAnalysisMode && suggestedMoveCoords && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <marker
                      id="suggested-move-arrowhead"
                      markerWidth="6"
                      markerHeight="6"
                      refX="4.5"
                      refY="3"
                      orient="auto"
                    >
                      <path d="M 0 0.8 L 5.5 3 L 0 5.2 z" fill="#06b6d4" />
                    </marker>
                  </defs>
                  <line
                    x1={`${suggestedMoveCoords.fromX}`}
                    y1={`${suggestedMoveCoords.fromY}`}
                    x2={`${suggestedMoveCoords.toX}`}
                    y2={`${suggestedMoveCoords.toY}`}
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeOpacity="0.9"
                    strokeLinecap="round"
                    markerEnd="url(#suggested-move-arrowhead)"
                  />
                </svg>
              )}

              {/* Engine Thinking Overlay */}
              {isEngineThinking && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 text-white z-30">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span className="text-xs font-bold text-cyan-300 tracking-wider">
                    Stockfish Level {engineLevel} is calculating...
                  </span>
                </div>
              )}
            </div>

            {/* Bottom of the Board in Board Editor: Dedicated Copy FEN Bar for Uploading to AI */}
            {activeTab === 'editor' && (
              <div
                id="board-editor-bottom-fen-bar"
                className="w-full p-3 rounded-xl bg-[#141724] border border-cyan-500/40 shadow-xl space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                      Board FEN Position
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Copy & upload to AI assistant</span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    title={boardFen}
                    className="flex-1 bg-black/60 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-cyan-200 truncate select-all"
                  >
                    {boardFen}
                  </div>
                  <button
                    id="btn-bottom-copy-fen"
                    type="button"
                    onClick={handleCopyFen}
                    title="Copy FEN to clipboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      copiedFen
                        ? 'bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/30'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                    }`}
                  >
                    {copiedFen ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-zinc-950" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-950" />
                        <span>Copy FEN</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                  <p className="text-[10px] text-zinc-400">
                    Upload FEN to AI to get instant Grandmaster explanations
                  </p>
                  <button
                    id="btn-bottom-upload-fen-ai"
                    type="button"
                    onClick={() => {
                      handleCopyFen();
                      if (onOpenChatAiWithFen) {
                        onOpenChatAiWithFen(boardFen);
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 text-[11px] font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Send this FEN directly to Chat with AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Upload FEN to AI</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Status Sidebar */}
            <div className="w-full lg:w-72 flex flex-col gap-3">
              <div className="p-3.5 rounded-xl bg-[#181a24] border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Board Status
                  </span>
                  {activeTab === 'editor' && isAnalysisMode ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Analysis Play (Locked)</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Playable Board
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Side to move:</span>
                  <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full border ${
                        currentTurn === 'w' ? 'bg-white border-zinc-400' : 'bg-zinc-950 border-zinc-600'
                      }`}
                    />
                    {currentTurn === 'w' ? 'White to play' : 'Black to play'}
                  </span>
                </div>

                {activeTab === 'editor' && (
                  <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Current Mode:</span>
                      <span className="font-semibold text-cyan-300 flex items-center gap-1">
                        {isAnalysisMode ? (
                          <span className="text-cyan-300 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-cyan-400" />
                            <span>Playable (Editing Locked)</span>
                          </span>
                        ) : selectedTool === 'move' ? (
                          <>
                            <MousePointer className="w-3 h-3 text-emerald-400" />
                            <span>Move & Play Pieces</span>
                          </>
                        ) : selectedTool === 'trash' ? (
                          <>
                            <Trash2 className="w-3 h-3 text-red-400" />
                            <span>Erase Mode</span>
                          </>
                        ) : (
                          <>
                            <Layers className="w-3 h-3 text-cyan-400" />
                            <span>Placing {selectedTool}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {isAnalysisMode && engineAnalysis && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/50">
                        <span className="text-zinc-400">Engine Suggestion:</span>
                        <button
                          type="button"
                          onClick={handlePlaySuggestedMove}
                          disabled={isAnalyzing}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 font-mono font-bold border border-amber-500/50 flex items-center gap-1.5 text-xs cursor-pointer shadow-sm disabled:opacity-40 transition-all"
                          title={`Click to play ${engineAnalysis.bestMoveSan} on the board`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play {engineAnalysis.bestMoveSan}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'play_engine' && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/80">
                    <span className="text-zinc-400">Evaluation:</span>
                    <span className="font-mono font-bold text-amber-400">{engineEvalBar}</span>
                  </div>
                )}

                {activeTab === 'explorer' && (
                  <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-zinc-400 shrink-0">Opening:</span>
                      <span className="font-bold text-emerald-400 text-right truncate" title={identifiedOpening.openingName}>
                        {identifiedOpening.openingName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-zinc-400 shrink-0">Variation:</span>
                      <span className="font-bold text-amber-300 text-right truncate" title={identifiedOpening.variationName}>
                        {identifiedOpening.variationName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">ECO Code:</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {identifiedOpening.eco}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Moves Count:</span>
                      <span>{explorerMoveHistory.length} ply ({Math.ceil(explorerMoveHistory.length / 2)} moves)</span>
                    </div>

                    {mostPopularMove && (
                      <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-zinc-400 flex items-center gap-1 font-semibold">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>Popular Move:</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleExplorerMoveSelect(mostPopularMove.san)}
                            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold font-mono border border-amber-500/40 flex items-center gap-1 transition-colors cursor-pointer"
                            title={`Click to play popular move ${mostPopularMove.san}`}
                          >
                            <span>{mostPopularMove.san}</span>
                            <span className="text-[10px] text-amber-400/80">({mostPopularMove.popularityPct}%)</span>
                          </button>
                        </div>
                        <div className="text-[10px] text-zinc-400 text-right">
                          {mostPopularMove.gamesCount.toLocaleString()} games played
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Game Result Card for Play Engine */}
              {gameResult && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-semibold animate-fadeIn space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Game Finished</span>
                  </div>
                  <p>{gameResult}</p>
                  <button
                    onClick={() => startNewEngineGame(playerColor)}
                    className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Play Again
                  </button>
                </div>
              )}

              {/* Mode Context Hint */}
              <div className="p-3 rounded-xl bg-[#151722] border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
                {activeTab === 'editor' && (
                  <p>
                    <strong className="text-emerald-400">Playable Board:</strong> Click any piece to move it on the board! Use the palette below to place or clear pieces, and click the <strong className="text-cyan-400">Stockfish Engine Icon</strong> to analyze.
                  </p>
                )}
                {activeTab === 'explorer' && (
                  <p>
                    <strong className="text-emerald-400">Opening Explorer:</strong> Make moves on the board or click variations in the table to explore real master games on <strong className="text-zinc-200">Chess.com</strong> and <strong className="text-zinc-200">Lichess</strong>.
                  </p>
                )}
                {activeTab === 'play_engine' && (
                  <p>
                    <strong className="text-amber-400">Play Stockfish 18:</strong> Play full chess games against Stockfish 18 (2850+ Elo rating).
                  </p>
                )}
                {activeTab === 'puzzles' && (
                  <p>
                    <strong className="text-purple-400">Opening Puzzles:</strong> 200 tactical puzzles per variation for every opening! Solve forks, pins, skewers, Greek gifts, and mating attacks with real-time feedback.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* THE OPTIONS UNDER THE BOARD */}
          {/* ==================================================== */}
          <div className="pt-2 border-t border-zinc-800 space-y-4">
            {/* Main Tabs Selection (4 Modes) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl bg-[#10121a] border border-zinc-800/80 max-w-2xl mx-auto">
              <button
                id="tab-btn-board-editor"
                type="button"
                onClick={() => handleTabChange('editor')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181a24]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>1. Board Editor</span>
              </button>

              <button
                id="tab-btn-opening-explorer"
                type="button"
                onClick={() => handleTabChange('explorer')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'explorer'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181a24]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>2. Opening Explorer</span>
              </button>

              <button
                id="tab-btn-play-engine"
                type="button"
                onClick={() => handleTabChange('play_engine')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'play_engine'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-950 shadow-md font-black'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181a24]'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>3. Play Engine</span>
              </button>

              <button
                id="tab-btn-puzzles"
                type="button"
                onClick={() => handleTabChange('puzzles')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'puzzles'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md font-black'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181a24]'
                }`}
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>4. Puzzles</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-200 border border-purple-400/40 hidden sm:inline">
                  Puzzels
                </span>
              </button>
            </div>

            {/* OPTION 1: BOARD EDITOR */}
            {activeTab === 'editor' && (
              <div id="content-board-editor" className="space-y-4 animate-fadeIn">
                {/* Piece Palette & Tools OR Active Analysis Play Controls */}
                {isAnalysisMode ? (
                  <div
                    id="analysis-mode-locked-panel"
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#111927] via-[#131d2e] to-[#101724] border-2 border-cyan-500/60 shadow-xl space-y-4 animate-fadeIn"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-inner">
                          <Lock className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                              Analysis Mode Active • Board Editing Locked
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Playable Board
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-300 mt-0.5">
                            Board editing options are locked. Make moves on the board or click below to play the engine's recommendation.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id="btn-unlock-board-editor"
                          type="button"
                          onClick={handleUnlockBoardEditor}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                          title="Unlock board editing to place or remove pieces again"
                        >
                          <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Unlock & Edit Board</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Move Navigation Bar in Analysis Mode */}
                    <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/90 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Play Suggested Move Button */}
                        {engineAnalysis && (
                          <button
                            id="btn-analysis-bar-play-suggested"
                            type="button"
                            onClick={handlePlaySuggestedMove}
                            disabled={isAnalyzing}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-40 transition-all"
                            title={`Execute suggested move ${engineAnalysis.bestMoveSan}`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Play Engine Move ({engineAnalysis.bestMoveSan})</span>
                          </button>
                        )}

                        {/* Undo Move Button */}
                        <button
                          id="btn-analysis-undo-move"
                          type="button"
                          onClick={handleAnalysisUndo}
                          disabled={analysisFenHistory.length <= 1 || isAnalyzing}
                          className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-35 disabled:cursor-not-allowed text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
                          title="Take back last played move in analysis"
                        >
                          <Undo2 className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Undo Move</span>
                        </button>

                        {/* Reset Position Button */}
                        {analysisMoveHistory.length > 0 && (
                          <button
                            id="btn-analysis-reset-base"
                            type="button"
                            onClick={handleResetToAnalyzedBase}
                            disabled={isAnalyzing}
                            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-800"
                            title="Reset back to the analyzed starting position"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Reset Position</span>
                          </button>
                        )}
                      </div>

                      {/* Played Line in Analysis */}
                      {analysisMoveHistory.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-zinc-400 font-medium">Played in Analysis:</span>
                          <div className="flex items-center gap-1 overflow-x-auto max-w-xs font-mono font-bold text-amber-300">
                            {analysisMoveHistory.map((m, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[11px]">
                                {idx + 1}. {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard Piece Palette & Tools (When editing before running analysis) */
                  <div className="p-4 rounded-xl bg-[#161822] border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Board Palette & Actions
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {selectedTool === 'move' ? (
                          <span className="text-emerald-400 font-semibold">● Move Mode Active: Click any piece to play</span>
                        ) : (
                          <span>Brush active: <strong className="text-cyan-300 font-mono">{selectedTool}</strong> (click to place)</span>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Move / Play Mode Tool Button (ACTIVE BY DEFAULT) */}
                      <button
                        id="palette-tool-move"
                        type="button"
                        onClick={() => setSelectedTool('move')}
                        className={`h-9 px-3.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                          selectedTool === 'move'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md ring-2 ring-emerald-400'
                            : 'bg-[#10121a] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Move className="w-3.5 h-3.5" />
                        <span>Move / Play</span>
                      </button>

                      {/* White Pieces */}
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#10121a] border border-zinc-800">
                        {(['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] as const).map((pCode) => (
                          <button
                            key={pCode}
                            id={`palette-${pCode}`}
                            type="button"
                            onClick={() => setSelectedTool(selectedTool === pCode ? 'move' : pCode)}
                            title={`Place ${pCode}`}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center p-1 transition-all cursor-pointer ${
                              selectedTool === pCode
                                ? 'bg-cyan-500/30 border border-cyan-400 ring-2 ring-cyan-400/40 shadow-sm'
                                : 'hover:bg-zinc-800/80 border border-transparent'
                            }`}
                          >
                            <ChessPiece type={pCode[1].toLowerCase() as any} color="w" />
                          </button>
                        ))}
                      </div>

                      {/* Black Pieces */}
                      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#10121a] border border-zinc-800">
                        {(['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'] as const).map((pCode) => (
                          <button
                            key={pCode}
                            id={`palette-${pCode}`}
                            type="button"
                            onClick={() => setSelectedTool(selectedTool === pCode ? 'move' : pCode)}
                            title={`Place ${pCode}`}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center p-1 transition-all cursor-pointer ${
                              selectedTool === pCode
                                ? 'bg-cyan-500/30 border border-cyan-400 ring-2 ring-cyan-400/40 shadow-sm'
                                : 'hover:bg-zinc-800/80 border border-transparent'
                            }`}
                          >
                            <ChessPiece type={pCode[1].toLowerCase() as any} color="b" />
                          </button>
                        ))}
                      </div>

                      {/* Erase Tool */}
                      <button
                        id="palette-trash"
                        type="button"
                        onClick={() => setSelectedTool(selectedTool === 'trash' ? 'move' : 'trash')}
                        className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                          selectedTool === 'trash'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 ring-2 ring-red-500/30'
                            : 'bg-[#10121a] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Erase</span>
                      </button>

                      {/* Starting Board & Clear All Actions */}
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          id="btn-editor-starting-pos"
                          type="button"
                          onClick={handleResetStartingPosition}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                        >
                          Starting Board
                        </button>

                        {/* CLEAR ALL BUTTON: Completely clears all pieces to an empty 8x8 board */}
                        <button
                          id="btn-editor-clear-board"
                          type="button"
                          onClick={handleClearBoard}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          <span>Clear All</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* THE ENGINE ICON BUTTON TO RUN ANALYSIS */}
                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#172236] via-[#141d2f] to-[#121927] border border-cyan-500/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-zinc-950 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <span>Stockfish Engine Analysis</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          DEPTH 18
                        </span>
                      </h4>
                      <p className="text-xs text-zinc-300">
                        Calculate exact position evaluation, tactical threats, and recommended continuation
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-analyze-engine-position"
                    type="button"
                    onClick={handleAnalyzeWithStockfish}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 text-zinc-950 shadow-md shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                        <span>Calculating Depth 18...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Run Stockfish 18 Analysis</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Error Banner */}
                {analysisError && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200">
                    {analysisError}
                  </div>
                )}

                {/* Thorough Stockfish 18 Analysis Results & Move-by-Move Explanations */}
                {engineAnalysis && (
                  <div
                    id="engine-analysis-results"
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#161824] to-[#12141d] border border-cyan-500/40 shadow-xl space-y-5 animate-fadeIn"
                  >
                    {/* Top Overview & Best Move Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-cyan-500/50 font-mono font-black text-xl text-cyan-300 shadow-inner">
                          {engineAnalysis.evalScore}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                            {engineAnalysis.status === 'white_winning' && 'White has a decisive winning advantage'}
                            {engineAnalysis.status === 'white_better' && 'White holds a distinct positional edge'}
                            {engineAnalysis.status === 'equal' && 'Position is dynamically balanced'}
                            {engineAnalysis.status === 'black_better' && 'Black holds a distinct positional edge'}
                            {engineAnalysis.status === 'black_winning' && 'Black has a decisive winning advantage'}
                            {engineAnalysis.status === 'checkmate' && 'Forced Checkmate sequence'}
                          </div>
                          <div className="text-[11px] text-cyan-400/90 font-medium">
                            Stockfish 18 Deep Search • Depth 18 ply • Multi-PV Grandmaster Evaluation
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 font-semibold">Recommended Move:</span>
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 font-mono font-bold text-base shadow-sm">
                          {engineAnalysis.bestMoveSan}
                        </div>
                        <button
                          id="btn-play-engine-best-move"
                          type="button"
                          onClick={handlePlaySuggestedMove}
                          disabled={isAnalyzing}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-40 transition-all"
                          title={`Play ${engineAnalysis.bestMoveSan} on the board`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play Move</span>
                        </button>
                      </div>
                    </div>

                    {/* Thorough Positional Assessment Section */}
                    {engineAnalysis.thoroughAssessment && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            <span>Thorough Positional Assessment</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">Holistic Strategic Breakdown</span>
                        </div>

                        {/* Overall Summary Box */}
                        <div className="p-3.5 rounded-xl bg-[#1a1f2e] border border-cyan-500/30 text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                          {engineAnalysis.thoroughAssessment.overallSummary}
                        </div>

                        {/* 4 Pillars Grid: Material, King Safety, Center & Space, Piece Activity */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Material */}
                          <div className="p-3 rounded-xl bg-[#141722] border border-zinc-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                              <span className="w-2 h-2 rounded-full bg-blue-400" />
                              <span>Material Balance</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {engineAnalysis.thoroughAssessment.materialStatus}
                            </p>
                          </div>

                          {/* King Safety */}
                          <div className="p-3 rounded-xl bg-[#141722] border border-zinc-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                              <span className="w-2 h-2 rounded-full bg-red-400" />
                              <span>King Safety</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {engineAnalysis.thoroughAssessment.kingSafety}
                            </p>
                          </div>

                          {/* Center & Space */}
                          <div className="p-3 rounded-xl bg-[#141722] border border-zinc-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span>Center & Space Control</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {engineAnalysis.thoroughAssessment.centerAndSpace}
                            </p>
                          </div>

                          {/* Piece Activity */}
                          <div className="p-3 rounded-xl bg-[#141722] border border-zinc-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              <span>Piece Activity & Outposts</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {engineAnalysis.thoroughAssessment.pieceActivity}
                            </p>
                          </div>
                        </div>

                        {/* Tactical Motifs & Threats */}
                        {engineAnalysis.thoroughAssessment.keyTactics.length > 0 && (
                          <div className="p-3 rounded-xl bg-[#131620] border border-zinc-800/80 space-y-1.5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" />
                              <span>Active Tactical Motifs & Threats</span>
                            </div>
                            <ul className="space-y-1">
                              {engineAnalysis.thoroughAssessment.keyTactics.map((tactic, idx) => (
                                <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                  <span>{tactic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Move-by-Move Explanations Section */}
                    {engineAnalysis.moveExplanations && engineAnalysis.moveExplanations.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-zinc-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                            <BookOpen className="w-4 h-4 text-amber-400" />
                            <span>Move-by-Move Explanations & Continuation</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            Click any move to preview on board
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {engineAnalysis.moveExplanations.map((item, idx) => {
                            const isCurrentlyActive = activeExplanationIndex === idx;
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border transition-all ${
                                  isCurrentlyActive
                                    ? 'bg-[#1b2234] border-cyan-400 shadow-md ring-1 ring-cyan-400'
                                    : 'bg-[#141620] border-zinc-800 hover:border-zinc-700'
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 font-mono font-bold text-xs text-cyan-300">
                                      #{idx + 1}
                                    </span>
                                    <span className="font-mono font-bold text-sm text-zinc-100">
                                      {item.moveNumber}. {item.color === 'w' ? '' : '... '}{item.san}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                      {item.tacticalConcept}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handlePlayExplanationMove(item)}
                                      disabled={isAnalyzing}
                                      className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 disabled:opacity-40"
                                      title={`Play ${item.san} directly on the board`}
                                    >
                                      <Play className="w-3 h-3 fill-current" />
                                      <span>Play Move</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isCurrentlyActive) {
                                          setPreviewFen(null);
                                          setActiveExplanationIndex(null);
                                        } else {
                                          setPreviewFen(item.fenAfter);
                                          setActiveExplanationIndex(idx);
                                        }
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                        isCurrentlyActive
                                          ? 'bg-cyan-500 text-zinc-950 shadow'
                                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                      }`}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>{isCurrentlyActive ? 'Current Preview' : 'Preview Step'}</span>
                                    </button>
                                  </div>
                                </div>

                                <p className="mt-2 text-xs text-zinc-200 leading-relaxed font-normal">
                                  {item.explanation}
                                </p>

                                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-cyan-400/90 font-medium">
                                  <ArrowRight className="w-3 h-3 shrink-0" />
                                  <span>Idea: {item.threatOrIdea}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FEN Management Input */}
                <div className="p-3 rounded-xl bg-[#111319] border border-zinc-800 flex flex-col sm:flex-row items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-semibold shrink-0">
                    {isAnalysisMode && <Lock className="w-3 h-3 text-cyan-400" />}
                    <span>FEN:</span>
                  </div>
                  <input
                    id="input-editor-fen"
                    type="text"
                    disabled={isAnalysisMode}
                    value={customFenInput}
                    onChange={(e) => setCustomFenInput(e.target.value)}
                    placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                    className={`flex-1 w-full bg-black/40 border border-zinc-800 rounded px-2.5 py-1 font-mono text-[11px] ${
                      isAnalysisMode ? 'text-zinc-500 cursor-not-allowed' : 'text-zinc-300'
                    }`}
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      id="btn-apply-fen"
                      type="button"
                      disabled={isAnalysisMode}
                      onClick={handleApplyCustomFen}
                      className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-colors ${
                        isAnalysisMode
                          ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer'
                      }`}
                      title={isAnalysisMode ? 'Board editing locked during analysis. Unlock above to load new FEN.' : 'Apply FEN to board'}
                    >
                      Load FEN
                    </button>
                    <button
                      id="btn-copy-fen"
                      type="button"
                      onClick={handleCopyFen}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedFen ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedFen ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* OPTION 2: OPENING EXPLORER (CHESS.COM & LICHESS) */}
            {activeTab === 'explorer' && (
              <div id="content-opening-explorer" className="space-y-4 animate-fadeIn">
                {/* Platform Selector Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#161822] border border-zinc-800">
                  <div>
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      Opening Explorer Database
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Make moves on the board or select lines to view games played and win percentages
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chess.com Option */}
                    <button
                      id="explorer-btn-chesscom"
                      type="button"
                      onClick={() => setExplorerPlatform('chess.com')}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        explorerPlatform === 'chess.com'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-2 ring-emerald-400'
                          : 'bg-[#10121a] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 flex items-center justify-center text-[8px] text-black font-black">
                        C
                      </div>
                      <span>Chess.com</span>
                    </button>

                    {/* Lichess Option */}
                    <button
                      id="explorer-btn-lichess"
                      type="button"
                      onClick={() => setExplorerPlatform('lichess')}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        explorerPlatform === 'lichess'
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40 ring-2 ring-sky-400'
                          : 'bg-[#10121a] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-sky-400 flex items-center justify-center text-[8px] text-black font-black">
                        ♞
                      </div>
                      <span>Lichess</span>
                    </button>
                  </div>
                </div>

                {/* IDENTIFIED OPENING & VARIATION HERO DISPLAY */}
                <div
                  id="explorer-opening-variation-banner"
                  className="p-4 rounded-xl bg-gradient-to-r from-[#10241f] via-[#122228] to-[#111c25] border border-emerald-500/40 shadow-lg shadow-emerald-950/20 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                        {identifiedOpening.eco}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-800/80 text-zinc-300 border border-zinc-700">
                        {identifiedOpening.isBook ? 'Recognized Opening' : 'Position Continuation'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-400">
                        <strong className="text-zinc-200">{openingStats?.totalGames.toLocaleString()}</strong> games in{' '}
                        <span className="font-semibold text-emerald-400">
                          {explorerPlatform === 'chess.com' ? 'Chess.com' : 'Lichess'}
                        </span>
                      </span>
                      <button
                        id="btn-explorer-back"
                        type="button"
                        onClick={handleExplorerStepBack}
                        disabled={explorerFenHistory.length <= 1}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <button
                        id="btn-explorer-reset"
                        type="button"
                        onClick={handleExplorerReset}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Stated Opening & Variation Highlight Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/30">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Opening</span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
                        {identifiedOpening.openingName}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 border border-amber-500/30">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Variation</span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5 tracking-tight">
                        {identifiedOpening.variationName}
                      </div>
                    </div>
                  </div>

                  {/* MOST POPULAR MOVE IN THIS POSITION SPOTLIGHT CARD */}
                  {mostPopularMove && (
                    <div
                      id="explorer-most-popular-card"
                      className="p-3.5 rounded-xl bg-gradient-to-r from-[#17251d] via-[#1b2c21] to-[#14232c] border border-amber-500/50 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 sm:mt-0 shadow-inner">
                          <Flame className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>Most Popular Move</span>
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-300">
                              {mostPopularMove.popularityPct}% player choice
                            </span>
                            <span className="text-zinc-500 text-xs">•</span>
                            <span className="text-xs text-zinc-300">
                              <strong className="text-white">{mostPopularMove.gamesCount.toLocaleString()}</strong> games
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                            <span className="text-2xl font-mono font-black text-amber-300 tracking-tight">
                              {mostPopularMove.san}
                            </span>
                            <span className="text-sm font-bold text-zinc-100">
                              {mostPopularMove.nextVariationName || mostPopularMove.name}
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-400/90">
                              ({mostPopularMove.nextEco || mostPopularMove.eco})
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2 flex-wrap font-medium">
                            <span>Outcomes:</span>
                            <span className="font-semibold text-zinc-200">{mostPopularMove.whiteWinPct}% White Wins</span>
                            <span className="text-zinc-600">/</span>
                            <span className="font-semibold text-zinc-400">{mostPopularMove.drawPct}% Draws</span>
                            <span className="text-zinc-600">/</span>
                            <span className="font-semibold text-zinc-200">{mostPopularMove.blackWinPct}% Black Wins</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                        <button
                          id="btn-play-popular-move"
                          type="button"
                          onClick={() => handleExplorerMoveSelect(mostPopularMove.san)}
                          className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-950/40 cursor-pointer hover:scale-[1.02] active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play Popular Move ({mostPopularMove.san})</span>
                        </button>
                        <button
                          id="btn-toggle-popular-arrow"
                          type="button"
                          onClick={() => setShowPopularMoveOnBoard((prev) => !prev)}
                          title={showPopularMoveOnBoard ? 'Hide Popular Move Arrow on Board' : 'Show Popular Move Arrow on Board'}
                          className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            showPopularMoveOnBoard
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {showPopularMoveOnBoard ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          <span className="hidden sm:inline">{showPopularMoveOnBoard ? 'Board Arrow' : 'Arrow Off'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Move Breadcrumbs / Played Line */}
                  {explorerMoveHistory.length > 0 ? (
                    <div className="p-2.5 rounded-lg bg-[#0e141a] border border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs font-mono">
                      <span className="text-zinc-500 text-[11px] font-bold shrink-0">Moves Played:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {explorerMoveHistory.map((m, i) => (
                          <span
                            key={i}
                            className={`px-1.5 py-0.5 rounded text-xs ${
                              i === explorerMoveHistory.length - 1
                                ? 'bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-500/40'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-400 italic">
                      Click any candidate move below or play moves directly on the board to explore openings.
                    </div>
                  )}
                </div>

                {/* Statistics Table */}
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#141620]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#181a26] text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                      <tr>
                        <th className="py-2.5 px-3">Next Move</th>
                        <th className="py-2.5 px-3">Resulting Opening / Variation</th>
                        <th className="py-2.5 px-3">Popularity (% Share)</th>
                        <th className="py-2.5 px-3 text-right">People / Games Played</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Win % (White / Draw / Black)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-medium">
                      {candidateMovesWithDetails && candidateMovesWithDetails.length > 0 ? (
                        candidateMovesWithDetails.map((move) => (
                          <tr
                            key={move.san}
                            onClick={() => handleExplorerMoveSelect(move.san)}
                            className={`hover:bg-zinc-800/50 cursor-pointer transition-colors group ${
                              move.isMostPopular ? 'bg-amber-500/[0.04]' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-300 group-hover:text-amber-200">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/25 transition-colors">
                                  {move.san}
                                </span>
                                {move.isMostPopular ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm">
                                    <Flame className="w-2.5 h-2.5 text-amber-400" />
                                    <span>Most Popular</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-800/80">
                                    #{move.rank}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-zinc-200">
                              <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                                <span>{move.nextVariationName || move.name}</span>
                              </div>
                              <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <span className="text-emerald-300/90">{move.nextOpeningName}</span>
                                <span className="text-zinc-600">•</span>
                                <span className="font-mono text-amber-400/90 text-[10px]">{move.nextEco || move.eco}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className={move.isMostPopular ? 'font-black text-amber-300' : 'text-zinc-300'}>
                                    {move.popularityPct}%
                                  </span>
                                  {move.isMostPopular && (
                                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Top Move</span>
                                  )}
                                </div>
                                <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      move.isMostPopular ? 'bg-amber-400' : 'bg-emerald-500/70'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(8, move.relativePopularity))}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-zinc-300">
                              {move.gamesCount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3">
                              {/* Visual tripartite win rate bar */}
                              <div className="space-y-1">
                                <div className="h-4 rounded-md overflow-hidden flex text-[10px] font-bold text-center font-mono">
                                  <div
                                    style={{ width: `${move.whiteWinPct}%` }}
                                    className="bg-zinc-200 text-zinc-950 flex items-center justify-center"
                                    title={`White Win: ${move.whiteWinPct}% (${move.whiteWins.toLocaleString()} games)`}
                                  >
                                    {move.whiteWinPct >= 18 && `${move.whiteWinPct}%`}
                                  </div>
                                  <div
                                    style={{ width: `${move.drawPct}%` }}
                                    className="bg-zinc-600 text-zinc-200 flex items-center justify-center border-x border-zinc-700"
                                    title={`Draw: ${move.drawPct}% (${move.draws.toLocaleString()} games)`}
                                  >
                                    {move.drawPct >= 18 && `${move.drawPct}%`}
                                  </div>
                                  <div
                                    style={{ width: `${move.blackWinPct}%` }}
                                    className="bg-zinc-950 text-zinc-300 flex items-center justify-center"
                                    title={`Black Win: ${move.blackWinPct}% (${move.blackWins.toLocaleString()} games)`}
                                  >
                                    {move.blackWinPct >= 18 && `${move.blackWinPct}%`}
                                  </div>
                                </div>
                                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                  <span>White: {move.whiteWinPct}%</span>
                                  <span>Draw: {move.drawPct}%</span>
                                  <span>Black: {move.blackWinPct}%</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-zinc-500">
                            No further book moves for this position. Click "Reset" or "Back".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* OPTION 3: PLAY ENGINE (STOCKFISH ENGINE) */}
            {activeTab === 'play_engine' && (
              <div id="content-play-engine" className="space-y-4 animate-fadeIn">
                {/* Engine Level Configuration (1 to 18) */}
                <div
                  id="engine-level-selector-box"
                  className="p-4 rounded-xl bg-gradient-to-r from-[#141a29] via-[#161f30] to-[#121927] border border-cyan-500/40 shadow-lg space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                        <Gauge className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                          <span>Engine Difficulty Level</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/25 text-cyan-300 border border-cyan-500/40">
                            Level {engineLevel} / 18
                          </span>
                        </div>
                        <div className="text-[11px] text-cyan-300 font-medium">
                          {getEloForLevel(engineLevel).title} • {getEloForLevel(engineLevel).elo} Elo
                        </div>
                      </div>
                    </div>

                    {/* Direct Level Number Input with Stepper Controls */}
                    <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-700/80 rounded-xl p-1">
                      <button
                        id="btn-engine-level-minus"
                        type="button"
                        onClick={() => setEngineLevel((prev) => Math.max(1, prev - 1))}
                        disabled={engineLevel <= 1}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                        title="Decrease Level"
                      >
                        -
                      </button>

                      <div className="flex items-center px-1">
                        <span className="text-[11px] text-zinc-400 font-bold mr-1">Level:</span>
                        <input
                          id="input-engine-level-direct"
                          type="number"
                          min={1}
                          max={18}
                          value={engineLevel}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              setEngineLevel(Math.min(18, Math.max(1, val)));
                            }
                          }}
                          className="w-12 py-0.5 rounded bg-zinc-900 border border-zinc-600 text-cyan-300 font-mono font-black text-center text-sm focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <button
                        id="btn-engine-level-plus"
                        type="button"
                        onClick={() => setEngineLevel((prev) => Math.min(18, prev + 1))}
                        disabled={engineLevel >= 18}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                        title="Increase Level"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Smooth Range Slider from 1 to 18 */}
                  <div className="space-y-1">
                    <input
                      id="slider-engine-level"
                      type="range"
                      min={1}
                      max={18}
                      step={1}
                      value={engineLevel}
                      onChange={(e) => setEngineLevel(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono px-0.5">
                      <span>1 (Novice)</span>
                      <span>5 (Club)</span>
                      <span>10 (Expert)</span>
                      <span>14 (Master)</span>
                      <span>18 (Max 2950 Elo)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 italic">
                    {getEloForLevel(engineLevel).desc}
                  </p>
                </div>

                {/* Game Controls & Color Chooser */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#161822] border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-300">Play as:</span>
                    <button
                      id="btn-play-as-white"
                      type="button"
                      onClick={() => {
                        setPlayerColor('w');
                        startNewEngineGame('w');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        playerColor === 'w'
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-300'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      White
                    </button>
                    <button
                      id="btn-play-as-black"
                      type="button"
                      onClick={() => {
                        setPlayerColor('b');
                        startNewEngineGame('b');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        playerColor === 'b'
                          ? 'bg-amber-400 text-zinc-950 border-amber-300'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      Black
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id="btn-play-undo"
                      type="button"
                      onClick={handleUndoMoveEngine}
                      disabled={engineGameHistory.length < 2 || isEngineThinking}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Takeback</span>
                    </button>

                    <button
                      id="btn-play-new-game"
                      type="button"
                      onClick={() => startNewEngineGame(playerColor)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>New Game</span>
                    </button>
                  </div>
                </div>

                {/* Move Notation List */}
                <div className="p-3 rounded-xl bg-[#111319] border border-zinc-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Move Notation
                  </div>
                  {engineGameHistory.length === 0 ? (
                    <div className="text-xs text-zinc-500 italic py-2">
                      Click your pieces on the board above to play against Stockfish 18.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto font-mono text-xs">
                      {engineGameHistory.map((m, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded ${
                            idx % 2 === 0 ? 'bg-zinc-800 text-zinc-200' : 'bg-[#1c1f2e] text-cyan-300'
                          }`}
                        >
                          {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
                          {m.san}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* OPTION 4: PUZZLES */}
            {activeTab === 'puzzles' && (
              <OpeningPuzzlesSection
                currentFen={boardFen}
                onUpdateBoardFen={handleUpdateBoardFenFromPuzzles}
                onSetIsFlipped={setIsFlipped}
                onRegisterMoveAttempt={(fn) => {
                  onPuzzleMoveAttemptRef.current = fn;
                }}
                initialOpeningId={initialOpeningId}
                initialVariationId={initialVariationId}
                onOpenChatAiWithFen={onOpenChatAiWithFen}
                onPreviewFenChange={(fen) => setPreviewFen(fen)}
              />
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#10121a] flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Stockfish 18 Engine Analysis • Depth 18 Evaluation</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Practice
          </button>
        </div>
      </div>
    </div>
  );
};
