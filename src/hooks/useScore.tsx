import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ScoreContextType = {
  streak: number;
  totalStars: number;
  addStar: () => void;
  resetStreak: () => void;
};

const ScoreContext = createContext<ScoreContextType | null>(null);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

  const addStar = useCallback(() => {
    setStreak(s => s + 1);
    setTotalStars(t => t + 1);
  }, []);

  const resetStreak = useCallback(() => {
    setStreak(0);
  }, []);

  return (
    <ScoreContext.Provider value={{ streak, totalStars, addStar, resetStreak }}>
      {children}
    </ScoreContext.Provider>
  );
}

export function useScore() {
  const ctx = useContext(ScoreContext);
  if (!ctx) throw new Error('useScore must be used within ScoreProvider');
  return ctx;
}
