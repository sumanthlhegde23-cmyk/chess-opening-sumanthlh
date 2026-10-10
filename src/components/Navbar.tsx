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
  Moon,
  Sun,
  MoreVertical,
  Check,
  Search,
  GraduationCap,
  BookOpen,
  UserRound,
} from 'lucide-react';
import { boardThemes } from '../utils/boardThemes';
import { PaidPlanTier } from '../utils/pricingLocks';
import { languages } from '../data/languages';

export type LanguageCode = string;

interface NavbarProps {
  flipped: boolean;
  onToggleFlip: () => void;
  colorMode: 'dark' | 'light';
  onToggleColorMode: () => void;
  boardTheme: string;
  onChangeBoardTheme: (theme: string) => void;
  language: LanguageCode;
  onChangeLanguage: (language: LanguageCode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  onOpenPremium: () => void;
  onReplayAppTour: () => void;
  onReplayChessBasics: () => void;
  onOpenChatAi?: () => void;
  isPremium?: boolean;
  userTier?: PaidPlanTier;
  translationStatus?: string | null;
  username: string;
  avatarDataUrl: string | null;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  flipped,
  onToggleFlip,
  colorMode,
  onToggleColorMode,
  boardTheme,
  onChangeBoardTheme,
  language,
  onChangeLanguage,
  soundEnabled,
  onToggleSound,
  onOpenHelp,
  onOpenPremium,
  onReplayAppTour,
  onReplayChessBasics,
  onOpenChatAi,
  isPremium = false,
  userTier = 'none',
  translationStatus,
  username,
  avatarDataUrl,
  onOpenProfile,
}) => {
  const languageMenuRef = React.useRef<HTMLDetailsElement>(null);
  const [languageSearch, setLanguageSearch] = React.useState('');
  const filteredLanguages = languages.filter((option) =>
    `${option.name} ${option.nativeName} ${option.code}`.toLowerCase().includes(languageSearch.trim().toLowerCase())
  );

  return (
    <header id="app-navbar" className="bg-[#12141a] border-b border-zinc-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Brand identity */}
        <div className="flex w-full min-w-0 items-center gap-3 xl:w-auto xl:flex-1">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-950/40">
            <Crown className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="whitespace-nowrap text-sm font-bold text-zinc-100 tracking-tight sm:text-base">
                Prof.Chess
              </h1>
              <span className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                32 Openings • 384 Variations
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              16 White & 16 Black Openings with 12 variations each & move-by-move master explanations
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex w-full flex-wrap items-center justify-between gap-1 sm:gap-2 xl:w-auto xl:flex-initial xl:justify-end">
          {/* Go Premium Button */}
          <button
            id="navbar-go-premium-btn"
            onClick={onOpenPremium}
            title="Go Premium - Lifetime & 3-Year Membership (₹999 / ₹699)"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-600/20 hover:from-amber-500/35 hover:to-yellow-500/35 border border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm shadow-amber-950/20 group cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform fill-amber-400/20" />
            <span className="hidden tracking-tight sm:inline">Go Premium</span>
            <span className="hidden px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500 text-zinc-950 uppercase tracking-wider lg:inline-block">
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

          <button
            id="navbar-color-mode-toggle"
            type="button"
            onClick={onToggleColorMode}
            title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
            className="p-1.5 rounded-lg bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 transition-colors"
          >
            {colorMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-600" />
            )}
          </button>

          {/* Theme Selector */}
          <div className="relative flex items-center">
            <Palette className="w-3.5 h-3.5 absolute left-2 text-zinc-400 pointer-events-none" />
            <select
              id="navbar-board-theme-select"
              value={boardTheme}
              onChange={(e) => onChangeBoardTheme(e.target.value)}
              aria-label="Board theme"
              className="w-24 truncate pl-7 pr-1 py-1.5 rounded-lg bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 text-xs font-medium transition-colors focus:outline-none focus:border-amber-500/60 cursor-pointer sm:w-32 sm:pr-2 lg:w-auto"
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

          {/* Chat with AI Floating Window Trigger */}
          {onOpenChatAi && (
            <button
              id="navbar-chat-with-ai-btn"
              onClick={onOpenChatAi}
              title="Chat with AI - Grandmaster Chess Assistant"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/25 hover:from-amber-500/40 hover:to-yellow-500/40 border border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm shadow-amber-950/20 group cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden tracking-tight lg:inline">Chat with AI</span>
            </button>
          )}

          <details
            ref={languageMenuRef}
            id="navbar-language-menu"
            className="relative"
            onKeyDown={(event) => {
              if (event.key === 'Escape' && languageMenuRef.current?.open) {
                languageMenuRef.current.open = false;
                languageMenuRef.current.querySelector('summary')?.focus();
                event.preventDefault();
              }
            }}
          >
            <summary
              aria-label="Open settings, language, and learning menu"
              aria-controls="navbar-language-menu-panel"
              title="Settings and language"
              className="flex list-none cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-[#181a20] p-1.5 text-zinc-300 transition-colors hover:bg-[#20242e] [&::-webkit-details-marker]:hidden"
            >
              <MoreVertical className="h-4 w-4" />
            </summary>
            <div id="navbar-language-menu-panel" className="absolute left-auto right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-lg border border-zinc-700 bg-[#181a20] p-1.5 shadow-xl">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase text-zinc-500">Take Demo</div>
              <div className="grid grid-cols-2 gap-1 px-1 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    onReplayAppTour();
                    if (languageMenuRef.current) languageMenuRef.current.open = false;
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
                >
                  <GraduationCap className="h-3.5 w-3.5" /> App Tour
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onReplayChessBasics();
                    if (languageMenuRef.current) languageMenuRef.current.open = false;
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Chess Basics
                </button>
              </div>
              <div className="mx-1 border-t border-zinc-700/70" />
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase text-zinc-500">Settings · Language ({languages.length})</p>
              <label className="relative block px-1 pb-2">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="search"
                  value={languageSearch}
                  onChange={(event) => setLanguageSearch(event.target.value)}
                  placeholder="Search languages"
                  aria-label="Search languages"
                  className="w-full rounded-md border border-zinc-700 bg-[#101218] py-2 pl-8 pr-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-amber-500/70"
                />
              </label>
              <p className="px-2 pb-2 text-[10px] leading-relaxed text-zinc-500">
                New visible text is translated as needed and cached on this device. Chess notation stays unchanged.
              </p>
              {translationStatus && (
                <p role="status" aria-live="polite" className="mx-1 mb-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs leading-relaxed text-amber-200">
                  {translationStatus}
                </p>
              )}
              <div className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain pr-0.5">
              {filteredLanguages.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    onChangeLanguage(option.code);
                    setLanguageSearch('');
                    if (languageMenuRef.current) languageMenuRef.current.open = false;
                  }}
                  aria-current={language === option.code ? 'true' : undefined}
                  aria-pressed={language === option.code}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  <span className="flex min-w-0 flex-col">
                    <span data-no-translate="true" className="truncate">{option.nativeName}</span>
                    {option.nativeName !== option.name && (
                      <span data-no-translate="true" className="truncate text-[10px] text-zinc-500">{option.name}</span>
                    )}
                  </span>
                  {language === option.code && <Check className="h-4 w-4 text-amber-400" />}
                </button>
              ))}
              {filteredLanguages.length === 0 && (
                <p className="px-2 py-3 text-sm text-zinc-500">No languages found</p>
              )}
              </div>
            </div>
          </details>

          <button
            id="navbar-player-profile-btn"
            type="button"
            onClick={onOpenProfile}
            title="Open your player profile"
            aria-label={`Open profile for ${username || 'Chess Player'}`}
            className="flex min-w-0 items-center gap-2 rounded-lg border border-amber-500/30 bg-[#181a20] p-1.5 text-left transition-colors hover:border-amber-400/70 hover:bg-[#20242e]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-700 bg-zinc-800">
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-5 w-5 text-amber-300" />
              )}
            </span>
            <span className="max-w-28 truncate text-xs font-semibold text-zinc-100 sm:max-w-36">
              {username || 'Set username'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
