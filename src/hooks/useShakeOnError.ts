import { useState, useCallback } from 'react';

export function useShakeOnError(duration = 2000) {
  const [isError, setIsError] = useState(false);

  const triggerError = useCallback(() => {
    setIsError(true);
    setTimeout(() => setIsError(false), duration);
  }, [duration]);

  const clearError = useCallback(() => setIsError(false), []);

  const shakeAnimation = isError ? { x: [-15, 15, -10, 10, -5, 5, 0] } : {};

  return { isError, triggerError, clearError, shakeAnimation };
}
