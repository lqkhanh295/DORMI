// Dormi Extreme-Performance Backend Stress Test Suite
// Zero external dependencies - runs directly on Node.js 24+

const BASE_URL = process.env.API_URL || 'http://localhost:5167';

function formatMs(ms) {
  return ms.toFixed(1) + 'ms';
}

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedArr.length) - 1;
  return sortedArr[Math.max(0, Math.min(index, sortedArr.length - 1))];
}

async function runWorkerPool({ count, concurrency, taskFn, onProgress }) {
  const latencies = [];
  const statusCodes = {};
  let errors = 0;
  let completed = 0;
  const startTime = performance.now();

  let nextIndex = 0;

  async function worker() {
    while (true) {
      const idx = nextIndex++;
      if (idx >= count) break;

      const reqStart = performance.now();
      try {
        const res = await taskFn(idx);
        const reqEnd = performance.now();
        const duration = reqEnd - reqStart;
        latencies.push(duration);

        const code = res.status;
        statusCodes[code] = (statusCodes[code] || 0) + 1;
      } catch (err) {
        errors++;
        statusCodes['ERR'] = (statusCodes['ERR'] || 0) + 1;
      } finally {
        completed++;
        if (onProgress && (completed % Math.max(1, Math.floor(count / 10)) === 0 || completed === count)) {
          onProgress(completed, count);
        }
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, count) }, () => worker());
  await Promise.all(workers);

  const totalTimeMs = performance.now() - startTime;
  latencies.sort((a, b) => a - b);

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const rps = (completed / (totalTimeMs / 1000)).toFixed(1);

  return {
    totalRequests: count,
    completed,
    errors,
    totalTimeMs,
    rps,
    latencies: {
      min: latencies[0] || 0,
      p50: percentile(latencies, 50),
      p90: percentile(latencies, 90),
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      max: latencies[latencies.length - 1] || 0,
      avg: avgLatency,
    },
    statusCodes,
  };
}

function printReport(title, stats) {
  console.log(`\n===============================================================`);
  console.log(`💥 HEAVY STRESS TEST: ${title}`);
  console.log(`===============================================================`);
  console.log(`Total Requests:    ${stats.completed}/${stats.totalRequests} (Errors: ${stats.errors})`);
  console.log(`Duration:          ${(stats.totalTimeMs / 1000).toFixed(2)}s`);
  console.log(`Throughput:        ⚡ ${stats.rps} req/sec`);
  console.log(`Latency (p50):     ${formatMs(stats.latencies.p50)}`);
  console.log(`Latency (p90):     ${formatMs(stats.latencies.p90)}`);
  console.log(`Latency (p95):     ${formatMs(stats.latencies.p95)}`);
  console.log(`Latency (p99):     ${formatMs(stats.latencies.p99)}`);
  console.log(`Latency (min/max): ${formatMs(stats.latencies.min)} / ${formatMs(stats.latencies.max)}`);
  console.log(`Latency (avg):     ${formatMs(stats.latencies.avg)}`);
  console.log(`Status Codes:      ${JSON.stringify(stats.statusCodes)}`);
  console.log(`---------------------------------------------------------------`);
}

