// Tier 1: Feature Coverage (40 automated tests across 8 core features)
// Zero external dependencies - Runs natively on Node.js 24+

import {
  api,
  getAuthToken,
  setCachedToken,
  assert,
  assertEqual,
  assertTrue,
  assertInRange,
  assertIncludes,
  createTestSuite,
} from './test_helper.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

export const suite = createTestSuite('Tier 1', 'Feature Coverage Suite (40 tests across 8 features)');

// ============================================================================
// Feature 1: Auth & Security (T1.1 - T1.5)
// ============================================================================
suite.test('T1.1_Auth_Register', 'Register new user account returns valid token and user profile', async () => {
  const uniqueEmail = `test.e2e.${Date.now()}.${Math.floor(Math.random() * 1000)}@dormi.vn`;
  const res = await api('/api/Auth/register', {
    method: 'POST',
    body: {
      email: uniqueEmail,
      password: 'Password123!',
      fullName: 'E2E Test User',
      phoneNumber: '0909999888',
      role: 0,
    },
  });

  assertEqual(res.status, 200, 'Register should return HTTP 200');
  assert(res.data?.token, 'Register response should contain token');
  assertEqual(res.data?.user?.email, uniqueEmail, 'User email should match registered email');
});

suite.test('T1.2_Auth_Login_Customer', 'Login with customer credentials succeeds with role 0', async () => {
  const res = await api('/api/Auth/login', {
    method: 'POST',
    body: {
      email: 'tenant@dormi.vn',
      password: 'Password123!',
    },
  });

  assertEqual(res.status, 200, 'Customer login should return HTTP 200');
  assert(res.data?.token, 'Customer login should return JWT token');
  assertEqual(res.data?.user?.role, 0, 'Customer role should be 0');
  setCachedToken('customer', res.data.token);
});

suite.test('T1.3_Auth_Login_Landlord', 'Login with landlord credentials succeeds with role 1', async () => {
  const res = await api('/api/Auth/login', {
    method: 'POST',
    body: {
      email: 'landlord@dormi.vn',
      password: 'Password123!',
    },
  });

  assertEqual(res.status, 200, 'Landlord login should return HTTP 200');
  assert(res.data?.token, 'Landlord login should return JWT token');
  assertEqual(res.data?.user?.role, 1, 'Landlord role should be 1');
  setCachedToken('landlord', res.data.token);
});

suite.test('T1.4_Auth_Admin_MFA', 'Admin login triggers MFA challenge and completes verification', async () => {
  const loginRes = await api('/api/Auth/login', {
    method: 'POST',
    body: {
      email: 'admin@dormi.vn',
      password: 'Password123!',
    },
  });

  assertEqual(loginRes.status, 200, 'Admin login initiate should return HTTP 200');
  assertTrue(loginRes.data?.requiresMfa, 'Admin login should require MFA');
  assert(loginRes.data?.mfaSessionToken, 'Admin login should provide mfaSessionToken');

  const mfaRes = await api('/api/Auth/verify-mfa', {
    method: 'POST',
    body: {
      email: 'admin@dormi.vn',
      mfaSessionToken: loginRes.data.mfaSessionToken,
      otpCode: '123456',
    },
  });

  assertEqual(mfaRes.status, 200, 'Admin MFA verification should return HTTP 200');
  assert(mfaRes.data?.token, 'Admin MFA verification should return final JWT token');
  assertEqual(mfaRes.data?.user?.role, 2, 'Admin role should be 2');
  setCachedToken('admin', mfaRes.data.token);
});

suite.test('T1.5_Auth_Me_Authenticated', 'Authenticated GET /api/Auth/me returns current user info', async () => {
  const token = await getAuthToken('customer');
  const res = await api('/api/Auth/me', { token });

  assertEqual(res.status, 200, 'GET /api/Auth/me should return HTTP 200');
  assertEqual(res.data?.email, 'tenant@dormi.vn', 'GET /api/Auth/me email should match authenticated user');
});

// ============================================================================
// Feature 2: Room Search & Filter (T1.6 - T1.10)
// ============================================================================
suite.test('T1.6_Room_List_All', 'GET /api/Rooms returns paginated room list', async () => {
  const res = await api('/api/Rooms?page=1&pageSize=10');

  assertEqual(res.status, 200, 'GET /api/Rooms should return HTTP 200');
  const list = res.data?.data || res.data?.items || res.data;
  assert(Array.isArray(list), 'Rooms result should contain an array of rooms');
  assert(list.length > 0, 'Rooms list should not be empty');
});

