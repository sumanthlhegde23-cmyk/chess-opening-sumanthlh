import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe,
  Radio,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Award,
  ExternalLink,
  X,
  Search,
  Users,
  Flame,
  Newspaper,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  UPCOMING_AND_LIVE_TOURNAMENTS,
  CURRENT_AFFAIRS_NEWS,
  TOP_FIDE_PLAYERS,
  ChessTournament,
} from '../data/chessCurrentAffairs';

interface CurrentAffairsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrentAffairsModal: React.FC<CurrentAffairsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'news' | 'rankings'>('tournaments');
  const [tournamentFilter, setTournamentFilter] = useState<'all' | 'fide' | 'chesscom' | 'gct' | 'other'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed('Just now');
    }, 600);
  };

  const filteredTournaments = useMemo(() => {
    return UPCOMING_AND_LIVE_TOURNAMENTS.filter((t) => {
      if (tournamentFilter !== 'all' && t.category !== tournamentFilter) {
        return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesLocation = t.location.toLowerCase().includes(q);
        const matchesPlayer = t.topPlayers.some((p) => p.toLowerCase().includes(q));
        const matchesOrg = t.organizer.toLowerCase().includes(q);
        return matchesName || matchesLocation || matchesPlayer || matchesOrg;
      }
      return true;
    });
  }, [tournamentFilter, statusFilter, searchQuery]);

  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) return CURRENT_AFFAIRS_NEWS;
    const q = searchQuery.toLowerCase();
    return CURRENT_AFFAIRS_NEWS.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.tag.toLowerCase().includes(q) ||
        (n.relatedPlayers && n.relatedPlayers.some((p) => p.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      id="current-affairs-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="current-affairs-modal-container"
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#14161c] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-gradient-to-r from-[#1b1c24] via-[#161720] to-[#121319]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/30 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  Global Chess Current Affairs & Tournaments
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  LIVE FEED
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Real-time updates of FIDE World Championships, Chess.com events, elite grandmasters & global circuits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-current-affairs"
              onClick={handleRefresh}
              title="Refresh live updates"
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline text-[11px] text-zinc-400 font-mono">{lastRefreshed}</span>
            </button>
            <button
              id="btn-close-current-affairs"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Controls */}
        <div className="px-5 py-2.5 border-b border-zinc-800/80 bg-[#13151b] flex items-center justify-between gap-3 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#1a1c24] border border-zinc-800 rounded-xl">
            <button
              id="tab-tournaments"
              onClick={() => setActiveTab('tournaments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tournaments'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Tournaments & Events</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
                {UPCOMING_AND_LIVE_TOURNAMENTS.length}
              </span>
            </button>

            <button
              id="tab-news"
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'news'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Affairs & News</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
                {CURRENT_AFFAIRS_NEWS.length}
              </span>
            </button>

            <button
              id="tab-rankings"
              onClick={() => setActiveTab('rankings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'rankings'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>FIDE Top 10 Live Elo</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              id="search-affairs-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournaments, GMs, FIDE..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1a1c24] border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* Tab 1: Tournaments & Events */}
        {activeTab === 'tournaments' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-3 flex-wrap pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
                  Organizer:
                </span>
                {[
                  { key: 'all', label: 'All Circuits' },
                  { key: 'fide', label: 'FIDE Official' },
                  { key: 'chesscom', label: 'Chess.com' },
                  { key: 'gct', label: 'Grand Chess Tour' },
                  { key: 'other', label: 'Super Tourneys & Lichess' },
                ].map((item) => (
                  <button
                    key={item.key}
                    id={`filter-tourn-org-${item.key}`}
                    onClick={() => setTournamentFilter(item.key as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      tournamentFilter === item.key
                        ? 'bg-amber-500 text-black font-semibold shadow-xs'
                        : 'bg-[#1a1c24] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#1a1c24] p-0.5 rounded-lg border border-zinc-800">
                {[
                  { key: 'all', label: 'All Status' },
                  { key: 'live', label: '● Live Now' },
                  { key: 'upcoming', label: 'Upcoming' },
                ].map((st) => (
                  <button
                    key={st.key}
                    id={`filter-tourn-status-${st.key}`}
                    onClick={() => setStatusFilter(st.key as any)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      statusFilter === st.key
                        ? 'bg-zinc-800 text-amber-300 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tournaments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTournaments.map((t) => {
                const isLive = t.status === 'live';
                const isFide = t.organizer === 'FIDE';
                const isChessCom = t.organizer === 'Chess.com';
                const isGct = t.organizer === 'Grand Chess Tour';

                return (
                  <div
                    key={t.id}
                    id={`tournament-card-${t.id}`}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                      isLive
                        ? 'bg-gradient-to-br from-[#1d222a] via-[#171a22] to-[#14161c] border-emerald-500/50 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/30'
                        : 'bg-[#181a22] border-zinc-800/90 hover:border-zinc-700 hover:bg-[#1c1e28]'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isFide
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : isChessCom
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isGct
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {t.organizer}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800/80">
                            {t.tier}
                          </span>
                        </div>

                        {isLive ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                            <Radio className="w-3 h-3 text-emerald-400" />
                            LIVE IN PLAY
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            {t.dates}
                          </span>
                        )}
                      </div>

                      {/* Tournament Name */}
                      <h3 className="text-sm sm:text-base font-bold text-zinc-100 mb-1 flex items-center gap-1.5">
                        {t.name}
                      </h3>

                      {/* Live Round or Venue */}
                      {t.liveRound && (
                        <div className="mb-2 p-1.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{t.liveRound}</span>
                        </div>
                      )}

                      <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                        {t.description}
                      </p>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 p-2.5 rounded-lg bg-[#14151b] border border-zinc-800/80">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{t.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{t.format}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300 col-span-2">
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-semibold text-amber-300">Prize Fund:</span>
                          <span className="truncate text-zinc-200">{t.prizeFund}</span>
                        </div>
                      </div>

                      {/* Top Players */}
                      <div className="space-y-1 mb-3">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Top Contenders & Seeds
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {t.topPlayers.map((player, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#1e2029] text-zinc-200 border border-zinc-700/60"
                            >
                              {player}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer with Defending Champion & Links */}
                    <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs gap-2">
                      {t.defendingChampion ? (
                        <div className="text-[11px] text-zinc-400 truncate">
                          <span className="text-zinc-500">Defending:</span>{' '}
                          <span className="text-zinc-300 font-medium">{t.defendingChampion}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-500">Global Open Field</div>
                      )}

                      {t.officialUrl && (
                        <a
                          href={t.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
                        >
                          <span>Official Event Hub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTournaments.length === 0 && (
              <div className="p-10 text-center text-zinc-400 space-y-2">
                <Trophy className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm">No tournaments found matching your query.</p>
                <button
                  onClick={() => {
                    setTournamentFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-amber-400 underline hover:text-amber-300"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Current Affairs & Global News */}
        {activeTab === 'news' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNews.map((news) => (
                <div
                  key={news.id}
                  id={`news-card-${news.id}`}
                  className="p-4 rounded-xl bg-[#181a22] border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                        {news.tag}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">{news.date}</span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-100 leading-snug">{news.title}</h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">{news.summary}</p>

                    {/* Impact Analysis Box */}
                    <div className="p-2.5 rounded-lg bg-[#13151b] border border-zinc-800/80 space-y-1 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        Chess World Impact
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed">{news.impact}</p>
                    </div>

                    {news.relatedPlayers && news.relatedPlayers.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-zinc-500">Related GMs:</span>
                        {news.relatedPlayers.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Source: {news.source}</span>
                    {news.link && (
                      <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <span>Read More</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: FIDE World Rankings Top 10 */}
        {activeTab === 'rankings' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#1c1f28] to-[#14161f] border border-zinc-800 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Official FIDE Standard Rating Leaderboard
                </h3>
                <p className="text-xs text-zinc-400">
                  Top classical rating list of the world's leading Grandmasters
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified FIDE Calculations</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181a24] text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4"># Rank</th>
                    <th className="py-3 px-4">Grandmaster</th>
                    <th className="py-3 px-4">Federation</th>
                    <th className="py-3 px-4">FIDE Classical Rating</th>
                    <th className="py-3 px-4">Recent Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-[#14161d]">
                  {TOP_FIDE_PLAYERS.map((p) => {
                    const isPositive = p.change.startsWith('+');
                    const isNeutral = p.change === '0.0';

                    return (
                      <tr key={p.rank} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          #{p.rank}
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-100 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {p.title}
                          </span>
                          <span>{p.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300 font-semibold">
                          {p.country}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-100 text-sm">
                          {p.fideRating}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              isNeutral
                                ? 'text-zinc-500 bg-zinc-800/60'
                                : isPositive
                                ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30'
                                : 'text-rose-300 bg-rose-950/40 border border-rose-500/30'
                            }`}
                          >
                            {p.change}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer Bar */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-[#13151b] flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-time coverage: FIDE, Chess.com, Grand Chess Tour & Global Opens</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
