export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlightSquare: string;
  selectSquare: string;
  boardImage?: string;
  frameClass?: string;
  coordinateLight?: string;
  coordinateDark?: string;
}

export const boardThemes: Record<string, BoardTheme> = {
  maple: {
    id: 'maple',
    name: 'Maple Wood',
    lightSquare: 'bg-[#ebd3a8]',
    darkSquare: 'bg-[#b58863]',
    highlightSquare: 'bg-[#f59e0b]/50',
    selectSquare: 'bg-[#fbbf24]/65 ring-2 ring-amber-300 ring-inset',
    boardImage: '/boards/maple2.jpg',
    frameClass: 'border-[#422a14] shadow-[0_12px_35px_rgba(20,10,2,0.6)] ring-1 ring-[#613f1e]/40',
    coordinateLight: 'text-[#613c19]',
    coordinateDark: 'text-[#faebd7]',
  },
  walnut: {
    id: 'walnut',
    name: 'Classic Walnut',
    lightSquare: 'bg-[#edd8b7]',
    darkSquare: 'bg-[#b88b4a]',
    highlightSquare: 'bg-[#d8a156]/65',
    selectSquare: 'bg-[#e4c278]/70 ring-2 ring-amber-300 ring-inset',
    frameClass: 'border-[#38230f]',
    coordinateLight: 'text-[#503010]',
    coordinateDark: 'text-[#f5e6d3]',
  },
  emerald: {
    id: 'emerald',
    name: 'Tournament Emerald',
    lightSquare: 'bg-[#eeeed2]',
    darkSquare: 'bg-[#769656]',
    highlightSquare: 'bg-[#bbcb2b]/60',
    selectSquare: 'bg-[#f7ec59]/70 ring-2 ring-yellow-300 ring-inset',
    frameClass: 'border-[#272b35]',
    coordinateLight: 'text-zinc-600',
    coordinateDark: 'text-zinc-200',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Slate',
    lightSquare: 'bg-[#333d4f]',
    darkSquare: 'bg-[#1e2532]',
    highlightSquare: 'bg-[#38bdf8]/35',
    selectSquare: 'bg-[#38bdf8]/50 ring-2 ring-sky-300 ring-inset',
    frameClass: 'border-[#1a202c]',
    coordinateLight: 'text-zinc-400',
    coordinateDark: 'text-zinc-500',
  },
  tournament: {
    id: 'tournament',
    name: 'Tournament Blue',
    lightSquare: 'bg-[#e8ebef]',
    darkSquare: 'bg-[#5b84b1]',
    highlightSquare: 'bg-[#7eb5d6]/60',
    selectSquare: 'bg-[#fed766]/70 ring-2 ring-amber-300 ring-inset',
    frameClass: 'border-[#253342]',
    coordinateLight: 'text-slate-600',
    coordinateDark: 'text-slate-200',
  },
};