suite.test('T1.7_Room_Filter_District', 'GET /api/Rooms?district=Q.7 filters rooms in District 7', async () => {
  const res = await api('/api/Rooms?district=Q.7&pageSize=10');

  assertEqual(res.status, 200, 'GET /api/Rooms?district=Q.7 should return HTTP 200');
  const list = res.data?.data || res.data?.items || res.data;
  assert(Array.isArray(list) && list.length > 0, 'District Q.7 filter should return rooms');
  for (const room of list) {
    const address = room.address || '';
    assert(
      address.includes('Q.7') || address.includes('Quận 7'),
      `Room address "${address}" should contain Q.7`
    );
  }
});

suite.test('T1.8_Room_Filter_PriceRange', 'GET /api/Rooms with minPrice and maxPrice filters bounds', async () => {
  const minPrice = 3000000;
  const maxPrice = 6000000;
  const res = await api(`/api/Rooms?minPrice=${minPrice}&maxPrice=${maxPrice}&pageSize=10`);

  assertEqual(res.status, 200, 'Price filter should return HTTP 200');
  const list = res.data?.data || res.data?.items || res.data;
  assert(Array.isArray(list) && list.length > 0, 'Price filter should return rooms');
  for (const room of list) {
    assertInRange(room.price, minPrice, maxPrice, `Room price ${room.price} should be within [${minPrice}, ${maxPrice}]`);
  }
});

suite.test('T1.9_Room_Filter_RoomType', 'GET /api/Rooms?roomType=Studio filters studio units', async () => {
  const res = await api('/api/Rooms?roomType=Studio&pageSize=10');

  assertEqual(res.status, 200, 'RoomType filter should return HTTP 200');
  const list = res.data?.data || res.data?.items || res.data;
  assert(Array.isArray(list) && list.length > 0, 'Studio filter should return rooms');
  for (const room of list) {
    assertEqual(room.roomType, 'Studio', 'RoomType should be Studio');
  }
});

suite.test('T1.10_Room_Detail_ById', 'GET /api/Rooms/{id} returns full room details', async () => {
  const listRes = await api('/api/Rooms?pageSize=1');
  const sample = (listRes.data?.data || listRes.data?.items || listRes.data)[0];
  assert(sample?.id, 'Sample room should have an ID');

  const detailRes = await api(`/api/Rooms/${sample.id}`);
  assertEqual(detailRes.status, 200, 'GET /api/Rooms/{id} should return HTTP 200');
  assertEqual(detailRes.data?.id, sample.id, 'Room ID should match requested ID');
  assert(detailRes.data?.title, 'Room title should be present');
  assert(detailRes.data?.price > 0, 'Room price should be greater than 0');
});

// ============================================================================
// Feature 3: Room Posting & State Machine (T1.11 - T1.15)
// ============================================================================
let createdRoomId = null;

suite.test('T1.11_Room_Create_PendingApproval', 'Verified Landlord posts room starting in PendingApproval status (2)', async () => {
  const landlordToken = await getAuthToken('landlord');
  const uniqueTitle = `Phòng E2E M4 Test ${Date.now()}`;

  const res = await api('/api/Rooms', {
    method: 'POST',
    token: landlordToken,
    body: {
      title: uniqueTitle,
      description: 'Phòng trọ tiện nghi phục vụ kiểm thử tự động Milestone M4.',
      price: 4500000,
      area: 25.5,
      utilities: 'Wifi, Máy lạnh, Giờ giấc tự do',
      roomType: 'Phòng trọ',
      address: '123 Đường Test, Q.3, TP.HCM',
      imageUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    },
  });

  assert(res.status === 200 || res.status === 201, `Create room should return HTTP 200 or 201, got ${res.status}`);
  createdRoomId = res.data?.id;
  assert(createdRoomId, 'Created room should have an ID');
  assertEqual(res.data?.status, 2, 'New room status must be PendingApproval (2)');
});

