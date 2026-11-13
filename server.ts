import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { randomBytes } from 'crypto';
import { Chess } from 'chess.js';
import { getTimeControl } from './src/types/timeControl';
import dotenv from 'dotenv';
import { supportedLanguageCodes } from './src/data/languages';
import { buildChessLanguageInstruction, getLanguageName } from './src/utils/aiLanguage';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const CHESS_SYSTEM_INSTRUCTION = `You are an elite Grandmaster Chess AI Assistant for the "Prof.Chess" web application.
Your single and exclusive purpose is answering questions directly and strictly about CHESS.

Topics you are permitted to discuss:
- Chess openings, variations, defenses, move orders, transpositions (e.g. Sicilian, Ruy Lopez, King's Indian, French Defense, Queen's Gambit, etc.)
- Tactics, combinations, motifs (forks, pins, skewers, discovered checks, deflection, clearance, decoys, etc.)
- Positional play, pawn structures, bad/good bishops, open files, outposts, king safety, space advantage
- Endgame theory (Lucena position, Philidor defense, opposition, rook endgames, pawn promotion)
- Chess rules, special moves (en passant, castling, promotion, 50-move rule, threefold repetition, stalemate vs checkmate)
- Grandmasters, World Champions (Magnus Carlsen, Garry Kasparov, Bobby Fischer, Vishy Anand, Gukesh, Ding Liren, Mikhail Tal, Hikaru Nakamura, Judit Polgar, etc.)
- Chess history, tournament regulations, FIDE ratings, chess clocks, tournament play
- Evaluation of chess positions, algebraic notation (SAN), FEN, PGN analysis

STRICT GUARDRAIL & DISCARD RULE:
If the user's input is NOT strictly about chess (for example: coding, math homework, general trivia, weather, politics, finance, cooking, movies, other video games, non-chess sports, general philosophy, casual chat like "tell me a joke about dogs", etc.):
YOU MUST STRICTLY DISCARD AND REJECT THE QUESTION. Do NOT attempt to answer, entertain, or satisfy any part of the non-chess request.
Respond ONLY with this exact discard message or a close variation:
"I am a specialized Chess AI Assistant. I can only answer questions related to chess—such as openings, strategies, tactical patterns, endgame techniques, rules, and grandmaster games. Please ask a chess question!"

FORMATTING FOR CHESS ANSWERS:
- Be clear, practical, instructional, and concise.
- Use bold notation for moves (e.g., **1.e4 c5**, **2.Nf3 d6**).
- Use bullet points for key strategic themes and tactical ideas.
`;

// Helper to heuristically check if text is chess-related
function isLikelyChessQuery(text: string): boolean {
  // If string contains FEN structure with slashes separating piece ranks
  if (text.includes('/') && text.split('/').length >= 8) {
    return true;
  }

  const lower = text.toLowerCase();
  const chessKeywords = [
    'chess', 'opening', 'defense', 'variation', 'gambit', 'checkmate', 'stalemate',
    'pawn', 'knight', 'bishop', 'rook', 'queen', 'king', 'castle', 'castling',
    'en passant', 'e4', 'd4', 'c4', 'nf3', 'fischer', 'kasparov', 'carlsen',
    'anand', 'gukesh', 'nakamura', 'tal', 'botvinnik', 'capablanca', 'alekhine',
    'fide', 'grandmaster', 'gm', 'im', 'elo', 'rating', 'board', 'tactics',
    'fork', 'pin', 'skewer', 'zugzwang', 'zwischenzug', 'tempo', 'eval', 'stockfish',
    'fen', 'pgn', 'endgame', 'middlegame', 'sicilian', 'french', 'caro-kann',
    'ruy lopez', 'italian', 'scandinavian', 'king\'s indian', 'nimzo', 'grunfeld',
    'queen\'s gambit', 'slav', 'catalan', 'reti', 'english opening', 'dutch defense',
    'london system', 'scholar\'s mate', 'fool\'s mate', 'blunder', 'brilliant move',
    'move', 'moves', 'play', 'white', 'black', 'file', 'rank', 'diagonal', 'position'
  ];

  return chessKeywords.some((kw) => lower.includes(kw));
}

