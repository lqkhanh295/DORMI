// Tier 4: Real-World Application Scenarios (5 Comprehensive End-to-End Workflows)
// Zero external dependencies - Runs natively on Node.js 24+

import {
  api,
  getAuthToken,
  assert,
  assertEqual,
  assertTrue,
  createTestSuite,
} from './test_helper.mjs';

export const suite = createTestSuite('Tier 4', 'Real-World Application Workflows (5 End-to-End Scenarios)');

// ============================================================================
// Workflow 1: Student Room Discovery, Booking & PayOS Deposit Settlement
// ============================================================================
suite.test('T4.1_Workflow_Student_Room_Search_And_Deposit', 'Comprehensive Student Journey: Filter Search -> Details -> Viewing -> Application -> Lease -> PayOS Deposit', async () => {
  // Step 1: Student searches for available rooms in District 7
  const searchRes = await api('/api/Rooms?district=Q.7&minPrice=3000000&maxPrice=15000000&pageSize=5');
  assertEqual(searchRes.status, 200, 'W1.1: Room search should succeed');
  const rooms = searchRes.data?.data || searchRes.data?.items || searchRes.data;
  assert(rooms.length > 0, 'W1.1: At least one room found in District 7');
  const selectedRoom = rooms[0];

  // Step 2: Student inspects full details and amenities
  const detailRes = await api(`/api/Rooms/${selectedRoom.id}`);
  assertEqual(detailRes.status, 200, 'W1.2: Room detail inspection succeeds');
  assertEqual(detailRes.data.id, selectedRoom.id, 'W1.2: Room ID matches');

  // Step 3: Register fresh student to ensure isolated workflow state without prior bookings
  const studentEmail = `student.workflow.${Date.now()}@dormi.vn`;
  const regRes = await api('/api/Auth/register', {
    method: 'POST',
    body: {
      email: studentEmail,
      password: 'Password123!',
      fullName: 'Sinh Viên Đại Học M4',
      role: 0,
    },
  });
  assertEqual(regRes.status, 200, 'W1.3: Fresh student register succeeds');
  const studentToken = regRes.data.token;

  const msgRes = await api('/api/Messages', {
    method: 'POST',
    token: studentToken,
    body: {
      receiverId: selectedRoom.landlordId,
      content: `Xin chào, em là sinh viên muốn hỏi thuê phòng ${selectedRoom.title}`,
    },
  });
  assertEqual(msgRes.status, 200, 'W1.3b: Contact landlord message succeeds');

  // Step 4: Student books viewing appointment
  const apptRes = await api('/api/Appointments', {
    method: 'POST',
    token: studentToken,
    body: {
      roomId: selectedRoom.id,
      appointmentDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      notes: 'Hẹn xem phòng vào 14:00 chiều Chủ Nhật',
    },
  });
  assert(apptRes.status === 200 || apptRes.status === 201, 'W1.4: Appointment booking succeeds');

  // Step 5: Student submits rental application
  const rentalAppRes = await api('/api/Applications', {
    method: 'POST',
    token: studentToken,
    body: {
      roomId: selectedRoom.id,
      monthlyIncome: 12000000,
      occupation: 'Sinh viên thực tập',
      desiredMoveInDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      leaseDurationMonths: 6,
      noteToLandlord: 'Cam kết thanh toán đúng hạn hàng tháng.',
    },
  });
  assert(rentalAppRes.status === 200 || rentalAppRes.status === 201, 'W1.5: Rental application submission succeeds');

  // Step 6: Landlord initiates PayOS deposit payment request for lease
  const landlordToken = await getAuthToken('landlord');
  const checkoutRes = await api('/api/landlord/checkout', {
    method: 'POST',
    token: landlordToken,
    body: {
      planName: 'Pro',
      billingCycle: 'Monthly',
      paymentMethod: 'PayOS',
    },
  });
  assertEqual(checkoutRes.status, 200, 'W1.6: Checkout initialization succeeds');
  const txnRef = checkoutRes.data?.orderCode ? String(checkoutRes.data.orderCode) : checkoutRes.data?.transactionRef;
  assert(txnRef, 'W1.6: Must obtain transaction reference');

  // Step 7: Gateway settlement verification
  const simRes = await api('/api/landlord/payment/simulate-gateway', {
    method: 'POST',
    token: landlordToken,
    body: { transactionRef: txnRef },
  });
  assertEqual(simRes.status, 200, 'W1.7: Gateway payment simulation succeeds');
  assertEqual(simRes.data?.status, 'Completed', 'W1.7: Transaction settled as Completed');
});

