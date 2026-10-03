# Repository guide

## Build, test, and lint

Use npm from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Express server with Vite middleware on port 3000. |
| `npm run build` | Build the Vite client and bundle `server.ts` to `dist/server.cjs`. |
| `npm start` | Serve the production build with the Express server on port 3000. |
| `npm run preview` | Preview the built Vite client (this does not run the Express API). |
| `npm run lint` | Run `tsc --noEmit` for TypeScript checking; this is not a style linter. |

There is no configured test runner or `npm test` script, so there is no single-test command. `node scripts/test_gm_builder.js` only prints a message and contains no assertions.

For Gemini-backed chat locally, set `GEMINI_API_KEY` in `.env`; without it, `/api/chat` uses its built-in fallback responses.

## Architecture

- `src/main.tsx` mounts the React app. `src/App.tsx` owns the selected opening and variation, move indices, board mode, playback/training state, and the coordination between the board, move panel, and feature modals. Components under `src/components/` render the explorer, board, explanations, and supporting UI.
- The repertoire is typed by `src/types/chess.ts` and loaded from `src/data/openingsData.json` through `src/data/openings.ts`. Move lines are SAN; `chess.js` validates/replays them, and move explanations store the resulting FEN so the board can display a selected move directly.
- Repertoire source definitions and explanation logic live in `scripts/whiteOpenings.js`, `scripts/blackOpenings.js`, `scripts/explainer.js`, and `scripts/badMoveEngine.js`. `scripts/compile_all_openings.js` generates the opening JSON and its TypeScript accessor. Grandmaster game records are loaded through `src/data/grandmasterGames.ts`; `src/utils/gameExplainer.ts` builds their move explanations, reusing curated repertoire explanations for matching opening moves.
- `src/utils/deviationAnalyzer.ts` analyzes played alternatives, using curated refutations when available and otherwise chess.js-based heuristics and a bounded minimax search. `App.tsx` manages the resulting continuation as a separate board-playback state.
- `server.ts` runs Express, mounts Vite middleware in development, serves `dist` in production, and exposes `/api/health` and `/api/chat`. Chat uses Gemini when configured and has a local fallback.

## Repository-specific conventions

- Treat the raw opening definitions and generator logic as the source of truth. When changing repertoire content or its explanations, update the corresponding script sources and regenerate with `node scripts/compile_all_openings.js`; do not make a generated JSON-only change. The compiler enforces exactly 32 openings with 12 variations each, and validates each SAN line by replaying it.
- Keep chess move data in SAN and use `chess.js` to apply moves or produce FENs. `MoveExplanation` entries are aligned by index with their variation's move array; preserve that relationship when adding or editing annotations.
- Grandmaster records are keyed by variation ID. `scripts/generate_gm_games.js` generates heuristic continuations with randomized move scoring and assigned player/event metadata; its output should not be treated as verified historical game scores.
- The UI uses Tailwind CSS v4 through the Vite plugin and utility classes in JSX; global theme and color-mode overrides are in `src/index.css`.
- Vite maps the `@` import alias to the repository root (see `vite.config.ts`), not to `src`.
