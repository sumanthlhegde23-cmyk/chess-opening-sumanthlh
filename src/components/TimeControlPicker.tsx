import React from 'react';
import { ArrowLeft, Check, Clock3, Infinity, Swords, X } from 'lucide-react';
import { TIME_CONTROLS, TimeControl } from '../types/timeControl';

interface TimeControlPickerProps {
  isOpen: boolean;
  selectedTimeControlId: string;
  onSelect: (timeControl: TimeControl) => void;
  onContinue: (timeControl: TimeControl) => void;
  onClose: () => void;
  /** Render as an in-page wizard step instead of a modal overlay. */
  inline?: boolean;
  /** Inline mode only: go back to the previous wizard step. */
  onBack?: () => void;
  /** Overrides the continue button text (defaults to the mode's usual label). */
  continueLabel?: string;
}

export const TimeControlPicker: React.FC<TimeControlPickerProps> = ({
  isOpen,
  selectedTimeControlId,
  onSelect,
  onContinue,
  onClose,
  inline = false,
  onBack,
  continueLabel,
}) => {
  if (!isOpen) return null;

  const panel = (
      <section
        {...(inline ? {} : { role: 'dialog', 'aria-modal': true })}
        aria-labelledby="time-control-title"
        className={inline
          ? 'mx-auto w-full max-w-3xl animate-fadeIn rounded-2xl border border-zinc-700 bg-[#141916] p-4 shadow-xl sm:p-6'
          : 'max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-700 bg-[#141916] p-4 shadow-2xl sm:p-6'}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300"><Swords className="h-4 w-4" /> Set the pace</p>
            <h2 id="time-control-title" className="mt-1 text-2xl font-bold text-zinc-100">Choose Time Control</h2>
            <p className="mt-1 text-sm text-zinc-400">Select the clocks for both players. You can change this for every new game.</p>
          </div>
          {!inline && <button type="button" onClick={onClose} aria-label="Close time control selection" className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"><X className="h-5 w-5" /></button>}
        </div>

        <div className="space-y-4">
          {TIME_CONTROLS.map(({ category, controls }) => {
            const unlimited = category === 'No Time Control';
            return (
              <section key={category} aria-label={category} className={`rounded-xl border p-3 sm:p-4 ${unlimited ? 'border-emerald-500/30 bg-emerald-950/15' : 'border-zinc-800 bg-black/15'}`}>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-100">
                  {unlimited ? <Infinity className="h-4 w-4 text-emerald-300" /> : <span aria-hidden="true" className="text-base text-amber-300">♟</span>}
                  {category}
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {controls.map((control) => {
                    const selected = selectedTimeControlId === control.id;
                    const detail = control.minutes === null
                      ? 'Unlimited time'
                      : `${control.minutes} minute${control.minutes === 1 ? '' : 's'}${control.incrementSeconds ? ` + ${control.incrementSeconds} second increment` : ', no increment'}`;
                    return (
                      <button
                        key={control.id}
                        type="button"
                        onClick={() => onSelect(control)}
                        aria-pressed={selected}
                        className={`relative min-h-[74px] rounded-lg border p-2.5 text-left transition-all ${
                          selected
                            ? 'border-emerald-400 bg-emerald-500/15 text-white ring-1 ring-emerald-400/40'
                            : 'border-zinc-700 bg-[#111512] text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/80'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-1">
                          <span className="font-mono text-base font-extrabold">{control.label}</span>
                          {selected && <Check className="h-4 w-4 text-emerald-300" />}
                        </span>
                        <span className="mt-1 block text-[10px] leading-snug text-zinc-400">{detail}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col-reverse justify-between gap-3 border-t border-zinc-800 pt-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {inline && onBack && (
              <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <p className="flex items-center gap-2 text-xs text-zinc-400"><Clock3 className="h-4 w-4 shrink-0 text-emerald-300" /> Increment is added to the mover’s clock after each legal move.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const selected = TIME_CONTROLS.flatMap((category) => category.controls).find((control) => control.id === selectedTimeControlId);
              if (selected) onContinue(selected);
            }}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-extrabold text-zinc-950 transition-colors hover:bg-emerald-400"
          >
            {continueLabel ?? (inline ? 'Next: Engine Level' : 'Continue')}
          </button>
        </div>
      </section>
  );

  if (inline) return panel;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">
      {panel}
    </div>
  );
};
