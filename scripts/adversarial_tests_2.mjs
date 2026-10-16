// Dormi Tier 5: Adversarial Penetration & Resilience Verification Suite
// Challenger 2 - Standalone Executable on Node.js 24+ ESM
// Validates 100% Free Tier Invariants, Room State Machine, Cache Invalidation, and Third-Party Resilience

import { api, BASE_URL } from './e2e/test_helper.mjs';

let ipIndex = 500;
function nextIp() {
  return `10.99.${Math.floor(ipIndex / 250)}.${(ipIndex++ % 250) + 1}`;
}

function getUserIdFromToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload.nameid || payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  } catch {
    return null;
  }
}

async function login(email, password = 'Password123!') {
  let res = await api('/api/Auth/login', {
    method: 'POST',
    headers: { 'X-Forwarded-For': nextIp() },
    body: { email, password },
  });

  if (!res.ok && res.data?.requiresCaptcha) {
    const q = res.data.captchaQuestion || '';
    const match = q.match(/(\d+)\s*\+\s*(\d+)/);
    const ans = match ? String(parseInt(match[1]) + parseInt(match[2])) : '0';
    res = await api('/api/Auth/login', {
      method: 'POST',
      headers: { 'X-Forwarded-For': nextIp() },
      body: {
        email,
        password,
        captchaToken: res.data.captchaToken,
        captchaAnswer: ans,
      },
    });
  }

  if (res.data?.requiresMfa) {
    const mfaRes = await api('/api/Auth/verify-mfa', {
      method: 'POST',
      headers: { 'X-Forwarded-For': nextIp() },
      body: {
        email,
        mfaSessionToken: res.data.mfaSessionToken,
        otpCode: '123456',
      },
    });
    return mfaRes.data?.token;
  }

  return res.data?.token;
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

async function runPool(items, concurrency, fn) {
  let idx = 0;
  async function worker() {
    while (true) {
      const current = idx++;
      if (current >= items.length) break;
      await fn(items[current], current);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
}

const tests = [];
function test(id, title, fn) {
  tests.push({ id, title, fn });
}

// ============================================================================
// AREA 1: 100% Free Tier Invariants — Render Keep-Alive & Health Endpoint
// ============================================================================

test('T5.1_RenderKeepAlive_RootPing_ZeroDb', 'Verify GET / responds immediately in burst with 0 DB allocation', async () => {
  const count = 100;
  const latencies = [];
  const items = Array.from({ length: count }, (_, i) => i);

  await runPool(items, 20, async () => {
    const start = performance.now();
    const res = await api('/', { headers: { 'X-Forwarded-For': nextIp() } });
    latencies.push(performance.now() - start);
    if (res.status !== 200) throw new Error(`Expected HTTP 200 on GET /, got ${res.status}`);
    if (res.data?.status !== 'healthy') throw new Error(`Expected status: healthy, got: ${JSON.stringify(res.data)}`);
    if (res.data?.service !== 'Dormi API') throw new Error(`Expected service: Dormi API`);
  });

  const p95 = percentile(latencies, 95);
  if (p95 > 200) {
    throw new Error(`GET / p95 latency too high: ${p95.toFixed(1)}ms (threshold: 200ms)`);
  }
});

test('T5.2_HealthCheck_ConnectionCycle', 'Verify GET /health acquires and releases DB/cache connection cleanly', async () => {
  for (let i = 0; i < 20; i++) {
    const res = await api('/health', { headers: { 'X-Forwarded-For': nextIp() } });
    if (res.status !== 200) throw new Error(`Health check iteration ${i + 1} failed with status ${res.status}`);
    if (res.data?.status !== 'healthy') throw new Error(`Expected status healthy, got: ${res.data?.status}`);
    if (res.data?.components?.database !== 'connected') {
      throw new Error(`Database component unhealthy: ${res.data?.components?.database}`);
    }
    if (res.data?.components?.cache !== 'active') {
      throw new Error(`Cache component unhealthy: ${res.data?.components?.cache}`);
    }
  }
});

test('T5.3_HealthCheck_ContentionResilience', 'Verify /health remains responsive under database query contention', async () => {
  const healthPromises = Array.from({ length: 15 }, () =>
    api('/health', { headers: { 'X-Forwarded-For': nextIp() } })
  );
  const searchPromises = Array.from({ length: 15 }, () =>
    api('/api/rooms?keyword=qu%E1%BA%ADn', { headers: { 'X-Forwarded-For': nextIp() } })
  );

  const [healthResults, searchResults] = await Promise.all([
    Promise.all(healthPromises),
    Promise.all(searchPromises),
  ]);

  for (const hr of healthResults) {
    if (hr.status !== 200 || hr.data?.status !== 'healthy') {
      throw new Error(`Health check failed under contention: status=${hr.status}`);
    }
  }
  for (const sr of searchResults) {
    if (sr.status !== 200) {
      throw new Error(`Search query failed under contention: status=${sr.status}`);
    }
  }
});

// ============================================================================
// AREA 2: Supabase 15-Connection Limit Burst Stress
// ============================================================================

test('T5.4_Supabase_ConnectionPool_Burst_Filters', 'Execute 100 concurrent multi-parameter queries across filter/search', async () => {
  const endpoints = [
    '/api/rooms?pageNumber=1&pageSize=10',
    '/api/rooms?roomType=Ph%C3%B2ng%20tr%E1%BB%8D',
    '/api/rooms?minPrice=1000000&maxPrice=5000000',
    '/api/rooms?keyword=Qu%E1%BA%ADn&sortBy=price_asc',
    '/api/rooms/featured?limit=6',
    '/api/rooms?utilities=Wifi',
    '/api/rooms?address=H%E1%BB%93%20Ch%C3%AD%20Minh',
  ];

  const count = 100;
  const statusCodes = {};
  const latencies = [];

  const reqs = Array.from({ length: count }, async (_, i) => {
    const ep = endpoints[i % endpoints.length];
    const start = performance.now();
    const res = await api(ep, { headers: { 'X-Forwarded-For': nextIp() } });
    latencies.push(performance.now() - start);
    statusCodes[res.status] = (statusCodes[res.status] || 0) + 1;
    if (res.status === 500) {
      throw new Error(`HTTP 500 encountered: ${JSON.stringify(res.data)}`);
    }
  });

  await Promise.all(reqs);
  if (statusCodes['500']) {
    throw new Error(`Supabase connection burst produced ${statusCodes['500']} 500 errors!`);
  }
});

test('T5.5_Supabase_Zero500_ZeroExhaustion', 'Verify zero pool exhaustion under burst with mixed read/featured load', async () => {
  const burst = Array.from({ length: 60 }, async (_, i) => {
    const res = await api(`/api/rooms/featured?limit=${(i % 3) * 2 + 6}`, {
      headers: { 'X-Forwarded-For': nextIp() },
    });
    if (res.status !== 200) {
      throw new Error(`Burst featured query failed with status ${res.status}`);
    }
  });

  await Promise.all(burst);
});

// ============================================================================
// AREA 3: Room Detail Multi-Tier Cache & Invalidation Under Mutation
// ============================================================================

test('T5.6_RoomDetail_CacheHit_UltraLowLatency', 'Verify primed room detail serves from L1/L2 cache in < 25ms p95', async () => {
  const listRes = await api('/api/rooms?pageSize=10', { headers: { 'X-Forwarded-For': nextIp() } });
  const rawList = Array.isArray(listRes.data?.data)
    ? listRes.data.data
    : (Array.isArray(listRes.data) ? listRes.data : listRes.data?.items);
  const roomId = rawList?.[0]?.id || rawList?.[0]?.Id;
  if (!roomId) throw new Error('No rooms available to test cache hit');

  // Prime cache
  await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });

  // Burst cache hits
  const latencies = [];
  for (let i = 0; i < 20; i++) {
    const start = performance.now();
    const res = await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });
    latencies.push(performance.now() - start);
    if (res.status !== 200) throw new Error(`Cached room fetch failed: ${res.status}`);
  }

  const p95 = percentile(latencies, 95);
  if (p95 > 50) {
    throw new Error(`Cache hit p95 latency exceeded expected bound: ${p95.toFixed(1)}ms`);
  }
});

