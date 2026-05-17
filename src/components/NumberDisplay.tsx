import { COLUMNS } from '../constants';
import type { Digits } from '../constants';

type NumberDisplayProps = {
  digits: Digits;
  title: string;
  bounce?: boolean;
  highlightIndex?: number;
};

export function NumberDisplay({ digits, title, bounce, highlightIndex }: NumberDisplayProps) {
  let firstNonZeroWhole = 0;
  while (firstNonZeroWhole < 3 && digits[firstNonZeroWhole] === 0) {
    firstNonZeroWhole++;
  }
  let lastNonZeroPart = 6;
  while (lastNonZeroPart > 4 && digits[lastNonZeroPart] === 0) {
    lastNonZeroPart--;
  }

  return (
    <div className="flex flex-col items-center justify-center bg-slate-800 p-2 sm:p-3 rounded-xl border-2 sm:border-4 border-slate-700 shadow-xl w-full max-w-[320px]">
      <h2 className={`font-bold uppercase tracking-wider text-[10px] sm:text-xs mb-1 ${bounce ? 'text-amber-400' : 'text-slate-400'}`}>
        {title}
      </h2>
      <div className="text-xl sm:text-2xl md:text-3xl font-black flex items-baseline tracking-widest gap-0.5 sm:gap-1 md:gap-1.5 bg-slate-950 px-3 py-1.5 sm:py-2 rounded-lg border border-slate-800/50 shadow-inner tabular-nums">
        {COLUMNS.map((col) => {
          if (col.isSeparator === true) {
            const hasParts = lastNonZeroPart >= 4 && digits.slice(4, lastNonZeroPart + 1).some(d => d > 0);
            return (
              <span key="sep" className={`text-red-500 ${hasParts ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'opacity-20'}`}>
                .
              </span>
            );
          }

          const placeCol = col;
          const isFaded = (placeCol.type === 'whole' && placeCol.id < firstNonZeroWhole && placeCol.id < 3) ||
                          (placeCol.type === 'part' && placeCol.id > lastNonZeroPart);
          const isHighlighted = highlightIndex === placeCol.id;

          return (
            <span
              key={placeCol.id}
              className={`${placeCol.color} ${isFaded ? 'opacity-10' : ''} ${isHighlighted ? `bg-slate-700 ring-2 rounded px-1 mx-0.5 z-10 ${placeCol.ring}` : ''} transition-all duration-300`}
            >
              {digits[placeCol.id]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
