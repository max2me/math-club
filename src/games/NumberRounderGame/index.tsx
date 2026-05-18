import { useState, useEffect, useRef, useCallback, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Settings } from 'lucide-react';
import { Confetti } from '../../components/Confetti';
import { useShakeOnError } from '../../hooks/useShakeOnError';
import { useScore } from '../../hooks/useScore';
import { generateRoundingPuzzle, ROUNDING_OPTIONS, type RoundingPuzzle, type RoundingPlace } from './generateRound';
import { ClickableNumber } from './ClickableNumber';
import { RoundingNumberLine } from './RoundingNumberLine';

const DIVISOR_LABELS: Record<number, string> = {
  10: 'ten',
  100: 'hundred',
  1000: 'thousand',
  10000: 'ten thousand',
  100000: 'hundred thousand',
};

// --- Persistence helpers ---

function loadString(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function persist(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}

function loadBool(key: string, defaultVal: boolean): boolean {
  const val = loadString(key);
  if (val === 'true') return true;
  if (val === 'false') return false;
  return defaultVal;
}

function loadNumDigits(): number | 'random' {
  const val = loadString('rounder-num-digits');
  if (val === 'random') return 'random';
  const n = parseInt(val ?? '', 10);
  return (n >= 2 && n <= 6) ? n : 'random';
}

function loadPlace(): RoundingPlace | 'random' {
  const val = loadString('rounder-place');
  if (val === 'ten' || val === 'hundred' || val === 'thousand' || val === 'ten-thousand') return val;
  return 'random';
}

// --- Number formatting ---

function formatWithCommas(raw: string, targetLength: number): string {
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    result += raw[i];
    const posFromRight = targetLength - (i + 1);
    if (posFromRight > 0 && posFromRight % 3 === 0) {
      result += ',';
    }
  }
  return result;
}

// --- Sub-components ---

function SlotDigit({ digit, color }: { digit: string; color: 'orange' | 'blue' }) {
  const style = color === 'orange'
    ? 'bg-orange-900/30 border-transparent text-orange-300'
    : 'bg-sky-900/30 border-transparent text-sky-300';

  return (
    <span className={`w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-black rounded-xl border-2 overflow-hidden ${style}`}>
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
  const chars = useMemo(() => {
    const result: { char: string; isDigit: boolean; digitIndex: number }[] = [];
    let dIdx = 0;
    const fmt = new Intl.NumberFormat('en-US').format(number);
    const leadingSpaces = totalDigits - number.toString().length;

    for (let i = 0; i < leadingSpaces; i++) {
      result.push({ char: ' ', isDigit: true, digitIndex: dIdx++ });
    }
    for (const ch of fmt) {
      if (ch === ',') {
        result.push({ char: ',', isDigit: false, digitIndex: -1 });
      } else {
        result.push({ char: ch, isDigit: true, digitIndex: dIdx++ });
      }
    }
    return result;
  }, [number, totalDigits]);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {chars.map((item, i) => {
        if (!item.isDigit) {
          return (
            <span key={`comma-${i}`} className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-500">
              ,
            </span>
          );
        }
        return <SlotDigit key={`slot-${item.digitIndex}`} digit={item.char} color={color} />;
      })}
    </div>
  );
}

function OptionsToggle({ checked, storageKey, onChange, label }: {
  checked: boolean;
  storageKey: string;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => { onChange(e.target.checked); persist(storageKey, String(e.target.checked)); }}
        className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
      />
      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{label}</span>
    </label>
  );
}

// --- Main component ---

