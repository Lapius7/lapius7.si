const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const P = '/root/project/web/lapius7.si/public';
  let page = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file:///tmp/og/og.html'); await page.waitForTimeout(500);
  await page.screenshot({ path: P + '/og.png' });
  for (const [size, name] of [[180,'apple-touch-icon.png'],[192,'icon-192.png'],[512,'icon-512.png'],[32,'favicon-32.png']]) {
    page = await b.newPage({ viewport: { width: 512, height: 512 } });
    await page.goto('file:///tmp/og/icon.html');
    await page.screenshot({ path: `${P}/${name}`, clip: { x:0, y:0, width:512, height:512 } });
    if (size !== 512) { // 縮小
      const p2 = await b.newPage({ viewport: { width: size, height: size } });
      await p2.setContent(`<style>*{margin:0}img{width:${size}px;height:${size}px;display:block}</style><img src="file://${P}/${name}">`);
      await p2.waitForTimeout(200); await p2.screenshot({ path: `${P}/${name}` });
    }
  }
  console.log('ok'); await b.close();
})();
