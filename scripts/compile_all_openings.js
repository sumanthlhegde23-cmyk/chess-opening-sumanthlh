import { Chess } from 'chess.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { whiteOpeningsRaw } from './whiteOpenings.js';
import { blackOpeningsRaw } from './blackOpenings.js';
import { explainMove } from './explainer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allRaw = [...whiteOpeningsRaw, ...blackOpeningsRaw];

console.log(`Processing ${allRaw.length} openings...`);

if (allRaw.length !== 20) {
  throw new Error(`Expected exactly 20 openings, got ${allRaw.length}`);
}

const compiledOpenings = [];

for (const op of allRaw) {
  if (op.variations.length !== 12) {
    throw new Error(`Opening ${op.name} does not have exactly 12 variations (has ${op.variations.length})`);
  }

  const compiledVariations = [];

  for (const v of op.variations) {
    const chess = new Chess();
    const moveExplanations = [];

    for (let i = 0; i < v.moves.length; i++) {
      const san = v.moves[i];
      const side = i % 2 === 0 ? 'white' : 'black';
      const moveNum = Math.floor(i / 2) + 1;
      const fenBefore = chess.fen();

      let moveObj;
      try {
        moveObj = chess.move(san);
      } catch (err) {
        throw new Error(`Illegal move in ${op.name} -> ${v.name}: move ${i + 1} "${san}": ${err.message}`);
      }

      if (!moveObj) {
        throw new Error(`Illegal move in ${op.name} -> ${v.name}: move ${i + 1} "${san}" returned null`);
      }

      const fenAfter = chess.fen();
      const moveExpl = explainMove(san, side, moveNum, fenBefore, fenAfter, moveObj, op, v, i, v.moves);

      moveExplanations.push(moveExpl);
    }

    compiledVariations.push({
      id: v.id,
      name: v.name,
      eco: v.eco,
      moves: v.moves,
      overview: v.overview,
      keyPlans: v.keyPlans,
      moveExplanations
    });
  }

  compiledOpenings.push({
    ...op,
    variations: compiledVariations
  });
}

const outputDir = path.resolve(__dirname, '../src/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const jsonPath = path.resolve(outputDir, 'openingsData.json');
fs.writeFileSync(jsonPath, JSON.stringify(compiledOpenings, null, 2), 'utf-8');
console.log(`Successfully written ${compiledOpenings.length} openings (with ${compiledOpenings.reduce((acc, o) => acc + o.variations.length, 0)} total variations) to ${jsonPath}!`);

// Also create a TypeScript entry file src/data/openings.ts
const tsContent = `import openingsJson from './openingsData.json';
import { Opening } from '../types/chess';

export const openings: Opening[] = openingsJson as unknown as Opening[];

export const whiteOpenings = openings.filter(o => o.side === 'white');
export const blackOpenings = openings.filter(o => o.side === 'black');

export function getOpeningById(id: string): Opening | undefined {
  return openings.find(o => o.id === id);
}

export function getVariationById(openingId: string, variationId: string) {
  const opening = getOpeningById(openingId);
  if (!opening) return undefined;
  return opening.variations.find(v => v.id === variationId);
}
`;

fs.writeFileSync(path.resolve(outputDir, 'openings.ts'), tsContent, 'utf-8');
console.log(`Created src/data/openings.ts successfully!`);
