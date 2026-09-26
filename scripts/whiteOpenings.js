export const whiteOpeningsRaw = [
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    side: 'white',
    ecoCode: 'C60-C99',
    category: 'Open Game (1.e4 e5)',
    initialMoves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    description: 'Also known as the Spanish Opening, the Ruy Lopez is one of the oldest, most prestigious, and deeply studied openings in chess history. White targets Black’s c6 knight to indirectly pressure the e5 center.',
    historicalContext: 'Named after 16th-century Spanish priest Ruy López de Segura, who analyzed it in 1561. It has been championed by almost every World Champion from Steinitz and Lasker to Kasparov, Carlsen, and Ding Liren.',
    playStyle: 'Positional',
    difficulty: 'Advanced',
    popularity: 96,
    keyThemes: ['Indirect central pressure', 'C3-d4 pawn center formation', 'Spanish bishop maneuvering (Bb5-a4-b3-c2)', 'Kingside attack with Nbd2-f1-g3'],
    variations: [
      {
        id: 'ruy-berlin',
        name: 'Berlin Defense',
        eco: 'C65',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4', 'd4', 'Nd6', 'Bxc6', 'dxc6', 'dxe5', 'Nf5', 'Qxd8+', 'Kxd8'],
        overview: 'Famous as the "Berlin Wall" with which Vladimir Kramnik dethroned Garry Kasparov in 2000. Black accepts an early queenless endgame in exchange for the bishop pair and a resilient fortress.',
        keyPlans: { white: 'Exploit kingside pawn majority 4 vs 3 and restrict Black bishops.', black: 'Maintain solid fortress, coordinate rooks from e8/d8, utilize bishop pair.' }
      },
      {
        id: 'ruy-morphy-closed',
        name: 'Morphy Defense - Closed Main Line',
        eco: 'C84',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3'],
        overview: 'The pinnacle of classical chess strategy. White prepares d4 with c3 and prevents ...Bg4 with h3, while Black prepares queenside expansion or central counterplay.',
        keyPlans: { white: 'Reroute knight Nbd2-f1-g3, maintain Spanish bishop on c2, push d4.', black: 'Choose between Chigorin (Na5), Breyer (Nb8-d7), or Zaitsev (Bb7) setups.' }
      },
      {
        id: 'ruy-marshall',
        name: 'Marshall Attack',
        eco: 'C89',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5', 'exd5', 'Nxd5', 'Nxe5', 'Nxe5', 'Rxe5', 'c6'],
        overview: 'Frank Marshall’s historic pawn sacrifice offering White a center pawn in return for ferocious, long-lasting kingside attacking piece play.',
        keyPlans: { white: 'Consolidate the extra pawn, parry Black kingside threats (Bd6, Qh4).', black: 'Unleash attacking battery with Bd6, Qh4, Bh2+, and checkmating attack.' }
      },
      {
        id: 'ruy-open',
        name: 'Open Variation',
        eco: 'C80',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Nxe4', 'd4', 'b5', 'Bb3', 'd5', 'dxe5', 'Be6'],
        overview: 'Black grabs the e4 pawn immediately instead of quiet defense, resulting in dynamic open piece play with an active d5 outpost.',
        keyPlans: { white: 'Challenge Black d5 knight with Nbd2 and c3; undermine b5 with a4.', black: 'Anchor the e4/d5 outposts, develop Bc5, and contest open central files.' }
      },
      {
        id: 'ruy-breyer',
        name: 'Breyer Variation',
        eco: 'C95',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8'],
        overview: 'Gyula Breyer’s profound knight retreat: Black recognizes the c6 knight was misplaced and reroutes it via d7 to c5 or b6.',
        keyPlans: { white: 'Push d4, occupy center, maneuver knight to g3 or e3.', black: 'Redeploy knight via d7 to f8 or c5, fianchetto bishop on b7.' }
      },
      {
        id: 'ruy-chigorin',
        name: 'Chigorin Defense',
        eco: 'C97',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Na5', 'Bc2', 'c5', 'd4', 'Qc7'],
        overview: 'Mikhail Chigorin’s classic plan: Black drives the bishop to c2 and seizes queenside space with ...c5 and ...Qc7.',
        keyPlans: { white: 'Lock center or maintain tension, maneuver Nbd2-f1-g3.', black: 'Maintain pressure on c4 and d4, develop through c6 or b7.' }
      },
      {
        id: 'ruy-zaitsev',
        name: 'Zaitsev Variation',
        eco: 'C92',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Bb7', 'd4', 'Re8'],
        overview: 'A favorite of Anatoly Karpov: Black puts the bishop on b7 to pressure White’s e4 pawn directly and prepares ...Bf8.',
        keyPlans: { white: 'Play a4 or Nbd2 to disrupt Black piece coordination.', black: 'Recycle bishop to f8, pressure e4, maintain compact central control.' }
      },
      {
        id: 'ruy-archangelsk',
        name: 'Arkhangelsk (Counter-Attack) Variation',
        eco: 'C78',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'b5', 'Bb3', 'Bb7', 'd3', 'Bc5'],
        overview: 'Dynamic and sharp counter-attacking system where Black quickly fianchettoes on b7 and activates the king’s bishop to c5.',
        keyPlans: { white: 'Strike with c3 and d4, or target b5 with a4.', black: 'Generate pressure against f2 and e4 with dual active bishops.' }
      },
      {
        id: 'ruy-exchange',
        name: 'Exchange Variation',
        eco: 'C68',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6', 'O-O', 'f6', 'd4', 'exd4', 'Nxd4', 'c5'],
        overview: 'White immediately gives up the bishop pair to inflict doubled c-pawns on Black, aiming for a favorable pawn endgame.',
        keyPlans: { white: 'Transition to a pure endgame where kingside 4 vs 3 pawns creates a passer.', black: 'Leverage the bishop pair to generate active open-board counterplay.' }
      },
      {
        id: 'ruy-schliemann',
        name: 'Schliemann (Jaenisch) Gambit',
        eco: 'C63',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'f5', 'Nc3', 'fxe4', 'Nxe4', 'd5', 'Nxe5', 'dxe4', 'Nxc6', 'Qg5'],
        overview: 'An ultra-combative counter-gambit where Black lashes out with 3...f5 on move three, leading to wild tactical complications.',
        keyPlans: { white: 'Exploit Black weakened king diagonals (Qe2, Qh5+).', black: 'Create chaotic tactical complications, attack g2, and utilize king activity.' }
      },
      {
        id: 'ruy-steinitz',
        name: 'Steinitz Defense Deferred',
        eco: 'C72',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'd6', 'c3', 'Bd7', 'd4', 'Nf6', 'O-O', 'Be7'],
        overview: 'Wilhelm Steinitz’s ultra-solid formulation with 3...a6 inserted, providing Black an escape valve and avoiding cramped lines.',
        keyPlans: { white: 'Central expansion with d4 and Re1, targeting e5.', black: 'Patient defense, unpinning on d7, counter-striking on the center.' }
      },
      {
        id: 'ruy-bird',
        name: "Bird's Defense",
        eco: 'C61',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nd4', 'Nxd4', 'exd4', 'O-O', 'c6', 'Bc4', 'Nf6'],
        overview: 'Henry Bird’s surprise weapon: Black jumps the knight into d4 immediately, accepting doubled d-pawns to dislodge White’s attack.',
        keyPlans: { white: 'Target Black advanced d4 pawn and exploit development lead.', black: 'Use d4 pawn as a wedge, follow with ...d5 to gain central space.' }
      }
    ]
  },
  {
    id: 'italian-game',
    name: 'Italian Game',
    side: 'white',
    ecoCode: 'C50-C54',
    category: 'Open Game (1.e4 e5)',
    initialMoves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    description: 'One of the oldest recorded chess openings, dating back to Polerio and Damiano. White develops the bishop to c4 targeting f7 directly, offering both romantic gambits and modern strategic maneuvering.',
    historicalContext: 'Popular in the 16th to 19th centuries, it saw a massive 21st-century resurgence in top grandmaster play as a sharp and flexible alternative to the Berlin Ruy Lopez.',
    playStyle: 'Tactical',
    difficulty: 'Beginner',
    popularity: 95,
    keyThemes: ['Pressure against the weak f7 pawn', 'Pawn center duo with c3 and d4', 'Giuoco Pianissimo slow maneuvering', 'Sacrificial lines like the Evans Gambit & Fried Liver'],
    variations: [
      {
        id: 'italian-giuoco-pianissimo',
        name: 'Giuoco Pianissimo (Quiet Italian)',
        eco: 'C50',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3', 'd6', 'O-O', 'a6', 'Bb3', 'Ba7', 'Re1', 'O-O', 'h3'],
        overview: 'The choice of modern elite grandmasters: White builds up slowly with d3, c3, h3, avoiding premature clashes to fight a deep positional middlegame.',
        keyPlans: { white: 'Maneuver Nbd2-f1-g3, prepare d4 or kingside offensive.', black: 'Maintain the strong bishop on a7, play ...h6, prepare ...d5 or ...Ne7-g6.' }
      },
      {
        id: 'italian-evans-gambit',
        name: 'Evans Gambit',
        eco: 'C51',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4', 'O-O', 'Nge7', 'cxd4', 'd5'],
        overview: 'Captain William Evans’ immortal romantic gambit: White sacrifices the b4 wing pawn to gain rapid development, central dominance, and fierce king attacks.',
        keyPlans: { white: 'Crash through the center with d4-d5 and Qb3 targeting f7.', black: 'Hold onto defensive bastions, counter in center with ...d5, trade into endgames.' }
      },
      {
        id: 'italian-two-knights-ng5',
        name: 'Two Knights Defense (4.Ng5 Main Line)',
        eco: 'C57',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Na5', 'Bb5+', 'c6', 'dxc6', 'bxc6', 'Be2', 'h6', 'Nf3', 'e4', 'Ne5', 'Bd6'],
        overview: 'The famous "fork trick" response to 3...Nf6. White directly assaults f7 with 4.Ng5, prompting Black’s brilliant counter-sacrifice 5...Na5!',
        keyPlans: { white: 'Keep the extra pawn and weather Black active initiative.', black: 'Dominate the board with superior piece activity, open diagonals, and kingside threats.' }
      },
      {
        id: 'italian-fried-liver',
        name: 'Fried Liver Attack',
        eco: 'C57',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5', 'Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3', 'Ncb4'],
        overview: 'The ultimate beginner-to-intermediate tactical nightmare. White sacrifices the knight on f7 to drag the black king into the center of the board.',
        keyPlans: { white: 'Pile up attackers on the pinned d5 knight (Nc3, O-O, Qe4, d4).', black: 'Defend the d5 knight with ...Ke6 and ...c6, survive the onslaught.' }
      },
      {
        id: 'italian-two-knights-d3',
        name: 'Two Knights Defense (Modern 4.d3)',
        eco: 'C55',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd3', 'Be7', 'O-O', 'O-O', 'Re1', 'd6', 'a4', 'Be6', 'Bxe6', 'fxe6'],
        overview: 'A civilized, solid modern treatment avoiding 4.Ng5 complications in favor of long-term strategic play.',
        keyPlans: { white: 'Clamp down on the center, gain queenside space with a4-a5.', black: 'Use the open f-file after ...fxe6, control d5, active piece counterplay.' }
      },
      {
        id: 'italian-giuoco-piano-center',
        name: 'Giuoco Piano - Classical Center Attack',
        eco: 'C53',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'd5', 'exd5', 'Nxd5'],
        overview: 'Classical Greco line: White establishes the dream pawn duo on e4 and d4, while Black strikes back immediately with ...d5.',
        keyPlans: { white: 'Maintain central space, use open c- and e-files for rooks.', black: 'Isolate or blockade White d4 pawn on d5, exchange active pieces.' }
      },
      {
        id: 'italian-traxler',
        name: 'Traxler Counter-Attack',
        eco: 'C57',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'Bc5', 'Nxf7', 'Bxf2+', 'Kxf2', 'Nxe4+', 'Kg1', 'Qh4', 'g3', 'Nxg3'],
        overview: 'Karel Traxler’s fearless counter-assault: Black completely ignores the fork on f7 to sacrifice on f2 and deliver checkmate.',
        keyPlans: { white: 'Survive Black mating attack, return material carefully to win with extra king safety.', black: 'Deliver perpetual check or checkmate along open diagonals and f-file.' }
      },
      {
        id: 'italian-hungarian',
        name: 'Hungarian Defense',
        eco: 'C50',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Be7', 'd4', 'd6', 'd5', 'Nb8', 'Bd3', 'Nf6', 'c4', 'O-O'],
        overview: 'A peaceful, rock-solid alternative avoiding all early Italian tactics. Black develops modestly to e7 and retains a solid structure.',
        keyPlans: { white: 'Expand on the queenside with c4, b4, enjoy broad space advantage.', black: 'Set up resilient kingside defense, break with ...c6 or ...f5 later.' }
      },
      {
        id: 'italian-scotch-gambit',
        name: 'Scotch Gambit Transposition',
        eco: 'C44',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd4', 'exd4', 'O-O', 'Nxe4', 'Re1', 'd5', 'Bxd5', 'Qxd5', 'Nc3', 'Qa5', 'Nxe4', 'Be6'],
        overview: 'White sacrifices the d-pawn early to rip open the e-file against Black uncastled king.',
        keyPlans: { white: 'Pin Black king knight on e4, attack along the e-file.', black: 'Castle queenside safely, mobilize dark-squared bishop, maintain piece activity.' }
      },
      {
        id: 'italian-canal',
        name: 'Canal Variation',
        eco: 'C50',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6', 'Nc3', 'd6', 'Bg5', 'h6', 'Bxf6', 'Qxf6', 'Nd5', 'Qd8'],
        overview: 'Esteban Canal’s pin system: White pins the f6 knight and plants an annoying knight outpost on d5.',
        keyPlans: { white: 'Dominate the d5 outpost, clamp down on central squares.', black: 'Leverage the bishop pair, kick the d5 knight with ...c6.' }
      },
      {
        id: 'italian-blackburne-trap',
        name: 'Blackburne Shilling Gambit Refutation',
        eco: 'C50',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nd4', 'Nxd4', 'exd4', 'O-O', 'd6', 'd3', 'Nf6', 'f4', 'Be7'],
        overview: 'How grandmasters properly refute Black’s famous trick 3...Nd4? (which traps careless 4.Nxe5? Qg5!). Simple 4.Nxd4 leaves White with huge developmental superiority.',
        keyPlans: { white: 'Expand rapidly with f4 and d3, punish Black lost tempi.', black: 'Try to defend passively and equalize.' }
      },
      {
        id: 'italian-four-knights',
        name: 'Italian Four Knights Variation',
        eco: 'C50',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'Nc3', 'Nf6', 'd3', 'h6', 'h3', 'd6', 'Be3', 'Bb6', 'Qd2'],
        overview: 'Symmetrical and calm: all four knights are developed smoothly with bishops facing off on the c-files.',
        keyPlans: { white: 'Prepare central d4 push or queenside castling with Qd2.', black: 'Maintain symmetric piece harmony, exchange dark-squared bishops on e3.' }
      }
    ]
  },
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    side: 'white',
    ecoCode: 'D06-D69',
    category: 'Closed Game (1.d4 d5)',
    initialMoves: ['d4', 'd5', 'c4'],
    description: 'The supreme classical pillar of 1.d4. White offers a flank pawn (c4) to liquidate Black’s d5 anchor and seize the central squares e4 and d4.',
    historicalContext: 'Played in the Göttingen manuscript of 1490, it gained immortal status during the 1927 Capablanca-Alekhine match and remains the bedrock of elite World Championship chess.',
    playStyle: 'Positional',
    difficulty: 'Intermediate',
    popularity: 98,
    keyThemes: ['Minority attack with b4-b5', 'Control of the central c- and d-files', 'Carlsbad pawn structure handling', 'Isolani (isolated queen pawn) dynamics'],
    variations: [
      {
        id: 'qg-accepted',
        name: "Queen's Gambit Accepted (QGA)",
        eco: 'D20',
        moves: ['d4', 'd5', 'c4', 'dxc4', 'Nf3', 'Nf6', 'e3', 'e6', 'Bxc4', 'c5', 'O-O', 'a6', 'Qe2', 'b5', 'Bb3', 'Bb7'],
        overview: 'Black accepts the pawn on move 2, not to hold it, but to quickly develop and attack White center with ...c5 and ...b5.',
        keyPlans: { white: 'Generate kingside attack with active minor pieces and e4 advance.', black: 'Fianchetto on b7, expand on queenside, pressurize White isolated d-pawn.' }
      },
      {
        id: 'qg-declined-orthodox',
        name: 'QGD - Orthodox Defense',
        eco: 'D60',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'Nbd7', 'Rc1', 'c6', 'Bd3', 'dxc4', 'Bxc4', 'Nd5'],
        overview: 'The bedrock of classical defense. Black solidifies d5 with ...e6 and neutralizes White pieces via Capablanca freeing maneuvers.',
        keyPlans: { white: 'Press down the half-open c-file, engineer e4 break.', black: 'Exchange pieces with ...Nd5, liberate the c8 bishop with ...e5.' }
      },
      {
        id: 'qg-tartakower',
        name: 'QGD - Tartakower Variation',
        eco: 'D58',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6', 'Bh4', 'b6', 'Bd3', 'Bb7', 'O-O', 'Nbd7'],
        overview: 'Savielly Tartakower’s solution to Black’s bad light-squared bishop problem: Black plays ...h6 and ...b6 to place the bishop on the long diagonal.',
        keyPlans: { white: 'Pressure the hanging pawns on c5 and d5 after cxd5 and ...c5.', black: 'Active bishop pair on b7/e7, fight for central parity.' }
      },
      {
        id: 'qg-lasker',
        name: 'QGD - Lasker Defense',
        eco: 'D56',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6', 'Bh4', 'Ne4', 'Bxe7', 'Qxe7', 'cxd5', 'Nxc3', 'bxc3', 'exd5'],
        overview: 'Emanuel Lasker’s simplifying defense: Black immediately forces piece trades on e4, reducing White attacking momentum.',
        keyPlans: { white: 'Use the queenside pawn majority and c-file pressure.', black: 'Rely on simplified position and easy piece coordination.' }
      },
      {
        id: 'qg-exchange',
        name: 'QGD - Exchange Variation (Carlsbad)',
        eco: 'D35',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5', 'Bg5', 'c6', 'e3', 'Be7', 'Bd3', 'Nbd7', 'Qc2', 'O-O', 'Nge2', 'Re8', 'O-O', 'Nf8'],
        overview: 'White fixes the pawn structure into the famed Carlsbad formation, allowing White to launch the classical minority attack with b4-b5.',
        keyPlans: { white: 'Launch minority attack (a4, b4, b5) to create weakness on c6.', black: 'Build kingside counterplay with ...Nf8-g6, ...Ne4, and f5.' }
      },
      {
        id: 'qg-cambridge-springs',
        name: 'Cambridge Springs Defense',
        eco: 'D52',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Nbd7', 'Nf3', 'c6', 'e3', 'Qa5', 'Nd2', 'Bb4', 'Qc2', 'O-O'],
        overview: 'A sharp counter-pin: Black develops the queen to a5, pinning White’s c3 knight and setting nasty tactical traps on White’s g5 bishop.',
        keyPlans: { white: 'Safeguard the g5 bishop, unpin c3 knight, push e4.', black: 'Exploit tactical pins on the c-file and diagonal, break with ...e5.' }
      },
      {
        id: 'semi-slav-meran',
        name: 'Semi-Slav Defense - Meran Variation',
        eco: 'D45',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'c6', 'e3', 'Nbd7', 'Bd3', 'dxc4', 'Bxc4', 'b5', 'Bd3', 'a6', 'e4', 'c5', 'e5', 'cxd4', 'Nxb5', 'axb5', 'exf6', 'gxf6'],
        overview: 'One of the sharpest, most thoroughly analyzed complexes in all of chess theory, played in numerous World Championship games.',
        keyPlans: { white: 'Leverage central initiative, target Black fractured kingside pawns.', black: 'Unleash bishop pair on b7/c5, utilize monster queenside pawn mass.' }
      },
      {
        id: 'semi-slav-botvinnik',
        name: 'Semi-Slav Defense - Botvinnik System',
        eco: 'D44',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'c6', 'Bg5', 'dxc4', 'e4', 'b5', 'e5', 'h6', 'Bh4', 'g5', 'Nxg5', 'hxg5', 'Bxg5', 'Nbd7'],
        overview: 'Mikhail Botvinnik’s nuclear tactical variation: White pins and attacks, Black counters with an insane kingside pawn storm.',
        keyPlans: { white: 'Regain material with interest while Black king is stranded in center.', black: 'Rely on monster c-pawn, piece activity, and tactical complications.' }
      },
      {
        id: 'semi-slav-moscow',
        name: 'Semi-Slav Defense - Moscow Variation',
        eco: 'D43',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'c6', 'Bg5', 'h6', 'Bxf6', 'Qxf6', 'e3', 'Nd7', 'Bd3', 'g6', 'O-O', 'Bg7'],
        overview: 'A more solid, modern alternative to the Botvinnik: Black forces White to surrender the bishop pair with 5...h6.',
        keyPlans: { white: 'Occupy the center, restrict Black bishops, push e4.', black: 'Nutrize White space advantage with the bishop pair and ...dxc4 followed by ...e5.' }
      },
      {
        id: 'albin-countergambit',
        name: 'Albin Countergambit',
        eco: 'D08',
        moves: ['d4', 'd5', 'c4', 'e5', 'dxe5', 'd4', 'Nf3', 'Nc6', 'a3', 'Bg4', 'Nbd2', 'Qe7'],
        overview: 'Adolf Albin’s combative gambit: Black sacrifices a pawn on e5 to plant an annoying wedge on d4 that paralyzes White natural development.',
        keyPlans: { white: 'Neutralize the d4 wedge, consolidate extra pawn with g3/Bg2.', black: 'Generate swift kingside attacks and exploit underpromotion traps.' }
      },
      {
        id: 'chigorin-defense',
        name: 'Chigorin Defense (1.d4 d5 2.c4 Nc6)',
        eco: 'D07',
        moves: ['d4', 'd5', 'c4', 'Nc6', 'Nf3', 'Bg4', 'cxd5', 'Bxf3', 'gxf3', 'Qxd5', 'e3', 'e5', 'Nc3', 'Bb4', 'Bd2', 'Bxc3', 'bxc3'],
        overview: 'Mikhail Chigorin’s radical rejection of classical pawn solidarity in favor of rapid piece pressure against White center.',
        keyPlans: { white: 'Dominate with the massive pawn center and bishop pair.', black: 'Target White overextended center with rapid pieces and ...exd4.' }
      },
      {
        id: 'qg-catalan-setup',
        name: "Queen's Gambit - Fianchetto Setup",
        eco: 'E00',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nf3', 'Nf6', 'g3', 'Be7', 'Bg2', 'O-O', 'O-O', 'c6', 'Qc2', 'b6', 'b3', 'Bb7'],
        overview: 'White opts for a Catalan-style g3/Bg2 kingside fianchetto within the Queen’s Gambit structure to apply long-range pressure.',
        keyPlans: { white: 'Control the long diagonal, prepare e4 central strike.', black: 'Build solid Slav-like fortress with ...c6, fianchetto on b7.' }
      }
    ]
  },
  {
    id: 'english-opening',
    name: 'English Opening',
    side: 'white',
    ecoCode: 'A10-A39',
    category: 'Flank Opening (1.c4)',
    initialMoves: ['c4'],
    description: 'A deeply subtle, hypermodern flank opening. White stakes a claim on the critical d5 square without committing the central d- or e-pawns on move one.',
    historicalContext: 'Popularized by English master Howard Staunton in the 1843 match against Saint-Amant. Extensively refined by Botvinnik, Petrosian, and Kasparov.',
    playStyle: 'Positional',
    difficulty: 'Intermediate',
    popularity: 92,
    keyThemes: ['Hypermodern central restraint', 'Laser pressure along the c4-g2 diagonal', 'Hedgehog and reversed Sicilian pawn structures', 'Flexible transpositional repertoire'],
    variations: [
      {
        id: 'english-reversed-sicilian',
        name: 'Reversed Sicilian (1.c4 e5)',
        eco: 'A20',
        moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3', 'Bb4', 'Bg2', 'O-O', 'O-O', 'e4', 'Ng5', 'Bxc3', 'bxc3', 'Re8'],
        overview: 'White plays a Sicilian Defense with an extra tempo! Black controls e5 while White exerts flank pressure and fianchettoes the light bishop.',
        keyPlans: { white: 'Pressure Black e4 pawn, utilize the open b-file and bishop pair.', black: 'Support e4 outpost, attack White doubled c-pawns.' }
      },
      {
        id: 'english-symmetrical-four-knights',
        name: 'Symmetrical English - Four Knights',
        eco: 'A35',
        moves: ['c4', 'c5', 'Nc3', 'Nc6', 'Nf3', 'Nf6', 'd4', 'cxd4', 'Nxd4', 'e6', 'g3', 'Qb6', 'Nb3', 'Ne5', 'e4', 'Bb4'],
        overview: 'Black mirrors White with 1...c5. Both sides develop knights symmetrically before White opens the center with d4.',
        keyPlans: { white: 'Control central d5 and f5 squares, leverage spatial dominance.', black: 'Counter-attack White c4 pawn and pin the c3 knight.' }
      },
      {
        id: 'english-botvinnik',
        name: 'Botvinnik System',
        eco: 'A26',
        moves: ['c4', 'e5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'd3', 'd6', 'e4', 'Nge7', 'Nge2', 'O-O', 'O-O', 'f5'],
        overview: 'Mikhail Botvinnik’s iron grip setup: White constructs a pawn triangle c4-d3-e4, locking down the d5 outpost eternally.',
        keyPlans: { white: 'Plant a piece on d5, launch a queenside minority attack or kingside f4 push.', black: 'Strike with ...f5 on the kingside, break White center.' }
      },
      {
        id: 'english-hedgehog',
        name: 'Hedgehog System',
        eco: 'A30',
        moves: ['c4', 'c5', 'Nf3', 'Nf6', 'g3', 'b6', 'Bg2', 'Bb7', 'O-O', 'e6', 'Nc3', 'Be7', 'd4', 'cxd4', 'Qxd4', 'd6', 'Rd1', 'a6', 'b3', 'Nbd7'],
        overview: 'Black curls up like a spiky hedgehog with pawns on a6, b6, d6, e6. Any overextension by White is punished by explosive counter-strikes ...b5 or ...d5.',
        keyPlans: { white: 'Restrain Black breaks with a4, control d5 square.', black: 'Coil behind the 6th rank, strike at the right moment with ...b5 or ...d5.' }
      },
      {
        id: 'english-mikenas-carls',
        name: 'Mikenas-Carls Variation',
        eco: 'A18',
        moves: ['c4', 'Nf6', 'Nc3', 'e6', 'e4', 'd5', 'e5', 'd4', 'exf6', 'dxc3', 'bxc3', 'Qxf6', 'd4', 'b6', 'Nf3', 'Bb7'],
        overview: 'White boldly plays 3.e4 against Black’s Anglo-Indian setup, forcing an immediate sharp pawn collision in the center.',
        keyPlans: { white: 'Dominant central pawns on d4 and c3, kingside attack.', black: 'Fianchetto on b7, pressure White weakened queenside pawns.' }
      },
      {
        id: 'english-double-fianchetto',
        name: 'Double Fianchetto Variation',
        eco: 'A15',
        moves: ['c4', 'Nf6', 'Nf3', 'g6', 'b3', 'Bg7', 'Bb2', 'O-O', 'g3', 'd6', 'Bg2', 'e5', 'O-O', 'c6', 'd3', 'Nbd7'],
        overview: 'A purely positional masterclass: White develops both bishops to g2 and b2 to cross-fire across the whole board.',
        keyPlans: { white: 'Control both long diagonals, squeeze Black central expansion.', black: 'Anchor e5 pawn, prepare central thrust ...d5.' }
      },
      {
        id: 'english-agincourt',
        name: 'Agincourt Defense',
        eco: 'A13',
        moves: ['c4', 'e6', 'Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'Be7', 'O-O', 'O-O', 'b3', 'c5', 'Bb2', 'Nc6', 'e3', 'b6'],
        overview: 'Black plays solidly like a Queen’s Gambit Declined, leading to classical hanging-pawn or Catalan-style middlegames.',
        keyPlans: { white: 'Undermine Black center with cxd5 and d4, active diagonal bishops.', black: 'Build resilient central bastion, counter with ...b6 and ...Bb7.' }
      },
      {
        id: 'english-anglo-scandinavian',
        name: 'Anglo-Scandinavian Defense',
        eco: 'A10',
        moves: ['c4', 'd5', 'cxd5', 'Nf6', 'e4', 'c6', 'dxc6', 'Nxc6', 'Nc3', 'e5', 'Nf3', 'Bc5', 'Bb5', 'O-O'],
        overview: 'Black strikes immediately in the center with 1...d5, offering a gambit pawn for rapid piece activation.',
        keyPlans: { white: 'Retain extra pawn, castle quickly, neutralize Black d4 outpost.', black: 'Fast development, open lines against White e4 pawn.' }
      },
      {
        id: 'english-rubinstein',
        name: 'Rubinstein Symmetrical System',
        eco: 'A34',
        moves: ['c4', 'c5', 'Nc3', 'Nf6', 'g3', 'd5', 'cxd5', 'Nxd5', 'Bg2', 'Nc7', 'Nf3', 'Nc6', 'O-O', 'e5', 'd3', 'Be7'],
        overview: 'Akiba Rubinstein’s retreat 4...Nc7: Black controls the key d4 square and prepares a solid Maroczy Bind formation.',
        keyPlans: { white: 'Break the bind with a3 and b4, active knight maneuvers.', black: 'Maintain iron grip on d4 with ...e5 and ...c5.' }
      },
      {
        id: 'english-reversed-dragon',
        name: 'Reversed Dragon Setup',
        eco: 'A22',
        moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3', 'd5', 'cxd5', 'Nxd5', 'Bg2', 'Nb6', 'O-O', 'Be7', 'a3', 'O-O', 'b4'],
        overview: 'White plays a Dragon Sicilian with colors reversed and an extra tempo, launching a fast queenside pawn storm with a3 and b4.',
        keyPlans: { white: 'Roll queenside pawns with b4-b5, dominate long diagonal with Bg2.', black: 'Defend queenside, create counterplay along central d- and e-files.' }
      },
      {
        id: 'english-anglo-dutch',
        name: 'Anglo-Dutch Defense',
        eco: 'A10',
        moves: ['c4', 'f5', 'Nc3', 'Nf6', 'g3', 'g6', 'Bg2', 'Bg7', 'd3', 'O-O', 'e4', 'd6', 'Nge2', 'e5', 'O-O', 'Nc6'],
        overview: 'Black adopts a Dutch Defense structure against 1.c4, creating an unbalanced battleground across the whole board.',
        keyPlans: { white: 'Exploit weaknesses along the open diagonals and target e6/d5.', black: 'Launch kingside attack with ...f4 or ...Qe8-h5.' }
      },
      {
        id: 'english-kings-fianchetto',
        name: "King's Fianchetto English",
        eco: 'A16',
        moves: ['c4', 'Nf6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'g3', 'g6', 'Bg2', 'Nb6', 'd3', 'Bg7', 'Be3', 'O-O', 'Qd2', 'Nc6'],
        overview: 'White combines the Bg2 fianchetto with Be3 and Qd2, preparing Bh6 to exchange Black’s key defending bishop.',
        keyPlans: { white: 'Trade dark bishops via Bh6 and launch h4-h5 pawn rush.', black: 'Counter centrally with ...e5 or ...Nd4.' }
      }
    ]
  },
  {
    id: 'scotch-game',
    name: 'Scotch Game',
    side: 'white',
    ecoCode: 'C45',
    category: 'Open Game (1.e4 e5)',
    initialMoves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'],
    description: 'An aggressive, direct opening where White blows open the center on move 3. Garry Kasparov famously revived it to win the 1990 World Championship match.',
    historicalContext: 'Played in an 1824 correspondence match between Edinburgh and London. Reached legendary prominence when Garry Kasparov used it as a lethal secret weapon against Anatoly Karpov.',
    playStyle: 'Tactical',
    difficulty: 'Intermediate',
    popularity: 90,
    keyThemes: ['Immediate central liquidation', 'Open lines for rapid piece activation', 'Active d4 knight presence', 'Mieses variation sharp pawn endgames'],
    variations: [
      {
        id: 'scotch-classical',
        name: 'Classical Variation (4...Bc5)',
        eco: 'C45',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5', 'Be3', 'Qf6', 'c3', 'Nge7', 'Bc4', 'O-O', 'O-O', 'Bb6'],
        overview: 'Black immediately targets White’s centralized knight on d4 with bishop and queen, creating fierce tactical tension.',
        keyPlans: { white: 'Maintain d4 knight with Be3 and c3, develop f4 kingside space.', black: 'Maintain pin on d4, break with ...d5 to contest the center.' }
      },
      {
        id: 'scotch-schmidt',
        name: 'Schmidt Variation (4...Nf6)',
        eco: 'C45',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nxc6', 'bxc6', 'e5', 'Qe7', 'Qe2', 'Nd5', 'c4', 'Ba6'],
        overview: 'Black attacks White’s e4 pawn directly, prompting White to capture on c6 and push e5.',
        keyPlans: { white: 'Kick Black knight with c4, utilize kingside space.', black: 'Pin White c4 pawn with ...Ba6, undermine e5 with ...d6 or ...f6.' }
      },
      {
        id: 'scotch-mieses',
        name: 'Mieses Variation',
        eco: 'C45',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nxc6', 'bxc6', 'e5', 'Qe7', 'Qe2', 'Nd5', 'c4', 'Nb6', 'Nc3', 'Qe6', 'Qe4', 'g6'],
        overview: 'The absolute main line of modern Scotch theory, tested thoroughly at the highest levels by Kasparov and Kramnik.',
        keyPlans: { white: 'Coordinate f4, Bd3, and O-O to pressure Black position.', black: 'Fianchetto with ...Bg7, attack e5 pawn with ...Ba6 and ...O-O-O.' }
      },
      {
        id: 'scotch-potter',
        name: 'Potter Variation (5.Nb3)',
        eco: 'C45',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5', 'Nb3', 'Bb6', 'Nc3', 'Nf6', 'Qe2', 'O-O', 'Be3', 'Re8'],
        overview: 'White avoids defending d4 by retreating the knight to b3, gaining a tempo on Black’s bishop.',
        keyPlans: { white: 'Castle queenside and launch kingside pawn storm with f3 and g4.', black: 'Pressure e4 down the e-file, strike back with ...d5.' }
      },
      {
        id: 'scotch-steinitz',
        name: 'Steinitz Variation (4...Qh4)',
        eco: 'C45',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Qh4', 'Nc3', 'Bb4', 'Be2', 'Qxe4', 'Nb5', 'Bxc3+', 'bxc3', 'Kd8'],
        overview: 'Steinitz’s daring queen raid grabbing the e4 pawn on move 4, forcing Black king to surrender castling rights for material.',
        keyPlans: { white: 'Exploit Black stranded king on d8 with dynamic piece sacrifices.', black: 'Consolidate the extra pawn, evacuate king to safety.' }
      },
      {
        id: 'scotch-gambit',
        name: 'Scotch Gambit (4.Bc4)',
        eco: 'C44',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Bc5', 'c3', 'Nf6', 'e5', 'd5', 'Bb5', 'Ne4', 'cxd4', 'Bb6'],
        overview: 'White refuses to recapture on d4 immediately, opting instead for maximum piece development targeting f7.',
        keyPlans: { white: 'Maintain tactical initiative and pressure against Black uncastled king.', black: 'Counter-strike in center with ...d5, secure e4 knight outpost.' }
      },
      {
        id: 'scotch-goring-gambit',
        name: 'Göring Gambit',
        eco: 'C44',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'c3', 'dxc3', 'Nxc3', 'Bb4', 'Bc4', 'd6', 'O-O', 'Bxc3', 'bxc3', 'Nf6'],
        overview: 'Carl Göring’s bold pawn sacrifice for rapid development and dangerous open diagonals.',
        keyPlans: { white: 'Attack f7 and g7 along open diagonals with Qb3 and Ba3.', black: 'Return one pawn to achieve safe development and piece trades.' }
      },
      {
        id: 'scotch-blackburne-attack',
        name: 'Blackburne Attack (5.Be3)',
        eco: 'C45',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5', 'Be3', 'Qf6', 'c3', 'Nge7', 'g3', 'd5', 'Bg2', 'dxe4'],
        overview: 'White fianchettoes the light-squared bishop with g3/Bg2 to exert indirect pressure on the center.',
        keyPlans: { white: 'Target Black e4 pawn and open center with Bg2.', black: 'Counter dynamically with ...d5 and active knight jumps.' }
      },
      {
        id: 'scotch-tartakower',
        name: 'Tartakower Variation (4...Nf6 5.Nxc6 bxc6 6.Nd2)',
        eco: 'C45',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nxc6', 'bxc6', 'Nd2', 'd5', 'exd5', 'cxd5', 'Bb5+', 'Bd7'],
        overview: 'A quiet, strategic antidote to Mieses madness: White protects e4 with 6.Nd2 rather than advancing e5.',
        keyPlans: { white: 'Simplification into a solid middlegame with superior pawn structure.', black: 'Control central files with active rooks and bishops.' }
      },
      {
        id: 'scotch-four-knights',
        name: 'Scotch Four Knights',
        eco: 'C47',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'd4', 'exd4', 'Nxd4', 'Bb4', 'Nxc6', 'bxc6', 'Bd3', 'd5', 'exd5', 'cxd5'],
        overview: 'The convergence of Four Knights and Scotch: open center with balanced, sharp tactical options.',
        keyPlans: { white: 'Castle kingside, pin with Bg5, attack Black isolated c-pawns.', black: 'Dominate d5, use the bishop pair and open b-file.' }
      },
      {
        id: 'scotch-malaniuk',
        name: 'Malaniuk Variation (4...Bb4+)',
        eco: 'C45',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bb4+', 'c3', 'Be7', 'Bc4', 'Nf6', 'O-O', 'O-O', 'Re1', 'd6'],
        overview: 'Black checks on b4 to force White to commit c3, hindering the knight from using its natural outpost.',
        keyPlans: { white: 'Build a solid center with d4, e4, f4.', black: 'Hold a tight defensive perimeter, strike with ...d5.' }
      },
      {
        id: 'scotch-haxo-gambit',
        name: 'Haxo Gambit (4.Bc4 Bc5 5.O-O)',
        eco: 'C44',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Bc5', 'O-O', 'd6', 'c3', 'Bg4', 'Qb3', 'Bxf3', 'Bxf7+', 'Kf8'],
        overview: 'A wild attacking line where White ignores the d4 pawn to castle and launch an immediate assault on f7.',
        keyPlans: { white: 'Win back material with decisive king assault.', black: 'Defend carefully, trap White queen, counter-strike.' }
      }
    ]
  },
  {
    id: 'london-system',
    name: 'London System',
    side: 'white',
    ecoCode: 'D02',
    category: 'Closed Game (1.d4)',
    initialMoves: ['d4', 'd5', 'Bf4'],
    description: 'The premier universal system for White. White develops the dark-squared bishop outside the pawn chain before locking the center with e3 and c3, creating an impenetrable pyramid structure.',
    historicalContext: 'Originated in the 1922 London tournament. Once considered dry, it was transformed into a deadly modern weapon by Magnus Carlsen, Ding Liren, and Gata Kamsky.',
    playStyle: 'Solid',
    difficulty: 'Beginner',
    popularity: 97,
    keyThemes: ['Pawn pyramid (c3-d4-e3)', 'Development of dark bishop to f4 outside pawn chain', 'Ne5 knight outpost followed by f4', 'Greek Gift sacrifice patterns on h7'],
    variations: [
      {
        id: 'london-classical',
        name: 'Classical London System',
        eco: 'D02',
        moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'Bd6', 'Bg3', 'O-O', 'Nbd2', 'c5', 'c3', 'Nc6', 'Bd3', 'b6', 'Ne5', 'Bb7', 'f4'],
        overview: 'The golden standard: White constructs the iron pawn triangle, plants the knight on e5, and reinforces with f4 to mount a kingside assault.',
        keyPlans: { white: 'Establish Ne5 outpost, slide queen to f3/h3, launch kingside attack.', black: 'Counter-attack on the queenside with ...c4 and ...b5, challenge e5.' }
      },
      {
        id: 'london-jobava',
        name: 'Jobava London (2.Nc3 & 3.Bf4)',
        eco: 'D00',
        moves: ['d4', 'd5', 'Nc3', 'Nf6', 'Bf4', 'a6', 'e3', 'c5', 'Nf3', 'Nc6', 'dxc5', 'e6', 'Na4', 'Bxc5', 'Nxc5', 'Qa5+', 'c3', 'Qxc5'],
        overview: 'Baadur Jobava’s revolutionary dynamic system: White develops the knight to c3 to support an early Nb5 or e4 thrust.',
        keyPlans: { white: 'Threaten Nb5 invading c7, expand rapidly with e4.', black: 'Play ...a6 to prevent Nb5, strike with ...c5 and ...Qb6.' }
      },
      {
        id: 'london-vs-kid',
        name: "London vs King's Indian Setup",
        eco: 'A48',
        moves: ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'Nf3', 'O-O', 'Be2', 'd6', 'h3', 'Nbd7', 'O-O', 'Qe8', 'c4', 'e5', 'Bh2'],
        overview: 'How White meets Black’s kingside fianchetto: White retreats the bishop to h2 when challenged by ...e5, maintaining diagonal pressure.',
        keyPlans: { white: 'Advance queenside pawns c4/b4, restrain Black kingside expansion.', black: 'Prepare ...e5 and ...e4, launch kingside pawn storm.' }
      },
      {
        id: 'london-steinitz-counter',
        name: 'London vs Steinitz Counter (...Qb6)',
        eco: 'D02',
        moves: ['d4', 'd5', 'Bf4', 'c5', 'e3', 'Nc6', 'c3', 'Qb6', 'Qb3', 'c4', 'Qc2', 'Bf5', 'Qxf5', 'Qxb2', 'Qxd5', 'Qxa1'],
        overview: 'A venomous tactical line where Black attacks b2 with ...Qb6 and sacrifices the bishop on f5 for the a1 rook.',
        keyPlans: { white: 'Trap Black stranded queen in the corner on a1.', black: 'Survive White counter-mating threats and escape with extra material.' }
      },
      {
        id: 'london-early-c5',
        name: 'London vs Early ...c5 Challenge',
        eco: 'D02',
        moves: ['d4', 'd5', 'Bf4', 'c5', 'e3', 'Nc6', 'c3', 'Nf6', 'Nd2', 'cxd4', 'exd4', 'Bf5', 'Ngf3', 'e6', 'Qb3', 'Qc8'],
        overview: 'Black challenges the d4 center on move 2. White recaptures with exd4, opening the e-file for piece pressure.',
        keyPlans: { white: 'Infiltrate the queenside with Qb3, control e5 square.', black: 'Anchor bishop on f5, balance control of the c-file.' }
      },
      {
        id: 'london-anti-london-bf5',
        name: 'Anti-London Symmetrical (3...Bf5)',
        eco: 'D02',
        moves: ['d4', 'd5', 'Bf4', 'Bf5', 'e3', 'e6', 'c4', 'c6', 'Nc3', 'Bd6', 'Bxd6', 'Qxd6', 'Nf3', 'Nd7', 'Be2', 'Ngf6'],
        overview: 'Black mirrors White’s bishop placement outside the pawn chain to neutralize White’s positional advantage.',
        keyPlans: { white: 'Trade bishops and exploit Black slight queenside weaknesses.', black: 'Maintain solid symmetrical defense, equalize comfortably.' }
      },
      {
        id: 'london-vs-dutch',
        name: 'London vs Dutch Setup (1...f5)',
        eco: 'A80',
        moves: ['d4', 'f5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'b6', 'Bd3', 'Bb7', 'Nbd2', 'Be7', 'h3', 'O-O', 'g4', 'fxg4', 'hxg4', 'Nxg4', 'Bxh7+'],
        overview: 'White crushes the Dutch with the devastating g4 kingside breakthrough and bishop sacrifice on h7.',
        keyPlans: { white: 'Sacrifice on h7 to execute decisive mating net.', black: 'Defend kingside, try to counter along f-file.' }
      },
      {
        id: 'london-accelerated',
        name: 'Accelerated London System',
        eco: 'D00',
        moves: ['d4', 'd5', 'Bf4', 'c5', 'e3', 'Qb6', 'Nc3', 'e6', 'Nb5', 'Na6', 'a4', 'c4', 'c3', 'Bd7', 'b3', 'Bxb5', 'axb5', 'Qxb5'],
        overview: 'White meets ...Qb6 with the daring 4.Nc3!, threatening Nb5-c7+ and sacrificing the b2 pawn for huge initiative.',
        keyPlans: { white: 'Invade c7 with knight, break open the a- and b-files.', black: 'Hold c7, defend against White piece swarm.' }
      },
      {
        id: 'london-endgame-squeeze',
        name: 'London Queen Exchange Line',
        eco: 'D02',
        moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6', 'Nd2', 'Qb6', 'Qb3', 'c4', 'Qc2', 'g6', 'e4', 'Nxe4', 'Nxe4', 'dxe4', 'Bxc4', 'Bf5'],
        overview: 'White breaks centrally with e4, converting into a favorable simplified middlegame with superior central pawns.',
        keyPlans: { white: 'Target Black e4 pawn and exploit loose dark squares.', black: 'Counter-attack c2 with ...Bf5 and rook on c8.' }
      },
      {
        id: 'london-vs-grunfeld',
        name: 'London vs Grünfeld Setup',
        eco: 'D02',
        moves: ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'Nf3', 'O-O', 'Be2', 'd5', 'O-O', 'c5', 'c3', 'Nc6', 'Nbd2', 'b6', 'Ne5', 'Bb7'],
        overview: 'When Black plays ...d5 alongside ...g6, White plants the knight on e5 and clamps down on the center.',
        keyPlans: { white: 'Maintain e5 anchor, launch kingside attack with h4-h5.', black: 'Pressurize d4 with ...cxd4, activate bishop on the long diagonal.' }
      },
      {
        id: 'london-greek-gift',
        name: 'London Greek Gift Attack Line',
        eco: 'D02',
        moves: ['d4', 'd5', 'Bf4', 'e6', 'e3', 'Nf6', 'Bd3', 'Bd6', 'Bg3', 'O-O', 'Nf3', 'c5', 'c3', 'Nc6', 'Nbd2', 'Qe7', 'Ne5', 'Nd7', 'f4', 'f6', 'Bxh7+', 'Kxh7', 'Qh5+', 'Kg8', 'Ng6'],
        overview: 'The famous tactical hallmark of the London: the classic bishop sacrifice on h7 destroying Black’s king.',
        keyPlans: { white: 'Execute the mating pattern with Qh5 and Ng6.', black: 'Try to survive by returning the queen or giving up pieces.' }
      },
      {
        id: 'london-c4-break',
        name: 'London with Modern c4 Break',
        eco: 'D02',
        moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'c5', 'c3', 'Nc6', 'Nbd2', 'Bd6', 'Bg3', 'O-O', 'Bd3', 'Qe7', 'Ne5', 'Nd7', 'Ndf3', 'f6', 'Nxc6', 'bxc6', 'e4'],
        overview: 'White breaks centrally with e4, altering the pawn landscape and opening lines for the bishops.',
        keyPlans: { white: 'Break the center wide open, attack Black exposed kingside.', black: 'Use central pawn mass (c6, c5, e6) for space.' }
      }
    ]
  },
  {
    id: 'kings-indian-attack',
    name: "King's Indian Attack",
    side: 'white',
    ecoCode: 'A07-A08',
    category: 'Flank Opening (1.Nf3 / 1.e4)',
    initialMoves: ['Nf3', 'd5', 'g3'],
    description: 'Bobby Fischer’s deadly kingside attacking system. White sets up a King’s Indian Defense structure with colors reversed, launching a vicious kingside pawn storm with e4, e5, Nbd2, Re1, Nf1, and h4.',
    historicalContext: 'Immortalized by Bobby Fischer in the 1960s, who used it to obliterate French and Sicilian defenses. It remains a fearsome weapon requiring deep thematic understanding.',
    playStyle: 'Aggressive',
    difficulty: 'Intermediate',
    popularity: 88,
    keyThemes: ['Kingside pawn chain lock with e5', 'Knight transfer Nbd2-f1-h2-g4', 'Pawn storm with h4-h5', 'Devastating sacrificial attacks on h7/g6'],
    variations: [
      {
        id: 'kia-vs-french',
        name: 'KIA vs French Defense',
        eco: 'A08',
        moves: ['e4', 'e6', 'd3', 'd5', 'Nd2', 'Nf6', 'Ngf3', 'c5', 'g3', 'Nc6', 'Bg2', 'Be7', 'O-O', 'O-O', 'Re1', 'b5', 'e5', 'Nd7', 'Nf1', 'a5', 'h4', 'b4', 'Bf4'],
        overview: 'Fischer’s signature blueprint: Black expands on the queenside while White marches the kingside pawns forward for checkmate.',
        keyPlans: { white: 'Kingside attack with h4-h5, N1h2-g4, and Bxh6 sacrifices.', black: 'Queenside breakthrough with ...b4, ...a4, and ...c4.' }
      },
      {
        id: 'kia-vs-sicilian',
        name: 'KIA vs Sicilian Defense',
        eco: 'A07',
        moves: ['e4', 'c5', 'Nf3', 'e6', 'd3', 'Nc6', 'g3', 'd5', 'Nbd2', 'Nf6', 'Bg2', 'Be7', 'O-O', 'O-O', 'Re1', 'b5', 'e5', 'Nd7', 'Nf1', 'Qc7', 'Bf4', 'Bb7', 'h4'],
        overview: 'White bypasses the sharp theoretical maze of the Open Sicilian in favor of the thematic King’s Indian Attack steamroller.',
        keyPlans: { white: 'Lock e5, transfer knight to g4, sacrifice on g6 or h7.', black: 'Counter on the queenside, pressurize White e5 pawn.' }
      },
      {
        id: 'kia-vs-caro-kann',
        name: 'KIA vs Caro-Kann Defense',
        eco: 'A07',
        moves: ['e4', 'c6', 'd3', 'd5', 'Nd2', 'g6', 'Ngf3', 'Bg7', 'g3', 'e5', 'Bg2', 'Ne7', 'O-O', 'O-O', 'Re1', 'Nd7', 'c3', 'a5', 'a4', 'Re8'],
        overview: 'Against Black’s Caro-Kann, White plays flexible hypermodern moves, keeping the pawn on d3 and preparing central breaks.',
        keyPlans: { white: 'Strike with b4 or d4 at the ideal moment, keep pieces harmonious.', black: 'Control central d4 and e5, expand on queenside.' }
      },
      {
        id: 'kia-pachman-setup',
        name: 'Classical Pachman Attack',
        eco: 'A07',
        moves: ['Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'c6', 'O-O', 'Bg4', 'd3', 'Nbd7', 'Nbd2', 'e5', 'e4', 'Bd6', 'h3', 'Bh5', 'Qe1', 'O-O', 'Nh4', 'Re8', 'Nf5'],
        overview: 'Ludek Pachman’s classical piece coordination: White plants the knight on f5 and prepares f4 to rip open the f-file.',
        keyPlans: { white: 'Dominate the f5 outpost, attack kingside with f4.', black: 'Challenge f5 with ...Bf8, maintain central pawn solidity.' }
      },
      {
        id: 'kia-vs-queens-indian',
        name: "KIA vs Queen's Indian Formation",
        eco: 'A04',
        moves: ['Nf3', 'Nf6', 'g3', 'b6', 'Bg2', 'Bb7', 'O-O', 'e6', 'd3', 'd5', 'Nbd2', 'Be7', 'e4', 'O-O', 'e5', 'Nfd7', 'Re1', 'c5', 'Nf1', 'Nc6', 'h4'],
        overview: 'White counters Black’s ...b6/...Bb7 setup with the trademark e4-e5 advance and knight transfer to h2/g4.',
        keyPlans: { white: 'Coordinate h4, N1h2, Bf4, and Ng4 for a kingside assault.', black: 'Rely on queenside bishop on b7, attack d3 with ...c4.' }
      },
      {
        id: 'kia-vs-dutch',
        name: 'KIA vs Dutch Defense',
        eco: 'A04',
        moves: ['Nf3', 'f5', 'd3', 'Nf6', 'e4', 'fxe4', 'dxe4', 'Nxe4', 'Bd3', 'Nf6', 'Ng5', 'g6', 'h4', 'd5', 'h5', 'gxh5', 'Rxh5'],
        overview: 'A savage gambit line where White sacrifices the e4 pawn to blast open the h-file against Black’s exposed king.',
        keyPlans: { white: 'Sacrifice rooks on h5 to checkmate Black king.', black: 'Weather the tactical storm and exploit extra material.' }
      },
      {
        id: 'kia-c4-strike',
        name: 'KIA with Early c4 Strike',
        eco: 'A07',
        moves: ['Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'e6', 'O-O', 'Be7', 'd3', 'O-O', 'Nbd2', 'c5', 'e4', 'Nc6', 'Re1', 'b5', 'e5', 'Nd7', 'Nf1', 'a5', 'h4', 'b4', 'c4'],
        overview: 'White combines kingside attacking intentions with a sudden central strike c4 to undermine Black queenside pawns.',
        keyPlans: { white: 'Shatter Black queenside pawn structure while keeping kingside threats alive.', black: 'Capture ...bxc3 or bypass with ...d4, focus on central play.' }
      },
      {
        id: 'kia-double-fianchetto',
        name: 'KIA Double Fianchetto System',
        eco: 'A07',
        moves: ['Nf3', 'd5', 'g3', 'c6', 'Bg2', 'Nf6', 'O-O', 'Bf5', 'd3', 'e6', 'Nbd2', 'h6', 'b3', 'Be7', 'Bb2', 'O-O', 'Qe1', 'a5', 'a4', 'Na6', 'e4'],
        overview: 'White develops both bishops on g2 and b2 before advancing e4, creating balanced multi-diagonal pressure.',
        keyPlans: { white: 'Exert pressure along both long diagonals, advance centrally with e4-e5.', black: 'Occupy b4 with knight, maintain solid central triangle.' }
      },
      {
        id: 'kia-f4-pawn-storm',
        name: 'KIA Kingside Pawn Storm (f4-f5)',
        eco: 'A08',
        moves: ['e4', 'e6', 'd3', 'd5', 'Nd2', 'c5', 'Ngf3', 'Nc6', 'g3', 'Nf6', 'Bg2', 'Be7', 'O-O', 'O-O', 'Re1', 'b5', 'e5', 'Nd7', 'Nf1', 'a5', 'h4', 'b4', 'Bf4', 'Ba6', 'N1h2', 'c4', 'd4', 'c3', 'b3', 'a4', 'Ng4'],
        overview: 'The peak tactical confrontation: Black breaks through on the c- and b-files, but White crashes through on the kingside.',
        keyPlans: { white: 'Deliver checkmate before Black queenside pawns promote.', black: 'Push queenside passed pawns to distraction.' }
      },
      {
        id: 'kia-reti-hybrid',
        name: 'KIA / Reti Hybrid',
        eco: 'A09',
        moves: ['Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'g6', 'O-O', 'Bg7', 'd3', 'O-O', 'Nbd2', 'c5', 'e4', 'Nc6', 'c3', 'e5', 'Re1', 'h6', 'exd5', 'Nxd5', 'Nc4', 'Re8'],
        overview: 'Symmetrical fianchetto clash: White exchanges on d5 and targets the e5 pawn with knight on c4.',
        keyPlans: { white: 'Pressure e5 pawn, utilize d6 weakness with a4 and Ba3.', black: 'Anchor knight on d5, defend e5 securely.' }
      },
      {
        id: 'kia-sacrificial-h6',
        name: 'KIA Sacrificial Breakthrough',
        eco: 'A08',
        moves: ['e4', 'e6', 'd3', 'd5', 'Nd2', 'Nf6', 'Ngf3', 'c5', 'g3', 'Nc6', 'Bg2', 'Be7', 'O-O', 'O-O', 'Re1', 'Qc7', 'e5', 'Nd7', 'Nf1', 'b5', 'Bf4', 'Bb7', 'h4', 'Rfc8', 'N1h2', 'Qd8', 'Ng4', 'a5', 'Qd2', 'Bf8', 'Bg5', 'Qe8', 'Bf6'],
        overview: 'Fischer’s brilliant aesthetic trademark: planting the bishop on f6 or h6 to shatter Black’s castled king.',
        keyPlans: { white: 'Force Black to take on f6/h6, opening mating corridors.', black: 'Defend stubbornly with ...Bf8 and ...Kh8.' }
      },
      {
        id: 'kia-open-center',
        name: 'KIA Open Center Transposition',
        eco: 'A07',
        moves: ['Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'c5', 'O-O', 'Nc6', 'd3', 'e5', 'e4', 'dxe4', 'dxe4', 'Qxd1', 'Rxd1', 'Bg4', 'Re1', 'O-O-O', 'c3'],
        overview: 'Black trades queens early on d1 to kill White’s kingside attack, leading to a subtle positional endgame.',
        keyPlans: { white: 'Control d5 outpost, exploit Black overextended pawns in the endgame.', black: 'Target e4 pawn, active rooks on the d-file.' }
      }
    ]
  },
  {
    id: 'catalan-opening',
    name: 'Catalan Opening',
    side: 'white',
    ecoCode: 'E00-E09',
    category: 'Closed Game (1.d4 Nf6 2.c4 e6 3.g3)',
    initialMoves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2'],
    description: 'The supreme positional weapon of World Champions Vladimir Kramnik and Magnus Carlsen. White combines Queen’s Gambit spatial pressure with a hypermodern kingside bishop fianchetto.',
    historicalContext: 'Commissioned in 1929 by the Barcelona International Exposition and named after Catalonia. Kramnik used it as his primary weapon to defeat Veselin Topalov in the 2006 World Championship unification match.',
    playStyle: 'Positional',
    difficulty: 'Advanced',
    popularity: 94,
    keyThemes: ['Immense diagonal laser power of the g2 bishop', 'Temporary pawn sacrifice on c4 for positional domination', 'Queen maneuvers Qc2 and Qa4+', 'Endgame squeeze on the queenside'],
    variations: [
      {
        id: 'catalan-open-classical',
        name: 'Open Catalan - Classical 6...dxc4',
        eco: 'E05',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'dxc4', 'Qc2', 'a6', 'Qxc4', 'b5', 'Qc2', 'Bb7', 'Bd2', 'Be4', 'Qc1', 'Bb7'],
        overview: 'The pinnacle of Catalan theory: Black captures on c4 to gain queenside space with ...b5, while White regains the pawn with positional pressure.',
        keyPlans: { white: 'Pressure Black queenside along the c-file and long diagonal.', black: 'Fianchetto on b7, eliminate weaknesses with ...c5.' }
      },
      {
        id: 'catalan-open-kasparov',
        name: 'Open Catalan - 7...a6 Variation',
        eco: 'E04',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'dxc4', 'Nf3', 'a6', 'O-O', 'Nc6', 'e3', 'Rb8', 'Nfd2', 'e5', 'Bxc6+', 'bxc6', 'dxe5', 'Ng4', 'Nxc4', 'Be6'],
        overview: 'Kasparov’s hyper-energetic treatment: Black holds the c4 pawn with ...b5 ideas and strikes in the center with ...e5.',
        keyPlans: { white: 'Shatter Black queenside pawn structure with Bxc6+.', black: 'Unleash bishop pair and aggressive piece counterplay.' }
      },
      {
        id: 'catalan-closed-main',
        name: 'Closed Catalan - Main Line',
        eco: 'E06',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'c6', 'Qc2', 'Nbd7', 'Nbd2', 'b6', 'e4', 'Bb7', 'e5', 'Ne8', 'cxd5', 'cxd5'],
        overview: 'Black declines to capture on c4, keeping the center firmly shut with ...c6 before expanding with ...b6.',
        keyPlans: { white: 'Push e4-e5, gain kingside space, penetrate the c-file.', black: 'Anchor the d5 point, prepare ...f6 counter-strike.' }
      },
      {
        id: 'catalan-bogo-hybrid',
        name: 'Catalan - Bogo-Indian Hybrid (4...Bb4+)',
        eco: 'E00',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'Bb4+', 'Bd2', 'Be7', 'Bg2', 'd5', 'Nf3', 'O-O', 'O-O', 'c6', 'Bf4', 'Nbd7', 'Qc2', 'b6', 'Rd1', 'Bb7'],
        overview: 'Black checks on b4 to misplace White’s dark bishop on d2 before retreating back to e7.',
        keyPlans: { white: 'Develop harmoniously, pressure d5 with Rd1.', black: 'Construct solid Slav wall, prepare ...c5 break.' }
      },
      {
        id: 'catalan-open-hungarian',
        name: 'Open Catalan - Hungarian (7...Nc6)',
        eco: 'E04',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'dxc4', 'Nf3', 'Nc6', 'Qa4', 'Bb4+', 'Bd2', 'Nd5', 'Bxb4', 'Nxb4', 'O-O', 'Rb8', 'Na3', 'O-O'],
        overview: 'Black plays ...Nc6 targeting d4 immediately, leading to tactical queen and knight maneuvering.',
        keyPlans: { white: 'Regain the c4 pawn, dominate the center with e4.', black: 'Maintain queenside piece coordination with ...Rb8 and ...b5.' }
      },
      {
        id: 'catalan-early-dxc4',
        name: 'Catalan - Early 4...dxc4 Grab',
        eco: 'E02',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'dxc4', 'Qa4+', 'Nbd7', 'Qxc4', 'c5', 'Nf3', 'a6', 'Qc2', 'b5', 'O-O', 'Bb7'],
        overview: 'Black takes on c4 on move 4. White immediately recovers the pawn with Qa4+ before Black can solidify it.',
        keyPlans: { white: 'Fast piece development, restrain Black ...b5 expansion.', black: 'Fianchetto on b7, equalize central space with ...c5.' }
      },
      {
        id: 'catalan-closed-c5',
        name: 'Closed Catalan - Active ...c5 Counter',
        eco: 'E06',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'Nbd7', 'Qc2', 'c5', 'cxd5', 'Nxd5', 'Rd1', 'cxd4', 'Nxd4', 'N7f6'],
        overview: 'Black immediately counter-attacks White’s center with ...c5, liquidating central tension into an open battle.',
        keyPlans: { white: 'Target Black uncoordinated pieces along the d-file with Rd1.', black: 'Establish active knight outposts on d5 and f6.' }
      },
      {
        id: 'catalan-double-fianchetto',
        name: 'Catalan Double Fianchetto',
        eco: 'E00',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'c6', 'b3', 'b6', 'Bb2', 'Bb7', 'Nbd2', 'Nbd7', 'Qc2', 'Rc8', 'e4'],
        overview: 'White places bishops on g2 and b2, dominating the entire chessboard before striking with e4.',
        keyPlans: { white: 'Open center with e4, unleash both monster bishops.', black: 'Counter with ...c5, contest the center with heavy pieces.' }
      },
      {
        id: 'catalan-kramnik-endgame',
        name: 'Catalan Kramnik Endgame Squeeze',
        eco: 'E05',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'dxc4', 'Qc2', 'a6', 'Qxc4', 'b5', 'Qc2', 'Bb7', 'Bd2', 'Nc6', 'e3', 'Nb4', 'Bxb4', 'Bxb4', 'a3', 'Bd6', 'Nbd2', 'Qe7', 'b4'],
        overview: 'Vladimir Kramnik’s patented clamps: White trades knights on b4 and fixes Black’s queenside with b4.',
        keyPlans: { white: 'Immobilize Black c-pawn eternally, win on the queenside in the endgame.', black: 'Strive to force the ...c5 break at all costs.' }
      },
      {
        id: 'catalan-pin-line',
        name: 'Catalan Queen Pin Variation (Bd2 & Ba5)',
        eco: 'E05',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'dxc4', 'Qc2', 'a6', 'Qxc4', 'b5', 'Qc2', 'Bb7', 'Bd2', 'Be4', 'Qc1', 'Qc8', 'Ba5', 'c5', 'dxc5', 'Qxc5', 'Qxc5', 'Bxc5'],
        overview: 'White plays Ba5 to paralyze Black’s queenside pawns, leading into a sharp queenless middlegame.',
        keyPlans: { white: 'Use the open c-file and Bg2 bishop to dominate minor pieces.', black: 'Activate rooks, coordinate bishop pair.' }
      },
      {
        id: 'catalan-solid-be7',
        name: 'Catalan Solid 4...Be7 Line',
        eco: 'E01',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'dxc4', 'Na3', 'Bxa3', 'bxa3', 'Bd7', 'Ne5', 'Bc6', 'Nxc6', 'Nxc6', 'e3'],
        overview: 'White recaptures on c4 with Na3!, accepting doubled a-pawns in exchange for the monster bishop pair and open b-file.',
        keyPlans: { white: 'Dominate the board with the unopposed dark-squared bishop.', black: 'Target White weak a-pawns with knight maneuvers.' }
      },
      {
        id: 'catalan-semi-slav',
        name: 'Catalan vs Semi-Slav Structure',
        eco: 'E00',
        moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'c6', 'Nf3', 'Nbd7', 'O-O', 'Bd6', 'Qc2', 'O-O', 'Nbd2', 'e5', 'cxd5', 'cxd5', 'dxe5', 'Nxe5', 'Nxe5', 'Bxe5', 'Nf3'],
        overview: 'Black breaks with ...e5, liquidating pawns into an open game where White targets Black’s isolated d5 pawn.',
        keyPlans: { white: 'Blockade and attack the isolated d5 pawn.', black: 'Use piece activity and open e-file for counterplay.' }
      }
    ]
  },
  {
    id: 'vienna-game',
    name: 'Vienna Game & Gambit',
    side: 'white',
    ecoCode: 'C25-C29',
    category: 'Open Game (1.e4 e5 2.Nc3)',
    initialMoves: ['e4', 'e5', 'Nc3'],
    description: 'A sharp, romantic opening with modern bite. White develops the queen’s knight to c3 before deciding on f4 or Bc4, keeping Black guessing between a positional game and a fiery gambit.',
    historicalContext: 'Pioneered by Austrian master Carl Hamppe in the 1840s in Vienna. Extensively refined by Wilhelm Steinitz, Rudolf Spielmann, and recently revived by modern attacking grandmasters.',
    playStyle: 'Tactical',
    difficulty: 'Intermediate',
    popularity: 87,
    keyThemes: ['Delayed King’s Gambit with 3.f4', 'Center fork trick tactics with ...Nxe4', 'Fierce kingside attacks on the f-file', 'Rapid piece development with Bc4 and d3'],
    variations: [
      {
        id: 'vienna-gambit',
        name: 'Vienna Gambit (Main Line 2...Nf6 3.f4)',
        eco: 'C29',
        moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5', 'fxe5', 'Nxe4', 'Qf3', 'f5', 'd3', 'Nxc3', 'bxc3', 'd4', 'Qg3', 'Nc6', 'Nf3'],
        overview: 'The defining test of the Vienna: White strikes with 3.f4, Black counters with 3...d5!, leading to wild central tactical complications.',
        keyPlans: { white: 'Pressure e4 and g7, develop Bc4, exploit open f-file.', black: 'Anchor knight on e4, counter-attack White fractured queenside pawns.' }
      },
      {
        id: 'vienna-max-lange',
        name: 'Max Lange Defense (3.Bc4 Bc5)',
        eco: 'C28',
        moves: ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4', 'Bc5', 'd3', 'd6', 'f4', 'Nc6', 'Nf3', 'Bg4', 'h3', 'Bxf3', 'Qxf3', 'Nd4', 'Qg3'],
        overview: 'Both sides deploy bishops to the active c4/c5 diagonals before White strikes with f4, inviting Black knight jumps to d4.',
        keyPlans: { white: 'Sacrifice c2 pawn with Qg3 to unleash ferocious attack on g7 and f7.', black: 'Snag c2 pawn with fork, try to parry White kingside mating net.' }
      },
      {
        id: 'vienna-frankenstein-dracula',
        name: 'Frankenstein-Dracula Variation',
        eco: 'C27',
        moves: ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4', 'Nxe4', 'Qh5', 'Nd6', 'Bb3', 'Nc6', 'Nb5', 'g6', 'Qf3', 'f5', 'Qd5', 'Qe7', 'Nxc7+', 'Kd8', 'Nxa8', 'b6'],
        overview: 'Named by Tim Harding for its bloodthirsty, monstrous tactical lines: Black sacs pieces for king hunts, White grabs the a8 rook.',
        keyPlans: { white: 'Escape with extra rook material, withstand Black vicious counter-attack.', black: 'Trap White a8 knight, mobilize monstrous bishop pair on b7/g7 to mate White.' }
      },
      {
        id: 'vienna-falkbeer',
        name: 'Falkbeer Variation (3.g3)',
        eco: 'C26',
        moves: ['e4', 'e5', 'Nc3', 'Nf6', 'g3', 'd5', 'exd5', 'Nxd5', 'Bg2', 'Nxc3', 'bxc3', 'Bd6', 'Ne2', 'O-O', 'O-O', 'Nc6', 'd3'],
        overview: 'A positional antidote: White fianchettoes the light bishop with g3/Bg2, exerting pressure on Black’s central pieces.',
        keyPlans: { white: 'Pressure long diagonal, push d4 at the right moment.', black: 'Develop harmoniously, control the open central files.' }
      },
      {
        id: 'vienna-center-fork-trick',
        name: 'Center Fork Trick Line (3.Bc4 Nxe4)',
        eco: 'C27',
        moves: ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4', 'Nxe4', 'Nxe4', 'd5', 'Bd3', 'dxe4', 'Bxe4', 'Bd6', 'd3', 'O-O', 'Ne2', 'c6'],
        overview: 'Black executes the famous pseudo-sacrifice 3...Nxe4! followed by 4...d5 fork, successfully neutralizing White bishop pair.',
        keyPlans: { white: 'Reorganize minor pieces, keep kingside attacking possibilities.', black: 'Enjoy easy equality with strong pawn center and bishop pair.' }
      },
      {
        id: 'vienna-classical-nc6',
        name: 'Vienna Classical (2...Nc6 3.Bc4)',
        eco: 'C25',
        moves: ['e4', 'e5', 'Nc3', 'Nc6', 'Bc4', 'Bc5', 'Qg4', 'Qf6', 'Nd5', 'Qxf2+', 'Kd1', 'Kf8', 'Nh3', 'Qd4', 'd3', 'd6', 'Qf3'],
        overview: 'Black plays symmetrically with 2...Nc6. White immediately attacks g7 with 4.Qg4, leading to double-edged king chases.',
        keyPlans: { white: 'Trap Black queen with c3/b4, mate Black king stranded on f8.', black: 'Counter-attack White king on d1, activate pieces.' }
      },
      {
        id: 'vienna-steinitz-gambit',
        name: 'Steinitz Gambit',
        eco: 'C25',
        moves: ['e4', 'e5', 'Nc3', 'Nc6', 'f4', 'exf4', 'd4', 'Qh4+', 'Ke2', 'd5', 'exd5', 'Bg4+', 'Nf3', 'O-O-O', 'dxc6', 'Bc5'],
        overview: 'World Champion Wilhelm Steinitz’s radical concept that the King is a fighting piece: White walks the king to e2 on move 5!',
        keyPlans: { white: 'Use king as a central shield, build unstoppable pawn mass.', black: 'Sacrifice pieces to hunt White king exposed in the center.' }
      },
      {
        id: 'vienna-hamppe-muzio',
        name: 'Hamppe-Muzio Gambit',
        eco: 'C25',
        moves: ['e4', 'e5', 'Nc3', 'Nc6', 'f4', 'exf4', 'Nf3', 'g5', 'Bc4', 'g4', 'O-O', 'gxf3', 'Qxf3', 'Ne5', 'Qxf4', 'Qf6'],
        overview: 'Romantic insanity: White sacrifices a full knight on f3 just to tear open the f-file and attack f7.',
        keyPlans: { white: 'Assault f7 with queen and rook battery, force checkmate.', black: 'Return material strategically to survive into winning endgame.' }
      },
      {
        id: 'vienna-paulsen',
        name: 'Paulsen Variation (3.g3 Bc5)',
        eco: 'C26',
        moves: ['e4', 'e5', 'Nc3', 'Nc6', 'g3', 'Bc5', 'Bg2', 'd6', 'Nge2', 'Nge7', 'O-O', 'O-O', 'd3', 'a6', 'Be3', 'Bxe3', 'fxe3'],
        overview: 'Quiet positional system where White develops Nge2 behind the fianchettoed bishop to maintain flexibility.',
        keyPlans: { white: 'Use the half-open f-file after Bxe3, prepare d4 central push.', black: 'Target White backward e3 pawn, maintain piece harmony.' }
      },
      {
        id: 'vienna-mieses',
        name: 'Mieses Variation (3.g3 g6)',
        eco: 'C26',
        moves: ['e4', 'e5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'Nge2', 'Nge7', 'd3', 'd6', 'O-O', 'O-O', 'Be3', 'Nd4', 'Qd2'],
        overview: 'Double dragon-style fianchetto: both sides mirror each other with g3 and g6, resulting in a subtle positional standoff.',
        keyPlans: { white: 'Trade dark bishops with Bh6, push f4.', black: 'Anchor knight on d4, counter with ...c6 and ...d5.' }
      },
      {
        id: 'vienna-gambit-d6',
        name: 'Vienna Gambit - Solid 3...d6',
        eco: 'C29',
        moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd6', 'Nf3', 'Nbd7', 'Bc4', 'Be7', 'd3', 'O-O', 'O-O', 'c6', 'a4', 'b6', 'Qe1'],
        overview: 'Black declines tactical fireworks by solidly defending e5 with ...d6, converting into an improved Philidor Defense.',
        keyPlans: { white: 'Build kingside pressure with Qe1-h4, maintain central control.', black: 'Solid defense, queenside counterplay with ...b5.' }
      },
      {
        id: 'vienna-adams-attack',
        name: 'Adams Attack (3.f4 exf4 4.Qh5)',
        eco: 'C29',
        moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5', 'fxe5', 'Nxe4', 'Nf3', 'Be7', 'd4', 'O-O', 'Bd3', 'f5', 'exf6', 'Nxf6', 'O-O'],
        overview: 'White plays classical development with Nf3 and Bd3, liquidating the e-file and keeping an edge in space.',
        keyPlans: { white: 'Direct kingside attack along the open e- and f-files.', black: 'Counter-attack White d4 pawn, activate minor pieces.' }
      }
    ]
  },
  {
    id: 'reti-opening',
    name: 'Réti Opening',
    side: 'white',
    ecoCode: 'A04-A09',
    category: 'Flank Opening (1.Nf3 d5 2.c4)',
    initialMoves: ['Nf3', 'd5', 'c4'],
    description: 'The definitive hypermodern revolution opening created by Richard Réti. White avoids occupying the center with pawns, instead using pieces and flank strikes to dismantle Black’s central pawn duo.',
    historicalContext: 'Richard Réti introduced it in the 1920s, famously using it to defeat undefeated World Champion José Raúl Capablanca in New York 1924, ending Capablanca’s 8-year unbeaten streak.',
    playStyle: 'Positional',
    difficulty: 'Advanced',
    popularity: 91,
    keyThemes: ['Hypermodern piece pressure on the center', 'Fianchetto of both bishops (Bg2 & Bb2)', 'Undermining Black’s d5 pawn with c4', 'Delayed pawn center commitment'],
    variations: [
      {
        id: 'reti-accepted',
        name: 'Réti Accepted (2...dxc4)',
        eco: 'A09',
        moves: ['Nf3', 'd5', 'c4', 'dxc4', 'Na3', 'c5', 'Nxc4', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'O-O', 'Nh6', 'd3', 'O-O', 'Be3', 'Nf5', 'Bxc5'],
        overview: 'Black captures on c4 to relieve tension. White regains the pawn effortlessly with Na3 or Qa4+ with superior piece coordination.',
        keyPlans: { white: 'Regain c4 pawn, dominate long diagonal with Bg2.', black: 'Fianchetto dark bishop, activate knight via h6/f5.' }
      },
      {
        id: 'reti-advance',
        name: 'Réti Advance (2...d4)',
        eco: 'A09',
        moves: ['Nf3', 'd5', 'c4', 'd4', 'b4', 'g6', 'Bb2', 'Bg7', 'e3', 'e5', 'exd4', 'exd4', 'd3', 'Ne7', 'Be2', 'O-O', 'O-O', 'a5', 'b5', 'c5'],
        overview: 'Black boldly pushes past with 2...d4 to grab space, leading to a reversed Benoni/Benko-style pawn structure.',
        keyPlans: { white: 'Undermine d4 wedge with e3 and b4, open lines for Bb2.', black: 'Reinforce d4 wedge with ...c5 and ...e5, restrain White queenside.' }
      },
      {
        id: 'reti-vs-slav',
        name: 'Réti vs Slav Structure (2...c6)',
        eco: 'A07',
        moves: ['Nf3', 'd5', 'c4', 'c6', 'g3', 'Nf6', 'Bg2', 'Bf5', 'cxd5', 'cxd5', 'Qb3', 'Qc8', 'Nc3', 'e6', 'd3', 'Nc6', 'Bf4', 'Be7', 'Rc1', 'O-O', 'O-O'],
        overview: 'Black builds the solid Slav pawn wedge ...c6. White exerts pressure on b7 and the c-file with Qb3 and Rc1.',
        keyPlans: { white: 'Exploit Black b7 weakness, dominate c-file with rooks.', black: 'Develop bishop outside pawn chain, maintain solid center.' }
      },
      {
        id: 'reti-vs-qgd',
        name: 'Réti vs QGD Structure (2...e6)',
        eco: 'A08',
        moves: ['Nf3', 'd5', 'c4', 'e6', 'g3', 'Nf6', 'Bg2', 'Be7', 'O-O', 'O-O', 'b3', 'c5', 'Bb2', 'Nc6', 'e3', 'b6', 'Nc3', 'Bb7', 'cxd5', 'Nxd5', 'Nxd5', 'Qxd5', 'd4'],
        overview: 'Black opts for classical QGD solidarity with ...e6. White answers with the beautiful double fianchetto.',
        keyPlans: { white: 'Open the center with d4, activate both laser bishops.', black: 'Neutralize White long diagonal, equalize via piece exchanges.' }
      },
      {
        id: 'reti-lisitsin-gambit',
        name: 'Lisitsin Gambit (1.Nf3 f5 2.e4)',
        eco: 'A04',
        moves: ['Nf3', 'f5', 'e4', 'fxe4', 'Ng5', 'Nf6', 'd3', 'e3', 'Bxe3', 'e6', 'd4', 'Be7', 'Bd3', 'O-O', 'h4'],
        overview: 'Georgy Lisitsin’s explosive anti-Dutch gambit: White immediately offers e4 to tear open the kingside.',
        keyPlans: { white: 'Launch devastating kingside attack along open diagonals with h4 and Bd3.', black: 'Return the pawn with ...e3 to slow down White attack.' }
      },
      {
        id: 'reti-double-fianchetto',
        name: 'Réti Double Fianchetto Masterclass',
        eco: 'A06',
        moves: ['Nf3', 'd5', 'b3', 'Nf6', 'Bb2', 'e6', 'g3', 'Be7', 'Bg2', 'O-O', 'O-O', 'c5', 'c4', 'Nc6', 'e3', 'b6', 'd3', 'Bb7', 'Qe2', 'Qc7', 'Nc3', 'Rad8'],
        overview: 'The purest manifestation of Réti’s philosophy: White avoids all central pawn weakness and aims both bishops at the center.',
        keyPlans: { white: 'Control center from afar, wait for Black to overextend.', black: 'Occupying the center solidly while preventing White piece breakthroughs.' }
      },
      {
        id: 'reti-vs-kings-indian',
        name: "Réti vs King's Indian Setup",
        eco: 'A05',
        moves: ['Nf3', 'Nf6', 'c4', 'g6', 'b4', 'Bg7', 'Bb2', 'O-O', 'g3', 'd6', 'Bg2', 'e5', 'd3', 'a5', 'b5', 'Nbd7', 'O-O', 'Nc5', 'Nbd2'],
        overview: 'White plays an early b4 to disrupt Black’s plans and seize the queenside before Black can establish kingside play.',
        keyPlans: { white: 'Control queenside space with b5, maintain central flexibility.', black: 'Anchor knight on c5, counter-attack White b5 pawn.' }
      },
      {
        id: 'reti-capablanca-system',
        name: 'Réti vs Capablanca Setup (2...c6 & ...Bf5)',
        eco: 'A07',
        moves: ['Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'Bf5', 'O-O', 'e6', 'd3', 'h6', 'Nbd2', 'Be7', 'Qe1', 'O-O', 'e4', 'Bh7', 'Qe2', 'c5', 'b3', 'Nc6', 'Bb2'],
        overview: 'Capablanca’s model defense against Réti: Black develops the bishop to f5 and tucks it safely to h7.',
        keyPlans: { white: 'Expand centrally with e4 and e5, prepare kingside offensive.', black: 'Solid piece harmony, pressure White center with ...c5.' }
      },
      {
        id: 'reti-anglo-slav',
        name: 'Anglo-Slav Réti Hybrid',
        eco: 'A11',
        moves: ['Nf3', 'd5', 'c4', 'c6', 'e3', 'Nf6', 'Nc3', 'e6', 'b3', 'Nbd7', 'Bb2', 'Bd6', 'Qc2', 'O-O', 'Be2', 'b6', 'O-O', 'Bb7', 'd4'],
        overview: 'A smooth transition into the Queen’s Gambit / Catalan landscape with maximum piece flexibility.',
        keyPlans: { white: 'Push d4, control central c- and e-files.', black: 'Counter with ...c5 or ...e5, maintain active bishop diagonals.' }
      },
      {
        id: 'reti-reversed-benoni',
        name: 'Reversed Benoni Dynamics (3...d4 4.b4 f6)',
        eco: 'A09',
        moves: ['Nf3', 'd5', 'c4', 'd4', 'b4', 'f6', 'e3', 'e5', 'c5', 'a5', 'Bc4', 'axb4', 'Qb3', 'Nh6', 'exd4', 'e4', 'O-O', 'exf3', 'Re1+'],
        overview: 'Wild, sharp tactical slugfest where Black defends e5 with ...f6 and White sacrifices pawns for a vicious attack against Black king.',
        keyPlans: { white: 'Blast open the e-file and attack Black uncastled king.', black: 'Hold onto extra material, counter with ...Nc6.' }
      },
      {
        id: 'reti-kings-indian-attack-transpo',
        name: 'Réti KIA Transposition',
        eco: 'A07',
        moves: ['Nf3', 'd5', 'g3', 'c6', 'Bg2', 'Bg4', 'O-O', 'Nd7', 'd3', 'e5', 'Nbd2', 'Bd6', 'e4', 'Ne7', 'h3', 'Bh5', 'Qe1', 'O-O', 'Nh4', 'f6'],
        overview: 'Réti subtly transposes into a King’s Indian Attack setup with colors reversed, aiming for kingside expansion.',
        keyPlans: { white: 'Expand kingside with f4, challenge Black center.', black: 'Solid defense with ...f6, maintain piece coordination.' }
      },
      {
        id: 'reti-endgame-squeeze',
        name: 'Réti Symmetrical Squeeze',
        eco: 'A04',
        moves: ['Nf3', 'c5', 'c4', 'Nc6', 'Nc3', 'g6', 'g3', 'Bg7', 'Bg2', 'e6', 'O-O', 'Nge7', 'd3', 'O-O', 'Bd2', 'd5', 'a3', 'b6', 'Rb1', 'Bb7', 'b4'],
        overview: 'White advances b4 on the queenside, liquidating pawns to establish a positional grip into the endgame.',
        keyPlans: { white: 'Squeeze the queenside with b5, open lines for rooks.', black: 'Counter in the center with ...d4, active bishop on g7.' }
      }
    ]
  }
];
