import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Minimize2,
  Maximize2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isChessRelated?: boolean;
  discarded?: boolean;
}

interface ChatWithAiWindowProps {
  isOpen: boolean;
  onClose: () => void;
  currentOpeningName?: string;
  currentVariationName?: string;
  initialFen?: string;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-init',
  sender: 'ai',
  text: `Hello! I am your Grandmaster Chess AI Assistant. 

Ask me anything about **chess openings**, theoretical variations, **tactical motifs**, pawn structures, endgame principles, or grandmaster games!

You can also paste or upload any **FEN position** from the Board Editor to get complete positional evaluations and move explanations.

*Note: I am strictly dedicated to chess and will discard any non-chess questions.*`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  isChessRelated: true,
};

export const ChatWithAiWindow: React.FC<ChatWithAiWindowProps> = ({
  isOpen,
  onClose,
  currentOpeningName,
  currentVariationName,
  initialFen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [currentFen, setCurrentFen] = useState<string | undefined>(initialFen);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initialFen when prop changes
  useEffect(() => {
    if (initialFen) {
      setCurrentFen(initialFen);
    }
  }, [initialFen]);

  // Auto-scroll on message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, isMinimized]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          currentOpening: currentOpeningName,
          currentVariation: currentVariationName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'No response received from chess assistant.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isChessRelated: data.isChessRelated ?? true,
        discarded: data.discarded ?? false,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      // Client-side fallback if server fails
      const isChess = isQuickChessCheck(query);
      const fallbackReply = isChess
        ? `In response to "${query}": A sound chess principle is to prioritize controlling the 4 central squares (e4, d4, e5, d5), developing your minor pieces early, castling for king safety, and avoiding moving the same piece multiple times in the opening without a concrete tactical reason.`
        : 'I am a specialized Chess AI Assistant. I can only answer questions related to chess—such as openings, strategies, tactical patterns, endgame techniques, rules, and grandmaster games. Please ask a chess question!';

      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isChessRelated: isChess,
        discarded: !isChess,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  const sampleChips = [
    currentOpeningName ? `Explain ${currentOpeningName}` : 'Explain the Sicilian Defense',
    'How to counter 1.e4?',
    'What is an isolated queen pawn?',
    'Common traps in the Ruy Lopez',
    'How does en passant work?',
  ];

  return (
    <div
      id="chat-with-ai-floating-window"
      className={`fixed z-50 transition-all duration-300 flex flex-col bg-[#14171f] border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-md overflow-hidden ${
        isMinimized
          ? 'bottom-5 right-5 w-80 h-14'
          : isExpanded
          ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[560px] h-[85vh] max-h-[800px]'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[560px] max-h-[85vh]'
      }`}
    >
      {/* Floating Window Header with required title "chat with ai" */}
      <div
        id="chat-with-ai-header"
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1b1f2b] via-[#161922] to-[#12141a] border-b border-zinc-800 select-none cursor-pointer"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-zinc-950 font-bold shadow-sm shadow-amber-500/20">
              <Bot className="w-4 h-4 text-zinc-950" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#14171f] animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 tracking-wide">
              {/* Exactly requested title */}
              <span>chat with ai</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Chess Only
              </span>
            </h3>
            {!isMinimized && (
              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Non-chess queries strictly discarded</span>
              </p>
            )}
          </div>
        </div>

        {/* Window action buttons */}
        <div className="flex items-center gap-1">
          {!isMinimized && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetChat();
                }}
                title="Restart chat"
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer hidden sm:block"
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isMinimized ? 'rotate-180' : ''
              }`}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close"
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body when not minimized */}
      {!isMinimized && (
        <>
          {/* Quick Context Banner */}
          {currentOpeningName && (
            <div className="px-3.5 py-1.5 bg-[#171b26] border-b border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="truncate">
                Examining:{' '}
                <strong className="text-amber-300 font-semibold">{currentOpeningName}</strong>
                {currentVariationName ? ` (${currentVariationName})` : ''}
              </span>
              <span className="text-[10px] text-zinc-500 shrink-0 ml-2">Context Active</span>
            </div>
          )}

          {/* Active FEN Position Banner */}
          {currentFen && (
            <div className="px-3.5 py-2 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent border-b border-cyan-500/30 flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-zinc-300 font-semibold truncate">
                  FEN: <span className="font-mono text-cyan-300 text-[10px]">{currentFen}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSend(
                    `Please explain this board position step by step, evaluate White vs Black chances, and suggest candidate moves: ${currentFen}`
                  )
                }
                disabled={isLoading}
                className="px-2 py-0.5 rounded bg-cyan-500/25 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-500/40 text-[10px] font-bold transition-colors shrink-0 cursor-pointer disabled:opacity-40"
              >
                Explain FEN
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-[#0f1118]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-zinc-950 font-medium rounded-tr-none shadow-md shadow-amber-950/20'
                      : msg.discarded
                      ? 'bg-rose-950/30 border border-rose-500/40 text-rose-200 rounded-tl-none'
                      : 'bg-[#1a1e2b] border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Discarded non-chess query alert pill */}
                  {msg.discarded && (
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1.5 pb-1 border-b border-rose-500/30">
                      <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>Non-Chess Query Discarded</span>
                    </div>
                  )}

                  {/* Rendered content */}
                  <div className="whitespace-pre-wrap break-words">{renderFormattedText(msg.text)}</div>

                  <div
                    className={`text-[9px] mt-1.5 flex items-center gap-1 ${
                      msg.sender === 'user' ? 'text-amber-950/70 justify-end' : 'text-zinc-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center text-xs text-zinc-400">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 animate-spin">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#1a1e2b] border border-zinc-800 px-3.5 py-2 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-zinc-400 ml-1.5">Analyzing chess position...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-1.5 bg-[#141720] border-t border-zinc-800/80 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
            {sampleChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={isLoading}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#1b202e] hover:bg-amber-500/20 border border-zinc-700 hover:border-amber-500/40 text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#12141a] border-t border-zinc-800">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any chess question (openings, rules, tactics)..."
                disabled={isLoading}
                className="w-full bg-[#1a1e2b] border border-zinc-700/80 focus:border-amber-400 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl pl-3.5 pr-10 py-2.5 outline-none transition-all"
              />
              <button
                id="chat-with-ai-send-btn"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                title="Send chess question"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-zinc-500">
              <span>Press Enter to send</span>
              <span className="text-zinc-500 flex items-center gap-1">
                <HelpCircle className="w-2.5 h-2.5" /> Chess questions only
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper to quickly check if a query is chess-related on client side fallback
function isQuickChessCheck(text: string): boolean {
  if (text.includes('/') && text.split('/').length >= 8) return true;
  const lower = text.toLowerCase();
  const chessTerms = [
    'chess', 'opening', 'defense', 'variation', 'gambit', 'checkmate', 'stalemate',
    'pawn', 'knight', 'bishop', 'rook', 'queen', 'king', 'castle', 'castling',
    'en passant', 'e4', 'd4', 'c4', 'nf3', 'fischer', 'kasparov', 'carlsen',
    'gukesh', 'anand', 'nakamura', 'tactics', 'fork', 'pin', 'skewer', 'eval',
    'sicilian', 'ruy lopez', 'french', 'caro-kann', 'king\'s indian', 'endgame',
    'fen', 'stockfish', 'blunder', 'engine', 'position'
  ];
  return chessTerms.some((term) => lower.includes(term));
}

// Clean helper to render bold text, bullet points and code chips without heavy dependencies
function renderFormattedText(text: string): React.ReactNode {
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="font-bold text-amber-300 text-xs mt-1.5 mb-1">
              {renderInlineStyles(trimmed.substring(4))}
            </h4>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={lineIdx} className="font-bold text-amber-400 text-xs mt-2 mb-1">
              {renderInlineStyles(trimmed.substring(3))}
            </h3>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-amber-400 mt-0.5">•</span>
              <span className="flex-1">{renderInlineStyles(trimmed.substring(2))}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s(.*)$/);
          if (match) {
            return (
              <div key={lineIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
                <span className="text-amber-400 font-semibold">{match[1]}</span>
                <span className="flex-1">{renderInlineStyles(match[2])}</span>
              </div>
            );
          }
        }

        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        return <p key={lineIdx}>{renderInlineStyles(line)}</p>;
      })}
    </div>
  );
}

function renderInlineStyles(str: string): React.ReactNode {
  // Split on **bold** and `code`
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-amber-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1 py-0.5 bg-black/40 rounded text-amber-200 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
