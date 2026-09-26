import React, { useState, useMemo } from 'react';
import { Opening } from '../types/chess';
import { Search, Filter, Shield, Swords, Sparkles, BookOpen, Globe, Radio, Lock, Crown } from 'lucide-react';
import { CurrentAffairsModal } from './CurrentAffairsModal';
import { PaidPlanTier, isOpeningLocked } from '../utils/pricingLocks';

interface OpeningExplorerProps {
  openings: Opening[];
  selectedOpeningId: string;
  onSelectOpening: (openingId: string) => void;
  sideFilter: 'all' | 'white' | 'black';
  onSideFilterChange: (side: 'all' | 'white' | 'black') => void;
  userPlan: PaidPlanTier;
  isOwner?: boolean;
  onLockedOpeningClick: (openingId: string) => void;
}

export const OpeningExplorer: React.FC<OpeningExplorerProps> = ({
  openings,
  selectedOpeningId,
  onSelectOpening,
  sideFilter,
  onSideFilterChange,
  userPlan,
  isOwner = false,
  onLockedOpeningClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [isAffairsModalOpen, setIsAffairsModalOpen] = useState(false);

  const filteredOpenings = useMemo(() => {
    return openings.filter((op) => {
      // Filter by side
      if (sideFilter !== 'all' && op.side !== sideFilter) {
        return false;
      }

      // Filter by style
      if (styleFilter !== 'all' && op.playStyle.toLowerCase() !== styleFilter.toLowerCase()) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = op.name.toLowerCase().includes(q);
        const matchesEco = op.ecoCode.toLowerCase().includes(q);
        const matchesCategory = op.category.toLowerCase().includes(q);
        const matchesVariation = op.variations.some(v => v.name.toLowerCase().includes(q) || v.eco.toLowerCase().includes(q));
        return matchesName || matchesEco || matchesCategory || matchesVariation;
      }

      return true;
    });
  }, [openings, sideFilter, styleFilter, searchQuery]);

  const whiteCount = openings.filter(o => o.side === 'white').length;
  const blackCount = openings.filter(o => o.side === 'black').length;

  return (
    <div id="opening-explorer" className="space-y-3">
      {/* Filters & Search Header */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Side Tabs */}
        <div className="flex bg-[#181a20] p-1 rounded-xl border border-zinc-800">
          <button
            id="tab-all-openings"
            onClick={() => onSideFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sideFilter === 'all'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Openings ({openings.length})
          </button>
          <button
            id="tab-white-openings"
            onClick={() => onSideFilterChange('white')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              sideFilter === 'white'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-400 inline-block" />
            White ({whiteCount})
          </button>
          <button
            id="tab-black-openings"
            onClick={() => onSideFilterChange('black')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              sideFilter === 'black'
                ? 'bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-600 inline-block" />
            Black ({blackCount})
          </button>
        </div>

        {/* Search bar & Style dropdown */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              id="search-openings-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search openings, ECO (e.g. B90, E60)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#181a20] border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <select
            id="filter-style-select"
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
            className="text-xs bg-[#181a20] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-500/60 shrink-0"
          >
            <option value="all">All Styles</option>
            <option value="aggressive">Aggressive</option>
            <option value="tactical">Tactical</option>
            <option value="positional">Positional</option>
            <option value="solid">Solid</option>
            <option value="counterattacking">Counterattacking</option>
          </select>

          {/* Current Affairs & Live Tournaments Icon Button */}
          <button
            id="btn-chess-current-affairs"
            type="button"
            onClick={() => setIsAffairsModalOpen(true)}
            title="Global Chess Current Affairs & Live Tournaments (FIDE, Chess.com, & More)"
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gradient-to-r from-[#1f2430] via-[#1a1e28] to-[#151720] hover:from-[#2a3142] hover:to-[#1e2330] text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-500/70 rounded-lg transition-all shadow-sm group shrink-0 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            aria-label="Global Chess Current Affairs and Live Tournaments"
          >
            <div className="relative flex items-center justify-center">
              <Globe className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="hidden md:inline font-semibold text-xs text-amber-200">
              Live Affairs
            </span>
          </button>
        </div>
      </div>

      {/* Polite Upsell Banner if user has 699/399 plan and not owner */}
      {!isOwner && (userPlan === '699' || userPlan === '399') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-[#241e17] via-[#1a1c24] to-[#151720] border border-amber-500/40 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-amber-200">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              2 White & 2 Black openings are reserved under ₹699/- (with ₹159/yr renewal). Would you kindly consider an add-up payment of <strong>₹399/-</strong> to unlock them?
            </span>
          </div>
          <button
            type="button"
            onClick={() => onLockedOpeningClick('catalan-opening')}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shrink-0 transition-colors cursor-pointer shadow"
          >
            Politely Unlock for ₹399/-
          </button>
        </div>
      )}

      {/* Horizontal Opening Scroller / Card Grid */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {filteredOpenings.map((op) => {
          const isSelected = op.id === selectedOpeningId;
          const isWhite = op.side === 'white';
          const locked = isOpeningLocked(op.id, userPlan, isOwner);

          return (
            <button
              key={op.id}
              id={`opening-card-${op.id}`}
              onClick={() => {
                if (locked) {
                  onLockedOpeningClick(op.id);
                } else {
                  onSelectOpening(op.id);
                }
              }}
              className={`shrink-0 w-64 p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#222734] border-amber-500 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/50'
                  : locked
                  ? 'bg-[#15171d]/95 border-zinc-800/90 hover:border-amber-500/50 hover:bg-[#1d1f2a]'
                  : 'bg-[#181a20] border-zinc-800/90 hover:bg-[#1f232c] hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isWhite
                          ? 'bg-zinc-100 text-zinc-900'
                          : 'bg-zinc-800 text-amber-300 border border-zinc-700'
                      }`}
                    >
                      {isWhite ? 'White Opening' : 'Black Defense'}
                    </span>
                    {locked && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 font-semibold">
                    {op.ecoCode}
                  </span>
                </div>

                <div className="text-sm font-bold text-zinc-100 truncate mb-1">
                  {op.name}
                </div>

                <div className="text-[11px] text-zinc-400 line-clamp-1 mb-2">
                  {op.category}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">
                  <strong className="text-amber-400 font-medium">12</strong> Variations
                </span>
                {locked ? (
                  <span className="text-[10px] font-semibold text-amber-400">
                    {(userPlan === '699' || userPlan === '399') ? 'Unlock for ₹399' : '₹699 / ₹999'}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px]">
                    {op.playStyle}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Global Chess Current Affairs & Live Tournaments Modal */}
      <CurrentAffairsModal
        isOpen={isAffairsModalOpen}
        onClose={() => setIsAffairsModalOpen(false)}
      />
    </div>
  );
};
