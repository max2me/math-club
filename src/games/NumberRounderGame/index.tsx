import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Settings } from 'lucide-react';
import { Confetti } from '../../components/Confetti';
import { useShakeOnError } from '../../hooks/useShakeOnError';
import { useScore } from '../../hooks/useScore';
import { generateRoundingPuzzle, type RoundingPuzzle } from './generateRound';
import { ClickableNumber, type AnimatingState } from './ClickableNumber';
import { RoundingNumberLine } from './RoundingNumberLine';

type RoundDirection = 'up' | 'down';
type HelpStep = 'idle' | 'ask-direction' | 'animating' | 'done';

function getMaxDigits(): number {
  try {
    const val = parseInt(localStorage.getItem('rounder-max-digits') ?? '', 10);
    if (val >= 2 && val <= 6) return val;
  } catch {}
  return 6;
}

function saveMaxDigits(digits: number) {
  localStorage.setItem('rounder-max-digits', String(digits));
}

export function NumberRounderGame() {
  const [maxDigits, setMaxDigits] = useState(getMaxDigits);
  const [showOptions, setShowOptions] = useState(false);
  const [puzzle, setPuzzle] = useState<RoundingPuzzle>(() => generateRoundingPuzzle({ maxDigits: getMaxDigits() }));
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
  const containerRef = useRef<HTMLDivElement>(null);

  const numStr = puzzle.number.toString();
  const totalDigits = numStr.length;

  const getCorrectPlaceIndex = useCallback(() => {
    const placeFromRight = Math.log10(puzzle.divisor);
    return totalDigits - 1 - placeFromRight;
  }, [puzzle, totalDigits]);

  const startNewRound = useCallback(() => {
    setPuzzle(generateRoundingPuzzle({ maxDigits }));
    setInputValue('');
    setHighlightedIndex(null);
    setIsWin(false);
    setHelpStep('idle');
    setAnimating(null);
    setShowNeighborHighlight(false);
    clearError();
  }, [maxDigits, clearError]);

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
    setShowNeighborHighlight(false);

    const correctIndex = getCorrectPlaceIndex();
    if (index === correctIndex) {
      setTimeout(() => {
        setShowNeighborHighlight(true);
      }, 350);
      setTimeout(() => setHelpStep('ask-direction'), 700);
    } else {
      setHelpStep('idle');
    }
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
          <p className="text-slate-400 text-sm sm:text-base font-medium">
            Round to the <span className="text-emerald-400 font-black">{puzzle.label}</span>
          </p>
          <p className={`text-sm sm:text-base font-medium mt-1 transition-opacity text-slate-400 ${showNeighborHighlight ? 'opacity-100' : 'opacity-0'}`}>
            Now round up or down based on the <span className="border-b-2 border-amber-400 pb-0.5 text-slate-300">next digit</span>
          </p>
        </div>

      <div ref={containerRef} className="relative flex flex-col items-center gap-3">
        <ClickableNumber
          number={puzzle.number}
          highlightedIndex={highlightedIndex}
          neighborIndex={showNeighborHighlight ? getCorrectPlaceIndex() + 1 : null}
          disabled={helpStep === 'ask-direction' || helpStep === 'animating'}
          onDigitClick={handleDigitClick}
          animating={animating ?? undefined}
        />

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

      <div className="hidden md:flex items-center ml-8 lg:ml-12">
        <RoundingNumberLine
          key={puzzle.number}
          number={puzzle.number}
          divisor={puzzle.divisor}
          isWin={isWin}
          underlineDigitIndex={showNeighborHighlight ? getCorrectPlaceIndex() + 1 : null}
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
              className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl"
            >
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Max digits</span>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6].map(d => (
                    <button
                      key={d}
                      onClick={() => { setMaxDigits(d); saveMaxDigits(d); setPuzzle(generateRoundingPuzzle({ maxDigits: d })); setShowOptions(false); }}
                      className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center transition-all ${maxDigits === d ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
