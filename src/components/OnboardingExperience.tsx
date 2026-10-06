import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { getCachedTranslation, translateTexts } from '../utils/translationClient';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  GraduationCap,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

type OnboardingMode = 'tour' | 'basics';
type ArrowMark = { from: string; to: string; label?: string; illegal?: boolean };
type LessonStep = {
  title: string;
  narration: string;
  fen: string;
  highlights?: string[];
  arrows?: ArrowMark[];
  badge?: string;
};

interface OnboardingExperienceProps {
  initialMode: OnboardingMode;
  language: string;
  onFinish: (skipped: boolean) => void;
  onOpenPractice: () => void;
  onClosePractice: () => void;
}

type TourStep = {
  target: string;
  title: string;
  text: string;
  activate?: string;
  openPractice?: boolean;
  closePractice?: boolean;
};

const tourSteps: TourStep[] = [
  {
    target: '#opening-explorer',
    title: 'Your chess home',
    text: 'This is your opening library. Browse both sides, choose a system, then study its plans, variations, and master explanations.',
  },
  {
    target: '#tab-all-openings',
    title: 'Choose a side',
    text: 'Switch between all openings, White systems, and Black defenses. Search by name or ECO code, or filter by playing style.',
  },
  {
    target: '#opening-card-ruy-lopez',
    title: 'Explore an opening',
    text: 'Each card shows its color, classification, ECO range, and available lines. Major systems stay open; premium previews are clearly marked.',
  },
  {
    target: '#variation-selector',
    title: 'Compare variations',
    text: 'An opening can branch into many move orders. Pick a variation to load its board, plans, and move-by-move explanations.',
  },
  {
    target: '#chessboard-container',
    title: 'Follow the board',
    text: 'The board updates as you select moves. Use the move controls or arrow keys to step through the line; highlighted squares show the latest move.',
  },
  {
    target: '#move-explanation-panel',
    title: 'Understand the ideas',
    text: 'Read why each move works, what it threatens, and which mistakes to avoid. You can jump to any move from the explanation panel.',
  },
  {
    target: '#navbar-board-theme-select',
    title: 'Make the board yours',
    text: 'Choose a board theme here. The board menu also lets you flip orientation; sound and light mode are nearby. Piece styles are not separately configurable yet.',
  },
  {
    target: '#navbar-flip-board-btn',
    title: 'Change perspective',
    text: 'Flip between White and Black perspective. Choosing a Black opening also turns the board automatically.',
  },
  {
    target: '#navbar-sound-toggle-btn',
    title: 'Sound and settings',
    text: 'Toggle move sounds here. Language, board appearance, orientation, and color mode are all available from the top bar.',
  },
  {
    target: '#navbar-practice-mode-btn',
    title: 'Open Practice Mode',
    text: 'Practice Mode brings together the board editor, opening explorer, Stockfish analysis, engine games, and tactical puzzles.',
  },
  {
    target: '#tab-btn-board-editor',
    title: 'Build a position',
    text: 'The Board Editor lets you place, remove, or move pieces. Set both kings, then run Stockfish analysis on a legal custom position.',
    openPractice: true,
    activate: '#tab-btn-board-editor',
  },
  {
    target: '#btn-analyze-engine-position',
    title: 'Read engine analysis',
    text: 'Stockfish gives a position evaluation and a recommended line. The score estimates the balance; positive favors White, negative favors Black.',
    activate: '#tab-btn-board-editor',
  },
  {
    target: '#tab-btn-opening-explorer',
    title: 'Study move statistics',
    text: 'The Practice Opening Explorer compares popular continuations and results from Chess.com and Lichess as you explore a position.',
    activate: '#tab-btn-opening-explorer',
  },
  {
    target: '#tab-btn-play-engine',
    title: 'Play the engine',
    text: 'Choose Play Engine to start a game against Stockfish. Select a difficulty from beginner-friendly levels up to level 18.',
    activate: '#tab-btn-play-engine',
  },
  {
    target: '#engine-level-selector-box',
    title: 'Choose your challenge',
    text: 'Set the engine level before playing. Lower levels are easier; higher levels provide a tougher opponent.',
    activate: '#tab-btn-play-engine',
  },
  {
    target: '#tab-btn-puzzles',
    title: 'Train with puzzles',
    text: 'Puzzles ask you to find a tactical idea. Try a move on the board and get immediate feedback; use the puzzle controls for hints and navigation.',
    activate: '#tab-btn-puzzles',
  },
  {
    target: '#navbar-go-premium-btn',
    title: 'Premium, when you need it',
    text: 'The free library is ready to explore. Expanded and Complete plans add access to more openings and lines; there is no need to upgrade to begin learning.',
    closePractice: true,
  },
  {
    target: '#navbar-language-menu summary',
    title: 'Language and replay',
    text: 'Use the three-dot menu to change languages or replay this tour and the Chess Basics lesson whenever you want.',
  },
];

