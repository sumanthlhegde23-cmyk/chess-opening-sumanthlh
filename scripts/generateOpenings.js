// Generator script to construct and validate all 20 chess openings x 12 variations with move-by-move explanations
import { Chess } from 'chess.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Move explainer helper to create rich, contextual explanations for standard moves
function getMoveExplanation(san, side, moveNum, prevSan, context) {
  const isWhite = side === 'white';
  const mover = isWhite ? 'White' : 'Black';
  const opponent = isWhite ? 'Black' : 'White';

  // Custom overrides from context
  if (context && context[san]) {
    return context[san];
  }

  // Tactical / positional taxonomy
  if (san === 'e4') {
    return isWhite
      ? "White stakes an immediate claim in the center, controls d5 and f5, and frees diagonals for the light-squared bishop and queen."
      : "Black strikes at the center, contesting White's space and opening diagonals for quick counterplay.";
  }
  if (san === 'e5') {
    return "Black matches White's central footprint, preventing White from freely playing d4 while opening routes for the king's bishop and queen.";
  }
  if (san === 'd4') {
    return isWhite
      ? "White establishes a commanding classical pawn center, controlling c5 and e5 while providing an open highway for the dark-squared bishop."
      : "Black seizes the d4 square, disrupting White's pawn coordination and gaining active central presence.";
  }
  if (san === 'd5') {
    return "Black firmly stakes d5, preventing White from uncontested central dominance and fixing White's pawn structure.";
  }
  if (san === 'c4') {
    return isWhite
      ? "The defining wing thrust against d5. White sacrifices or pressures a flank pawn to eliminate Black's central anchor and gain the center."
      : "Black challenges White's central bind with a flank pawn advance, undermining White's control over d4.";
  }
  if (san === 'c5') {
    return "The trademark Sicilian counter. Rather than mirroring with e5, Black fights asymmetrically for central control (d4) from the c-file.";
  }
  if (san === 'c6') {
    return "The Caro-Kann preparation. Black prepares to support the d5 thrust with a solid pawn pawn-chain without blocking the c8 bishop.";
  }
  if (san === 'e6') {
    return "A resilient defensive move preparing d7-d5. Black accepts a temporarily restricted light-squared bishop in exchange for unbreakable central resistance.";
  }
  if (san === 'd6') {
    return "A flexible positional pawn move that guards e5 and c5, laying the foundation for kingside fianchetto or hypermodern counter-strikes.";
  }
  if (san === 'f5') {
    return "An ambitious, asymmetric flank lunge. Black directly fights for the e4 square from move one, accepting some kingside exposure for aggressive chances.";
  }
  if (san === 'Nf3') {
    return isWhite
      ? "Developing the knight towards the center with tempo, exerting pressure on e5 and preparing kingside castling."
      : "Developing the knight toward the center, defending key light squares and accelerating castling.";
  }
  if (san === 'Nf6') {
    return "The most flexible and active developmental move. Black exerts counter-pressure on e4, prevents easy White expansion, and prepares kingside castling.";
  }
  if (san === 'Nc3') {
    return isWhite
      ? "Developing the queen's knight to its optimal central outpost, reinforcing e4 and fighting for the critical d5 square."
      : "Black develops the knight to c6, contesting d4 and supporting central pawn levers.";
  }
  if (san === 'Nc6') {
    return "Developing the knight to put direct pressure on d4 and defend e5, contesting the central tension.";
  }
  if (san === 'Bb5') {
    return isWhite
      ? "The hallmark Ruy Lopez bishop pin. White pressures the knight defending e5, aiming to undermine Black's central hold indirectly."
      : "Black develops the dark-squared bishop with check or a pin on White's c3 knight, generating immediate tactical counter-pressure.";
  }
  if (san === 'Bb4' || san === 'Bb4+') {
    return "Black pins or checks White's knight on c3, challenging White's control of e4 and creating doubled pawns if White is forced to accept exchange.";
  }
  if (san === 'Bc4') {
    return "The Italian bishop development. White targets Black's vulnerable f7 pawn, the weakest square in Black's camp before castling.";
  }
  if (san === 'Bc5') {
    return "Active piece development pointing at White's f2 square and neutralizing White's d4 aspirations.";
  }
  if (san === 'Be7') {
    return "A solid, classical bishop placement that unpins the knight, shields the king, and prepares smooth kingside castling.";
  }
  if (san === 'Be2') {
    return "A modest, harmonious developing move. White avoids tactical pins, protects the king, and retains dynamic flexibility.";
  }
  if (san === 'Be3') {
    return "Developing the dark-squared bishop to reinforce the center and prepare queenside castling or battery with the queen.";
  }
  if (san === 'Bg5') {
    return "An active pin on the knight, restricting opponent mobility and threatening to shatter the pawn fortress around the king.";
  }
  if (san === 'Bg4') {
    return "Pinning White's knight on f3, undermining White's control over d4 and e5.";
  }
  if (san === 'Bf4') {
    return "The classic London bishop deployment. White develops the bishop outside the pawn chain before locking it with e3.";
  }
  if (san === 'Bf5') {
    return "Developing the light-squared bishop outside the pawn structure before playing ...e6, avoiding passive piece placement.";
  }
  if (san === 'g3') {
    return "Preparing to fianchetto the light-squared bishop on g2, exerting potent diagonal laser pressure across the entire long diagonal.";
  }
  if (san === 'g6') {
    return "Preparing the kingside fianchetto. The dark-squared bishop will exert heavy pressure along the h8-a1 diagonal.";
  }
  if (san === 'Bg2') {
    return "Placing the bishop on the king's long diagonal, dominating the center from a distance in true hypermodern fashion.";
  }
  if (san === 'Bg7') {
    return "The bishop settles on the long diagonal, aiming directly at White's central pawns and queenside queens.";
  }
  if (san === 'a6') {
    return isWhite
      ? "White prevents black pieces from invading b5 and prepares a potential b4 expansion."
      : "Crucial prophylaxis. Black keeps White's knights and bishops off the b5 outpost and prepares ...b5 expansion.";
  }
  if (san === 'a4') {
    return "White halts Black's planned ...b5 pawn advance on the queenside and secures outposts on the a-file.";
  }
  if (san === 'a3') {
    return "Prophylactic pawn step curbing opponent piece jumps to b4 and preparing b4 queenside expansion.";
  }
  if (san === 'h3') {
    return "Calm prophylactic measure. White prevents irritating pins by ...Bg4 or knight incursions to g4.";
  }
  if (san === 'h6') {
    return "Black safeguards the g5 square, preventing enemy knights or bishops from creating uncomfortable pins.";
  }
  if (san === 'b4') {
    return "An aggressive queenside pawn thrust, gaining space, chasing away the enemy knight, and opening avenues for flank activity.";
  }
  if (san === 'b5') {
    return "Black expands boldly on the queenside, dislodging the enemy bishop and preparing ...Bb7 to control the long diagonal.";
  }
  if (san === 'b3') {
    return "Fianchetto preparation. White readies Bb2 to challenge the central dark squares.";
  }
  if (san === 'b6') {
    return "Black readies the queen's bishop for fianchetto on b7 to counter White's central pawns.";
  }
  if (san === 'O-O') {
    return `${mover} tucks the king to safety behind a solid pawn shield and activates the king's rook to command central or semi-open files.`;
  }
  if (san === 'O-O-O') {
    return `${mover} castles queenside, instantly bringing the rook to the d-file and signaling aggressive opposite-side castling warfare.`;
  }
  if (san === 'dxc4') {
    return "Accepting the gambit pawn or liquidating central tension, forcing the opponent to spend tempi regaining the material.";
  }
  if (san === 'dxe4') {
    return "Liquidating central pawn tension, opening the d-file and seeking rapid piece coordination.";
  }
  if (san === 'exd4') {
    return "Black surrenders the central pawn to open lines for pieces, creating open files and active counterplay.";
  }
  if (san === 'exd5') {
    return "Opening the e-file and clarifying central pawn structure for both sides.";
  }
  if (san === 'Nxd4') {
    return "Recapturing centrally with a dominant knight outpost that oversees both flanks.";
  }
  if (san === 'Qxd4') {
    return "Recapturing with the queen, dominating the center while daring Black to attack her.";
  }
  if (san === 'Nxd5') {
    return "Recapturing with the knight centrally, keeping lines open and seeking dynamic tactical play.";
  }
  if (san === 'Qd3' || san === 'Qc2' || san === 'Qe2') {
    return `${mover} connects the rooks, supports the central pawn chain, and positions the queen on an influential rank.`;
  }
  if (san === 'Qd7' || san === 'Qc7' || san === 'Qe7') {
    return `${mover} coordinates the back rank, clears the way for the rooks, and eyes key diagonal attacks.`;
  }
  if (san === 'Re1' || san === 'Re8') {
    return `${mover} places the rook on the vital semi-open e-file, exerting direct pressure towards the opposing king.`;
  }
  if (san === 'Rd1' || san === 'Rd8') {
    return `${mover} occupies the d-file, pinning central pawns and exerting long-range tactical pressure.`;
  }

  // Fallback high-detail explanation
  return `${mover} plays ${san}, improving piece harmony, fighting for territorial control, and advancing their overall tactical and strategic setup.`;
}

console.log('Validating generator helper...');
