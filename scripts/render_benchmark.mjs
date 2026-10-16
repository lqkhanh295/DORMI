// Dormi Production Safe Benchmark & Latency Measurement Suite
// Safe for Render Free Tier (Low Concurrency, Zero Risk of OOM or Suspension)

const BASE_URL = process.env.API_URL || 'https://dormi-backend-b12o.onrender.com';

function formatMs(ms) {
  return ms.toFixed(1) + 'ms';
}

function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedArr.length) - 1;
  return sortedArr[Math.max(0, Math.min(index, sortedArr.length - 1))];
}

async function runWorkerPool({ count, concurrency, taskFn }) {
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
  console.log(`\n---------------------------------------------------------------`);
  console.log(`📍 ${title}`);
  console.log(`---------------------------------------------------------------`);
  console.log(`Requests:          ${stats.completed}/${stats.totalRequests} (Errors: ${stats.errors})`);
  console.log(`Throughput:        ${stats.rps} req/sec`);
  console.log(`Latency (p50):     ${formatMs(stats.latencies.p50)}`);
  console.log(`Latency (p90):     ${formatMs(stats.latencies.p90)}`);
  console.log(`Latency (p95):     ${formatMs(stats.latencies.p95)}`);
  console.log(`Latency (min/max): ${formatMs(stats.latencies.min)} / ${formatMs(stats.latencies.max)}`);
  console.log(`Status Codes:      ${JSON.stringify(stats.statusCodes)}`);
}

async function main() {
  console.log(`\n===============================================================`);
  console.log(`🌐 DORMI PRODUCTION SAFE BENCHMARK (RENDER CLOUD)`);
  console.log(`Target: ${BASE_URL} | Time: ${new Date().toISOString()}`);
  console.log(`===============================================================\n`);

  console.log(`[1/3] Benchmarking GET /health (WAN Latency & Middleware Overhead)...`);
  const sc1 = await runWorkerPool({
    count: 10,
    concurrency: 2,
    taskFn: () => fetch(`${BASE_URL}/health`),
  });
  printReport('GET /health Benchmark', sc1);

  console.log(`\n[2/3] Benchmarking GET /api/rooms?pageSize=5 (Production DB Read over WAN)...`);
  let sampleRoomId = null;
  const sc2 = await runWorkerPool({
    count: 10,
    concurrency: 2,
    taskFn: async () => {
      const res = await fetch(`${BASE_URL}/api/rooms?pageSize=5`);
      if (res.ok && !sampleRoomId) {
        try {
          const json = await res.json();
          if (json.data && json.data.length > 0) sampleRoomId = json.data[0].id;
        } catch {}
      }
      return res;
    },
  });
  printReport('GET /api/rooms Benchmark', sc2);

  if (sampleRoomId) {
    console.log(`\n[3/3] Benchmarking GET /api/rooms/{id} (Production Redis Cache & View Dedupe)...`);
    const sc3 = await runWorkerPool({
      count: 10,
      concurrency: 2,
      taskFn: () => fetch(`${BASE_URL}/api/rooms/${sampleRoomId}`),
    });
    printReport('GET /api/rooms/{id} Benchmark', sc3);
  }

  console.log(`\n===============================================================`);
  console.log(`🏁 PRODUCTION BENCHMARK COMPLETE`);
  console.log(`===============================================================\n`);
}

main().catch(err => {
  console.error('Fatal error during production benchmark:', err);
  process.exit(1);
});
