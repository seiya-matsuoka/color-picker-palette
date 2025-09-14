export default function FavoriteCell({
  color,
  onSelect,
  onCopy,
  onRemove,
  onDragStart,
  onDragEnd,
}) {
  return (
    <>
      <button
        className="cellBtn"
        style={{ backgroundColor: color }}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Delete' || e.key === 'Backspace') onRemove();
        }}
        title={`${color} を選択`}
        aria-label={`${color} を選択`}
      />
      <div className="cellMeta">
        <span
          className="dragHandle"
          title="ドラッグで並べ替え"
          aria-label="ドラッグで並べ替え"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          ☰
        </span>
        <button className="chip" onClick={onCopy} title="コピー">
          {color}
        </button>
        <button className="link" onClick={onRemove} title="削除" aria-label={`${color} を削除`}>
          ×
        </button>
      </div>
    </>
  );
}
