import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

type RoundingNumberLineProps = {
  number: number;
  divisor: number;
  isWin: boolean;
  underlineDigitIndex?: number | null;
};

export function RoundingNumberLine({ number, divisor, isWin, underlineDigitIndex }: RoundingNumberLineProps) {
  const lowerBound = Math.floor(number / divisor) * divisor;
  const upperBound = lowerBound + divisor;
  const isCloserToUpper = (number - lowerBound) >= divisor / 2;

  const rangeBottom = lowerBound - divisor;
  const rangeTop = upperBound + divisor;
  const totalRange = rangeTop - rangeBottom;

  const markerFraction = (number - rangeBottom) / totalRange;
  const lowerFraction = (lowerBound - rangeBottom) / totalRange;
  const upperFraction = (upperBound - rangeBottom) / totalRange;

  const ticks = [
    { value: rangeBottom, fraction: 0 },
    { value: lowerBound, fraction: lowerFraction },
    { value: upperBound, fraction: upperFraction },
    { value: rangeTop, fraction: 1 },
  ];

  const [resolved, setResolved] = useState<'up' | 'down' | null>(null);
  const [shaking, setShaking] = useState(false);
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
    if (resolved) return;
    const correct = (choice === 'up' && isCloserToUpper) || (choice === 'down' && !isCloserToUpper);
    if (correct) {
      setResolved(choice);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const answerFraction = resolved === 'up' ? upperFraction : resolved === 'down' ? lowerFraction : markerFraction;

  const fractionToTop = (f: number) => containerHeight * (1 - f);
  const fillHeight = containerHeight * answerFraction;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={shaking ? { opacity: 1, x: [-6, 6, -6, 6, 0] } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center"
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
            {/* Tick labels (left of bar) and lines */}
            {ticks.map((tick) => {
              const isAnswer = (resolved === 'up' && tick.value === upperBound) ||
                               (resolved === 'down' && tick.value === lowerBound);
              const isTarget = tick.value === lowerBound || tick.value === upperBound;
              const top = fractionToTop(tick.fraction);
              return (
                <div
                  key={tick.value}
                  className="absolute left-0 flex items-center"
                  style={{ top, transform: 'translateY(-50%)', right: 4 }}
                >
                  <span className={`flex-1 text-right text-[10px] sm:text-xs font-bold tabular-nums whitespace-nowrap ${isAnswer ? 'text-emerald-400' : isTarget ? 'text-slate-200' : 'text-slate-500'}`}>
                    {format(tick.value)}
                  </span>
                  <div className={`w-7 h-px ml-1 ${isTarget ? 'bg-slate-300' : 'bg-slate-600'}`} />
                </div>
              );
            })}

            {/* Number marker */}
            <div
              className="absolute left-0 flex items-center"
              style={{ top: fractionToTop(markerFraction), transform: 'translateY(-50%)', right: 4 }}
            >
              <span className="flex-1 text-right flex justify-end">
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
                      style={{ borderBottom: `2px solid ${shouldUnderline ? 'rgb(251, 191, 36)' : 'transparent'}`, paddingBottom: 1 }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
              <div className="w-7 h-[3px] ml-1 bg-purple-400 rounded-full" />
            </div>
          </>
        )}
      </div>

      {/* Round up/down links positioned next to upper/lower ticks */}
      <div className="relative h-56 sm:h-64 ml-3" style={{ width: 80 }}>
        {containerHeight > 0 && (
          <>
            {/* Round up - next to upper bound */}
            <button
              onClick={() => handleChoice('up')}
              disabled={resolved !== null}
              className={`absolute left-0 -translate-y-1/2 flex items-center gap-1 text-[10px] sm:text-xs font-black whitespace-nowrap transition-all ${resolved === 'up' ? 'text-emerald-400' : resolved ? 'text-slate-600 cursor-default' : 'text-slate-300 hover:text-white cursor-pointer'}`}
              style={{ top: fractionToTop(upperFraction) }}
            >
              <ChevronUp className="w-3 h-3" />
              <span>Round up</span>
            </button>

            {/* Round down - next to lower bound */}
            <button
              onClick={() => handleChoice('down')}
              disabled={resolved !== null}
              className={`absolute left-0 -translate-y-1/2 flex items-center gap-1 text-[10px] sm:text-xs font-black whitespace-nowrap transition-all ${resolved === 'down' ? 'text-emerald-400' : resolved ? 'text-slate-600 cursor-default' : 'text-slate-300 hover:text-white cursor-pointer'}`}
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
