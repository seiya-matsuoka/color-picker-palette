/**
 * ColorControls
 * 役割: 色入力（<input type="color"> / HEXテキスト）、プレビュー、コピー、追加ボタン
 *
 * @param {{
 *   color: string,
 *   hexInput: string,
 *   error: string,
 *   inFavorites: boolean,
 *   effectiveText: string, // 実際に描画されるテキスト色（auto/black/white の結果）
 *   rgb: { r:number, g:number, b:number },
 *   onColorChange: (value:string) => void,
 *   onHexInputChange: (value:string) => void,
 *   onHexCommit: () => void,
 *   onCopyHex: () => void,
 *   onAddFavorite: () => void
 * }} props
 *
 * 入力: 現在色/入力値/エラーメッセージ/重複フラグ/テキスト色/rgb
 * 出力: なし（各UIイベントを props 経由で親に返す）
 */

export default function ColorControls({
  color,
  hexInput,
  error,
  inFavorites,
  effectiveText,
  rgb,
  onColorChange, // (value) => void
  onHexInputChange, // (value) => void
  onHexCommit, // () => void
  onCopyHex, // () => void
  onAddFavorite, // () => void
}) {
  return (
    <section className="panel">
      <div className="row">
        <label className="label" htmlFor="color-input">
          Color
        </label>
        <input
          id="color-input"
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
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
          onChange={(e) => onHexInputChange(e.target.value)}
          onBlur={onHexCommit}
          onKeyDown={(e) => e.key === 'Enter' && onHexCommit()}
          placeholder="#RRGGBB"
          className={`textInput ${error ? 'invalid' : ''}`}
          spellCheck="false"
        />
        <button className="btn" onClick={onCopyHex} title="HEX をコピー">
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
            onClick={onAddFavorite}
            title={inFavorites ? 'すでに追加済み' : 'お気に入りに追加'}
          >
            追加
          </button>
        </div>
      </div>
    </section>
  );
}
