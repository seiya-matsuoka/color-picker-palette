import { useEffect, useMemo, useRef, useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage.js';
import { hexToRgb, normalizeHex } from './lib/color.js';
import { bestTextColor, contrastRatioHex } from './lib/contrast.js';
import { hslToHex, hsvToHex, rgbToHsl, rgbToHsv } from './lib/convert.js';

/* ===== Main App ===== */
export default function App() {
  /* テーマ（ライト/ダーク） */
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('cpp.theme', prefersDark ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  /* 色とお気に入り */
  const [color, setColor] = useState('#00A3FF');
  const [hexInput, setHexInput] = useState(color);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useLocalStorage('cpp.favorites', []);
  useEffect(() => setHexInput(color), [color]);
  const inFavorites = useMemo(() => favorites.includes(color), [favorites, color]);

  /* テキスト色（自動/手動） */
  const [textMode, setTextMode] = useState('auto'); // 'auto' | 'black' | 'white'
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

  /* HSL / HSV スライダー */
  const rgb = useMemo(() => hexToRgb(color) ?? { r: 0, g: 0, b: 0 }, [color]);
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb]);
  const hsv = useMemo(() => rgbToHsv(rgb), [rgb]);
  const [adjustMode, setAdjustMode] = useState('hsl'); // 'hsl' | 'hsv'
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

  const hueBg = {
    background: 'linear-gradient(to right, #f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
  };
  const sBg =
    adjustMode === 'hsl'
      ? {
          background: `linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(
            hsl.h,
            100,
            hsl.l
          )})`,
        }
      : {
          background: `linear-gradient(to right, ${hsvToHex(hsv.h, 0, hsv.v)}, ${hsvToHex(
            hsv.h,
            100,
            hsv.v
          )})`,
        };
  const lvBg =
    adjustMode === 'hsl'
      ? {
          background: `linear-gradient(to right, ${hslToHex(hsl.h, hsl.s, 0)}, ${hslToHex(
            hsl.h,
            hsl.s,
            50
          )}, ${hslToHex(hsl.h, hsl.s, 100)})`,
        }
      : {
          background: `linear-gradient(to right, ${hsvToHex(hsv.h, hsv.s, 0)}, ${hsvToHex(
            hsv.h,
            hsv.s,
            50
          )}, ${hsvToHex(hsv.h, hsv.s, 100)})`,
        };

  /* DnD 並べ替え（宣言＆使用） */
  const dragFrom = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  function handleDragStart(e, index) {
    dragFrom.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }
  function handleDragEnter(index) {
    setDragOverIndex(index);
  }
  function handleDrop(e, toIndex) {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    const fromIndex = raw ? Number(raw) : dragFrom.current;
    setDragOverIndex(null);
    if (fromIndex == null || fromIndex === toIndex) return;
    setFavorites((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  }
  function handleDragEnd() {
    setDragOverIndex(null);
    dragFrom.current = null;
  }

  /* 操作 */
  function handleColorPicker(e) {
    setError('');
    setColor(e.target.value.toUpperCase());
  }
  function commitHexInput() {
    const normalized = normalizeHex(hexInput);
    if (!normalized) {
      setError('HEX は #RRGGBB または #RGB 形式で入力してください');
      return;
    }
    setError('');
    setColor(normalized);
  }
  function addFavorite() {
    if (!inFavorites) {
      setFavorites([color, ...favorites].slice(0, 24));
    }
  }
  function removeFavorite(target) {
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

  return (
    <div className="wrap">
      <header className="header">
        <div className="headerLeft">
          <h1>カラーピッカー & お気に入りパレット</h1>
          <p className="subtle">シンプルなカラーパレット（HSL/HSV調整・コントラスト表示）</p>
        </div>
        <button
          className="btn"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title="テーマ切替"
          aria-label="テーマ切替"
        >
          {theme === 'light' ? '🌙 ダーク' : '☀️ ライト'}
        </button>
      </header>

      {/* 基本操作 */}
      <section className="panel">
        <div className="row">
          <label className="label" htmlFor="color-input">
            Color
          </label>
          <input
            id="color-input"
            type="color"
            value={color}
            onChange={handleColorPicker}
            className="colorInput"
          />
        </div>

        <div className="row">
          <label className="label" htmlFor="hex-input">
            HEX
          </label>
          <input
            id="hex-input"
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={commitHexInput}
            onKeyDown={(e) => e.key === 'Enter' && commitHexInput()}
            placeholder="#RRGGBB"
            className={`textInput ${error ? 'invalid' : ''}`}
            spellCheck="false"
          />
          <button className="btn" onClick={() => copyToClipboard(color)} title="HEX をコピー">
            Copy
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="preview" style={{ backgroundColor: color, color: effectiveText }}>
          <div className="previewInner">
            <div className="swatch" style={{ backgroundColor: color }} />
            <div className="previewText">
              <div className="hex">{color}</div>
              <div className="rgb">{`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}</div>
            </div>
          </div>
          <div className="previewActions">
            <button
              className="btn primary"
              disabled={inFavorites}
              aria-disabled={inFavorites}
              onClick={addFavorite}
              title={inFavorites ? 'すでに追加済み' : 'お気に入りに追加'}
            >
              追加
            </button>
          </div>
        </div>
      </section>

      {/* 微調整 */}
      <section className="panel">
        <h2>微調整</h2>

        <div className="row a11yRow">
          <div id="mode-label" className="label">
            モード
          </div>
          <div className="segmented" role="group" aria-labelledby="mode-label">
            <button
              className={`segBtn ${adjustMode === 'hsl' ? 'active' : ''}`}
              onClick={() => setAdjustMode('hsl')}
            >
              HSL
            </button>
            <button
              className={`segBtn ${adjustMode === 'hsv' ? 'active' : ''}`}
              onClick={() => setAdjustMode('hsv')}
            >
              HSV
            </button>
          </div>
        </div>

        <div className="sliderRow">
          <div className="sliderLabel">H</div>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={hue}
            className="sliderInput"
            style={hueBg}
            onChange={(e) => onHueChange(e.target.value)}
          />
          <div className="sliderValue">{hue}</div>
        </div>

        <div className="sliderRow">
          <div className="sliderLabel">S</div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={sat}
            className="sliderInput"
            style={sBg}
            onChange={(e) => onSatChange(e.target.value)}
          />
          <div className="sliderValue">{sat}%</div>
        </div>

        <div className="sliderRow">
          <div className="sliderLabel">{adjustMode === 'hsl' ? 'L' : 'V'}</div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={lv}
            className="sliderInput"
            style={lvBg}
            onChange={(e) => onLvChange(e.target.value)}
          />
          <div className="sliderValue">{lv}%</div>
        </div>
      </section>

      {/* アクセシビリティ（コントラスト） */}
      <section className="panel">
        <h2>アクセシビリティ</h2>

        <div className="row a11yRow">
          <div id="textcolor-label" className="label">
            テキスト色
          </div>
          <div className="segmented" role="group" aria-labelledby="textcolor-label">
            <button
              className={`segBtn ${textMode === 'auto' ? 'active' : ''}`}
              onClick={() => setTextMode('auto')}
            >
              自動
            </button>
            <button
              className={`segBtn ${textMode === 'black' ? 'active' : ''}`}
              onClick={() => setTextMode('black')}
            >
              黒
            </button>
            <button
              className={`segBtn ${textMode === 'white' ? 'active' : ''}`}
              onClick={() => setTextMode('white')}
            >
              白
            </button>
          </div>
          <span className="subtle">推奨: {autoText === '#000000' ? '黒' : '白'}</span>
        </div>

        <div className="row a11yRow">
          <div className="contrastBox">
            <div className="contrastValue">{ratio ? `${ratio}:1` : '-'}</div>
            <div className="subtle">コントラスト比</div>
          </div>
          <div className="badges">
            <span className={`badge ${aaSmall ? 'pass' : ''}`}>AA 小</span>
            <span className={`badge ${aaLarge ? 'pass' : ''}`}>AA 大</span>
            <span className={`badge ${aaaSmall ? 'pass' : ''}`}>AAA 小</span>
            <span className={`badge ${aaaLarge ? 'pass' : ''}`}>AAA 大</span>
          </div>
        </div>
      </section>

      {/* お気に入り（ドラッグで並べ替え） */}
      <section className="panel">
        <h2>お気に入り</h2>
        {favorites.length === 0 ? (
          <p className="subtle">まだありません。気に入った色を「追加」してね。</p>
        ) : (
          <ul className="grid" onDragOver={(e) => e.preventDefault()}>
            {favorites.map((c, i) => (
              <li
                key={c}
                className={`cell ${dragOverIndex === i ? 'dragOver' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => handleDragEnter(i)}
                onDrop={(e) => handleDrop(e, i)}
              >
                <button
                  className="cellBtn"
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Delete' || e.key === 'Backspace') removeFavorite(c);
                  }}
                  title={`${c} を選択`}
                  aria-label={`${c} を選択`}
                />
                <div className="cellMeta">
                  <span
                    className="dragHandle"
                    title="ドラッグで並べ替え"
                    aria-label="ドラッグで並べ替え"
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragEnd={handleDragEnd}
                  >
                    ☰
                  </span>
                  <button className="chip" onClick={() => copyToClipboard(c)} title="コピー">
                    {c}
                  </button>
                  <button
                    className="link"
                    onClick={() => removeFavorite(c)}
                    title="削除"
                    aria-label={`${c} を削除`}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {favorites.length > 0 && (
          <p className="subtle" style={{ marginTop: 8 }}>
            ヒント: ☰ をドラッグして並べ替えできます
          </p>
        )}
      </section>

      {/* フッター */}
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
