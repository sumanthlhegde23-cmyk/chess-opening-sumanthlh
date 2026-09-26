export interface ChessTournament {
  id: string;
  name: string;
  organizer: 'FIDE' | 'Chess.com' | 'Grand Chess Tour' | 'Lichess' | 'Independent';
  tier: 'World Championship' | 'Super Tournament' | 'Major Online' | 'Circuit Open';
  status: 'live' | 'upcoming' | 'recent';
  dates: string;
  startDate: string; // ISO or YYYY-MM-DD for sorting
  location: string;
  format: string; // e.g. 'Classical (90m+30s)', 'Rapid & Blitz', 'Online 3+1'
  prizeFund: string;
  topPlayers: string[];
  description: string;
  broadcastUrl?: string;
  officialUrl?: string;
  liveRound?: string;
  defendingChampion?: string;
  category: 'fide' | 'chesscom' | 'gct' | 'other';
}

export interface ChessCurrentAffairNews {
  id: string;
  title: string;
  tag: 'FIDE Updates' | 'World Championship' | 'Ratings & Records' | 'Online Chess' | 'Tech & Fair Play';
  date: string;
  summary: string;
  source: string;
  impact: string;
  relatedPlayers?: string[];
  link?: string;
}

export interface ChessLeaderboardEntry {
  rank: number;
  name: string;
  country: string;
  fideRating: number;
  change: string;
  title: string;
}

export const TOP_FIDE_PLAYERS: ChessLeaderboardEntry[] = [
  { rank: 1, name: 'Magnus Carlsen', country: 'NOR', fideRating: 2832, change: '+1.5', title: 'GM' },
  { rank: 2, name: 'Hikaru Nakamura', country: 'USA', fideRating: 2802, change: '+4.2', title: 'GM' },
  { rank: 3, name: 'Arjun Erigaisi', country: 'IND', fideRating: 2799, change: '+6.1', title: 'GM' },
  { rank: 4, name: 'Fabiano Caruana', country: 'USA', fideRating: 2798, change: '-2.0', title: 'GM' },
  { rank: 5, name: 'D Gukesh', country: 'IND', fideRating: 2788, change: '+5.4', title: 'GM' },
  { rank: 6, name: 'Nodirbek Abdusattorov', country: 'UZB', fideRating: 2783, change: '+8.0', title: 'GM' },
  { rank: 7, name: 'Alireza Firouzja', country: 'FRA', fideRating: 2772, change: '+3.8', title: 'GM' },
  { rank: 8, name: 'Wei Yi', country: 'CHN', fideRating: 2762, change: '+1.2', title: 'GM' },
  { rank: 9, name: 'Ian Nepomniachtchi', country: 'FIDE', fideRating: 2758, change: '-4.0', title: 'GM' },
  { rank: 10, name: 'Viswanathan Anand', country: 'IND', fideRating: 2751, change: '0.0', title: 'GM' },
];

export const CURRENT_AFFAIRS_NEWS: ChessCurrentAffairNews[] = [
  {
    id: 'news-1',
    title: 'FIDE World Championship Match Cycle & Global Circuit Intensifies',
    tag: 'World Championship',
    date: 'Current Global Update',
    summary: 'The battle for the next World Championship cycle accelerates with fierce contention across the FIDE Circuit. Young grandmasters led by D Gukesh, Arjun Erigaisi, and Nodirbek Abdusattorov challenge veteran giants Fabiano Caruana and Hikaru Nakamura for premier qualifying seats.',
    source: 'FIDE Official Communications',
    impact: 'Shapes the qualifications for the forthcoming Candidates tournament and undisputed world crown.',
    relatedPlayers: ['D Gukesh', 'Arjun Erigaisi', 'Fabiano Caruana', 'Hikaru Nakamura'],
    link: 'https://fide.com',
  },
  {
    id: 'news-2',
    title: 'Chess.com Champions Chess Tour 2026 Multi-Division Season Underway',
    tag: 'Online Chess',
    date: 'Live Season Cycle',
    summary: 'The world’s flagship online chess tour features Division I, II, and III knockouts with $1,500,000+ total seasonal prize purse. Magnus Carlsen and Maxime Vachier-Lagrave headline rapid 15+3 brackets broadcast live with real-time heartbeat monitors and master analysis.',
    source: 'Chess.com Esports Bureau',
    impact: 'Determines the world’s undisputed online rapid champion with direct invitations to live in-person grand finals.',
    relatedPlayers: ['Magnus Carlsen', 'Maxime Vachier-Lagrave', 'Denis Lazavik'],
    link: 'https://chess.com/events',
  },
  {
    id: 'news-3',
    title: 'Freestyle Chess Grand Slam Tour Expands to 5 Continental Stops',
    tag: 'Ratings & Records',
    date: 'Global Tour Update',
    summary: 'Magnus Carlsen and entrepreneur Jan Henric Buettner expand Freestyle Chess (Fischer Random / Chess960) into a prestigious $1M+ global tour visiting Weissenhaus, Paris, New York, New Delhi, and Cape Town, revolutionizing opening theory with non-standard starting arrays.',
    source: 'Freestyle Chess GOAT Challenge',
    impact: 'Puts raw middlegame intuition and tactical calculation above memory and deep engine opening prep.',
    relatedPlayers: ['Magnus Carlsen', 'Vincent Keymer', 'Ding Liren', 'Levon Aronian'],
  },
  {
    id: 'news-4',
    title: 'FIDE Strengthens Real-Time Anti-Cheating & Screening Protocols',
    tag: 'Tech & Fair Play',
    date: 'FIDE Fair Play Commission',
    summary: 'FIDE mandates 15-minute global broadcast delays on PGN notation for all Category 18+ events, complemented by algorithmic Ken Regan screening models, non-linear radio frequency scanners, and metal detection gates at top arenas.',
    source: 'FIDE Fair Play Commission (FPL)',
    impact: 'Guarantees the highest competitive integrity for high-stakes over-the-board classical tournaments.',
  },
  {
    id: 'news-5',
    title: 'India Solidifies Global Chess Powerhouse Status After Historic Gold Sweep',
    tag: 'FIDE Updates',
    date: 'Global Chess Renaissance',
    summary: 'Following their double-gold performance at the FIDE Chess Olympiad in Budapest, Indian grandmasters Arjun Erigaisi, Gukesh D, Praggnanandhaa, and Divya Deshmukh dominate international opens and super-tournaments, ushering in a generational shift.',
    source: 'AICF / International Chess Media',
    impact: 'Over 4 young Indian stars now consistently hold top-15 global classical ratings.',
    relatedPlayers: ['Arjun Erigaisi', 'D Gukesh', 'R Praggnanandhaa', 'Divya Deshmukh'],
  },
];

