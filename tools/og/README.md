# OGP 画像とアイコンの再生成

`og.html`(1200x630)と `icon.html` から、`public/` 内の og.png / apple-touch-icon.png / icon-192.png / icon-512.png / favicon-32.png を作る。
文言や色を変えたら Playwright で実行して、`npm run build` する。

    cd ~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill && node run.js /root/project/web/lapius7.si/tools/og/render.js
