import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

type RoundingNumberLineProps = {
  number: number;
  divisor: number;
  isWin: boolean;
  underlineDigitIndex?: number | null;
  showMidpoint?: boolean;
  showTarget?: boolean;
  showRoundButtons?: boolean;
};

export function RoundingNumberLine({ number, divisor, isWin, underlineDigitIndex, showMidpoint = true, showTarget = true, showRoundButtons = true }: RoundingNumberLineProps) {
  const lowerBound = Math.floor(number / divisor) * divisor;
  const upperBound = lowerBound + divisor;
  const isCloserToUpper = (number - lowerBound) >= divisor / 2;

  const rangeBottom = lowerBound - divisor;
  const rangeTop = upperBound + divisor;
  const totalRange = rangeTop - rangeBottom;

  const markerFraction = (number - rangeBottom) / totalRange;
  const lowerFraction = (lowerBound - rangeBottom) / totalRange;
  const upperFraction = (upperBound - rangeBottom) / totalRange;

  const midpoint = (lowerBound + upperBound) / 2;
  const midFraction = (midpoint - rangeBottom) / totalRange;

  const ticks = [
    { value: rangeBottom, fraction: 0, isMidpoint: false },
    { value: lowerBound, fraction: lowerFraction, isMidpoint: false },
    { value: midpoint, fraction: midFraction, isMidpoint: true },
    { value: upperBound, fraction: upperFraction, isMidpoint: false },
    { value: rangeTop, fraction: 1, isMidpoint: false },
  ];

  const [resolved, setResolved] = useState<'up' | 'down' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const format = (n: number) => new Intl.NumberFormat('en-US').format(n);

  const handleChoice = (choice: 'up' | 'down') => {
    setResolved(choice);
  };

  const answerFraction = resolved === 'up' ? upperFraction : resolved === 'down' ? lowerFraction : markerFraction;

  const fractionToTop = (f: number) => containerHeight * (1 - f);
  const fillHeight = containerHeight * answerFraction;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 2 }}
      animate={{ opacity: 1, x: 0, scale: 2 }}
      transition={{ duration: 0.4 }}
      className="flex items-center origin-center"
    >
      {/* Chart container */}
      <div ref={containerRef} className="relative h-56 sm:h-64" style={{ width: 94 }}>
        {/* Bar track - extends above and below with fade */}
        <div className="absolute -top-4 -bottom-4 overflow-hidden" style={{ right: 4, width: 14 }}>
          <div className="absolute inset-0 bg-slate-700" />
          <motion.div
            animate={{ height: fillHeight }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 right-0 bg-gradient-to-t from-slate-500 to-slate-400"
            style={{ bottom: 16 }}
          />
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-5 z-10" style={{ background: 'linear-gradient(to bottom, rgb(15, 23, 42), rgba(15, 23, 42, 0))' }} />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-5 z-10" style={{ background: 'linear-gradient(to bottom, rgba(100, 116, 139, 0), rgb(15, 23, 42))' }} />
        </div>

        {containerHeight > 0 && (
          <>
            {/* Tick labels on the left */}
            {ticks.map((tick) => {
              const isAnswer = (resolved === 'up' && tick.value === upperBound) ||
                               (resolved === 'down' && tick.value === lowerBound);
              const isTarget = tick.value === lowerBound || tick.value === upperBound;
              const top = fractionToTop(tick.fraction);

              const hidden = tick.isMidpoint && !showMidpoint;

              return (
                <div
                  key={tick.value}
                  className="absolute left-0 flex items-center transition-opacity"
                  style={{ top, transform: 'translateY(-50%)', right: 4, opacity: hidden ? 0 : 1 }}
                >
                  <span className={`flex-1 text-right text-[10px] sm:text-xs font-bold tabular-nums whitespace-nowrap ${tick.isMidpoint ? 'text-slate-500' : isAnswer ? 'text-emerald-400' : isTarget ? 'text-slate-200' : 'text-slate-500'}`}>
                    {format(tick.value)}
                  </span>
                  <div className={`w-7 h-px ml-1 ${tick.isMidpoint ? 'bg-slate-500' : isTarget ? 'bg-slate-300' : 'bg-slate-600'}`} />
                </div>
              );
            })}

            {/* Number marker (target) - on the right */}
            <div
              className="absolute flex items-center transition-opacity"
              style={{ top: fractionToTop(markerFraction), transform: 'translateY(-50%)', left: 'calc(100% - 4px)', opacity: showTarget ? 1 : 0 }}
            >
              <div className="w-4 h-[3px] bg-purple-400 rounded-full" />
              <span className="ml-1.5 flex">
                {format(number).split('').map((char, i) => {
                  const isComma = char === ',';
                  let digitIdx = 0;
                  for (let j = 0; j < i; j++) {
                    if (format(number)[j] !== ',') digitIdx++;
                  }
                  const shouldUnderline = !isComma && underlineDigitIndex === digitIdx;
                  return (
                    <span
                      key={i}
                      className={`text-[10px] sm:text-xs font-bold tabular-nums ${isComma ? 'text-purple-300/50' : 'text-purple-300'}`}
                      style={{ paddingBottom: 1 }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Round up/down links positioned next to upper/lower ticks */}
      <div className="relative h-56 sm:h-64 ml-3 transition-opacity" style={{ width: 80, opacity: showRoundButtons ? 1 : 0 }}>
        {containerHeight > 0 && (
          <>
            {/* Round up - next to upper bound */}
            <button
              onClick={() => handleChoice('up')}
              disabled={!showRoundButtons}
              className={`absolute left-0 -translate-y-1/2 flex items-center gap-1 text-[10px] sm:text-xs font-black whitespace-nowrap transition-all cursor-pointer ${resolved === 'up' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}
              style={{ top: fractionToTop(upperFraction) }}
            >
              <ChevronUp className="w-3 h-3" />
              <span>Round up</span>
            </button>

            {/* Round down - next to lower bound */}
            <button
              onClick={() => handleChoice('down')}
              disabled={!showRoundButtons}
              className={`absolute left-0 -translate-y-1/2 flex items-center gap-1 text-[10px] sm:text-xs font-black whitespace-nowrap transition-all cursor-pointer ${resolved === 'down' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}
              style={{ top: fractionToTop(lowerFraction) }}
            >
              <ChevronDown className="w-3 h-3" />
              <span>Round down</span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
