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
  Cpu,
  Moon,
  Sun,
  MoreVertical,
  Check
} from 'lucide-react';
import { boardThemes } from '../utils/boardThemes';
import { PaidPlanTier } from '../utils/pricingLocks';

export type LanguageCode = 'en' | 'hi' | 'es' | 'fr' | 'de';

const languageOptions: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

const navbarCopy: Record<LanguageCode, {
  subtitle: string;
  premium: string;
  flipWhite: string;
  flipBlack: string;
  whitePov: string;
  blackPov: string;
  switchLight: string;
  switchDark: string;
  boardTheme: string;
  mute: string;
  enableSound: string;
  guide: string;
  practice: string;
  chat: string;
  language: string;
  menu: string;
}> = {
  en: {
    subtitle: '10 White & 10 Black Openings with 12 variations each & move-by-move master explanations',
    premium: 'Go Premium', flipWhite: 'Flip to White Perspective', flipBlack: 'Flip to Black Perspective',
    whitePov: 'White POV', blackPov: 'Black POV', switchLight: 'Switch to light mode', switchDark: 'Switch to dark mode',
    boardTheme: 'Board theme', mute: 'Mute Sound', enableSound: 'Enable Sound', guide: 'Study Guide & Repertoire Tips',
    practice: 'Practice Mode - Stockfish Engine Level 18 (Board Editor, Opening Explorer, Play Engine)',
    chat: 'Chat with AI - Grandmaster Chess Assistant', language: 'Language', menu: 'More options',
  },
  hi: {
    subtitle: '10 सफेद और 10 काले ओपनिंग, प्रत्येक में 12 वैरिएशन और हर चाल की मास्टर व्याख्या',
    premium: 'प्रीमियम लें', flipWhite: 'सफेद दृष्टिकोण पर पलटें', flipBlack: 'काले दृष्टिकोण पर पलटें',
    whitePov: 'सफेद दृष्टिकोण', blackPov: 'काला दृष्टिकोण', switchLight: 'लाइट मोड करें', switchDark: 'डार्क मोड करें',
    boardTheme: 'बोर्ड थीम', mute: 'ध्वनि बंद करें', enableSound: 'ध्वनि चालू करें', guide: 'अध्ययन मार्गदर्शिका और टिप्स',
    practice: 'अभ्यास मोड - स्टॉकफिश स्तर 18', chat: 'AI से चैट - ग्रैंडमास्टर शतरंज सहायक', language: 'भाषा', menu: 'और विकल्प',
  },
  es: {
    subtitle: '10 aperturas blancas y 10 negras, con 12 variantes y explicaciones jugada a jugada',
    premium: 'Pasar a Premium', flipWhite: 'Ver desde las blancas', flipBlack: 'Ver desde las negras',
    whitePov: 'Vista blancas', blackPov: 'Vista negras', switchLight: 'Cambiar al modo claro', switchDark: 'Cambiar al modo oscuro',
    boardTheme: 'Tema del tablero', mute: 'Silenciar sonido', enableSound: 'Activar sonido', guide: 'Guía de estudio y consejos',
    practice: 'Modo práctica - Stockfish nivel 18', chat: 'Chatear con IA - Asistente de ajedrez', language: 'Idioma', menu: 'Más opciones',
  },
  fr: {
    subtitle: '10 ouvertures blanches et 10 noires, avec 12 variantes et des explications coup par coup',
    premium: 'Passer à Premium', flipWhite: 'Voir du côté des Blancs', flipBlack: 'Voir du côté des Noirs',
    whitePov: 'Vue Blancs', blackPov: 'Vue Noirs', switchLight: 'Passer au mode clair', switchDark: 'Passer au mode sombre',
    boardTheme: 'Thème du plateau', mute: 'Couper le son', enableSound: 'Activer le son', guide: 'Guide d’étude et conseils',
    practice: 'Mode entraînement - Stockfish niveau 18', chat: 'Discuter avec l’IA - Assistant d’échecs', language: 'Langue', menu: 'Plus d’options',
  },
  de: {
    subtitle: '10 Eröffnungen für Weiß und 10 für Schwarz, je 12 Varianten mit Erklärungen zu jedem Zug',
    premium: 'Premium nutzen', flipWhite: 'Ansicht für Weiß', flipBlack: 'Ansicht für Schwarz',
    whitePov: 'Weiß-Perspektive', blackPov: 'Schwarz-Perspektive', switchLight: 'Zum hellen Modus wechseln', switchDark: 'Zum dunklen Modus wechseln',
    boardTheme: 'Brettdesign', mute: 'Ton ausschalten', enableSound: 'Ton einschalten', guide: 'Lernleitfaden und Tipps',
    practice: 'Trainingsmodus - Stockfish Stufe 18', chat: 'KI-Chat - Schachassistent', language: 'Sprache', menu: 'Weitere Optionen',
  },
};

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
  onOpenPractice: () => void;
  onOpenChatAi?: () => void;
  isPremium?: boolean;
  userTier?: PaidPlanTier;
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
  onOpenPractice,
  onOpenChatAi,
  isPremium = false,
  userTier = 'none',
}) => {
  const copy = navbarCopy[language];
  const languageMenuRef = React.useRef<HTMLDetailsElement>(null);

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
                Chess Openings Master
              </h1>
              <span className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                20 Openings • 240 Variations
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              {copy.subtitle}
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
            <span className="hidden tracking-tight sm:inline">{copy.premium}</span>
            <span className="hidden px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500 text-zinc-950 uppercase tracking-wider lg:inline-block">
              ₹999 / ₹699
            </span>
          </button>

          {/* Flip Board Button */}
          <button
            id="navbar-flip-board-btn"
            onClick={onToggleFlip}
            title={flipped ? copy.flipWhite : copy.flipBlack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-850 bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 text-xs font-medium transition-colors"
          >
            <Repeat className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{flipped ? copy.blackPov : copy.whitePov}</span>
          </button>

          <button
            id="navbar-color-mode-toggle"
            type="button"
            onClick={onToggleColorMode}
            title={colorMode === 'dark' ? copy.switchLight : copy.switchDark}
            aria-label={colorMode === 'dark' ? copy.switchLight : copy.switchDark}
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
              aria-label={copy.boardTheme}
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
            title={soundEnabled ? copy.mute : copy.enableSound}
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
            title={copy.guide}
            className="p-1.5 rounded-lg bg-[#181a20] border border-zinc-800 hover:bg-[#20242e] text-zinc-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-amber-400" />
          </button>

          {/* Practice Mode Icon Button (at last with Stockfish Engine Level 18) */}
          <button
            id="navbar-practice-mode-btn"
            onClick={onOpenPractice}
            title={copy.practice}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 via-blue-500/25 to-indigo-500/20 hover:from-cyan-500/35 hover:to-blue-500/35 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all shadow-sm shadow-cyan-950/20 group cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden tracking-tight lg:inline">Practice Mode</span>
            <span className="hidden px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-400 text-zinc-950 uppercase tracking-wider xl:inline-flex">
              Level 18
            </span>
          </button>

          {/* Chat with AI Floating Window Trigger */}
          {onOpenChatAi && (
            <button
              id="navbar-chat-with-ai-btn"
              onClick={onOpenChatAi}
              title={copy.chat}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/25 hover:from-amber-500/40 hover:to-yellow-500/40 border border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-sm shadow-amber-950/20 group cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden tracking-tight lg:inline">chat with ai</span>
            </button>
          )}

          <details ref={languageMenuRef} className="relative">
            <summary
              aria-label={copy.menu}
              title={copy.menu}
              className="flex list-none cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-[#181a20] p-1.5 text-zinc-300 transition-colors hover:bg-[#20242e] [&::-webkit-details-marker]:hidden"
            >
              <MoreVertical className="h-4 w-4" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-lg border border-zinc-700 bg-[#181a20] p-1.5 shadow-xl">
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase text-zinc-500">{copy.language}</p>
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    onChangeLanguage(option.code);
                    if (languageMenuRef.current) languageMenuRef.current.open = false;
                  }}
                  aria-current={language === option.code ? 'true' : undefined}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                >
                  <span>{option.label}</span>
                  {language === option.code && <Check className="h-4 w-4 text-amber-400" />}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
};
