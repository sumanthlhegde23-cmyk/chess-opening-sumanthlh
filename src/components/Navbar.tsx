import React from 'react';
import {
  Repeat,
  Volume2,
  VolumeX,
  Palette,
  HelpCircle,
  Sparkles,
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
  Globe,
  Sliders,
  ChevronRight,
  ArrowLeft,
  Swords,
  Play,
} from 'lucide-react';
import { boardThemes, BoardTheme } from '../utils/boardThemes';
import { PaidPlanTier } from '../utils/pricingLocks';
import { languages } from '../data/languages';
import { chessAudio, SOUND_SYSTEMS, SoundSystemDefinition } from '../utils/sound';

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
  soundSystem?: string;
  onChangeSoundSystem?: (system: string) => void;
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

type MenuScreen = 'main' | 'language' | 'board_root' | 'board_theme' | 'sound_setting';

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
  soundSystem: propSoundSystem,
  onChangeSoundSystem,
  onOpenHelp,
  onOpenPremium,
  onReplayAppTour,
  onReplayChessBasics,
  onOpenChatAi,
  translationStatus,
  username,
  avatarDataUrl,
  currentStreak = 0,
  onOpenProfile,
}) => {
  const languageMenuRef = React.useRef<HTMLDetailsElement>(null);
  const [menuScreen, setMenuScreen] = React.useState<MenuScreen>('main');
  const [languageSearch, setLanguageSearch] = React.useState('');
  const [panelPlacement, setPanelPlacement] = React.useState<React.CSSProperties>({});
  const [activeSoundSystemId, setActiveSoundSystemId] = React.useState<string>(
    () => propSoundSystem || chessAudio.getCurrentSoundSystem()
  );

  React.useEffect(() => {
    if (propSoundSystem) {
      setActiveSoundSystemId(propSoundSystem);
    }
  }, [propSoundSystem]);

  const filteredLanguages = React.useMemo(() => {
    const query = languageSearch.trim().toLowerCase();
    if (!query) return languages;
    return languages.filter((option) =>
      `${option.name} ${option.nativeName} ${option.code}`.toLowerCase().includes(query)
    );
  }, [languageSearch]);

  const currentLanguageObj = React.useMemo(() => {
    return languages.find((l) => l.code === language) || languages[0];
  }, [language]);

  const currentBoardThemeObj = React.useMemo(() => {
    return boardThemes[boardTheme] || boardThemes.maple;
  }, [boardTheme]);

  const currentSoundSystemObj = React.useMemo(() => {
    return SOUND_SYSTEMS.find((s) => s.id === activeSoundSystemId) || SOUND_SYSTEMS[0];
  }, [activeSoundSystemId]);

  const updatePanelPlacement = React.useCallback(() => {
    if (!languageMenuRef.current?.open) return;
    const summary = languageMenuRef.current.querySelector('summary');
    if (!summary) return;

    const rect = summary.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const margin = 8;

    // Panel width responsive clamping (up to 340px)
    const availableWidth = Math.max(200, vw - margin * 2);
    const panelWidth = Math.min(340, availableWidth);

    let left = rect.right - panelWidth;
    if (left < margin) {
      left = margin;
    }
    if (left + panelWidth > vw - margin) {
      left = Math.max(margin, vw - margin - panelWidth);
    }

    let top = rect.bottom + 8;
    const spaceBelow = vh - top - margin;
    const spaceAbove = rect.top - margin - 8;
    let maxHeight = spaceBelow;

    if (spaceBelow < 280 && spaceAbove > spaceBelow) {
      const desiredHeight = Math.min(520, spaceAbove);
      top = Math.max(margin, rect.top - desiredHeight - 8);
      maxHeight = desiredHeight;
    } else {
      maxHeight = Math.min(540, spaceBelow);
    }

    setPanelPlacement({
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(panelWidth)}px`,
      maxWidth: `calc(100vw - ${margin * 2}px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))`,
      maxHeight: `${Math.round(Math.max(260, maxHeight))}px`,
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
        setMenuScreen('main');
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

  const closeMenu = () => {
    if (languageMenuRef.current) {
      languageMenuRef.current.open = false;
    }
    setMenuScreen('main');
  };

  const handleSelectSoundSystem = (sysId: string) => {
    setActiveSoundSystemId(sysId);
    chessAudio.setSoundSystem(sysId);
    if (onChangeSoundSystem) {
      onChangeSoundSystem(sysId);
    }
    chessAudio.playMove(sysId);
  };

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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Repeat className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{flipped ? 'Black POV' : 'White POV'}</span>
          </button>

          {/* Color Mode Toggle */}
          <button
            id="navbar-color-mode-toggle"
            type="button"
            onClick={onToggleColorMode}
            title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
            className="p-1.5 rounded-lg bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 transition-colors cursor-pointer"
          >
            {colorMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-600" />
            )}
          </button>

          {/* Sound & AI Voice Coach Toggle */}
          <button
            id="navbar-sound-toggle-btn"
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            title={soundEnabled ? 'Sound & Voice: ON (Click to Mute)' : 'Sound & Voice: OFF (Click to Enable)'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
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
            className="p-1.5 rounded-lg bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 transition-colors cursor-pointer"
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

          {/* Three Dots Menu: Contains 4 options (App Tour, Chess Basics, Language Setting, Board Setting) */}
          <details
            ref={languageMenuRef}
            id="navbar-language-menu"
            className="relative"
            onToggle={(event) => {
              if (event.currentTarget.open) {
                setMenuScreen('main');
                updatePanelPlacement();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && languageMenuRef.current?.open) {
                closeMenu();
                languageMenuRef.current.querySelector('summary')?.focus();
                event.preventDefault();
              }
            }}
          >
            <summary
              aria-label="Open settings and options menu"
              aria-controls="navbar-language-menu-panel"
              title="Menu & Settings"
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
              className="rounded-xl border p-2 shadow-2xl overflow-hidden flex flex-col animate-fadeIn select-none"
            >
              {/* SCREEN 1: MAIN MENU (4 Buttons: App Tour, Chess Basics, Language Setting, Board Setting) */}
              {menuScreen === 'main' && (
                <div className="flex flex-col gap-1.5">
                  <div
                    className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b pb-1.5 mb-0.5"
                    style={{
                      color: 'var(--text-color-muted, #a1a1aa)',
                      borderColor: 'var(--border-color, #3f3f46)',
                    }}
                  >
                    Settings & Demos
                  </div>

                  {/* 1st Button: App Tour */}
                  <button
                    id="menu-btn-app-tour"
                    type="button"
                    onClick={() => {
                      onReplayAppTour();
                      closeMenu();
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-left transition-all hover:bg-amber-500/20 hover:border-amber-400/50 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-300">1. App Tour</div>
                        <div className="text-[10px] text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                          Interactive guided walkthrough
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-amber-400/70 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 2nd Button: Chess Basics */}
                  <button
                    id="menu-btn-chess-basics"
                    type="button"
                    onClick={() => {
                      onReplayChessBasics();
                      closeMenu();
                    }}
                    className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all hover:opacity-95 cursor-pointer group"
                    style={{
                      backgroundColor: 'var(--bg-card-subtle, #27272a)',
                      borderColor: 'var(--border-color, #3f3f46)',
                      color: 'var(--text-color, #f4f4f5)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-cyan-300">2. Chess Basics</div>
                        <div className="text-[10px] text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                          Rules, piece movements & guide
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cyan-400/70 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 3rd Button: Language Setting */}
                  <button
                    id="menu-btn-language-setting"
                    type="button"
                    onClick={() => {
                      setMenuScreen('language');
                    }}
                    className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all hover:opacity-95 cursor-pointer group"
                    style={{
                      backgroundColor: 'var(--bg-card-subtle, #27272a)',
                      borderColor: 'var(--border-color, #3f3f46)',
                      color: 'var(--text-color, #f4f4f5)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-300">3. Language Setting</div>
                        <div className="text-[10px] text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                          {currentLanguageObj.nativeName} ({currentLanguageObj.name})
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-emerald-400/70 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* 4th Button: Board Setting */}
                  <button
                    id="menu-btn-board-setting"
                    type="button"
                    onClick={() => {
                      setMenuScreen('board_root');
                    }}
                    className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all hover:opacity-95 cursor-pointer group"
                    style={{
                      backgroundColor: 'var(--bg-card-subtle, #27272a)',
                      borderColor: 'var(--border-color, #3f3f46)',
                      color: 'var(--text-color, #f4f4f5)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                        <Sliders className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-300">4. Board Setting</div>
                        <div className="text-[10px] text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                          {currentBoardThemeObj.name} • {currentSoundSystemObj.name}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-amber-400/70 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              )}

              {/* SCREEN 2: LANGUAGE SETTING (Drop-down list of languages with search) */}
              {menuScreen === 'language' && (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="shrink-0 pb-2 border-b" style={{ borderColor: 'var(--border-color, #3f3f46)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={() => setMenuScreen('main')}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer py-0.5 px-1"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back</span>
                      </button>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                        Language Setting ({languages.length})
                      </span>
                    </div>

                    <label className="relative block">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="search"
                        value={languageSearch}
                        onChange={(event) => setLanguageSearch(event.target.value)}
                        placeholder="Search languages..."
                        aria-label="Search languages"
                        className="w-full rounded-lg border py-1.5 pl-8 pr-2 text-xs outline-none focus:border-amber-500/70"
                        style={{
                          backgroundColor: 'var(--bg-card-subtle, #101218)',
                          borderColor: 'var(--border-color, #3f3f46)',
                          color: 'var(--text-color, #f4f4f5)',
                        }}
                      />
                    </label>
                    {translationStatus && (
                      <p role="status" aria-live="polite" className="mt-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-1.5 text-[10px] leading-relaxed text-amber-200">
                        {translationStatus}
                      </p>
                    )}
                  </div>

                  <div
                    className="overflow-y-auto overscroll-contain flex-1 pt-1.5 pr-0.5 space-y-0.5"
                    style={{ maxHeight: '340px' }}
                  >
                    {filteredLanguages.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => {
                          onChangeLanguage(option.code);
                          setLanguageSearch('');
                          closeMenu();
                        }}
                        aria-current={language === option.code ? 'true' : undefined}
                        aria-pressed={language === option.code}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                          language === option.code
                            ? 'bg-amber-500/20 text-amber-300 font-semibold'
                            : 'hover:bg-black/10'
                        }`}
                        style={{ color: language === option.code ? undefined : 'var(--text-color, #f4f4f5)' }}
                      >
                        <span className="flex min-w-0 flex-col">
                          <span data-no-translate="true" className="truncate font-medium">{option.nativeName}</span>
                          {option.nativeName !== option.name && (
                            <span data-no-translate="true" className="truncate text-[10px] opacity-70">{option.name}</span>
                          )}
                        </span>
                        {language === option.code && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                      </button>
                    ))}
                    {filteredLanguages.length === 0 && (
                      <p className="px-2 py-4 text-center text-xs text-zinc-500">No languages found</p>
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN 3: BOARD SETTING ROOT (Contains Two Buttons: Board Setting & Sound Setting) */}
              {menuScreen === 'board_root' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: 'var(--border-color, #3f3f46)' }}>
                    <button
                      type="button"
                      onClick={() => setMenuScreen('main')}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer py-0.5 px-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back</span>
                    </button>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                      Board & Sound
                    </span>
                  </div>

                  <p className="text-[11px] px-1 text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                    Choose board appearance or customize piece sound effects:
                  </p>

                  {/* Button 1: Board Setting (Change board color/theme) */}
                  <button
                    id="menu-btn-sub-board-setting"
                    type="button"
                    onClick={() => setMenuScreen('board_theme')}
                    className="flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-all hover:opacity-95 cursor-pointer group"
                    style={{
                      backgroundColor: 'var(--bg-card-subtle, #27272a)',
                      borderColor: 'var(--border-color, #3f3f46)',
                      color: 'var(--text-color, #f4f4f5)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                        <Palette className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-300">Board Setting</div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                          <span>Theme: {currentBoardThemeObj.name}</span>
                          <span className="inline-flex rounded overflow-hidden border border-zinc-600">
                            <span className={`w-2.5 h-2.5 ${currentBoardThemeObj.lightSquare}`} />
                            <span className={`w-2.5 h-2.5 ${currentBoardThemeObj.darkSquare}`} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-amber-400/70 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Button 2: Sound Setting (10 different sound systems) */}
                  <button
                    id="menu-btn-sub-sound-setting"
                    type="button"
                    onClick={() => setMenuScreen('sound_setting')}
                    className="flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-all hover:opacity-95 cursor-pointer group"
                    style={{
                      backgroundColor: 'var(--bg-card-subtle, #27272a)',
                      borderColor: 'var(--border-color, #3f3f46)',
                      color: 'var(--text-color, #f4f4f5)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                        <Volume2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-cyan-300">Sound Setting</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                          {currentSoundSystemObj.name} • 10 Sound Systems
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-cyan-400/70 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              )}

              {/* SCREEN 4: BOARD THEME PICKER (Inside Board Setting -> Board Setting) */}
              {menuScreen === 'board_theme' && (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="shrink-0 pb-2 border-b" style={{ borderColor: 'var(--border-color, #3f3f46)' }}>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setMenuScreen('board_root')}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer py-0.5 px-1"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back</span>
                      </button>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                        Board Colours
                      </span>
                    </div>
                  </div>

                  <div
                    className="overflow-y-auto overscroll-contain flex-1 pt-2 pr-0.5 space-y-1.5"
                    style={{ maxHeight: '340px' }}
                  >
                    {Object.values(boardThemes).map((theme: BoardTheme) => {
                      const isSelected = boardTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            onChangeBoardTheme(theme.id);
                            chessAudio.playMove();
                          }}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500/70 bg-amber-500/15 text-amber-200'
                              : 'border-zinc-800/80 hover:bg-black/10'
                          }`}
                          style={{
                            backgroundColor: isSelected ? undefined : 'var(--bg-card-subtle, #27272a)',
                            borderColor: isSelected ? undefined : 'var(--border-color, #3f3f46)',
                            color: isSelected ? undefined : 'var(--text-color, #f4f4f5)',
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Color Swatch Preview */}
                            <div className="w-6 h-6 rounded border border-zinc-700 overflow-hidden flex flex-wrap shrink-0 shadow-xs">
                              <div className={`w-3 h-3 ${theme.lightSquare}`} />
                              <div className={`w-3 h-3 ${theme.darkSquare}`} />
                              <div className={`w-3 h-3 ${theme.darkSquare}`} />
                              <div className={`w-3 h-3 ${theme.lightSquare}`} />
                            </div>
                            <span className="font-semibold text-xs">{theme.name}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SCREEN 5: 10 SOUND SYSTEMS (Inside Board Setting -> Sound Setting) */}
              {menuScreen === 'sound_setting' && (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="shrink-0 pb-2 border-b" style={{ borderColor: 'var(--border-color, #3f3f46)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        type="button"
                        onClick={() => setMenuScreen('board_root')}
                        className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer py-0.5 px-1"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back</span>
                      </button>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                        Sound Setting (10 Types)
                      </span>
                    </div>

                    {/* Master sound toggle row */}
                    <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5 bg-black/20 border border-zinc-800">
                      <div className="flex items-center gap-2 text-xs">
                        {soundEnabled ? (
                          <Volume2 className="h-4 w-4 text-amber-400" />
                        ) : (
                          <VolumeX className="h-4 w-4 text-zinc-500" />
                        )}
                        <span className="font-medium">Audio Output</span>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleSound}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                          soundEnabled
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {soundEnabled ? 'Enabled' : 'Muted'}
                      </button>
                    </div>
                  </div>

                  {/* Scrollable list of 10 sound systems */}
                  <div
                    className="overflow-y-auto overscroll-contain flex-1 pt-2 pr-0.5 space-y-2"
                    style={{ maxHeight: '340px' }}
                  >
                    {SOUND_SYSTEMS.map((sys: SoundSystemDefinition, index: number) => {
                      const isSelected = activeSoundSystemId === sys.id;
                      return (
                        <div
                          key={sys.id}
                          onClick={() => handleSelectSoundSystem(sys.id)}
                          className={`rounded-lg border p-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500/70 bg-amber-500/15 shadow-sm'
                              : 'border-zinc-800 hover:border-zinc-700 hover:bg-black/10'
                          }`}
                          style={{
                            backgroundColor: isSelected ? undefined : 'var(--bg-card-subtle, #27272a)',
                            borderColor: isSelected ? undefined : 'var(--border-color, #3f3f46)',
                            color: 'var(--text-color, #f4f4f5)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                                {index + 1}
                              </span>
                              <span className="text-xs font-bold text-zinc-100">{sys.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-zinc-800/80 text-zinc-400">
                                {sys.category}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                                <Check className="h-3.5 w-3.5" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-zinc-400 mb-2 leading-tight" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                            {sys.description}
                          </p>

                          {/* Sound test buttons for piece movement and capturing */}
                          <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800/60">
                            <span className="text-[10px] font-semibold text-zinc-400 mr-1" style={{ color: 'var(--text-color-muted, #a1a1aa)' }}>
                              Test Sound:
                            </span>
                            <button
                              type="button"
                              title="Play piece movement sound"
                              onClick={(e) => {
                                e.stopPropagation();
                                chessAudio.playMove(sys.id);
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-[#181a20] border border-zinc-700 hover:bg-[#20242e] text-[10px] font-medium text-zinc-200 transition-colors cursor-pointer"
                            >
                              <Play className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                              <span>Move</span>
                            </button>
                            <button
                              type="button"
                              title="Play piece capturing sound"
                              onClick={(e) => {
                                e.stopPropagation();
                                chessAudio.playCapture(sys.id);
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-[#181a20] border border-zinc-700 hover:bg-[#20242e] text-[10px] font-medium text-zinc-200 transition-colors cursor-pointer"
                            >
                              <Swords className="h-2.5 w-2.5 text-rose-400" />
                              <span>Capture</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-[#181a20] px-2.5 py-1.5 text-xs font-bold text-amber-300 transition-colors hover:border-amber-400/70 hover:bg-[#20242e] cursor-pointer"
          >
            <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span id="streak-counter-value-nav" data-testid="streak-counter-value">{currentStreak}</span>
          </button>

          {/* Player Profile Button */}
          <button
            id="navbar-player-profile-btn"
            type="button"
            onClick={onOpenProfile}
            title="Open your player profile"
            aria-label={`Open profile for ${username || 'Chess Player'}`}
            className="flex min-w-0 items-center gap-2 rounded-lg border border-amber-500/30 bg-[#181a20] p-1.5 text-left transition-colors hover:border-amber-400/70 hover:bg-[#20242e] cursor-pointer"
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
