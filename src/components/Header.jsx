export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="headerLeft">
        <h1>カラーピッカー & お気に入りパレット</h1>
        <p className="subtle">シンプルなカラーパレット（HSL/HSV調整・コントラスト表示）</p>
      </div>
      <button className="btn" onClick={onToggleTheme} title="テーマ切替" aria-label="テーマ切替">
        {theme === 'light' ? '🌙 ダーク' : '☀️ ライト'}
      </button>
    </header>
  );
}
