import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { COLUMNS, EMPTY_DIGITS } from '../../constants';
import type { Digits } from '../../constants';
import { NumberDisplay } from '../../components/NumberDisplay';
import { Confetti } from '../../components/Confetti';
import { useShakeOnError } from '../../hooks/useShakeOnError';
import { useScore } from '../../hooks/useScore';

export function ValueDecoderGame() {
  const [targetDigits, setTargetDigits] = useState<Digits>([...EMPTY_DIGITS] as Digits);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isWin, setIsWin] = useState(false);
  const { isError, triggerError, clearError, shakeAnimation } = useShakeOnError();
  const { addStar, resetStreak } = useScore();

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const newTarget: Digits = [...EMPTY_DIGITS] as Digits;

    // Pick highlight first, then build a number that includes that position
    const highlight = Math.floor(Math.random() * 4); // 0=thousands, 1=hundreds, 2=tens, 3=ones

    // Always fill from at least the highlighted position through ones
    // Also extend left sometimes for variety
    const earliestPossible = Math.min(highlight, Math.floor(Math.random() * (highlight + 1)));
    for (let i = earliestPossible; i <= 3; i++) {
      if (i === earliestPossible) {
        newTarget[i] = Math.floor(Math.random() * 9) + 1; // 1-9 to avoid leading zero
      } else {
        newTarget[i] = Math.floor(Math.random() * 10);
      }
    }

    // Ensure the highlighted digit is non-zero so the answer is meaningful
    if (newTarget[highlight] === 0) {
      newTarget[highlight] = Math.floor(Math.random() * 9) + 1;
    }

    setTargetDigits(newTarget);
    setHighlightedIndex(highlight);
    setInputValue('');
    setIsWin(false);
    clearError();
  };

  const expectedValue = targetDigits[highlightedIndex] * Math.pow(10, 3 - highlightedIndex);

  const handleVerify = (e?: FormEvent) => {
    e?.preventDefault();
    if (inputValue === '') return;
    if (parseInt(inputValue, 10) === expectedValue) {
      setIsWin(true);
      addStar();
    } else {
      triggerError();
      resetStreak();
    }
  };

  useEffect(() => {
    if (!isWin) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        startNewRound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWin]);

  const activeCol = COLUMNS.find((c): c is import('../../constants').PlaceColumn => c.isSeparator === false && c.id === highlightedIndex);
  const colorText = activeCol?.color ?? 'text-amber-400';
  const colorBg = activeCol?.bgLight ?? 'bg-amber-500/20';
  const colorBorder = activeCol?.border ?? 'border-amber-500/50';

  return (
    <motion.div
      animate={shakeAnimation}
      transition={{ duration: 0.4 }}
      className="w-full shrink-0 flex flex-col flex-1 items-center justify-center gap-4 sm:gap-8 px-1 pb-1 sm:pb-2 pt-8 sm:pt-12 relative"
    >
      <Confetti active={isWin} />
      <NumberDisplay digits={targetDigits} title="Target Power Level" highlightIndex={highlightedIndex} />

      <div className="text-center mt-4">
        <h3 className="text-xl sm:text-3xl font-black text-slate-200 uppercase leading-snug">
          What is the value of<br />
          the <span className={`${colorText} inline-block ${colorBg} px-4 py-1 rounded-xl mt-2 shadow-lg ${colorBorder} border`}>highlighted</span> digit?
        </h3>
      </div>

      <form
        onSubmit={isWin ? (e) => { e.preventDefault(); startNewRound(); } : handleVerify}
        className="flex flex-col items-center gap-4 w-full max-w-sm"
      >
        <input
          type="number"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); clearError(); }}
          disabled={isWin}
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
            NEXT PUZZLE
          </button>
        ) : (
          <button
            type="submit"
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-xl md:text-2xl shadow-xl active:scale-95 transition-all text-white flex justify-center items-center gap-2 ${isError ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
          >
            {isError ? 'TRY AGAIN!' : 'VERIFY VALUE'}
          </button>
        )}
      </form>
    </motion.div>
  );
}
