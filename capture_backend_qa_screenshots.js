const { chromium } = require('playwright');
const path = require('path');

const outDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\aacf0631-9c6b-473a-af30-d57a28810f31\\screenshots';

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Opening Swagger UI at http://localhost:5167/swagger/index.html...');
  await page.goto('http://localhost:5167/swagger/index.html');
  await page.waitForTimeout(2000);

  // Helper to expand tag and operation
  async function expandOp(operationIdSubstr) {
    const op = page.locator(`[data-path*="${operationIdSubstr}"] button.opblock-summary-control`);
    if (await op.count() > 0) {
      await op.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const isExpanded = await op.first().getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await op.first().click();
        await page.waitForTimeout(500);
      }
    }
  }

  // 1. DOR-1: /api/Auth/forgot-password
  console.log('Capturing DOR-1: forgot-password endpoint...');
  await expandOp('/api/Auth/forgot-password');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'dor_1_backend.png') });

  // 2. DOR-2: /api/Auth/verify-mfa
  console.log('Capturing DOR-2: verify-mfa endpoint...');
  await expandOp('/api/Auth/verify-mfa');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'dor_2_backend.png') });

  // 3. DOR-3: Admin / Database Initialization
  console.log('Capturing DOR-3: Admin endpoints & Seeder...');
  await expandOp('/api/Admin/stats');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'dor_3_backend.png') });

  // 4. DOR-4: Payment Webhook & VNPay Return (/api/landlord/payment/vnpay-return)
  console.log('Capturing DOR-4: Payment verify & webhook...');
  await expandOp('/api/landlord/payment/vnpay-return');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'dor_4_backend.png') });

  // 5. DOR-5: Simulate Gateway (/api/landlord/payment/simulate-gateway)
  console.log('Capturing DOR-5: Simulate gateway test endpoint...');
  await expandOp('/api/landlord/payment/simulate-gateway');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'dor_5_backend.png') });

  // 6. DOR-6: Upload unauthenticated (/api/Images/upload)
  console.log('Capturing DOR-6: Upload endpoint...');
  await expandOp('/api/Images/upload');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'dor_6_backend.png') });

  // 7. DOR-7: Image room upload & validation
  console.log('Capturing DOR-7: Image validation...');
  await expandOp('/api/Images/rooms/{roomId}');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'dor_7_backend.png') });

  // 8. DOR-8: Auth / Me & Rate Limiting protection
  console.log('Capturing DOR-8: Auth / me & Rate Limiting...');
  await expandOp('/api/Auth/me');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'dor_8_backend.png') });

  await browser.close();
  console.log('All 8 backend screenshots captured successfully!');
}

run().catch(console.error);