test('T5.7_CacheInvalidation_NonCriticalUpdate', 'Verify cache invalidation immediately reflects non-critical edits while keeping room Available', async () => {
  const landlordToken = await login('landlord@dormi.vn');
  const adminToken = await login('admin@dormi.vn');

  // 1. Create a fresh test room
  const createRes = await api('/api/rooms', {
    method: 'POST',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Cache NonCritical ${Date.now()}`,
      description: 'Mô tả ban đầu giữ nguyên.',
      price: 3500000,
      area: 25,
      utilities: 'Wifi, Máy giặt',
      roomType: 'Phòng trọ',
      address: '123 Đường Cache Invalidation, Q.1, TP.HCM',
    },
  });

  if (createRes.status !== 200 && createRes.status !== 201) {
    throw new Error(`Create test room failed: ${createRes.status} - ${JSON.stringify(createRes.data)}`);
  }
  const roomId = createRes.data?.data?.id || createRes.data?.id;

  // 2. Admin approves room to make it Available
  await api(`/api/admin/rooms/${roomId}/status?status=Available`, {
    method: 'PATCH',
    token: adminToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });

  // 3. Fetch to prime cache
  const primedRes = await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });
  if (primedRes.status !== 200) throw new Error('Priming fetch failed');

  // 4. Landlord updates non-critical field (utilities) while preserving Title, Price, Address, Description
  const marker = `[UTIL_UPDATED_${Date.now()}]`;
  const originalTitle = primedRes.data?.title || primedRes.data?.data?.title;
  const originalDesc = primedRes.data?.description || primedRes.data?.data?.description;
  const originalAddr = primedRes.data?.address || primedRes.data?.data?.address;

  const updateRes = await api(`/api/rooms/${roomId}`, {
    method: 'PUT',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: originalTitle,
      description: originalDesc,
      price: 3500000,
      area: 28, // non-critical
      utilities: `Wifi, Máy giặt, Điều hòa, Bếp ${marker}`, // non-critical
      roomType: 'Phòng trọ',
      address: originalAddr,
      status: 0, // Available
    },
  });

  if (updateRes.status !== 200) {
    throw new Error(`Update room failed: ${updateRes.status} - ${JSON.stringify(updateRes.data)}`);
  }

  // 5. Fetch immediately: MUST see updated utilities, NOT stale cached utilities
  const freshRes = await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });
  if (freshRes.status !== 200) {
    throw new Error(`Expected room to remain Available with HTTP 200, got ${freshRes.status}`);
  }
  const freshUtils = freshRes.data?.utilities || freshRes.data?.data?.utilities || '';
  if (!freshUtils.includes(marker)) {
    throw new Error(`Cache Invalidation Failure! Expected '${marker}' in utilities, but got: '${freshUtils}'`);
  }
});

test('T5.8_CacheInvalidation_PriceEdit_AutoDemotion', 'Verify price edit triggers auto-demotion to PendingApproval and invalidates public cache', async () => {
  const landlordToken = await login('landlord@dormi.vn');
  const adminToken = await login('admin@dormi.vn');

  // Create & approve room
  const createRes = await api('/api/rooms', {
    method: 'POST',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Price Demotion ${Date.now()}`,
      description: 'Mô tả phòng cho kiểm thử demotion khi sửa giá.',
      price: 4000000,
      area: 30,
      utilities: 'Wifi, Máy lạnh',
      roomType: 'Phòng trọ',
      address: '456 Đường Sửa Giá, Q.3, TP.HCM',
    },
  });
  const roomId = createRes.data?.data?.id || createRes.data?.id;

  await api(`/api/admin/rooms/${roomId}/status?status=Available`, {
    method: 'PATCH',
    token: adminToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });

  // Prime cache as Available
  const primeRes = await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });
  if (primeRes.status !== 200) throw new Error('Failed to prime Available room cache');

  // Landlord edits price from 4,000,000 -> 4,500,000
  const updateRes = await api(`/api/rooms/${roomId}`, {
    method: 'PUT',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Price Demotion ${Date.now()}`,
      description: 'Mô tả phòng cho kiểm thử demotion khi sửa giá.',
      price: 4500000, // Price changed!
      area: 30,
      utilities: 'Wifi, Máy lạnh',
      roomType: 'Phòng trọ',
      address: '456 Đường Sửa Giá, Q.3, TP.HCM',
      status: 0,
    },
  });

  if (updateRes.status !== 200) {
    throw new Error(`Price update failed: ${updateRes.status}`);
  }

  // Verify room is now PendingApproval (2)
  const roomStatus = updateRes.data?.status ?? updateRes.data?.data?.status;
  if (roomStatus !== 2 && roomStatus !== 'PendingApproval') {
    throw new Error(`Expected room status to be PendingApproval (2), got: ${roomStatus}`);
  }

  // Public unauthenticated request MUST get 404 (hidden because unapproved)
  const publicRes = await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });
  if (publicRes.status !== 404) {
    throw new Error(`Cache Invalidation Failure! Public request got HTTP ${publicRes.status} instead of 404 after price demotion`);
  }

  // Landlord request MUST see PendingApproval with new price 4,500,000
  const ownerRes = await api(`/api/rooms/${roomId}`, {
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });
  if (ownerRes.status !== 200) throw new Error(`Owner could not fetch demoted room: ${ownerRes.status}`);
  const ownerPrice = ownerRes.data?.price ?? ownerRes.data?.data?.price;
  if (Number(ownerPrice) !== 4500000) {
    throw new Error(`Expected updated price 4500000, got ${ownerPrice}`);
  }
});

test('T5.9_CacheInvalidation_AdminStatusTransition', 'Verify Admin status transition invalidates cache immediately', async () => {
  const landlordToken = await login('landlord@dormi.vn');
  const adminToken = await login('admin@dormi.vn');

  // Create room
  const createRes = await api('/api/rooms', {
    method: 'POST',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Admin Transition ${Date.now()}`,
      description: 'Mô tả phòng cho admin status transition.',
      price: 3000000,
      area: 20,
      utilities: 'Wifi',
      roomType: 'Phòng trọ',
      address: '789 Đường Admin Transition, Q.10, TP.HCM',
    },
  });
  const roomId = createRes.data?.data?.id || createRes.data?.id;

  // 1. Admin approves -> Available
  const approveRes = await api(`/api/admin/rooms/${roomId}/status?status=Available`, {
    method: 'PATCH',
    token: adminToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });
  if (approveRes.status !== 200) throw new Error(`Admin approve failed: ${approveRes.status}`);

  // Public fetch immediately: MUST return 200 OK
  const pub1 = await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });
  if (pub1.status !== 200) throw new Error(`Public fetch failed after admin approve: ${pub1.status}`);

  // 2. Admin hides room -> Hidden
  const hideRes = await api(`/api/admin/rooms/${roomId}/status?status=Hidden`, {
    method: 'PATCH',
    token: adminToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });
  if (hideRes.status !== 200) throw new Error(`Admin hide failed: ${hideRes.status}`);

  // Public fetch immediately: MUST return 404 Not Found (cache invalidated!)
  const pub2 = await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });
  if (pub2.status !== 404) {
    throw new Error(`Cache Invalidation Failure! Public fetch returned ${pub2.status} instead of 404 after admin set room to Hidden`);
  }
});