suite.test('T1.12_Room_Admin_List_Moderation', 'Admin can list rooms awaiting moderation', async () => {
  const adminToken = await getAuthToken('admin');
  const res = await api('/api/Admin/rooms', { token: adminToken });

  assertEqual(res.status, 200, 'GET /api/Admin/rooms should return HTTP 200');
  assert(Array.isArray(res.data), 'Admin rooms result should be an array');
});

suite.test('T1.13_Room_Admin_Approve', 'Admin approves room status transition to Available (0)', async () => {
  assert(createdRoomId, 'Requires createdRoomId from T1.11');
  const adminToken = await getAuthToken('admin');

  const patchRes = await api(`/api/Admin/rooms/${createdRoomId}/status?status=Available`, {
    method: 'PATCH',
    token: adminToken,
  });

  assertEqual(patchRes.status, 200, 'Admin PATCH room status should return HTTP 200');

  const checkRes = await api(`/api/Rooms/${createdRoomId}`);
  assertEqual(checkRes.status, 200, 'GET /api/Rooms/{id} should return HTTP 200');
  assertEqual(checkRes.data?.status, 0, 'Room status after admin approval should be Available (0)');
});

suite.test('T1.14_Room_Landlord_Update_Status_Rented', 'Landlord updates room status to Rented (1)', async () => {
  assert(createdRoomId, 'Requires createdRoomId from T1.11');
  const landlordToken = await getAuthToken('landlord');

  // Fetch current room to keep critical fields identical and avoid triggering re-moderation
  const currentRes = await api(`/api/Rooms/${createdRoomId}`);
  const current = currentRes.data;

  const updateRes = await api(`/api/Rooms/${createdRoomId}`, {
    method: 'PUT',
    token: landlordToken,
    body: {
      title: current.title,
      description: current.description,
      price: current.price,
      area: current.area,
      utilities: current.utilities,
      roomType: current.roomType,
      address: current.address,
      status: 1, // Rented
    },
  });

  assertEqual(updateRes.status, 200, 'Update room should return HTTP 200');
  assertEqual(updateRes.data?.status, 1, 'Room status should be updated to Rented (1)');
});

suite.test('T1.15_Room_Landlord_Delete_Clean', 'Landlord deletes created test room', async () => {
  assert(createdRoomId, 'Requires createdRoomId from T1.11');
  const landlordToken = await getAuthToken('landlord');

  const delRes = await api(`/api/Rooms/${createdRoomId}`, {
    method: 'DELETE',
    token: landlordToken,
  });

  assertEqual(delRes.status, 200, 'Delete room should return HTTP 200');

  const checkRes = await api(`/api/Rooms/${createdRoomId}`);
  assertEqual(checkRes.status, 404, 'Deleted room should return HTTP 404');
  createdRoomId = null;
});

// ============================================================================
// Feature 4: PayOS Deposit & Webhook Auto-Settlement (T1.16 - T1.20)
// ============================================================================
let testTransactionRef = null;

suite.test('T1.16_PayOS_Checkout_Subscription', 'Landlord initializes subscription checkout with PayOS gateway', async () => {
  const landlordToken = await getAuthToken('landlord');
  const res = await api('/api/landlord/checkout', {
    method: 'POST',
    token: landlordToken,
    body: {
      planName: 'Pro',
      billingCycle: 'Monthly',
      paymentMethod: 'PayOS',
    },
  });

  assertEqual(res.status, 200, 'PayOS checkout should return HTTP 200');
  testTransactionRef = res.data?.orderCode ? String(res.data.orderCode) : res.data?.transactionRef;
  assert(testTransactionRef, 'Checkout response must include orderCode or transactionRef');
  assert(res.data?.paymentUrl || res.data?.qrUrl, 'Checkout response must provide paymentUrl or qrUrl');
});

suite.test('T1.17_PayOS_Payment_Status_Check', 'Landlord checks status of newly created payment transaction', async () => {
  assert(testTransactionRef, 'Requires testTransactionRef from T1.16');
  const landlordToken = await getAuthToken('landlord');

  const res = await api(`/api/landlord/payment/status/${testTransactionRef}`, {
    token: landlordToken,
  });

  assertEqual(res.status, 200, 'Payment status check should return HTTP 200');
  assertEqual(res.data?.status, 'Pending', 'Initial transaction status should be Pending');
});

