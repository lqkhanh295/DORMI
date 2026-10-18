// scripts/check_all_apis.mjs
// Comprehensive test and health suite for ALL Dormi APIs across all 3 roles + Public

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5167';

async function testEndpoint(name, category, role, fn) {
  const start = performance.now();
  let status = 0;
  let ok = false;
  let dataSummary = '';
  let errorMsg = '';

  try {
    const res = await fn();
    status = res.status;
    const dur = Math.round(performance.now() - start);

    if (res.ok) {
      ok = true;
      try {
        const json = await res.json();
        if (Array.isArray(json)) {
          dataSummary = `Array(${json.length})`;
        } else if (json && typeof json === 'object') {
          if (Array.isArray(json.data)) {
            dataSummary = `Paged(${json.data.length}/${json.totalItems ?? '?'})`;
          } else if (json.data && typeof json.data === 'object') {
            dataSummary = `Obj(${Object.keys(json.data).length} keys)`;
          } else {
            dataSummary = `Obj(${Object.keys(json).length} keys)`;
          }
        } else {
          dataSummary = String(json).slice(0, 20);
        }
      } catch {
        dataSummary = 'non-json';
      }
    } else {
      try {
        const text = await res.text();
        errorMsg = text.slice(0, 50);
      } catch {
        errorMsg = res.statusText;
      }
    }

    return { name, category, role, status, ok, duration: dur, dataSummary, errorMsg };
  } catch (err) {
    const dur = Math.round(performance.now() - start);
    return { name, category, role, status: 'ERR', ok: false, duration: dur, dataSummary: '', errorMsg: err.message };
  }
}

