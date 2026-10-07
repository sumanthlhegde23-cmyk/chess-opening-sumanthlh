import { useEffect, useState, type CSSProperties } from 'react';
import { Chess } from 'chess.js';
import { ArrowRight, LogOut } from 'lucide-react';

type AnimatedPiece = {
  id: string;
  code: string;
  file: number;
  rank: number;
};

const openingLine = [
  'e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6',
  'Nc3', 'a6', 'Bg5', 'e6', 'f4', 'Be7', 'Qf3', 'Qc7', '0-0-0', 'Nbd7',
];

function buildOpeningFrames() {
  const chess = new Chess();
  const pieceIds = new Map<string, string>();
  let nextPieceId = 0;

  const readPieces = (): AnimatedPiece[] => chess.board().flatMap((row) =>
    row.flatMap((piece) => {
      if (!piece) return [];
      const id = pieceIds.get(piece.square) || `piece-${nextPieceId++}`;
      pieceIds.set(piece.square, id);
      return [{
        id,
        code: `${piece.color}${piece.type}`,
        file: piece.square.charCodeAt(0) - 97,
        rank: Number(piece.square[1]) - 1,
      }];
    })
  );

  const frames = [{ san: '', pieces: readPieces() }];
  for (const san of openingLine) {
    const move = chess.move(san);
    const pieceId = pieceIds.get(move.from);
    pieceIds.delete(move.from);
    pieceIds.delete(move.to);
    if (pieceId) pieceIds.set(move.to, pieceId);
    if (move.flags.includes('k') || move.flags.includes('q')) {
      const kingSide = move.flags.includes('k');
      const homeRank = move.color === 'w' ? '1' : '8';
      const rookFrom = `${kingSide ? 'h' : 'a'}${homeRank}`;
      const rookTo = `${kingSide ? 'f' : 'd'}${homeRank}`;
      const rookId = pieceIds.get(rookFrom);
      pieceIds.delete(rookFrom);
      if (rookId) pieceIds.set(rookTo, rookId);
    }
    frames.push({ san: move.san, pieces: readPieces() });
  }

  return frames;
}

const openingFrames = buildOpeningFrames();

export function OpeningCinematic({ onEnter }: { onEnter: () => void }) {
  const [exitBlocked, setExitBlocked] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const frame = openingFrames[frameIndex];

  useEffect(() => {
    let timer: number;

    if (frameIndex === openingFrames.length - 1) {
      setIsResetting(true);
      timer = window.setTimeout(() => {
        setFrameIndex(0);
        window.requestAnimationFrame(() => setIsResetting(false));
      }, 2300);
    } else {
      timer = window.setTimeout(() => setFrameIndex((current) => current + 1), 1500);
    }

    return () => window.clearTimeout(timer);
  }, [frameIndex]);

  const handleExit = () => {
    window.close();
    setExitBlocked(true);
  };

  return (
    <main className="opening-cinematic" aria-label="Prof.Chess introduction">
      <div className="opening-cinematic__grain" aria-hidden="true" />
      <header className="opening-cinematic__topline">
        <div className="opening-cinematic__brand">
          <span className="opening-cinematic__brand-mark" aria-hidden="true">C</span>
          <span>Prof.Chess</span>
        </div>
        <span className="opening-cinematic__edition">A STUDY IN THE OPENING</span>
      </header>

      <section className="opening-cinematic__stage">
        <div className="opening-cinematic__copy">
          <p className="opening-cinematic__eyebrow"><span /> THE GAME BEGINS HERE</p>
          <h1>Master<br /><em>the first move.</em></h1>
          <p className="opening-cinematic__description">
            Every great game has a beginning. Step into the ideas, plans, and quiet brilliance behind the opening.
          </p>
          <div className="opening-cinematic__actions">
            <button type="button" className="opening-cinematic__enter" onClick={onEnter}>
              Enter the library <ArrowRight size={17} strokeWidth={1.8} />
            </button>
            <button type="button" className="opening-cinematic__exit" onClick={handleExit}>
              <LogOut size={16} strokeWidth={1.7} /> Exit app
            </button>
          </div>
          <p className="opening-cinematic__exit-note" aria-live="polite">
            {exitBlocked ? 'Your browser cannot close this tab automatically. You can close it now.' : ' '}
          </p>
          <div className="opening-cinematic__caption"><span>01</span> THE ROYAL GAME, REIMAGINED</div>
        </div>

        <div className="opening-cinematic__art" aria-label="Slow-motion animation of the Sicilian Najdorf opening">
          <div className="opening-cinematic__halo" />
          <div className="opening-cinematic__board-frame">
            <div className="opening-cinematic__board">
              {Array.from({ length: 64 }, (_, index) => {
                const file = index % 8;
                const rank = 7 - Math.floor(index / 8);
                return <div key={index} className={`opening-cinematic__square ${(file + rank) % 2 === 0 ? 'is-light' : 'is-dark'}`} />;
              })}
              <div className="opening-cinematic__pieces" aria-hidden="true">
                {frame.pieces.map((piece) => (
                  <img
                    key={piece.id}
                    className={`opening-cinematic__piece${isResetting ? ' is-resetting' : ''}`}
                    src={`/pieces/neo/${piece.code}.png`}
                    alt=""
                    draggable={false}
                    style={{ '--file': piece.file, '--rank': piece.rank } as CSSProperties}
                  />
                ))}
              </div>
              <div className="opening-cinematic__coordinates" aria-hidden="true">
                <span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span><span>g</span><span>h</span>
              </div>
            </div>
          </div>
          <div className="opening-cinematic__move opening-cinematic__move--one">
            <span>{String(Math.ceil(frameIndex / 2)).padStart(2, '0')}</span>
            {frame.san || 'Initial position'}
          </div>
          <div className="opening-cinematic__move opening-cinematic__move--two">
            <span>PLY</span> {String(frameIndex).padStart(2, '0')} / {openingFrames.length - 1}
          </div>
          <div className="opening-cinematic__signature">SICILIAN NAJDORF <span>·</span> SLOW STUDY</div>
        </div>
      </section>

      <footer className="opening-cinematic__footer">
        <span>OPENING THEORY, MADE HUMAN</span>
        <span>32 OPENINGS <i /> 384 VARIATIONS <i /> INFINITE POSSIBILITIES</span>
      </footer>
    </main>
  );
}