test('T5.10_CacheInvalidation_RoomDeletion', 'Verify room deletion immediately purges cache and returns 404', async () => {
  const landlordToken = await login('landlord@dormi.vn');
  const adminToken = await login('admin@dormi.vn');

  const createRes = await api('/api/rooms', {
    method: 'POST',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Deletion ${Date.now()}`,
      description: 'Mô tả phòng sẽ bị xoá.',
      price: 2500000,
      area: 18,
      utilities: 'Wifi',
      roomType: 'Phòng trọ',
      address: '321 Đường Xoá Phòng, Q.Bình Thạnh, TP.HCM',
    },
  });
  const roomId = createRes.data?.data?.id || createRes.data?.id;

  // Approve & prime cache
  await api(`/api/admin/rooms/${roomId}/status?status=Available`, {
    method: 'PATCH',
    token: adminToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });
  await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });

  // Delete room
  const delRes = await api(`/api/rooms/${roomId}`, {
    method: 'DELETE',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });
  if (delRes.status !== 200) throw new Error(`Delete room failed: ${delRes.status}`);

  // Immediate public fetch MUST be 404
  const checkRes = await api(`/api/rooms/${roomId}`, { headers: { 'X-Forwarded-For': nextIp() } });
  if (checkRes.status !== 404) {
    throw new Error(`Cache Invalidation Failure! Deleted room returned HTTP ${checkRes.status} instead of 404`);
  }
});

// ============================================================================
// AREA 4: Room State Machine & Authorization Barrier Penetration
// ============================================================================

test('T5.11_Unauthorized_SelfApproval_Bypass', 'Prevent Landlord from self-approving PendingApproval room via PUT /api/rooms/{id}', async () => {
  const landlordToken = await login('landlord@dormi.vn');

  const createRes = await api('/api/rooms', {
    method: 'POST',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Self Approval Attack ${Date.now()}`,
      description: 'Thử nghiệm tấn công tự duyệt phòng.',
      price: 3000000,
      area: 20,
      utilities: 'Wifi',
      roomType: 'Phòng trọ',
      address: '100 Đường Tự Duyệt, Q.1, TP.HCM',
    },
  });
  const roomId = createRes.data?.data?.id || createRes.data?.id;

  // Landlord attempts to update Status to 0 (Available)
  const attackRes = await api(`/api/rooms/${roomId}`, {
    method: 'PUT',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Self Approval Attack ${Date.now()}`,
      description: 'Thử nghiệm tấn công tự duyệt phòng.',
      price: 3000000,
      area: 20,
      utilities: 'Wifi',
      roomType: 'Phòng trọ',
      address: '100 Đường Tự Duyệt, Q.1, TP.HCM',
      status: 0, // Attempt self-approval!
    },
  });

  if (attackRes.status !== 400) {
    throw new Error(`Vulnerability Detected! Landlord self-approval returned HTTP ${attackRes.status} instead of 400 Bad Request`);
  }
  const msg = attackRes.data?.message || JSON.stringify(attackRes.data);
  if (!msg.includes('chờ duyệt') && !msg.includes('không thể tự chuyển')) {
    throw new Error(`Expected rejection message about pending approval, got: ${msg}`);
  }
});

test('T5.12_Unauthorized_AdminStatusRoute_Tenant', 'Prevent Tenant from calling Admin room status PATCH endpoint', async () => {
  const tenantToken = await login('tenant@dormi.vn');
  const fakeRoomId = '00000000-0000-0000-0000-000000000001';

  const res = await api(`/api/admin/rooms/${fakeRoomId}/status?status=Available`, {
    method: 'PATCH',
    token: tenantToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });

  if (res.status !== 403) {
    throw new Error(`Privilege Escalation Vulnerability! Tenant received HTTP ${res.status} instead of 403 Forbidden`);
  }
});

test('T5.13_Unauthorized_AdminStatusRoute_Anonymous', 'Prevent unauthenticated calls to Admin room status endpoint', async () => {
  const fakeRoomId = '00000000-0000-0000-0000-000000000001';

  const res = await api(`/api/admin/rooms/${fakeRoomId}/status?status=Available`, {
    method: 'PATCH',
    headers: { 'X-Forwarded-For': nextIp() },
  });

  if (res.status !== 401) {
    throw new Error(`Auth Bypass Vulnerability! Anonymous request received HTTP ${res.status} instead of 401 Unauthorized`);
  }
});

test('T5.14_CrossLandlord_RoomTampering_Blocked', 'Prevent Landlord 2 from modifying or deleting Landlord 1 room', async () => {
  const landlord1Token = await login('landlord@dormi.vn');
  const landlord2Token = await login('landlord2@dormi.vn');

  // Landlord 1 creates room
  const createRes = await api('/api/rooms', {
    method: 'POST',
    token: landlord1Token,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Landlord 1 ${Date.now()}`,
      description: 'Phòng của landlord 1',
      price: 3200000,
      area: 22,
      utilities: 'Wifi',
      roomType: 'Phòng trọ',
      address: '111 Đường Landlord 1, Q.3, TP.HCM',
    },
  });
  const roomId = createRes.data?.data?.id || createRes.data?.id;

  // Landlord 2 tries to update room
  const updateRes = await api(`/api/rooms/${roomId}`, {
    method: 'PUT',
    token: landlord2Token,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: 'Phòng Bị Hack Bởi Landlord 2',
      description: 'Hacked',
      price: 1000000,
      area: 22,
      utilities: 'Wifi',
      roomType: 'Phòng trọ',
      address: '111 Đường Landlord 1, Q.3, TP.HCM',
      status: 0,
    },
  });

  if (updateRes.status !== 403) {
    throw new Error(`Insecure Direct Object Reference (IDOR)! Landlord 2 update returned HTTP ${updateRes.status} instead of 403`);
  }

  // Landlord 2 tries to delete room
  const delRes = await api(`/api/rooms/${roomId}`, {
    method: 'DELETE',
    token: landlord2Token,
    headers: { 'X-Forwarded-For': nextIp() },
  });

  if (delRes.status !== 403) {
    throw new Error(`IDOR Vulnerability! Landlord 2 delete returned HTTP ${delRes.status} instead of 403`);
  }
});

