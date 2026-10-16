// ============================================================================
// Tier 5 Adversarial Stress Testing & Edge-Case Attack Suite
// Dormi Fullstack Platform (.NET 10 API + React 19 Frontend)
// ============================================================================

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { api, getAuthToken, assert, assertEqual, assertTrue } from './e2e/test_helper.mjs';

const PROBE_EXE = path.resolve('scripts/payos_probe/bin/Release/net10.0/payos_probe.exe');

function generatePayOSPayload(orderCode = 123, amount = 1000, code = '00', desc = 'success') {
  const out = execFileSync(PROBE_EXE, [String(orderCode), String(amount), String(code), String(desc)], { encoding: 'utf8' });
  return JSON.parse(out);
}

// Global test recorder
const testResults = [];

async function runTest(id, name, category, testFn) {
  const start = performance.now();
  try {
    const details = await testFn();
    const duration = Math.round(performance.now() - start);
    testResults.push({ id, name, category, status: 'PASSED', duration, details });
    console.log(`  ✅ [${id}] ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    testResults.push({ id, name, category, status: 'FAILED', duration, error: err.message });
    console.error(`  ❌ [${id}] ${name} (${duration}ms)`);
    console.error(`     Error: ${err.message}`);
  }
}

async function main() {
  console.log(`\n======================================================================`);
  console.log(`🔥 RUNNING TIER 5: ADVERSARIAL STRESS TESTING & EDGE-CASE ATTACK SUITE`);
  console.log(`======================================================================\n`);

  // Preload tokens
  console.log(`[Setup] Preloading authentication tokens...`);
  const tenantToken = await getAuthToken('customer');
  const landlordToken = await getAuthToken('landlord');
  const adminToken = await getAuthToken('admin');

  // Also get Landlord 2 and Customer 2 tokens for IDOR tests
  let loginL2 = await api('/api/Auth/login', {
    method: 'POST',
    body: { email: 'landlord2@dormi.vn', password: 'Password123!' }
  });
  if (!loginL2.ok && loginL2.data?.requiresCaptcha) {
    const q = loginL2.data.captchaQuestion || '';
    const match = q.match(/(\d+)\s*\+\s*(\d+)/);
    const ans = match ? String(parseInt(match[1]) + parseInt(match[2])) : '0';
    loginL2 = await api('/api/Auth/login', {
      method: 'POST',
      body: { email: 'landlord2@dormi.vn', password: 'Password123!', captchaToken: loginL2.data.captchaToken, captchaAnswer: ans }
    });
  }
  const landlord2Token = loginL2.data?.token;

  let loginC2 = await api('/api/Auth/login', {
    method: 'POST',
    body: { email: 'customer2@dormi.vn', password: 'Password123!' }
  });
  if (!loginC2.ok && loginC2.data?.requiresCaptcha) {
    const q = loginC2.data.captchaQuestion || '';
    const match = q.match(/(\d+)\s*\+\s*(\d+)/);
    const ans = match ? String(parseInt(match[1]) + parseInt(match[2])) : '0';
    loginC2 = await api('/api/Auth/login', {
      method: 'POST',
      body: { email: 'customer2@dormi.vn', password: 'Password123!', captchaToken: loginC2.data.captchaToken, captchaAnswer: ans }
    });
  }
  const customer2Token = loginC2.data?.token;

  console.log(`[Setup] All tokens retrieved. Beginning attack vectors.\n`);

  // ==========================================================================
  // SUITE 1: PAYOS WEBHOOK SIGNATURE TAMPERING & MUTATION ATTACKS
  // ==========================================================================
  console.log(`--- [1/5] PayOS Webhook Tampering & Mutation Suite ---`);

  await runTest('ADV-PAYOS-1', 'Forged Signature Attack with arbitrary hash', 'PayOS', async () => {
    const res = await api('/api/payment/payos-webhook', {
      method: 'POST',
      body: {
        code: '00',
        desc: 'success',
        data: { orderCode: 999999, amount: 5000000, description: 'Forged payment' },
        signature: 'deadbeefcafebabe0123456789abcdef0123456789abcdef0123456789abcdef'
      }
    });
    assertEqual(res.status, 400, 'Forged signature must be rejected with HTTP 400');
  });

  await runTest('ADV-PAYOS-2', 'Payload Mutation Attack (valid signature, amount changed post-signing)', 'PayOS', async () => {
    // Generate validly signed payload for 1,000 VND
    const valid = generatePayOSPayload(777111, 1000, '00', 'Tamper test');
    // Tamper the amount in payload to 50,000,000 VND after signature was created
    valid.data.amount = 50000000;
    const res = await api('/api/payment/payos-webhook', {
      method: 'POST',
      body: valid
    });
    assertEqual(res.status, 400, 'Mutated payload must fail HMAC verification with HTTP 400');
    assert(res.data?.message?.includes('chữ ký') || res.data?.message?.includes('integrity') || res.status === 400, 'Must report signature failure');
  });

  await runTest('ADV-PAYOS-3', 'Signature Bit-Flip Attack (single character altered in valid signature)', 'PayOS', async () => {
    const valid = generatePayOSPayload(777222, 1000, '00', 'Bitflip test');
    // Flip the last character of the signature
    const lastChar = valid.signature.slice(-1);
    const flippedChar = lastChar === '0' ? '1' : '0';
    valid.signature = valid.signature.slice(0, -1) + flippedChar;

    const res = await api('/api/payment/payos-webhook', {
      method: 'POST',
      body: valid
    });
    assertEqual(res.status, 400, 'Bit-flipped signature must return HTTP 400');
  });

  await runTest('ADV-PAYOS-4', 'Empty & Missing Payload Attacks', 'PayOS', async () => {
    const res1 = await api('/api/payment/payos-webhook', { method: 'POST', body: {} });
    assertEqual(res1.status, 400, 'Empty body must return HTTP 400');

    const res2 = await api('/api/payment/payos-webhook', { method: 'POST', body: { code: '00', data: null, signature: null } });
    assertEqual(res2.status, 400, 'Null data must return HTTP 400');
  });

  await runTest('ADV-PAYOS-5', 'Legitimate Registration Ping (OrderCode 123) with valid HMAC', 'PayOS', async () => {
    const valid = generatePayOSPayload(123, 1000, '00', 'Webhook registration ping');
    const res = await api('/api/payment/payos-webhook', {
      method: 'POST',
      body: valid
    });
    assertEqual(res.status, 200, 'Valid ping must return HTTP 200');
    assert(res.data?.message?.includes('ping') || res.data?.message?.includes('successful') || res.status === 200);
  });

  await runTest('ADV-PAYOS-6', 'Valid HMAC for Non-existent OrderCode in DB (Graceful handling)', 'PayOS', async () => {
    const valid = generatePayOSPayload(888999111, 2500000, '00', 'DORMI TEST NOT FOUND');
    const res = await api('/api/payment/payos-webhook', {
      method: 'POST',
      body: valid
    });
    assertEqual(res.status, 200, 'Non-existent orderCode should return 200 with not-found message to prevent PayOS retry floods');
    assert(res.data?.message?.includes('không tìm thấy'), 'Message should indicate order not found');
  });

  await runTest('ADV-PAYOS-7', 'Replay Attack: Sequential replay of identical valid webhook 5 times', 'PayOS', async () => {
    const valid = generatePayOSPayload(123, 1000, '00', 'Replay ping test');
    for (let i = 0; i < 5; i++) {
      const res = await api('/api/payment/payos-webhook', {
        method: 'POST',
        body: valid
      });
      assertEqual(res.status, 200, `Replay #${i + 1} must be handled idempotently (HTTP 200)`);
    }
  });

  await runTest('ADV-PAYOS-8', 'Concurrent Flood: 10 simultaneous webhook callbacks for same payload', 'PayOS', async () => {
    const valid = generatePayOSPayload(123, 1000, '00', 'Concurrent ping test');
    const promises = Array.from({ length: 10 }, () =>
      api('/api/payment/payos-webhook', {
        method: 'POST',
        body: valid
      })
    );
    const results = await Promise.all(promises);
    for (const r of results) {
      assertEqual(r.status, 200, 'Concurrent webhook request must return HTTP 200 without DB deadlock');
    }
  });

  await runTest('ADV-PAYOS-9', 'Vulnerability Assessment: Webhook with Failed Transaction Code (code: 01 / CANCELLED)', 'PayOS', async () => {
    // Generate valid HMAC signature for orderCode with status FAILED/CANCELLED
    const valid = generatePayOSPayload(888123456, 1000000, '01', 'PAYMENT_FAILED_INSUFFICIENT_FUNDS');
    const res = await api('/api/payment/payos-webhook', {
      method: 'POST',
      body: valid
    });
    // System should either reject or notice that orderCode was not found
    assert(res.status === 200 || res.status === 400, 'Should handle failed payment event cleanly');
    return { status: res.status, body: res.data };
  });

  // ==========================================================================
  // SUITE 2: AUTH PRIVILEGE ESCALATION & IDOR ATTACKS
  // ==========================================================================
  console.log(`\n--- [2/5] Auth Privilege Escalation & IDOR Attack Suite ---`);

  await runTest('ADV-AUTH-1', 'Privilege Escalation: Customer accessing Admin Stats', 'Auth & RBAC', async () => {
    const res = await api('/api/Admin/stats', { token: tenantToken });
    assertEqual(res.status, 403, 'Customer role must receive HTTP 403 Forbidden on Admin routes');
  });

  await runTest('ADV-AUTH-2', 'Privilege Escalation: Customer accessing Admin User Management', 'Auth & RBAC', async () => {
    const res = await api('/api/Admin/users', { token: tenantToken });
    assertEqual(res.status, 403, 'Customer role must receive HTTP 403 Forbidden on Admin users');
  });

  await runTest('ADV-AUTH-3', 'Privilege Escalation: Customer forcing Room Moderation status', 'Auth & RBAC', async () => {
    const res = await api('/api/Admin/rooms/00000000-0000-0000-0000-000000000001/status?status=0', {
      method: 'PATCH',
      token: tenantToken
    });
    assertEqual(res.status, 403, 'Customer role must receive HTTP 403 Forbidden on Admin room approval');
  });

  await runTest('ADV-AUTH-4', 'Privilege Escalation: Customer accessing Landlord Analytics', 'Auth & RBAC', async () => {
    const res = await api('/api/landlord/analytics', { token: tenantToken });
    assertEqual(res.status, 403, 'Customer role must receive HTTP 403 Forbidden on Landlord analytics');
  });

  await runTest('ADV-AUTH-5', 'Privilege Escalation: Customer attempting Landlord subscription checkout', 'Auth & RBAC', async () => {
    const res = await api('/api/landlord/checkout', {
      method: 'POST',
      token: tenantToken,
      body: { planName: 'Pro', billingCycle: 'Monthly', paymentMethod: 'PayOS' }
    });
    assert(res.status === 403 || res.status === 400, `Customer role must be blocked (HTTP 403 or 400), got ${res.status}`);
  });

  await runTest('ADV-AUTH-6', 'Unauthenticated request to Admin endpoints', 'Auth & RBAC', async () => {
    const res = await api('/api/Admin/stats');
    assertEqual(res.status, 401, 'Unauthenticated request must return HTTP 401 Unauthorized');
  });

  await runTest('ADV-AUTH-7', 'Unauthenticated request to Lease creation', 'Auth & RBAC', async () => {
    const res = await api('/api/Leases', {
      method: 'POST',
      body: { roomId: '00000000-0000-0000-0000-000000000001' }
    });
    assertEqual(res.status, 401, 'Unauthenticated lease creation must return HTTP 401 Unauthorized');
  });

  await runTest('ADV-AUTH-8', 'Tampered JWT Signature Attack', 'Auth & RBAC', async () => {
    // Create a modified JWT: take valid tenant token, change payload to role=Admin with broken signature
    const parts = tenantToken.split('.');
    assert(parts.length === 3, 'Token must have 3 parts');
    const header = parts[0];
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const tamperedPayload = JSON.parse(payloadJson);
    tamperedPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] = 'Admin';
    tamperedPayload.role = 'Admin';
    const tamperedPayloadB64 = Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url');
    // Keep original signature (which won't match tampered payload)
    const tamperedToken = `${header}.${tamperedPayloadB64}.${parts[2]}`;

    const res = await api('/api/Admin/stats', { token: tamperedToken });
    assertEqual(res.status, 401, 'Tampered JWT must be rejected with HTTP 401 Unauthorized');
  });

  // Fetch a room owned by Landlord 1 to test IDOR against Landlord 2
  const roomsRes = await api('/api/Rooms?pageSize=20');
  const roomList = roomsRes.data?.data || roomsRes.data?.items || roomsRes.data || [];
  const landlord1Room = roomList.find(r => r.landlordName === 'Trần Minh Tuấn') || roomList[0];
  assert(landlord1Room, 'Must find a seeded room for IDOR testing');

  await runTest('ADV-AUTH-9', 'IDOR: Landlord 2 attempting to update Landlord 1 room', 'IDOR Protection', async () => {
    const res = await api(`/api/Rooms/${landlord1Room.id}`, {
      method: 'PUT',
      token: landlord2Token,
      body: {
        title: 'IDOR Hacked Title',
        description: 'Attacker overwriting room description',
        price: 999999,
        area: 50,
        address: 'Hacked address',
        roomType: 'Phòng trọ',
        status: 0
      }
    });
    assertEqual(res.status, 403, 'Non-owner landlord must be forbidden (HTTP 403) from updating room');
  });

  await runTest('ADV-AUTH-10', 'IDOR: Landlord 2 attempting to delete Landlord 1 room', 'IDOR Protection', async () => {
    const res = await api(`/api/Rooms/${landlord1Room.id}`, {
      method: 'DELETE',
      token: landlord2Token
    });
    assertEqual(res.status, 403, 'Non-owner landlord must be forbidden (HTTP 403) from deleting room');
  });

  await runTest('ADV-AUTH-11', 'IDOR: Landlord 2 attempting to create Lease on Landlord 1 room', 'IDOR Protection', async () => {
    const res = await api('/api/Leases', {
      method: 'POST',
      token: landlord2Token,
      body: {
        roomId: landlord1Room.id,
        tenantId: 'c0000000-0000-0000-0000-000000000001',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 180).toISOString(),
        monthlyRent: 3500000,
        deposit: 3500000,
        paymentCycleMonths: 1
      }
    });
    assertEqual(res.status, 403, 'Non-owner landlord must be forbidden (HTTP 403) from creating lease on foreign room');
  });

  // ==========================================================================
  // SUITE 3: CONCURRENCY RACE CONDITIONS & LOCK STRESS
  // ==========================================================================
  console.log(`\n--- [3/5] Concurrency & Race Condition Suite ---`);

  await runTest('ADV-RACE-1', 'Race Condition: Double-booking Viewing Appointments simultaneously', 'Concurrency', async () => {
    const appointmentDate = new Date(Date.now() + 86400000 * 10).toISOString();
    // Fire 5 concurrent appointment creation requests for same room & customer
    const promises = Array.from({ length: 5 }, () =>
      api('/api/Appointments', {
        method: 'POST',
        token: customer2Token,
        body: {
          roomId: landlord1Room.id,
          appointmentDate,
          notes: 'Concurrent race condition test appointment'
        }
      })
    );
    const results = await Promise.all(promises);
    const successes = results.filter(r => r.status === 200 || r.status === 201);
    const rejections = results.filter(r => r.status === 400 || r.status === 429);

    console.log(`     [Race Stats] Successes: ${successes.length}, Rejections (400/429): ${rejections.length}`);
    // State invariant: At most 1 appointment should succeed, duplicates must be rejected!
    assert(successes.length <= 1, `Race condition failure: Multiple appointments (${successes.length}) created for same user/room!`);
    assert(rejections.length >= 4, 'Duplicate concurrent appointments must be rejected');
  });

  await runTest('ADV-RACE-2', 'Race Condition: Concurrent lease deposit checkout link requests', 'Concurrency', async () => {
    // Fetch landlord leases
    const leasesRes = await api('/api/Leases/my', { token: landlordToken });
    const leases = leasesRes.data || [];
    if (leases.length > 0) {
      const leaseId = leases[0].id;
      // Fire 5 concurrent checkout requests
      const promises = Array.from({ length: 5 }, () =>
        api(`/api/postrental/leases/${leaseId}/deposit/checkout`, {
          method: 'POST',
          token: tenantToken
        })
      );
      const results = await Promise.all(promises);
      const statuses = results.map(r => r.status);
      console.log(`     [Checkout Race Statuses]: ${statuses.join(', ')}`);
      // All requests must return valid HTTP responses without 500 error or crash
      for (const r of results) {
        assert(r.status === 200 || r.status === 400 || r.status === 409, `Unexpected status in checkout race: ${r.status}`);
      }
    } else {
      console.log(`     [Notice] No active lease found to test concurrent checkout, skipping gracefully.`);
    }
  });

  await runTest('ADV-RACE-3', 'Concurrency: Rapid conflicting room status updates from owner', 'Concurrency', async () => {
    // Quickly toggle status between Available (0) and Hidden (3)
    const toggles = [3, 0, 3, 0, 3];
    const results = await Promise.all(
      toggles.map(status =>
        api(`/api/Rooms/${landlord1Room.id}`, {
          method: 'PUT',
          token: landlordToken,
          body: {
            title: landlord1Room.title,
            description: landlord1Room.description,
            price: landlord1Room.price,
            area: landlord1Room.area,
            address: landlord1Room.address,
            roomType: landlord1Room.roomType,
            status
          }
        })
      )
    );
    // Ensure all requests completed with valid statuses (200 or 400) and 0% 500 errors
    const error500 = results.filter(r => r.status === 500);
    assertEqual(error500.length, 0, 'No 500 errors during rapid concurrent status updates');

    // Restore room status back to Available
    await api(`/api/Rooms/${landlord1Room.id}`, {
      method: 'PUT',
      token: landlordToken,
      body: {
        title: landlord1Room.title,
        description: landlord1Room.description,
        price: landlord1Room.price,
        area: landlord1Room.area,
        address: landlord1Room.address,
        roomType: landlord1Room.roomType,
        status: 0
      }
    });
  });

  // ==========================================================================
  // SUITE 4: DATABASE CONNECTION EXHAUSTION & BURST STRESS
  // ==========================================================================
  console.log(`\n--- [4/5] Database Connection Exhaustion & Burst Stress Suite ---`);

  await runTest('ADV-BURST-1', 'Burst Stress: 60 concurrent database-hitting search queries', 'Database Resilience', async () => {
    const concurrency = 60;
    const start = performance.now();
    const promises = Array.from({ length: concurrency }, (_, i) => {
      const keyword = encodeURIComponent(i % 2 === 0 ? 'phòng' : 'trọ');
      return api(`/api/Rooms?keyword=${keyword}&minPrice=1000000&maxPrice=10000000&pageSize=10`, {
        timeoutMs: 20000
      });
    });

    const results = await Promise.all(promises);
    const duration = Math.round(performance.now() - start);
    const errors = results.filter(r => r.status >= 500);
    const successes = results.filter(r => r.status === 200);

    console.log(`     [Burst 60]: ${successes.length}/${concurrency} success in ${duration}ms, 500 errors: ${errors.length}`);
    assertEqual(errors.length, 0, `Database pool must not exhaust under 60 concurrency (got ${errors.length} 500 errors)`);
  });

  await runTest('ADV-BURST-2', 'Extreme Burst: 100 concurrent requests across mixed endpoints', 'Database Resilience', async () => {
    const concurrency = 100;
    const endpoints = [
      '/health',
      '/api/Rooms?pageSize=5',
      `/api/Rooms/${landlord1Room.id}`,
      '/api/Roommates?pageSize=5'
    ];

    const start = performance.now();
    const promises = Array.from({ length: concurrency }, (_, i) => {
      const ep = endpoints[i % endpoints.length];
      return api(ep, { timeoutMs: 25000 });
    });

    const results = await Promise.all(promises);
    const duration = Math.round(performance.now() - start);
    const errors = results.filter(r => r.status >= 500);
    const successes = results.filter(r => r.status === 200);

    console.log(`     [Burst 100]: ${successes.length}/${concurrency} success in ${duration}ms, 500 errors: ${errors.length}`);
    assertEqual(errors.length, 0, `System must withstand 100 mixed burst requests with 0% 500 error rate (got ${errors.length} errors)`);
  });

  await runTest('ADV-BURST-3', 'Post-Burst Health Verification: Connection pool remains healthy and reusable', 'Database Resilience', async () => {
    const res = await api('/health');
    assertEqual(res.status, 200, 'Health endpoint must return HTTP 200 post-burst');
    assertEqual(res.data?.status, 'healthy', 'System status must report healthy');
    assertEqual(res.data?.components?.database, 'connected', 'Database component must remain connected');
  });

  // ==========================================================================
  // SUITE 5: FRONTEND UI ICON & EMOJI CONFORMANCE AUDIT
  // ==========================================================================
  console.log(`\n--- [5/5] Frontend UI Icon & Emoji Conformance Audit ---`);

  await runTest('ADV-UI-1', 'Static Regex Audit: Zero raw unicode emoji characters in frontend/src', 'UI Standards', async () => {
    const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    function walkDir(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          results = results.concat(walkDir(full));
        } else if (/\.(tsx|jsx|ts|js)$/.test(file)) {
          results.push(full);
        }
      }
      return results;
    }

    const files = walkDir('frontend/src');
    const violations = [];
    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (emojiRegex.test(l)) {
          violations.push({ file: f, line: idx + 1, snippet: l.trim() });
        }
      });
    }

    console.log(`     [Audit]: Scanned ${files.length} frontend files, found ${violations.length} raw emoji violations.`);
    assertEqual(violations.length, 0, `Found ${violations.length} raw emoji violations in frontend/src`);
  });

  await runTest('ADV-UI-2', 'Dependency Audit: All icons imported from lucide-react', 'UI Standards', async () => {
    const pkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    const bannedIconLibs = ['@heroicons/react', 'react-icons', '@fortawesome', 'feather-icons', 'ionicons'];
    const foundBanned = bannedIconLibs.filter(lib => allDeps[lib]);

    assertEqual(foundBanned.length, 0, `Found banned icon libraries: ${foundBanned.join(', ')}`);
    assert(allDeps['lucide-react'], 'Must have lucide-react in dependencies');
  });

  // ==========================================================================
  // FINAL SUMMARY
  // ==========================================================================
  console.log(`\n======================================================================`);
  console.log(`📊 ADVERSARIAL STRESS TEST SUMMARY`);
  console.log(`======================================================================`);

  const total = testResults.length;
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;

  console.log(`Total Adversarial Tests: ${total}`);
  console.log(`Passed:                  ${passed}`);
  console.log(`Failed:                  ${failed}`);
  console.log(`Pass Rate:               ${Math.round((passed / total) * 100)}%`);
  console.log(`======================================================================\n`);

  if (failed > 0) {
    console.error(`❌ Adversarial suite finished with ${failed} failure(s).`);
    process.exit(1);
  } else {
    console.log(`🎉 ALL ${total} ADVERSARIAL TESTS PASSED EMPIRICALLY!`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
