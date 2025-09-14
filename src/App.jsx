/**
 * App（ルートコンテナ）
 * 役割:
 *  - アプリ全体の状態管理（theme / color / favorites / textMode / adjustMode）
 *  - 表示に必要な派生値の計算（rgb/hsl/hsv/contrast/推奨テキスト色）
 *  - UIコンポーネントへ props で値とイベントハンドラを配線
 *
 * 主な状態（useState / useLocalStorage）:
 *  - theme: 'light' | 'dark'                   // localStorage: "cpp.theme"
 *  - color: string ('#RRGGBB')                 // 現在の選択色
 *  - favorites: string[]                       // お気に入りの色（localStorage: "cpp.favorites"）
 *  - textMode: 'auto' | 'black' | 'white'      // テキスト色の決定モード
 *  - adjustMode: 'hsl' | 'hsv'                 // 微調整UIのモード
 *
 * 主な派生値（useMemo）:
 *  - rgb / hsl / hsv: color からの変換
 *  - ratio: 背景(color)とテキスト色のコントラスト比
 *  - autoText: 背景に対して黒/白どちらが読みやすいかの推奨
 *
 * データフロー:
 *  - App → 子コンポーネント
 *  - ユーザー操作（クリック/入力/ドラッグ）→ ハンドラで state 更新 → 再描画
 *
 * 注意:
 *  - ユーティリティは /lib に分離（副作用なし）
 */

