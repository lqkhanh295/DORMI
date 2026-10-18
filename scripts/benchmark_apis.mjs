// DORMI API Latency Benchmark Script
// Measures request-to-response duration across all major endpoints

const BASE_URL = process.env.API_URL || 'http://localhost:5167';

async function measure(name, fn) {
  const start = performance.now();
  try {
    const res = await fn();
    const duration = performance.now() - start;
    return { name, duration: Math.round(duration), status: res.status, ok: res.ok, error: null };
  } catch (err) {
    const duration = performance.now() - start;
    return { name, duration: Math.round(duration), status: 0, ok: false, error: err.message };
  }
}

async function run() {
  console.log(`\n===============================================================`);
  console.log(`🚀 BENCHMARKING DORMI APIS against: ${BASE_URL}`);
  console.log(`===============================================================\n`);

  // 1. Health & Root
  const benchmarks = [];

  benchmarks.push(await measure('GET / (Root Ping)', () => fetch(`${BASE_URL}/`)));
  benchmarks.push(await measure('GET /health (DB & Cache)', () => fetch(`${BASE_URL}/health`)));

  // 2. Auth Login (Customer & Landlord)
  let customerToken = null;
  let landlordToken = null;

  benchmarks.push(await measure('POST /api/Auth/login (Customer)', async () => {
    const res = await fetch(`${BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tenant@dormi.vn', password: 'Password123!' })
    });
    if (res.ok) {
      const data = await res.json();
      customerToken = data.token;
    }
    return res;
  }));

  benchmarks.push(await measure('POST /api/Auth/login (Landlord)', async () => {
    const res = await fetch(`${BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'landlord@dormi.vn', password: 'Password123!' })
    });
    if (res.ok) {
      const data = await res.json();
      landlordToken = data.token;
    }
    return res;
  }));

  // 3. Rooms APIs
  let sampleRoomId = null;
  benchmarks.push(await measure('GET /api/Rooms (Page 1, 10 items)', async () => {
    const res = await fetch(`${BASE_URL}/api/Rooms?page=1&pageSize=10`);
    if (res.ok) {
      const data = await res.json();
      const list = data.data || data;
      if (list?.length > 0) sampleRoomId = list[0].id;
    }
    return res;
  }));

  benchmarks.push(await measure('GET /api/Rooms?district=Q.7', () => fetch(`${BASE_URL}/api/Rooms?district=Q.7`)));
  benchmarks.push(await measure('GET /api/Rooms?minPrice=2000000&maxPrice=5000000', () => fetch(`${BASE_URL}/api/Rooms?minPrice=2000000&maxPrice=5000000`)));
  benchmarks.push(await measure('GET /api/Rooms?roomType=Studio', () => fetch(`${BASE_URL}/api/Rooms?roomType=Studio`)));

  if (sampleRoomId) {
    // First read (might hit DB or populate cache)
    benchmarks.push(await measure(`GET /api/Rooms/${sampleRoomId} (First Read)`, () => fetch(`${BASE_URL}/api/Rooms/${sampleRoomId}`)));
    // Second read (should hit L1 Cache)
    benchmarks.push(await measure(`GET /api/Rooms/${sampleRoomId} (Cached Read)`, () => fetch(`${BASE_URL}/api/Rooms/${sampleRoomId}`)));
    benchmarks.push(await measure(`GET /api/Rooms/${sampleRoomId}/reviews`, () => fetch(`${BASE_URL}/api/Rooms/${sampleRoomId}/reviews`)));
    benchmarks.push(await measure(`GET /api/trustsafety/rooms/${sampleRoomId}/score`, () => fetch(`${BASE_URL}/api/trustsafety/rooms/${sampleRoomId}/score`)));
  }

  // 4. Roommate APIs
  benchmarks.push(await measure('GET /api/Roommates', () => fetch(`${BASE_URL}/api/Roommates`)));
  if (customerToken) {
    benchmarks.push(await measure('GET /api/Roommates/recommendations', () => fetch(`${BASE_URL}/api/Roommates/recommendations`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    })));
  }

  // 5. Landlord APIs
  if (landlordToken) {
    benchmarks.push(await measure('GET /api/Rooms (Landlord View - all status)', () => fetch(`${BASE_URL}/api/Rooms?page=1&pageSize=50`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/landlord/analytics (First Read)', () => fetch(`${BASE_URL}/api/landlord/analytics`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/landlord/analytics (Cached Read)', () => fetch(`${BASE_URL}/api/landlord/analytics`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/landlord/lead-analytics (First Read)', () => fetch(`${BASE_URL}/api/landlord/lead-analytics`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/landlord/lead-analytics (Cached Read)', () => fetch(`${BASE_URL}/api/landlord/lead-analytics`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/landlord/billing', () => fetch(`${BASE_URL}/api/landlord/billing`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/landlord/discover-tenants', () => fetch(`${BASE_URL}/api/landlord/discover-tenants`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/applications/landlord (First Read)', () => fetch(`${BASE_URL}/api/applications/landlord`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/applications/landlord (Cached Read)', () => fetch(`${BASE_URL}/api/applications/landlord`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/leases/my (First Read)', () => fetch(`${BASE_URL}/api/leases/my`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
    benchmarks.push(await measure('GET /api/leases/my (Cached Read)', () => fetch(`${BASE_URL}/api/leases/my`, {
      headers: { Authorization: `Bearer ${landlordToken}` }
    })));
  }

  // 6. Customer APIs
  if (customerToken) {
    benchmarks.push(await measure('GET /api/applications/my (First Read)', () => fetch(`${BASE_URL}/api/applications/my`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    })));
    benchmarks.push(await measure('GET /api/applications/my (Cached Read)', () => fetch(`${BASE_URL}/api/applications/my`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    })));
    benchmarks.push(await measure('GET /api/appointments', () => fetch(`${BASE_URL}/api/appointments`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    })));
    benchmarks.push(await measure('GET /api/favorites', () => fetch(`${BASE_URL}/api/favorites`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    })));
    benchmarks.push(await measure('GET /api/notifications', () => fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    })));
    benchmarks.push(await measure('GET /api/messages/conversations (First Read)', () => fetch(`${BASE_URL}/api/messages/conversations`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    })));
    benchmarks.push(await measure('GET /api/messages/conversations (Cached Read)', () => fetch(`${BASE_URL}/api/messages/conversations`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    })));
  }

  // Sort by duration descending to pinpoint slow APIs
  const sorted = [...benchmarks].sort((a, b) => b.duration - a.duration);

  console.log('---------------------------------------------------------------------------------------------------------');
  console.log('| Endpoint Name                                                  | Latency   | HTTP Status | Assessment  |');
  console.log('---------------------------------------------------------------------------------------------------------');

  for (const b of sorted) {
    const padName = b.name.padEnd(62);
    const padDur = `${b.duration}ms`.padEnd(9);
    const padStatus = `${b.status}`.padEnd(11);
    let assessment = '🟢 Rất nhanh';
    if (b.duration > 1000) assessment = '🔴 QUÁ CHẬM (>1s)';
    else if (b.duration > 500) assessment = '🟡 Chậm (>500ms)';
    else if (b.duration > 200) assessment = '🟠 Trung bình';

    console.log(`| ${padName} | ${padDur} | ${padStatus} | ${assessment} |`);
  }
  console.log('---------------------------------------------------------------------------------------------------------\n');
}

run();