const startingFen = new Chess().fen();
const kingsOnlyFen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
const queenFen = '4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1';
const rookFen = '4k3/8/8/8/R7/8/8/4K3 w - - 0 1';
const bishopFen = '4k3/8/8/8/8/8/8/2B1K3 w - - 0 1';
const knightFen = '4k3/8/8/8/3N4/8/8/4K3 w - - 0 1';
const pawnFen = '4k3/8/8/8/4P3/8/8/4K3 w - - 0 1';
const pawnCaptureFen = '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1';
const promotionFen = '4k3/P7/8/8/8/8/8/4K3 w - - 0 1';
const kingSafetyFen = '6k1/8/8/8/8/8/r7/4K3 w - - 0 1';
const castlingFen = '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1';

function positionAfter(moves: string[]): string {
  const chess = new Chess();
  moves.forEach((move) => chess.move(move));
  return chess.fen();
}

const enPassantFen = positionAfter(['e4', 'a6', 'e5', 'd5']);
const miniGameMoves = ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#'];

const lessonSteps: LessonStep[] = [
  { title: 'This is a chessboard', narration: 'This is a chessboard. It is where both players place their pieces and make moves.', fen: startingFen, badge: 'Start here' },
  { title: 'Eight by eight', narration: 'The board has eight columns and eight rows. Eight times eight gives sixty-four squares.', fen: startingFen, highlights: ['a8', 'h8', 'a1', 'h1'], badge: '8 × 8 · 64 squares' },
  { title: 'Light and dark squares', narration: 'Squares alternate between light and dark. A light square belongs beside a dark square, never another light square.', fen: startingFen, highlights: ['a1', 'b1', 'a2', 'b2'], badge: 'Light · Dark' },
  { title: 'Files', narration: 'The vertical columns are called files. They are named with letters from a through h.', fen: startingFen, highlights: ['a8', 'a7', 'a6', 'a5', 'a4', 'a3', 'a2', 'a1'], badge: 'Files · a to h' },
  { title: 'Ranks', narration: 'The horizontal rows are called ranks. They are numbered from one to eight, starting at White’s side.', fen: startingFen, highlights: ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'], badge: 'Ranks · 1 to 8' },
  { title: 'Coordinates', narration: 'Every square has a name: its file letter followed by its rank number. Here are A1, E4, and H8.', fen: startingFen, highlights: ['a1', 'e4', 'h8'], arrows: [{ from: 'a1', to: 'a1', label: 'A1' }, { from: 'e4', to: 'e4', label: 'E4' }, { from: 'h8', to: 'h8', label: 'H8' }], badge: 'Square coordinates' },
  { title: 'White and Black', narration: 'White starts at the bottom and moves first. Black starts at the top. Each player controls sixteen pieces.', fen: startingFen, highlights: ['a1', 'h1', 'a8', 'h8'], badge: 'White moves first' },
  { title: 'The starting position', narration: 'Each side begins with one king, one queen, two rooks, two bishops, two knights, and eight pawns.', fen: startingFen, highlights: ['e1', 'd1', 'a1', 'c1', 'b1', 'a2'], badge: '16 pieces per side' },
  { title: 'The king', narration: 'The king moves one square in any direction. It captures the same way, but it can never move onto a square attacked by the other side.', fen: kingsOnlyFen, highlights: ['e1'], arrows: [{ from: 'e1', to: 'd2' }, { from: 'e1', to: 'e2' }, { from: 'e1', to: 'f2' }], badge: 'One square · Any direction' },
  { title: 'Protect your king', narration: 'The king is the most important piece. Keep it safe. A king may not capture a protected piece or move into check.', fen: kingSafetyFen, highlights: ['e1', 'a2'], arrows: [{ from: 'e1', to: 'e2', label: 'Illegal: attacked', illegal: true }, { from: 'e1', to: 'd1', label: 'Safe square' }], badge: 'Never move into check' },
  { title: 'Check', narration: 'Check means the king is under attack. The player must get out of check by moving the king, blocking the attack, or capturing the attacker.', fen: 'k7/8/8/8/8/8/8/R3K3 w - - 0 1', highlights: ['a8', 'a1'], arrows: [{ from: 'a1', to: 'a8', label: 'Rook attack' }], badge: 'Answer every check' },
  { title: 'The queen', narration: 'The queen slides any number of empty squares along a rank, file, or diagonal. It captures an enemy piece on its path, but cannot jump over pieces.', fen: queenFen, highlights: ['d4'], arrows: [{ from: 'd4', to: 'h4' }, { from: 'd4', to: 'd8' }, { from: 'd4', to: 'g7' }], badge: 'Rank · File · Diagonal' },
  { title: 'The queen attacks and captures', narration: 'A queen attacks every square along its open lines. If an enemy piece is on one of those squares, the queen can capture it.', fen: '4k3/8/8/8/3Q4/8/6p1/4K3 w - - 0 1', highlights: ['d4', 'g1'], arrows: [{ from: 'd4', to: 'g1', label: 'Capture' }], badge: 'Powerful, but cannot jump' },
  { title: 'The rook', narration: 'A rook slides any number of empty squares horizontally or vertically. It captures along those same straight lines.', fen: rookFen, highlights: ['a4'], arrows: [{ from: 'a4', to: 'h4' }, { from: 'a4', to: 'a8' }], badge: 'Ranks and files' },
  { title: 'The bishop', narration: 'A bishop slides diagonally through empty squares and captures along a diagonal. Each bishop stays on the same colour of square for the whole game.', fen: bishopFen, highlights: ['c1', 'h6'], arrows: [{ from: 'c1', to: 'h6', label: 'Same square colour' }], badge: 'Diagonals only' },
  { title: 'The knight', narration: 'A knight moves in an L shape: two squares one way, then one square sideways. It can jump over pieces, and captures the piece on its landing square.', fen: knightFen, highlights: ['d4'], arrows: [{ from: 'd4', to: 'e6' }, { from: 'd4', to: 'f5' }, { from: 'd4', to: 'f3' }, { from: 'd4', to: 'e2' }, { from: 'd4', to: 'c2' }, { from: 'd4', to: 'b3' }, { from: 'd4', to: 'b5' }, { from: 'd4', to: 'c6' }], badge: 'The only jumping piece' },
  { title: 'The pawn', narration: 'A pawn moves forward one square into an empty square. From its starting square, it may move forward two squares if both are clear.', fen: pawnFen, highlights: ['e2', 'e3', 'e4'], arrows: [{ from: 'e2', to: 'e3', label: 'One square' }, { from: 'e2', to: 'e4', label: 'First move only' }], badge: 'Forward only' },
  { title: 'Pawns capture diagonally', narration: 'A pawn does not capture straight ahead. It captures one square diagonally forward. Here the white pawn can take the black pawn on D5.', fen: pawnCaptureFen, highlights: ['e4', 'd5'], arrows: [{ from: 'e4', to: 'd5', label: 'Capture' }], badge: 'Move forward · Capture diagonally' },
  { title: 'Pawn promotion', narration: 'When a pawn reaches the far edge of the board, it promotes. Choose a queen, rook, bishop, or knight. Most players choose a queen.', fen: promotionFen, highlights: ['a7', 'a8'], arrows: [{ from: 'a7', to: 'a8', label: 'Promote' }], badge: 'A pawn can become a queen' },
  { title: 'Legal and illegal moves', narration: 'A legal move follows the piece’s movement rules and keeps your own king safe. A move that ignores either rule is illegal.', fen: kingSafetyFen, highlights: ['e1', 'd1', 'e2'], arrows: [{ from: 'e1', to: 'd1', label: 'Legal' }, { from: 'e1', to: 'e2', label: 'Illegal', illegal: true }], badge: 'Keep your king safe' },
  { title: 'Capturing', narration: 'Capture an opponent’s piece by moving onto its square with a piece that can legally reach it. The captured piece leaves the board.', fen: '4k3/8/8/8/n7/8/8/R3K3 w - - 0 1', highlights: ['a1', 'a4'], arrows: [{ from: 'a1', to: 'a4', label: 'Rook captures knight' }], badge: 'Take a piece on its square' },
  { title: 'Attacking and defending', narration: 'A piece attacks squares it could capture on its next turn. Pieces defend friendly pieces when they protect the square those pieces occupy.', fen: '4k3/8/8/8/3p4/2B5/8/4K3 w - - 0 1', highlights: ['c3', 'd4'], arrows: [{ from: 'c3', to: 'd4', label: 'Bishop attacks pawn' }], badge: 'Look at what each piece protects' },
  { title: 'Checkmate', narration: 'Checkmate is check with no legal escape. The game ends immediately, and the player who gave checkmate wins.', fen: positionAfter(miniGameMoves), highlights: ['f7', 'e8'], arrows: [{ from: 'f7', to: 'e8', label: 'Checkmate' }], badge: 'No escape from check' },
  { title: 'Castling', narration: 'Castling is a special king move. The king moves two squares toward a rook, and that rook crosses to the square beside it. The path must be clear and safe.', fen: castlingFen, highlights: ['e1', 'f1', 'g1', 'h1'], arrows: [{ from: 'e1', to: 'g1', label: 'King' }, { from: 'h1', to: 'f1', label: 'Rook' }], badge: 'Once per side, if legal' },
  { title: 'En passant', narration: 'En passant is a special pawn capture. If an enemy pawn moves two squares past yours, you may capture it as if it moved one square. You must do it immediately.', fen: enPassantFen, highlights: ['e5', 'd5', 'd6'], arrows: [{ from: 'e5', to: 'd6', label: 'Capture in passing' }], badge: 'Only on the very next move' },
  { title: 'A short game: White opens', narration: 'Let’s watch a short game. White moves the pawn to E4, claiming space in the centre and opening lines for the queen and bishop.', fen: positionAfter(['e4']), highlights: ['e2', 'e4'], arrows: [{ from: 'e2', to: 'e4', label: '1. e4' }], badge: '1. e4' },
  { title: 'Black answers', narration: 'Black answers with E5. Both players now influence the central squares and make room for their pieces.', fen: positionAfter(['e4', 'e5']), highlights: ['e7', 'e5'], arrows: [{ from: 'e7', to: 'e5', label: '…e5' }], badge: '1… e5' },
  { title: 'Develop and attack', narration: 'White develops the knight to F3. The knight attacks Black’s E5 pawn while moving closer to the centre.', fen: positionAfter(['e4', 'e5', 'Nf3']), highlights: ['g1', 'f3', 'e5'], arrows: [{ from: 'g1', to: 'f3', label: '2. Nf3' }, { from: 'f3', to: 'e5', label: 'Attacks e5' }], badge: '2. Nf3' },
  { title: 'Defend the pawn', narration: 'Black develops the knight to C6. It defends the E5 pawn, so the knight is protected by another piece.', fen: positionAfter(['e4', 'e5', 'Nf3', 'Nc6']), highlights: ['b8', 'c6', 'e5'], arrows: [{ from: 'b8', to: 'c6', label: '2… Nc6' }, { from: 'c6', to: 'e5', label: 'Defends e5' }], badge: '2… Nc6' },
  { title: 'Bring out the bishop', narration: 'White develops the bishop to C4, where it looks toward the weak F7 square beside Black’s king.', fen: positionAfter(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']), highlights: ['f7', 'c4'], arrows: [{ from: 'c4', to: 'f7', label: 'Eyes f7' }], badge: '3. Bc4' },
  { title: 'A natural reply', narration: 'Black develops another knight and protects important central squares. Both sides are bringing pieces into the game.', fen: positionAfter(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6']), highlights: ['g8', 'f6'], arrows: [{ from: 'g8', to: 'f6', label: '3… Nf6' }], badge: '3… Nf6' },
  { title: 'A queen attack', narration: 'White moves the queen to H5. It attacks F7 together with the bishop. Always check what the opponent is threatening.', fen: positionAfter(['e4', 'e5', 'Bc4', 'Nc6', 'Qh5']), highlights: ['d1', 'h5', 'f7'], arrows: [{ from: 'd1', to: 'h5', label: '3. Qh5' }, { from: 'h5', to: 'f7', label: 'Threat' }], badge: '3. Qh5' },
  { title: 'Notice the threat', narration: 'Black develops the knight to F6, but it does not stop the threat on F7. In chess, a move can look natural and still miss danger.', fen: positionAfter(['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6']), highlights: ['f7', 'h5', 'f6'], arrows: [{ from: 'h5', to: 'f7', label: 'Threat remains' }], badge: 'Watch the opponent’s threats' },
  { title: 'Checkmate', narration: 'White captures on F7 with checkmate. The queen is supported by the bishop, and the black king has no safe move. That is the end of the game.', fen: positionAfter(miniGameMoves), highlights: ['f7', 'e8'], arrows: [{ from: 'h5', to: 'f7', label: 'Qxf7 mate' }], badge: 'White wins · Checkmate' },
  { title: 'Ready to explore', narration: 'You now know the board, the pieces, and the goal. Explore an opening, replay this lesson from the three-dot menu, and take your next move at your own pace.', fen: startingFen, highlights: ['e2', 'e7', 'd1', 'd8'], badge: 'Your first move starts here' },
];

function ChessLessonBoard({ step }: { step: LessonStep }) {
  const chess = useMemo(() => {
    try {
      return new Chess(step.fen);
    } catch {
      return new Chess();
    }
  }, [step.fen]);
  const board = chess.board();
  const squares = board.flatMap((rank, row) => rank.map((piece, column) => {
    const square = `${String.fromCharCode(97 + column)}${8 - row}`;
    return { piece, square, row, column };
  }));

  const point = (square: string) => ({
    x: ((square.charCodeAt(0) - 97) + 0.5) * 12.5,
    y: (8 - Number(square[1]) + 0.5) * 12.5,
  });

  return (
    <div className="onboarding-board-wrap">
      <div className="onboarding-board" role="img" aria-label={`Chessboard teaching example: ${step.badge || step.title}`}>
        <div className="onboarding-board__squares">
          {squares.map(({ piece, square, row, column }) => {
            const isLight = (row + column) % 2 === 1;
            const isHighlighted = step.highlights?.includes(square);
            const showFile = row === 7;
            const showRank = column === 0;
            return (
              <div key={square} className={`onboarding-board__square ${isLight ? 'is-light' : 'is-dark'} ${isHighlighted ? 'is-highlighted' : ''}`}>
                {piece && <img src={`/pieces/neo/${piece.color}${piece.type}.png`} alt={`${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}`} draggable={false} />}
                {showRank && <span className="onboarding-board__rank">{8 - row}</span>}
                {showFile && <span className="onboarding-board__file">{'abcdefgh'[column]}</span>}
              </div>
            );
          })}
        </div>
        <svg className="onboarding-board__arrows" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <marker id="lesson-arrowhead" markerWidth="5" markerHeight="5" refX="3.6" refY="2.5" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L5,2.5 L0,5 Z" fill="context-stroke" />
            </marker>
          </defs>
          {step.arrows?.filter(({ from, to }) => from !== to).map((arrow, index) => {
            const from = point(arrow.from);
            const to = point(arrow.to);
            return (
              <g key={`${arrow.from}-${arrow.to}-${index}`} className={arrow.illegal ? 'is-illegal' : ''}>
                <path d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} markerEnd="url(#lesson-arrowhead)" />
                {arrow.label && <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 2} textAnchor="middle">{arrow.label}</text>}
              </g>
            );
          })}
        </svg>
        {step.arrows?.filter(({ from, to }) => from === to).map((arrow, index) => {
          const location = point(arrow.to);
          return <span key={`${arrow.to}-label-${index}`} className="onboarding-board__coordinate-tag" style={{ left: `${location.x}%`, top: `${location.y}%` }}>{arrow.label}</span>;
        })}
      </div>
      <div className="onboarding-board__legend"><span><i className="is-light" /> Light square</span><span><i className="is-dark" /> Dark square</span><span><i className="is-arrow" /> Move / idea</span></div>
    </div>
  );
}

export function OnboardingExperience({
  initialMode,
  language,
  onFinish,
  onOpenPractice,
  onClosePractice,
}: OnboardingExperienceProps) {
  const [mode, setMode] = useState<OnboardingMode>(initialMode);
  const [tourIndex, setTourIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<DOMRect | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(initialMode === 'basics');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [tourProgress, setTourProgress] = useState(0);
  const isEnglish = language === 'en';
  const tourStep = tourSteps[tourIndex];
  const lessonStep = lessonSteps[lessonIndex];

  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, force = false) => {
    if ((!voiceEnabled && !force) || !('speechSynthesis' in window)) return;
    stopSpeech();
    let spokenText = text;
    if (!isEnglish) {
      const cached = getCachedTranslation(language, text);
      if (cached) {
        spokenText = cached;
      } else {
        try {
          [spokenText] = await translateTexts(language, [text]);
        } catch {
          setVoiceNotice('Narration is available in English; translated voice needs the app translation service.');
          return;
        }
      }
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    const languageTag = language === 'en' ? 'en-US' : language === 'kn' ? 'kn-IN' : language;
    utterance.lang = languageTag;
    const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith(language.toLowerCase()));
    if (voice) utterance.voice = voice;
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isEnglish, language, stopSpeech, voiceEnabled]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  useEffect(() => {
    if (mode === 'basics') void speak(lessonStep.narration);
  }, [lessonIndex, lessonStep.narration, mode, speak]);

  useEffect(() => {
    if (mode !== 'tour') return;
    const step = tourSteps[tourIndex];
    if (step.closePractice) onClosePractice();
    if (step.openPractice) onOpenPractice();

    let frame = 0;
    const timeout = window.setTimeout(() => {
      if (step.activate) document.querySelector<HTMLElement>(step.activate)?.click();
      const target = document.querySelector<HTMLElement>(step.target);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      frame = window.requestAnimationFrame(() => {
        const nextTarget = document.querySelector<HTMLElement>(step.target);
        setSpotlight(nextTarget?.getBoundingClientRect() || null);
      });
    }, step.openPractice || step.activate || step.closePractice ? 240 : 30);

    const update = () => {
      const target = document.querySelector<HTMLElement>(step.target);
      setSpotlight(target?.getBoundingClientRect() || null);
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [mode, onClosePractice, onOpenPractice, tourIndex]);

  const finish = (skipped: boolean) => {
    stopSpeech();
    onClosePractice();
    onFinish(skipped);
  };

  const nextTourStep = () => {
    if (tourIndex < tourSteps.length - 1) {
      setTourIndex((index) => index + 1);
      setTourProgress((progress) => progress + 1);
      return;
    }
    onClosePractice();
    setSpotlight(null);
    setMode('basics');
    setVoiceEnabled(true);
  };

  const previousTourStep = () => {
    if (tourIndex === 0) return;
    setTourIndex((index) => index - 1);
    setTourProgress((progress) => Math.max(0, progress - 1));
  };

  const advanceLesson = (direction: -1 | 1) => {
    stopSpeech();
    setLessonIndex((index) => {
      const next = Math.max(0, Math.min(lessonSteps.length - 1, index + direction));
      if (next === lessonSteps.length - 1 && index === lessonSteps.length - 1) finish(false);
      return next;
    });
  };

  if (mode === 'tour') {
    const rect = spotlight;
    const panelWidth = Math.min(390, window.innerWidth - 28);
    const panelLeft = rect
      ? Math.max(14, Math.min(window.innerWidth - panelWidth - 14, rect.left + rect.width / 2 - panelWidth / 2))
      : Math.max(14, (window.innerWidth - panelWidth) / 2);
    const panelHeight = 240;
    const panelTop = rect && rect.bottom + panelHeight + 24 < window.innerHeight
      ? rect.bottom + 22
      : rect
      ? Math.max(14, rect.top - panelHeight - 22)
      : Math.max(14, (window.innerHeight - panelHeight) / 2);
    const targetBox = rect ? { left: rect.left - 8, top: rect.top - 8, width: rect.width + 16, height: rect.height + 16 } : null;

    return (
      <div className="onboarding-tour" role="dialog" aria-modal="true" aria-labelledby="tour-step-title">
        {targetBox ? (
          <>
            <div className="onboarding-tour__shade" style={{ top: 0, left: 0, right: 0, height: Math.max(0, targetBox.top) }} />
            <div className="onboarding-tour__shade" style={{ top: targetBox.top, left: 0, width: Math.max(0, targetBox.left), height: targetBox.height }} />
            <div className="onboarding-tour__shade" style={{ top: targetBox.top, left: targetBox.left + targetBox.width, right: 0, height: targetBox.height }} />
            <div className="onboarding-tour__shade" style={{ top: targetBox.top + targetBox.height, left: 0, right: 0, bottom: 0 }} />
            <div className="onboarding-tour__spotlight" style={{ left: targetBox.left, top: targetBox.top, width: targetBox.width, height: targetBox.height }} />
            <svg className="onboarding-tour__arrow" aria-hidden="true">
              <defs><marker id="tour-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#d8bd87" /></marker></defs>
              <path d={`M ${rect!.left + rect!.width / 2} ${rect!.bottom} Q ${rect!.left + rect!.width / 2} ${panelTop - 12} ${panelLeft + panelWidth / 2} ${panelTop}`} markerEnd="url(#tour-arrowhead)" />
            </svg>
          </>
        ) : <div className="onboarding-tour__full-shade" />}

        <section className="onboarding-tour__card" style={{ left: panelLeft, top: panelTop, width: panelWidth }}>
          <div className="onboarding-tour__progress">
            <span><Sparkles size={14} /> APP TOUR</span>
            <span>{tourIndex + 1} / {tourSteps.length}</span>
          </div>
          <div className="onboarding-tour__progress-track"><span style={{ width: `${((tourIndex + 1) / tourSteps.length) * 100}%` }} /></div>
          <div className="onboarding-tour__copy">
            <p className="onboarding-tour__eyebrow">A quick guided tour</p>
            <h2 id="tour-step-title">{tourStep.title}</h2>
            <p>{tourStep.text}</p>
          </div>
          <div className="onboarding-tour__actions">
            <button type="button" className="onboarding-tour__skip" onClick={() => finish(true)}>Skip Tour</button>
            <div className="onboarding-tour__action-group">
              <button type="button" className="onboarding-icon-button" onClick={() => void speak(tourStep.text, true)} aria-label="Read this step aloud" title="Read this step aloud"><Volume2 size={16} /></button>
              <button type="button" className="onboarding-tour__back" onClick={previousTourStep} disabled={tourIndex === 0}><ChevronLeft size={15} /> Back</button>
              <button type="button" className="onboarding-tour__next" onClick={nextTourStep}>{tourIndex === tourSteps.length - 1 ? 'Start Chess Basics' : 'Next'} <ChevronRight size={15} /></button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="chess-lesson" role="dialog" aria-modal="true" aria-labelledby="lesson-title">
      <header className="chess-lesson__header">
        <div className="chess-lesson__brand"><span className="chess-lesson__brand-mark"><GraduationCap size={19} /></span><div><p>CHESS OPENINGS MASTER</p><h1>Chess Basics</h1></div></div>
        <div className="chess-lesson__header-actions">
          <span className="chess-lesson__step-count">{lessonIndex + 1} / {lessonSteps.length}</span>
          <button type="button" className="chess-lesson__skip" onClick={() => finish(true)}><X size={15} /> Skip Demo</button>
        </div>
      </header>
      <div className="chess-lesson__progress"><span style={{ width: `${((lessonIndex + 1) / lessonSteps.length) * 100}%` }} /></div>

      <main className="chess-lesson__main">
        <div className="chess-lesson__board-column">
          <ChessLessonBoard step={lessonStep} />
          <div className="chess-lesson__board-caption"><span><ArrowDown size={14} /> {lessonStep.badge}</span><span>White at the bottom</span></div>
        </div>

        <section className="chess-lesson__lesson-panel" aria-live="polite">
          <div className="chess-lesson__lesson-topline"><span>THE BEGINNER’S GUIDE</span><BookOpen size={15} /></div>
          <p className="chess-lesson__eyebrow">LESSON {String(lessonIndex + 1).padStart(2, '0')}</p>
          <h2 id="lesson-title">{lessonStep.title}</h2>
          <p className="chess-lesson__narration">{lessonStep.narration}</p>
          <div className="chess-lesson__voice-row">
            <button type="button" onClick={() => {
              if (voiceEnabled) {
                stopSpeech();
                setVoiceEnabled(false);
              } else {
                setVoiceEnabled(true);
              }
            }} className={`chess-lesson__voice-toggle ${voiceEnabled ? 'is-on' : ''}`}>
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {voiceEnabled ? 'Narration on' : 'Narration off'}
            </button>
            {isSpeaking && <span className="chess-lesson__speaking"><i /><i /><i /> Speaking</span>}
            <button type="button" onClick={() => void speak(lessonStep.narration, true)} className="chess-lesson__replay" aria-label="Replay narration" title="Replay narration"><RotateCcw size={15} /></button>
          </div>
          {voiceNotice && <p className="chess-lesson__voice-note" role="status">{voiceNotice}</p>}
          <div className="chess-lesson__coach-note"><LockKeyhole size={15} /><span>Follow the highlighted squares and arrows. You can pause or skip whenever you like.</span></div>
          <div className="chess-lesson__panel-footer">
            <button type="button" className="chess-lesson__back" disabled={lessonIndex === 0} onClick={() => advanceLesson(-1)}><ChevronLeft size={17} /> Back</button>
            <button type="button" className="chess-lesson__next" onClick={() => {
              if (lessonIndex === lessonSteps.length - 1) finish(false);
              else advanceLesson(1);
            }}>{lessonIndex === lessonSteps.length - 1 ? <><Check size={17} /> Finish lesson</> : <>Next lesson <ChevronRight size={17} /></>}</button>
          </div>
        </section>
      </main>
      <footer className="chess-lesson__footer"><span><Crown size={13} /> Learn at your own pace</span><span>Replay anytime from the three-dot menu</span></footer>
    </div>
  );
}