const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => {
    // only log non-analytics requests that fail
    if (!request.url().includes('google-analytics')) {
      console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
    }
  });

  console.log('Navigating to http://localhost:5173/');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  console.log('Clicking the UltraProxy launch button...');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const launchBtn = buttons.find(b => b.textContent.includes('Launch Proxy'));
    if (launchBtn) launchBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  console.log('Typing search query google.com');
  await page.evaluate(() => {
    const input = document.querySelector('input');
    if(input) {
      input.value = 'google.com';
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(input, 'google.com');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  });

  console.log('Waiting for iframe to load (10s)...');
  await new Promise(r => setTimeout(r, 10000));

  console.log('Getting iframe content...');
  const frames = await page.frames();
  for (const frame of frames) {
    if (frame !== page.mainFrame()) {
      console.log('Iframe URL:', frame.url());
      try {
        const title = await frame.title();
        console.log('Iframe Title:', title);
        const bodyContent = await frame.evaluate(() => document.body.innerHTML.substring(0, 500));
        console.log('Iframe Body Preview:', bodyContent);
      } catch (e) {
        console.log('Cannot access iframe content:', e.message);
      }
    }
  }

  await browser.close();
})();
