# Color Picker & Palette

HSL/HSV の調整・コントラスト表示つきのカラーパレット（React + Vite）。

## デモ

公開URL:https://seiya-matsuoka.github.io/color-picker-palette/

[![Deploy to GitHub Pages](https://github.com/seiya-matsuoka/color-picker-palette/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/seiya-matsuoka/color-picker-palette/actions/workflows/deploy.yml)

## 主な機能

- Color input + HEX 入力/コピー
- HSL/HSV スライダーで調整
- コントラスト比表示（AA/AAA 判定）とテキスト色の自動/黒/白切替
- お気に入りに追加・ドラッグ＆ドロップで並べ替え（localStorage 永続化）
- ライト/ダークのテーマ切替
- 「データをリセット」ボタン（localStorage クリア）

## スクリーンショット

![screenshot](docs/screenshot.png)

## クイックスタート

```bash
npm i
npm run dev
```

## スクリプト

- `dev` 開発サーバ
- `build` 本番ビルド
- `preview` ビルドのプレビュー
- `check` Prettier & ESLint チェック
- `format:check` / `format:fix`
- `lint` / `lint:fix`

## プロジェクト構成（抜粋）

```
src/
  components/
    Favorites/
      FavoriteCell.jsx
      FavoritesGrid.jsx
    AdjustSliders.jsx
    ColorControls.jsx
    ContrastPanel.jsx
    Header.jsx
  hooks/
    useLocalStorage.js
  lib/
    color.js
    convert.js
    contrast.js
  App.jsx
  main.jsx
  index.css
```

## 技術スタック

- React + Vite
- ESLint v9（Flat Config）/ Prettier
- localStorage（キー: `cpp.favorites`, `cpp.theme`）

## デプロイ（GitHub Pages）

- `vite.config.js` の `base` を `'/color-picker-palette/'` に設定
- GitHub Actions（`deploy.yml`）が `main` への push で自動デプロイ
