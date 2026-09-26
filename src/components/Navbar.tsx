import React from 'react';
import {
  Repeat,
  Volume2,
  VolumeX,
  Palette,
  HelpCircle,
  Sparkles,
  Shield,
  Crown,
  Cpu
} from 'lucide-react';
import { boardThemes } from '../utils/boardThemes';
import { PaidPlanTier } from '../utils/pricingLocks';

interface NavbarProps {
  flipped: boolean;
  onToggleFlip: () => void;
  boardTheme: string;
  onChangeBoardTheme: (theme: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  onOpenPremium: () => void;
  onOpenPractice: () => void;
  onOpenChatAi?: () => void;
  isPremium?: boolean;
  userTier?: PaidPlanTier;
}

export const Navbar: React.FC<NavbarProps> = ({
  flipped,
  onToggleFlip,
  boardTheme,
  onChangeBoardTheme,
  soundEnabled,
  onToggleSound,
  onOpenHelp,
  onOpenPremium,
  onOpenPractice,
  onOpenChatAi,
  isPremium = false,
  userTier = 'none',
}) => {
  return (
    <header id="app-navbar" className="bg-[#12141a] border-b border-zinc-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-950/40">
            <Crown className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-zinc-100 tracking-tight">
                Chess Openings Master
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                20 Openings • 240 Variations
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              10 White & 10 Black Openings with 12 variations each & move-by-move master explanations
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Go Premium Button */}
          <button
            id="navbar-go-premium-btn"
            onClick={onOpenPremium}
            title="Go Premium - Lifetime & 3-Year Membership (₹999 / ₹699)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-600/20 hover:from-amber-500/35 hover:to-yellow-500/35 border border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm shadow-amber-950/20 group cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform fill-amber-400/20" />
            <span className="tracking-tight">Go Premium</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500 text-zinc-950 uppercase tracking-wider">
              ₹999 / ₹699
            </span>
          </button>

          {/* Flip Board Button */}
          <button
            id="navbar-flip-board-btn"
            onClick={onToggleFlip}
            title={flipped ? 'Flip to White Perspective' : 'Flip to Black Perspective'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-850 bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 text-xs font-medium transition-colors"
          >
            <Repeat className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{flipped ? 'Black POV' : 'White POV'}</span>
          </button>

          {/* Theme Selector */}
          <div className="relative flex items-center">
            <Palette className="w-3.5 h-3.5 absolute left-2 text-zinc-400 pointer-events-none" />
            <select
              id="navbar-board-theme-select"
              value={boardTheme}
              onChange={(e) => onChangeBoardTheme(e.target.value)}
              className="pl-7 pr-2 py-1.5 rounded-lg bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 text-xs font-medium transition-colors focus:outline-none focus:border-amber-500/60 cursor-pointer"
            >
              {Object.values(boardThemes).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            id="navbar-sound-toggle-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-1.5 rounded-lg bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {/* Help & Guide Modal Trigger */}
          <button
            id="navbar-help-btn"
            onClick={onOpenHelp}
            title="Study Guide & Repertoire Tips"
            className="p-1.5 rounded-lg bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-amber-400" />
          </button>

          {/* Practice Mode Icon Button (at last with Stockfish Engine Level 18) */}
          <button
            id="navbar-practice-mode-btn"
            onClick={onOpenPractice}
            title="Practice Mode - Stockfish Engine Level 18 (Board Editor, Opening Explorer, Play Engine)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 via-blue-500/25 to-indigo-500/20 hover:from-cyan-500/35 hover:to-blue-500/35 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all shadow-sm shadow-cyan-950/20 group cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-tight">Practice Mode</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-400 text-zinc-950 uppercase tracking-wider">
              Level 18
            </span>
          </button>

          {/* Chat with AI Floating Window Trigger */}
          {onOpenChatAi && (
            <button
              id="navbar-chat-with-ai-btn"
              onClick={onOpenChatAi}
              title="Chat with AI - Grandmaster Chess Assistant"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/25 hover:from-amber-500/40 hover:to-yellow-500/40 border border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm shadow-amber-950/20 group cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="tracking-tight">chat with ai</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