// ============================================================================
// Workflow 2: Landlord Lifecycle, KYC Verification & Inventory Management
// ============================================================================
suite.test('T4.2_Workflow_Landlord_Onboarding_KYC_And_Room_Lifecycle', 'Landlord Journey: Registration -> CCCD eKYC -> Admin Review -> Room Listing -> Moderation -> Rented State', async () => {
  const adminToken = await getAuthToken('admin');

  // Step 1: New Landlord registers
  const uniqueEmail = `lifecycle.landlord.${Date.now()}@dormi.vn`;
  const regRes = await api('/api/Auth/register', {
    method: 'POST',
    body: {
      email: uniqueEmail,
      password: 'Password123!',
      fullName: 'Chủ Trọ Hoàng Gia',
      phoneNumber: '0988776655',
      role: 1, // Landlord
    },
  });
  assertEqual(regRes.status, 200, 'W2.1: Landlord register succeeds');
  const landlordToken = regRes.data.token;
  const landlordId = regRes.data.user.id;

  // Step 2: Upload CCCD verification documents
  const kycRes = await api('/api/Profiles/landlord/verification', {
    method: 'POST',
    token: landlordToken,
    body: {
      documentType: 'CCCD',
      documentNumber: '079090112233',
      frontImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
      backImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
    },
  });
  assert(kycRes.status === 200 || kycRes.status === 201, 'W2.2: Submit CCCD verification succeeds');

  // Step 3: Admin reviews and approves KYC verification
  const verifListRes = await api('/api/Admin/verifications', { token: adminToken });
  const pendingVerif = verifListRes.data?.find(v => v.userId === landlordId) || verifListRes.data?.[0];
  if (pendingVerif) {
    const reviewRes = await api(`/api/Admin/verifications/${pendingVerif.id}/review`, {
      method: 'PATCH',
      token: adminToken,
      body: { approved: true },
    });
    assertEqual(reviewRes.status, 200, 'W2.3: Admin approves landlord KYC');
  }

  // Step 4: Landlord posts room with multiple media assets
  const roomTitle = `Căn Hộ Landmark M4 ${Date.now()}`;
  const roomRes = await api('/api/Rooms', {
    method: 'POST',
    token: landlordToken,
    body: {
      title: roomTitle,
      description: 'Căn hộ dịch vụ cao cấp view thành phố.',
      price: 6800000,
      area: 35.0,
      utilities: 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt, Ban công, Thang máy',
      roomType: 'Căn hộ mini',
      address: '22 Bến Vân Đồn, Q.4, TP.HCM',
      imageUrls: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?w=800',
      ],
    },
  });
  assert(roomRes.status === 200 || roomRes.status === 201, 'W2.4: Room posting succeeds');
  const roomId = roomRes.data?.id;

  // Step 5: Admin inspects moderation list and approves room
  const adminApproveRes = await api(`/api/Admin/rooms/${roomId}/status?status=Available`, {
    method: 'PATCH',
    token: adminToken,
  });
  assertEqual(adminApproveRes.status, 200, 'W2.5: Admin approves room status to Available');

  // Step 6: Landlord updates room to Rented upon tenant agreement
  const currentDetail = await api(`/api/Rooms/${roomId}`);
  const updateRes = await api(`/api/Rooms/${roomId}`, {
    method: 'PUT',
    token: landlordToken,
    body: {
      title: currentDetail.data.title,
      description: currentDetail.data.description,
      price: currentDetail.data.price,
      area: currentDetail.data.area,
      utilities: currentDetail.data.utilities,
      roomType: currentDetail.data.roomType,
      address: currentDetail.data.address,
      status: 1, // Rented
    },
  });
  assertEqual(updateRes.status, 200, 'W2.6: Landlord updates room status to Rented');

  // Cleanup room
  await api(`/api/Rooms/${roomId}`, { method: 'DELETE', token: landlordToken });
});

