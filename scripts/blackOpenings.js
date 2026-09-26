export const blackOpeningsRaw = [
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    side: 'black',
    ecoCode: 'B20-B99',
    category: 'Semi-Open Game (1.e4 c5)',
    initialMoves: ['e4', 'c5'],
    description: 'The most popular, combative, and highest-scoring response to 1.e4 at all levels. Black fights for central dominance (the d4 square) from the flank, creating dynamic imbalance from move one.',
    historicalContext: 'Played by Polerio in 1594, popularized in the 19th century, and championed by World Champions Bobby Fischer, Garry Kasparov, and Magnus Carlsen as the ultimate counter-attacking weapon.',
    playStyle: 'Counterattacking',
    difficulty: 'Advanced',
    popularity: 99,
    keyThemes: ['Asymmetrical pawn structure with half-open c-file', 'Queenside minority counter-attack with ...a6 and ...b5', 'Central counter-strikes with ...d5 or ...e5', 'Sharp opposite-side castling battles'],
    variations: [
      {
        id: 'sicilian-najdorf',
        name: 'Najdorf Variation (5...a6)',
        eco: 'B90',
        moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'Be7', 'Qd2', 'O-O', 'O-O-O', 'Nbd7', 'g4', 'b5', 'g5', 'b4'],
        overview: 'The Rolls-Royce of chess openings, played extensively by Fischer and Kasparov. 5...a6 prevents Bb5+ or Nb5 and prepares massive queenside counter-attacks.',
        keyPlans: { white: 'English Attack: castling queenside and launching g4-g5 kingside storm.', black: 'Retaliate immediately with ...b5-b4 queenside counter-assault.' }
      },
      {
        id: 'sicilian-dragon',
        name: 'Dragon Variation (5...g6)',
        eco: 'B70',
        moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'Bc4', 'Bd7', 'O-O-O', 'Rc8', 'Bb3', 'Ne5', 'h4', 'h5'],
        overview: 'Named for the resemblance of Black’s pawn structure (d6, e7, f7, g6, h7) to the Draco constellation. Black’s dark-squared bishop breathes lethal fire down the long diagonal.',
        keyPlans: { white: 'Yugoslav Attack: castle queenside, play Bh6, h4-h5, mate the black king.', black: 'Sacrifice exchange on c3 (Rxc3!), deliver checkmate on White king.' }
      },
      {
        id: 'sicilian-scheveningen',
        name: 'Scheveningen Variation (5...e6)',
        eco: 'B80',
        moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6', 'Be2', 'a6', 'O-O', 'Be7', 'f4', 'O-O', 'Kh1', 'Qc7', 'a4', 'Nc6'],
        overview: 'Black sets up the resilient "small center" with pawns on d6 and e6, blunting White pieces while maintaining tremendous dynamic tension.',
        keyPlans: { white: 'Keres Attack with g4 or classical f4 kingside offensive.', black: 'Queenside expansion with ...b6/Bb7 or central break with ...d5.' }
      },
      {
        id: 'sicilian-classical',
        name: 'Classical Sicilian (5...Nc6)',
        eco: 'B56',
        moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6', 'Bg5', 'e6', 'Qd2', 'a6', 'O-O-O', 'Bd7', 'f4', 'b5', 'Bxf6', 'gxf6'],
        overview: 'Black develops both knights naturally to f6 and c6. White answers with the aggressive Richter-Rauzer attack (6.Bg5), leading to chaotic battles.',
        keyPlans: { white: 'Shatter Black pawn structure with Bxf6 and castle queenside.', black: 'Use bishop pair and open g- and c-files for counter-offensive.' }
      },
      {
        id: 'sicilian-sveshnikov',
        name: 'Sveshnikov Variation (5...e5)',
        eco: 'B33',
        moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5', 'Ndb5', 'd6', 'Bg5', 'a6', 'Na3', 'b5', 'Nd5', 'Be7', 'Bxf6', 'Bxf6', 'c3', 'O-O', 'Nc2', 'Bg5'],
        overview: 'Magnus Carlsen’s lethal weapon in the 2018 World Championship match. Black accepts a backward d6 pawn and hole on d5 to seize tremendous piece activity.',
        keyPlans: { white: 'Exploit d5 outpost and target backward d6 pawn.', black: 'Active dark-squared bishop, play ...f5 to rip open the kingside.' }
      },
      {
        id: 'sicilian-kalashnikov',
        name: 'Kalashnikov Variation (4...e5)',
        eco: 'B32',
        moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'e5', 'Nb5', 'd6', 'c4', 'Be7', 'N1c3', 'a6', 'Na3', 'Be6', 'Be2', 'Bg5'],
        overview: 'Similar to the Sveshnikov but without developing the knight to f6 first: Black immediately forces White’s knight to the rim.',
        keyPlans: { white: 'Maintain Maroczy Bind with c4, squeeze Black position.', black: 'Exchange dark-squared bishops with ...Bg5, play ...f5.' }
      },
      {
        id: 'sicilian-taimanov',
        name: 'Taimanov Variation (4...Nc6 & e6)',
        eco: 'B46',
        moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6', 'Nc3', 'a6', 'Be3', 'Nf6', 'f4', 'Bb4', 'Bd3', 'e5'],
        overview: 'Mark Taimanov’s flexible system: Black combines ...Nc6 and ...e6, delaying ...d6 to retain maximum central counter-strike options.',
        keyPlans: { white: 'Pressure kingside with f4 and Qf3, restrict Black knights.', black: 'Pin White knight with ...Bb4, counter in the center with ...d5 or ...e5.' }
      },
      {
        id: 'sicilian-kan',
        name: 'Kan Variation (4...a6)',
        eco: 'B41',
        moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6', 'Bd3', 'Bc5', 'Nb3', 'Be7', 'Qg4', 'g6', 'Qe2', 'd6', 'O-O', 'Nd7'],
        overview: 'Ilya Kan’s ultra-flexible chameleon defense: 4...a6 denies b5 to White pieces while keeping all pawn breaks open.',
        keyPlans: { white: 'Gain kingside space with Qg4 and c4, control d5.', black: 'Solid defense, counter-strike with ...b5, ...Bb7, and ...Ne5.' }
      },
      {
        id: 'sicilian-accelerated-dragon',
        name: 'Accelerated Dragon (4...g6)',
        eco: 'B35',
        moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6', 'Nc3', 'Bg7', 'Be3', 'Nf6', 'Bc4', 'O-O', 'Bb3', 'a5', 'f3', 'd5'],
        overview: 'Black plays ...g6 without ...d6 first, threatening the immediate ...d5 central blow and avoiding the dangerous Yugoslav Attack 9.0-0-0 lines.',
        keyPlans: { white: 'Choose between 5.c4 (Maroczy Bind) or Bc4 sharp piece play.', black: 'Blast the center open with the thematic ...d5 break!' }
      },
      {
        id: 'sicilian-four-knights',
        name: 'Four Knights Sicilian',
        eco: 'B45',
        moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6', 'Ndb5', 'Bb4', 'a3', 'Bxc3+', 'Nxc3', 'd5', 'exd5', 'exd5', 'Bd3', 'O-O'],
        overview: 'Black forces immediate central confrontation: 5...Bb4 pins the knight and leads to an isolated queen pawn middlegame.',
        keyPlans: { white: 'Utilize bishop pair to target Black isolated d5 pawn.', black: 'Active piece development and open e-file control.' }
      },
      {
        id: 'sicilian-alapin',
        name: 'Alapin Variation (2.c3 Counter)',
        eco: 'B22',
        moves: ['e4', 'c5', 'c3', 'd5', 'exd5', 'Qxd5', 'd4', 'Nf6', 'Nf3', 'e6', 'Be2', 'Nc6', 'O-O', 'Be7', 'c4', 'Qd8'],
        overview: 'White avoids open Sicilian theory with 2.c3 to build a d4 pawn center. Black counters with the principled 2...d5 strike.',
        keyPlans: { white: 'Control center with d4, push c5 to gain space.', black: 'Direct pressure against White isolated d4 pawn.' }
      },
      {
        id: 'sicilian-closed',
        name: 'Closed Sicilian (2.Nc3)',
        eco: 'B23',
        moves: ['e4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'd3', 'd6', 'f4', 'e6', 'Nf3', 'Nge7', 'O-O', 'O-O', 'Be3', 'Nd4', 'Rb1', 'Nec6'],
        overview: 'White bypasses early d4, preferring kingside fianchetto and f4 expansion. Black establishes a powerful knight outpost on d4.',
        keyPlans: { white: 'Advance kingside pawns f4-f5 to assault Black king.', black: 'Dominance of d4 square, expand on queenside with ...b5 and ...Rb8.' }
      }
    ]
  },
  {
    id: 'french-defense',
    name: 'French Defense',
    side: 'black',
    ecoCode: 'C00-C19',
    category: 'Semi-Open Game (1.e4 e6)',
    initialMoves: ['e4', 'e6', 'd4', 'd5'],
    description: 'A solid, counter-punching opening. Black creates an iron pawn chain (e6-d5) that blunts White’s e4 pawn, then systematically undermines White’s center with ...c5, ...f6, and queenside pressure.',
    historicalContext: 'Played in an 1834 correspondence match between London and Paris. Revered by Mikhail Botvinnik, Tigran Petrosian, and Viktor Korchnoi as the ultimate strategic fortress.',
    playStyle: 'Positional',
    difficulty: 'Intermediate',
    popularity: 93,
    keyThemes: ['Fixed central pawn chains (White d4-e5 vs Black e6-d5)', 'The French "bad bishop" on c8 problem and activation methods', 'Undermining White center with ...c5 and ...f6', 'Counterplay on the half-open c-file'],
    variations: [
      {
        id: 'french-winawer',
        name: 'Winawer Variation (3.Nc3 Bb4)',
        eco: 'C15',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5', 'a3', 'Bxc3+', 'bxc3', 'Ne7', 'Qg4', 'Qc7', 'Qxg7', 'Rg8', 'Qxh7', 'cxd4', 'Ne2', 'Nbc6', 'f4', 'Bd7', 'Qd3', 'dxc3'],
        overview: 'Szymon Winawer’s razor-sharp variation: Black pins and destroys White’s c3 knight, leading to the crazy "Poisoned Pawn" variation.',
        keyPlans: { white: 'Push kingside passed h-pawn, exploit Black missing dark-squared bishop.', black: 'Dominate central dark squares, rip open White shattered queenside.' }
      },
      {
        id: 'french-classical',
        name: 'Classical Variation (3.Nc3 Nf6)',
        eco: 'C11',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e5', 'Nfd7', 'Bxe7', 'Qxe7', 'f4', 'O-O', 'Nf3', 'c5', 'Qd2', 'Nc6'],
        overview: 'The purest classical formulation: Black challenges e4 with 3...Nf6. White answers with Bg5, exchanging dark bishops.',
        keyPlans: { white: 'Build kingside attacking wedge with f4, Nce2, and c3.', black: 'Strike down White d4 foundation with ...c5, ...cxd4, and ...f6.' }
      },
      {
        id: 'french-tarrasch',
        name: 'Tarrasch Variation (3.Nd2)',
        eco: 'C03',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'c5', 'exd5', 'exd5', 'Ngf3', 'Nc6', 'Bb5', 'Bd6', 'dxc5', 'Bxc5', 'O-O', 'Ne7', 'Nb3', 'Bd6'],
        overview: 'Siegbert Tarrasch’s flexible system: White develops Nd2 to avoid the Winawer pin (...Bb4) and support c3.',
        keyPlans: { white: 'Inflict an isolated queen pawn (IQP) on Black d5 and blockade it.', black: 'Utilize free piece activity and open lines to offset the IQP.' }
      },
      {
        id: 'french-advance',
        name: 'Advance Variation (3.e5)',
        eco: 'C02',
        moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6', 'a3', 'c4', 'Nbd2', 'Na5', 'g3', 'Bd7', 'h4', 'h6'],
        overview: 'White immediately locks the center with 3.e5, establishing a space advantage. Black relentlessly piles pressure onto d4.',
        keyPlans: { white: 'Hold the d4-e5 pawn chain, maneuver knights to kingside attack.', black: 'Lock queenside with ...c4, target b2, activate c8 bishop via a4.' }
      },
      {
        id: 'french-exchange',
        name: 'Exchange Variation (3.exd5)',
        eco: 'C01',
        moves: ['e4', 'e6', 'd4', 'd5', 'exd5', 'exd5', 'Nf3', 'Nf6', 'Bd3', 'Bd6', 'O-O', 'O-O', 'Bg5', 'Bg4', 'Nbd2', 'Nbd7', 'c3', 'c6'],
        overview: 'White liquidates the central tension on move 3, producing a symmetrical pawn structure where Black equalizes with ease.',
        keyPlans: { white: 'Use the open e-file and active bishops to seek a tiny edge.', black: 'Smooth piece development, contest the e-file, target White king.' }
      },
      {
        id: 'french-rubinstein',
        name: 'Rubinstein Variation (3...dxe4)',
        eco: 'C10',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Nf3', 'Ngf6', 'Nxf6+', 'Nxf6', 'Bd3', 'c5', 'dxc5', 'Bxc5', 'O-O', 'O-O'],
        overview: 'Akiba Rubinstein’s simplifying defense: Black surrenders the center early to achieve smooth development and a clear equal endgame.',
        keyPlans: { white: 'Enjoy central space advantage, target Black kingside.', black: 'Harmonious development, break with ...c5 to neutralize White center.' }
      },
      {
        id: 'french-maccutcheon',
        name: 'MacCutcheon Variation',
        eco: 'C12',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Bb4', 'e5', 'h6', 'Bd2', 'Bxc3', 'bxc3', 'Ne4', 'Qg4', 'g6', 'Bd3', 'Nxd2', 'Kxd2', 'c5'],
        overview: 'A venomous hybrid of Classical and Winawer: Black questions White’s g5 bishop with 5...h6 while pinning c3.',
        keyPlans: { white: 'Attack Black fractured kingside with Qg4 and h4.', black: 'Grab the bishop pair, strike at White center with ...c5.' }
      },
      {
        id: 'french-burn',
        name: 'Burn Variation (3...Nf6 4.Bg5 dxe4)',
        eco: 'C11',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'dxe4', 'Nxe4', 'Be7', 'Bxf6', 'Bxf6', 'Nf3', 'O-O', 'c3', 'Nd7', 'Bd3', 'b6'],
        overview: 'Amos Burn’s solid refinement: Black captures on e4 after Bg5 to gain the bishop pair without allowing doubled f-pawns.',
        keyPlans: { white: 'Develop active piece battery Qd2/Bd3 pointing at h7.', black: 'Fianchetto on b7, eliminate central weaknesses with ...c5.' }
      },
      {
        id: 'french-guimard',
        name: 'Guimard Variation (3.Nd2 Nc6)',
        eco: 'C04',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'Nc6', 'Ngf3', 'Nf6', 'e5', 'Nd7', 'Be2', 'f6', 'exf6', 'Qxf6', 'Nf1', 'Bd6'],
        overview: 'Carlos Guimard’s unorthodox idea: Black blocks the c-pawn with 3...Nc6 to immediately pressure d4 and e5.',
        keyPlans: { white: 'Reroute Nd2 via f1 to e3/g3, support d4.', black: 'Break open the center with ...f6, activate queen and bishops.' }
      },
      {
        id: 'french-fort-knox',
        name: 'Fort Knox Variation',
        eco: 'C10',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bd7', 'Nf3', 'Bc6', 'Bd3', 'Nd7', 'O-O', 'Ngf6', 'Ng3', 'Bxf3', 'Qxf3', 'c6'],
        overview: 'True to its name, an impenetrable fortress: Black solves the "bad bishop" problem by developing it to c6, locking down the position.',
        keyPlans: { white: 'Retain the bishop pair and search for pawn breaks.', black: 'Enjoy total safety with no weaknesses whatsoever.' }
      },
      {
        id: 'french-alapin-gambit',
        name: 'Alapin Gambit (3.Be3)',
        eco: 'C00',
        moves: ['e4', 'e6', 'd4', 'd5', 'Be3', 'dxe4', 'Nd2', 'Nf6', 'f3', 'exf3', 'Ngxf3', 'Be7', 'Bd3', 'O-O', 'Qe2', 'b6', 'O-O-O', 'Bb7'],
        overview: 'White offers the e4 pawn for rapid development, leading to opposite-side castling fireworks.',
        keyPlans: { white: 'Assault Black king with g4, h4, and Ne5.', black: 'Consolidate the extra pawn, counter on the queenside.' }
      },
      {
        id: 'french-tarrasch-guimard',
        name: 'Tarrasch Closed System (3.Nd2 Nf6 4.e5 Nfd7)',
        eco: 'C05',
        moves: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'Nf6', 'e5', 'Nfd7', 'Bd3', 'c5', 'c3', 'Nc6', 'Ne2', 'cxd4', 'cxd4', 'f6', 'exf6', 'Nxf6', 'O-O', 'Bd6'],
        overview: 'Black strikes immediately with ...f6 to shatter White’s pawn wedge, giving both sides rich tactical middlegames.',
        keyPlans: { white: 'Target Black backward e6 pawn along the e-file.', black: 'Use active piece play along the f-file and e5 square.' }
      }
    ]
  },
  {
    id: 'caro-kann-defense',
    name: 'Caro-Kann Defense',
    side: 'black',
    ecoCode: 'B10-B19',
    category: 'Semi-Open Game (1.e4 c6)',
    initialMoves: ['e4', 'c6', 'd4', 'd5'],
    description: 'The solid gold standard of chess defense. Black prepares the d5 thrust with 1...c6, retaining the French defense’s rock-solid pawn structure while keeping the c8 light-squared bishop completely free.',
    historicalContext: 'Analyzed by Horatio Caro and Marcus Kann in 1886. Championed by World Champions Capablanca, Botvinnik, Karpov, and modern elite players like Hikaru Nakamura and Alireza Firouzja.',
    playStyle: 'Solid',
    difficulty: 'Beginner',
    popularity: 96,
    keyThemes: ['Pawn solidness with no native weaknesses', 'Active development of the c8 bishop to f5 or g4', 'Endgame pawn majority advantages', 'Minority counter-attacks with ...c5'],
    variations: [
      {
        id: 'caro-classical',
        name: 'Classical / Capablanca Variation (4...Bf5)',
        eco: 'B18',
        moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7', 'h5', 'Bh7', 'Bd3', 'Bxd3', 'Qxd3', 'e6', 'Bd2', 'Ngf6', 'O-O-O', 'Be7'],
        overview: 'The historic hallmark of Caro-Kann strategy: Black activates the light bishop to f5, trades it off on d3, and secures a rock-solid king safety.',
        keyPlans: { white: 'Castle queenside and push for central/kingside space.', black: 'Castle kingside, undermine White with ...c5, dominate endgames.' }
      },
      {
        id: 'caro-advance-tal',
        name: 'Advance Variation - Tal / Bayonet Attack',
        eco: 'B12',
        moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'h4', 'h5', 'Bg5', 'Qb6', 'Bd3', 'Bxd3', 'Qxd3', 'e6', 'Nd2', 'c5', 'c4', 'cxd4', 'Ngf3', 'Nc6'],
        overview: 'Mikhail Tal’s hyper-aggressive 4.h4!: White attempts to trap the bishop with g4, leading to wild, sharp tactical confrontations.',
        keyPlans: { white: 'Trap Black bishop or rip open the center with c4.', black: 'Counter on the queenside with ...Qb6 and strike d4 with ...c5.' }
      },
      {
        id: 'caro-advance-short',
        name: 'Advance Variation - Short System (4.Nf3 & 5.Be2)',
        eco: 'B12',
        moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6', 'Be2', 'c5', 'Be3', 'Qb6', 'Nc3', 'Nc6', 'O-O', 'Qxb2', 'Qe1', 'cxd4', 'Bxd4', 'Nxd4', 'Nxd4', 'Bb4'],
        overview: 'Nigel Short’s positional masterwork: White develops smoothly with Be2 and O-O, inviting Black to grab pawns on b2 at their own peril.',
        keyPlans: { white: 'Exploit Black queen hunt on b2 to dominate central files.', black: 'Grab material or play solid with ...Ne7 and ...Nc6.' }
      },
      {
        id: 'caro-tartakower-korchnoi',
        name: 'Tartakower / Korchnoi Variation (4...Nf6 5.Nxf6+ exf6)',
        eco: 'B15',
        moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nf6', 'Nxf6+', 'exf6', 'c3', 'Bd6', 'Bd3', 'O-O', 'Qc2', 'Re8+', 'Ne2', 'h5', 'O-O', 'Nd7'],
        overview: 'Viktor Korchnoi’s fighting line: Black accepts doubled f-pawns to open lines for rapid piece development and iron king safety.',
        keyPlans: { white: 'Exploit queenside 4 vs 3 pawn majority in the endgame.', black: 'Active pieces, control of the e-file, push ...h5-h4.' }
      },
      {
        id: 'caro-steinitz-modern',
        name: 'Steinitz / Modern Variation (4...Nd7)',
        eco: 'B17',
        moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Ng5', 'Ngf6', 'Bd3', 'e6', 'N1f3', 'Bd6', 'Qe2', 'h6', 'Ne4', 'Nxe4', 'Qxe4', 'Qc7'],
        overview: 'Anatoly Karpov’s favorite: Black develops 4...Nd7 to recapture with the knight on f6, avoiding doubled pawns entirely.',
        keyPlans: { white: 'Target e6 with sacrificial knight ideas (Nxe6!).', black: 'Parry White tactical traps, break with ...c5.' }
      },
      {
        id: 'caro-panov-botvinnik',
        name: 'Panov-Botvinnik Attack (3.exd5 cxd5 4.c4)',
        eco: 'B13',
        moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4', 'Nf6', 'Nc3', 'e6', 'Nf3', 'Bb4', 'cxd5', 'Nxd5', 'Bd2', 'Nc6', 'Bd3', 'O-O', 'O-O', 'Be7'],
        overview: 'White introduces an isolated queen pawn (IQP) to gain explosive piece activity and open lines against Black.',
        keyPlans: { white: 'Attack Black kingside with active minor pieces and Ne5.', black: 'Blockade d4 with knight on d5, simplify into winning endgame.' }
      },
      {
        id: 'caro-exchange',
        name: 'Exchange Variation (3.exd5 cxd5 4.Bd3)',
        eco: 'B13',
        moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'Bd3', 'Nc6', 'c3', 'Nf6', 'Bf4', 'Bg4', 'Qb3', 'Qc8', 'Nd2', 'e6', 'Ngf3', 'Be7', 'O-O', 'O-O'],
        overview: 'Bobby Fischer’s choice: White avoids theoretical mazes, setting up a solid Carlsbad pawn structure with Bd3.',
        keyPlans: { white: 'Control e5 square, launch kingside offensive with Ne5/f4.', black: 'Pin with ...Bg4, launch minority attack with ...a6 and ...b5.' }
      },
      {
        id: 'caro-two-knights',
        name: 'Two Knights Variation (2.Nc3 d5 3.Nf3)',
        eco: 'B11',
        moves: ['e4', 'c6', 'Nc3', 'd5', 'Nf3', 'Bg4', 'h3', 'Bxf3', 'Qxf3', 'e6', 'd4', 'Nf6', 'Bd3', 'dxe4', 'Nxe4', 'Qxd4'],
        overview: 'White plays fast piece development, allowing Black to pin the f3 knight with ...Bg4 and fight for dynamic equality.',
        keyPlans: { white: 'Bishop pair pressure across the open board.', black: 'Solid pawn structure, target White isolated pawns.' }
      },
      {
        id: 'caro-fantasy',
        name: 'Fantasy Variation (3.f3)',
        eco: 'B12',
        moves: ['e4', 'c6', 'd4', 'd5', 'f3', 'dxe4', 'fxe4', 'e5', 'Nf3', 'exd4', 'Bc4', 'Be6', 'Bxe6', 'fxe6', 'O-O', 'Nf6'],
        overview: 'White defiantly supports e4 with 3.f3 to build a massive pawn center, leading to ferocious tactical melees.',
        keyPlans: { white: 'Exploit open f-file and dynamic central pawn wedge.', black: 'Rip open White king diagonals with 3...e5! or 3...Qb6.' }
      },
      {
        id: 'caro-bronstein-larsen',
        name: 'Bronstein-Larsen Variation (5...gxf6)',
        eco: 'B16',
        moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nf6', 'Nxf6+', 'gxf6', 'c3', 'Bf5', 'Nf3', 'e6', 'g3', 'Nd7', 'Bg2', 'Qc7'],
        overview: 'David Bronstein and Bent Larsen’s provocative variation: Black recaptures toward the center with ...gxf6 to gain the g-file for counter-attack.',
        keyPlans: { white: 'Exploit Black shattered kingside pawn shield.', black: 'Use open g-file to launch an attack against White king.' }
      },
      {
        id: 'caro-gurgenidze',
        name: 'Gurgenidze System (3.Nc3 g6)',
        eco: 'B15',
        moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'g6', 'e5', 'Bg7', 'f4', 'h5', 'Nf3', 'Nh6', 'Be3', 'Bg4', 'Be2', 'e6', 'O-O', 'Nf5'],
        overview: 'Black transitions into a King’s Indian / Modern structure, placing the knight on the ideal f5 outpost.',
        keyPlans: { white: 'Expand on the queenside with c4 and b4.', black: 'Lock kingside with ...h5, dominate dark squares with ...Nf5.' }
      },
      {
        id: 'caro-accelerated-panov',
        name: 'Accelerated Panov (...c5 Counter)',
        eco: 'B10',
        moves: ['e4', 'c6', 'c4', 'd5', 'exd5', 'cxd5', 'cxd5', 'Nf6', 'Qa4+', 'Nbd7', 'Nc3', 'g6', 'Nf3', 'Bg7', 'Bc4', 'O-O', 'd3', 'a6', 'Qa3', 'b6'],
        overview: 'White attempts an early c4 squeeze; Black counters with hypermodern development and kingside fianchetto.',
        keyPlans: { white: 'Hold onto spatial advantage on the queenside.', black: 'Pressure White d5/d3 pawns, activate dark-squared bishop.' }
      }
    ]
  },
  {
    id: 'kings-indian-defense',
    name: "King's Indian Defense",
    side: 'black',
    ecoCode: 'E60-E99',
    category: 'Hypermodern / Closed Game',
    initialMoves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'],
    description: 'The ultimate attacking weapon against 1.d4. Black concedes the entire center to White in the opening, only to strike back with an explosive kingside assault aimed directly at checkmating White’s king.',
    historicalContext: 'Played by Bronstein and Boleslavsky, perfected by Garry Kasparov and Bobby Fischer, who famously used it to crush Soviet grandmasters in their path to the World Championship.',
    playStyle: 'Aggressive',
    difficulty: 'Advanced',
    popularity: 97,
    keyThemes: ['Locked central pawn chains (White d5 vs Black e5)', 'Legendary kingside pawn avalanche (...f5-f4, ...g5, ...g4)', 'Sacrificial piece play on the kingside', 'White queenside breakthrough vs Black mating attack race'],
    variations: [
      {
        id: 'kid-mar-del-plata',
        name: 'Classical - Mar del Plata Variation',
        eco: 'E99',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'Ne1', 'Nd7', 'Be3', 'f5', 'f3', 'f4', 'Bf2', 'g5', 'a4', 'Ng6', 'a5', 'Nf6', 'c5', 'h5'],
        overview: 'The most famous, deeply analyzed race in chess history: White attacks on the queenside with c5, while Black marches pawns to mate White king.',
        keyPlans: { white: 'Break open the c-file with c5 and invade with rooks.', black: 'Push ...g4 and ...h4, sacrifice pieces on g2/h2 to checkmate White.' }
      },
      {
        id: 'kid-samisch',
        name: 'Sämisch Variation (5.f3)',
        eco: 'E81',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O', 'Be3', 'e5', 'd5', 'c6', 'Qd2', 'cxd5', 'cxd5', 'a6', 'O-O-O', 'Nbd7', 'g4', 'b5', 'Kb1', 'Nb6'],
        overview: 'Fritz Sämisch’s solid setup: White solidifies e4 with f3, intending opposite-side castling and a kingside pawn storm.',
        keyPlans: { white: 'Attack Black king with h4, g4, Bh6.', black: 'Open the c-file, counter-attack White king with ...b5 and ...Nb6.' }
      },
      {
        id: 'kid-averbakh',
        name: 'Averbakh Variation (5.Be2 O-O 6.Bg5)',
        eco: 'E73',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Be2', 'O-O', 'Bg5', 'c5', 'd5', 'h6', 'Bf4', 'e6', 'dxe6', 'Bxe6', 'Bxd6', 'Re8', 'Nf3', 'Qa5'],
        overview: 'Yuri Averbakh’s prophylaxis: 6.Bg5 pins Black from playing the thematic 6...e5 break, forcing Black to choose ...c5 or ...h6.',
        keyPlans: { white: 'Clamp down on central dark squares, pressure d6.', black: 'Counter with ...c5 and ...Qa5, active piece counterplay.' }
      },
      {
        id: 'kid-four-pawns',
        name: 'Four Pawns Attack (5.f4)',
        eco: 'E76',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f4', 'O-O', 'Nf3', 'c5', 'd5', 'e6', 'Be2', 'exd5', 'cxd5', 'Re8', 'e5', 'dxe5', 'fxe5', 'Ng4', 'Bg5', 'Qb6'],
        overview: 'The most ambitious attempt to refute the KID: White erects a gargantuan wall with c4, d4, e4, and f4.',
        keyPlans: { white: 'Steamroll Black with central space and pawn advances.', black: 'Undermine White overextended center with ...c5 and ...Re8.' }
      },
      {
        id: 'kid-fianchetto',
        name: 'Fianchetto Variation (3.g3)',
        eco: 'E62',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nf3', 'Bg7', 'g3', 'O-O', 'Bg2', 'd6', 'O-O', 'Nc6', 'Nc3', 'e5', 'd5', 'Ne7', 'e4', 'Nd7', 'Ne1', 'f5', 'Nd3', 'Nf6'],
        overview: 'The solidest antidote to KID aggression: White fianchettoes Bg2 to neutralize Black’s attacking bishop on g7.',
        keyPlans: { white: 'Control central long diagonal, positional squeeze on queenside.', black: 'Patient kingside build-up with ...f5 and ...Nf6.' }
      },
      {
        id: 'kid-petrosian',
        name: 'Petrosian System (6.Be2 e5 7.d5 a5)',
        eco: 'E92',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'd5', 'a5', 'Bg5', 'h6', 'Bh4', 'Na6', 'Nd2', 'Qe8', 'O-O', 'Nh7'],
        overview: 'Tigran Petrosian’s prophylactic masterpiece: White closes the center with 7.d5 and pins Black with Bg5.',
        keyPlans: { white: 'Paralyze Black kingside pawn breaks with Bg5 and Nd2.', black: 'Unhook with ...Qe8, maneuver knight via a6 to c5.' }
      },
      {
        id: 'kid-gligoric',
        name: 'Gligorić System (6.Be2 e5 7.Be3)',
        eco: 'E92',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'Be3', 'Ng4', 'Bg5', 'f6', 'Bh4', 'g5', 'Bg3', 'Nh6', 'd5', 'Nd7'],
        overview: 'Svetozar Gligorić’s system keeping central tension: White plays Be3 to discourage ...Nc6 and await Black’s move.',
        keyPlans: { white: 'Maneuver around the kingside dark squares.', black: 'Drive White bishop back with ...Ng4 and ...g5, prepare ...f5.' }
      },
      {
        id: 'kid-makogonov',
        name: 'Makogonov Variation (5.h3)',
        eco: 'E71',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'h3', 'O-O', 'Bg5', 'c5', 'd5', 'e6', 'Bd3', 'exd5', 'cxd5', 'a6', 'a4', 'h6', 'Be3', 'Re8'],
        overview: 'White plays 5.h3 to deny Black’s pieces the g4 square and prepare g4-Ng3 for a kingside clamp.',
        keyPlans: { white: 'Set up g4 kingside bind, restrict Black counterplay.', black: 'Strike with ...b5 on queenside, pressure e4 down e-file.' }
      },
      {
        id: 'kid-panno',
        name: 'Panno Variation in Fianchetto',
        eco: 'E63',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nf3', 'Bg7', 'g3', 'O-O', 'Bg2', 'd6', 'O-O', 'Nc6', 'Nc3', 'a6', 'd5', 'Na5', 'Nd2', 'c5', 'Qc2', 'Rb8', 'b3', 'b5'],
        overview: 'Oscar Panno’s dynamic queenside flank response: Black prepares ...a6 and ...b5 to rip open White’s queenside.',
        keyPlans: { white: 'Fianchetto Bb2, lock down queenside files.', black: 'Raid on the queenside with ...b5 and active knight on a5.' }
      },
      {
        id: 'kid-aronin-taimanov',
        name: 'Aronin-Taimanov 9.Ne1 System',
        eco: 'E97',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'Ne1', 'Nd7', 'f3', 'f5', 'g4', 'Kh8', 'Kh1', 'Ng8'],
        overview: 'White responds to Black’s kingside attack with the radical 11.g4, locking the kingside pawns before Black can open files.',
        keyPlans: { white: 'Lock kingside files, win decisively on the queenside.', black: 'Maneuver knight to f6/h4, sacrifice a piece to blast open lines.' }
      },
      {
        id: 'kid-early-c5',
        name: 'KID Yugoslav / Benoni Hybrid (Early ...c5)',
        eco: 'E60',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'c5', 'd5', 'e6', 'O-O', 'exd5', 'cxd5', 'Bg4', 'Nd2', 'Bxe2', 'Qxe2'],
        overview: 'Black strikes immediately with ...c5, transposing into a modern Benoni structure with active bishop on g7.',
        keyPlans: { white: 'Exploit d6 weakness, push e5 when coordinated.', black: 'Queenside majority expansion with ...a6 and ...b5.' }
      },
      {
        id: 'kid-gallagher',
        name: 'Gallagher Variation (6...Nbd7 & 7...e5)',
        eco: 'E91',
        moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'Nbd7', 'O-O', 'e5', 'Be3', 'c6', 'd5', 'c5', 'Ne1', 'Ne8', 'g4', 'f5'],
        overview: 'Joe Gallagher’s flexible treatment: Black develops the knight to d7, avoiding the Mar del Plata traps and playing for ...f5.',
        keyPlans: { white: 'Expand on queenside with b4 and c5.', black: 'Break open kingside with ...f5, activate heavy pieces.' }
      }
    ]
  },
  {
    id: 'nimzo-indian-defense',
    name: 'Nimzo-Indian Defense',
    side: 'black',
    ecoCode: 'E20-E59',
    category: 'Hypermodern / Closed Game',
    initialMoves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'],
    description: 'Aron Nimzowitsch’s crowning hypermodern masterpiece. Black pins White’s knight on c3, challenging White’s control of the crucial e4 square and willingness to inflict doubled pawns on White.',
    historicalContext: 'Invented in the 1920s by Aron Nimzowitsch, it became the benchmark of grandmaster reliability, played by almost every World Champion from Alekhine and Capablanca to Fischer and Carlsen.',
    playStyle: 'Positional',
    difficulty: 'Advanced',
    popularity: 98,
    keyThemes: ['Pinning the c3 knight to control e4', 'Inflicting doubled c-pawns on White (...Bxc3+)', 'Blockading White doubled pawns on c4/c5', 'Dynamic piece coordination over dogmatic pawn occupation'],
    variations: [
      {
        id: 'nimzo-rubinstein',
        name: 'Rubinstein System (4.e3)',
        eco: 'E40',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'O-O', 'Bd3', 'd5', 'Nf3', 'c5', 'O-O', 'Nc6', 'a3', 'Bxc3', 'bxc3', 'dxc4', 'Bxc4', 'Qc7'],
        overview: 'Akiba Rubinstein’s solid classical treatment: White develops harmoniously without compromising the pawn structure.',
        keyPlans: { white: 'Utilize the bishop pair and central pawn mass (c3, d4, e3).', black: 'Target White doubled c-pawns with ...Na5 and ...b6/Ba6.' }
      },
      {
        id: 'nimzo-classical-capablanca',
        name: 'Classical / Capablanca Variation (4.Qc2)',
        eco: 'E32',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'O-O', 'a3', 'Bxc3+', 'Qxc3', 'b6', 'Bg5', 'Bb7', 'f3', 'h6', 'Bh4', 'd5', 'e3', 'Nbd7'],
        overview: 'José Raúl Capablanca’s variation: White avoids doubled pawns by developing 4.Qc2 to recapture on c3 with the queen.',
        keyPlans: { white: 'Retain the bishop pair and build a massive center with e4.', black: 'Rapid development, strike back in the center with ...d5 or ...c5.' }
      },
      {
        id: 'nimzo-samisch',
        name: 'Sämisch Variation (4.a3)',
        eco: 'E24',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'a3', 'Bxc3+', 'bxc3', 'c5', 'e3', 'b6', 'Bd3', 'Bb7', 'f3', 'Nc6', 'Ne2', 'O-O', 'e4', 'Ne8', 'Be3', 'd6'],
        overview: 'White immediately forces Black’s bishop to capture on c3, accepting doubled pawns for the bishop pair and central steamroller.',
        keyPlans: { white: 'Push e4 and f4 to launch a crushing kingside attack.', black: 'Blockade c4 with ...Na5 and ...Ba6, siege White weak c4 pawn.' }
      },
      {
        id: 'nimzo-leningrad',
        name: 'Leningrad Variation (4.Bg5)',
        eco: 'E30',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Bg5', 'c5', 'd5', 'd6', 'e3', 'Bxc3+', 'bxc3', 'e5', 'Bd3', 'Nbd7', 'Ne2', 'Qe7', 'Ng3', 'g6'],
        overview: 'White pins the f6 knight immediately. Black counters with ...c5 and locks the center, targeting White’s damaged pawns.',
        keyPlans: { white: 'Exert pressure along the pin, maneuver knight to f5.', black: 'Lock center with ...e5, create queenside fortress.' }
      },
      {
        id: 'nimzo-kasparov',
        name: 'Kasparov Variation (4.Nf3 c5 5.g3)',
        eco: 'E20',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Nf3', 'c5', 'g3', 'cxd4', 'Nxd4', 'O-O', 'Bg2', 'd5', 'cxd5', 'Nxd5', 'Qb3', 'Nc6', 'Nxc6', 'bxc6', 'O-O', 'Qa5'],
        overview: 'Garry Kasparov’s hypermodern fianchetto: White develops Bg2 to put long-range pressure on Black’s queenside.',
        keyPlans: { white: 'Control long diagonal with Bg2, target Black queenside pawns.', black: 'Active piece play, pressure c3 knight with ...Qa5 and ...Ba6.' }
      },
      {
        id: 'nimzo-hubner',
        name: 'Hübner Variation (4.e3 c5 5.Bd3 Nc6 6.Nf3 Bxc3+)',
        eco: 'E41',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'c5', 'Bd3', 'Nc6', 'Nf3', 'Bxc3+', 'bxc3', 'd6', 'e4', 'e5', 'd5', 'Ne7', 'Nh4', 'h6', 'g3', 'Bh3'],
        overview: 'Robert Hübner’s strategic masterpiece: Black voluntarily captures on c3 and locks the center with ...e5 and ...d6.',
        keyPlans: { white: 'Break the dark-square blockade with f4 or a4.', black: 'Paralyze White bishop pair on a locked board, maneuver knights.' }
      },
      {
        id: 'nimzo-fischer',
        name: 'Fischer Variation (4.e3 b6)',
        eco: 'E43',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'b6', 'Ne2', 'Ba6', 'a3', 'Be7', 'Nf4', 'd5', 'cxd5', 'Bxf1', 'Kxf1', 'exd5', 'Qf3', 'c6'],
        overview: 'Bobby Fischer’s weapon: Black immediately fianchettoes with ...b6 and ...Ba6 to target White’s c4 pawn.',
        keyPlans: { white: 'Utilize active queen on f3, maintain central space.', black: 'Pressure c4 pawn, build solid pawn wall on c6/d5.' }
      },
      {
        id: 'nimzo-romanishin',
        name: 'Romanishin System (4.g3)',
        eco: 'E20',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'g3', 'c5', 'Nf3', 'cxd4', 'Nxd4', 'O-O', 'Bg2', 'd5', 'Qb3', 'Bxc3+', 'Qxc3', 'e5', 'Nf3', 'd4'],
        overview: 'Oleg Romanishin’s fianchetto setup: Black seizes the center with ...e5 and ...d4, driving White’s pieces back.',
        keyPlans: { white: 'Undermine Black advanced center with e3 and b4.', black: 'Advance the central pawn wedge, active piece harmony.' }
      },
      {
        id: 'nimzo-milner-barry',
        name: 'Milner-Barry / Zurich Variation (4.Qc2 Nc6)',
        eco: 'E33',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'Nc6', 'Nf3', 'd6', 'Bd2', 'O-O', 'a3', 'Bxc3', 'Bxc3', 'Qe7', 'e3', 'e5', 'd5', 'Nb8'],
        overview: 'Black develops the knight to c6 to immediately strike with ...e5, leading to sharp maneuvering battles.',
        keyPlans: { white: 'Expand on the queenside with b4 and c5.', black: 'Reroute knight via d7 to c5, attack on kingside.' }
      },
      {
        id: 'nimzo-qb3',
        name: 'Nimzo 4.Qb3 Variation',
        eco: 'E22',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qb3', 'c5', 'dxc5', 'Nc6', 'Nf3', 'Ne4', 'Bd2', 'Nxd2', 'Nxd2', 'f5', 'e3', 'Bxc5', 'Be2', 'O-O'],
        overview: 'White immediately attacks the b4 bishop with the queen. Black responds with ...c5 and energetic piece jumps.',
        keyPlans: { white: 'Maintain control of central squares and c-file.', black: 'Capture the bishop on d2, utilize active knight and bishop.' }
      },
      {
        id: 'nimzo-kmoch',
        name: 'Kmoch / Delshad System (4.f3)',
        eco: 'E20',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'f3', 'd5', 'a3', 'Bxc3+', 'bxc3', 'c5', 'cxd5', 'Nxd5', 'dxc5', 'Qa5', 'e4', 'Ne7', 'Be3', 'O-O'],
        overview: 'Hans Kmoch’s radical 4.f3: White is determined to build the dream center with e4, ignoring doubled pawns.',
        keyPlans: { white: 'Dominate the center with e4, attack Black king.', black: 'Target White scattered c-pawns with ...Qa5 and ...Nd7.' }
      },
      {
        id: 'nimzo-main-d5',
        name: 'Nimzo Classical Main Line 5...d5',
        eco: 'E55',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'O-O', 'Bd3', 'd5', 'Nf3', 'c5', 'O-O', 'dxc4', 'Bxc4', 'Nbd7', 'Qe2', 'b6', 'Rd1', 'cxd4', 'exd4', 'Bxc3', 'bxc3', 'Bb7'],
        overview: 'The golden standard of classical chess: White gets the hanging pawns on c3 and d4; Black exerts diagonal pressure.',
        keyPlans: { white: 'Advance d5 to break open the position for the bishops.', black: 'Blockade and pressure the hanging pawns on c3 and d4.' }
      }
    ]
  },
  {
    id: 'slav-defense',
    name: 'Slav Defense',
    side: 'black',
    ecoCode: 'D10-D19',
    category: 'Closed Game (1.d4 d5 2.c4 c6)',
    initialMoves: ['d4', 'd5', 'c4', 'c6'],
    description: 'One of the most rock-solid, resilient defenses against 1.d4 in chess history. Black supports the d5 pawn with ...c6, ensuring that the c8 bishop is never locked behind an e6 pawn chain.',
    historicalContext: 'Played in the 19th century and analyzed by Russian and Slavic masters (Chigorin, Alapin, Alekhine). It served as the central battlefield of World Championship matches between Kasparov, Kramnik, and Anand.',
    playStyle: 'Solid',
    difficulty: 'Intermediate',
    popularity: 95,
    keyThemes: ['Solving the bad light-squared bishop problem via ...Bf5', 'Queenside expansion with ...dxc4 followed by ...b5', 'Chebanenko / Chameleon flexible setups with ...a6', 'Impenetrable pawn solidarity'],
    variations: [
      {
        id: 'slav-czech-classical',
        name: 'Classical / Czech Slav (5...Bf5)',
        eco: 'D18',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Bf5', 'e3', 'e6', 'Bxc4', 'Bb4', 'O-O', 'O-O', 'Qe2', 'Nbd7', 'e4', 'Bg6', 'Bd3', 'Bh5'],
        overview: 'The supreme classical pillar of Slav theory: Black captures on c4 to liberate the light bishop to f5 before playing ...e6.',
        keyPlans: { white: 'Push e4-e5 to gain central space and kingside attacking chances.', black: 'Pin White knight with ...Bh5, counter in center with ...e5 or ...c5.' }
      },
      {
        id: 'slav-chebanenko',
        name: 'Chebanenko / Chameleon Slav (4...a6)',
        eco: 'D15',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'a6', 'c5', 'Bf5', 'Bf4', 'Nbd7', 'h3', 'e6', 'e3', 'Be7', 'Be2', 'O-O', 'O-O', 'Qc8'],
        overview: 'Vyacheslav Chebanenko’s profound move 4...a6: Black keeps all options open and prepares queenside expansion with ...b5.',
        keyPlans: { white: 'Clamp down on queenside with c5 and b4.', black: 'Maneuver bishop to f5, prepare ...e5 central breakthrough.' }
      },
      {
        id: 'slav-schallopp',
        name: 'Schallopp Defense (4...Bf5)',
        eco: 'D12',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'e3', 'Bf5', 'Nc3', 'e6', 'Nh4', 'Bg6', 'Nxg6', 'hxg6', 'g3', 'Nbd7', 'Bg2', 'Bd6', 'O-O', 'O-O'],
        overview: 'Black develops the bishop to f5 on move 4. White hunts the bishop with Nh4, but Black uses the open h-file for counterplay.',
        keyPlans: { white: 'Leverage the bishop pair and kingside space.', black: 'Solid central bastion, use open h-file pressure.' }
      },
      {
        id: 'slav-exchange',
        name: 'Exchange Slav (3.cxd5 cxd5)',
        eco: 'D10',
        moves: ['d4', 'd5', 'c4', 'c6', 'cxd5', 'cxd5', 'Nc3', 'Nf6', 'Bf4', 'Nc6', 'e3', 'a6', 'Bd3', 'Bg4', 'f3', 'Bh5', 'Nge2', 'e6', 'O-O', 'Be7', 'Rc1', 'O-O'],
        overview: 'White liquidates tension on move 3. Black achieves immediate structural equality, creating a refined battle of maneuvers.',
        keyPlans: { white: 'Infiltrate along the c-file with Rc1 and Na4-c5.', black: 'Mirror White on the c-file, active bishop on g4/h5.' }
      },
      {
        id: 'slav-winawer-countergambit',
        name: 'Winawer Countergambit (3.Nc3 e5)',
        eco: 'D10',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nc3', 'e5', 'dxe5', 'd4', 'Ne4', 'Qa5+', 'Bd2', 'Qxe5', 'Ng3', 'Nf6', 'Nf3', 'Qd6', 'Qc2', 'Be7', 'O-O-O', 'c5'],
        overview: 'Szymon Winawer’s shock counter-gambit: Black strikes centrally with 3...e5!, creating dynamic tactical imbalances.',
        keyPlans: { white: 'Target Black d4 wedge, exploit early queen activity.', black: 'Reinforce d4 pawn with ...c5, active piece counterplay.' }
      },
      {
        id: 'slav-schlechter',
        name: 'Schlechter Slav (3...g6)',
        eco: 'D94',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'g6', 'e3', 'Bg7', 'Be2', 'O-O', 'O-O', 'Bf5', 'cxd5', 'cxd5', 'Qb3', 'b6', 'Bd2', 'Nc6'],
        overview: 'Carl Schlechter’s hybrid setup: Black combines Slav solidity with a Grünfeld-style kingside fianchetto.',
        keyPlans: { white: 'Control c-file and target Black b6/d5 weaknesses.', black: 'Solid fortress, exert long diagonal pressure with Bg7.' }
      },
      {
        id: 'slav-alapin-smyslov',
        name: 'Alapin / Smyslov Variation (5...Na6)',
        eco: 'D16',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Na6', 'e4', 'Bg4', 'Bxc4', 'e6', 'Be3', 'Nb4', 'O-O', 'Be7', 'Qe2', 'O-O'],
        overview: 'Vasily Smyslov’s knight maneuver: Black plants the knight on the glorious b4 outpost, blockading White’s queenside.',
        keyPlans: { white: 'Dominate the center with e4, push d5 break.', black: 'Anchor knight on b4, undermine White center.' }
      },
      {
        id: 'slav-geller-gambit',
        name: 'Geller Gambit (5.e4)',
        eco: 'D15',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'e4', 'b5', 'e5', 'Nd5', 'a4', 'e6', 'axb5', 'Nxc3', 'bxc3', 'cxb5', 'Ng5', 'Bb7', 'Qh5', 'g6'],
        overview: 'Efim Geller’s ferocious pawn sacrifice: White surrenders the c4 pawn to push e4-e5 and launch a savage kingside attack.',
        keyPlans: { white: 'Deliver checkmate with Qh5 and Nxh7 tactical fireworks.', black: 'Hang onto the queenside extra pawn, survive the attack.' }
      },
      {
        id: 'slav-dutch-variation',
        name: 'Dutch Variation (5.a4 e6)',
        eco: 'D19',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Bf5', 'e3', 'e6', 'Bxc4', 'Bb4', 'O-O', 'O-O', 'Qe2', 'Ne4', 'Nxe4', 'Bxe4', 'Rd1', 'Nd7'],
        overview: 'Black plants the knight on e4, neutralizing White’s e4 push and trading into a rock-solid endgame.',
        keyPlans: { white: 'Maneuver rooks to central files, push e4 when ready.', black: 'Maintain active dark bishop on b4, blockade central breaks.' }
      },
      {
        id: 'slav-breyer',
        name: 'Breyer Slav (4...Nbd7)',
        eco: 'D11',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'e3', 'Nbd7', 'Nc3', 'e6', 'Bd3', 'Bd6', 'O-O', 'O-O', 'e4', 'dxe4', 'Nxe4', 'Nxe4', 'Bxe4', 'h6'],
        overview: 'Gyula Breyer’s flexible development: Black avoids committing the c8 bishop early, transposing smoothly into a solid Semi-Slav.',
        keyPlans: { white: 'Position bishop on active diagonals, pressure kingside.', black: 'Break centrally with ...e5 or ...c5 to liquidate tension.' }
      },
      {
        id: 'slav-modern-e6',
        name: 'Modern Slav 4...e6 Transition',
        eco: 'D30',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'e3', 'e6', 'Nbd2', 'Nbd7', 'Bd3', 'Bd6', 'O-O', 'O-O', 'b3', 'b6', 'Bb2', 'Bb7', 'Ne5', 'c5'],
        overview: 'A smooth, solid transition where Black plays both ...c6 and ...e6, setting up the double-fianchetto Meran battleground.',
        keyPlans: { white: 'Plant Ne5 knight, initiate kingside attack.', black: 'Strike with ...c5, activate both bishops on long diagonals.' }
      },
      {
        id: 'slav-soultanbeieff',
        name: 'Soultanbeieff Variation (5...e6 6.Bxc4 c5)',
        eco: 'D16',
        moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'e6', 'e3', 'c5', 'Bxc4', 'Nc6', 'O-O', 'cxd4', 'exd4', 'Be7', 'Qe2', 'O-O', 'Rd1', 'Nb4'],
        overview: 'Black accepts an isolated queen pawn on White’s side and establishes a permanent blockade on d4 with ...Nb4.',
        keyPlans: { white: 'Use the IQP on d4 to launch dynamic piece assault.', black: 'Firmly blockade d4 square with knight, simplify to endgame.' }
      }
    ]
  },
  {
    id: 'scandinavian-defense',
    name: 'Scandinavian Defense',
    side: 'black',
    ecoCode: 'B01',
    category: 'Center Game (1.e4 d5)',
    initialMoves: ['e4', 'd5', 'exd5'],
    description: 'The most direct, uncompromising challenge to 1.e4. Black strikes at White’s central pawn on move one, immediately creating an open center with clear, active piece development.',
    historicalContext: 'Recorded in the 1475 Scachs d’amor poem (the oldest recorded game of modern chess). Championed by Bent Larsen and modern grandmasters Sergey Tiviakov and Ian Nepomniachtchi.',
    playStyle: 'Counterattacking',
    difficulty: 'Beginner',
    popularity: 91,
    keyThemes: ['Immediate liquidation of White e4 pawn', 'Queen maneuvers (...Qa5 or ...Qd6)', 'Fast development of the c8 bishop before ...e6', 'Caro-Kann-like solid pawn structure (c6 and e6)'],
    variations: [
      {
        id: 'scandi-main-qa5',
        name: 'Main Line (2...Qxd5 3.Nc3 Qa5)',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Nf3', 'c6', 'Bc4', 'Bf5', 'Bd2', 'e6', 'Nd5', 'Qd8', 'Nxf6+', 'Qxf6', 'Qe2', 'Nd7', 'O-O-O', 'Bg4'],
        overview: 'The classical Scandinavian: Black retreats the queen to a5 where it pins and exerts annoying pressure, followed by ...c6 and ...Bf5.',
        keyPlans: { white: 'Castle queenside, use lead in development to attack.', black: 'Solid pawn fortress (c6/e6), trade active minor pieces.' }
      },
      {
        id: 'scandi-mieses-qd6',
        name: 'Mieses-Kotrč Variation (3...Qd6)',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qd6', 'd4', 'Nf6', 'Nf3', 'a6', 'g3', 'Bg4', 'Bg2', 'Nc6', 'h3', 'Bh5', 'O-O', 'O-O-O', 'Bf4', 'Qb4'],
        overview: 'Magnus Carlsen and Sergei Tiviakov’s favorite: Black places the queen on d6, actively controlling the e5 and d4 squares.',
        keyPlans: { white: 'Develop with g3/Bg2, challenge Black queen with Bf4.', black: 'Castle queenside, pile pressure onto d4 with ...Bg4 and ...O-O-O.' }
      },
      {
        id: 'scandi-modern-nf6',
        name: 'Modern Variation (2...Nf6 3.d4 Nxd5)',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Nxd5', 'Nf3', 'g6', 'c4', 'Nb6', 'Nc3', 'Bg7', 'h3', 'O-O', 'Be3', 'Nc6', 'Qd2', 'e5', 'd5', 'Ne7'],
        overview: 'Black refuses to bring out the queen early, recapturing on d5 with the knight and fianchettoing the king’s bishop.',
        keyPlans: { white: 'Expand with c4 and d5, push kingside attack.', black: 'Hypermodern counter-strikes with ...e5 and ...f5.' }
      },
      {
        id: 'scandi-portuguese-gambit',
        name: 'Portuguese Gambit (2...Nf6 3.d4 Bg4)',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Bg4', 'f3', 'Bf5', 'Bb5+', 'Nbd7', 'c4', 'e6', 'dxe6', 'Bxe6', 'd5', 'Bf5', 'Nc3', 'Bc5', 'Qe2+', 'Kf8'],
        overview: 'A cutthroat, high-octane gambit: Black sacrifices a pawn to pin White pieces and create devastating open files.',
        keyPlans: { white: 'Consolidate the extra pawn, parry Black active pieces.', black: 'Attack White uncastled king along the e-file and diagonals.' }
      },
      {
        id: 'scandi-icelandic-gambit',
        name: 'Icelandic-Palme Gambit (2...Nf6 3.c4 e6)',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Nf6', 'c4', 'e6', 'dxe6', 'Bxe6', 'Nf3', 'Qe7', 'Qe2', 'Nc6', 'd4', 'O-O-O', 'd5', 'Qb4+', 'Nc3', 'Bg4'],
        overview: 'Black sacrifices the e6 pawn to achieve blazing development leads and early tactical mating nets.',
        keyPlans: { white: 'Survive the tactical pin on the e-file and castle safely.', black: 'Rip open the e- and d-files with ...O-O-O and ...Re8.' }
      },
      {
        id: 'scandi-qd8-retreat',
        name: 'Classical Retreat (3...Qd8)',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qd8', 'd4', 'Nf6', 'Nf3', 'c6', 'Bc4', 'Bf5', 'Ne5', 'e6', 'g4', 'Bg6', 'h4', 'Nbd7', 'Qe2', 'Bb4'],
        overview: 'Black retreats the queen back home safely to d8, playing an ultra-solid Caro-Kann pawn formation with no queen targets.',
        keyPlans: { white: 'Lash out with g4 and h4 to trap the g6 bishop.', black: 'Counter-pin with ...Bb4 and dismantle White overextended kingside.' }
      },
      {
        id: 'scandi-gubinsky-melts',
        name: 'Gubinsky-Melts Defense (3...Qe5+)',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qe5+', 'Be2', 'c6', 'Nf3', 'Qc7', 'd4', 'Bf5', 'O-O', 'e6', 'Ne5', 'Nd7', 'Bf4', 'Bd6'],
        overview: 'Black delivers check on e5 before settling the queen on c7, disturbing White’s development rhythm.',
        keyPlans: { white: 'Deploy Bf4 with tempo against the c7 queen.', black: 'Coordinate bishop on d6, castle safely kingside.' }
      },
      {
        id: 'scandi-richter-veresov-hybrid',
        name: 'Scandinavian Richter-Veresov Setup',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Bc4', 'Nc6', 'Nge2', 'Bg4', 'f3', 'Bh5', 'Bd2', 'O-O-O', 'Nd5', 'Qa4', 'b3', 'Qa3'],
        overview: 'Dynamic double-edged clash: Black develops ...Nc6 and castles queenside immediately, inviting White piece skirmishes.',
        keyPlans: { white: 'Trap Black queen with b4/Nd5.', black: 'Counter-punch in the center against White d4 pawn.' }
      },
      {
        id: 'scandi-blackburne-gambit',
        name: 'Blackburne-Kloosterboer Gambit (2...c6)',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'c6', 'dxc6', 'Nxc6', 'Nf3', 'e5', 'd3', 'Bc5', 'Be2', 'Nf6', 'O-O', 'O-O', 'Nc3', 'h6'],
        overview: 'Black offers the c6 pawn to gain rapid piece mobilization and open central files.',
        keyPlans: { white: 'Maintain material advantage, play solidly.', black: 'Use open lines and active minor pieces for initiative.' }
      },
      {
        id: 'scandi-panov-counter',
        name: 'Panov-Style 3.c4 Line',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Nf6', 'c4', 'c6', 'd4', 'cxd5', 'Nc3', 'Nc6', 'Nf3', 'Bg4', 'cxd5', 'Nxd5', 'Qb3', 'Bxf3', 'gxf3', 'e6', 'Qxb7', 'Nxd4', 'Bb5+', 'Nxb5', 'Qc6+', 'Ke7'],
        overview: 'Wild, tactical slugfest: White grabs pawns on b7, Black hunts White uncastled king in the center.',
        keyPlans: { white: 'Exploit Black stranded king on e7.', black: 'Execute devastating fork with ...Nxc2+ or deliver mating attack.' }
      },
      {
        id: 'scandi-schiller-pytel',
        name: 'Schiller-Pytel System (3...Qd6 4.d4 c6)',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qd6', 'd4', 'c6', 'Nf3', 'Nf6', 'Ne5', 'Nbd7', 'Nc4', 'Qc7', 'a4', 'g6', 'Qf3', 'Bg7', 'Bf4', 'Qd8'],
        overview: 'Black weaves a solid web with ...c6 and ...g6, controlling key central squares while resisting White’s initiative.',
        keyPlans: { white: 'Harass Black queen with Nc4 and Bf4.', black: 'Fianchetto on g7, strike centrally with ...e5.' }
      },
      {
        id: 'scandi-modern-bg4',
        name: 'Modern Scandinavian with 3...Bg4',
        eco: 'B01',
        moves: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Nxd5', 'c4', 'Nb4', 'a3', 'N4c6', 'd5', 'Ne5', 'Bf4', 'Ng6', 'Bg3', 'e5', 'Nc3', 'Bc5'],
        overview: 'Dynamic knight acrobatics: Black hops the knight to b4 and e5, establishing active piece play.',
        keyPlans: { white: 'Expand centrally with d5 and f4.', black: 'Anchor knight on g6, develop active bishop on c5.' }
      }
    ]
  },
  {
    id: 'pirc-defense',
    name: 'Pirc / Modern Defense',
    side: 'black',
    ecoCode: 'B06-B09',
    category: 'Hypermodern / Semi-Open Game',
    initialMoves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6'],
    description: 'A flexible, counter-punching hypermodern defense. Black allows White to construct a massive classical pawn center (e4 and d4), only to systematically undermine and destroy it with piece pressure and flank strikes.',
    historicalContext: 'Pioneered by Vasja Pirc in the 1930s and champion of dynamic players like Mikhail Tal, Bent Larsen, and Alexander Morozevich.',
    playStyle: 'Counterattacking',
    difficulty: 'Intermediate',
    popularity: 90,
    keyThemes: ['Hypermodern central surrender and counter-strike', 'Kingside fianchetto laser bishop on g7', 'Queenside expansion with ...c6 and ...b5', 'Sharp tactical battles against Austrian & 150 Attacks'],
    variations: [
      {
        id: 'pirc-classical',
        name: 'Classical System (4.Nf3 Bg7 5.Be2)',
        eco: 'B08',
        moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Nf3', 'Bg7', 'Be2', 'O-O', 'O-O', 'Bg4', 'Be3', 'Nc6', 'Qd2', 'e5', 'd5', 'Ne7', 'Rad1', 'Bd7'],
        overview: 'White chooses classical harmony and kingside castling. Black counters by pinning with ...Bg4 and striking centrally with ...e5.',
        keyPlans: { white: 'Gain central space with d5, control queenside.', black: 'Unleash ...f5 break on the kingside, active piece counterplay.' }
      },
      {
        id: 'pirc-austrian-attack',
        name: 'Austrian Attack (4.f4 Bg7 5.Nf3)',
        eco: 'B09',
        moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'f4', 'Bg7', 'Nf3', 'O-O', 'Bd3', 'Na6', 'O-O', 'c5', 'd5', 'Bg4', 'h3', 'Bxf3', 'Qxf3', 'Nb4'],
        overview: 'The most aggressive, bloodthirsty test of the Pirc: White erects the massive three-pawn steamroller (c2, d4, e4, f4).',
        keyPlans: { white: 'Crash through Black center with e5 pawn thrust.', black: 'Undermine White center with ...c5 and ...Na6-b4.' }
      },
      {
        id: 'pirc-150-attack',
        name: '150 Attack (4.Be3 c6 5.Qd2)',
        eco: 'B07',
        moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'c6', 'Qd2', 'b5', 'f3', 'Nbd7', 'O-O-O', 'Nb6', 'Bh6', 'Bxh6', 'Qxh6', 'Qc7', 'Kb1', 'b4'],
        overview: 'Named because even a 1500-rated player could play it: White plays Be3, Qd2, Bh6, and castles queenside to storm the kingside.',
        keyPlans: { white: 'Trade dark bishops via Bh6 and launch h4-h5 pawn rush.', black: 'Counter-attack White king with rapid ...b5-b4 queenside pawn storm.' }
      },
      {
        id: 'pirc-byrne-system',
        name: 'Byrne System (4.Bg5)',
        eco: 'B07',
        moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Bg5', 'Bg7', 'Qd2', 'h6', 'Bf4', 'g5', 'Bg3', 'Nh5', 'O-O-O', 'c6', 'Be2', 'Nxg3', 'hxg3', 'Nd7'],
        overview: 'Robert Byrne’s attacking system: White pins on g5, provoking Black kingside weaknesses before castling queenside.',
        keyPlans: { white: 'Open h-file with hxg3 and launch kingside assault.', black: 'Grab the bishop pair with ...Nxg3, counter on queenside.' }
      },
      {
        id: 'pirc-kholmov',
        name: 'Kholmov System (4.Bc4)',
        eco: 'B07',
        moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Bc4', 'Bg7', 'Qe2', 'Nc6', 'e5', 'Nxd4', 'exf6', 'Nxe2', 'fxg7', 'Rg8', 'Ngxe2', 'c6', 'Bh6', 'd5'],
        overview: 'Ratmir Kholmov’s tactical bomb: White sacrifices the queen for minor pieces to create an unstoppable advanced passed pawn on g7.',
        keyPlans: { white: 'Coordinate minor pieces to weave a mating net around Black king.', black: 'Consolidate queen material advantage and eliminate the g7 pawn.' }
      },
      {
        id: 'modern-averbakh',
        name: 'Modern Defense - Averbakh System (1...g6 2.d4 Bg7 3.c4)',
        eco: 'A42',
        moves: ['e4', 'g6', 'd4', 'Bg7', 'c4', 'd6', 'Nc3', 'Nc6', 'Be3', 'e5', 'd5', 'Nce7', 'Bd3', 'f5', 'f3', 'Nf6', 'Nge2', 'O-O', 'Qd2', 'c6'],
        overview: 'White sets up a King’s Indian-style space advantage with c4 and d4; Black responds with dynamic knight play and ...f5.',
        keyPlans: { white: 'Lock down center with d5, advance on queenside.', black: 'Break open kingside with ...f5, activate heavy pieces.' }
      },
      {
        id: 'modern-standard-c6',
        name: 'Modern Defense - Standard ...c6 & ...b5 Counter',
        eco: 'B06',
        moves: ['e4', 'g6', 'd4', 'Bg7', 'Nc3', 'c6', 'Nf3', 'd6', 'Be3', 'b5', 'Bd3', 'Nd7', 'O-O', 'Bb7', 'Re1', 'a6', 'a4', 'b4', 'Ne2', 'c5'],
        overview: 'Black plays without an early ...Nf6, immediately seizing queenside territory with ...c6 and ...b5.',
        keyPlans: { white: 'Strike at Black overextended queenside with a4.', black: 'Dominate long diagonal with Bb7, strike center with ...c5.' }
      },
      {
        id: 'modern-gurgenidze',
        name: 'Gurgenidze Variation (...c6 & ...d5)',
        eco: 'B06',
        moves: ['e4', 'g6', 'd4', 'Bg7', 'Nc3', 'c6', 'f4', 'd5', 'e5', 'h5', 'Nf3', 'Nh6', 'Be3', 'Bg4', 'Be2', 'e6', 'O-O', 'Nf5', 'Bf2', 'Bxf3', 'Bxf3', 'Bf8'],
        overview: 'Bukhuti Gurgenidze’s blockading strategy: Black locks White’s e-pawn and plants an indestructible knight on f5.',
        keyPlans: { white: 'Seek queen-side pawn breaks with c4 and b4.', black: 'Iron fortress, dominate dark squares with ...Nf5 and ...h5.' }
      },
      {
        id: 'modern-sniper',
        name: 'Modern Sniper System (...c5 Strike)',
        eco: 'B06',
        moves: ['e4', 'g6', 'd4', 'Bg7', 'Nc3', 'c5', 'dxc5', 'Bxc3+', 'bxc3', 'Qa5', 'Qd4', 'Nf6', 'Qb4', 'Qc7', 'Bd3', 'Na6', 'Bxa6', 'bxa6', 'Ne2', 'Bb7'],
        overview: 'A venomous surprise strike: Black blows up White’s c3 knight with ...Bxc3+ and attacks White shattered doubled pawns.',
        keyPlans: { white: 'Use the extra pawn and bishop pair to coordinate.', black: 'Target White weak tripled/doubled c-pawns along open files.' }
      },
      {
        id: 'pirc-bayonet-attack',
        name: 'Bayonet Attack against Pirc (g4 advance)',
        eco: 'B07',
        moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Be2', 'Bg7', 'g4', 'h6', 'h3', 'c5', 'd5', 'a6', 'a4', 'e6', 'Nf3', 'exd5', 'exd5', 'O-O'],
        overview: 'White launches an early g4 pawn thrust to intimidate Black on the kingside before castling.',
        keyPlans: { white: 'Kingside storm with g5, prevent Black piece coordination.', black: 'Rip open the center with ...e6, exploit White king in center.' }
      },
      {
        id: 'modern-tigers-setup',
        name: "Tiger's Modern Setup (with ...a6 & ...b5)",
        eco: 'B06',
        moves: ['e4', 'g6', 'd4', 'Bg7', 'Nc3', 'd6', 'Be3', 'a6', 'Qd2', 'b5', 'h4', 'h5', 'f3', 'Nd7', 'Nh3', 'Bb7', 'Ng5', 'c5', 'O-O-O', 'Rc8'],
        overview: 'Tiger Hillarp Persson’s flexible system: Black ignores kingside development to launch immediate queenside action.',
        keyPlans: { white: 'Exploit Black delayed kingside castling with d5/h5.', black: 'Sacrifice pawns for active open files on the queenside.' }
      },
      {
        id: 'pirc-quiet-be3',
        name: 'Quiet Positional System (4.Be3 c6 5.Nf3)',
        eco: 'B07',
        moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'c6', 'Nf3', 'Bg7', 'h3', 'O-O', 'a4', 'Nbd7', 'Be2', 'e5', 'O-O', 'Qe7', 'dxe5', 'dxe5'],
        overview: 'Positional White treatment keeping control without burning bridges. Black establishes solid equality with ...e5.',
        keyPlans: { white: 'Exert pressure along the d-file, exploit queenside outposts.', black: 'Anchor knight on c5, contest open central files.' }
      }
    ]
  },
  {
    id: 'dutch-defense',
    name: 'Dutch Defense',
    side: 'black',
    ecoCode: 'A80-A99',
    category: 'Flank / Asymmetrical (1.d4 f5)',
    initialMoves: ['d4', 'f5'],
    description: 'An audacious, fighting response to 1.d4. Black immediately seizes control of the vital e4 square from move one, accepting positional risk for immediate kingside attacking potential.',
    historicalContext: 'Analyzed by Elias Stein in 1789, it was adopted by World Champions Alexander Alekhine and Mikhail Botvinnik, and famously revived by Hikaru Nakamura.',
    playStyle: 'Aggressive',
    difficulty: 'Advanced',
    popularity: 88,
    keyThemes: ['Immediate fight for the e4 outpost', 'Kingside attacking batteries (...Qe8-h5, ...Rf6-h6)', 'Leningrad dynamic piece activity vs Stonewall iron wedge', 'Asymmetrical, decisive middlegames'],
    variations: [
      {
        id: 'dutch-leningrad',
        name: 'Leningrad Variation (2.g3 Nf6 3.Bg2 g6)',
        eco: 'A87',
        moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'g6', 'Nf3', 'Bg7', 'O-O', 'O-O', 'c4', 'd6', 'Nc3', 'Qe8', 'd5', 'Na6', 'Rb1', 'Bd7', 'b4', 'c5', 'dxc6', 'bxc6'],
        overview: 'The most popular modern Dutch: Black combines the f5 thrust with a King’s Indian kingside fianchetto, playing for ...e5.',
        keyPlans: { white: 'Advance on queenside with b4-b5, control central light squares.', black: 'Prepare ...e5 central breakthrough and swing queen to h5.' }
      },
      {
        id: 'dutch-stonewall',
        name: 'Stonewall Dutch (...d5 & ...c6)',
        eco: 'A93',
        moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'e6', 'Nf3', 'd5', 'O-O', 'Bd6', 'c4', 'c6', 'b3', 'Qe7', 'Bb2', 'O-O', 'Qc1', 'b6', 'Ba3', 'Bb7', 'Bxd6', 'Qxd6', 'Qa3'],
        overview: 'An unbreakable fortress: Black erects the c6-d5-e6-f5 pawn cross, locking down the e4 outpost forever.',
        keyPlans: { white: 'Trade dark bishops via Ba3, exploit hole on e5.', black: 'Plant a monster knight on e4, launch a kingside pawn storm.' }
      },
      {
        id: 'dutch-classical',
        name: 'Classical Dutch (2...e6 3...Nf6 4...Be7)',
        eco: 'A96',
        moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'e6', 'Nf3', 'Be7', 'O-O', 'O-O', 'c4', 'd6', 'Nc3', 'a5', 'Qc2', 'Nc6', 'e4', 'e5', 'dxe5', 'dxe5', 'Rd1', 'Qe8'],
        overview: 'Black develops modestly with ...Be7 and ...d6, preparing the deadly queen transfer ...Qe8-h5 for a kingside assault.',
        keyPlans: { white: 'Break the center with e4, occupy d5 outpost.', black: 'Maneuver queen to h5, swing rook to h6, deliver checkmate.' }
      },
      {
        id: 'dutch-staunton-gambit',
        name: 'Staunton Gambit (2.e4 fxe4 3.Nc3 Nf6 4.Bg5)',
        eco: 'A82',
        moves: ['d4', 'f5', 'e4', 'fxe4', 'Nc3', 'Nf6', 'Bg5', 'Nc6', 'd5', 'Ne5', 'Qd4', 'Nf7', 'Bxf6', 'exf6', 'Nxe4', 'f5', 'Ng3', 'g6', 'O-O-O', 'Bh6+'],
        overview: 'Howard Staunton’s violent attempt to refute the Dutch: White sacrifices e4 to blast open lines against Black’s exposed king.',
        keyPlans: { white: 'Crash through along the e-file and open diagonals.', black: 'Retain the bishop pair and consolidate central control.' }
      },
      {
        id: 'dutch-hopton-attack',
        name: 'Hopton Attack (2.Bg5)',
        eco: 'A80',
        moves: ['d4', 'f5', 'Bg5', 'h6', 'Bh4', 'g5', 'e3', 'Nf6', 'Bg3', 'd6', 'h4', 'Rg8', 'hxg5', 'hxg5', 'Nc3', 'e6', 'Bd3', 'Qe7', 'Qe2', 'Nc6'],
        overview: 'White pins on g5 on move 2, setting the trap 2...h6 3.Bh4 g5 4.e3! threatening 5.Qh5# checkmate.',
        keyPlans: { white: 'Exploit Black kingside pawn overextensions.', black: 'Safely parry the trap, win space with ...g5, develop solidly.' }
      },
      {
        id: 'dutch-korchnoi-attack',
        name: 'Korchnoi Attack (2.h3)',
        eco: 'A80',
        moves: ['d4', 'f5', 'h3', 'Nf6', 'g4', 'd5', 'g5', 'Ne4', 'Bf4', 'c5', 'e3', 'Nc6', 'f3', 'Nd6', 'c3', 'e6', 'Nd2', 'Be7', 'h4', 'O-O'],
        overview: 'Viktor Korchnoi’s venomous idea: White prepares an immediate g4 pawn thrust to blast open the kingside.',
        keyPlans: { white: 'Rip open the g-file and assault Black king.', black: 'Strike back centrally with ...c5 and ...d5, anchor knight on e4.' }
      },
      {
        id: 'dutch-ilyin-genevsky',
        name: 'Ilyin-Genevsky System',
        eco: 'A97',
        moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'e6', 'Nf3', 'Be7', 'O-O', 'O-O', 'c4', 'd6', 'Nc3', 'Qe8', 'Qc2', 'Qh5', 'b3', 'Nc6', 'Bb2', 'e5', 'dxe5', 'dxe5', 'Nd5', 'Bd8'],
        overview: 'Alexander Ilyin-Genevsky’s system: Black swings the queen directly to h5 to engineer the crucial ...e5 central breakthrough.',
        keyPlans: { white: 'Pressure e5 and c7 with Nd5 knight jump.', black: 'Launch full kingside attack with ...e4, ...Ng4, and ...f4.' }
      },
      {
        id: 'dutch-leningrad-carlsbad',
        name: 'Leningrad with 7...c6',
        eco: 'A88',
        moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'g6', 'Nf3', 'Bg7', 'O-O', 'O-O', 'c4', 'd6', 'Nc3', 'c6', 'd5', 'e5', 'dxe6', 'Bxe6', 'b3', 'Na6', 'Bb2', 'Qe7'],
        overview: 'Black plays ...c6 to blunt White’s d5 advance and secure a stable pawn center after ...e5.',
        keyPlans: { white: 'Target backward d6 pawn along the d-file.', black: 'Active dark bishop on e6, coordinate heavy pieces.' }
      },
      {
        id: 'dutch-modern-nc3',
        name: 'Modern 2.Nc3 System',
        eco: 'A80',
        moves: ['d4', 'f5', 'Nc3', 'Nf6', 'Bg5', 'd5', 'Bxf6', 'exf6', 'e3', 'Be6', 'Bd3', 'Qd7', 'Qf3', 'Nc6', 'a3', 'O-O-O', 'Nge2', 'g6', 'h3', 'Kb8'],
        overview: 'White avoids g3 to play Nc3 and Bg5, trading on f6 to inflict doubled f-pawns on Black.',
        keyPlans: { white: 'Pressure d5 and f5, castle queenside.', black: 'Maintain solid center, utilize bishop pair and open g-file.' }
      },
      {
        id: 'dutch-hort-antoshin',
        name: 'Hort-Antoshin System',
        eco: 'A85',
        moves: ['d4', 'f5', 'c4', 'Nf6', 'Nc3', 'd6', 'Nf3', 'c6', 'g3', 'Qc7', 'Bg2', 'e5', 'O-O', 'Be7', 'e4', 'O-O', 'exf5', 'Bxf5', 'Re1', 'Nbd7'],
        overview: 'Black prepares the ...e5 thrust with ...Qc7, ensuring rapid piece mobilization in the center.',
        keyPlans: { white: 'Exert pressure along the e-file with Re1.', black: 'Active bishops and knights occupying central outposts.' }
      },
      {
        id: 'dutch-double-fianchetto',
        name: 'Dutch Double Fianchetto Counter',
        eco: 'A81',
        moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'e6', 'Nf3', 'b6', 'O-O', 'Bb7', 'c4', 'Be7', 'Nc3', 'O-O', 'd5', 'Na6', 'Nd4', 'Nc5', 'b4', 'Nce4'],
        overview: 'Black fianchettoes the light bishop on b7 to cross-fire with White’s g2 bishop on the long diagonal.',
        keyPlans: { white: 'Lock down central light squares with d5.', black: 'Anchor knight on e4, generate kingside piece threats.' }
      },
      {
        id: 'dutch-alekhine-variation',
        name: 'Alekhine Variation (2.c4 Nf6 3.Nc3 e6 4.g3 Bb4)',
        eco: 'A85',
        moves: ['d4', 'f5', 'c4', 'Nf6', 'Nc3', 'e6', 'g3', 'Bb4', 'Bg2', 'O-O', 'Nf3', 'Bxc3+', 'bxc3', 'd6', 'O-O', 'Qe8', 'Ba3', 'Nbd7', 'Nd2', 'e5'],
        overview: 'Alexander Alekhine’s hybrid Nimzo-Dutch: Black pins on b4, damages White’s pawn structure, and strikes centrally with ...e5.',
        keyPlans: { white: 'Utilize the bishop pair and queenside space.', black: 'Blockade White doubled pawns, break with ...e5.' }
      }
    ]
  },
  {
    id: 'alekhine-defense',
    name: 'Alekhine Defense',
    side: 'black',
    ecoCode: 'B02-B05',
    category: 'Hypermodern (1.e4 Nf6)',
    initialMoves: ['e4', 'Nf6'],
    description: 'Alexander Alekhine’s radical hypermodern provocation. Black develops the knight to f6 on move one, daring White’s pawns forward to chase it, with the ultimate plan to overextend and shatter White’s center.',
    historicalContext: 'Introduced by 4th World Champion Alexander Alekhine in Budapest 1921. Bobby Fischer famously uncorked it in Game 13 of the 1972 World Championship to defeat Boris Spassky.',
    playStyle: 'Counterattacking',
    difficulty: 'Advanced',
    popularity: 86,
    keyThemes: ['Provoking White central pawn overextension', 'Undermining White pawns with ...d6 and ...c5', 'Knight maneuvering (Nf6-d5-b6)', 'Sharp tactical refutations of the Four Pawns Attack'],
    variations: [
      {
        id: 'alekhine-four-pawns',
        name: 'Four Pawns Attack (5.f4)',
        eco: 'B03',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'c4', 'Nb6', 'f4', 'dxe5', 'fxe5', 'Nc6', 'Be3', 'Bf5', 'Nc3', 'e6', 'Nf3', 'Be7', 'd5', 'exd5', 'cxd5', 'Nb4', 'Nd4', 'Bd7', 'e6', 'fxe6', 'dxe6', 'Bc6'],
        overview: 'The sharpest clash in Alekhine theory: White builds an enormous pawn armada (c4, d4, e5, f4). Black counter-attacks relentlessly against d4 and e5.',
        keyPlans: { white: 'Steamroll Black with central space and pawn advances.', black: 'Blow up White center with ...Nc6, ...Bf5, and knight jump to b4.' }
      },
      {
        id: 'alekhine-modern',
        name: 'Modern Variation (4.Nf3)',
        eco: 'B04',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'Nf3', 'g6', 'Bc4', 'Nb6', 'Bb3', 'Bg7', 'Qe2', 'Nc6', 'O-O', 'O-O', 'h3', 'a5', 'a4', 'dxe5', 'dxe5', 'Nd4', 'Nxd4', 'Qxd4', 'Re1'],
        overview: 'White rejects wild overextension, playing calm development with Nf3 and Bc4. Black responds with kingside fianchetto and central strikes.',
        keyPlans: { white: 'Maintain e5 wedge, pin Black with Re1.', black: 'Target e5 pawn with ...Nc6 and ...Bf5, trade queens into good endgame.' }
      },
      {
        id: 'alekhine-exchange',
        name: 'Exchange Variation (5.exd6)',
        eco: 'B03',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'c4', 'Nb6', 'exd6', 'cxd6', 'Nc3', 'g6', 'Be3', 'Bg7', 'Rc1', 'O-O', 'b3', 'e5', 'dxe5', 'dxe5', 'Qxd8', 'Rxd8', 'c5', 'N6d7'],
        overview: 'White liquidates the central tension to avoid overextension. Black recaptures with ...cxd6 to maintain central pawn presence.',
        keyPlans: { white: 'Queenside expansion with c5 and b4.', black: 'Active bishop on g7, counter-attack White overextended c5 pawn.' }
      },
      {
        id: 'alekhine-chase-two-pawns',
        name: 'Chase / Two Pawns Variation (4.c5)',
        eco: 'B02',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'c4', 'Nb6', 'c5', 'Nd5', 'Bc4', 'e6', 'Nc3', 'd6', 'cxd6', 'cxd6', 'Bxd5', 'exd5', 'd4', 'dxe5', 'dxe5', 'Nc6', 'Nf3', 'd4'],
        overview: 'White aggressively chases the knight with 4.c5, but compromises their pawn structure, allowing Black to strike centrally with ...d6.',
        keyPlans: { white: 'Maintain pressure against d5, develop smoothly.', black: 'Blast open the center with ...d4, active bishop and knight pair.' }
      },
      {
        id: 'alekhine-alburt',
        name: 'Alburt Variation (4.Nf3 g6)',
        eco: 'B04',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'Nf3', 'g6', 'Bc4', 'Nb6', 'Bb3', 'Bg7', 'Ng5', 'e6', 'f4', 'dxe5', 'fxe5', 'c5', 'c3', 'cxd4', 'cxd4', 'Nc6'],
        overview: 'Lev Alburt’s refined setup: Black fianchettoes on g7 and meets White’s Ng5 assault with an energetic ...c5 counter-strike.',
        keyPlans: { white: 'Kingside pressure with f4 and O-O.', black: 'Dismantle d4 with ...c5 and ...Nc6, dominate central files.' }
      },
      {
        id: 'alekhine-kengis-miles',
        name: 'Kengis / Miles Variation (4...dxe5 5.Nxe5 c6)',
        eco: 'B04',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'Nf3', 'dxe5', 'Nxe5', 'c6', 'Be2', 'Bf5', 'O-O', 'Nd7', 'Nf3', 'e6', 'c4', 'N5f6', 'Nc3', 'Bd6', 'Nh4', 'Bg6'],
        overview: 'Tony Miles’ solid setup: Black liquidates on e5 and plays ...c6, setting up a Caro-Kann style fortress where White cannot attack easily.',
        keyPlans: { white: 'Utilize space advantage and active minor pieces.', black: 'Solid defense, develop smoothly with ...Bd6 and ...O-O.' }
      },
      {
        id: 'alekhine-larsen',
        name: 'Larsen Variation (4.Nf3 dxe5 5.Nxe5 g6)',
        eco: 'B04',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'Nf3', 'dxe5', 'Nxe5', 'g6', 'Bc4', 'c6', 'O-O', 'Bg7', 'Re1', 'O-O', 'Bb3', 'Nd7', 'Nf3', 'a5', 'c4', 'N5f6'],
        overview: 'Bent Larsen’s dynamic idea: Black combines central liquidation with kingside fianchetto to neutralize White’s e5 knight.',
        keyPlans: { white: 'Expand on the queenside with c4 and a4.', black: 'Fianchetto on g7, strike on the queenside with ...a5 and ...b5.' }
      },
      {
        id: 'alekhine-scandinavian-transpo',
        name: 'Scandinavian Transposition (2.Nc3 d5)',
        eco: 'B00',
        moves: ['e4', 'Nf6', 'Nc3', 'd5', 'exd5', 'Nxd5', 'Nf3', 'g6', 'Bc4', 'Nb6', 'Bb3', 'Bg7', 'O-O', 'O-O', 'h3', 'Nc6', 'd3', 'Na5', 'Re1', 'Nxb3', 'axb3'],
        overview: 'White declines to push 2.e5, developing 2.Nc3 instead. Black immediately strikes with 2...d5, achieving comfortable equality.',
        keyPlans: { white: 'Pressure down the open a- and e-files.', black: 'Capture the b3 bishop, active bishop on g7.' }
      },
      {
        id: 'alekhine-spielmann',
        name: 'Spielmann Variation (3.Nc3)',
        eco: 'B02',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'Nc3', 'Nxc3', 'dxc3', 'd6', 'Bf4', 'Nc6', 'Nf3', 'Bg4', 'Bb5', 'a6', 'Bxc6+', 'bxc6', 'h3', 'Bh5', 'Qe2', 'e6'],
        overview: 'Rudolf Spielmann’s gambit idea: White challenges Black’s centralized knight immediately on move 3.',
        keyPlans: { white: 'Castle queenside, open lines for active piece play.', black: 'Hold onto solid pawn structure, exploit doubled c-pawns.' }
      },
      {
        id: 'alekhine-balogh',
        name: 'Balogh / Voronezh Variation',
        eco: 'B03',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'c4', 'Nb6', 'exd6', 'exd6', 'Nc3', 'Be7', 'Bd3', 'O-O', 'Nge2', 'Nc6', 'O-O', 'Bg4', 'f3', 'Bh5', 'b3', 'd5', 'c5', 'Nc8'],
        overview: 'The famed Voronezh Variation: Black recaptures with 5...exd6, leading to a classical pawn structure with sharp positional maneuvering.',
        keyPlans: { white: 'Clamp down with c5, push b4 and f4.', black: 'Reroute knight via c8 to e7, counter in the center.' }
      },
      {
        id: 'alekhine-osullivan-gambit',
        name: "O'Sullivan Gambit (3.d4 d6 4.Bc4)",
        eco: 'B02',
        moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6', 'Bc4', 'Nb6', 'Bb3', 'dxe5', 'Qh5', 'e6', 'dxe5', 'a5', 'a4', 'Na6', 'Nf3', 'Nc5', 'O-O', 'Nxb3', 'cxb3', 'Qd3'],
        overview: 'White threatens devastating attack on f7 with Qh5; Black defends coolly with 6...e6 and targets White’s bishop with ...Na6-c5.',
        keyPlans: { white: 'Kingside attacking chances along open diagonals.', black: 'Eliminate White light bishop, target weakened b3/e5 pawns.' }
      },
      {
        id: 'alekhine-mokele-mbembe',
        name: 'Mokele Mbembe Variation (2.e5 Ne4)',
        eco: 'B02',
        moves: ['e4', 'Nf6', 'e5', 'Ne4', 'd4', 'f6', 'Bd3', 'd5', 'f3', 'Ng5', 'Bxg5', 'fxg5', 'f4', 'g6', 'fxg5', 'Bg7', 'Nf3', 'O-O', 'O-O', 'c5', 'c3', 'Nc6'],
        overview: 'A bizarre, highly unorthodox variation named after the legendary Congolese cryptid. Black hops the knight to e4 to create instant chaos.',
        keyPlans: { white: 'Exploit Black damaged pawn structure and open kingside.', black: 'Active bishop on g7, undermine White with ...c5 and ...Nc6.' }
      }
    ]
  }
];
