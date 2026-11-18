import { BadMoveRefutation, MoveExplanation, Variation } from '../types/chess';
import { DeviationAnalysis } from './deviationAnalyzer';

/**
 * Converts chess Standard Algebraic Notation (SAN) to natural, clear spoken English.
 * E.g.:
 *  "Nf3"   -> "Knight to f3"
 *  "Nxd5"  -> "Knight takes d5"
 *  "cxd4"  -> "c takes d4"
 *  "O-O"   -> "castling kingside"
 *  "O-O-O" -> "castling queenside"
 *  "Bxf7+" -> "Bishop takes f7 check"
 *  "Qh5#"  -> "Queen to h5 checkmate"
 *  "e8=Q"  -> "e8 promotes to Queen"
 */
export function sanToSpeech(san: string): string {
  if (!san) return '';

  let clean = san.trim();
  const isCheckmate = clean.includes('#');
  const isCheck = !isCheckmate && clean.includes('+');
  clean = clean.replace(/[+#?!]/g, '');

  if (clean === 'O-O') {
    return isCheckmate ? 'castling kingside, checkmate' : isCheck ? 'castling kingside, check' : 'castling kingside';
  }
  if (clean === 'O-O-O') {
    return isCheckmate ? 'castling queenside, checkmate' : isCheck ? 'castling queenside, check' : 'castling queenside';
  }

  // Handle pawn promotion e.g. e8=Q
  let promotionSuffix = '';
  if (clean.includes('=')) {
    const parts = clean.split('=');
    clean = parts[0];
    const promoPiece = parts[1]?.toUpperCase();
    const promoMap: Record<string, string> = { Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight' };
    promotionSuffix = ` promotes to ${promoMap[promoPiece] || 'Queen'}`;
  }

  const pieceLetters: Record<string, string> = {
    N: 'Knight',
    B: 'Bishop',
    R: 'Rook',
    Q: 'Queen',
    K: 'King',
  };

  let speech = '';
  const firstChar = clean[0];

  if (pieceLetters[firstChar]) {
    const piece = pieceLetters[firstChar];
    const rest = clean.slice(1);

    if (rest.includes('x')) {
      const [fromSquare, target] = rest.split('x');
      const fromPart = fromSquare ? ` from ${fromSquare}` : '';
      speech = `${piece}${fromPart} takes ${target}`;
    } else if (rest.length === 3 && /^[a-h1-8][a-h][1-8]$/.test(rest)) {
      // Disambiguation e.g. Nbd7, R1e2
      speech = `${piece} from ${rest[0]} to ${rest.slice(1)}`;
    } else {
      speech = `${piece} to ${rest}`;
    }
  } else {
    // Pawn move or pawn capture
    if (clean.includes('x')) {
      const [fromFile, target] = clean.split('x');
      speech = `${fromFile} takes ${target}`;
    } else {
      speech = clean;
    }
  }

  speech += promotionSuffix;
  if (isCheckmate) speech += ' checkmate';
  else if (isCheck) speech += ' check';

  return speech;
}

/**
 * Clean and extract a concise idea (1 sentence, max 15-20 words) from verbose explanations.
 */
function extractConciseIdea(rawText?: string): string {
  if (!rawText) return '';
  // Remove markdown, brackets, and extra punctuation
  let text = rawText
    .replace(/\s+/g, ' ')
    .replace(/\b(1\.\.\.|[1-9]\d*(\.|\.\.\.))\s*/g, '')
    .trim();

  // Split by first full stop or semicolon
  const match = text.match(/^(.*?[.!?])(\s|$)/);
  if (match) {
    text = match[1].trim();
  }

  // Truncate if still excessively long
  const words = text.split(' ');
  if (words.length > 20) {
    text = words.slice(0, 18).join(' ') + '.';
  }

  // Ensure starts with lowercase or natural phrasing if following intro
  return text.replace(/[.!?]+$/, '');
}

/**
 * AI Voice Coach service providing real-time engine-driven move commentary
 * and audio management using browser SpeechSynthesis.
 */
class AiVoiceCoach {
  private enabled: boolean = true;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private isBrowserSupported: boolean = false;
  private voicesLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isBrowserSupported = true;

      try {
        const stored = sessionStorage.getItem('chess_ai_voice_enabled');
        if (stored !== null) {
          this.enabled = stored === 'true';
        }
      } catch {
        this.enabled = true;
      }

      this.initVoices();
    }
  }

  private initVoices(): void {
    if (!this.isBrowserSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      this.voicesLoaded = true;

      // Prioritize natural sounding, clear English voices
      const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));

      // Preferred keywords for premium natural speech synthesis
      const preferred = englishVoices.find(v =>
        /natural|online|google|neural|samantha|karen|daniel|jenny/i.test(v.name)
      );

      this.selectedVoice = preferred || englishVoices[0] || voices[0] || null;
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('chess_ai_voice_enabled', String(enabled));
      }
    } catch {}

    if (!enabled) {
      this.stop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Immediately stops any active commentary.
   */
  public stop(): void {
    if (!this.isBrowserSupported) return;
    try {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    } catch (e) {
      console.warn('Speech cancellation error:', e);
    }
  }

  /**
   * Speaks the provided text aloud using natural English TTS.
   * Cancels any currently playing audio immediately.
   */
  public speak(text: string, force: boolean = false): void {
    if ((!this.enabled && !force) || !this.isBrowserSupported || !text) {
      return;
    }

    // Immediately cancel any previous speech
    this.stop();

    try {
      // Resume if paused (handles Android/Chrome background suspension)
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      if (!this.voicesLoaded) {
        this.initVoices();
      }

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }

      // Natural, conversational cadence
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Keep reference alive to prevent garbage collection on mobile browsers
      this.activeUtterance = utterance;

      utterance.onend = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
      };

      utterance.onerror = () => {
        if (this.activeUtterance === utterance) {
          this.activeUtterance = null;
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('AI Voice Coach TTS failure:', err);
    }
  }

  /**
   * Generates and speaks commentary for an on-book master move.
   */
  public speakBookMove(variation: Variation, moveIndex: number): void {
    if (!this.enabled || moveIndex < 0) return;

    const explanation: MoveExplanation | undefined = variation.moveExplanations[moveIndex];
    const san = variation.moves[moveIndex] || explanation?.notation || '';
    const spokenSan = sanToSpeech(san);

    if (!explanation) {
      this.speak(`Brilliant! This is the engine's best move, ${spokenSan}.`);
      return;
    }

    if (san.includes('#')) {
      this.speak(`Checkmate! Brilliant game, delivering checkmate with ${spokenSan}.`);
      return;
    }

    const quality = explanation.moveQuality || 'book';
    const idea = extractConciseIdea(explanation.whyGoodOrBest || explanation.tacticalNote || explanation.explanation);

    let commentary = '';

    if (quality === 'best') {
      if (idea) {
        commentary = `Brilliant! This is the engine's best move. ${idea}.`;
      } else {
        commentary = `Brilliant! This is the engine's best move.`;
      }
    } else if (quality === 'great') {
      if (idea) {
        commentary = `Excellent! ${idea}.`;
      } else {
        commentary = `Excellent move! ${spokenSan} controls the board.`;
      }
    } else if (quality === 'critical') {
      if (idea) {
        commentary = `Critical move! ${idea}.`;
      } else {
        commentary = `Critical move! This is essential to keep the advantage.`;
      }
    } else {
      // 'book' or 'good'
      if (idea) {
        commentary = `Excellent! This move ${idea.replace(/^(this move|it)\s+/i, '')}.`;
      } else {
        commentary = `Excellent! This move follows master book preparation.`;
      }
    }

    this.speak(commentary);
  }

  /**
   * Generates and speaks commentary for an off-book deviation based on engine analysis.
   */
  public speakDeviation(analysis: DeviationAnalysis, _variation?: Variation): void {
    if (!this.enabled || !analysis) return;

    const attemptedSpoken = sanToSpeech(analysis.attemptedSan);
    const expectedSpoken = analysis.expectedSan ? sanToSpeech(analysis.expectedSan) : '';
    const whyBadIdea = extractConciseIdea(analysis.whyBad);

    let commentary = '';

    if (analysis.severity === 'blunder') {
      // Blunder: "Oops! That's a blunder. Your opponent can win material."
      if (analysis.continuationMoves && analysis.continuationMoves.length > 0) {
        const replySpoken = sanToSpeech(analysis.continuationMoves[0]);
        commentary = `Oops! That's a blunder. Your opponent can win material with ${replySpoken}.`;
      } else if (whyBadIdea) {
        commentary = `Oops! That's a blunder. ${whyBadIdea}.`;
      } else {
        commentary = `Oops! That's a blunder. This gives away a decisive advantage.`;
      }
    } else if (analysis.severity === 'mistake') {
      // Mistake: "Careful! This move weakens your position."
      if (expectedSpoken) {
        commentary = `Careful! This move weakens your position. You missed a stronger continuation with ${expectedSpoken}.`;
      } else if (whyBadIdea) {
        commentary = `Careful! This move weakens your position. ${whyBadIdea}.`;
      } else {
        commentary = `Careful! This move weakens your position.`;
      }
    } else {
      // Inaccuracy: "That move is slightly inaccurate. You missed a stronger continuation."
      if (expectedSpoken) {
        commentary = `That move is slightly inaccurate. You missed a stronger continuation with ${expectedSpoken}.`;
      } else if (whyBadIdea) {
        commentary = `That move is slightly inaccurate. ${whyBadIdea}.`;
      } else {
        commentary = `That move is slightly inaccurate. You missed a stronger continuation.`;
      }
    }

    this.speak(commentary);
  }

  /**
   * Speaks refutation step move when stepping through punishment line.
   */
  public speakRefutationStep(san: string, turn: 'White' | 'Black', stepIndex: number, analysis: DeviationAnalysis): void {
    if (!this.enabled || !san) return;

    const spokenSan = sanToSpeech(san);

    if (stepIndex === 0) {
      this.speak(`Position after your move, ${spokenSan}.`);
    } else if (stepIndex === 1) {
      const reason = extractConciseIdea(analysis.whyBad);
      if (reason) {
        this.speak(`${turn} replies with ${spokenSan}. ${reason}.`);
      } else {
        this.speak(`${turn} replies with ${spokenSan}, punishing the mistake.`);
      }
    } else {
      this.speak(`${turn} continues with ${spokenSan}.`);
    }
  }

  /**
   * Speaks custom move explanation (e.g. in Grandmaster Masterclass games).
   */
  public speakCustomMove(explanation: MoveExplanation): void {
    if (!this.enabled || !explanation) return;

    const spokenSan = sanToSpeech(explanation.notation);
    const idea = extractConciseIdea(explanation.whyGoodOrBest || explanation.explanation);

    if (explanation.notation.includes('#')) {
      this.speak(`Checkmate! Grandmaster delivers checkmate with ${spokenSan}.`);
      return;
    }

    if (idea) {
      this.speak(`Move ${spokenSan}. ${idea}.`);
    } else {
      this.speak(`Grandmaster plays ${spokenSan}.`);
    }
  }
}

export const aiVoiceCoach = new AiVoiceCoach();
