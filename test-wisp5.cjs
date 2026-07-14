const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => {
    if (!request.url().includes('google-analytics')) {
      console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
    }
  });

  console.log('Navigating to http://localhost:5173/');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  console.log('Waiting for SW registration...');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking Launch Environment...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const launchBtn = buttons.find(b => b.textContent.includes('Launch Environment'));
    if (launchBtn) launchBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  console.log('Typing search query https://example.com');
  await page.evaluate(() => {
    const input = document.querySelector('input');
    if(input) {
      input.value = 'https://example.com';
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(input, 'https://example.com');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      const form = document.querySelector('form');
      if (form) {
          const btn = form.querySelector('button[type="submit"]');
          if (btn) btn.click();
          else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    } else {
        console.log('INPUT NOT FOUND!');
    }
  });

  console.log('Waiting for iframe to load (15s)...');
  await new Promise(r => setTimeout(r, 15000));
  await page.screenshot({ path: 'screenshot_example.png' });

  const frames = await page.frames();
  for (const frame of frames) {
    if (frame !== page.mainFrame()) {
      console.log('Iframe URL:', frame.url());
      try {
        const title = await frame.title();
        console.log('Iframe Title:', title);
        const bodyContent = await frame.evaluate(() => document.body.innerHTML.substring(0, 1000));
        console.log('Iframe Body Preview:', bodyContent);
      } catch (e) {
        console.log('Cannot access iframe content:', e.message);
      }
    }
  }

  await browser.close();
})();
