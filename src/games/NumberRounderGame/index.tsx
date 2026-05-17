import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { Confetti } from '../../components/Confetti';
import { useShakeOnError } from '../../hooks/useShakeOnError';
import { useScore } from '../../hooks/useScore';
import { generateRoundingPuzzle, type RoundingPuzzle } from './generateRound';
import { ClickableNumber } from './ClickableNumber';

export function NumberRounderGame() {
  const [puzzle, setPuzzle] = useState<RoundingPuzzle>(generateRoundingPuzzle);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isWin, setIsWin] = useState(false);
  const { isError, triggerError, clearError, shakeAnimation } = useShakeOnError();
  const { addStar, resetStreak } = useScore();
  const inputRef = useRef<HTMLInputElement>(null);

  const startNewRound = () => {
    setPuzzle(generateRoundingPuzzle());
    setInputValue('');
    setHighlightedIndex(null);
    setIsWin(false);
    clearError();
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'Enter' && isWin) {
        e.preventDefault();
        startNewRound();
        return;
      }

      if (!isWin && (e.key === 'Backspace' || /^[0-9]$/.test(e.key))) {
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
  }, [isWin, inputValue, puzzle.answer]);

  return (
    <motion.div
      animate={shakeAnimation}
      transition={{ duration: 0.4 }}
      className="w-full shrink-0 flex flex-col flex-1 items-center justify-center gap-6 sm:gap-10 px-2 pb-4 pt-4 sm:pt-8 relative"
    >
      <Confetti active={isWin} />

      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-200 uppercase tracking-widest drop-shadow-lg mb-2">
          Number Rounder
        </h2>
        <p className="text-slate-400 text-sm sm:text-base font-medium">
          Round to the <span className="text-emerald-400 font-black">{puzzle.label}</span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <ClickableNumber
          number={puzzle.number}
          highlightedIndex={highlightedIndex}
          onDigitClick={setHighlightedIndex}
        />
        <p className="text-xs sm:text-sm text-slate-500 font-medium">Click a digit to highlight it</p>
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
    </motion.div>
  );
}
