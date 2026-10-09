# lapius7.si

lapius7.si の案内ページ。個人で開発しているサービスの公式サイトは [lapius7.com](https://lapius7.com) です。

サイト: https://lapius7.si

## 技術スタック

React 19 / TypeScript / Vite / Tailwind CSS v4 / Radix UI / Motion

## 開発

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # 型チェック + 本番ビルド (dist/)
npm run preview  # ビルド結果のプレビュー
```

## デプロイ

VPS 上で `git pull` → `npm run build`。`dist/` を nginx が配信します。