// Fallback responses if Gemini API is not reachable or without key
function getFallbackChessResponse(query: string, currentContext?: string): string {
  const lower = query.toLowerCase();

  if (!isLikelyChessQuery(lower) && !query.includes('/')) {
    return 'I am a specialized Chess AI Assistant. I can only answer questions related to chess—such as openings, strategies, tactical patterns, endgame techniques, rules, and grandmaster games. Please ask a chess question!';
  }

  // FEN Position Query handler
  if (query.includes('/') && query.split('/').length >= 8) {
    return `### Position Analysis (FEN Evaluation)
I have evaluated the board position provided in your FEN:

- **Position Evaluation**: The position shows active strategic tension.
- **Key Positional Factors**:
  - **Central Control**: Ensure your central squares (d4, e4, d5, e5) are defended or contested.
  - **King Safety**: Verify that your king has castled and has an uncompromised pawn shield.
  - **Piece Harmony**: Coordinate minor pieces towards open lines and create battery threats along open files.
- **Recommended Grandmaster Plan**:
  1. **Look for forcing moves first**: Identify candidate checks, captures, and direct threats.
  2. **Improve your least active piece**: Relocate pieces on back ranks to advanced outposts.
  3. **Execute pawn breaks**: Challenge the opponent's center to open lines for rooks and bishops.`;
  }

  if (lower.includes('sicilian')) {
    return `### The Sicilian Defense (**1.e4 c5**)
The Sicilian Defense is the most popular and combative reply to **1.e4** at the master level. By advancing the c-pawn, Black immediately fights for central control from the flank, aiming for asymmetrical positions with unbalanced winning chances.

- **Main Variations**: Najdorf (**5...a6**), Dragon (**5...g6**), Classical (**5...Nc6**), and Scheveningen (**5...e6**).
- **Strategic Concept**: White typically attacks on the kingside with open lines, while Black expands on the queenside using the half-open c-file.
- **Key Tip**: White should watch out for Black's thematic central break with **...d5**!`;
  }

  if (lower.includes('ruy lopez')) {
    return `### The Ruy Lopez (**1.e4 e5 2.Nf3 Nc6 3.Bb5**)
Named after the 16th-century Spanish priest Ruy López de Segura, also known as the **Spanish Opening**. It puts long-term positional pressure on Black's knight defending the central e5 pawn.

- **Key Variations**: Berlin Defense (**3...Nf6**), Morphy Defense (**3...a6**), Marshall Attack (**8...d5** in the Closed Ruy).
- **Core Strategy**: White aims for central control with **c3** and **d4**, maneuvering the bishop to **c2** and knights to the kingside via **Nd2-f1-g3**.`;
  }

  if (lower.includes('scholar') || lower.includes("fool's")) {
    return `### Defending Against Scholar's Mate (**1.e4 e5 2.Qh5 Nc6 3.Bc4**)
White threatens **4.Qxf7#**.
- **The Best Defense**: Play **3...g6!** White's queen must retreat (usually to **4.Qf3** renewing the mate threat).
- **Follow-up**: Play **4...Nf6!** Block the f-file and develop. Black emerges with superior development while White has wasted queen moves.`;
  }

  if (lower.includes('en passant')) {
    return `### The En Passant Rule
**En passant** (French for "in passing") is a special pawn capture rule:
1. When a pawn advances **two squares** from its starting rank and lands directly adjacent (same rank) to an enemy pawn.
2. The opposing pawn can capture it diagonally forward into the square the pawn just skipped.
3. **Crucial Rule**: The capture MUST be performed on the very next move, or the right is permanently lost!`;
  }

  if (currentContext && (lower.includes('this opening') || lower.includes('current') || lower.includes('explain'))) {
    return `### About ${currentContext}
This opening is a fundamental part of chess theory! 
- Focus on controlling key central squares (**d4, e4, d5, e5**).
- Develop minor pieces (Knights before Bishops) rapidly.
- Castle early to secure king safety.
- Connect your rooks by moving the queen to an active square.`;
  }

  return `### Grandmaster Chess Advice
In chess, every move should either:
1. **Contribute to central space control** (e4/d4/e5/d5).
2. **Develop an inactive piece** towards active squares.
3. **Ensure King safety** (usually via kingside castling).
4. **Create a concrete tactical threat** or neutralize the opponent's threats.

Feel free to ask about specific openings, move orders (like **1.e4** or **1.d4**), tactical motifs (forks, pins, skewers), or grandmaster game strategies!`;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'chess-ai-assistant' });
});