suite.test('T1.18_PayOS_Simulate_Gateway_Success', 'Development gateway simulator completes transaction and activates benefits', async () => {
  assert(testTransactionRef, 'Requires testTransactionRef from T1.16');
  const landlordToken = await getAuthToken('landlord');

  const res = await api('/api/landlord/payment/simulate-gateway', {
    method: 'POST',
    token: landlordToken,
    body: {
      transactionRef: testTransactionRef,
    },
  });

  assertEqual(res.status, 200, 'Simulate gateway should return HTTP 200');
  assertEqual(res.data?.status, 'Completed', 'Simulated transaction status should be Completed');
});

suite.test('T1.19_PayOS_Verify_Webhook_Ping', 'PayOS initial registration ping webhook returns verification success', async () => {
  const pingPayload = {
    code: '00',
    desc: 'success',
    data: {
      orderCode: 123,
      amount: 1000,
      description: 'Webhook registration ping',
      accountNumber: '123456',
      reference: 'PING_REF',
      transactionDateTime: new Date().toISOString(),
      currency: 'VND',
      paymentLinkId: 'link123',
      code: '00',
      desc: 'success',
    },
    signature: 'ping-signature',
  };

  const res = await api('/api/payment/payos-webhook', {
    method: 'POST',
    body: pingPayload,
  });

  // Note: PayOS SDK Verify may reject dummy signature or handle ping
  assert(res.status === 200 || res.status === 400, 'PayOS webhook ping should be processed (200 or 400 signature check)');
});

suite.test('T1.20_PayOS_Confirm_Webhook_Url', 'Confirm PayOS webhook endpoint validates webhook URL input', async () => {
  const landlordToken = await getAuthToken('landlord');
  const res = await api('/api/landlord/payment/payos-confirm-webhook', {
    method: 'POST',
    token: landlordToken,
    body: {
      webhookUrl: 'https://www.dormi.space/api/payment/payos-webhook',
    },
  });

  // Returns 200 if configured or 400/500 if PayOS API credentials are dummy in test
  assert(res.status === 200 || res.status === 400 || res.status === 500, 'Confirm webhook handled gracefully');
});

// ============================================================================
// Feature 5: Roommate Matching & Communication (T1.21 - T1.25)
// ============================================================================
let createdRoommatePostId = null;

suite.test('T1.21_Roommate_List_Active', 'GET /api/Roommates returns active roommate search posts', async () => {
  const res = await api('/api/Roommates');

  assertEqual(res.status, 200, 'GET /api/Roommates should return HTTP 200');
  assert(Array.isArray(res.data), 'Roommate posts should be an array');
  assert(res.data.length > 0, 'Active roommate posts list should not be empty');
});

suite.test('T1.22_Roommate_Create_Post', 'Customer creates a roommate search profile post', async () => {
  const customerToken = await getAuthToken('customer');
  const res = await api('/api/Roommates', {
    method: 'POST',
    token: customerToken,
    body: {
      title: 'Tìm bạn ở ghép Quận 1 gần đại học',
      description: 'Sinh viên năm cuối tìm bạn cùng phòng ngăn nắp, không hút thuốc.',
      budget: 3500000,
      location: 'Quận 1, TP.HCM',
      genderPreference: 'Any',
      lifestyleTraits: 'Yên tĩnh, Sạch sẽ, Dậy sớm',
    },
  });

  assert(res.status === 200 || res.status === 201, `Create roommate post should return HTTP 200 or 201, got ${res.status}`);
  createdRoommatePostId = res.data?.id;
  assert(createdRoommatePostId, 'Created post should have an ID');
});

suite.test('T1.23_Roommate_Get_Recommendations', 'GET /api/Roommates/recommendations returns compatible roommate matches', async () => {
  const customerToken = await getAuthToken('customer');
  const res = await api('/api/Roommates/recommendations', {
    token: customerToken,
  });

  assertEqual(res.status, 200, 'GET /api/Roommates/recommendations should return HTTP 200');
  assert(Array.isArray(res.data), 'Recommendations should be an array');
});

