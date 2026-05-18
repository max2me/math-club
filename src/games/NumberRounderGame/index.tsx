import { useState, useEffect, useRef, useCallback, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Settings } from 'lucide-react';
import { Confetti } from '../../components/Confetti';
import { useShakeOnError } from '../../hooks/useShakeOnError';
import { useScore } from '../../hooks/useScore';
import { generateRoundingPuzzle, ROUNDING_OPTIONS, type RoundingPuzzle, type RoundingPlace } from './generateRound';
import { ClickableNumber, type AnimatingState } from './ClickableNumber';
import { RoundingNumberLine } from './RoundingNumberLine';

type RoundDirection = 'up' | 'down';
type HelpStep = 'idle' | 'ask-direction' | 'animating' | 'done';

const DIVISOR_LABELS: Record<number, string> = {
  10: 'ten',
  100: 'hundred',
  1000: 'thousand',
  10000: 'ten thousand',
  100000: 'hundred thousand',
};

function SlotDigit({ digit, color }: { digit: string; color: 'orange' | 'blue' }) {
  const digitStyle = color === 'orange'
    ? 'bg-orange-900/30 border-transparent text-orange-300'
    : 'bg-sky-900/30 border-transparent text-sky-300';

  return (
    <span className={`w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-black rounded-xl border-2 overflow-hidden ${digitStyle}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function RoundedNumberDisplay({ number, color, totalDigits }: { number: number; color: 'orange' | 'blue'; totalDigits: number }) {
  const formatted = useMemo(() => {
    const chars: { char: string; isDigit: boolean; digitIndex: number }[] = [];
    let dIdx = 0;
    const fmt = new Intl.NumberFormat('en-US').format(number);
    const numStr = number.toString();
    const leadingSpaces = totalDigits - numStr.length;

    for (let i = 0; i < leadingSpaces; i++) {
      chars.push({ char: ' ', isDigit: true, digitIndex: dIdx++ });
    }

    for (const ch of fmt) {
      if (ch === ',') {
        chars.push({ char: ',', isDigit: false, digitIndex: -1 });
      } else {
        chars.push({ char: ch, isDigit: true, digitIndex: dIdx++ });
      }
    }
    return chars;
  }, [number, totalDigits]);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {formatted.map((item, i) => {
        if (!item.isDigit) {
          return (
            <span key={`comma-${i}`} className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-500">
              ,
            </span>
          );
        }
        return (
          <SlotDigit
            key={`slot-${item.digitIndex}`}
            digit={item.char}
            color={color}
          />
        );
      })}
    </div>
  );
}

function getNumDigits(): number | 'random' {
  try {
    const val = localStorage.getItem('rounder-num-digits');
    if (val === 'random') return 'random';
    const n = parseInt(val ?? '', 10);
    if (n >= 2 && n <= 6) return n;
  } catch {}
  return 'random';
}

function saveNumDigits(digits: number | 'random') {
  localStorage.setItem('rounder-num-digits', String(digits));
}

function getSelectedPlace(): RoundingPlace | 'random' {
  try {
    const val = localStorage.getItem('rounder-place');
    if (val === 'ten' || val === 'hundred' || val === 'thousand' || val === 'ten-thousand') return val;
  } catch {}
  return 'random';
}

function saveSelectedPlace(place: RoundingPlace | 'random') {
  localStorage.setItem('rounder-place', place);
}

function getBool(key: string, defaultVal: boolean): boolean {
  try {
    const val = localStorage.getItem(key);
    if (val === 'true') return true;
    if (val === 'false') return false;
  } catch {}
  return defaultVal;
}

export function NumberRounderGame() {
  const [numDigits, setNumDigits] = useState<number | 'random'>(getNumDigits);
  const maxDigits = numDigits === 'random' ? 6 : numDigits;
  const [selectedPlace, setSelectedPlace] = useState<RoundingPlace | 'random'>(getSelectedPlace);
  const [showOptions, setShowOptions] = useState(true);
  const [showMidpoint, setShowMidpoint] = useState(() => getBool('rounder-show-midpoint', true));
  const [showTarget, setShowTarget] = useState(() => getBool('rounder-show-target', true));
  const [showRoundButtons, setShowRoundButtons] = useState(() => getBool('rounder-show-round-buttons', true));
  const [showChart, setShowChart] = useState(() => getBool('rounder-show-chart', true));
  const [puzzle, setPuzzle] = useState<RoundingPuzzle>(() => {
    const initDigits = getNumDigits();
    const initMax = initDigits === 'random' ? 6 : initDigits;
    const initExact = initDigits === 'random' ? undefined : initDigits;
    const initPlace = getSelectedPlace();
    return generateRoundingPuzzle({ maxDigits: initMax, exactDigits: initExact, place: initPlace === 'random' ? undefined : initPlace });
  });
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isWin, setIsWin] = useState(false);
  const { isError, triggerError, clearError, shakeAnimation } = useShakeOnError();
  const { addStar, resetStreak } = useScore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [helpStep, setHelpStep] = useState<HelpStep>('idle');
  const [animating, setAnimating] = useState<AnimatingState | null>(null);
  const [directionError, setDirectionError] = useState(false);
  const [showNeighborHighlight, setShowNeighborHighlight] = useState(false);
  const [clickedDivisor, setClickedDivisor] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const numStr = puzzle.number.toString();
  const totalDigits = numStr.length;

  const getCorrectPlaceIndex = useCallback(() => {
    const placeFromRight = Math.log10(puzzle.divisor);
    return totalDigits - 1 - placeFromRight;
  }, [puzzle, totalDigits]);

  const startNewRound = useCallback(() => {
    setPuzzle(generateRoundingPuzzle({ maxDigits, exactDigits: numDigits === 'random' ? undefined : numDigits, place: selectedPlace === 'random' ? undefined : selectedPlace }));
    setInputValue('');
    setHighlightedIndex(null);
    setIsWin(false);
    setHelpStep('idle');
    setAnimating(null);
    setShowNeighborHighlight(false);
    setClickedDivisor(null);
    clearError();
  }, [maxDigits, numDigits, selectedPlace, clearError]);

  const handleVerify = (e?: FormEvent) => {
    e?.preventDefault();
    if (inputValue === '') return;
    const parsed = parseInt(inputValue.replace(/,/g, ''), 10);
    if (parsed === puzzle.answer) {
      setIsWin(true);
      addStar();
    } else {
      triggerError();
      resetStreak();
    }
  };


  const handleDigitClick = (index: number) => {
    if (helpStep === 'animating' || helpStep === 'done') return;
    setHighlightedIndex(index);

    const placeFromRight = totalDigits - 1 - index;
    if (placeFromRight < 1) {
      setClickedDivisor(null);
      setHelpStep('idle');
      setShowNeighborHighlight(false);
      return;
    }
    const divisor = Math.pow(10, placeFromRight);
    setClickedDivisor(divisor);
    setShowNeighborHighlight(true);
    setHelpStep('ask-direction');
  };

  const getCorrectDirection = (): RoundDirection => {
    const correctIndex = getCorrectPlaceIndex();
    const neighborIndex = correctIndex + 1;
    if (neighborIndex >= totalDigits) return 'down';
    const neighborDigit = parseInt(numStr[neighborIndex], 10);
    return neighborDigit >= 5 ? 'up' : 'down';
  };

  const handleDirectionChoice = (choice: RoundDirection) => {
    const correct = choice === getCorrectDirection();
    if (!correct) {
      setDirectionError(true);
      setTimeout(() => setDirectionError(false), 800);
      return;
    }

    setHelpStep('animating');

    const correctIndex = getCorrectPlaceIndex();
    const answerDigits = puzzle.answer.toString().split('').map(Number);
    const direction = choice;
    const overrides = new Map<number, number>();

    const finishAnimation = () => {
      setTimeout(() => {
        setHelpStep('idle');
        setAnimating(prev => prev ? { ...prev, spinningIndex: null, fadingIndex: null } : null);
        setHighlightedIndex(null);
        setShowNeighborHighlight(false);
        inputRef.current?.focus();
      }, 1000);
    };

    if (direction === 'up') {
      setTimeout(() => {
        const originalDigit = parseInt(numStr[correctIndex], 10);
        overrides.set(correctIndex, answerDigits[correctIndex]);
        setAnimating({ digitOverrides: new Map(overrides), spinningIndex: correctIndex, spinDirection: 'up', originalDigit });

        let step = 0;
        const trailing = [];
        for (let i = correctIndex + 1; i < totalDigits; i++) trailing.push(i);

        const zeroNext = () => {
          if (step >= trailing.length) {
            finishAnimation();
            return;
          }
          overrides.set(trailing[step], 0);
          setAnimating({ digitOverrides: new Map(overrides), spinningIndex: null, spinDirection: 'up', fadingIndex: trailing[step] });
          step++;
          setTimeout(zeroNext, 900);
        };

        setTimeout(zeroNext, 900);
      }, 200);
    } else {
      let step = 0;
      const trailing = [];
      for (let i = correctIndex + 1; i < totalDigits; i++) trailing.push(i);

      const zeroNext = () => {
        if (step >= trailing.length) {
          finishAnimation();
          return;
        }
        overrides.set(trailing[step], 0);
        setAnimating({ digitOverrides: new Map(overrides), spinningIndex: null, spinDirection: 'down', fadingIndex: trailing[step] });
        step++;
        setTimeout(zeroNext, 900);
      };

      setTimeout(zeroNext, 200);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'Enter' && isWin) {
        e.preventDefault();
        startNewRound();
        return;
      }

      if (!isWin && helpStep === 'idle' && (e.key === 'Backspace' || /^[0-9]$/.test(e.key))) {
        e.preventDefault();
        inputRef.current?.focus();
        let raw = inputValue.replace(/[^0-9]/g, '');
        if (e.key === 'Backspace') {
          raw = raw.slice(0, -1);
        } else {
          raw = raw + e.key;
        }
        const answerLen = puzzle.answer.toString().length;
        let result = '';
        for (let i = 0; i < raw.length; i++) {
          result += raw[i];
          const nextPosFromRight = answerLen - (i + 1);
          if (nextPosFromRight > 0 && nextPosFromRight % 3 === 0) {
            result += ',';
          }
        }
        setInputValue(result);
        clearError();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWin, inputValue, puzzle.answer, helpStep]);

  const neighborDigit = (() => {
    const correctIndex = getCorrectPlaceIndex();
    const neighborIndex = correctIndex + 1;
    if (neighborIndex >= totalDigits) return null;
    return parseInt(numStr[neighborIndex], 10);
  })();

  return (
    <motion.div
      animate={shakeAnimation}
      transition={{ duration: 0.4 }}
      className="w-full shrink-0 flex flex-1 items-center justify-center px-2 pb-4 pt-4 sm:pt-8 relative"
    >
      <Confetti active={isWin} />

      <div className="flex flex-col items-center justify-center gap-6 sm:gap-10 flex-1">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-200 uppercase tracking-widest drop-shadow-lg mb-2">
            Number Rounder
          </h2>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm sm:text-base font-medium">
            <span>Round to the</span>
            <select
              value={selectedPlace}
              onChange={(e) => {
                const val = e.target.value as RoundingPlace | 'random';
                setSelectedPlace(val);
                saveSelectedPlace(val);
                setPuzzle(generateRoundingPuzzle({ maxDigits, exactDigits: numDigits === 'random' ? undefined : numDigits, place: val === 'random' ? undefined : val }));
                setInputValue('');
                setHighlightedIndex(null);
                setIsWin(false);
                setHelpStep('idle');
                setAnimating(null);
                setShowNeighborHighlight(false);
                clearError();
              }}
              className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-emerald-400 font-black text-sm sm:text-base cursor-pointer outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="random">random</option>
              {ROUNDING_OPTIONS.filter(o => o.minDigits <= maxDigits).map(o => (
                <option key={o.place} value={o.place}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

      <div ref={containerRef} className="relative flex flex-col items-center gap-5" style={{ perspective: '800px' }}>
        {/* Round up number - hinged from bottom */}
        <motion.div
          initial={false}
          animate={{
            opacity: helpStep === 'ask-direction' || helpStep === 'animating' ? 0.7 : 0,
            rotateX: helpStep === 'ask-direction' || helpStep === 'animating' ? 0 : 90,
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center origin-bottom"
        >
          <span className="text-xs sm:text-sm font-black text-orange-300 uppercase tracking-wider mt-3">Round up{clickedDivisor ? ` (${DIVISOR_LABELS[clickedDivisor] ?? clickedDivisor})` : ''}</span>
          <RoundedNumberDisplay number={clickedDivisor ? Math.ceil(puzzle.number / clickedDivisor) * clickedDivisor : puzzle.number} color="orange" totalDigits={numStr.length} />
        </motion.div>

        <ClickableNumber
          number={puzzle.number}
          highlightedIndex={highlightedIndex}
          neighborIndex={showNeighborHighlight ? getCorrectPlaceIndex() + 1 : null}
          disabled={helpStep === 'animating'}
          onDigitClick={handleDigitClick}
          animating={animating ?? undefined}
        />

        {/* Round down number - hinged from top */}
        <motion.div
          initial={false}
          animate={{
            opacity: helpStep === 'ask-direction' || helpStep === 'animating' ? 0.7 : 0,
            rotateX: helpStep === 'ask-direction' || helpStep === 'animating' ? 0 : -90,
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center origin-top"
        >
          <RoundedNumberDisplay number={clickedDivisor ? Math.floor(puzzle.number / clickedDivisor) * clickedDivisor : puzzle.number} color="blue" totalDigits={numStr.length} />
          <span className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-wider">Round down{clickedDivisor ? ` (${DIVISOR_LABELS[clickedDivisor] ?? clickedDivisor})` : ''}</span>
        </motion.div>
      </div>

      <form
        onSubmit={isWin ? (e) => { e.preventDefault(); startNewRound(); } : handleVerify}
        className="flex flex-col items-center gap-4 w-full max-w-sm"
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault();
              const raw = inputValue.replace(/[^0-9]/g, '').slice(0, -1);
              const answerLen = puzzle.answer.toString().length;
              let result = '';
              for (let i = 0; i < raw.length; i++) {
                result += raw[i];
                const nextPosFromRight = answerLen - (i + 1);
                if (nextPosFromRight > 0 && nextPosFromRight % 3 === 0) {
                  result += ',';
                }
              }
              setInputValue(result);
              clearError();
            }
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            const answerLen = puzzle.answer.toString().length;
            let result = '';
            for (let i = 0; i < raw.length; i++) {
              result += raw[i];
              const nextPosFromRight = answerLen - (i + 1);
              if (nextPosFromRight > 0 && nextPosFromRight % 3 === 0) {
                result += ',';
              }
            }
            setInputValue(result);
            clearError();
          }}
          disabled={isWin || helpStep === 'animating'}
          placeholder="Your answer"
          className={`hide-spinners w-full text-center text-3xl sm:text-5xl font-black bg-slate-950 p-4 rounded-xl sm:rounded-2xl border-2 sm:border-4 outline-none transition-all ${isWin ? 'border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : isError ? 'border-red-500 focus:border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-red-100' : 'border-slate-700 focus:border-emerald-500 text-white'}`}
          autoFocus
        />
        {isWin ? (
          <button
            type="button"
            onClick={startNewRound}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-xl md:text-2xl shadow-xl active:scale-95 transition-all text-slate-900 flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            NEXT ROUND
          </button>
        ) : (
          <button
            type="submit"
            disabled={helpStep === 'animating'}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-xl md:text-2xl shadow-xl active:scale-95 transition-all text-white flex justify-center items-center gap-2 ${isError ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
          >
            {isError ? 'TRY AGAIN!' : 'CHECK ANSWER'}
          </button>
        )}
      </form>
      </div>

      <div className="hidden md:flex items-center ml-8 lg:ml-12 transition-opacity" style={{ opacity: showChart ? 1 : 0 }}>
        <RoundingNumberLine
          key={puzzle.number}
          number={puzzle.number}
          divisor={puzzle.divisor}
          isWin={isWin}
          underlineDigitIndex={showNeighborHighlight ? getCorrectPlaceIndex() + 1 : null}
          showMidpoint={showMidpoint}
          showTarget={showTarget}
          showRoundButtons={showRoundButtons}
        />
      </div>

      {/* Options pane */}
      <div className="fixed bottom-3 left-3 z-30">
        <button
          onClick={() => setShowOptions(s => !s)}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl flex flex-col gap-3"
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Number of digits</span>
                <div className="flex items-center gap-2">
                  {(['random', 2, 3, 4, 5, 6] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => {
                        setNumDigits(d);
                        saveNumDigits(d);
                        const newMax = d === 'random' ? 6 : d;
                        const exact = d === 'random' ? undefined : d;
                        const placeStillValid = selectedPlace === 'random' || ROUNDING_OPTIONS.find(o => o.place === selectedPlace)!.minDigits <= newMax;
                        const place = placeStillValid ? (selectedPlace === 'random' ? undefined : selectedPlace) : undefined;
                        if (!placeStillValid) { setSelectedPlace('random'); saveSelectedPlace('random'); }
                        setPuzzle(generateRoundingPuzzle({ maxDigits: newMax, exactDigits: exact, place }));
                      }}
                      className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center transition-all ${numDigits === d ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      {d === 'random' ? '?' : d}
                    </button>
                  ))}
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMidpoint}
                  onChange={(e) => { setShowMidpoint(e.target.checked); localStorage.setItem('rounder-show-midpoint', String(e.target.checked)); }}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Show midpoint</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTarget}
                  onChange={(e) => { setShowTarget(e.target.checked); localStorage.setItem('rounder-show-target', String(e.target.checked)); }}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Show target number</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoundButtons}
                  onChange={(e) => { setShowRoundButtons(e.target.checked); localStorage.setItem('rounder-show-round-buttons', String(e.target.checked)); }}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Show round up/down</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showChart}
                  onChange={(e) => { setShowChart(e.target.checked); localStorage.setItem('rounder-show-chart', String(e.target.checked)); }}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Show bar chart</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