export const UPCOMING_AND_LIVE_TOURNAMENTS: ChessTournament[] = [
  // Live & Imminent
  {
    id: 'tourn-1',
    name: 'FIDE Candidates Tournament 2026',
    organizer: 'FIDE',
    tier: 'World Championship',
    status: 'upcoming',
    dates: 'April 2026',
    startDate: '2026-04-03',
    location: 'Toronto / Europe Host Arena',
    format: 'Double Round-Robin Classical (14 Rounds, 120m+30s)',
    prizeFund: '€500,000',
    topPlayers: ['Fabiano Caruana', 'Hikaru Nakamura', 'Arjun Erigaisi', 'Nodirbek Abdusattorov', 'Alireza Firouzja'],
    description: 'The highest-stakes 8-player tournament in the chess world. The sole winner earns the right to challenge for the FIDE World Chess Championship title.',
    defendingChampion: 'D Gukesh (2024 Winner)',
    officialUrl: 'https://candidates.fide.com',
    category: 'fide',
  },
  {
    id: 'tourn-2',
    name: 'Chess.com Titled Tuesday (Weekly Global Blitz)',
    organizer: 'Chess.com',
    tier: 'Major Online',
    status: 'live',
    dates: 'Every Tuesday (Early & Late Editions)',
    startDate: '2026-09-15',
    location: 'Chess.com Global Servers',
    format: '11 Rounds Swiss (3+1 Blitz Time Control)',
    prizeFund: '$5,000 Weekly ($260,000 Annual)',
    topPlayers: ['Hikaru Nakamura', 'Magnus Carlsen', 'Daniel Naroditsky', 'Jose Martinez', 'Jeffery Xiong'],
    description: 'The premier weekly open tournament for titled FIDE players (GMs, IMs, WGM). Over 600 masters battle every Tuesday across two global time zones.',
    liveRound: 'Round 7 in progress / Weekly Tuesday showdown',
    officialUrl: 'https://chess.com/titled-tuesday',
    category: 'chesscom',
  },
  {
    id: 'tourn-3',
    name: 'Champions Chess Tour: Play-In & Division I Knockout',
    organizer: 'Chess.com',
    tier: 'Super Tournament',
    status: 'upcoming',
    dates: 'Next Week (Oct 2026)',
    startDate: '2026-10-08',
    location: 'Online / Studio Broadcast',
    format: 'Double Elimination Rapid (15m+3s) with Armageddon',
    prizeFund: '$300,000 Event Purse',
    topPlayers: ['Magnus Carlsen', 'Denis Lazavik', 'Alireza Firouzja', 'Vincent Keymer', 'Maxime Vachier-Lagrave'],
    description: 'Premier online esports chess circuit featuring 8-player double-elimination knockout brackets, live webcam streams, and rapid tiebreak armageddons.',
    officialUrl: 'https://chess.com/events/champions-chess-tour',
    category: 'chesscom',
  },
  {
    id: 'tourn-4',
    name: '46th FIDE Chess Olympiad 2026',
    organizer: 'FIDE',
    tier: 'World Championship',
    status: 'upcoming',
    dates: 'September 2026',
    startDate: '2026-09-22',
    location: 'Tashkent, Uzbekistan',
    format: '11-Round Swiss Team Event (4 Boards per Nation)',
    prizeFund: 'Olympic Gold, Silver & Bronze Medals + Hamilton-Russell Cup',
    topPlayers: ['Team USA', 'Team India', 'Team Uzbekistan', 'Team Norway', 'Team China'],
    description: 'The Olympics of Chess. Over 190 federations field their top four grandmasters in national squads competing for global glory in Tashkent.',
    defendingChampion: 'India (Open & Women Dual Gold)',
    officialUrl: 'https://fide.com/olympiad',
    category: 'fide',
  },
  {
    id: 'tourn-5',
    name: 'Grand Chess Tour: Sinquefield Cup 2026',
    organizer: 'Grand Chess Tour',
    tier: 'Super Tournament',
    status: 'upcoming',
    dates: 'August 2026',
    startDate: '2026-08-14',
    location: 'Saint Louis Chess Club, USA',
    format: '10-Player Single Round-Robin Classical (90m/40 + 30m + 30s)',
    prizeFund: '$350,000',
    topPlayers: ['Fabiano Caruana', 'Wesley So', 'Leinier Dominguez', 'Ian Nepomniachtchi', 'Maxime Vachier-Lagrave'],
    description: 'The final classical leg of the prestigious Grand Chess Tour, crowning both the tournament winner and the overall 2026 Grand Chess Tour champion.',
    defendingChampion: 'Alireza Firouzja',
    officialUrl: 'https://grandchesstour.org',
    category: 'gct',
  },
  {
    id: 'tourn-6',
    name: 'FIDE World Rapid & Blitz Championship 2026',
    organizer: 'FIDE',
    tier: 'World Championship',
    status: 'upcoming',
    dates: 'December 26–30, 2026',
    startDate: '2026-12-26',
    location: 'New York / Gulf Host City',
    format: '13-Round Rapid (15+10) & 21-Round Blitz (3+2)',
    prizeFund: '$1,000,000 Total Prize Pool',
    topPlayers: ['Magnus Carlsen', 'Daniil Dubov', 'Hikaru Nakamura', 'Vladislav Artemiev', 'Arjun Erigaisi'],
    description: 'The most electrifying holiday chess festival in the world. Crowned under grueling multi-day rapid and blitz Swiss marathons with top global superstars.',
    defendingChampion: 'Magnus Carlsen (Rapid & Blitz Champion)',
    officialUrl: 'https://fide.com',
    category: 'fide',
  },
  {
    id: 'tourn-7',
    name: 'Chess.com Speed Chess Championship (SCC)',
    organizer: 'Chess.com',
    tier: 'Major Online',
    status: 'upcoming',
    dates: 'Fall 2026',
    startDate: '2026-10-18',
    location: 'Online & Live Finals Stage',
    format: 'Brackets: 90 mins of 5+1, 60 mins of 3+1, 30 mins of 1+1 Bullet',
    prizeFund: '$250,000',
    topPlayers: ['Hikaru Nakamura', 'Magnus Carlsen', 'Hans Niemann', 'Alireza Firouzja', 'D Gukesh'],
    description: 'The legendary speed chess faceoff where players battle nonstop across 5-minute, 3-minute, and 1-minute bullet segments with live score tickers.',
    defendingChampion: 'Magnus Carlsen',
    officialUrl: 'https://chess.com/events/scc',
    category: 'chesscom',
  },
  {
    id: 'tourn-8',
    name: 'Tata Steel Chess Tournament 88th Edition',
    organizer: 'Independent',
    tier: 'Super Tournament',
    status: 'upcoming',
    dates: 'January 2027',
    startDate: '2027-01-16',
    location: 'Wijk aan Zee, Netherlands',
    format: '14-Player Classical Round-Robin (Masters & Challengers)',
    prizeFund: '€250,000',
    topPlayers: ['Anish Giri', 'Wei Yi', 'Nodirbek Abdusattorov', 'Praggnanandhaa', 'Jorden van Foreest'],
    description: 'Known as the "Wimbledon of Chess," featuring grueling winter seaside matches where the world’s elite compete in traditional Dutch classical conditions.',
    defendingChampion: 'Wei Yi',
    officialUrl: 'https://tatasteelchess.com',
    category: 'other',
  },
  {
    id: 'tourn-9',
    name: 'Lichess Monthly Titled Arena (LTA)',
    organizer: 'Lichess',
    tier: 'Major Online',
    status: 'live',
    dates: 'First Saturday of every month',
    startDate: '2026-10-03',
    location: 'Lichess.org Global Arena',
    format: '1+0 Bullet Arena with Berserk Multipliers (120 mins)',
    prizeFund: '$1,000+ per edition',
    topPlayers: ['Andrew Tang (penguingim1)', 'Daniel Naroditsky', 'Magnus Carlsen', 'Alireza Firouzja'],
    description: 'High-octane bullet arena where Grandmasters play non-stop 1-minute games with optional berserk points under zero delay.',
    liveRound: 'Arena leaderboard actively counting down',
    officialUrl: 'https://lichess.org/tournament',
    category: 'other',
  },
];