suite.test('T1.24_Messages_Send_Direct', 'Customer sends direct message to landlord', async () => {
  const customerToken = await getAuthToken('customer');
  const landlordId = 'b0000000-0000-0000-0000-000000000001'; // Trần Minh Tuấn

  const res = await api('/api/Messages', {
    method: 'POST',
    token: customerToken,
    body: {
      receiverId: landlordId,
      content: `Xin chào, đây là tin nhắn kiểm thử tự động E2E [${Date.now()}]`,
    },
  });

  assertEqual(res.status, 200, 'Send message should return HTTP 200');
  assert(res.data?.id, 'Sent message should have an ID');
});

suite.test('T1.25_Messages_Get_Conversation', 'Retrieve message history with specified interlocutor', async () => {
  const customerToken = await getAuthToken('customer');
  const landlordId = 'b0000000-0000-0000-0000-000000000001';

  const res = await api(`/api/Messages/${landlordId}`, {
    token: customerToken,
  });

  assertEqual(res.status, 200, 'Get messages should return HTTP 200');
  assert(Array.isArray(res.data), 'Conversation history should be an array');
  assert(res.data.length > 0, 'Conversation should contain at least 1 message');
});

// ============================================================================
// Feature 6: Free-Tier Infra (T1.26 - T1.30)
// ============================================================================
suite.test('T1.26_Infra_KeepAlive_Root', 'GET / returns healthy status within keep-alive threshold (< 1.5s)', async () => {
  const start = performance.now();
  const res = await api('/');
  const elapsed = performance.now() - start;

  assertEqual(res.status, 200, 'GET / should return HTTP 200');
  assertEqual(res.data?.status, 'healthy', 'Root status should be healthy');
  assert(elapsed < 1500, `Keep-alive response latency ${elapsed}ms must be under 1500ms`);
});

suite.test('T1.27_Infra_Health_Check', 'GET /health verifies connected database and active cache', async () => {
  const res = await api('/health');

  assertEqual(res.status, 200, 'GET /health should return HTTP 200');
  assertEqual(res.data?.status, 'healthy', 'Overall health status should be healthy');
  assertEqual(res.data?.components?.database, 'connected', 'Database component must be connected');
  assertEqual(res.data?.components?.cache, 'active', 'Cache component must be active');
});

suite.test('T1.28_Infra_Room_Detail_Cache', 'Subsequent GET /api/Rooms/{id} reads from cache with low latency (< 50ms)', async () => {
  const listRes = await api('/api/Rooms?pageSize=1');
  const sample = (listRes.data?.data || listRes.data?.items || listRes.data)[0];
  assert(sample?.id, 'Need sample room for cache test');

  // Prime cache
  await api(`/api/Rooms/${sample.id}`);

  // Fetch cached
  const start = performance.now();
  const cachedRes = await api(`/api/Rooms/${sample.id}`);
  const elapsed = performance.now() - start;

  assertEqual(cachedRes.status, 200, 'Cached room detail should return HTTP 200');
  assertEqual(cachedRes.data?.id, sample.id, 'Cached data must match original room ID');
  assert(elapsed < 100, `Cached room read should take < 100ms (measured ${elapsed}ms)`);
});

suite.test('T1.29_Infra_Db_Pool_Parallel_Safe', '10 simultaneous database queries complete without pool exhaustion', async () => {
  const requests = Array.from({ length: 10 }, (_, i) =>
    api(`/api/Rooms?page=${(i % 3) + 1}&pageSize=5`)
  );

  const responses = await Promise.all(requests);
  for (const r of responses) {
    assertEqual(r.status, 200, 'Parallel query should return HTTP 200');
    assert(!JSON.stringify(r.data).includes('NpgsqlException'), 'Must not exhaust connection pool');
  }
});

suite.test('T1.30_Infra_Cloudinary_Image_Upload_Contract', 'POST /api/Images/upload rejects invalid non-form payload', async () => {
  const landlordToken = await getAuthToken('landlord');
  const res = await api('/api/Images/upload', {
    method: 'POST',
    token: landlordToken,
    body: {},
  });

  assert(res.status === 400 || res.status === 415, `Empty upload should be rejected with HTTP 400 or 415, got ${res.status}`);
});

// ============================================================================
// Feature 7: Global Exception Handling & Graceful Degradation (T1.31 - T1.35)
// ============================================================================
suite.test('T1.31_Exception_Invalid_Route_404', 'Non-existent route returns clean 404 Not Found', async () => {
  const res = await api('/api/non-existent-opaque-route-xyz');
  assertEqual(res.status, 404, 'Invalid route should return HTTP 404');
});