interface OnlineChessRoom {
  code: string;
  hostToken: string;
  guestToken: string | null;
  hostName: string;
  guestName: string | null;
  moves: string[];
  fen: string;
  status: 'waiting' | 'playing' | 'finished';
  drawOfferBy: 'w' | 'b' | null;
  result: '1-0' | '0-1' | '1/2-1/2' | null;
  termination: string | null;
  timeControlId: string;
  remainingMs: { w: number; b: number } | null;
  turnStartedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

const onlineChessRooms = new Map<string, OnlineChessRoom>();
const ONLINE_GAME_START_FEN = new Chess().fen();

function cleanOnlineChessRooms(): void {
  const now = Date.now();
  for (const [code, room] of onlineChessRooms) {
    const lifetime = room.status === 'finished' ? 60 * 60_000 : 6 * 60 * 60_000;
    if (now - room.updatedAt > lifetime) onlineChessRooms.delete(code);
  }
}

function updateOnlineGameClock(room: OnlineChessRoom): void {
  if (room.status !== 'playing' || !room.remainingMs || room.turnStartedAt === null) return;
  const chess = new Chess();
  for (const san of room.moves) chess.move(san);
  const activeColor = chess.turn();
  const elapsed = Math.max(0, Date.now() - room.turnStartedAt);
  room.remainingMs[activeColor] = Math.max(0, room.remainingMs[activeColor] - elapsed);
  room.turnStartedAt = Date.now();
  if (room.remainingMs[activeColor] === 0) {
    const winnerColor = activeColor === 'w' ? 'b' : 'w';
    room.status = 'finished';
    room.result = chess.isInsufficientMaterial() ? '1/2-1/2' : winnerColor === 'w' ? '1-0' : '0-1';
    room.termination = room.result === '1/2-1/2' ? 'Timeout with insufficient mating material' : 'Timeout';
    room.turnStartedAt = null;
  }
  room.updatedAt = Date.now();
}

function getOnlineChessState(room: OnlineChessRoom, token: string) {
  const playerColor = token === room.hostToken ? 'w' : 'b';
  const chess = new Chess();
  for (const san of room.moves) chess.move(san);
  chess.header('White', room.hostName);
  chess.header('Black', room.guestName || '?');
  chess.header('Result', room.result || '*');
  return {
    code: room.code,
    yourColor: playerColor,
    opponentName: playerColor === 'w' ? room.guestName : room.hostName,
    hostName: room.hostName,
    guestName: room.guestName,
    moves: room.moves,
    fen: room.fen,
    status: room.status,
    currentTurn: chess.turn(),
    drawOfferBy: room.drawOfferBy,
    result: room.result,
    termination: room.termination,
    timeControlId: room.timeControlId,
    remainingMs: room.remainingMs,
    serverNow: Date.now(),
    pgn: chess.pgn(),
  };
}

function findOnlineChessPlayer(req: express.Request, res: express.Response): { room: OnlineChessRoom; color: 'w' | 'b' } | null {
  const room = onlineChessRooms.get(String(req.params.code || '').toUpperCase());
  const token = req.header('x-game-token');
  if (!room) {
    res.status(404).json({ error: 'Game not found. Check the game code or create a new game.' });
    return null;
  }
  if (!token || (token !== room.hostToken && token !== room.guestToken)) {
    res.status(401).json({ error: 'This game session is not authorized.' });
    return null;
  }
  return { room, color: token === room.hostToken ? 'w' : 'b' };
}

interface OnlineMatchEntry {
  token: string;
  username: string;
  timeControlId: string;
  playerCode: string;
  opponentCode: string;
  gameCode: string | null;
  updatedAt: number;
}

// Keyed by `${playerCode}>${opponentCode}`. Two players pair up when their entries mirror each other.
const onlineMatchEntries = new Map<string, OnlineMatchEntry>();
const ONLINE_MATCH_LIFETIME_MS = 15 * 60_000;
const ONLINE_SECRET_CODE_PATTERN = /^[A-Z0-9]{4,12}$/;

function cleanOnlineMatchEntries(): void {
  const now = Date.now();
  for (const [key, entry] of onlineMatchEntries) {
    if (now - entry.updatedAt > ONLINE_MATCH_LIFETIME_MS) onlineMatchEntries.delete(key);
  }
}

function findOnlineMatchEntry(token: string | undefined): [string, OnlineMatchEntry] | null {
  if (!token) return null;
  for (const item of onlineMatchEntries) {
    if (item[1].token === token) return item;
  }
  return null;
}

function describeOnlineMatch(entry: OnlineMatchEntry) {
  if (entry.gameCode) {
    const room = onlineChessRooms.get(entry.gameCode);
    if (room) return { status: 'matched' as const, game: { ...getOnlineChessState(room, entry.token), token: entry.token } };
  }
  const counterpart = onlineMatchEntries.get(`${entry.opponentCode}>${entry.playerCode}`);
  if (counterpart && !counterpart.gameCode && counterpart.timeControlId !== entry.timeControlId) {
    return { status: 'mismatch' as const, opponentTimeControlId: counterpart.timeControlId };
  }
  return { status: 'waiting' as const };
}

function startOnlineMatch(first: OnlineMatchEntry, second: OnlineMatchEntry): void {
  let code = '';
  do {
    code = randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
  } while (onlineChessRooms.has(code));
  const [white, black] = Math.random() < 0.5 ? [first, second] : [second, first];
  const timeControl = getTimeControl(first.timeControlId);
  const now = Date.now();
  onlineChessRooms.set(code, {
    code,
    hostToken: white.token,
    guestToken: black.token,
    hostName: white.username,
    guestName: black.username,
    moves: [],
    fen: ONLINE_GAME_START_FEN,
    status: 'playing',
    drawOfferBy: null,
    result: null,
    termination: null,
    timeControlId: timeControl.id,
    remainingMs: timeControl.minutes === null
      ? null
      : { w: timeControl.minutes * 60_000, b: timeControl.minutes * 60_000 },
    turnStartedAt: timeControl.minutes === null ? null : now,
    createdAt: now,
    updatedAt: now,
  });
  first.gameCode = code;
  second.gameCode = code;
}

// A player submits their own code plus their opponent's secret code. The match starts only when
// the opponent has submitted the mirrored pair with the same time control.
app.post('/api/online-games/match', (req, res) => {
  cleanOnlineChessRooms();
  cleanOnlineMatchEntries();
  const username = typeof req.body?.username === 'string' ? req.body.username.trim().slice(0, 32) : '';
  const playerCode = typeof req.body?.playerCode === 'string' ? req.body.playerCode.trim().toUpperCase() : '';
  const opponentCode = typeof req.body?.opponentCode === 'string' ? req.body.opponentCode.trim().toUpperCase() : '';
  const requestedTimeControl = typeof req.body?.timeControlId === 'string' ? req.body.timeControlId : '';
  if (!username) {
    res.status(400).json({ error: 'Save a username in your profile before playing online.' });
    return;
  }
  if (!ONLINE_SECRET_CODE_PATTERN.test(playerCode) || !ONLINE_SECRET_CODE_PATTERN.test(opponentCode)) {
    res.status(400).json({ error: 'Codes must be 4–12 letters or numbers.' });
    return;
  }
  if (playerCode === opponentCode) {
    res.status(400).json({ error: 'Your code and your opponent’s code must be different.' });
    return;
  }
  const timeControl = getTimeControl(requestedTimeControl);
  if (timeControl.id !== requestedTimeControl) {
    res.status(400).json({ error: 'Choose a valid time control.' });
    return;
  }

  const entry: OnlineMatchEntry = {
    token: randomBytes(32).toString('hex'),
    username,
    timeControlId: timeControl.id,
    playerCode,
    opponentCode,
    gameCode: null,
    updatedAt: Date.now(),
  };
  const slot = `${playerCode}>${opponentCode}`;
  onlineMatchEntries.set(slot, entry);
  const counterpart = onlineMatchEntries.get(`${opponentCode}>${playerCode}`);
  if (counterpart && !counterpart.gameCode && counterpart.timeControlId === entry.timeControlId) {
    startOnlineMatch(counterpart, entry);
  }
  res.status(201).json({ matchToken: entry.token, ...describeOnlineMatch(entry) });
});

app.get('/api/online-games/match/status', (req, res) => {
  cleanOnlineMatchEntries();
  const found = findOnlineMatchEntry(req.header('x-match-token'));
  if (!found) {
    res.status(404).json({ error: 'This match request expired. Start again.' });
    return;
  }
  found[1].updatedAt = Date.now();
  res.setHeader('Cache-Control', 'no-store');
  res.json(describeOnlineMatch(found[1]));
});

app.delete('/api/online-games/match', (req, res) => {
  const found = findOnlineMatchEntry(req.header('x-match-token'));
  if (found && !found[1].gameCode) onlineMatchEntries.delete(found[0]);
  res.status(204).end();
});

app.get('/api/online-games/:code', (req, res) => {
  const player = findOnlineChessPlayer(req, res);
  if (!player) return;
  updateOnlineGameClock(player.room);
  res.setHeader('Cache-Control', 'no-store');
  res.json(getOnlineChessState(player.room, req.header('x-game-token')!));
});

app.post('/api/online-games/:code/move', (req, res) => {
  const player = findOnlineChessPlayer(req, res);
  if (!player) return;
  const { room, color } = player;
  updateOnlineGameClock(room);
  if (room.status !== 'playing') {
    res.status(409).json({ error: room.termination || 'This game has finished.' });
    return;
  }
  const chess = new Chess();
  for (const san of room.moves) chess.move(san);
  if (chess.turn() !== color) {
    res.status(409).json({ error: 'Wait for your turn before moving.' });
    return;
  }
  if (room.moves.length >= 500) {
    res.status(409).json({ error: 'This game reached the maximum supported length.' });
    return;
  }
  if (typeof req.body?.san !== 'string' || req.body.san.length > 16) {
    res.status(400).json({ error: 'Send a valid chess move.' });
    return;
  }
  try {
    const move = chess.move(req.body.san);
    if (!move) {
      res.status(400).json({ error: 'That move is not legal in this position.' });
      return;
    }
    room.moves.push(move.san);
    room.fen = chess.fen();
    room.updatedAt = Date.now();
    room.drawOfferBy = null;
    if (room.remainingMs) {
      const control = getTimeControl(room.timeControlId);
      room.remainingMs[move.color] += control.incrementSeconds * 1000;
    }
    if (chess.isGameOver()) {
      room.status = 'finished';
      room.result = chess.isDraw() ? '1/2-1/2' : move.color === 'w' ? '1-0' : '0-1';
      room.termination = chess.isCheckmate() ? 'Checkmate' : 'Draw by chess rules';
    }
    room.turnStartedAt = room.status === 'playing' && room.remainingMs ? Date.now() : null;
    res.json(getOnlineChessState(room, req.header('x-game-token')!));
  } catch {
    res.status(400).json({ error: 'That move is not legal in this position.' });
  }
});

app.post('/api/online-games/:code/action', (req, res) => {
  const player = findOnlineChessPlayer(req, res);
  if (!player) return;
  const { room, color } = player;
  updateOnlineGameClock(room);
  const action = req.body?.action;
  if (room.status !== 'playing') {
    res.status(409).json({ error: 'This game has already finished.' });
    return;
  }
  if (action === 'resign') {
    room.status = 'finished';
    room.result = color === 'w' ? '0-1' : '1-0';
    room.termination = 'Resignation';
    room.turnStartedAt = null;
  } else if (action === 'draw-offer') {
    room.drawOfferBy = color;
  } else if (action === 'draw-accept') {
    if (!room.drawOfferBy || room.drawOfferBy === color) {
      res.status(409).json({ error: 'There is no opponent draw offer to accept.' });
      return;
    }
    room.status = 'finished';
    room.result = '1/2-1/2';
    room.termination = 'Draw agreed';
    room.drawOfferBy = null;
    room.turnStartedAt = null;
  } else if (action === 'draw-decline') {
    if (room.drawOfferBy !== color) {
      res.status(409).json({ error: 'There is no draw offer from you to withdraw.' });
      return;
    }
    room.drawOfferBy = null;
  } else if (action === 'draw-reject') {
    if (!room.drawOfferBy || room.drawOfferBy === color) {
      res.status(409).json({ error: 'There is no opponent draw offer to decline.' });
      return;
    }
    room.drawOfferBy = null;
  } else {
    res.status(400).json({ error: 'Choose a valid game action.' });
    return;
  }
  room.updatedAt = Date.now();
  res.json(getOnlineChessState(room, req.header('x-game-token')!));
});

const translationRequestCounts = new Map<string, { startedAt: number; count: number }>();

function protectChessNotation(text: string): { text: string; restore: (translated: string) => string } {
  const protectedValues: string[] = [];
  const notationPattern = /(?<![\p{L}\p{N}])(?:(?:\d+\.{1,3})?(?:O-O-O|O-O|0-0-0|0-0|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|[+#])|(?:[prnbqkPRNBQK1-8]+\/){7}[prnbqkPRNBQK1-8]+ [wb] (?:KQ?k?q?|kq?|-|-) (?:[a-h][36]|-) \d+ \d+)(?![\p{L}\p{N}])/gu;
  const protectedText = text.replace(notationPattern, (notation) => {
    const token = `ZXQCHESSNOTATION${protectedValues.length}ZXQ`;
    protectedValues.push(notation);
    return token;
  });

  return {
    text: protectedText,
    restore: (translated) => {
      const everyTokenPresent = protectedValues.every((_, index) =>
        translated.includes(`ZXQCHESSNOTATION${index}ZXQ`)
      );
      if (!everyTokenPresent) return null;
      return translated.replace(/ZXQCHESSNOTATION(\d+)ZXQ/g, (token, index: string) =>
        protectedValues[Number(index)] ?? token
      );
    },
  };
}

app.post('/api/translate', async (req, res) => {
  try {
    const { language, texts } = req.body || {};
    if (typeof language !== 'string' || !supportedLanguageCodes.includes(language)) {
      res.status(400).json({ error: 'Choose a supported language.' });
      return;
    }
    if (!Array.isArray(texts) || texts.length < 1 || texts.length > 30 || texts.some((text) => typeof text !== 'string')) {
      res.status(400).json({ error: 'Provide between 1 and 30 text strings.' });
      return;
    }
    if (texts.some((text: string) => text.length > 10000) || texts.reduce((total: number, text: string) => total + text.length, 0) > 10000) {
      res.status(413).json({ error: 'The translation batch is too large.' });
      return;
    }

    const now = Date.now();
    const clientAddress = req.ip || 'unknown';
    const clientLimit = translationRequestCounts.get(clientAddress);
    if (clientLimit && now - clientLimit.startedAt < 60_000 && clientLimit.count >= 120) {
      res.status(429).json({ error: 'Translation rate limit reached. Please wait a minute and try again.' });
      return;
    }
    translationRequestCounts.set(clientAddress, {
      startedAt: clientLimit && now - clientLimit.startedAt < 60_000 ? clientLimit.startedAt : now,
      count: clientLimit && now - clientLimit.startedAt < 60_000 ? clientLimit.count + 1 : 1,
    });

    const ai = getAI();
    if (!ai) {
      res.json({ translations: texts, source: 'fallback' });
      return;
    }

    const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(language) || language;
    const protectedTexts = texts.map(protectChessNotation);
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Translate every string in the JSON array into ${languageName}. Return only a JSON array of translated strings in the same order and with the same number of items. Keep every ZXQCHESSNOTATION<number>ZXQ token exactly unchanged; each token represents chess notation, coordinates, or FEN and must be copied verbatim. Preserve ECO codes, numbers, Markdown structure, and placeholders. Translate explanatory prose, headings, buttons, labels, and messages.\n\n${JSON.stringify(protectedTexts.map(({ text }) => text))}`,
      config: { temperature: 0.1 },
    });

    const output = (response.text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const translatedTexts: unknown = JSON.parse(output);
    if (!Array.isArray(translatedTexts) || translatedTexts.length !== texts.length || translatedTexts.some((text) => typeof text !== 'string')) {
      res.status(502).json({ error: 'The translation service returned an invalid response.' });
      return;
    }

    const translations = translatedTexts.map((text, index) => protectedTexts[index].restore(text));
    if (translations.some((text) => text === null)) {
      res.status(502).json({ error: 'The translation service changed protected chess notation.' });
      return;
    }
    res.json({ translations, source: 'gemini' });
  } catch (error) {
    console.error('Gemini translation error:', error);
    res.status(502).json({ error: 'Translation failed. Please try selecting the language again.' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, currentOpening, currentVariation, chatHistory } = req.body;
    const requestedLanguage = req.body?.language;
    const language = typeof requestedLanguage === 'string' && supportedLanguageCodes.includes(requestedLanguage)
      ? requestedLanguage
      : 'en';

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const trimmedPrompt = prompt.trim();
    const isChess = isLikelyChessQuery(trimmedPrompt);

    // If clearly non-chess, discard immediately without consuming API tokens
    const nonChessStrictKeywords = [
      'weather', 'football', 'cricket', 'baseball', 'cooking', 'recipe',
      'python code', 'javascript code', 'write code', 'movie', 'actor',
      'celebrity', 'bitcoin', 'crypto', 'politics', 'election', 'song lyrics'
    ];
    const isDefinitelyNonChess = nonChessStrictKeywords.some((kw) =>
      trimmedPrompt.toLowerCase().includes(kw)
    );

    if (isDefinitelyNonChess && !trimmedPrompt.toLowerCase().includes('chess')) {
      res.json({
        reply:
          'I am a specialized Chess AI Assistant. I can only answer questions related to chess—such as openings, strategies, tactical patterns, endgame techniques, rules, and grandmaster games. Please ask a chess question!',
        isChessRelated: false,
        discarded: true,
      });
      return;
    }

    const ai = getAI();
    if (!ai) {
      // Fallback mode if no GEMINI_API_KEY is configured
      const reply = getFallbackChessResponse(
        trimmedPrompt,
        currentOpening ? `${currentOpening} (${currentVariation || ''})` : undefined
      );
      res.json({
        reply,
        isChessRelated: isChess,
        discarded: !isChess,
        source: 'fallback',
      });
      return;
    }

    // Build context string
    let contextStr = '';
    if (currentOpening) {
      contextStr += `User is currently examining: Opening: "${currentOpening}"`;
      if (currentVariation) {
        contextStr += `, Variation: "${currentVariation}"`;
      }
      contextStr += '.\n';
    }

    const fullPrompt = `${buildChessLanguageInstruction(language)}\n\n${contextStr}User question: ${trimmedPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: `${CHESS_SYSTEM_INSTRUCTION}\n\n${buildChessLanguageInstruction(language)}`,
        temperature: 0.7,
      },
    });

    const replyText = response.text || '';
    const isDiscardReply =
      replyText.toLowerCase().includes('specialized chess ai') ||
      replyText.toLowerCase().includes('only answer questions related to chess');

    res.json({
      reply: replyText,
      isChessRelated: !isDiscardReply,
      discarded: isDiscardReply,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Gemini API chat error:', error);
    // Graceful fallback to avoid leaving user hanging
    const fallbackReply = getFallbackChessResponse(req.body?.prompt || '');
    res.json({
      reply: fallbackReply,
      isChessRelated: true,
      discarded: false,
      source: 'fallback-on-error',
    });
  }
});

// Vite middleware in dev; static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Prof.Chess server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
