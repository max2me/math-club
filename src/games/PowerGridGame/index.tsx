import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { COLUMNS, EMPTY_DIGITS } from '../../constants';
import type { Digits, PlaceColumn } from '../../constants';
import { NumberDisplay } from '../../components/NumberDisplay';
import { GameButton, NextMissionButton } from '../../components/GameButton';
import { Confetti } from '../../components/Confetti';
import { useShakeOnError } from '../../hooks/useShakeOnError';
import { useScore } from '../../hooks/useScore';
import { generateTarget } from './generateTarget';
import { PlaceValueColumn } from './PlaceValueColumn';
import { DecimalSeparator } from './DecimalSeparator';

const PLACE_COLUMNS = COLUMNS.filter((c): c is PlaceColumn => c.isSeparator === false);
const PLACE_IDS = PLACE_COLUMNS.map(c => c.id);

export function PowerGridGame() {
  const [digits, setDigits] = useState<Digits>([...EMPTY_DIGITS] as Digits);
  const [targetDigits, setTargetDigits] = useState<Digits>([...EMPTY_DIGITS] as Digits);
  const [isWin, setIsWin] = useState(false);
  const [focusedCol, setFocusedCol] = useState(3);
  const { isError, triggerError, clearError, shakeAnimation } = useShakeOnError();
  const { addStar, resetStreak } = useScore();

  const startNewRound = useCallback(() => {
    setTargetDigits(generateTarget());
    setDigits([...EMPTY_DIGITS] as Digits);
    setIsWin(false);
    setFocusedCol(3);
    clearError();
  }, [clearError]);

  useEffect(() => {
    startNewRound();
  }, []);

  const handleVerify = useCallback(() => {
    if (digits.every((val, i) => val === targetDigits[i])) {
      setIsWin(true);
      addStar();
    } else {
      triggerError();
      resetStreak();
    }
  }, [digits, targetDigits, triggerError, addStar, resetStreak]);

  const handleUpdate = useCallback((index: number, delta: number) => {
    if (isWin) return;
    setDigits(prev => {
      const newVal = prev[index] + delta;
      if (newVal >= 0 && newVal <= 9) {
        const newDigits = [...prev] as Digits;
        newDigits[index] = newVal;
        return newDigits;
      }
      return prev;
    });
    clearError();
  }, [isWin, clearError]);

  const handleSetDigit = useCallback((index: number, value: number) => {
    if (isWin) return;
    setDigits(prev => {
      const newDigits = [...prev] as Digits;
      newDigits[index] = value;
      return newDigits;
    });
    clearError();
  }, [isWin, clearError]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (isWin) {
          startNewRound();
        } else {
          handleVerify();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedCol(prev => {
          const idx = PLACE_IDS.indexOf(prev);
          return PLACE_IDS[Math.max(0, idx - 1)];
        });
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedCol(prev => {
          const idx = PLACE_IDS.indexOf(prev);
          return PLACE_IDS[Math.min(PLACE_IDS.length - 1, idx + 1)];
        });
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleUpdate(focusedCol, 1);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleUpdate(focusedCol, -1);
        return;
      }

      const digit = parseInt(e.key, 10);
      if (!isNaN(digit) && digit >= 0 && digit <= 9) {
        e.preventDefault();
        handleSetDigit(focusedCol, digit);
        setFocusedCol(prev => {
          const idx = PLACE_IDS.indexOf(prev);
          return PLACE_IDS[Math.min(PLACE_IDS.length - 1, idx + 1)];
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWin, focusedCol, handleVerify, handleUpdate, handleSetDigit, startNewRound]);

  return (
    <>
      <motion.div
        animate={shakeAnimation}
        transition={{ duration: 0.4 }}
        className="w-full shrink-0 flex flex-col items-center gap-1.5 sm:gap-2 px-1 pb-1 sm:pb-2 relative"
      >
        <Confetti active={isWin} />
        <NumberDisplay digits={targetDigits} title="Target Power Level" bounce={!isWin} />
        <NumberDisplay digits={digits} title="Our Current Power" />

        {isWin ? (
          <NextMissionButton onClick={startNewRound} />
        ) : (
          <GameButton onClick={handleVerify} variant={isError ? 'error' : 'verify'}>
            {isError ? 'NOT QUITE MATCHING!' : 'VERIFY POWER LEVEL'}
          </GameButton>
        )}
      </motion.div>

      <div className="w-full flex-1 min-h-[150px] max-h-[280px] sm:max-h-[320px] bg-slate-950/50 rounded-xl sm:rounded-2xl md:rounded-3xl p-1 sm:p-2 md:p-4 shadow-2xl border border-slate-800 flex flex-col mt-1 sm:mt-2">
        <div className="flex w-full h-full items-stretch justify-center gap-0.5 sm:gap-1 md:gap-2">
          {COLUMNS.map((col) => {
            if (col.isSeparator === true) {
              return <DecimalSeparator key="separator" />;
            }
            return (
              <PlaceValueColumn
                key={col.id}
                col={col}
                value={digits[col.id]}
                disabled={isWin}
                focused={focusedCol === col.id}
                onFocus={() => setFocusedCol(col.id)}
                onIncrement={() => handleUpdate(col.id, 1)}
                onDecrement={() => handleUpdate(col.id, -1)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
