const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  console.log('Navigating to app...');
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
    }
  });

  console.log('Waiting for iframe to load content (10s)...');
  await new Promise(r => setTimeout(r, 10000));
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'screenshot_final_test.png' });
  
  console.log('Checking iframe content...');
  try {
    const iframeElement = await page.$('iframe');
    if (iframeElement) {
        const frame = await iframeElement.contentFrame();
        if (frame) {
            const title = await frame.title();
            console.log('Iframe Title:', title);
            const body = await frame.evaluate(() => document.body.innerText.substring(0, 500));
            console.log('Iframe Body Preview:', body);
            if (body.includes('Example Domain')) {
                console.log('SUCCESS: Example Domain loaded correctly via Wisp Proxy!');
            } else if (body.trim() === '') {
                console.log('ERROR: Iframe body is empty!');
            } else {
                console.log('INFO: Body content did not match expected, but was not empty.');
            }
        } else {
            console.log('Could not get contentFrame() from iframe element.');
        }
    } else {
        console.log('No iframe found on the page.');
    }
  } catch(e) {
      console.log('Error inspecting iframe:', e.message);
  }

  await browser.close();
  console.log('Done.');
})();