export function NumberRounderGame() {
  const [numDigits, setNumDigits] = useState<number | 'random'>(loadNumDigits);
  const [selectedPlace, setSelectedPlace] = useState<RoundingPlace | 'random'>(loadPlace);
  const [showOptions, setShowOptions] = useState(true);
  const [showMidpoint, setShowMidpoint] = useState(() => loadBool('rounder-show-midpoint', false));
  const [showTarget, setShowTarget] = useState(() => loadBool('rounder-show-target', false));
  const [showRoundButtons, setShowRoundButtons] = useState(() => loadBool('rounder-show-round-buttons', false));
  const [showChart, setShowChart] = useState(() => loadBool('rounder-show-chart', false));

  const maxDigits = numDigits === 'random' ? 6 : numDigits;
  const exactDigits = numDigits === 'random' ? undefined : numDigits;
  const placeOption = selectedPlace === 'random' ? undefined : selectedPlace;

  const [puzzle, setPuzzle] = useState<RoundingPuzzle>(() =>
    generateRoundingPuzzle({ maxDigits: loadNumDigits() === 'random' ? 6 : loadNumDigits() as number, exactDigits: loadNumDigits() === 'random' ? undefined : loadNumDigits() as number, place: loadPlace() === 'random' ? undefined : loadPlace() as RoundingPlace })
  );
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isWin, setIsWin] = useState(false);
  const [clickedDivisor, setClickedDivisor] = useState<number | null>(null);

  const { isError, triggerError, clearError, shakeAnimation } = useShakeOnError();
  const { addStar, resetStreak } = useScore();
  const inputRef = useRef<HTMLInputElement>(null);

  const totalDigits = puzzle.number.toString().length;
  const answerLen = puzzle.answer.toString().length;

  const showRoundPreview = clickedDivisor !== null;

  // --- Actions ---

  const resetRoundState = useCallback(() => {
    setInputValue('');
    setHighlightedIndex(null);
    setIsWin(false);

    setClickedDivisor(null);
    clearError();
  }, [clearError]);

  const startNewRound = useCallback(() => {
    setPuzzle(generateRoundingPuzzle({ maxDigits, exactDigits, place: placeOption }));
    resetRoundState();
  }, [maxDigits, exactDigits, placeOption, resetRoundState]);

  const handlePlaceChange = (val: RoundingPlace | 'random') => {
    setSelectedPlace(val);
    persist('rounder-place', val);
    setPuzzle(generateRoundingPuzzle({ maxDigits, exactDigits, place: val === 'random' ? undefined : val }));
    resetRoundState();
  };

  const handleNumDigitsChange = (d: number | 'random') => {
    setNumDigits(d);
    persist('rounder-num-digits', String(d));
    const newMax = d === 'random' ? 6 : d;
    const newExact = d === 'random' ? undefined : d;
    const placeStillValid = selectedPlace === 'random' || ROUNDING_OPTIONS.find(o => o.place === selectedPlace)!.minDigits <= newMax;
    const place = placeStillValid ? placeOption : undefined;
    if (!placeStillValid) { setSelectedPlace('random'); persist('rounder-place', 'random'); }
    setPuzzle(generateRoundingPuzzle({ maxDigits: newMax, exactDigits: newExact, place }));
    resetRoundState();
  };

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
    setHighlightedIndex(index);

    const placeFromRight = totalDigits - 1 - index;
    if (placeFromRight < 1) {
      setClickedDivisor(null);
  
      return;
    }

    setClickedDivisor(Math.pow(10, placeFromRight));
  };

  // --- Input formatting ---

  const updateInput = useCallback((raw: string) => {
    setInputValue(formatWithCommas(raw, answerLen));
    clearError();
  }, [answerLen, clearError]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'Enter' && isWin) {
        e.preventDefault();
        startNewRound();
        return;
      }

      if (!isWin && !clickedDivisor && (e.key === 'Backspace' || /^[0-9]$/.test(e.key))) {
        e.preventDefault();
        inputRef.current?.focus();
        let raw = inputValue.replace(/[^0-9]/g, '');
        raw = e.key === 'Backspace' ? raw.slice(0, -1) : raw + e.key;
        updateInput(raw);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWin, inputValue, clickedDivisor, startNewRound, updateInput]);

  // --- Derived values for round preview ---

  const roundUpNumber = clickedDivisor ? Math.ceil(puzzle.number / clickedDivisor) * clickedDivisor : puzzle.number;
  const roundDownNumber = clickedDivisor ? Math.floor(puzzle.number / clickedDivisor) * clickedDivisor : puzzle.number;
  const divisorLabel = clickedDivisor ? DIVISOR_LABELS[clickedDivisor] ?? String(clickedDivisor) : '';

  return (
    <motion.div
      animate={shakeAnimation}
      transition={{ duration: 0.4 }}
      className="w-full shrink-0 flex flex-1 items-center justify-center px-2 pb-4 pt-4 sm:pt-8 relative"
    >
      <Confetti active={isWin} />

      <div className="flex flex-col items-center justify-center gap-6 sm:gap-10 flex-1">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-200 uppercase tracking-widest drop-shadow-lg mb-2">
            Number Rounder
          </h2>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm sm:text-base font-medium">
            <span>Round to the</span>
            <select
              value={selectedPlace}
              onChange={(e) => handlePlaceChange(e.target.value as RoundingPlace | 'random')}
              className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-emerald-400 font-black text-sm sm:text-base cursor-pointer outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="random">random</option>
              {ROUNDING_OPTIONS.filter(o => o.minDigits <= maxDigits).map(o => (
                <option key={o.place} value={o.place}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Number display with round up/down previews */}
        <div className="relative flex flex-col items-center gap-5" style={{ perspective: '800px' }}>
          {/* Round up - hinged from bottom */}
          <motion.div
            initial={false}
            animate={{ opacity: showRoundPreview ? 0.7 : 0, rotateX: showRoundPreview ? 0 : 90 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center origin-bottom"
          >
            <span className="text-xs sm:text-sm font-black text-orange-300 uppercase tracking-wider mt-3">
              Round up{divisorLabel && ` (${divisorLabel})`}
            </span>
            <RoundedNumberDisplay number={roundUpNumber} color="orange" totalDigits={totalDigits} />
          </motion.div>

          <ClickableNumber
            number={puzzle.number}
            highlightedIndex={highlightedIndex}
            onDigitClick={handleDigitClick}
          />

          {/* Round down - hinged from top */}
          <motion.div
            initial={false}
            animate={{ opacity: showRoundPreview ? 0.7 : 0, rotateX: showRoundPreview ? 0 : -90 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center origin-top"
          >
            <RoundedNumberDisplay number={roundDownNumber} color="blue" totalDigits={totalDigits} />
            <span className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-wider">
              Round down{divisorLabel && ` (${divisorLabel})`}
            </span>
          </motion.div>
        </div>

        {/* Answer form */}
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
                updateInput(inputValue.replace(/[^0-9]/g, '').slice(0, -1));
              }
            }}
            onChange={(e) => updateInput(e.target.value.replace(/[^0-9]/g, ''))}
            disabled={isWin}
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
              className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-xl md:text-2xl shadow-xl active:scale-95 transition-all text-white flex justify-center items-center gap-2 ${isError ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
            >
              {isError ? 'TRY AGAIN!' : 'CHECK ANSWER'}
            </button>
          )}
        </form>
      </div>

      {/* Bar chart */}
      <div className="hidden md:flex items-center ml-8 lg:ml-12 transition-opacity" style={{ opacity: showChart ? 1 : 0 }}>
        <RoundingNumberLine
          key={puzzle.number}
          number={puzzle.number}
          divisor={puzzle.divisor}
          isWin={isWin}
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
                      onClick={() => handleNumDigitsChange(d)}
                      className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center transition-all ${numDigits === d ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      {d === 'random' ? '?' : d}
                    </button>
                  ))}
                </div>
              </label>
              <OptionsToggle checked={showMidpoint} storageKey="rounder-show-midpoint" onChange={setShowMidpoint} label="Show midpoint" />
              <OptionsToggle checked={showTarget} storageKey="rounder-show-target" onChange={setShowTarget} label="Show target number" />
              <OptionsToggle checked={showRoundButtons} storageKey="rounder-show-round-buttons" onChange={setShowRoundButtons} label="Show round up/down" />
              <OptionsToggle checked={showChart} storageKey="rounder-show-chart" onChange={setShowChart} label="Show bar chart" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
