/**
 * useLocalStorage(key, initialValue)
 * 目的: React state と localStorage を簡易同期
 *
 * 動作:
 *  - 初期化時: localStorage に key があれば JSON.parse して採用、無ければ initialValue
 *  - 値更新: 値を JSON.stringify して localStorage に保存（try/catch）
 *
 * 例:
 *   const [theme, setTheme] = useLocalStorage('cpp.theme', 'light')
 *
 * @param {string} key
 * @param {any} initialValue
 * @returns {[any, (v:any)=>void]}
 */

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
