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
    boardImage: '/boards/maple.jpg',
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
  coral: {
    id: 'coral',
    name: 'Coral & Sand',
    lightSquare: 'bg-[#f0dfd0]',
    darkSquare: 'bg-[#c26d60]',
    highlightSquare: 'bg-[#f87171]/50',
    selectSquare: 'bg-[#fca5a5]/70 ring-2 ring-rose-400 ring-inset',
    frameClass: 'border-[#4a1d1d]',
    coordinateLight: 'text-[#7a2e2e]',
    coordinateDark: 'text-[#fce7e7]',
  },
  ocean: {
    id: 'ocean',
    name: 'Deep Ocean',
    lightSquare: 'bg-[#d8e8ee]',
    darkSquare: 'bg-[#3b6978]',
    highlightSquare: 'bg-[#38bdf8]/50',
    selectSquare: 'bg-[#7dd3fc]/70 ring-2 ring-cyan-300 ring-inset',
    frameClass: 'border-[#1b3038]',
    coordinateLight: 'text-[#1c404d]',
    coordinateDark: 'text-[#e0f2fe]',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Charcoal & Ivory',
    lightSquare: 'bg-[#e4e4e7]',
    darkSquare: 'bg-[#52525b]',
    highlightSquare: 'bg-[#a1a1aa]/50',
    selectSquare: 'bg-[#f4f4f5]/70 ring-2 ring-zinc-400 ring-inset',
    frameClass: 'border-[#27272a]',
    coordinateLight: 'text-zinc-700',
    coordinateDark: 'text-zinc-200',
  },
  forest: {
    id: 'forest',
    name: 'Dark Forest',
    lightSquare: 'bg-[#dce3cf]',
    darkSquare: 'bg-[#405d43]',
    highlightSquare: 'bg-[#84cc16]/50',
    selectSquare: 'bg-[#a3e635]/70 ring-2 ring-lime-400 ring-inset',
    frameClass: 'border-[#1c2e1f]',
    coordinateLight: 'text-[#203a22]',
    coordinateDark: 'text-[#ecfccb]',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Royal Amethyst',
    lightSquare: 'bg-[#ebdff2]',
    darkSquare: 'bg-[#6b4c82]',
    highlightSquare: 'bg-[#c084fc]/50',
    selectSquare: 'bg-[#d8b4fe]/70 ring-2 ring-purple-400 ring-inset',
    frameClass: 'border-[#2f1c3d]',
    coordinateLight: 'text-[#441c59]',
    coordinateDark: 'text-[#f3e8ff]',
  },
};
