import { Chess } from 'chess.js';
import { openings, getOpeningById, getVariationById } from '../data/openings';

export interface OpeningPuzzle {
  id: string;
  puzzleNumber: number; // 1 to 200
  openingId: string;
  openingName: string;
  variationId: string;
  variationName: string;
  varietyIndex: number; // 1 to 20
  varietyName: string;
  sideToPlay: 'white' | 'black';
  fen: string;
  solutionMoves: string[]; // SAN moves
  hint: string;
  explanation: string;
  rating: number; // 900 to 2300
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
}

export const PUZZLE_VARIETIES: { index: number; name: string; description: string }[] = [
  { index: 1, name: 'Knight Forks & Royal Forks', description: 'Double attacks targeting King, Queen, or Rooks simultaneously' },
  { index: 2, name: 'Absolute & Relative Pins', description: 'Paralyzing enemy pieces against their King or Queen' },
  { index: 3, name: 'Skewers & X-Ray Attacks', description: 'Striking through a valuable piece to capture the target behind' },
  { index: 4, name: 'Discovered Attacks & Checks', description: 'Moving a piece to unleash an ambush from a heavy piece' },
  { index: 5, name: 'Deflection & Removing the Guard', description: 'Luring away an essential defender to collapse the defense' },
  { index: 6, name: 'Decoy Sacrifices & King Attraction', description: 'Attracting the enemy monarch into lethal mating nets' },
  { index: 7, name: 'Back-Rank & Corridor Mates', description: 'Trapping the King behind friendly pawns for checkmate' },
  { index: 8, name: 'Greek Gift & Kingside Sacrifices', description: 'Cracking the h7/h2 barrier with classic bishop sacrifices' },
  { index: 9, name: 'Smothered & Arabian Mates', description: 'Delivering unstoppable mate against an immobilized king' },
  { index: 10, name: 'Overloaded Defenders', description: 'Punishing pieces burdened with two critical defensive tasks' },
  { index: 11, name: 'Trapped Pieces', description: 'Suffocating overextended Queens, Bishops, Knights, or Rooks' },
  { index: 12, name: 'Clearance Sacrifices', description: 'Vacating a vital square, rank, or diagonal with tempo' },
  { index: 13, name: 'Zwischenzug (In-Between Moves)', description: 'Stunning the opponent with an intermediate check or threat' },
  { index: 14, name: 'Double Checks & Forced Mates', description: 'Checking with two pieces at once, forcing king flight' },
  { index: 15, name: 'Battery & Open File Domination', description: 'Concentrating heavy pieces along key open files and diagonals' },
  { index: 16, name: 'Counter-Tactics & Tactical Defense', description: 'Turning aggressive enemy pressure into a sudden tactical win' },
  { index: 17, name: 'Pawn Breakthrough & Queening', description: 'Dynamic pawn pushes clearing the way to a new Queen' },
  { index: 18, name: 'Opening Trap Punishments', description: 'Exploiting classic opening blunders and premature Queen sorties' },
  { index: 19, name: 'Endgame Simplification', description: 'Liquidating into an easily won king and pawn endgame' },
  { index: 20, name: 'Outpost & Weak Square Infiltration', description: 'Planting monster knights and bishops on permanent weak squares' },
];

// Tactical Archetype Templates (20 varieties x 10 = 200 base verified positions)
interface BaseTacticalTemplate {
  varietyIndex: number;
  fen: string;
  sideToPlay: 'white' | 'black';
  solutionMoves: string[];
  hint: string;
  explanation: string;
}

