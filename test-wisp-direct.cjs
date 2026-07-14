const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  console.log('Navigating to app to register SW...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  console.log('Waiting for SW registration...');
  await new Promise(r => setTimeout(r, 2000));
  
  // Initialize Wisp
  await page.evaluate(async () => {
    const { BareMuxConnection } = await import('@mercuryworkshop/bare-mux');
    const workerUrl = '/baremux/worker.js';
    const connection = new BareMuxConnection(workerUrl);
    const epoxyUrl = '/epoxy/index.mjs';
    await connection.setTransport(epoxyUrl, [{ wisp: 'wss://wisp.mercurywork.shop/' }]);
    console.log('PAGE LOG: Transport initialized!');
  });
  
  await new Promise(r => setTimeout(r, 1000));

  console.log('Navigating directly to proxied example.com...');
  // hvtrs8%2F-ezaorl%2Ccmm is XOR encoded https://example.com
  await page.goto('http://localhost:5173/uv/service/hvtrs8%2F-ezaorl%2Ccmm', { waitUntil: 'networkidle0' });

  console.log('Taking screenshot...');
  await page.screenshot({ path: 'screenshot_direct.png' });
  
  const title = await page.title();
  const body = await page.evaluate(() => document.body.innerText.substring(0, 500));
  
  console.log('Title:', title);
  console.log('Body:', body);
  
  if (body.includes('Example Domain')) {
      console.log('SUCCESS: Example Domain loaded correctly via Wisp Proxy!');
  } else {
      console.log('FAILED to load Example Domain.');
  }

  await browser.close();
  console.log('Done.');
})();
