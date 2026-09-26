import React, { useState } from 'react';

interface ChessPieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

// Map piece codes to readable names for accessibility
const pieceNames: Record<string, string> = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
};

/**
 * ChessPiece renders Chess.com's signature "Neo" game room piece set.
 * Uses locally bundled high-res assets with CDN fallback.
 */
export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  className = 'w-full h-full',
}) => {
  const [hasError, setHasError] = useState(false);

  const pieceKey = `${color}${type.toLowerCase()}`;
  const pieceName = pieceNames[type.toLowerCase()] || 'Piece';
  const colorName = color === 'w' ? 'White' : 'Black';

  const primarySrc = `/pieces/neo/${pieceKey}.png`;
  const fallbackSrc = `https://images.chesscomfiles.com/chess-themes/pieces/neo/300/${pieceKey}.png`;

  return (
    <img
      key={pieceKey}
      src={hasError ? fallbackSrc : primarySrc}
      alt={`${colorName} ${pieceName}`}
      draggable={false}
      loading="eager"
      onError={() => setHasError(true)}
      className={`w-full h-full object-contain pointer-events-none select-none transition-transform duration-100 ${className}`}
    />
  );
};

