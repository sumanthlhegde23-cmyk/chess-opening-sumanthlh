import { Chess } from 'chess.js';
import { getBadMoveRefutations } from './badMoveEngine.js';

/**
 * Generates move-by-move master explanations for:
 * 1. Why this move is good / best
 * 2. Why alternative moves are bad, a mistake, or a blunder
 * 3. Move classification (best / book / great / critical)
 * 4. Tactical notes and plans
 */
export function explainMove(san, side, moveNum, fenBefore, fenAfter, moveObj, op, v, moveIdx, allMoves) {
  const isWhite = side === 'white';
  const mover = isWhite ? 'White' : 'Black';
  const opp = isWhite ? 'Black' : 'White';
  const pieceNames = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
  const piece = pieceNames[moveObj?.piece] || 'piece';

  let moveQuality = 'book'; // 'best' | 'great' | 'book' | 'critical'
  let whyGoodOrBest = '';
  let mistakesAndBlunders = '';
  let tacticalNote = '';
  let generalSummary = '';

  const opId = op?.id || '';
  const vId = v?.id || '';
  const fullMoveNum = `${moveNum}.${isWhite ? '' : '..'}`;

  // ==========================================
  // MOVE 1 (White 1st move & Black 1st response)
  // ==========================================
  if (moveIdx === 0) {
    // 1.e4, 1.d4, 1.c4, 1.Nf3, etc.
    if (san === 'e4') {
      moveQuality = 'best';
      whyGoodOrBest = 'Stakes an immediate claim on the vital d5 and f5 central squares, frees diagonals for both the light-squared bishop and queen, and establishes rapid development opportunities.';
      mistakesAndBlunders = 'Flank pawn advances like 1.h4? or 1.a4? are bad because they surrender the center without a fight. Pushing 1.f3? (Gedult/Barnes) is a notorious mistake that strips the king of pawn cover along the vulnerable e1-h4 diagonal without aiding piece development.';
      tacticalNote = 'Directly controls d5 and prepares 2.Nf3, 2.d4, or 2.Bc4.';
      generalSummary = 'White opens with the King’s Pawn, maximizing dynamic piece activity and challenging Black for immediate central supremacy.';
    } else if (san === 'd4') {
      moveQuality = 'best';
      whyGoodOrBest = 'Occupies the center with a pawn protected by the queen, establishes control over c5 and e5, and frees the dark-squared bishop for immediate development.';
      mistakesAndBlunders = 'Passive opening moves like 1.e3?! or 1.c3?! are inaccuracies that concede the initiative. Moves like 1.g4? (Grob’s Attack) are borderline blunders that fatally weaken the kingside to 1...d5 2.h3 e5.';
      tacticalNote = 'Firm central anchor on d4; prepares c4 (Queen’s Gambit) or Nf3.';
      generalSummary = 'White adopts the Queen’s Pawn opening, steering the game into rich classical structures with long-term positional pressure.';
    } else if (san === 'c4') {
      moveQuality = 'best';
      whyGoodOrBest = 'The English Opening controls the critical d5 square from the flank without committing the central d- or e-pawns, retaining tremendous structural flexibility.';
      mistakesAndBlunders = 'Directly playing 1.b4?! (Polish/Sokolsky) is unnecessarily loose, giving Black easy targets in the center with 1...e5 2.Bb2 Bxb4.';
      tacticalNote = 'Controls d5 and eyes queenside pawn expansion with Nc3 and g3.';
      generalSummary = 'White initiates flank pressure against d5, preventing Black from comfortably occupying the center with pawns.';
    } else if (san === 'Nf3') {
      moveQuality = 'best';
      whyGoodOrBest = 'Develops a minor piece to its most active square, prevents Black from playing 1...e5, controls d4 and e5, and retains flexibility to transpose into 1.d4, 1.c4, or the Réti/KIA.';
      mistakesAndBlunders = 'Developing the knight to the rim with 1.Nh3? or 1.Na3? is bad ("a knight on the rim is dim") because it controls only 4 squares instead of 8 and does nothing to contest the center.';
      tacticalNote = 'Controls d4 and e5; denies Black an immediate 1...e5.';
      generalSummary = 'The hypermodern Réti approach: develops a knight first, keeping Black guessing regarding White’s central pawn structure.';
    }
  } else if (moveIdx === 1) {
    // 1...e5, 1...c5, 1...e6, 1...c6, 1...d5, 1...Nf6, 1...g6, 1...d6, 1...f5
    if (san === 'e5') {
      moveQuality = 'best';
      whyGoodOrBest = 'Matches White’s central presence head-on, restrains White from establishing an uncontested pawn duo with 2.d4, and activates Black’s dark-squared bishop and queen.';
      mistakesAndBlunders = 'Playing 1...f6? is a terrible mistake that ruins Black’s kingside pawn structure and opens the fatal e8-h5 diagonal. Passive moves like 1...h6? or 1...a6? are bad because White takes complete central dominance with 2.d4.';
      tacticalNote = 'Firm clamp on d4 and f4; prepares 2...Nc6 or 2...Nf6.';
      generalSummary = 'Black claims an equal stake in the center, leading to the classical Open Games.';
    } else if (san === 'c5') {
      moveQuality = 'best';
      whyGoodOrBest = 'The Sicilian Defense is statistically Black’s most aggressive counter to 1.e4. It fights for d4 with a flank c-pawn, creating an asymmetrical pawn structure where Black trades a wing pawn for White’s central d-pawn.';
      mistakesAndBlunders = 'Playing 1...b6?! allows White to seize total central dominance with 2.d4 e6 3.c4. Trying 1...g5? is a catastrophic blunder that weakens the king and loses pawns.';
      tacticalNote = 'Controls d4; prepares queenside counterplay along the semi-open c-file.';
      generalSummary = 'Black launches the Sicilian counter-attack, aiming for dynamic imbalance and queenside initiative.';
    } else if (san === 'e6') {
      moveQuality = 'best';
      whyGoodOrBest = 'Prepares an immediate counter in the center with 2...d5, creating a rock-solid pawn chain while keeping kingside pawn structure compact and safe.';
      mistakesAndBlunders = 'Rushing with 1...d5? immediately against 1.e4 (Scandinavian) forces the queen out early after 2.exd5 Qxd5 3.Nc3. The French 1...e6 prepares ...d5 with pawn backing.';
      tacticalNote = 'Reinforces the d5 breakthrough; prepares ...d5 on the next move.';
      generalSummary = 'The French Defense: Black accepts a temporarily hemmed-in light-squared bishop in exchange for an impenetrable central barrier.';
    } else if (san === 'c6') {
      moveQuality = 'best';
      whyGoodOrBest = 'The signature move of the Caro-Kann. Black prepares ...d5 supported by a pawn without locking in the light-squared bishop (unlike the French 1...e6).';
      mistakesAndBlunders = 'Moves like 1...f5?! against 1.e4 (Duras Gambit) are dubious and allow 2.exf5 Nf6 3.g4 with a fierce kingside attack.';
      tacticalNote = 'Sets up 2...d5 while preserving the c8-h3 diagonal for the bishop.';
      generalSummary = 'Black prepares a rock-solid central challenge with ...d5 while maintaining ideal piece mobility.';
    } else if (san === 'd5') {
      moveQuality = 'best';
      whyGoodOrBest = 'Directly matches White’s d4 pawn, controls e4 and c4, and establishes a secure classical foothold in the center.';
      mistakesAndBlunders = 'In reply to 1.d4, careless moves like 1...f6? or 1...h5? are dreadful mistakes that concede space and compromise king defense.';
      tacticalNote = 'Denies White 2.e4; sets up Queen’s Gambit or Slav structures.';
      generalSummary = 'Black establishes classical central equality with 1...d5.';
    } else if (san === 'Nf6') {
      moveQuality = 'best';
      whyGoodOrBest = 'Develops the knight actively, restrains White from playing e4, and keeps options open for the King’s Indian, Grunfeld, Nimzo-Indian, or Alekhine Defense.';
      mistakesAndBlunders = 'Playing 1...Nc6?! allows White to push 2.d5 in many lines, driving the knight away with tempo.';
      tacticalNote = 'Controls e4 and d5; sets up hypermodern defenses.';
      generalSummary = 'A flexible, modern reply preventing an easy 2.e4 and preparing active counterplay.';
    } else if (san === 'f5') {
      moveQuality = 'good';
      whyGoodOrBest = 'The Dutch Defense fights for the e4 square from move one, creating immediate asymmetry and aggressive attacking chances against White’s kingside.';
      mistakesAndBlunders = 'Allowing 2.e4 (Staunton Gambit) can be dangerous if Black does not know the theory, but 1...f5 is far better than passive errors like 1...h6?';
      tacticalNote = 'Clamps down on e4; opens the f-file after future ...fxe4.';
      generalSummary = 'Black seeks unbalanced, fighting chess from the very first move.';
    } else if (san === 'g6') {
      moveQuality = 'best';
      whyGoodOrBest = 'The Modern / Pirc setup. Black allows White to occupy the center with pawns, intending to counterattack it from the flanks with ...Bg7, ...c5, and ...d6.';
      mistakesAndBlunders = 'If Black plays passively without undermining the center later, White’s large pawn center can crush Black. The fianchetto must be backed by concrete counter-blows.';
      tacticalNote = 'Prepares the kingside fianchetto on the long a1-h8 diagonal.';
      generalSummary = 'A hypermodern choice that tempts White forward to create targets for Black’s bishop.';
    }
  }

  // ==========================================
  // MOVE 2 & 3: CRITICAL BRANCHES & TRAPS
  // ==========================================
  else if (moveIdx === 2) {
    // White's 2nd move
    if (san === 'Nf3') {
      moveQuality = 'best';
      whyGoodOrBest = 'Adheres to the timeless principle: develop pieces toward the center with a threat. Attacks the undefended e5 pawn while taking control of d4.';
      mistakesAndBlunders = 'Trying 2.Qh5?! (Wayward Queen Attack / Scholar’s Mate threat) is premature: after 2...Nc6 3.Bc4 g6 4.Qf3 Nf6, Black develops with tempo while White’s queen is chased around. Playing 2.f4 (King’s Gambit) is double-edged, while 2.Nh3? is a passive mistake.';
      tacticalNote = 'Attacks e5; forces Black to respond defensively.';
      generalSummary = 'White develops the knight with an immediate attack on Black’s e5 pawn.';
    } else if (san === 'c4') {
      moveQuality = 'best';
      whyGoodOrBest = 'The Queen’s Gambit! White attacks Black’s central d5 pawn from the flank, aiming to trade a wing pawn for a center pawn and establish a dominant e4-d4 center.';
      mistakesAndBlunders = 'Playing 2.Bf4 (London) is solid, but 2.Bg5?! (Levitsky Attack) without preparation is less challenging. Playing 2.c3? is timid and deprives the queen’s knight of its best square.';
      tacticalNote = 'Puts immediate pressure on d5; offers a temporary pawn sacrifice.';
      generalSummary = 'White challenges Black’s center immediately with the Queen’s Gambit.';
    } else if (san === 'Nc3') {
      moveQuality = 'best';
      whyGoodOrBest = 'Develops the queen’s knight to its optimal square, guarding e4 and contesting d5 without blocking the c-pawn in Vienna or English structures.';
      mistakesAndBlunders = '2.f4 (King’s Gambit) compromises king safety compared to the solid 2.Nc3 (Vienna Game).';
      tacticalNote = 'Reinforces e4 and prepares 3.f4 (Vienna Gambit) or 3.Bc4.';
      generalSummary = 'White develops naturally, maintaining tension and hiding intentions.';
    } else if (san === 'd4') {
      moveQuality = 'best';
      whyGoodOrBest = 'Immediately blasts the center open (Scotch Game or Open Sicilian). White uses superior development to open lines for pieces.';
      mistakesAndBlunders = '2.c3 (Alapin) is good, but 2.Bc4 against 1...c5 allows Black easy equality with 2...e6 and 3...d5.';
      tacticalNote = 'Forces pawn exchanges that open the d-file and diagonals.';
      generalSummary = 'White challenges the center directly, seeking open piece play.';
    } else if (san === 'Bf4') {
      moveQuality = 'best';
      whyGoodOrBest = 'The hallmark of the London System! White develops the dark-squared bishop outside the pawn chain before playing e3, preventing it from becoming a bad bishop.';
      mistakesAndBlunders = 'Playing 2.e3?! prematurely locks the bishop inside the pawn structure on c1, turning it into a passive defender.';
      tacticalNote = 'Controls the key e5 and c7 squares outside the pawn skeleton.';
      generalSummary = 'White develops the bishop actively before fortifying the d4 center with e3 and c3.';
    }
  } else if (moveIdx === 3) {
    // Black's 2nd move
    if (san === 'Nc6') {
      moveQuality = 'best';
      whyGoodOrBest = 'The most natural and active defense of the e5 pawn. Black develops a piece toward the center, controls d4 and e5, and keeps all defensive options open.';
      mistakesAndBlunders = 'Playing 2...f6? is Damiano’s infamous blunder! White refutes it decisively with 3.Nxe5! fxe5 4.Qh5+ g6 5.Qxe5+ winning the h8 rook, or 4...Ke7 5.Qxe5+ Kf7 6.Bc4+ with a decisive attack. Defending with 2...d6 (Philidor) is passive and blocks the dark-squared bishop.';
      tacticalNote = 'Protects e5 and contests d4.';
      generalSummary = 'Black develops the knight to its natural post, defending e5 cleanly.';
    } else if (san === 'd6') {
      moveQuality = 'best';
      whyGoodOrBest = 'In the Sicilian, this shields e5, controls c5, and prepares ...Nf6 without allowing White to push an annoying e5.';
      mistakesAndBlunders = 'Playing 2...f5?! in the Sicilian is an unprovoked mistake that weakens the e8-h5 diagonal and lags in development.';
      tacticalNote = 'Controls e5 and keeps lines open for the c8 bishop.';
      generalSummary = 'Black establishes a flexible pawn structure leading to the Najdorf, Dragon, or Classical lines.';
    } else if (san === 'e6') {
      moveQuality = 'best';
      whyGoodOrBest = 'In Queen’s Gambit lines (QGD), this fortifies d5 with a rock-solid pawn chain, blunting White’s c4 pressure. In French lines, it reinforces the center.';
      mistakesAndBlunders = 'Playing 2...Bf5?! against 2.c4 in the QGD is a tactical mistake: White plays 3.cxd5 followed by 4.Qb3!, double-attacking b7 and d5 and winning material.';
      tacticalNote = 'Anchors d5; shields the king along the central files.';
      generalSummary = 'Black establishes an unshakeable central foundation with the Queen’s Gambit Declined.';
    } else if (san === 'c6') {
      moveQuality = 'best';
      whyGoodOrBest = 'The Slav Defense! Black supports d5 with the c-pawn instead of the e-pawn, leaving the light-squared bishop free to develop to f5 or g4.';
      mistakesAndBlunders = '2...c5? (Symmetrical Defense) is inaccurate because 3.cxd5 Qxd5 4.Nf3 cxd4 5.Nc3 gives White a massive developmental lead.';
      tacticalNote = 'Maintains d5 while preserving the c8 bishop’s diagonal.';
      generalSummary = 'The Slav Defense provides maximum solidity without compromising bishop mobility.';
    } else if (san === 'dxc4') {
      moveQuality = 'best';
      whyGoodOrBest = 'The Queen’s Gambit Accepted (QGA). Black relieves central tension and tests White’s ability to regain the pawn smoothly.';
      mistakesAndBlunders = 'Trying to stubbornly cling to the c4 pawn with 3...b5? is a notorious beginner’s blunder! White plays 4.a4! c6 5.axb5 cxb5?? 6.Qf3!, winning the trapped a8 rook on the spot.';
      tacticalNote = 'Temporarily wins a pawn; Black must not try to hold it with ...b5.';
      generalSummary = 'Black accepts the gambit pawn, prioritizing rapid central piece development over pawn defense.';
    } else if (san === 'Qxd5') {
      moveQuality = 'best';
      whyGoodOrBest = 'In the Scandinavian Defense, Black eliminates White’s central pawn. Although the queen is developed early, it retreats safely to a5, d6, or d8.';
      mistakesAndBlunders = 'Recapturing with 2...Nf6 (Modern Scandinavian) is also viable, but playing 2...f6? is a blunder that loses time and weakens the king.';
      tacticalNote = 'Regains the pawn; prepares an immediate queen retreat upon 3.Nc3.';
      generalSummary = 'Black re-establishes material balance and prepares to tuck the queen away safely.';
    }
  }

  // ==========================================
  // MOVE 3 (White's move 3)
  // ==========================================
  else if (moveIdx === 4) {
    if (san === 'Bb5') {
      moveQuality = 'best';
      whyGoodOrBest = 'The defining move of the Ruy Lopez. White pressures the c6 knight, which is the primary defender of Black’s e5 pawn, creating indirect central pressure and clearing the way for kingside castling.';
      mistakesAndBlunders = 'Playing 3.Bc4 is the Italian Game (also good), but passive moves like 3.d3 or 3.h3?! surrender the initiative and let Black equalize easily with 3...Bc5.';
      tacticalNote = 'Indirectly targets e5 by threatening to remove the guard on c6.';
      generalSummary = 'White pins and pressures the c6 knight, beginning the deep positional struggle of the Spanish Game.';
    } else if (san === 'Bc4') {
      moveQuality = 'best';
      whyGoodOrBest = 'The Italian Game. White rapidly develops the bishop along the open a2-g7 diagonal, directly taking aim at Black’s weakest square on the board: f7 (protected only by the king).';
      mistakesAndBlunders = 'Playing 3.Bb5+?! against the Sicilian is good (Rossolimo), but against 1...e5, playing 3.Bd3? is a terrible mistake because it clogs the d-file and blocks the d2 pawn.';
      tacticalNote = 'Targets the fragile f7 square and prepares swift kingside castling.';
      generalSummary = 'White points firepower directly at Black’s vulnerable f7 pawn, seeking rapid piece pressure.';
    } else if (san === 'd4') {
      moveQuality = 'best';
      whyGoodOrBest = 'In the Scotch Game or Open Sicilian, White strikes directly at the center to open lines for the bishops and queen, utilizing their development advantage.';
      mistakesAndBlunders = 'Delaying d4 with timid moves like 3.a3?! gives Black time to seize the initiative with ...d5 or ...Nf6.';
      tacticalNote = 'Blasts open central files and diagonals for White’s pieces.';
      generalSummary = 'White forces immediate central liquidation to maximize piece mobility.';
    } else if (san === 'b4') {
      moveQuality = 'great';
      whyGoodOrBest = 'The Evans Gambit! White sacrifices a flank b-pawn to deflect Black’s c5 bishop, gaining crucial tempos with c3 and d4 to build a steamroller pawn center.';
      mistakesAndBlunders = 'Slow play allows Black to consolidate. The gambit demands energetic, tempo-gaining follow-ups.';
      tacticalNote = 'Deflects Black’s bishop and clears the c3 square for a pawn center.';
      generalSummary = 'White uncorks Frank Evans’ romantic gambit, prioritizing rapid development and attack over material.';
    } else if (san === 'Nc3') {
      moveQuality = 'best';
      whyGoodOrBest = 'Develops a piece to its most natural outpost, reinforcing central control over d5 and e4 without any pawn weaknesses.';
      mistakesAndBlunders = 'Developing 3.Nd2?! in 1.d4 lines is an inaccuracy because it blocks the dark-squared bishop on c1.';
      tacticalNote = 'Increases control over d5 and e4.';
      generalSummary = 'A model developing move that increases pressure on the central board.';
    }
  }

  // ==========================================
  // MOVE 3 (Black's move 3)
  // ==========================================
  else if (moveIdx === 5) {
    if (san === 'a6') {
      moveQuality = 'best';
      whyGoodOrBest = 'Morphy’s Defense in the Ruy Lopez. Black puts the question to the b5 bishop immediately, forcing White to declare their intentions while preparing queenside space with ...b5.';
      mistakesAndBlunders = 'Playing 3...f6? is a terrible blunder that fatally exposes the king. Playing 3...Nd4?! (Bird’s Defense) moves the knight twice in the opening and loses development time.';
      tacticalNote = 'Forces White’s bishop to retreat (4.Ba4) or trade (4.Bxc6).';
      generalSummary = 'Black immediately challenges the Spanish bishop, securing queenside counterplay.';
    } else if (san === 'Nf6') {
      moveQuality = 'best';
      whyGoodOrBest = 'In the Berlin Defense or Two Knights Defense, Black develops the kingside knight with an attack on White’s undefended e4 pawn, prioritizing counter-attack over passive defense.';
      mistakesAndBlunders = 'Passive moves like 3...h6? waste a move when rapid piece development is essential to survive White’s central pressure.';
      tacticalNote = 'Counter-attacks White’s e4 pawn directly.';
      generalSummary = 'Black applies counter-pressure against White’s e4 pawn, initiating dynamic play.';
    } else if (san === 'Bc5') {
      moveQuality = 'best';
      whyGoodOrBest = 'Giuoco Piano (The Quiet Game). Black mirrors White’s active bishop placement, targeting White’s f2 square and securing active piece play before castling.';
      mistakesAndBlunders = 'Playing 3...Be7?! (Hungarian Defense) is too passive, allowing White free rein in the center with 4.d4.';
      tacticalNote = 'Controls the key d4 outpost and eyes White’s f2 square.';
      generalSummary = 'Black deploys the bishop to its most harmonious post, restraining White’s central ambitions.';
    } else if (san === 'cxd4') {
      moveQuality = 'best';
      whyGoodOrBest = 'In the Open Sicilian, Black executes the thematic strategic trade: swapping a wing c-pawn for White’s central d-pawn, creating a long-term central pawn majority.';
      mistakesAndBlunders = 'Trying 3...e5?! allows White 4.d5 with a huge spatial bind. Recapturing is mandatory.';
      tacticalNote = 'Eliminates White’s center pawn and opens the semi-open c-file.';
      generalSummary = 'Black captures toward the center, claiming an enduring positional trump in the pawn structure.';
    }
  }

  // ==========================================
  // FAMOUS TACTICAL JUNCTURES & TRAPS
  // ==========================================

  // Fried Liver Attack juncture (Italian Game: 4.Ng5 d5 5.exd5 ...)
  else if (san === 'Ng5' && opId.includes('italian')) {
    moveQuality = 'best';
    whyGoodOrBest = 'White exploits Black’s 3...Nf6 by coordinating knight and bishop on f7, threatening a devastating fork on f7.';
    mistakesAndBlunders = 'Playing 4.d3 is solid, but 4.Ng5 immediately tests Black’s tactical knowledge. Black must know 4...d5 or face disaster.';
    tacticalNote = 'Creates an immediate double attack on the f7 pawn.';
    generalSummary = 'White launches the Two Knights attack, targeting Black’s vulnerable f7 pawn.';
  } else if (san === 'Na5' && opId.includes('italian')) {
    moveQuality = 'best';
    whyGoodOrBest = 'The Chigorin / Bogoljubov move! Black attacks White’s light-squared bishop, driving it away and securing counterplay.';
    mistakesAndBlunders = 'Recapturing with 5...Nxd5? is the notorious blunder that walks straight into the Fried Liver Attack: 6.Nxf7! Kxf7 7.Qf3+ Ke6 8.Nc3, completely demolishing Black’s king!';
    tacticalNote = 'Attacks the c4 bishop and prevents the catastrophic 6.Nxf7 sacrifice.';
    generalSummary = 'Black avoids the Fried Liver trap with the only correct master reply, counter-attacking White’s bishop.';
  }

  // Berlin Wall endgame transition (8.Qxd8+ Kxd8)
  else if (san === 'Qxd8+' && vId.includes('berlin')) {
    moveQuality = 'best';
    whyGoodOrBest = 'White enters the famed Berlin endgame. White ruins Black’s castling rights, inflicts doubled c-pawns, and aims to exploit their 4 vs 3 kingside pawn majority.';
    mistakesAndBlunders = 'Avoiding the queen trade with 8.Qe2 allows Black’s pieces to coordinate smoothly with ...Be7 and ...O-O.';
    tacticalNote = 'Forces Black’s king to d8, permanently stripping castling privileges.';
    generalSummary = 'White trades queens to initiate the famous Berlin Wall endgame.';
  } else if (san === 'Kxd8' && vId.includes('berlin')) {
    moveQuality = 'best';
    whyGoodOrBest = 'The only good move. Black recaptures with the king. In queenless endgames, the king is completely safe on d8/c7 and serves as an active endgame piece, while Black retains the deadly bishop pair.';
    mistakesAndBlunders = 'Any delay or miscalculation would lose material. Moving the king to d8 is forced and strategically sound.';
    tacticalNote = 'The king is active in the endgame; bishop pair compensates for doubled pawns.';
    generalSummary = 'Black’s king stands proud on d8, ready to coordinate rooks along the e- and d-files.';
  }

  // Marshall Attack sacrifice (8...d5!)
  else if (san === 'd5' && vId.includes('marshall')) {
    moveQuality = 'great';
    whyGoodOrBest = 'The Marshall Attack! Black sacrifices a central pawn to tear open the center, seize rapid development, and launch a furious kingside assault against White’s king.';
    mistakesAndBlunders = 'Playing quietly with 8...d6 enters the classical closed lines. Frank Marshall’s 8...d5! is the ultimate fighting response.';
    tacticalNote = 'Blasts open lines for Black’s bishops and queen against White’s kingside.';
    generalSummary = 'Black uncorks the Marshall Attack, offering a pawn for unstoppable piece activity.';
  }

  // Sicilian Najdorf 5...a6!
  else if (san === 'a6' && (vId.includes('najdorf') || vId.includes('sicilian-najdorf'))) {
    moveQuality = 'best';
    whyGoodOrBest = 'The legendary Najdorf move! It denies White’s knights and light-squared bishop the critical b5 square, prepares queenside expansion with ...b5, and keeps maximum flexibility for Black’s pawns.';
    mistakesAndBlunders = 'Playing 5...e5?! immediately without ...a6 allows 6.Bb5+! or 6.Ndb5!, giving White overwhelming control of the weakened d5 hole.';
    tacticalNote = 'Prophylactically clamps down on b5; sets up ...b5 and ...Bb7.';
    generalSummary = 'Black plays the hallmark move of the Najdorf, ensuring absolute piece safety before striking back.';
  }

  // Sicilian Dragon Yugoslav Attack (Be3, f3, Qd2, O-O-O, Bc4, h4-h5)
  else if (san === 'g6' && vId.includes('dragon')) {
    moveQuality = 'best';
    whyGoodOrBest = 'The Dragon setup! The dark-squared bishop fianchettos to g7 to breathe fire down the long diagonal across the entire board, eyeing White’s queenside.';
    mistakesAndBlunders = 'Playing 5...e6 switches to the Scheveningen, but mixing systems without care can leave weaknesses on d6 and the dark squares.';
    tacticalNote = 'Prepares ...Bg7 to control the vital long diagonal.';
    generalSummary = 'Black enters the Sicilian Dragon, preparing to duel White in opposite-side castling battles.';
  }

  // French Winawer 3...Bb4 pin
  else if (san === 'Bb4' && vId.includes('winawer')) {
    moveQuality = 'best';
    whyGoodOrBest = 'The Winawer pin! Black pins White’s c3 knight against the king, undermining White’s e4 defense and threatening to damage White’s queenside pawns with ...Bxc3+.';
    mistakesAndBlunders = 'Playing 3...c5 allows 4.exd5, while 3...Nf6 (Classical) leads to different pawn structures. The pin is Black’s most uncompromising weapon.';
    tacticalNote = 'Pins the c3 knight and threatens 4...dxe4.';
    generalSummary = 'Black pins White’s knight, establishing sharp counterplay against White’s center.';
  }

  // Caro-Kann Advance 3...Bf5!
  else if (san === 'Bf5' && (vId.includes('advance') || opId.includes('caro'))) {
    moveQuality = 'best';
    whyGoodOrBest = 'The core concept of the Caro-Kann! Black develops the light-squared bishop outside the pawn chain before locking the center with ...e6, avoiding the "bad bishop" dilemma that plagues the French Defense.';
    mistakesAndBlunders = 'Playing 3...e6? first is a positional blunder: it traps the bishop on c8 forever, turning Black into a strictly inferior version of the French Defense!';
    tacticalNote = 'Active bishop placement on the h7-b1 diagonal before closing the pawn gate.';
    generalSummary = 'Black develops the bishop outside the pawn chain, securing ideal piece harmony.';
  }

  // King's Indian Mar del Plata (8...Ne7 followed by ...f5)
  else if (san === 'Ne7' && (vId.includes('classical') || vId.includes('mar-del-plata') || opId.includes('kings-indian'))) {
    moveQuality = 'best';
    whyGoodOrBest = 'The starting point of the epic Mar del Plata battle. Black unblocks the f-pawn to prepare the unstoppable kingside pawn storm ...f5-f4 followed by ...g5, ...Ng6, and ...h5.';
    mistakesAndBlunders = 'Retreating 8...Nb8?! is passive and wastes two moves. 8...Na5?! strands the knight on the rim without prospects.';
    tacticalNote = 'Clears the f7 pawn for an immediate ...f5 pawn break.';
    generalSummary = 'Black relocates the knight to make way for the thematic kingside attack.';
  }

  // Castling moves (O-O and O-O-O)
  else if (san === 'O-O') {
    moveQuality = 'best';
    whyGoodOrBest = 'Safeguards the king behind a protective pawn barrier while activating the rook on the central files for tactical operations.';
    mistakesAndBlunders = 'Delaying castling to hunt pawns or make unnecessary pawn pushes often results in king exposure and devastating central pawn breaks (like d4 or e5) that catch the uncastled king.';
    tacticalNote = 'King reaches maximum safety; rook connects with central files.';
    generalSummary = `${mover} castles kingside, completing a fundamental tenet of opening mastery.`;
  } else if (san === 'O-O-O') {
    moveQuality = 'great';
    whyGoodOrBest = 'Castling queenside safeguards the king while instantly activating the rook directly on the central d-file with tempo, signaling opposite-side castling warfare.';
    mistakesAndBlunders = 'Queenside castling is a mistake if the queenside pawns are already fractured or overextended, as the king can become an immediate target for open b- and c-file attacks.';
    tacticalNote = 'Places the rook directly on the d-file; signals aggressive opposite-side attacks.';
    generalSummary = `${mover} castles queenside, bringing the rook into play and accelerating attacking plans.`;
  }

  // Captures
  else if (moveObj?.captured) {
    const capPiece = pieceNames[moveObj.captured] || 'piece';
    moveQuality = san.includes('+') ? 'critical' : 'best';
    whyGoodOrBest = `${mover} strategically eliminates ${opp}’s ${capPiece} on ${moveObj.to}, resolving central tension, opening vital lines for attack, and altering the pawn structure in their favor.`;
    mistakesAndBlunders = `Failing to recapture or capturing with the wrong piece often drops material or concessions of central outposts. Reckless captures that open files toward your own king are serious mistakes.`;
    tacticalNote = `Removes key defender or central outpost; opens adjacent files for rooks.`;
    generalSummary = `${mover} executes a critical capture on ${moveObj.to}, shaping the piece balance and board dynamics.`;
  }

  // Standard developing piece moves
  else if (['Nf3', 'Nf6', 'Nc3', 'Nc6', 'Nbd2', 'Nbd7', 'Nge2', 'Ne2'].includes(san)) {
    moveQuality = 'best';
    whyGoodOrBest = `${mover} develops a knight to control vital central squares, prepare castling, and increase coordination without creating any structural pawn weaknesses.`;
    mistakesAndBlunders = `Neglecting piece development to make redundant pawn moves (like a6, h6, a3, h3) when pieces are still sitting on the back rank is an amateur inaccuracy that hands over the initiative.`;
    tacticalNote = `Reinforces central squares and supports upcoming pawn levers.`;
    generalSummary = `${mover} brings another minor piece into the fight, improving central dominance.`;
  } else if (['Be2', 'Be7', 'Bd3', 'Bd6', 'Bc4', 'Bc5', 'Bb3', 'Bb7', 'Bg2', 'Bg7'].includes(san)) {
    moveQuality = 'best';
    whyGoodOrBest = `${mover} develops the bishop to an active diagonal, providing essential king protection, breaking pins, and preparing harmonious castling.`;
    mistakesAndBlunders = `Placing bishops on squares where they block central pawns (e.g. Bd3 blocking the d-pawn, or Be7 blocking the queen prematurely) without concrete plans is a positional mistake.`;
    tacticalNote = `Directs long-range diagonals across key files and prepares castling.`;
    generalSummary = `${mover} optimizes bishop placement to exert maximum positional influence.`;
  } else if (['Bg5', 'Bg4', 'Bf4', 'Bf5'].includes(san)) {
    moveQuality = 'best';
    whyGoodOrBest = `${mover} develops the bishop outside the pawn chain to create an annoying pin or seize key outposts before locking the central structure.`;
    mistakesAndBlunders = `Developing the bishop before securing central safety can sometimes allow tactical counter-punches like ...Qa5+ or ...Qb6 targeting undefended pawns.`;
    tacticalNote = `Pins enemy pieces against higher-value targets or exerts control over key dark/light squares.`;
    generalSummary = `${mover} deploys the bishop proactively to disrupt enemy coordination.`;
  } else if (san === 'c3' || san === 'c6') {
    moveQuality = 'best';
    whyGoodOrBest = `Builds a solid pawn foundation to support the d4/d5 central anchor, blunts opposing knight outposts, and controls key squares in the center.`;
    mistakesAndBlunders = `Playing c3/c6 deprives the queen’s knight of its natural c3/c6 square; it is only good if compensating central control or a pawn push is achieved.`;
    tacticalNote = `Prepares or supports the central pawn advance.`;
    generalSummary = `${mover} fortifies the central pawn structure with precision.`;
  } else if (san === 'h3' || san === 'h6') {
    moveQuality = 'good';
    whyGoodOrBest = `A prophylactic pawn move designed to permanently deny enemy knights and bishops the annoying g4/g5 outposts, preserving piece harmony.`;
    mistakesAndBlunders = `Playing h3/h6 as an automatic habit without specific reason is a waste of time (loss of tempo) and slightly weakens the king’s pawn shield. It should only be played to stop a concrete pin.`;
    tacticalNote = `Controls g4/g5; prevents annoying pins against the king’s knight.`;
    generalSummary = `${mover} employs prophylaxis to eliminate opposing threats before they materialize.`;
  }

  // Fallback for any other moves
  if (!whyGoodOrBest) {
    moveQuality = san.includes('+') ? 'critical' : 'best';
    whyGoodOrBest = `${mover} improves piece activity, maintains central balance, and advances the strategic plan of the ${op?.name || 'opening'} repertoire.`;
    mistakesAndBlunders = `Deviating with passive or careless alternatives allows ${opp} to seize the initiative, exploit pawn weaknesses, or take control of key central squares.`;
    tacticalNote = `Strengthens board presence and coordinates with existing piece layout.`;
    generalSummary = `${mover} plays ${san}, reinforcing the positional themes of this variation.`;
  }

  // Compute concrete engine refutation lines for bad alternatives
  const badMoveRefutations = getBadMoveRefutations(
    san,
    side,
    moveNum,
    fenBefore,
    fenAfter,
    moveObj,
    op,
    v,
    moveIdx,
    allMoves
  );

  // Create full unified explanation string
  const explanation = `${generalSummary} Why this move is best: ${whyGoodOrBest} Common mistakes/blunders to avoid: ${mistakesAndBlunders}`;

  return {
    moveNumber: moveNum,
    notation: san,
    side,
    explanation,
    moveQuality,
    whyGoodOrBest,
    mistakesAndBlunders,
    tacticalNote,
    badMoveRefutations,
    fen: fenAfter
  };
}
