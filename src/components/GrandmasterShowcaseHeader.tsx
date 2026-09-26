import React from 'react';
import { Trophy, BookOpen, User, Calendar, Award, Sparkles, ChevronRight, Swords } from 'lucide-react';
import { GrandmasterGame } from '../types/chess';

interface GrandmasterShowcaseHeaderProps {
  viewMode: 'repertoire' | 'grandmaster';
  onSelectViewMode: (mode: 'repertoire' | 'grandmaster') => void;
  games: GrandmasterGame[];
  activeGameId: string | null;
  onSelectGame: (gameId: string) => void;
  onJumpToTurningPoint?: () => void;
}

export const GrandmasterShowcaseHeader: React.FC<GrandmasterShowcaseHeaderProps> = ({
  viewMode,
  onSelectViewMode,
  games,
  activeGameId,
  onSelectGame,
  onJumpToTurningPoint,
}) => {
  const activeGame = games.find((g) => g.id === activeGameId) || games[0];

  return (
    <div id="gm-showcase-header" className="space-y-3 mb-4">
      {/* Primary Mode Toggle */}
      <div className="flex items-center justify-between gap-2 p-1.5 bg-[#171920] border border-zinc-800 rounded-xl shadow-md flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            id="tab-opening-theory"
            onClick={() => onSelectViewMode('repertoire')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              viewMode === 'repertoire'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Opening Theory Repertoire</span>
          </button>

          <button
            id="tab-grandmaster-showcase"
            onClick={() => {
              onSelectViewMode('grandmaster');
              if (!activeGameId && games.length > 0) {
                onSelectGame(games[0].id);
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${
              viewMode === 'grandmaster'
                ? 'bg-gradient-to-r from-amber-600/30 to-yellow-600/20 text-amber-200 border border-amber-500/50 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Grandmaster Games</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-500/40">
              {games.length} Games
            </span>
          </button>
        </div>

        {viewMode === 'grandmaster' && activeGame && onJumpToTurningPoint && (
          <button
            id="btn-jump-turning-point"
            onClick={onJumpToTurningPoint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Jump to Key Turning Point</span>
          </button>
        )}
      </div>

      {/* When Grandmaster Mode is Active: Game Selection Carousel */}
      {viewMode === 'grandmaster' && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {games.map((g, idx) => {
              const isSelected = g.id === activeGame?.id;
              const isWhiteWin = g.result === '1-0';
              const isBlackWin = g.result === '0-1';

              return (
                <button
                  key={g.id}
                  id={`btn-select-gm-game-${idx + 1}`}
                  onClick={() => onSelectGame(g.id)}
                  className={`flex-1 min-w-[220px] max-w-[300px] p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#252018] to-[#1a1713] border-amber-500/60 shadow-lg ring-1 ring-amber-500/40'
                      : 'bg-[#181a20]/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Swords className="w-3 h-3" />
                      Game {idx + 1} of {games.length}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isWhiteWin
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isBlackWin
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-zinc-700/40 text-zinc-300 border border-zinc-600/40'
                      }`}
                    >
                      {g.result}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-zinc-100 truncate flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-zinc-200 inline-block shrink-0" />
                      <span className="truncate">{g.white}</span>
                      <span className="text-[10px] font-mono text-zinc-400 font-normal">({g.whiteElo})</span>
                    </div>
                    <div className="text-xs font-bold text-zinc-100 truncate flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-500 inline-block shrink-0" />
                      <span className="truncate">{g.black}</span>
                      <span className="text-[10px] font-mono text-zinc-400 font-normal">({g.blackElo})</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="truncate max-w-[130px]">{g.event}</span>
                    <span className="font-mono">{g.year}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Game Dossier Banner */}
          {activeGame && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#1c1a16] via-[#1a1815] to-[#15171a] border border-amber-500/30 shadow-md">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeGame.eco}
                    </span>
                    <span className="text-sm font-bold text-zinc-100">
                      {activeGame.white} vs {activeGame.black}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {activeGame.result}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      {activeGame.event}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {activeGame.year}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span>Total Moves: {activeGame.moves.length}</span>
                  </div>
                </div>

                <div className="max-w-md text-xs text-amber-100/80 leading-relaxed font-sans border-l border-amber-500/20 pl-3">
                  {activeGame.resultDescription}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
