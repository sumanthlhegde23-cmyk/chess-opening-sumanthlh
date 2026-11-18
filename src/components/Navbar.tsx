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
  Flame,
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
  currentStreak?: number;
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
  currentStreak = 0,
  onOpenProfile,
}) => {
  const languageMenuRef = React.useRef<HTMLDetailsElement>(null);
  const [languageSearch, setLanguageSearch] = React.useState('');
  const [panelPlacement, setPanelPlacement] = React.useState<React.CSSProperties>({});
  const filteredLanguages = languages.filter((option) =>
    `${option.name} ${option.nativeName} ${option.code}`.toLowerCase().includes(languageSearch.trim().toLowerCase())
  );

  const updatePanelPlacement = React.useCallback(() => {
    if (!languageMenuRef.current?.open) return;
    const summary = languageMenuRef.current.querySelector('summary');
    if (!summary) return;

    const rect = summary.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const margin = 8; // Small edge margin from screen

    // Target width: 288px on wider screens, clamped to screen width minus margins on small phones
    const availableWidth = Math.max(200, vw - margin * 2);
    const panelWidth = Math.min(288, availableWidth);

    // Initial position: align right edge of panel to right edge of the three-dot button
    let left = rect.right - panelWidth;

    // If it overflows the left side of the screen, reposition to the right
    if (left < margin) {
      left = margin;
    }
    // If it overflows the right side of the screen, reposition to the left
    if (left + panelWidth > vw - margin) {
      left = Math.max(margin, vw - margin - panelWidth);
    }

    // Vertical placement: prefer below the button, but check available viewport height
    let top = rect.bottom + 8;
    const spaceBelow = vh - top - margin;
    const spaceAbove = rect.top - margin - 8;
    let maxHeight = spaceBelow;

    // If space below is constrained (less than 260px) and space above has more room, flip above
    if (spaceBelow < 260 && spaceAbove > spaceBelow) {
      const desiredHeight = Math.min(480, spaceAbove);
      top = Math.max(margin, rect.top - desiredHeight - 8);
      maxHeight = desiredHeight;
    } else {
      maxHeight = Math.min(500, spaceBelow);
    }

    setPanelPlacement({
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(panelWidth)}px`,
      maxWidth: `calc(100vw - ${margin * 2}px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))`,
      maxHeight: `${Math.round(Math.max(220, maxHeight))}px`,
      zIndex: 100,
    });
  }, []);

  React.useEffect(() => {
    const handleReposition = () => {
      if (languageMenuRef.current?.open) {
        updatePanelPlacement();
      }
    };
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [updatePanelPlacement]);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        languageMenuRef.current?.open &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        languageMenuRef.current.open = false;
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

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

          {/* Sound & AI Voice Coach Toggle */}
          <button
            id="navbar-sound-toggle-btn"
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            title={soundEnabled ? 'AI Voice Coach & Sound: ON (Click to Mute)' : 'AI Voice Coach & Sound: OFF (Click to Enable)'}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-[#181a20] border-zinc-800 hover:bg-[#20242e] text-zinc-500 hover:text-zinc-300'
            }`}
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
            onToggle={(event) => {
              if (event.currentTarget.open) {
                updatePanelPlacement();
              }
            }}
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
            <div
              id="navbar-language-menu-panel"
              style={{
                ...panelPlacement,
                backgroundColor: 'var(--bg-surface, #181a20)',
                borderColor: 'var(--border-color, #3f3f46)',
                color: 'var(--text-color, #f4f4f5)',
              }}
              className="rounded-xl border p-2 shadow-2xl overflow-hidden flex flex-col animate-fadeIn"
            >
              {/* Header section with App Tour & Chess Basics Demo (always visible) */}
              <div className="shrink-0 pb-1">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                  Take Demo
                </div>
                <div className="grid grid-cols-2 gap-1.5 px-1 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      onReplayAppTour();
                      if (languageMenuRef.current) languageMenuRef.current.open = false;
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-2 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/20 cursor-pointer"
                  >
                    <GraduationCap className="h-4 w-4 text-amber-400" />
                    <span>App Tour</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReplayChessBasics();
                      if (languageMenuRef.current) languageMenuRef.current.open = false;
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-bold transition-colors hover:opacity-90 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-card-subtle, #27272a)',
                      borderColor: 'var(--border-color, #3f3f46)',
                      color: 'var(--text-color, #f4f4f5)',
                    }}
                  >
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                    <span>Chess Basics</span>
                  </button>
                </div>
                <div className="mx-1 my-1 border-t" style={{ borderColor: 'var(--border-color, #3f3f46)' }} />
                <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                  Settings · Language ({languages.length})
                </p>
                <label className="relative block px-1 pb-1.5">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="search"
                    value={languageSearch}
                    onChange={(event) => setLanguageSearch(event.target.value)}
                    placeholder="Search languages"
                    aria-label="Search languages"
                    className="w-full rounded-lg border py-1.5 pl-8 pr-2 text-xs outline-none focus:border-amber-500/70"
                    style={{
                      backgroundColor: 'var(--bg-card-subtle, #101218)',
                      borderColor: 'var(--border-color, #3f3f46)',
                      color: 'var(--text-color, #f4f4f5)',
                    }}
                  />
                </label>
                <p className="px-2 pb-1.5 text-[10px] leading-relaxed text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                  New visible text is translated as needed and cached on this device.
                </p>
                {translationStatus && (
                  <p role="status" aria-live="polite" className="mx-1 mb-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-1.5 text-[11px] leading-relaxed text-amber-200">
                    {translationStatus}
                  </p>
                )}
              </div>

              {/* Scrollable Language List */}
              <div className="overflow-y-auto overscroll-contain flex-1 pr-0.5 border-t pt-1" style={{ borderColor: 'var(--border-color, #3f3f46)' }}>
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
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-black/10 transition-colors cursor-pointer"
                    style={{ color: 'var(--text-color, #f4f4f5)' }}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span data-no-translate="true" className="truncate font-semibold">{option.nativeName}</span>
                      {option.nativeName !== option.name && (
                        <span data-no-translate="true" className="truncate text-[10px] opacity-70">{option.name}</span>
                      )}
                    </span>
                    {language === option.code && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                  </button>
                ))}
                {filteredLanguages.length === 0 && (
                  <p className="px-2 py-3 text-center text-xs text-zinc-500">No languages found</p>
                )}
              </div>
            </div>
          </details>

          {/* Streak Counter Badge */}
          <button
            id="navbar-streak-counter"
            data-testid="streak-counter"
            type="button"
            onClick={onOpenProfile}
            title={`${currentStreak} day streak`}
            aria-label={`Current streak: ${currentStreak} days`}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-[#181a20] px-2.5 py-1.5 text-xs font-bold text-amber-300 transition-colors hover:border-amber-400/70 hover:bg-[#20242e]"
          >
            <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span id="streak-counter-value-nav" data-testid="streak-counter-value">{currentStreak}</span>
          </button>

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
