export default function ContrastPanel({
  textMode, // 'auto' | 'black' | 'white'
  onChangeTextMode, // (mode) => void
  autoText, // '#000000' | '#FFFFFF'
  ratio, // number | null
  aaSmall,
  aaLarge,
  aaaSmall,
  aaaLarge,
}) {
  return (
    <section className="panel">
      <h2>アクセシビリティ</h2>

      <div className="row a11yRow">
        <div id="textcolor-label" className="label">
          テキスト色
        </div>
        <div className="segmented" role="group" aria-labelledby="textcolor-label">
          <button
            className={`segBtn ${textMode === 'auto' ? 'active' : ''}`}
            onClick={() => onChangeTextMode('auto')}
          >
            自動
          </button>
          <button
            className={`segBtn ${textMode === 'black' ? 'active' : ''}`}
            onClick={() => onChangeTextMode('black')}
          >
            黒
          </button>
          <button
            className={`segBtn ${textMode === 'white' ? 'active' : ''}`}
            onClick={() => onChangeTextMode('white')}
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
  );
}
