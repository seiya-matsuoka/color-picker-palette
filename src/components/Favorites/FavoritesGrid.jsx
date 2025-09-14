/**
 * FavoritesGrid
 * 役割: お気に入り色リストの表示 + DnD 並べ替え
 *
 * @param {{
 *   favorites: string[],
 *   onSelectColor: (hex:string) => void,
 *   onCopyColor: (hex:string) => void,
 *   onRemoveColor: (hex:string) => void,
 *   onReorder: (from:number, to:number) => void
 * }} props
 *
 * 入力: favorites 配列
 * 出力: onSelectColor / onCopyColor / onRemoveColor / onReorder
 */

import { useState } from 'react';
import FavoriteCell from './FavoriteCell.jsx';

export default function FavoritesGrid({
  favorites, // string[]
  onSelectColor, // (color) => void
  onCopyColor, // (color) => void
  onRemoveColor, // (color) => void
  onReorder, // (fromIndex, toIndex) => void
}) {
  const [dragOverIndex, setDragOverIndex] = useState(null);

  function handleDragStart(e, index) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }
  function handleDrop(e, toIndex) {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    const fromIndex = raw ? Number(raw) : null;
    setDragOverIndex(null);
    if (fromIndex == null || fromIndex === toIndex) return;
    onReorder(fromIndex, toIndex);
  }

  if (!favorites.length) {
    return <p className="subtle">まだありません。気に入った色を「追加」してね。</p>;
  }

  return (
    <>
      <ul className="grid" onDragOver={(e) => e.preventDefault()}>
        {favorites.map((c, i) => (
          <li
            key={c}
            className={`cell ${dragOverIndex === i ? 'dragOver' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragOverIndex(i)}
            onDrop={(e) => handleDrop(e, i)}
          >
            <FavoriteCell
              color={c}
              onSelect={() => onSelectColor(c)}
              onCopy={() => onCopyColor(c)}
              onRemove={() => onRemoveColor(c)}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragEnd={() => setDragOverIndex(null)}
            />
          </li>
        ))}
      </ul>
      <p className="subtle" style={{ marginTop: 8 }}>
        ヒント: ☰ をドラッグして並べ替えできます
      </p>
    </>
  );
}
