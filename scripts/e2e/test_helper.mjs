// Dormi E2E Test Suite - Shared Test Helper & Utilities
// Zero external dependencies - Runs natively on Node.js 24+

export const BASE_URL = process.env.API_URL || 'http://localhost:5167';

const tokenCache = new Map();
let ipCounter = 1;

export function setCachedToken(role, token) {
  tokenCache.set(role, token);
}

/**
 * Perform an HTTP request against the Dormi API
 */
export async function api(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const headers = { ...options.headers };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  // Use test client IP to avoid rate limit collision across test runs
  if (!headers['X-Forwarded-For']) {
    headers['X-Forwarded-For'] = `10.88.1.${(ipCounter++ % 200) + 1}`;
  }

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    body = JSON.stringify(body);
  }

  const timeoutMs = options.timeoutMs || 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body,
      signal: controller.signal,
    });

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      try {
        data = await response.text();
      } catch {
        data = null;
      }
    }

    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      data,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Retrieve a valid Bearer token for a given role ('customer' | 'landlord' | 'admin')
 */
export async function getAuthToken(role = 'customer') {
  if (tokenCache.has(role)) {
    return tokenCache.get(role);
  }

  let email = 'tenant@dormi.vn';
  const password = 'Password123!';

  if (role === 'landlord') {
    email = 'landlord@dormi.vn';
  } else if (role === 'admin') {
    email = 'admin@dormi.vn';
  }

  let loginRes = await api('/api/Auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (!loginRes.ok && loginRes.data?.requiresCaptcha) {
    const q = loginRes.data.captchaQuestion || '';
    const match = q.match(/(\d+)\s*\+\s*(\d+)/);
    const ans = match ? String(parseInt(match[1]) + parseInt(match[2])) : '0';
    loginRes = await api('/api/Auth/login', {
      method: 'POST',
      body: {
        email,
        password,
        captchaToken: loginRes.data.captchaToken,
        captchaAnswer: ans,
      },
    });
  }

  if (!loginRes.ok) {
    throw new Error(`Failed to login as ${role} (${email}): HTTP ${loginRes.status} - ${JSON.stringify(loginRes.data)}`);
  }

  let token = loginRes.data?.token;

  // Handle Admin MFA requirement
  if (role === 'admin' && loginRes.data?.requiresMfa) {
    const mfaRes = await api('/api/Auth/verify-mfa', {
      method: 'POST',
      body: {
        email,
        mfaSessionToken: loginRes.data.mfaSessionToken,
        otpCode: '123456',
      },
    });

    if (!mfaRes.ok || !mfaRes.data?.token) {
      throw new Error(`Admin MFA verification failed: HTTP ${mfaRes.status} - ${JSON.stringify(mfaRes.data)}`);
    }

    token = mfaRes.data.token;
  }

  if (!token) {
    throw new Error(`No token received for ${role} login.`);
  }

  tokenCache.set(role, token);
  return token;
}

// Custom assertions
export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'assertEqual failed'}: expected [${expected}], got [${actual}]`);
  }
}

export function assertTrue(actual, message) {
  if (actual !== true) {
    throw new Error(`${message || 'assertTrue failed'}: expected true, got [${actual}]`);
  }
}

export function assertInRange(value, min, max, message) {
  if (value < min || value > max) {
    throw new Error(`${message || 'assertInRange failed'}: expected between ${min} and ${max}, got [${value}]`);
  }
}

export function assertIncludes(haystack, needle, message) {
  const str = String(haystack);
  if (!str.includes(needle)) {
    throw new Error(`${message || 'assertIncludes failed'}: expected string to contain "${needle}"`);
  }
}

/**
 * Creates a tier test runner instance
 */
export function createTestSuite(tierName, description) {
  const tests = [];

  function test(id, name, fn) {
    tests.push({ id, name, fn });
  }

  async function run() {
    console.log(`\n======================================================================`);
    console.log(`🚀 RUNNING: ${tierName} - ${description}`);
    console.log(`======================================================================`);

    const results = [];
    let passed = 0;
    let failed = 0;
    const startTier = performance.now();

    for (const t of tests) {
      const startTest = performance.now();
      try {
        await t.fn();
        const duration = Math.round(performance.now() - startTest);
        passed++;
        results.push({ id: t.id, name: t.name, status: 'PASSED', duration });
        console.log(`  ✅ [${t.id}] ${t.name} (${duration}ms)`);
      } catch (err) {
        const duration = Math.round(performance.now() - startTest);
        failed++;
        results.push({ id: t.id, name: t.name, status: 'FAILED', duration, error: err.message });
        console.error(`  ❌ [${t.id}] ${t.name} (${duration}ms)`);
        console.error(`     Error: ${err.message}`);
      }
    }

    const totalDuration = Math.round(performance.now() - startTier);
    console.log(`----------------------------------------------------------------------`);
    console.log(`📊 ${tierName} SUMMARY: ${passed}/${tests.length} passed (${failed} failed) in ${totalDuration}ms`);
    console.log(`======================================================================\n`);

    return {
      tierName,
      total: tests.length,
      passed,
      failed,
      durationMs: totalDuration,
      results,
    };
  }

  return { test, run, getTests: () => tests };
}