async function main() {
  console.log(`\n===============================================================`);
  console.log(`🔥 DORMI EXTREME STRESS TEST (HIGH INTENSITY LOAD GENERATOR)`);
  console.log(`Target: ${BASE_URL} | Time: ${new Date().toISOString()}`);
  console.log(`===============================================================\n`);

  // 0. Pre-flight check & Setup
  try {
    const healthRes = await fetch(`${BASE_URL}/health`);
    if (!healthRes.ok) {
      console.error(`❌ Health check failed with status: ${healthRes.status}`);
      process.exit(1);
    }
    const healthJson = await healthRes.json();
    console.log(`✅ Target API is Healthy:`, healthJson);
  } catch (err) {
    console.error(`❌ Cannot reach ${BASE_URL}/health. Is the backend running?`, err.message);
    process.exit(1);
  }

  // Pre-fetch Tenant Auth Token and sample data
  let tenantToken = null;
  let testLeaseId = null;
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Forwarded-For': '192.168.100.201'
      },
      body: JSON.stringify({ email: 'tenant@dormi.vn', password: 'Password123!' }),
    });
    if (loginRes.ok) {
      const loginData = await loginRes.json();
      tenantToken = loginData.token;
      console.log(`🔑 Authenticated Tenant: ${loginData.user.fullName} (${loginData.user.email})`);

      const leasesRes = await fetch(`${BASE_URL}/api/leases/my`, {
        headers: { Authorization: `Bearer ${tenantToken}` },
      });
      if (leasesRes.ok) {
        const leases = await leasesRes.json();
        if (leases.length > 0) {
          testLeaseId = leases[0].id;
          console.log(`📄 Found test lease ID for concurrency test: ${testLeaseId}`);
        }
      }
    }
  } catch (err) {
    console.warn(`Could not setup tenant auth: ${err.message}`);
  }

  // Fetch sample room ID for detail tests
  let sampleRoomId = null;
  try {
    const roomsRes = await fetch(`${BASE_URL}/api/rooms?pageSize=1`);
    if (roomsRes.ok) {
      const data = await roomsRes.json();
      if (data.data && data.data.length > 0) {
        sampleRoomId = data.data[0].id;
        console.log(`🏠 Found test room ID for detail test: ${sampleRoomId}`);
      }
    }
  } catch (err) {
    console.warn(`Could not fetch sample room: ${err.message}`);
  }

  const allResults = [];

  // -------------------------------------------------------------------------
  // Scenario 1: Health Baseline Stress (300 requests, 30 concurrency)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 1/6] Heavy Baseline Stress: GET /health (Concurrency: 30, Total: 300)...');
  const sc1 = await runWorkerPool({
    count: 300,
    concurrency: 30,
    taskFn: () => fetch(`${BASE_URL}/health`, { keepalive: true }),
    onProgress: (done, total) => process.stdout.write(`  Progress: ${done}/${total}\r`),
  });
  printReport('GET /health Baseline (Heavy)', sc1);
  allResults.push({ name: 'GET /health (Baseline)', ...sc1 });

  // -------------------------------------------------------------------------
  // Scenario 2: Heavy Room Listings & DB Read Stress (500 requests, 50 concurrency)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 2/6] Extreme Read Stress: GET /api/rooms?page=1&pageSize=10 (Concurrency: 50, Total: 500)...');
  const sc2 = await runWorkerPool({
    count: 500,
    concurrency: 50,
    taskFn: (idx) => fetch(`${BASE_URL}/api/rooms?page=${(idx % 5) + 1}&pageSize=10`, { keepalive: true }),
    onProgress: (done, total) => process.stdout.write(`  Progress: ${done}/${total}\r`),
  });
  printReport('GET /api/rooms (500 Reqs @ 50 Concurrency)', sc2);
  allResults.push({ name: 'GET /api/rooms (500 reqs)', ...sc2 });

  // -------------------------------------------------------------------------
  // Scenario 3: Real Database Multi-Criteria Query Search (500 requests, 50 concurrency)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 3/6] Extreme Query Search Stress: GET /api/rooms with Filters (Concurrency: 50, Total: 500)...');
  const filterTypes = ['Studio', 'Phòng trọ', 'Căn hộ', ''];
  const sc3 = await runWorkerPool({
    count: 500,
    concurrency: 50,
    taskFn: (idx) => {
      const type = filterTypes[idx % filterTypes.length];
      const minP = 1000000 + (idx % 4) * 1000000;
      const maxP = minP + 5000000;
      const query = type ? `minPrice=${minP}&maxPrice=${maxP}&roomType=${encodeURIComponent(type)}` : `minPrice=${minP}&maxPrice=${maxP}`;
      return fetch(`${BASE_URL}/api/rooms?${query}`, { keepalive: true });
    },
    onProgress: (done, total) => process.stdout.write(`  Progress: ${done}/${total}\r`),
  });
  printReport('GET /api/rooms Filters (500 Reqs @ 50 Concurrency)', sc3);
  allResults.push({ name: 'GET /api/rooms (Filters)', ...sc3 });

  // -------------------------------------------------------------------------
  // Scenario 4: Room Details with Distributed Cache (500 requests, 50 concurrency)
  // -------------------------------------------------------------------------
  if (sampleRoomId) {
    console.log(`\n[Scenario 4/6] Extreme Room Detail & Cache Stress: GET /api/rooms/${sampleRoomId} (Concurrency: 50, Total: 500)...`);
    const sc4 = await runWorkerPool({
      count: 500,
      concurrency: 50,
      taskFn: (idx) =>
        fetch(`${BASE_URL}/api/rooms/${sampleRoomId}`, {
          headers: { 'X-Forwarded-For': `10.200.${Math.floor(idx / 50)}.${(idx % 50) + 1}` },
          keepalive: true,
        }),
      onProgress: (done, total) => process.stdout.write(`  Progress: ${done}/${total}\r`),
    });
    printReport(`GET /api/rooms/{id} (500 Reqs @ 50 Concurrency)`, sc4);
    allResults.push({ name: 'GET /api/rooms/{id} (Cache)', ...sc4 });
  }

  // -------------------------------------------------------------------------
  // Scenario 5: Multi-Tenant PBKDF2 Password Hashing Burst (60 requests, 15 concurrency)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 5/6] High CPU PBKDF2 Hashing Burst: POST /api/auth/login (Concurrency: 15, Total: 60)...');
  const sc5 = await runWorkerPool({
    count: 60,
    concurrency: 15,
    taskFn: (idx) =>
      fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Forwarded-For': `10.150.${Math.floor(idx / 20)}.${(idx % 20) + 1}`
        },
        body: JSON.stringify({ email: 'landlord@dormi.vn', password: 'Password123!' }),
      }),
    onProgress: (done, total) => process.stdout.write(`  Progress: ${done}/${total}\r`),
  });
  printReport('POST /api/auth/login (60 Reqs @ 15 Concurrency)', sc5);
  allResults.push({ name: 'POST /api/auth/login (PBKDF2)', ...sc5 });

  // -------------------------------------------------------------------------
  // Scenario 6: Extreme Race Condition Distributed Lock Hammer (100 simultaneous requests)
  // -------------------------------------------------------------------------
  console.log('\n[Scenario 6/6] Extreme Race Condition Hammer (100 simultaneous parallel lease sign requests)...');
  if (tenantToken && testLeaseId) {
    const sc6 = await runWorkerPool({
      count: 100,
      concurrency: 100, // all 100 hitting at the exact same millisecond!
      taskFn: () =>
        fetch(`${BASE_URL}/api/leases/${testLeaseId}/sign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tenantToken}`,
          },
          body: JSON.stringify({ agreedToTerms: true, signatureData: 'Tenant E-Signature Hammer' }),
        }),
      onProgress: (done, total) => process.stdout.write(`  Progress: ${done}/${total}\r`),
    });
    printReport('POST /api/leases/{id}/sign (100 Concurrency Hammer)', sc6);
    allResults.push({ name: 'POST /api/leases/sign (Race Lock)', ...sc6 });
  }

  // -------------------------------------------------------------------------
  // Final Consolidated Executive Summary
  // -------------------------------------------------------------------------
  console.log(`\n===============================================================`);
  console.log(`🏁 DORMI EXTREME STRESS TEST FINAL SUMMARY`);
  console.log(`===============================================================`);
  console.log(
    `| Endpoint / Scenario                     | RPS        | p50     | p95     | p99     | Status Summary          |`
  );
  console.log(
    `|-----------------------------------------|------------|---------|---------|---------|-------------------------|`
  );
  for (const r of allResults) {
    const name = r.name.padEnd(39).slice(0, 39);
    const rps = (r.rps + ' req/s').padStart(10);
    const p50 = formatMs(r.latencies.p50).padStart(7);
    const p95 = formatMs(r.latencies.p95).padStart(7);
    const p99 = formatMs(r.latencies.p99).padStart(7);
    const statusStr = JSON.stringify(r.statusCodes).slice(0, 23).padEnd(23);
    console.log(`| ${name} | ${rps} | ${p50} | ${p95} | ${p99} | ${statusStr} |`);
  }
  console.log(`===============================================================\n`);
}

main().catch(err => {
  console.error('Fatal error during stress test execution:', err);
  process.exit(1);
});
