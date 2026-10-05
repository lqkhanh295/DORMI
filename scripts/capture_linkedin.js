const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const OUTPUT_DIR = path.resolve(__dirname, '..', 'screenshots_linkedin');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function getJson(url) {
  const res = await fetch(url);
  return await res.json();
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function loginViaApi(email, password) {
  try {
    const res = await fetch('http://localhost:5167/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Login API error:', e);
    return null;
  }
}

async function main() {
  console.log('Logging in demo accounts...');
  const landlordAuth = await loginViaApi('landlord@dormi.vn', 'Password123!');
  const tenantAuth = await loginViaApi('tenant@dormi.vn', 'Password123!');

  console.log('Launching headless Chrome with CDP...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=D:\\University\\EXE101\\Dormi\\screenshots_linkedin\\cdp_profile',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await wait(2000);

  const pagesToCapture = [
    {
      name: '01_homepage_hero.png',
      url: 'http://localhost:5173/',
      auth: null,
      delay: 2000,
      width: 1440,
      height: 900
    },
    {
      name: '02_geospatial_room_discovery.png',
      url: 'http://localhost:5173/search',
      auth: null,
      delay: 3000,
      width: 1440,
      height: 900
    },
    {
      name: '03_room_detail_verified.png',
      url: 'http://localhost:5173/room/dfb2eab2-9468-4177-90a9-27633ed2e51f',
      auth: null,
      delay: 3000,
      width: 1440,
      height: 900
    },
    {
      name: '04_roommate_compatibility_matcher.png',
      url: 'http://localhost:5173/tenant/match',
      auth: tenantAuth,
      role: 'Tenant',
      delay: 3000,
      width: 1440,
      height: 900
    },
    {
      name: '05_landlord_management_portal.png',
      url: 'http://localhost:5173/landlord',
      auth: landlordAuth,
      role: 'Landlord',
      delay: 3000,
      width: 1440,
      height: 900
    },
    {
      name: '06_landlord_lead_analytics.png',
      url: 'http://localhost:5173/landlord/analytics',
      auth: landlordAuth,
      role: 'Landlord',
      delay: 3000,
      width: 1440,
      height: 900
    }
  ];

  try {
    for (const item of pagesToCapture) {
      console.log(`\nCapturing: ${item.name} (${item.url})...`);
      const target = await getJson(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent('http://localhost:5173/')}`);
      const client = new CdpClient(target.webSocketDebuggerUrl);
      await client.connect();

      await client.send('Page.enable');
      await client.send('Runtime.enable');
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: item.width,
        height: item.height,
        deviceScaleFactor: 1.5,
        mobile: false
      });

      if (item.auth && item.auth.user && item.auth.token) {
        const storeData = {
          state: {
            currentUser: {
              id: item.auth.user.id,
              name: item.auth.user.fullName,
              email: item.auth.user.email,
              role: item.role,
              avatar: item.auth.user.avatarUrl,
              token: item.auth.token
            },
            likedRoommates: []
          },
          version: 0
        };
        const script = `localStorage.setItem('dormi-storage-v5', JSON.stringify(${JSON.stringify(storeData)}));`;
        await client.send('Runtime.evaluate', { expression: script });
      }

      await client.send('Page.navigate', { url: item.url });
      await wait(item.delay);

      const shot = await client.send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(shot.data, 'base64');
      const outPath = path.join(OUTPUT_DIR, item.name);
      fs.writeFileSync(outPath, buffer);
      console.log(`Saved ${outPath} (${buffer.length} bytes)`);

      client.close();
      await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`).catch(() => {});
    }
  } finally {
    chromeProcess.kill();
    console.log('\nAll captures completed successfully.');
  }
}

main().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