async function run() {
  console.log('========================================================================================================');
  console.log(`🔍 KIỂM TRA TOÀN DIỆN TẤT CẢ API TRÊN HỆ THỐNG: ${BASE_URL}`);
  console.log('========================================================================================================\n');

  const results = [];

  // 1. PUBLIC APIS
  results.push(await testEndpoint('GET / (Root Ping)', 'Public', 'Public', () => fetch(`${BASE_URL}/`)));
  results.push(await testEndpoint('GET /health (Health & DB Check)', 'Public', 'Public', () => fetch(`${BASE_URL}/health`)));
  results.push(await testEndpoint('GET /api/Auth/captcha', 'Auth', 'Public', () => fetch(`${BASE_URL}/api/Auth/captcha`)));
  
  let sampleRoomId = null;
  results.push(await testEndpoint('GET /api/Rooms (Search & List)', 'Rooms', 'Public', async () => {
    const res = await fetch(`${BASE_URL}/api/Rooms?page=1&pageSize=10`);
    if (res.ok) {
      const clone = res.clone();
      try {
        const d = await clone.json();
        const list = d.data || d;
        if (list && list.length > 0) sampleRoomId = list[0].id;
      } catch {}
    }
    return res;
  }));

  results.push(await testEndpoint('GET /api/Rooms/featured', 'Rooms', 'Public', () => fetch(`${BASE_URL}/api/Rooms/featured?limit=6`)));
  results.push(await testEndpoint('GET /api/Rooms?district=Q.7', 'Rooms', 'Public', () => fetch(`${BASE_URL}/api/Rooms?district=Q.7`)));
  results.push(await testEndpoint('GET /api/Rooms?minPrice=2000000&maxPrice=5000000', 'Rooms', 'Public', () => fetch(`${BASE_URL}/api/Rooms?minPrice=2000000&maxPrice=5000000`)));
  results.push(await testEndpoint('GET /api/Rooms?roomType=Studio', 'Rooms', 'Public', () => fetch(`${BASE_URL}/api/Rooms?roomType=Studio`)));

  if (sampleRoomId) {
    results.push(await testEndpoint(`GET /api/Rooms/${sampleRoomId}`, 'Rooms', 'Public', () => fetch(`${BASE_URL}/api/Rooms/${sampleRoomId}`)));
    results.push(await testEndpoint(`GET /api/Rooms/${sampleRoomId}/reviews`, 'Reviews', 'Public', () => fetch(`${BASE_URL}/api/Rooms/${sampleRoomId}/reviews`)));
    results.push(await testEndpoint(`GET /api/trustsafety/rooms/${sampleRoomId}/score`, 'TrustSafety', 'Public', () => fetch(`${BASE_URL}/api/trustsafety/rooms/${sampleRoomId}/score`)));
    results.push(await testEndpoint(`GET /api/Rooms/${sampleRoomId}/images`, 'Rooms', 'Public', () => fetch(`${BASE_URL}/api/Rooms/${sampleRoomId}/images`)));
  }

  let sampleRoommateId = null;
  results.push(await testEndpoint('GET /api/Roommates (All listings)', 'Roommates', 'Public', async () => {
    const res = await fetch(`${BASE_URL}/api/Roommates`);
    if (res.ok) {
      try {
        const d = await res.clone().json();
        const list = d.data || d;
        if (list && list.length > 0) sampleRoommateId = list[0].id;
      } catch {}
    }
    return res;
  }));
  results.push(await testEndpoint('GET /api/Roommates?gender=Female', 'Roommates', 'Public', () => fetch(`${BASE_URL}/api/Roommates?gender=Female`)));

  if (sampleRoommateId) {
    results.push(await testEndpoint(`GET /api/Roommates/${sampleRoommateId}`, 'Roommates', 'Public', () => fetch(`${BASE_URL}/api/Roommates/${sampleRoommateId}`)));
  }

  // 2. AUTH LOGIN FOR ROLES
  let customerToken = null;
  let customerUser = null;
  results.push(await testEndpoint('POST /api/Auth/login (Customer)', 'Auth', 'Customer', async () => {
    const res = await fetch(`${BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tenant@dormi.vn', password: 'Password123!' })
    });
    if (res.ok) {
      const clone = res.clone();
      const d = await clone.json();
      customerToken = d.token;
      customerUser = d.user;
    }
    return res;
  }));

  let landlordToken = null;
  let landlordUser = null;
  results.push(await testEndpoint('POST /api/Auth/login (Landlord)', 'Auth', 'Landlord', async () => {
    const res = await fetch(`${BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'landlord@dormi.vn', password: 'Password123!' })
    });
    if (res.ok) {
      const clone = res.clone();
      const d = await clone.json();
      landlordToken = d.token;
      landlordUser = d.user;
    }
    return res;
  }));

  let adminToken = null;
  results.push(await testEndpoint('POST /api/Auth/login (Admin)', 'Auth', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dormi.vn', password: 'Password123!' })
    });
    if (res.ok) {
      const clone = res.clone();
      const d = await clone.json();
      adminToken = d.token;
    }
    return res;
  }));

  // 3. CUSTOMER / TENANT APIS
  let sampleLeaseId = null;
  if (customerToken) {
    const authHeaders = { Authorization: `Bearer ${customerToken}` };
    results.push(await testEndpoint('GET /api/Auth/me', 'Auth', 'Customer', () => fetch(`${BASE_URL}/api/Auth/me`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/Profiles/customer', 'Profiles', 'Customer', () => fetch(`${BASE_URL}/api/Profiles/customer`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/favorites', 'Favorites', 'Customer', () => fetch(`${BASE_URL}/api/favorites`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/notifications', 'Notifications', 'Customer', () => fetch(`${BASE_URL}/api/notifications`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/appointments', 'Appointments', 'Customer', () => fetch(`${BASE_URL}/api/appointments`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/applications/my', 'Applications', 'Customer', () => fetch(`${BASE_URL}/api/applications/my`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/leases/my', 'Leases', 'Customer', async () => {
      const res = await fetch(`${BASE_URL}/api/leases/my`, { headers: authHeaders });
      if (res.ok) {
        try {
          const d = await res.clone().json();
          const list = d.data || d;
          if (list && list.length > 0) sampleLeaseId = list[0].id;
        } catch {}
      }
      return res;
    }));
    results.push(await testEndpoint('GET /api/messages/conversations', 'Messages', 'Customer', () => fetch(`${BASE_URL}/api/messages/conversations`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/Roommates/recommendations', 'Roommates', 'Customer', () => fetch(`${BASE_URL}/api/Roommates/recommendations`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/postrental/maintenance', 'PostRental', 'Customer', () => fetch(`${BASE_URL}/api/postrental/maintenance`, { headers: authHeaders })));

    if (sampleLeaseId) {
      results.push(await testEndpoint(`GET /api/postrental/leases/${sampleLeaseId}/summary`, 'PostRental', 'Customer', () => fetch(`${BASE_URL}/api/postrental/leases/${sampleLeaseId}/summary`, { headers: authHeaders })));
      results.push(await testEndpoint(`GET /api/postrental/leases/${sampleLeaseId}/payments`, 'PostRental', 'Customer', () => fetch(`${BASE_URL}/api/postrental/leases/${sampleLeaseId}/payments`, { headers: authHeaders })));
    }
  }

  // 4. LANDLORD APIS
  if (landlordToken) {
    const authHeaders = { Authorization: `Bearer ${landlordToken}` };
    results.push(await testEndpoint('GET /api/Auth/me', 'Auth', 'Landlord', () => fetch(`${BASE_URL}/api/Auth/me`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/Profiles/landlord', 'Profiles', 'Landlord', () => fetch(`${BASE_URL}/api/Profiles/landlord`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/Profiles/landlord/verification', 'Profiles', 'Landlord', () => fetch(`${BASE_URL}/api/Profiles/landlord/verification`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/Rooms (Landlord List)', 'Rooms', 'Landlord', () => fetch(`${BASE_URL}/api/Rooms?page=1&pageSize=50`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/landlord/analytics', 'Dashboard', 'Landlord', () => fetch(`${BASE_URL}/api/landlord/analytics`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/landlord/lead-analytics', 'Dashboard', 'Landlord', () => fetch(`${BASE_URL}/api/landlord/lead-analytics`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/landlord/billing', 'Dashboard', 'Landlord', () => fetch(`${BASE_URL}/api/landlord/billing`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/landlord/discover-tenants', 'Dashboard', 'Landlord', () => fetch(`${BASE_URL}/api/landlord/discover-tenants`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/applications/landlord', 'Applications', 'Landlord', () => fetch(`${BASE_URL}/api/applications/landlord`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/leases/my', 'Leases', 'Landlord', () => fetch(`${BASE_URL}/api/leases/my`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/tenantreviews/leases', 'TenantReviews', 'Landlord', () => fetch(`${BASE_URL}/api/tenantreviews/leases`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/postrental/maintenance (Landlord)', 'PostRental', 'Landlord', () => fetch(`${BASE_URL}/api/postrental/maintenance`, { headers: authHeaders })));
  }

  // 5. ADMIN APIS
  if (adminToken) {
    const authHeaders = { Authorization: `Bearer ${adminToken}` };
    results.push(await testEndpoint('GET /api/admin/stats', 'Admin', 'Admin', () => fetch(`${BASE_URL}/api/admin/stats`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/admin/users', 'Admin', 'Admin', () => fetch(`${BASE_URL}/api/admin/users`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/admin/users?role=Landlord', 'Admin', 'Admin', () => fetch(`${BASE_URL}/api/admin/users?role=Landlord`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/admin/users?role=Customer', 'Admin', 'Admin', () => fetch(`${BASE_URL}/api/admin/users?role=Customer`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/admin/verifications', 'Admin', 'Admin', () => fetch(`${BASE_URL}/api/admin/verifications`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/admin/rooms', 'Admin', 'Admin', () => fetch(`${BASE_URL}/api/admin/rooms`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/admin/reports', 'Admin', 'Admin', () => fetch(`${BASE_URL}/api/admin/reports`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/admin/roommate-posts', 'Admin', 'Admin', () => fetch(`${BASE_URL}/api/admin/roommate-posts`, { headers: authHeaders })));
    results.push(await testEndpoint('GET /api/trustsafety/moderation/reports', 'TrustSafety', 'Admin', () => fetch(`${BASE_URL}/api/trustsafety/moderation/reports`, { headers: authHeaders })));
  }

  // 6. TENANT REPUTATION
  if (customerUser?.id) {
    results.push(await testEndpoint(`GET /api/tenantreviews/tenant/${customerUser.id}`, 'TenantReviews', 'Public', () => fetch(`${BASE_URL}/api/tenantreviews/tenant/${customerUser.id}`)));
  }

  // PRINT SUMMARY TABLE
  console.log('-----------------------------------------------------------------------------------------------------------------------------');
  console.log('| Endpoint Name                                                  | Role     | Status | Latency | Data / Result      | Health |');
  console.log('-----------------------------------------------------------------------------------------------------------------------------');

  let passed = 0;
  let failed = 0;
  let slow = 0;

  for (const r of results) {
    const padName = r.name.padEnd(62).slice(0, 62);
    const padRole = r.role.padEnd(8);
    const padStatus = String(r.status).padEnd(6);
    const padDur = `${r.duration}ms`.padEnd(7);
    const padData = (r.ok ? r.dataSummary : r.errorMsg).padEnd(18).slice(0, 18);
    
    let health = '🟢 OK';
    if (!r.ok) {
      health = '🔴 FAIL';
      failed++;
    } else {
      passed++;
      if (r.duration > 1500) {
        health = '🟡 SLOW';
        slow++;
      }
    }

    console.log(`| ${padName} | ${padRole} | ${padStatus} | ${padDur} | ${padData} | ${health} |`);
  }

  console.log('-----------------------------------------------------------------------------------------------------------------------------\n');
  console.log(`📊 TỔNG KẾT: Tổng số API kiểm tra = ${results.length}`);
  console.log(`   ✅ Thành công: ${passed} APIs (${Math.round((passed / results.length) * 100)}%)`);
  console.log(`   ❌ Thất bại: ${failed} APIs`);
  console.log(`   ⚠️ Chậm (>1.5s): ${slow} APIs`);
  console.log('========================================================================================================\n');
}

run();