import { useEffect, useMemo, useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage.js';
import { hexToRgb, normalizeHex } from './lib/color.js';
import { bestTextColor, contrastRatioHex } from './lib/contrast.js';
import { hslToHex, hsvToHex, rgbToHsl, rgbToHsv } from './lib/convert.js';

import AdjustSliders from './components/AdjustSliders.jsx';
import ColorControls from './components/ColorControls.jsx';
import ContrastPanel from './components/ContrastPanel.jsx';
import FavoritesGrid from './components/Favorites/FavoritesGrid.jsx';
import Header from './components/Header.jsx';

export default function App() {
  // テーマ
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('cpp.theme', prefersDark ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // 色とお気に入り
  const [color, setColor] = useState('#00A3FF');
  const [hexInput, setHexInput] = useState(color);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useLocalStorage('cpp.favorites', []);
  useEffect(() => setHexInput(color), [color]);
  const inFavorites = useMemo(() => favorites.includes(color), [favorites, color]);

  // テキスト色（自動/手動）
  const [textMode, setTextMode] = useState('auto');
  const autoText = useMemo(() => bestTextColor(color), [color]);
  const effectiveText =
    textMode === 'auto' ? autoText : textMode === 'black' ? '#000000' : '#FFFFFF';
  const ratio = useMemo(() => {
    const r = contrastRatioHex(color, effectiveText);
    return r ? Number(r.toFixed(2)) : null;
  }, [color, effectiveText]);
  const aaSmall = ratio != null && ratio >= 4.5;
  const aaLarge = ratio != null && ratio >= 3.0;
  const aaaSmall = ratio != null && ratio >= 7.0;
  const aaaLarge = ratio != null && ratio >= 4.5;

  // HSL / HSV
  const rgb = useMemo(() => hexToRgb(color) ?? { r: 0, g: 0, b: 0 }, [color]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const hsv = useMemo(() => rgbToHsv(rgb), [rgb]);
  const [adjustMode, setAdjustMode] = useState('hsl');
  const hue = adjustMode === 'hsl' ? hsl.h : hsv.h;
  const sat = adjustMode === 'hsl' ? hsl.s : hsv.s;
  const lv = adjustMode === 'hsl' ? hsl.l : hsv.v;
  const setFromHsl = (hh, ss, ll) => setColor(hslToHex(hh, ss, ll));
  const setFromHsv = (hh, ss, vv) => setColor(hsvToHex(hh, ss, vv));
  const onHueChange = (v) =>
    adjustMode === 'hsl'
      ? setFromHsl(Number(v), hsl.s, hsl.l)
      : setFromHsv(Number(v), hsv.s, hsv.v);
  const onSatChange = (v) =>
    adjustMode === 'hsl'
      ? setFromHsl(hsl.h, Number(v), hsl.l)
      : setFromHsv(hsv.h, Number(v), hsv.v);
  const onLvChange = (v) =>
    adjustMode === 'hsl'
      ? setFromHsl(hsl.h, hsl.s, Number(v))
      : setFromHsv(hsv.h, hsv.s, Number(v));

  const hueBg = { background: 'linear-gradient(to right, #f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' };
  const sBg =
    adjustMode === 'hsl'
      ? {
          background: `linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`,
        }
      : {
          background: `linear-gradient(to right, ${hsvToHex(hsv.h, 0, hsv.v)}, ${hsvToHex(hsv.h, 100, hsv.v)})`,
        };
  const lvBg =
    adjustMode === 'hsl'
      ? {
          background: `linear-gradient(to right, ${hslToHex(hsl.h, hsl.s, 0)}, ${hslToHex(hsl.h, hsl.s, 50)}, ${hslToHex(hsl.h, hsl.s, 100)})`,
        }
      : {
          background: `linear-gradient(to right, ${hsvToHex(hsv.h, hsv.s, 0)}, ${hsvToHex(hsv.h, hsv.s, 50)}, ${hsvToHex(hsv.h, hsv.s, 100)})`,
        };

  // 操作系
  function onColorChange(value) {
    setError('');
    setColor(value.toUpperCase());
  }
  function onHexCommit() {
    const normalized = normalizeHex(hexInput);
    if (!normalized) {
      setError('HEX は #RRGGBB または #RGB 形式で入力してください');
      return;
    }
    setError('');
    setColor(normalized);
  }
  function onAddFavorite() {
    if (!inFavorites) setFavorites([color, ...favorites].slice(0, 24));
  }
  function onRemoveColor(target) {
    setFavorites(favorites.filter((c) => c !== target));
  }
  async function copyToClipboard(value) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* Clipboard API が無い/拒否された場合は黙って無視 */
    }
  }
  function resetData() {
    if (!confirm('保存データ（お気に入り/テーマ）をリセットしますか？')) return;
    try {
      localStorage.removeItem('cpp.favorites');
      localStorage.removeItem('cpp.theme');
    } catch {
      /* localStorage 不可環境は無視 */
    }
    setFavorites([]);
    setTheme(prefersDark ? 'dark' : 'light');
  }
  function onReorder(from, to) {
    setFavorites((prev) => {
      const arr = [...prev];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
  }

  return (
    <div className="wrap">
      <Header theme={theme} onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />

      <ColorControls
        color={color}
        hexInput={hexInput}
        error={error}
        inFavorites={inFavorites}
        effectiveText={effectiveText}
        rgb={rgb}
        onColorChange={onColorChange}
        onHexInputChange={setHexInput}
        onHexCommit={onHexCommit}
        onCopyHex={() => copyToClipboard(color)}
        onAddFavorite={onAddFavorite}
      />

      <AdjustSliders
        adjustMode={adjustMode}
        onChangeMode={setAdjustMode}
        hue={hue}
        sat={sat}
        lv={lv}
        hueBg={hueBg}
        sBg={sBg}
        lvBg={lvBg}
        onChangeHue={onHueChange}
        onChangeSat={onSatChange}
        onChangeLv={onLvChange}
      />

      <ContrastPanel
        textMode={textMode}
        onChangeTextMode={setTextMode}
        autoText={autoText}
        ratio={ratio}
        aaSmall={aaSmall}
        aaLarge={aaLarge}
        aaaSmall={aaaSmall}
        aaaLarge={aaaLarge}
      />

      <section className="panel">
        <h2>お気に入り</h2>
        <FavoritesGrid
          favorites={favorites}
          onSelectColor={setColor}
          onCopyColor={copyToClipboard}
          onRemoveColor={onRemoveColor}
          onReorder={onReorder}
        />
      </section>

      <footer className="footer">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="subtle">データはこのブラウザに保存されます。</span>
          <button className="btn" onClick={resetData} title="保存データを削除">
            データをリセット
          </button>
        </div>
        <details className="subtle" style={{ marginTop: 6 }}>
          <summary>保存の詳細</summary>
          <small>
            localStorage キー: <code>cpp.favorites</code> / <code>cpp.theme</code>
          </small>
        </details>
      </footer>
    </div>
  );
}