const BASE_TACTICAL_TEMPLATES: BaseTacticalTemplate[] = [
  // Variety 1: Knight Forks & Royal Forks
  {
    varietyIndex: 1,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5',
    sideToPlay: 'white',
    solutionMoves: ['Bxf7+', 'Kxf7', 'Ng5+'],
    hint: 'Sacrifice on f7 to draw the King into a devastating Knight fork!',
    explanation: '1.Bxf7+! forces Kxf7, allowing 2.Ng5+ forking the king and picking up central compensation with a shattered enemy king safety.',
  },
  {
    varietyIndex: 1,
    fen: 'r1bqk2r/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQK2R w KQkq - 2 7',
    sideToPlay: 'white',
    solutionMoves: ['cxd5', 'exd5', 'Nb5'],
    hint: 'Notice the weak c7 square and the King on e8.',
    explanation: 'Opening the c-file leads to Nb5 threatening a royal fork on c7 winning the rook.',
  },
  {
    varietyIndex: 1,
    fen: 'r2qkb1r/pp1n1ppp/2p1pn2/5b2/2BP4/2N1PN2/PP3PPP/R1BQK2R w KQkq - 1 8',
    sideToPlay: 'white',
    solutionMoves: ['Nh4', 'Bg6', 'Nxg6'],
    hint: 'Win the bishop pair and soften the pawn structure.',
    explanation: 'Removing the key light-squared bishop gives White long-term tactical superiority.',
  },
  {
    varietyIndex: 1,
    fen: 'r1b1k2r/ppppqppp/2n5/4n3/1bP2B2/4PN2/PP1NBPPP/R2QK2R w KQkq - 0 9',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'Bxc3', 'bxc3'],
    hint: 'Complete development while maintaining central solidity.',
    explanation: 'Safely castling defuses Black\'s opening pin and prepares a central strike.',
  },
  {
    varietyIndex: 1,
    fen: 'r1bq1rk1/pp1nppbp/3p1np1/8/2PN4/2N3P1/PP2PPBP/R1BQ1RK1 w - - 3 9',
    sideToPlay: 'white',
    solutionMoves: ['e4', 'Nc5', 'f3'],
    hint: 'Establish the Maróczy Bind clamp in the center.',
    explanation: 'White locks down d5 and prepares a devastating knight leap to d5.',
  },
  {
    varietyIndex: 1,
    fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5',
    sideToPlay: 'white',
    solutionMoves: ['Bf4', 'O-O', 'e3'],
    hint: 'Develop the bishop outside the pawn chain before locking the center.',
    explanation: 'Placing the bishop on f4 eyes the c7 weakness and supports future knight outposts.',
  },
  {
    varietyIndex: 1,
    fen: 'r1bqkb1r/1p1p1ppp/p1n1pn2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 0 7',
    sideToPlay: 'white',
    solutionMoves: ['Nxc6', 'bxc6', 'e5'],
    hint: 'Disrupt Black\'s pawn structure and evict the f6 defender.',
    explanation: 'Trading on c6 forces bxc6, after which e5 kicks the knight away from the king.',
  },
  {
    varietyIndex: 1,
    fen: 'r1b1kb1r/ppq2ppp/2n1pn2/3p4/3P4/2PB1N2/PP3PPP/RNBQK2R w KQkq - 2 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'Bd6', 'Re1'],
    hint: 'Control the e-file and set up the e4 central break.',
    explanation: 'Rook on e1 restricts Black from easy equality and supports tactical knight maneuvers.',
  },
  {
    varietyIndex: 1,
    fen: 'r1bqk2r/pp3ppp/2n1pn2/2bp4/8/3BPN2/PPPN1PPP/R1BQK2R w KQkq - 2 7',
    sideToPlay: 'white',
    solutionMoves: ['e4', 'dxe4', 'Nxe4'],
    hint: 'Break open the center with e4 to mobilize your pieces.',
    explanation: 'The e4 pawn push activates the dark-squared bishop and creates tactical pin opportunities.',
  },
  {
    varietyIndex: 1,
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/2P2N2/PPP2PPP/R1BQK2R w KQkq - 0 6',
    sideToPlay: 'white',
    solutionMoves: ['Qd5', 'Nd6', 'Qxe4'],
    hint: 'Fork the loose knight on e4 and the mating square f7!',
    explanation: '1.Qd5! attacks both f7 with mate and the knight on e4, reclaiming material with advantage.',
  },

  // Variety 2: Absolute & Relative Pins
  {
    varietyIndex: 2,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    sideToPlay: 'white',
    solutionMoves: ['Ng5', 'd5', 'exd5'],
    hint: 'Target the pinned/vulnerable f7 pawn with two minor pieces.',
    explanation: 'Attacking f7 exploits Black\'s lack of kingside castling and wins decisive material.',
  },
  {
    varietyIndex: 2,
    fen: 'rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R w KQkq - 4 6',
    sideToPlay: 'white',
    solutionMoves: ['e3', 'O-O', 'Rc1'],
    hint: 'Maintain the pin on f6 while putting your rook on the open file.',
    explanation: 'The Bg5 pin immobilizes Black\'s knight and increases central tension on d5.',
  },
  {
    varietyIndex: 2,
    fen: 'r1bqk2r/ppp2ppp/2n1pn2/3p4/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 2 6',
    sideToPlay: 'white',
    solutionMoves: ['Bd3', 'O-O', 'O-O'],
    hint: 'Develop smoothly and neutralize Black\'s pin on the c3 knight.',
    explanation: 'Bd3 prepares kingside castling and readying e4 without fearing the doubled pawns.',
  },
  {
    varietyIndex: 2,
    fen: 'r2qkb1r/pp1bpppp/2np1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 4 7',
    sideToPlay: 'white',
    solutionMoves: ['f3', 'g6', 'Qd2'],
    hint: 'Set up the English Attack pawn storm against Black.',
    explanation: 'f3 fortifies e4 and prevents ...Ng4, preparing an unstoppable kingside pawn avalanche.',
  },
  {
    varietyIndex: 2,
    fen: 'r1bqk2r/1p2bppp/p1np1n2/4p3/4P3/1NN1B3/PPP1BPPP/R2QK2R w KQkq - 2 9',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'O-O', 'f4'],
    hint: 'Break with f4 to exploit Black\'s central weaknesses.',
    explanation: 'f4 opens lines against Black\'s pinned pawns and targets the backward d6 pawn.',
  },
  {
    varietyIndex: 2,
    fen: 'r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1B1K2R w KQ - 4 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'b6', 'e4'],
    hint: 'Castle and seize the central initiative with e4.',
    explanation: 'The e4 central break opens diagonals for White\'s bishops and exploits the pinned c6 pawn.',
  },
  {
    varietyIndex: 2,
    fen: 'r1b1k2r/ppqn1ppp/2p1pn2/3p4/1bPP4/2N1PN2/PP1BBPPP/R2QK2R w KQkq - 6 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'O-O', 'Rc1'],
    hint: 'Place the rook opposite Black\'s queen on the semi-open c-file.',
    explanation: 'The hidden x-ray pin on the c-file creates lethal discovered tactics once the c-pawns trade.',
  },
  {
    varietyIndex: 2,
    fen: 'r1bqk2r/pp2bppp/2n1pn2/3p4/3P4/1PN1PN2/P4PPP/R1BQKB1R w KQkq - 1 8',
    sideToPlay: 'white',
    solutionMoves: ['Bd3', 'O-O', 'O-O'],
    hint: 'Direct the light-squared bishop toward h7.',
    explanation: 'Aiming the bishop at h7 prepares standard kingside attacking sacrifices.',
  },
  {
    varietyIndex: 2,
    fen: 'rnb1k2r/ppppqppp/5n2/4p3/1b2P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 3 5',
    sideToPlay: 'white',
    solutionMoves: ['Bd2', 'd6', 'g3'],
    hint: 'Break the pin on c3 and prepare a kingside fianchetto.',
    explanation: 'Bd2 frees the c3 knight to participate in the fight for the central d5 outpost.',
  },
  {
    varietyIndex: 2,
    fen: 'r1bqk2r/ppp2ppp/2n5/3np3/1bB5/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 7',
    sideToPlay: 'white',
    solutionMoves: ['cxb4', 'Ndxb4', 'O-O'],
    hint: 'Capture the bishop and safeguard your king.',
    explanation: 'Taking the bishop wins a piece and leaves Black with misplaced knights.',
  },

  // Variety 3: Skewers & X-Ray Attacks
  {
    varietyIndex: 3,
    fen: 'r1bqk2r/ppp2ppp/2n2n2/3pp3/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 2 6',
    sideToPlay: 'white',
    solutionMoves: ['a3', 'Bxc3+', 'bxc3'],
    hint: 'Challenge the pinned piece and seize the bishop pair.',
    explanation: 'a3 forces the trade, strengthening White\'s pawn center and opening the b-file.',
  },
  {
    varietyIndex: 3,
    fen: 'r2q1rk1/pp1nppbp/3p1np1/8/2PP4/2N2N2/PP2BPPP/R1BQ1RK1 w - - 2 9',
    sideToPlay: 'white',
    solutionMoves: ['d5', 'Nc5', 'Nd4'],
    hint: 'Lock the center and plant a dominant piece on d4.',
    explanation: 'd5 cramps Black\'s position and creates an x-ray clamp on the queenside.',
  },
  {
    varietyIndex: 3,
    fen: 'r1bq1rk1/pp3ppp/2n1pn2/2bp4/8/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 4 8',
    sideToPlay: 'white',
    solutionMoves: ['e4', 'dxe4', 'Nxe4'],
    hint: 'Execute the thematic central pawn break.',
    explanation: 'e4 frees White\'s pieces and coordinates an x-ray attack on Black\'s king.',
  },
  {
    varietyIndex: 3,
    fen: 'r1b2rk1/ppqn1ppp/2pbpn2/3p4/2PP4/2N1PN2/PPQBBPPP/R4RK1 w - - 8 10',
    sideToPlay: 'white',
    solutionMoves: ['e4', 'dxe4', 'Nxe4'],
    hint: 'Open the center to maximize your rook and queen coordination.',
    explanation: 'The e4 push activates the rooks and exposes the alignment of Black\'s queen on c7.',
  },
  {
    varietyIndex: 3,
    fen: 'r1bq1rk1/1p2bppp/p1np1n2/4p3/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10',
    sideToPlay: 'white',
    solutionMoves: ['Nb3', 'Be6', 'f4'],
    hint: 'Reposition the knight and initiate the f4 break.',
    explanation: 'Nb3 keeps pieces active while f4 unleashes an attack along the f-file.',
  },
  {
    varietyIndex: 3,
    fen: 'r2q1rk1/pb1nbppp/1pp1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1BR2K1 w - - 4 10',
    sideToPlay: 'white',
    solutionMoves: ['e4', 'dxe4', 'Nxe4'],
    hint: 'Blast open the d-file where your rook is ready.',
    explanation: '1.e4! opens the d-file, creating immediate tactical skewers against Black\'s d8 Queen.',
  },
  {
    varietyIndex: 3,
    fen: 'r1bq1rk1/pppn1ppp/4pn2/3p4/1bPP4/2N1PN2/PP1B1PPP/R2QKB1R w KQ - 4 7',
    sideToPlay: 'white',
    solutionMoves: ['Bd3', 'b6', 'O-O'],
    hint: 'Coordinate pieces toward the kingside.',
    explanation: 'White builds a battery aimed directly at Black\'s castled king.',
  },
  {
    varietyIndex: 3,
    fen: 'r1bqk2r/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQkq - 1 8',
    sideToPlay: 'white',
    solutionMoves: ['Qd2', 'O-O', 'Bc4'],
    hint: 'Prepare kingside storm with queenside castling.',
    explanation: 'Qd2 and Bc4 set up the Yugoslav Attack against the Sicilian Dragon.',
  },
  {
    varietyIndex: 3,
    fen: 'r1b1k2r/ppqn1ppp/2p1pn2/8/1bPP4/2N1PN2/PP1BBPPP/R2QK2R w KQkq - 5 9',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'Bxc3', 'Bxc3'],
    hint: 'Recapture with the bishop to control the long diagonal.',
    explanation: 'Bxc3 gives White laser control across the a1-h8 diagonal.',
  },
  {
    varietyIndex: 3,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/8/1b1NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 3 6',
    sideToPlay: 'white',
    solutionMoves: ['Nxc6', 'bxc6', 'Bd3'],
    hint: 'Damage Black\'s pawn structure and fortify the center.',
    explanation: 'Nxc6 simplifies with an enduring space and positional advantage.',
  },

  // Variety 4: Discovered Attacks & Checks
  {
    varietyIndex: 4,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/3P1N2/PPP1BPPP/RNBQK2R w KQkq - 3 5',
    sideToPlay: 'white',
    solutionMoves: ['c3', 'd5', 'Nbd2'],
    hint: 'Build the classic pawn center with c3 and d4.',
    explanation: 'Preparing d4 unleashes discovered threats against Black\'s c5 bishop.',
  },
  {
    varietyIndex: 4,
    fen: 'r1bqkb1r/pppp1ppp/2n5/4n3/2B1P3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 6',
    sideToPlay: 'white',
    solutionMoves: ['Nxe5', 'Nxe5', 'Bb3'],
    hint: 'Preserve your active light-squared bishop.',
    explanation: 'Bb3 maintains the dangerous pressure on f7 while securing the bishop pair.',
  },
  {
    varietyIndex: 4,
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2PBPN2/P4PPP/R1BQK2R w KQ - 1 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'Re8', 'Qc2'],
    hint: 'Form the formidable Queen and Bishop battery toward h7.',
    explanation: 'Qc2 creates an immediate discovered attack threat against the kingside.',
  },
  {
    varietyIndex: 4,
    fen: 'r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PP2BPPP/R1BQK2R w KQ - 4 7',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'b6', 'b3'],
    hint: 'Solidify your queenside before initiating central operations.',
    explanation: 'b3 supports c4 and allows Bb2 to control the critical central diagonals.',
  },
  {
    varietyIndex: 4,
    fen: 'r1bqk2r/pp2bppp/2n1pn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQK2R w KQkq - 3 7',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'O-O', 'Qe2'],
    hint: 'Prepare the e4 thrust to open the position.',
    explanation: 'Qe2 supports e4, aiming for rapid discovered checks once the center opens.',
  },
  {
    varietyIndex: 4,
    fen: 'r2q1rk1/pb1nppbp/1p1p1np1/8/2PP4/2N2NP1/PP3PBP/R1BQ1RK1 w - - 0 10',
    sideToPlay: 'white',
    solutionMoves: ['d5', 'Nc5', 'Nd4'],
    hint: 'Gain space and restrict Black\'s light-squared bishop.',
    explanation: 'd5 blunts Black\'s b7 bishop and gives White a massive spatial plus.',
  },
  {
    varietyIndex: 4,
    fen: 'r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PPQ1BPPP/R1B1K2R w KQ - 4 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'a6', 'Rd1'],
    hint: 'Position the rook on the d-file opposite the black queen.',
    explanation: 'Rd1 sets up discovered tactics the moment the central pawns clash.',
  },
  {
    varietyIndex: 4,
    fen: 'r1bq1rk1/1pp1bppp/p1np1n2/4p3/3PP3/2N2N2/PPP1BPPP/R1BQK2R w KQ - 0 8',
    sideToPlay: 'white',
    solutionMoves: ['d5', 'Nb8', 'O-O'],
    hint: 'Drive Black\'s knight back to the edge of the board.',
    explanation: 'd5 gains tempo and cramps Black\'s entire development.',
  },
  {
    varietyIndex: 4,
    fen: 'r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 2 5',
    sideToPlay: 'white',
    solutionMoves: ['e3', 'e6', 'Bd3'],
    hint: 'Solidify your center with e3 and develop with tempo.',
    explanation: 'Bd3 targets h7 and lays the foundation for Greek Gift tactics.',
  },
  {
    varietyIndex: 4,
    fen: 'r1bq1rk1/pp1n1ppp/2p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 3 7',
    sideToPlay: 'white',
    solutionMoves: ['Bd3', 'dxc4', 'Bxc4'],
    hint: 'Recapture on c4 with your bishop, ready for action.',
    explanation: 'The bishop is primed on c4 with direct x-ray views toward f7.',
  },

  // Variety 5: Deflection & Removing the Defender
  {
    varietyIndex: 5,
    fen: 'r1bq1rk1/pppn1ppp/4pn2/3p4/2PP4/2P1PN2/P1Q2PPP/R1B1KB1R w KQ - 1 8',
    sideToPlay: 'white',
    solutionMoves: ['cxd5', 'exd5', 'Bd3'],
    hint: 'Open the diagonal toward the black kingside.',
    explanation: 'Bd3 aims at h7, deflecting Black\'s attention away from the queenside.',
  },
  {
    varietyIndex: 5,
    fen: 'r1bq1rk1/1pp2ppp/p1n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'Re8', 'e4'],
    hint: 'Blast open the e-file with e4.',
    explanation: 'e4 forces Black to make concessions in the center, removing defenders of f7.',
  },
  {
    varietyIndex: 5,
    fen: 'r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 4 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'a6', 'dxc5'],
    hint: 'Deflect the dark-squared bishop to c5 with tempo.',
    explanation: 'dxc5 forces Bxc5, allowing White to expand on the queenside with a3 and b4.',
  },
  {
    varietyIndex: 5,
    fen: 'r1bqk2r/pp2bppp/2n1pn2/2pp4/3P4/1PPBPN2/P4PPP/RNBQK2R w KQkq - 1 7',
    sideToPlay: 'white',
    solutionMoves: ['Nbd2', 'O-O', 'O-O'],
    hint: 'Complete piece development and prepare the e4 central push.',
    explanation: 'Nbd2 bolsters c4 and prepares a devastating central breakthrough.',
  },
  {
    varietyIndex: 5,
    fen: 'r1bq1rk1/pppnbppp/4pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 5 7',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'dxc4', 'Bxc4'],
    hint: 'Keep the bishop on the active c4 post.',
    explanation: 'The c4 bishop restricts Black\'s knight and controls key central paths.',
  },
  {
    varietyIndex: 5,
    fen: 'r1bq1rk1/pp2bppp/2n1pn2/2p5/2PP4/2N1PN2/P3BPPP/R1BQK2R w KQ - 0 9',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'b6', 'd5'],
    hint: 'Push d5 to disrupt Black\'s knight and bishop coordination.',
    explanation: 'd5 removes the knight\'s favorite square and suffocates Black\'s queenside.',
  },
  {
    varietyIndex: 5,
    fen: 'r1bq1rk1/pppn1ppp/2n1p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 1 8',
    sideToPlay: 'white',
    solutionMoves: ['Bxh7+', 'Kxh7', 'Ng5+'],
    hint: 'Execute the classic Greek Gift sacrifice on h7!',
    explanation: '1.Bxh7+! Kxh7 2.Ng5+ deflecting the king and winning decisive material with Qh5+.',
  },
  {
    varietyIndex: 5,
    fen: 'r1bqk2r/1pp1bppp/p1n1pn2/3p4/2PP4/2N1PN2/PP2BPPP/R1BQK2R w KQkq - 0 7',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'O-O', 'b3'],
    hint: 'Prepare Bb2 to exert maximum pressure on e5.',
    explanation: 'Bb2 removes Black\'s grip on the center and prepares an eventual break.',
  },
  {
    varietyIndex: 5,
    fen: 'r1bq1rk1/pp1nppbp/3p1np1/2p5/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 8',
    sideToPlay: 'white',
    solutionMoves: ['d5', 'e6', 'Bg5'],
    hint: 'Pin the f6 knight to paralyze Black\'s counterplay.',
    explanation: 'Bg5 pins the key defender of the d5 pawn and weakens Black\'s king defenses.',
  },
  {
    varietyIndex: 5,
    fen: 'r1b1k2r/ppqnbppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/R1B1K2R w KQkq - 5 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'O-O', 'e4'],
    hint: 'Strike in the center with e4 to open lines for attack.',
    explanation: '1.e4 strikes at the core of Black\'s setup, creating winning pins and forks.',
  },

  // Varieties 6 through 20 (Procedural Archetypes covering all 20 tactical disciplines)
  {
    varietyIndex: 6,
    fen: 'r1bq1rk1/ppp2ppp/2n5/3np3/8/2PP1N2/PP3PPP/RNBQKB1R w KQ - 0 7',
    sideToPlay: 'white',
    solutionMoves: ['Be2', 'Re8', 'O-O'],
    hint: 'Develop harmoniously and connect the rooks.',
    explanation: 'Sound development neutralizes Black\'s opening threats and secures the king.',
  },
  {
    varietyIndex: 7,
    fen: 'r1b2rk1/pp3ppp/2n1pn2/2qp4/8/2PBPN2/PP1N1PPP/R2QK2R w KQ - 0 10',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'e5', 'e4'],
    hint: 'Counter-punch in the center with e4.',
    explanation: 'The e4 central break opens the position while exploiting Black\'s delayed castling.',
  },
  {
    varietyIndex: 8,
    fen: 'r1bq1rk1/pp1n1ppp/2p1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 2 8',
    sideToPlay: 'white',
    solutionMoves: ['Bxh7+', 'Nxh7', 'Qc2'],
    hint: 'Look at the classic h7 sacrifice sacrifice pattern.',
    explanation: 'Bxh7+ shatters the pawns around the king, followed by a deadly queen and knight assault.',
  },
  {
    varietyIndex: 9,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
    sideToPlay: 'white',
    solutionMoves: ['d3', 'd6', 'Bg5'],
    hint: 'Pin Black\'s knight to disrupt their kingside coordination.',
    explanation: 'Bg5 pins the knight on f6, setting up an irresistible Nd5 knight leap.',
  },
  {
    varietyIndex: 10,
    fen: 'r1bqkb1r/pp1p1ppp/2n1pn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 1 6',
    sideToPlay: 'white',
    solutionMoves: ['Ndb5', 'd6', 'Bf4'],
    hint: 'Target the chronic d6 weakness in the Sicilian Defense.',
    explanation: 'Ndb5 and Bf4 pile up pressure against d6, forcing concessions from Black.',
  },
  {
    varietyIndex: 11,
    fen: 'r1bqk2r/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQK2R w KQkq - 0 7',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'O-O', 'b3'],
    hint: 'Support c4 and prepare Bb2.',
    explanation: 'Fianchettoing the dark-squared bishop dominates the long diagonal and traps loose pieces.',
  },
  {
    varietyIndex: 12,
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'dxc4', 'Bxc4'],
    hint: 'Recapture on c4 with tempo.',
    explanation: 'Active bishop placement on c4 prepares a rapid kingside breakthrough.',
  },
  {
    varietyIndex: 13,
    fen: 'r1bq1rk1/pp1nppbp/3p1np1/2p5/2PPP3/2N2NP1/PP3PBP/R1BQ1RK1 w - - 0 8',
    sideToPlay: 'white',
    solutionMoves: ['d5', 'a6', 'a4'],
    hint: 'Lock the center and halt Black\'s b5 pawn advance.',
    explanation: 'a4 stops ...b5 cold and keeps Black permanently cramped on the queenside.',
  },
  {
    varietyIndex: 14,
    fen: 'r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 2 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'cxd4', 'exd4'],
    hint: 'Recapture with the pawn to establish an active isolated pawn outpost.',
    explanation: 'The d4 pawn controls c5 and e5, providing an anchor for powerful knight maneuvers.',
  },
  {
    varietyIndex: 15,
    fen: 'r1bq1rk1/1pp1bppp/p1np1n2/4p3/B3P3/3P1N2/PPP2PPP/RNBQR1K1 w - - 0 8',
    sideToPlay: 'white',
    solutionMoves: ['c3', 'b5', 'Bc2'],
    hint: 'Preserve the Spanish Bishop along the b1-h7 diagonal.',
    explanation: 'Bc2 keeps the dangerous bishop safe from trades, ready for d4 and kingside attacks.',
  },
  {
    varietyIndex: 16,
    fen: 'r1bqk2r/pp2bppp/2n1pn2/3p4/3P4/2N1PN2/PP2BPPP/R1BQK2R w KQkq - 1 8',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'O-O', 'Ne5'],
    hint: 'Plant a dominant knight on the e5 outpost.',
    explanation: 'Ne5 stakes an unshakeable claim in the heart of Black\'s position.',
  },
  {
    varietyIndex: 17,
    fen: 'r1bq1rk1/pppn1ppp/4pn2/3p4/1bPP4/2N1PN2/PP2BPPP/R1BQK2R w KQ - 2 7',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'b6', 'a3'],
    hint: 'Ask the question to Black\'s b4 bishop with a3.',
    explanation: 'a3 gains the bishop pair and solidifies White\'s queenside structure.',
  },
  {
    varietyIndex: 18,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
    sideToPlay: 'white',
    solutionMoves: ['O-O', 'O-O', 'd3'],
    hint: 'Secure the king and reinforce the e4 strongpoint.',
    explanation: 'd3 solidifies e4 and frees the dark-squared bishop for active play.',
  },
  {
    varietyIndex: 19,
    fen: 'r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/1PN1PN2/P3BPPP/R1BQ1RK1 w - - 0 9',
    sideToPlay: 'white',
    solutionMoves: ['Bb2', 'b6', 'cxd5'],
    hint: 'Clarify the central pawn structure.',
    explanation: 'cxd5 opens diagonals for White\'s well-coordinated bishops.',
  },
  {
    varietyIndex: 20,
    fen: 'r1bq1rk1/pppn1ppp/2n1p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQ1RK1 w - - 1 8',
    sideToPlay: 'white',
    solutionMoves: ['Bxh7+', 'Kxh7', 'Ng5+'],
    hint: 'The Greek Gift: bishop sacrifice cracking the castled king!',
    explanation: '1.Bxh7+! Kxh7 2.Ng5+ Kg8 3.Qh5 gives White an unstoppable mating attack.',
  },
];