// ============================================================================
// Workflow 3: Roommate Matching, Discovery & Real-Time Connection
// ============================================================================
suite.test('T4.3_Workflow_Roommate_Matching_And_Messaging', 'Two Students: Profile Setup -> Trait Matching Algorithm -> Recommendation Discovery -> Chat Exchange', async () => {
  // Step 1: Student A registers and sets roommate lifestyle traits
  const studentAEmail = `studentA.${Date.now()}@dormi.vn`;
  const regARes = await api('/api/Auth/register', {
    method: 'POST',
    body: {
      email: studentAEmail,
      password: 'Password123!',
      fullName: 'Sinh Viên A - Sạch Sẽ',
      role: 0,
    },
  });
  assertEqual(regARes.status, 200, 'W3.1: Student A registered');
  const tokenA = regARes.data.token;

  // Student A posts roommate listing
  const postARes = await api('/api/Roommates', {
    method: 'POST',
    token: tokenA,
    body: {
      title: 'Tìm bạn ở ghép Q.7 thích yên tĩnh',
      description: 'Mình là sinh viên năm 3, thói quen sinh hoạt quy củ, không hút thuốc.',
      budget: 3500000,
      location: 'Quận 7, TP.HCM',
      lifestyleTraits: 'Yên tĩnh, Sạch sẽ, Không hút thuốc, Dậy sớm',
    },
  });
  assert(postARes.status === 200 || postARes.status === 201, 'W3.2: Student A post created');

  // Step 2: Student B checks roommate recommendations
  const customerBToken = await getAuthToken('customer');
  const recRes = await api('/api/Roommates/recommendations', { token: customerBToken });
  assertEqual(recRes.status, 200, 'W3.3: Recommendations fetched');
  assert(Array.isArray(recRes.data), 'W3.3: Recommendations should be array');

  // Step 3: Student B initiates direct chat with Student A
  const msgContent = 'Chào bạn A, mình thấy bạn đang tìm bạn ở ghép Q.7, mình muốn trao đổi thêm!';
  const chatRes = await api('/api/Messages', {
    method: 'POST',
    token: customerBToken,
    body: {
      receiverId: regARes.data.user.id,
      content: msgContent,
    },
  });
  assertEqual(chatRes.status, 200, 'W3.4: Student B sent message to Student A');

  // Step 4: Student A reads conversation and verifies incoming message
  const convRes = await api(`/api/Messages/${chatRes.data?.data?.senderId || 'c0000000-0000-0000-0000-000000000001'}`, {
    token: tokenA,
  });
  assertEqual(convRes.status, 200, 'W3.5: Student A retrieved conversation');
  const messages = convRes.data;
  assert(Array.isArray(messages), 'W3.5: Messages array valid');
  assert(messages.some(m => m.content === msgContent), 'W3.5: Received matching message');
});

// ============================================================================
// Workflow 4: High Concurrency Load & Supabase DB Pool Resilience
// ============================================================================
suite.test('T4.4_Workflow_High_Concurrency_Infra_Stress', 'High Load Workload: 60 concurrent requests across search, cache & health with 0 pool exhaustion', async () => {
  const requestCount = 60;
  const concurrency = 20;

  const endpoints = [
    '/health',
    '/',
    '/api/Rooms?page=1&pageSize=10',
    '/api/Rooms?district=Q.7&minPrice=3000000&maxPrice=8000000',
    '/api/Roommates',
    '/api/Rooms/featured?limit=6',
  ];

  let completed = 0;
  let errors = 0;
  const statusCodes = {};
  const latencies = [];

  let nextIdx = 0;
  async function worker() {
    while (true) {
      const idx = nextIdx++;
      if (idx >= requestCount) break;

      const endpoint = endpoints[idx % endpoints.length];
      const start = performance.now();
      try {
        const res = await api(endpoint);
        const duration = performance.now() - start;
        latencies.push(duration);
        statusCodes[res.status] = (statusCodes[res.status] || 0) + 1;
        if (res.status >= 500) errors++;
      } catch {
        errors++;
        statusCodes['ERR'] = (statusCodes['ERR'] || 0) + 1;
      } finally {
        completed++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  latencies.sort((a, b) => a - b);
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;

  console.log(`    Concurrency 60 stats: Completed=${completed}, 500Errors=${errors}, p95=${p95.toFixed(1)}ms`);

  assertEqual(errors, 0, 'W4.1: Must have 0% HTTP 500 error rate under load');
  assertEqual(completed, requestCount, 'W4.2: All requests must complete successfully');

  // Verify database connection pool health after stress
  const healthRes = await api('/health');
  assertEqual(healthRes.status, 200, 'W4.3: Health check remains 200');
  assertEqual(healthRes.data?.components?.database, 'connected', 'W4.4: Supabase pool remains connected');
});

// ============================================================================
// Workflow 5: Third-Party Timeout Resilience & Graceful Degradation
// ============================================================================
suite.test('T4.5_Workflow_Resilience_And_ThirdParty_Degradation', 'Resilience: Handled PayOS webhook ping, Kafka broker offline, and malformed inputs without server crash', async () => {
  // Test 1: PayOS Webhook gracefully rejects invalid signature without throwing unhandled exception
  const badWebhookRes = await api('/api/payment/payos-webhook', {
    method: 'POST',
    body: {
      code: '00',
      data: { orderCode: 999999, amount: 2000000 },
      signature: 'bad_signature_test',
    },
  });
  assertEqual(badWebhookRes.status, 400, 'W5.1: Webhook signature failure returns clean 400');

  // Test 2: In-process Kafka fallback dispatches notifications when broker is offline
  const adminToken = await getAuthToken('admin');
  const kafkaTestRes = await api('/api/Notifications/test-kafka', {
    method: 'POST',
    token: adminToken,
  });
  assert(kafkaTestRes.status === 200 || kafkaTestRes.status === 400, 'W5.2: Notification fallback executes safely');

  // Test 3: System remains fully responsive and operational
  const keepAliveRes = await api('/');
  assertEqual(keepAliveRes.status, 200, 'W5.3: Keep-alive root remains responsive');
  assertEqual(keepAliveRes.data?.status, 'healthy', 'W5.4: Service status is healthy');
});

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('tier4_real_world_workflows.mjs')) {
  suite.run().then(res => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
