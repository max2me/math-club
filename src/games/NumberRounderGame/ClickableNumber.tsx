import { useCallback, type RefCallback } from 'react';
import { motion } from 'motion/react';

export type SpinDirection = 'up' | 'down';

export type AnimatingState = {
  digitOverrides: Map<number, number>;
  spinningIndex: number | null;
  spinDirection: SpinDirection;
  fadingIndex?: number | null;
  originalDigit?: number;
};

type ClickableNumberProps = {
  number: number;
  highlightedIndex: number | null;
  neighborIndex?: number | null;
  disabled?: boolean;
  onDigitClick: (index: number) => void;
  onNeighborRef?: (el: HTMLElement | null) => void;
  animating?: AnimatingState;
};

const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];

export function ClickableNumber({ number, highlightedIndex, neighborIndex, disabled, onDigitClick, onNeighborRef, animating }: ClickableNumberProps) {
  const numStr = number.toString();
  const totalDigits = numStr.length;
  const formatted = new Intl.NumberFormat('en-US').format(number);
  const chars = formatted.split('');

  let digitIndex = 0;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {chars.map((char, i) => {
        if (char === ',') {
          return (
            <span key={`comma-${i}`} className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-500">
              ,
            </span>
          );
        }

        const currentDigitIndex = digitIndex;
        digitIndex++;

        const isHighlighted = highlightedIndex === currentDigitIndex;
        const isNeighbor = neighborIndex === currentDigitIndex;

        const overrideValue = animating?.digitOverrides.get(currentDigitIndex);
        const isSpinning = animating?.spinningIndex === currentDigitIndex;
        const isFading = animating?.fadingIndex === currentDigitIndex;
        const displayChar = overrideValue !== undefined ? String(overrideValue) : char;

        let style: string;
        if (isHighlighted) {
          style = 'bg-purple-900/40 border-purple-400 text-purple-200 ring-2 ring-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
        } else if (disabled) {
          style = 'bg-slate-800 border-purple-500/50 text-purple-300 cursor-default';
        } else {
          style = 'bg-slate-800 border-purple-500/50 text-purple-300 hover:border-purple-400 hover:bg-slate-700';
        }

        const placeFromRight = totalDigits - 1 - currentDigitIndex;
        const placeName = PLACE_NAMES[placeFromRight] || '';

        return (
          <div key={`digit-${i}`} className="relative group">
            <button
              ref={isNeighbor && onNeighborRef ? onNeighborRef as any : undefined}
              onClick={() => onDigitClick(currentDigitIndex)}
              className={`w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-black rounded-xl border-2 transition-all active:scale-95 overflow-hidden ${style}`}
            >
              {isSpinning ? (
                <span className="relative flex flex-col items-center w-full h-full justify-center">
                  <motion.span
                    key={`spin-out-${currentDigitIndex}`}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: animating!.spinDirection === 'up' ? -60 : 60, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.3, 1] }}
                    className="absolute inline-block"
                  >
                    {animating!.originalDigit ?? char}
                  </motion.span>
                  <motion.span
                    key={`spin-in-${displayChar}-${currentDigitIndex}`}
                    initial={{ y: animating!.spinDirection === 'up' ? 60 : -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.3, 1] }}
                    className="inline-block"
                  >
                    {displayChar}
                  </motion.span>
                </span>
              ) : isFading ? (
                <motion.span
                  key={`fade-${currentDigitIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="inline-block"
                >
                  {displayChar}
                </motion.span>
              ) : (
                displayChar
              )}
            </button>
            {!disabled && (
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[9px] sm:text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {placeName}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
