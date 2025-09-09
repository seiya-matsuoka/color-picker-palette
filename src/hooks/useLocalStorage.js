import { useEffect, useState } from 'react';

// localStorage 永続化フック
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* localStorage が使えない環境（例: プライベートモード）。保存は諦める */
    }
  }, [key, value]);

  return [value, setValue];
}
