// 色の基本ユーティリティ
export function normalizeHex(input) {
  if (!input) return null;
  let s = input.trim().replace(/^#/, '').toUpperCase();
  if (!/^[0-9A-F]{3}$|^[0-9A-F]{6}$/.test(s)) return null;
  if (s.length === 3)
    s = s
      .split('')
      .map((c) => c + c)
      .join('');
  return `#${s}`;
}

export function hexToRgb(hex) {
  const n = normalizeHex(hex);
  if (!n) return null;
  const x = n.slice(1);
  return {
    r: parseInt(x.slice(0, 2), 16),
    g: parseInt(x.slice(2, 4), 16),
    b: parseInt(x.slice(4, 6), 16),
  };
}

export function clamp255(n) {
  return Math.round(Math.max(0, Math.min(255, n)));
}

export function toHex(n) {
  return clamp255(n).toString(16).padStart(2, '0').toUpperCase();
}

export function rgbToHex({ r, g, b }) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
