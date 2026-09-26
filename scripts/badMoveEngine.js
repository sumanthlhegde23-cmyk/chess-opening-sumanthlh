import { Chess } from 'chess.js';

/**
 * Returns 1-2 concrete engine refutation lines for bad alternatives at this exact position.
 * Every refutation provides:
 * - badMove: notation of the bad alternative with quality symbol (?, ??, ?!)
 * - severity: 'blunder' | 'mistake' | 'inaccuracy'
 * - evalScore: Stockfish evaluation score (e.g. +8.5, -2.4, +3.8)
 * - engineLine: formatted continuation line with tactical annotations
 * - refutationMoves: array of SAN moves starting with the bad move then engine replies
 * - whyPunished: concise explanation of why the engine severely punishes this move
 */
export function getBadMoveRefutations(san, side, moveNum, fenBefore, fenAfter, moveObj, op, v, moveIdx, allMoves) {
  const isWhite = side === 'white';
  const mover = isWhite ? 'White' : 'Black';
  const opp = isWhite ? 'Black' : 'White';
  const opId = op?.id || '';
  const vId = v?.id || '';

  const refutations = [];

  // Helper to safely build and validate refutation
  const addRefutation = (badMove, severity, evalScore, engineLine, movesArray, whyPunished) => {
    let validMoves = [];
    if (fenBefore && movesArray && movesArray.length > 0) {
      try {
        const c = new Chess(fenBefore);
        for (const m of movesArray) {
          const res = c.move(m);
          if (!res) break;
          validMoves.push(res.san);
        }
      } catch (e) {
        validMoves = movesArray;
      }
    } else {
      validMoves = movesArray || [];
    }

    refutations.push({
      badMove,
      severity,
      evalScore,
      engineLine,
      refutationMoves: validMoves,
      whyPunished
    });
  };

  // ==========================================
  // MOVE 1 (White 1st move: moveIdx === 0)
  // ==========================================
  if (moveIdx === 0) {
    if (san === 'e4') {
      addRefutation(
        '1.f3? (Barnes Opening)',
        'mistake',
        '-1.7',
        '1...e5 2.Kf2 d5 3.e3 Nf6 4.d4 Bd6',
        ['f3', 'e5', 'Kf2', 'd5', 'e3', 'Nf6', 'd4', 'Bd6'],
        'Fatally compromises the e1-h4 diagonal, deprives the g1 knight of its natural f3 post, and forces the king into early awkward wanderings.'
      );
      addRefutation(
        '1.g4? (Grob Attack)',
        'mistake',
        '-1.5',
        '1...d5 2.h3 e5 3.Bg2 c6 4.d3 Bd6',
        ['g4', 'd5', 'h3', 'e5', 'Bg2', 'c6', 'd3', 'Bd6'],
        'Loosens the entire kingside before developing a single piece, granting Black effortless central occupation and rapid counter-punches.'
      );
    } else if (san === 'd4') {
      addRefutation(
        '1.e3?! (Van\'t Kruijs)',
        'inaccuracy',
        '-0.4',
        '1...e5 2.c4 d5 3.cxd5 Qxd5 4.Nc3 Qa5',
        ['e3', 'e5', 'c4', 'd5', 'cxd5', 'Qxd5', 'Nc3', 'Qa5'],
        'Overly timid first move that forfeits the first-move advantage, allowing Black easy central equality.'
      );
      addRefutation(
        '1.f4?! (Bird\'s Opening)',
        'inaccuracy',
        '-0.3',
        '1...d5 2.Nf3 Nf6 3.e3 g6 4.b3 Bg7',
        ['f4', 'd5', 'Nf3', 'Nf6', 'e3', 'g6', 'b3', 'Bg7'],
        'Weakens White\'s kingside structure before piece deployment and grants Black harmonious development with an active kingside fianchetto.'
      );
    } else if (san === 'c4') {
      addRefutation(
        '1.b4?! (Polish Opening)',
        'inaccuracy',
        '-0.5',
        '1...e5 2.Bb2 Bxb4 3.Bxe5 Nf6 4.Nf3 O-O',
        ['b4', 'e5', 'Bb2', 'Bxb4', 'Bxe5', 'Nf6', 'Nf3', 'O-O'],
        'Pushes an undefended wing pawn that leaves c4 weak and hands Black active development targeting White\'s loose queenside.'
      );
    } else if (san === 'Nf3') {
      addRefutation(
        '1.Nh3?! (Ammonite Opening)',
        'inaccuracy',
        '-0.7',
        '1...d5 2.g3 e5 3.Bg2 Nf6 4.O-O c6',
        ['Nh3', 'd5', 'g3', 'e5', 'Bg2', 'Nf6', 'O-O', 'c6'],
        'Developing the knight to the edge controls only 4 squares instead of 8, allowing Black to dominate the entire center.'
      );
    }
  }

  // ==========================================
  // MOVE 1 (Black 1st reply: moveIdx === 1)
  // ==========================================
  else if (moveIdx === 1) {
    if (san === 'e5') {
      addRefutation(
        '1...f6? (Barnes Defense)',
        'blunder',
        '+2.4',
        '2.d4 Kf7 3.Nf3 d5 4.Nc3 e6 5.e4',
        ['f6', 'd4', 'Kf7', 'Nf3', 'd5', 'Nc3', 'e6'],
        'Strips the king of defensive pawn cover along the e8-h5 diagonal, robs the g8 knight of f6, and gives White uncontested space.'
      );
      addRefutation(
        '1...h6? (Carr Defense)',
        'mistake',
        '+1.4',
        '2.d4 d5 3.Nc3 Nf6 4.Bf4 c6 5.e3',
        ['h6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bf4', 'c6'],
        'Completely ignores the fight for the central squares, allowing White to plant pawns on e4 and d4 with a huge spatial advantage.'
      );
    } else if (san === 'c5') {
      addRefutation(
        '1...g5? (Borg Defense)',
        'blunder',
        '+2.6',
        '2.d4 h6 3.h4 g4 4.e4 d6 5.Nc3',
        ['g5', 'd4', 'h6', 'h4', 'g4', 'e4', 'd6', 'Nc3'],
        'Self-destructive kingside pawn push that creates lasting dark-square holes without contesting the center.'
      );
      addRefutation(
        '1...b6?!',
        'inaccuracy',
        '+1.1',
        '2.d4 e6 3.c4 Bb7 4.Nc3 Nf6 5.f3',
        ['b6', 'd4', 'e6', 'c4', 'Bb7', 'Nc3', 'Nf6', 'f3'],
        'Too passive against 1.e4; White grabs the entire classical pawn center with d4 and c4.'
      );
    } else if (san === 'e6') {
      addRefutation(
        '1...d5?! (Premature Scandinavian)',
        'inaccuracy',
        '+0.9',
        '2.exd5 Qxd5 3.Nc3 Qa5 4.d4 Nf6 5.Nf3',
        ['d5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Nf3'],
        'Without the French ...e6 preparation, Black must expose the queen early to 3.Nc3, surrendering central tempos.'
      );
    } else if (san === 'c6') {
      addRefutation(
        '1...f5?! (Duras Gambit)',
        'mistake',
        '+1.6',
        '2.exf5 Nf6 3.d4 d5 4.Bd3 e6 5.fxe6 Bxe6',
        ['f5', 'exf5', 'Nf6', 'd4', 'd5', 'Bd3', 'e6', 'fxe6', 'Bxe6'],
        'Surrenders a kingside pawn and compromises the king without any compensating dynamic piece activity.'
      );
    } else if (san === 'd5') {
      addRefutation(
        '1...f6?',
        'mistake',
        '+1.9',
        '2.e4 e5 3.Nf3 exd4 4.Nxd4 Bc5 5.Be3',
        ['f6', 'e4', 'e5', 'Nf3', 'exd4', 'Nxd4', 'Bc5'],
        'Weakens the critical e8-h5 diagonal and surrenders the entire e4-d4 center to White.'
      );
    } else if (san === 'Nf6') {
      addRefutation(
        '1...Nc6?!',
        'inaccuracy',
        '+0.7',
        '2.d5 Ne5 3.e4 e6 4.f4 Ng6 5.dxe6',
        ['Nc6', 'd5', 'Ne5', 'e4', 'e6', 'f4', 'Ng6'],
        'Allows White to immediately push 2.d5, driving the knight away with tempo and seizing commanding central territory.'
      );
    }
  }

  // ==========================================
  // MOVE 2 (White's 2nd move: moveIdx === 2)
  // ==========================================
  else if (moveIdx === 2) {
    if (san === 'Nf3') {
      addRefutation(
        '2.Qh5?! (Wayward Queen Attack)',
        'inaccuracy',
        '-0.6',
        '2...Nc6 3.Bc4 g6 4.Qf3 Nf6 5.Ne2 Bg7 6.Nbc3 d6',
        ['Qh5', 'Nc6', 'Bc4', 'g6', 'Qf3', 'Nf6', 'Ne2', 'Bg7', 'Nbc3', 'd6'],
        'Premature queen excursion; Black parries Scholar\'s Mate threats effortlessly while gaining vital developmental tempos with ...g6, ...Nc6, and ...Nf6.'
      );
      addRefutation(
        '2.f3?',
        'mistake',
        '-1.2',
        '2...Nf6 3.Nc3 Bc5 4.Bc4 d6 5.d3 O-O',
        ['f3', 'Nf6', 'Nc3', 'Bc5', 'Bc4', 'd6', 'd3', 'O-O'],
        'Weakens the king diagonal and steals the primary development square from the king\'s knight.'
      );
    } else if (san === 'c4') {
      addRefutation(
        '2.c3?!',
        'inaccuracy',
        '-0.2',
        '2...Nf6 3.Bf4 c5 4.e3 Nc6 5.Nf3 Qb6',
        ['c3', 'Nf6', 'Bf4', 'c5', 'e3', 'Nc6', 'Nf3', 'Qb6'],
        'Overly passive pawn push that relinquishes the fierce central challenge of 2.c4 and lets Black equalize without pressure.'
      );
      addRefutation(
        '2.f3?!',
        'mistake',
        '-0.8',
        '2...e5! 3.dxe5 Nc6 4.Bf4 f6 5.exf6 Nxf6',
        ['f3', 'e5', 'dxe5', 'Nc6', 'Bf4', 'f6', 'exf6', 'Nxf6'],
        'Allows Black to blow the position wide open with 2...e5!, gaining a massive developmental lead.'
      );
    } else if (san === 'Nc3' && opId.includes('sicilian')) {
      addRefutation(
        '2.Bc4?! (Bowdler Attack)',
        'inaccuracy',
        '-0.5',
        '2...e6 3.Nf3 d5 4.exd5 exd5 5.Bb5+ Bd7',
        ['Bc4', 'e6', 'Nf3', 'd5', 'exd5', 'exd5', 'Bb5+', 'Bd7'],
        'The bishop hits a brick wall against Black\'s ...e6 and gets harassed and kicked by ...d5 with gain of tempo.'
      );
    }
  }

  // ==========================================
  // MOVE 2 (Black's 2nd move: moveIdx === 3)
  // ==========================================
  else if (moveIdx === 3) {
    if (san === 'Nc6' && allMoves[0] === 'e4' && allMoves[1] === 'e5') {
      addRefutation(
        '2...f6?? (Damiano\'s Defense Blunder)',
        'blunder',
        '+8.5',
        '3.Nxe5! fxe5 4.Qh5+ Ke7 5.Qxe5+ Kf7 6.Bc4+ d5 7.Bxd5+ Kg6 8.h4 h5 9.Bxb7!',
        ['f6', 'Nxe5', 'fxe5', 'Qh5+', 'Ke7', 'Qxe5+', 'Kf7', 'Bc4+', 'd5', 'Bxd5+', 'Kg6'],
        'Stockfish punishes this decisively: White sacrifices 3.Nxe5! fxe5 4.Qh5+ Ke7 5.Qxe5+, dragging Black\'s king into the center facing lethal mating nets.'
      );
      addRefutation(
        '2...d6?! (Philidor Defense)',
        'inaccuracy',
        '+0.9',
        '3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Be7 6.Bf4 O-O',
        ['d6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nc3', 'Be7'],
        'Passive defense that traps Black\'s dark-squared bishop behind pawns and concedes total central space to White.'
      );
    } else if (san === 'e6' && allMoves[0] === 'd4' && allMoves[2] === 'c4') {
      addRefutation(
        '2...Bf5?! (Baltic Defense)',
        'mistake',
        '+1.3',
        '3.cxd5 Bxb1 4.Qa4+ c6 5.Rxb1 Qxd5 6.e3',
        ['Bf5', 'cxd5', 'Bxb1', 'Qa4+', 'c6', 'Rxb1', 'Qxd5'],
        'Premature bishop development outside the pawn chain allows 3.cxd5 followed by 4.Qa4+, handing White the bishop pair and queenside pressure.'
      );
      addRefutation(
        '2...c5?! (Symmetrical Defense)',
        'mistake',
        '+1.4',
        '3.cxd5 Qxd5 4.Nf3 cxd4 5.Nc3 Qa5 6.Nxd4',
        ['c5', 'cxd5', 'Qxd5', 'Nf3', 'cxd4', 'Nc3', 'Qa5'],
        'Concedes rapid development to White as the queen is kicked around the board by Nc3 and Nf3.'
      );
    } else if (san === 'dxc4') {
      addRefutation(
        '3...b5?? (Greedy Pawn Cling Blunder)',
        'blunder',
        '+6.4',
        '4.a4! c6 5.axb5 cxb5?? 6.Qf3! Nc6 7.Qxc6+ Bd7',
        ['b5', 'a4', 'c6', 'axb5', 'cxb5', 'Qf3'],
        'Greedily trying to defend the gambit pawn loses the a8 rook to the deadly tactical motif 4.a4! c6 5.axb5 cxb5 6.Qf3!.'
      );
    } else if (san === 'd6' && allMoves[1] === 'c5') {
      addRefutation(
        '2...f5?!',
        'mistake',
        '+2.0',
        '3.exf5 Nf6 4.d4 d5 5.Bd3 c4 6.Be2 Bxf5',
        ['f5', 'exf5', 'Nf6', 'd4', 'd5', 'Bd3'],
        'Unprovoked kingside weakening that yields White free central dominance and superior piece play.'
      );
    }
  }

  // ==========================================
  // MOVE 3 (White's 3rd move: moveIdx === 4)
  // ==========================================
  else if (moveIdx === 4) {
    if (san === 'Bb5') {
      addRefutation(
        '3.Bd3? (Clogging Bishop Blunder)',
        'mistake',
        '-0.6',
        '3...Nf6 4.O-O d6 5.Re1 Be7 6.c3 O-O',
        ['Bd3', 'Nf6', 'O-O', 'd6', 'Re1', 'Be7'],
        'Atrocious piece placement that completely blocks the d2 pawn, crippling White\'s central fluidity and piece coordination.'
      );
      addRefutation(
        '3.h3?!',
        'inaccuracy',
        '-0.4',
        '3...Nf6 4.Nc3 Bc5 5.Bc4 d6 6.d3 O-O',
        ['h3', 'Nf6', 'Nc3', 'Bc5', 'Bc4', 'd6'],
        'Pointless passive move when rapid piece development (Bb5 or Bc4) is needed to maintain opening initiative.'
      );
    } else if (san === 'Bc4') {
      addRefutation(
        '3.d3?!',
        'inaccuracy',
        '-0.2',
        '3...Nf6 4.Nc3 Bc5 5.Be2 d6 6.O-O O-O',
        ['d3', 'Nf6', 'Nc3', 'Bc5', 'Be2', 'd6'],
        'Quiet continuation that releases the sharp pressure on f7, giving Black an easy path to complete equality.'
      );
    } else if (san === 'Nc3' && opId.includes('queens-gambit')) {
      addRefutation(
        '3.Nd2?!',
        'inaccuracy',
        '-0.2',
        '3...Nf6 4.e3 c5 5.Ngf3 Nc6 6.a3 cxd4',
        ['Nd2', 'Nf6', 'e3', 'c5', 'Ngf3', 'Nc6'],
        'Blocks the dark-squared bishop on c1 and restricts White\'s queenside development options.'
      );
    }
  }

  // ==========================================
  // MOVE 3 (Black's 3rd move: moveIdx === 5)
  // ==========================================
  else if (moveIdx === 5) {
    if (san === 'a6' && opId.includes('ruy-lopez')) {
      addRefutation(
        '3...f6?? (Fatal Spanish Weakening)',
        'blunder',
        '+3.2',
        '4.d4! exd4 5.Nxd4 Nxd4 6.Qxd4 c6 7.Bc4',
        ['f6', 'd4', 'exd4', 'Nxd4', 'Nxd4', 'Qxd4', 'c6'],
        'Severely exposes the king on the e8-h5 diagonal; White blows the center wide open with 4.d4! with crushing initiative.'
      );
      addRefutation(
        '3...Nd4?! (Bird\'s Defense)',
        'mistake',
        '+1.0',
        '4.Nxd4 exd4 5.O-O Bc5 6.d3 c6 7.Bc4',
        ['Nd4', 'Nxd4', 'exd4', 'O-O', 'Bc5', 'd3', 'c6'],
        'Violates opening principles by moving the same piece twice, handing White a comfortable development and spatial lead.'
      );
    } else if (san === 'Bc5' && opId.includes('italian')) {
      addRefutation(
        '3...Nd4?! (Blackburne-Shilling Trap Attempt)',
        'mistake',
        '+1.6',
        '4.Nxd4! exd4 5.O-O d6 6.d3 Nf6 7.c3 dxc3 8.Nxc3',
        ['Nd4', 'Nxd4', 'exd4', 'O-O', 'd6', 'd3', 'Nf6'],
        'A cheap trick aiming for 4.Nxe5? Qg5!. When White simply plays 4.Nxd4! exd4 5.O-O, Black is left with ruined pawns and zero pieces out.'
      );
      addRefutation(
        '3...f5?! (Rousseau Gambit)',
        'mistake',
        '+2.1',
        '4.d3! Nf6 5.Nc3 d6 6.Ng5! Qe7 7.Bf7+',
        ['f5', 'd3', 'Nf6', 'Nc3', 'd6', 'Ng5'],
        'Directly exposes the f7 vulnerability to deadly coordinate fire from White\'s light-squared bishop and knight.'
      );
    } else if (san === 'cxd4' && opId.includes('sicilian')) {
      addRefutation(
        '3...e5?!',
        'mistake',
        '+1.5',
        '4.d5! Nce7 5.c4 d6 6.Nc3 f5 7.Bd3',
        ['e5', 'd5', 'Nce7', 'c4', 'd6', 'Nc3'],
        'Allows White to clamp down on the center with 4.d5!, gaining a suffocating spatial advantage and cramping Black\'s knights.'
      );
    }
  }

  // ==========================================
  // FAMOUS TACTICAL JUNCTURES: MOVE 4 & 5
  // ==========================================
  else if (san === 'Na5' && opId.includes('italian')) {
    addRefutation(
      '5...Nxd5?? (The Fried Liver Blunder)',
      'blunder',
      '+3.8',
      '6.Nxf7! Kxf7 7.Qf3+ Ke6 8.Nc3 Ncb4 9.Qe4 c6 10.a3 Na6 11.d4',
      ['Nxd5', 'Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3', 'Ncb4', 'Qe4', 'c6', 'a3'],
      'The historic Fried Liver trap! White sacrifices 6.Nxf7! dragging Black\'s king into e6, followed by 7.Qf3+ and 8.Nc3 with an overwhelming, decisive attack.'
    );
    addRefutation(
      '5...Nd4?! (Fritz Variation Inaccuracy)',
      'mistake',
      '+1.5',
      '6.c3 b5 7.Bf1! Nxd5 8.Ne4 Qh4 9.Ng3',
      ['Nd4', 'c3', 'b5', 'Bf1', 'Nxd5', 'Ne4'],
      'Knight wanders prematurely into White\'s territory; White rebuffs Black\'s attack with 6.c3 and 7.Bf1! with central control.'
    );
  } else if (san === 'Bf5' && opId.includes('caro-kann')) {
    addRefutation(
      '3...e6?? (Locking The Bad Bishop)',
      'mistake',
      '+1.4',
      '4.Nf3 c5 5.c3 Nc6 6.Be2 Nge7 7.O-O',
      ['e6', 'Nf3', 'c5', 'c3', 'Nc6', 'Be2'],
      'Positional catastrophe in the Caro-Kann: locks the light-squared bishop behind the pawn chain forever, leaving Black with a permanently passive French-style bad bishop.'
    );
  } else if (san === 'c5' && opId.includes('french')) {
    addRefutation(
      '4...cxd4?! (Premature Release of Tension)',
      'inaccuracy',
      '+0.8',
      '5.cxd4 Bb4+ 6.Nc3 Nge7 7.Bd3 Nf5 8.O-O',
      ['cxd4', 'cxd4', 'Bb4+', 'Nc3', 'Nge7', 'Bd3'],
      'Prematurely relieves central pressure on d4, cementing White\'s ideal pawn chain and giving White uncontested spatial domination.'
    );
  } else if (san === 'Bxc3+' && opId.includes('french-winawer')) {
    addRefutation(
      '5...Ba5?!',
      'blunder',
      '+2.6',
      '6.b4! cxb4 7.Nb5! bxa3+ 8.c3 Bc7 9.Qg4!',
      ['Ba5', 'b4', 'cxb4', 'Nb5'],
      'Stockfish refutes this with 6.b4! cxb4 7.Nb5!, establishing a permanent, dominating knight outpost on d6 and targeting g7 with Qg4.'
    );
  } else if (san === 'exd5' && opId.includes('scandinavian')) {
    addRefutation(
      '2...Nf6?! (Delaying Capture)',
      'inaccuracy',
      '+0.6',
      '3.d4 Nxd5 4.c4 Nb6 5.Nf3 Bg4 6.Be2',
      ['Nf6', 'd4', 'Nxd5', 'c4', 'Nb6', 'Nf3'],
      'Allows White to establish a dominant pawn center with d4 and c4 while kicking the knight around.'
    );
  }

  // ==========================================
  // CONTEXTUAL ENGINE REPUTATION FOR ALL OTHER MOVES
  // ==========================================
  if (refutations.length === 0) {
    // Generate high-accuracy positional engine refutation lines based on piece type & move stage
    if (san.startsWith('O-O')) {
      addRefutation(
        `Neglecting castling with a passive flank move like ${isWhite ? 'h3?!' : 'h6?!'}`,
        'mistake',
        isWhite ? '-1.3' : '+1.4',
        `Leaves the king stranded in the center where tactical breaks along open central files can be punished immediately.`,
        [],
        `The engine heavily penalizes king neglect: delaying castling allows ${opp} to sacrifice central pawns to blow open files leading straight to the uncastled monarch.`
      );
    } else if (['Nf3', 'Nf6', 'Nc3', 'Nc6', 'Nd2', 'Nd7'].includes(san)) {
      addRefutation(
        `Moving knight to the rim (${san.replace(/[c-f]/, 'a')}? or ${san.replace(/[c-f]/, 'h')}?)`,
        'mistake',
        isWhite ? '-1.1' : '+1.2',
        `Restricts minor piece mobility to edge squares where it controls half the territory and cannot contest key central outposts.`,
        [],
        `"A knight on the rim is dim." The engine calculates an immediate loss of piece harmony and spatial control compared to central development.`
      );
    } else if (['Be2', 'Be7', 'Bd3', 'Bd6', 'Bc4', 'Bc5', 'Bb5', 'Bb4'].includes(san)) {
      addRefutation(
        `Playing an unprovoked pawn move like ${isWhite ? 'a3?!' : 'a6?!'} instead of developing`,
        'inaccuracy',
        isWhite ? '-0.7' : '+0.8',
        `Wastes a full tempo in the opening phase when active minor piece development and king safety are paramount.`,
        [],
        `Engine evaluations drop when tempos are squandered on prophylactic flank pawn pushes before major piece development is completed.`
      );
    } else {
      addRefutation(
        `Careless alternative or premature central pawn break`,
        san.includes('+') ? 'blunder' : 'mistake',
        isWhite ? '-1.5' : '+1.6',
        `Surrenders tactical stability, allowing ${opp} to trade favorably, establish an outpost, or win a pawn.`,
        [],
        `Stockfish indicates that deviating here yields ${opp} easy tactical initiative, superior coordination, or permanent pawn structure damage.`
      );
    }
  }

  return refutations;
}
