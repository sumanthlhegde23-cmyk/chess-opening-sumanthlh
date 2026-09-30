import { useState, type CSSProperties } from 'react';
import { ArrowRight, LogOut } from 'lucide-react';

type Piece = {
  code: string;
  file: number;
  rank: number;
  motion?: string;
};

const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
const pieces: Piece[] = [
  ...backRank.map((code, file) => ({ code: `b${code}`, file, rank: 7 })),
  ...Array.from({ length: 8 }, (_, file) => ({ code: 'bp', file, rank: 6 })),
  ...Array.from({ length: 8 }, (_, file) => ({ code: 'wp', file, rank: 1 })),
  ...backRank.map((code, file) => ({ code: `w${code}`, file, rank: 0 })),
].map((piece) => {
  if (piece.code === 'wp' && piece.file === 4) {
    return { ...piece, motion: 'opening-piece--e4' };
  }
  if (piece.code === 'bp' && piece.file === 4) {
    return { ...piece, motion: 'opening-piece--e5' };
  }
  if (piece.code === 'wn' && piece.file === 6) {
    return { ...piece, motion: 'opening-piece--knight' };
  }
  if (piece.code === 'bn' && piece.file === 1) {
    return { ...piece, motion: 'opening-piece--reply' };
  }
  return piece;
});

export function OpeningCinematic({ onEnter }: { onEnter: () => void }) {
  const [exitBlocked, setExitBlocked] = useState(false);

  const handleExit = () => {
    window.close();
    setExitBlocked(true);
  };

  return (
    <main className="opening-cinematic" aria-label="Chess Openings Master introduction">
      <div className="opening-cinematic__grain" aria-hidden="true" />
      <header className="opening-cinematic__topline">
        <div className="opening-cinematic__brand">
          <span className="opening-cinematic__brand-mark" aria-hidden="true">C</span>
          <span>Chess Openings Master</span>
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

        <div className="opening-cinematic__art" aria-label="An animated chessboard showing the opening moves e4, e5, Nf3, and Nc6">
          <div className="opening-cinematic__halo" />
          <div className="opening-cinematic__board-frame">
            <div className="opening-cinematic__board">
              {Array.from({ length: 64 }, (_, index) => {
                const file = index % 8;
                const rank = 7 - Math.floor(index / 8);
                return <div key={index} className={`opening-cinematic__square ${(file + rank) % 2 === 0 ? 'is-light' : 'is-dark'}`} />;
              })}
              <div className="opening-cinematic__pieces" aria-hidden="true">
                {pieces.map((piece, index) => (
                  <img
                    key={`${piece.code}-${index}`}
                    className={`opening-cinematic__piece ${piece.motion || ''}`}
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
          <div className="opening-cinematic__move opening-cinematic__move--one"><span>01</span> e4</div>
          <div className="opening-cinematic__move opening-cinematic__move--two"><span>02</span> e5</div>
          <div className="opening-cinematic__signature">WHITE TO MOVE <span>·</span> EST. 1475</div>
        </div>
      </section>

      <footer className="opening-cinematic__footer">
        <span>OPENING THEORY, MADE HUMAN</span>
        <span>20 OPENINGS <i /> 240 VARIATIONS <i /> INFINITE POSSIBILITIES</span>
      </footer>
    </main>
  );
}