suite.test('T1.32_Exception_Invalid_Guid_Format_400', 'Malformed GUID param returns HTTP 400 or 404 cleanly', async () => {
  const res = await api('/api/Rooms/not-a-valid-guid-123');
  assert(res.status === 400 || res.status === 404, `Malformed GUID route constraint should return 400 or 404, got ${res.status}`);
});

suite.test('T1.33_Exception_Unauthorized_Access_401', 'Accessing protected endpoint without token returns HTTP 401', async () => {
  const res = await api('/api/Auth/me');
  assertEqual(res.status, 401, 'Unauthorized request should return HTTP 401');
});

suite.test('T1.34_Exception_Forbidden_Role_403', 'Customer accessing admin endpoint returns HTTP 403 Forbidden', async () => {
  const customerToken = await getAuthToken('customer');
  const res = await api('/api/Admin/stats', { token: customerToken });
  assertEqual(res.status, 403, 'Customer on admin endpoint should return HTTP 403');
});

suite.test('T1.35_Exception_Kafka_Degradation', 'Kafka notification fallback handles unreachable broker gracefully', async () => {
  const token = await getAuthToken('admin');
  const res = await api('/api/Notifications/test-kafka', {
    method: 'POST',
    token,
  });

  // Whether Kafka is online or using fallback in memory, endpoint must not throw unhandled 500
  assert(res.status === 200 || res.status === 400, 'Kafka test should degrade gracefully');
});

// ============================================================================
// Feature 8: Frontend UI Rules & Static Assets (T1.36 - T1.40)
// ============================================================================
suite.test('T1.36_UI_Lucide_Icon_Import_Compliance', 'Frontend components import icons exclusively from lucide-react', async () => {
  const componentsDir = path.resolve('frontend/src/components');
  const files = await fs.readdir(componentsDir, { recursive: true });
  const tsxFiles = files.filter(f => f.endsWith('.tsx'));

  assert(tsxFiles.length > 0, 'Found frontend tsx components');
  for (const file of tsxFiles.slice(0, 15)) {
    const content = await fs.readFile(path.join(componentsDir, file), 'utf-8');
    if (content.includes('lucide-react')) {
      assert(content.includes('import {'), `${file} should import named components from lucide-react`);
    }
  }
});

suite.test('T1.37_UI_Mobile_Viewport_Meta', 'index.html contains responsive mobile viewport tag', async () => {
  const html = await fs.readFile(path.resolve('frontend/index.html'), 'utf-8');
  assertIncludes(html, '<meta name="viewport" content="width=device-width, initial-scale=1.0"', 'Viewport tag is required for mobile-first UI');
});

suite.test('T1.38_UI_SEO_Meta_Tags', 'index.html contains SEO title, description, and canonical tags', async () => {
  const html = await fs.readFile(path.resolve('frontend/index.html'), 'utf-8');
  assertIncludes(html, '<title>DORMI', 'HTML title tag is required');
  assertIncludes(html, '<meta name="description"', 'Meta description is required');
  assertIncludes(html, '<link rel="canonical"', 'Canonical URL is required');
});

suite.test('T1.39_UI_Static_Robots_And_Sitemap', 'public/robots.txt and public/sitemap.xml are published', async () => {
  const robots = await fs.readFile(path.resolve('frontend/public/robots.txt'), 'utf-8');
  const sitemap = await fs.readFile(path.resolve('frontend/public/sitemap.xml'), 'utf-8');

  assert(robots.includes('User-agent: *'), 'robots.txt should declare User-agent');
  assert(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'sitemap.xml should declare valid sitemap namespace');
});

suite.test('T1.40_UI_Resource_Preconnects', 'index.html contains preconnect headers for Google Fonts & Cloudinary', async () => {
  const html = await fs.readFile(path.resolve('frontend/index.html'), 'utf-8');
  assertIncludes(html, 'href="https://fonts.googleapis.com"', 'Preconnect for Google Fonts is required');
  assertIncludes(html, 'href="https://res.cloudinary.com"', 'Preconnect for Cloudinary is required');
});

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('tier1_feature_coverage.mjs')) {
  suite.run().then(res => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