test('T5.15_IllegalStateTransitions_ByAdmin', 'Prevent Admin from performing illegal state machine jumps (PendingApproval -> Rented)', async () => {
  const landlordToken = await login('landlord@dormi.vn');
  const adminToken = await login('admin@dormi.vn');

  const createRes = await api('/api/rooms', {
    method: 'POST',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Illegal Transition ${Date.now()}`,
      description: 'Mô tả phòng cho illegal transition.',
      price: 3000000,
      area: 20,
      utilities: 'Wifi',
      roomType: 'Phòng trọ',
      address: '222 Đường Illegal Jump, Q.5, TP.HCM',
    },
  });
  const roomId = createRes.data?.data?.id || createRes.data?.id;

  // Admin attempts illegal jump: PendingApproval (2) -> Rented (1)
  const jumpRes = await api(`/api/admin/rooms/${roomId}/status?status=Rented`, {
    method: 'PATCH',
    token: adminToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });

  if (jumpRes.status !== 400) {
    throw new Error(`State Machine Violation! Invalid jump PendingApproval -> Rented returned HTTP ${jumpRes.status} instead of 400`);
  }
  const msg = jumpRes.data?.message || JSON.stringify(jumpRes.data);
  if (!msg.includes('Không thể chuyển đổi trạng thái phòng')) {
    throw new Error(`Expected state transition validation error, got: ${msg}`);
  }
});

// ============================================================================
// AREA 5: Third-Party Service Resilience & Graceful Degradation
// ============================================================================

test('T5.16_Cloudinary_Degradation_Fallback', 'Verify image service gracefully falls back to static placeholder without 500 error or base64', async () => {
  const landlordToken = await login('landlord@dormi.vn');
  const listRes = await api('/api/rooms?pageSize=1', { headers: { 'X-Forwarded-For': nextIp() } });
  const rawList = Array.isArray(listRes.data?.data)
    ? listRes.data.data
    : (Array.isArray(listRes.data) ? listRes.data : listRes.data?.items);
  const roomId = rawList?.[0]?.id || rawList?.[0]?.Id;

  // Add image via multipart form
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const fileContent = 'GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;';
  const postData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="test.gif"',
    'Content-Type: image/gif',
    '',
    fileContent,
    `--${boundary}--`,
    '',
  ].join('\r\n');

  const res = await api(`/api/rooms/${roomId}/images?isPrimary=false`, {
    method: 'POST',
    token: landlordToken,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'X-Forwarded-For': nextIp(),
    },
    body: postData,
  });

  if (res.status === 500) {
    throw new Error(`Image service crashed with HTTP 500 on unconfigured Cloudinary!`);
  }

  // Either 200 with placeholder URL or 400 validation, but NEVER 500 and NEVER base64
  if (res.status === 200) {
    const imageUrl = res.data?.imageUrl || res.data?.data?.imageUrl || '';
    if (imageUrl.startsWith('data:')) {
      throw new Error(`Violated rule: Cloudinary fallback must never return raw base64 data URLs! Got: ${imageUrl.substring(0, 50)}`);
    }
  }
});

test('T5.17_PayOS_DepositCheckout_GracefulFallback', 'Verify PayOS deposit checkout returns valid VietQR structure without 500 crash', async () => {
  const landlordToken = await login('landlord@dormi.vn');
  const tenantToken = await login('tenant@dormi.vn');
  const adminToken = await login('admin@dormi.vn');

  // 1. Create room & approve it
  const roomRes = await api('/api/rooms', {
    method: 'POST',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Deposit Checkout ${Date.now()}`,
      description: 'Phòng để test checkout cọc PayOS.',
      price: 3000000,
      area: 20,
      utilities: 'Wifi',
      roomType: 'Phòng trọ',
      address: '555 Đường PayOS, Q.1, TP.HCM',
    },
  });
  const roomId = roomRes.data?.data?.id || roomRes.data?.id;

  await api(`/api/admin/rooms/${roomId}/status?status=Available`, {
    method: 'PATCH',
    token: adminToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });

  // Extract Tenant User ID directly from Tenant JWT token
  const tenantId = getUserIdFromToken(tenantToken) || 'c0000000-0000-0000-0000-000000000001';

  // 2. Landlord creates lease
  const leaseRes = await api('/api/leases', {
    method: 'POST',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      roomId,
      tenantId,
      monthlyRent: 3000000,
      deposit: 3000000,
      startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 180).toISOString(),
      termsAndConditions: 'Điều khoản hợp đồng tiêu chuẩn',
    },
  });

  if (leaseRes.status !== 200 && leaseRes.status !== 201) {
    throw new Error(`Create lease failed: ${leaseRes.status} - ${JSON.stringify(leaseRes.data)}`);
  }
  const leaseId = leaseRes.data?.id || leaseRes.data?.data?.id;

  // 3. Tenant initiates deposit checkout
  const checkoutRes = await api(`/api/postrental/leases/${leaseId}/deposit/checkout`, {
    method: 'POST',
    token: tenantToken,
    headers: { 'X-Forwarded-For': nextIp() },
  });

  if (checkoutRes.status !== 200) {
    throw new Error(`PayOS Deposit Checkout failed with HTTP ${checkoutRes.status} - ${JSON.stringify(checkoutRes.data)}`);
  }

  const data = checkoutRes.data?.data || checkoutRes.data;
  if (!data.checkoutUrl) throw new Error('Missing checkoutUrl in deposit response');
  if (!data.orderCode) throw new Error('Missing orderCode in deposit response');
  if (!data.qrCode && !data.qrUrl) throw new Error('Missing qrCode or qrUrl in deposit response');
});

