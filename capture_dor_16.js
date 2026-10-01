const { chromium } = require('playwright');
const path = require('path');

const outDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\aacf0631-9c6b-473a-af30-d57a28810f31\\screenshots';

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Logging in as Admin...');
  await page.goto('http://localhost:5173/auth');
  await page.waitForTimeout(500);
  await page.fill('input[type="email"]', 'admin@dormi.vn');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  console.log('Navigating to /admin...');
  await page.goto('http://localhost:5173/admin');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, 'dor_16_real.png') });

  await browser.close();
  console.log('dor_16_real.png captured successfully!');
}

run().catch(console.error);
