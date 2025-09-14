/**
 * AdjustSliders
 * 役割: HSL / HSV スライダーで色を微調整
 *
 * @param {{
 *   adjustMode: 'hsl'|'hsv',
 *   onChangeMode: (mode:'hsl'|'hsv') => void,
 *   hue: number,
 *   sat: number,
 *   lv: number,
 *   hueBg: object,
 *   sBg: object,
 *   lvBg: object, // スライダー背景グラデ用 style
 *   onChangeHue: (value:string|number) => void,
 *   onChangeSat: (value:string|number) => void,
 *   onChangeLv: (value:string|number) => void
 * }} props
 *
 * 入力: モード/現在値/背景style
 * 出力: なし（スライダー操作を props に伝える）
 */

export default function AdjustSliders({
  adjustMode, // 'hsl' | 'hsv'
  onChangeMode, // (mode) => void
  hue,
  sat,
  lv,
  hueBg,
  sBg,
  lvBg, // style objects
  onChangeHue, // (value) => void
  onChangeSat, // (value) => void
  onChangeLv, // (value) => void
}) {
  return (
    <section className="panel">
      <h2>微調整</h2>

      <div className="row a11yRow">
        <div id="mode-label" className="label">
          モード
        </div>
        <div className="segmented" role="group" aria-labelledby="mode-label">
          <button
            className={`segBtn ${adjustMode === 'hsl' ? 'active' : ''}`}
            onClick={() => onChangeMode('hsl')}
          >
            HSL
          </button>
          <button
            className={`segBtn ${adjustMode === 'hsv' ? 'active' : ''}`}
            onClick={() => onChangeMode('hsv')}
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
          onChange={(e) => onChangeHue(e.target.value)}
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
          onChange={(e) => onChangeSat(e.target.value)}
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
          onChange={(e) => onChangeLv(e.target.value)}
        />
        <div className="sliderValue">{lv}%</div>
      </div>
    </section>
  );
}