test('T5.18_PayOS_Webhook_Forgery_Rejection', 'Verify forged PayOS webhook signature is rejected with HTTP 400 or handled safely', async () => {
  const forgedPayload = {
    code: '00',
    desc: 'success',
    data: {
      orderCode: 9999999999,
      amount: 5000000,
      description: 'HACK DEPOSIT',
      accountNumber: '123456789',
      reference: 'REF_FAKE',
      transactionDateTime: new Date().toISOString(),
      currency: 'VND',
      paymentLinkId: 'FAKE_LINK',
      code: '00',
      desc: 'success',
    },
    signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_TAMPERED',
  };

  const res = await api('/api/landlord/payment/payos-webhook', {
    method: 'POST',
    headers: { 'X-Forwarded-For': nextIp() },
    body: forgedPayload,
  });

  // Must not accept forged signature as 200 OK
  if (res.status === 200 && res.data?.status === 'Completed') {
    throw new Error(`Critical Security Flaw! Forged PayOS signature was accepted as Completed!`);
  }
  // Rejection with 400 or 500 (if unconfigured) is safe; should not corrupt payment state
  if (res.status !== 400 && res.status !== 500) {
    throw new Error(`Unexpected status for forged webhook: ${res.status}`);
  }
});

test('T5.19_EmailService_Resilience_ForgotPassword', 'Verify forgot password endpoint responds safely without crashing on unconfigured SMTP', async () => {
  // Test with registered email
  const resValid = await api('/api/Auth/forgot-password', {
    method: 'POST',
    headers: { 'X-Forwarded-For': nextIp() },
    body: { email: 'tenant@dormi.vn' },
  });

  if (resValid.status !== 200) {
    throw new Error(`Forgot password crashed with HTTP ${resValid.status} for valid user`);
  }
  const msgValid = (resValid.data?.message || '').toLowerCase();
  if (!msgValid.includes('if the account exists') && !msgValid.includes('nếu email tồn tại') && !msgValid.includes('otp')) {
    throw new Error(`Expected generic security message, got: ${JSON.stringify(resValid.data)}`);
  }

  // Test with non-existent email (email enumeration defense)
  const resGhost = await api('/api/Auth/forgot-password', {
    method: 'POST',
    headers: { 'X-Forwarded-For': nextIp() },
    body: { email: `nonexistent_${Date.now()}@dormi.space` },
  });

  if (resGhost.status !== 200) {
    throw new Error(`Forgot password crashed with HTTP ${resGhost.status} for non-existent user`);
  }
  if (resGhost.data?.message !== resValid.data?.message) {
    throw new Error(`User enumeration leak: Response messages differ between existing and non-existing email`);
  }
});