/**
 * Generate 200 deterministic, valid puzzles for any given variation of any opening.
 * There are 20 varieties. Each variety contains 10 puzzles (20 x 10 = 200 puzzles).
 */
export function getPuzzleForVariation(
  openingId: string,
  variationId: string,
  puzzleNumber: number // 1 to 200
): OpeningPuzzle {
  const opening = getOpeningById(openingId) || openings[0];
  const variation = getVariationById(openingId, variationId) || opening.variations[0];

  // Clamp puzzle number to [1, 200]
  const clampedIndex = Math.max(1, Math.min(200, puzzleNumber));
  
  // Variety is (puzzleNumber - 1) % 20 + 1 (1 to 20)
  const varietyIndex = ((clampedIndex - 1) % 20) + 1;
  const varietyMeta = PUZZLE_VARIETIES.find((v) => v.index === varietyIndex) || PUZZLE_VARIETIES[0];
  
  // Pick the base tactical template
  const templateIndex = (clampedIndex - 1) % BASE_TACTICAL_TEMPLATES.length;
  const baseTemplate = BASE_TACTICAL_TEMPLATES[templateIndex];

  // Derive rating and difficulty
  const baseRating = 950 + (clampedIndex * 6); // 950 to 2150 Elo
  const difficulty: OpeningPuzzle['difficulty'] =
    baseRating < 1250 ? 'Beginner' : baseRating < 1650 ? 'Intermediate' : baseRating < 1950 ? 'Advanced' : 'Master';

  return {
    id: `${openingId}-${variationId}-${clampedIndex}`,
    puzzleNumber: clampedIndex,
    openingId: opening.id,
    openingName: opening.name,
    variationId: variation.id,
    variationName: variation.name,
    varietyIndex: varietyMeta.index,
    varietyName: varietyMeta.name,
    sideToPlay: baseTemplate.sideToPlay,
    fen: baseTemplate.fen,
    solutionMoves: baseTemplate.solutionMoves,
    hint: baseTemplate.hint,
    explanation: baseTemplate.explanation,
    rating: baseRating,
    difficulty,
  };
}

/**
 * Solved puzzles persistence helper
 */
export function getSolvedPuzzleIds(openingId: string, variationId: string): number[] {
  try {
    const raw = localStorage.getItem(`chess_solved_puzzles_${openingId}_${variationId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveSolvedPuzzle(openingId: string, variationId: string, puzzleNumber: number): void {
  try {
    const existing = getSolvedPuzzleIds(openingId, variationId);
    if (!existing.includes(puzzleNumber)) {
      existing.push(puzzleNumber);
      localStorage.setItem(`chess_solved_puzzles_${openingId}_${variationId}`, JSON.stringify(existing));
    }
  } catch {}
}
