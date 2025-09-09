// 輝度・コントラスト計算
import { hexToRgb } from './color.js';

export function sRgbToLinear(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({ r, g, b }) {
  const R = sRgbToLinear(r),
    G = sRgbToLinear(g),
    B = sRgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatioHex(bgHex, fgHex) {
  const bg = hexToRgb(bgHex);
  const fg = hexToRgb(fgHex);
  if (!bg || !fg) return null;
  const L1 = relativeLuminance(bg);
  const L2 = relativeLuminance(fg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function bestTextColor(bgHex) {
  const cB = contrastRatioHex(bgHex, '#000000') ?? 0;
  const cW = contrastRatioHex(bgHex, '#FFFFFF') ?? 0;
  return cB >= cW ? '#000000' : '#FFFFFF';
}