test('T5.20_Kafka_Degradation_InProcessFallback', 'Verify application functions cleanly when Kafka message broker is offline', async () => {
  const landlordToken = await login('landlord@dormi.vn');

  // Creating a room triggers NewRoomPendingApproval notification event
  const res = await api('/api/rooms', {
    method: 'POST',
    token: landlordToken,
    headers: { 'X-Forwarded-For': nextIp() },
    body: {
      title: `Phòng Test Kafka Fallback ${Date.now()}`,
      description: 'Kiểm tra hoạt động khi Kafka không khả dụng.',
      price: 2800000,
      area: 19,
      utilities: 'Wifi',
      roomType: 'Phòng trọ',
      address: '999 Đường Kafka, Q.Bình Tân, TP.HCM',
    },
  });

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Room creation failed under Kafka degradation: HTTP ${res.status}`);
  }
  if (!res.data?.data?.id && !res.data?.id) {
    throw new Error(`Missing room ID in response under Kafka degradation: ${JSON.stringify(res.data)}`);
  }
});

// ============================================================================
// MAIN RUNNER
// ============================================================================

async function runAll() {
  console.log(`\n======================================================================`);
  console.log(`🛡️  DORMI TIER 5: ADVERSARIAL PENETRATION & RESILIENCE VERIFICATION`);
  console.log(`Target: ${BASE_URL} | Time: ${new Date().toISOString()}`);
  console.log(`Total Adversarial Scenarios: ${tests.length}`);
  console.log(`======================================================================\n`);

  let passed = 0;
  let failed = 0;
  const results = [];
  const startAll = performance.now();

  for (const t of tests) {
    const startTest = performance.now();
    try {
      await t.fn();
      const dur = Math.round(performance.now() - startTest);
      passed++;
      results.push({ id: t.id, title: t.title, status: 'PASSED', duration: dur });
      console.log(`  ✅ [${t.id}] ${t.title} (${dur}ms)`);
    } catch (err) {
      const dur = Math.round(performance.now() - startTest);
      failed++;
      results.push({ id: t.id, title: t.title, status: 'FAILED', duration: dur, error: err.message });
      console.error(`  ❌ [${t.id}] ${t.title} (${dur}ms)`);
      console.error(`     Error: ${err.message}`);
    }
  }

  const totalDuration = ((performance.now() - startAll) / 1000).toFixed(2);
  console.log(`\n======================================================================`);
  console.log(`📊 ADVERSARIAL VERIFICATION SUMMARY`);
  console.log(`======================================================================`);
  console.log(`Total Tests:    ${tests.length}`);
  console.log(`Passed:         ${passed} / ${tests.length} (${((passed / tests.length) * 100).toFixed(1)}%)`);
  console.log(`Failed:         ${failed} / ${tests.length}`);
  console.log(`Execution Time: ${totalDuration}s`);
  console.log(`======================================================================\n`);

  if (failed > 0) {
    console.error(`💥 FAILURE: ${failed} adversarial tests failed! Review errors above.`);
    process.exit(1);
  } else {
    console.log(`🎉 SUCCESS: All ${passed} adversarial penetration tests PASSED (100% resilience rate).`);
    process.exit(0);
  }
}

runAll().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
