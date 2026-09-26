import React from 'react';
import { X, BookOpen, Keyboard, Target, Lightbulb, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="help-modal-content"
        className="bg-[#181a20] border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4 animate-fadeIn"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-zinc-100">
              Opening Repertoire & Study Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-[#20242e] border border-zinc-800 space-y-1.5">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Complete Repertoire: 20 Openings • 240 Variations</span>
            </div>
            <p className="text-zinc-400">
              This interactive platform features 10 foundational White systems (Ruy Lopez, Italian, Queen’s Gambit, English, Catalan, etc.) and 10 premier Black defenses (Sicilian, French, Caro-Kann, King’s Indian, Nimzo-Indian, Slav, etc.). Every single opening features exactly 12 variations with deep move-by-move strategic commentary.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>Keyboard & Navigation Shortcuts</span>
            </div>
            <ul className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-zinc-400">
              <li className="bg-zinc-900 p-2 rounded border border-zinc-800">
                <kbd className="text-amber-400">Right Arrow</kbd>: Next move
              </li>
              <li className="bg-zinc-900 p-2 rounded border border-zinc-800">
                <kbd className="text-amber-400">Left Arrow</kbd>: Previous move
              </li>
              <li className="bg-zinc-900 p-2 rounded border border-zinc-800">
                <kbd className="text-amber-400">Spacebar</kbd>: Auto-play / Pause
              </li>
              <li className="bg-zinc-900 p-2 rounded border border-zinc-800">
                <kbd className="text-amber-400">Home / End</kbd>: Start / Final position
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Training Mode vs Learn Mode</span>
            </div>
            <p className="text-zinc-400">
              Toggle <strong>Practice Mode</strong> to test your memory by making moves directly on the board. If you play the correct variation move, the board advances with sound and positive feedback; if not, an instructive hint helps guide you back on track.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 space-y-1">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Grandmaster Opening Advice</span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              Never memorize moves blindly without understanding the ideas. Focus on the pawn structure, the key breaks (...c5, ...e5, d5, f4), and which squares the minor pieces are trying to control.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
