const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\aacf0631-9c6b-473a-af30-d57a28810f31\\screenshots';

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Logging in as Landlord...');
  await page.goto('http://localhost:5173/auth');
  await page.waitForTimeout(1000);

  // Select Landlord tab and fill
  const landlordBtn = page.locator('button:has-text("Chủ trọ")');
  if (await landlordBtn.count() > 0) {
    await landlordBtn.click();
    await page.waitForTimeout(500);
  }

  await page.fill('input[type="email"]', 'landlord@dormi.vn');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Capture DOR-10: SmartListingForm
  console.log('Capturing DOR-10 (/landlord/create)...');
  await page.goto('http://localhost:5173/landlord/create');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, 'dor_10_real.png') });

  // Capture DOR-11: PricingCheckout
  console.log('Capturing DOR-11 (/landlord/pricing)...');
  await page.goto('http://localhost:5173/landlord/pricing');
  await page.waitForTimeout(2000);
  // Click upgrade button on first plan to open modal
  const upgradeBtn = page.locator('button:has-text("Nâng cấp gói"), button:has-text("Đăng ký ngay")').first();
  if (await upgradeBtn.count() > 0) {
    await upgradeBtn.click();
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: path.join(outDir, 'dor_11_real.png') });

  // Now login as Tenant for tenant pages
  console.log('Logging in as Tenant...');
  await page.goto('http://localhost:5173/auth');
  await page.waitForTimeout(500);
  const tenantBtn = page.locator('button:has-text("Khách thuê")');
  if (await tenantBtn.count() > 0) {
    await tenantBtn.click();
    await page.waitForTimeout(500);
  }
  await page.fill('input[type="email"]', 'tenant@dormi.vn');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Capture DOR-12: TenantChatCenter
  console.log('Capturing DOR-12 (/tenant/chat)...');
  await page.goto('http://localhost:5173/tenant/chat');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, 'dor_12_real.png') });

  // Capture DOR-14: RoommateMatcher
  console.log('Capturing DOR-14 (/tenant/match)...');
  await page.goto('http://localhost:5173/tenant/match');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, 'dor_14_real.png') });

  // Capture DOR-15: CreateRoommatePost
  console.log('Capturing DOR-15 (/tenant/post)...');
  await page.goto('http://localhost:5173/tenant/post');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, 'dor_15_real.png') });

  await browser.close();
  console.log('All real web screenshots captured successfully!');
}

run().catch(console.error);
