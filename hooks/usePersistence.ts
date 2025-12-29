
import { useState, useEffect } from 'react';

export function usePersistence<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  const reset = () => {
    setState(initialValue);
    localStorage.removeItem(key);
  };

  return [state, setState, reset] as const;
}
