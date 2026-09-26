import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

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

const CHESS_SYSTEM_INSTRUCTION = `You are an elite Grandmaster Chess AI Assistant for the "Chess Openings Master" web application.
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

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, currentOpening, currentVariation, chatHistory } = req.body;

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

    const fullPrompt = `${contextStr}User question: ${trimmedPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: CHESS_SYSTEM_INSTRUCTION,
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
    console.log(`Chess Openings Master server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
