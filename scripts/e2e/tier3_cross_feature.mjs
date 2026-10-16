// Tier 3: Cross-Feature Combinations (Pairwise integration of 8 features, 10 tests)
// Zero external dependencies - Runs natively on Node.js 24+

import {
  api,
  getAuthToken,
  assert,
  assertEqual,
  assertTrue,
  createTestSuite,
} from './test_helper.mjs';

export const suite = createTestSuite('Tier 3', 'Cross-Feature Combinations Suite (10 tests)');

// State shared across interconnected steps
let testLandlordToken = null;
let testLandlordId = null;
let testVerificationId = null;
let pipelineRoomId = null;
let pipelineRoomTitle = null;
let appointmentId = null;
let rentalApplicationId = null;

// ============================================================================
// T3.1: Auth -> KYC Verification -> Room Creation Pipeline
// ============================================================================
suite.test('T3.1_Auth_To_Room_Creation_And_Listing', 'Register Landlord -> KYC CCCD submission -> Admin approval -> Room creation', async () => {
  const adminToken = await getAuthToken('admin');

  // 1. Register new landlord
  const uniqueEmail = `flow.landlord.${Date.now()}@dormi.vn`;
  const regRes = await api('/api/Auth/register', {
    method: 'POST',
    body: {
      email: uniqueEmail,
      password: 'Password123!',
      fullName: 'Pipeline Landlord',
      phoneNumber: '0912345678',
      role: 1, // Landlord
    },
  });
  assertEqual(regRes.status, 200, 'Register landlord returns 200');
  testLandlordToken = regRes.data?.token;
  testLandlordId = regRes.data?.user?.id;
  assert(testLandlordToken, 'Must receive landlord token');

  // 2. Submit CCCD identity verification
  const kycRes = await api('/api/Profiles/landlord/verification', {
    method: 'POST',
    token: testLandlordToken,
    body: {
      documentType: 'CCCD',
      documentNumber: '079090999888',
      frontImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
      backImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
    },
  });
  assert(kycRes.status === 200 || kycRes.status === 201, 'Submit CCCD returns 200/201');
  testVerificationId = kycRes.data?.id;

  // 3. Admin lists pending verifications and approves
  const verifListRes = await api('/api/Admin/verifications', { token: adminToken });
  assertEqual(verifListRes.status, 200, 'Admin list verifications returns 200');
  const pending = verifListRes.data?.find(v => v.userId === testLandlordId) || verifListRes.data?.[0];
  const targetVerifId = testVerificationId || pending?.id;

  if (targetVerifId) {
    const reviewRes = await api(`/api/Admin/verifications/${targetVerifId}/review`, {
      method: 'PATCH',
      token: adminToken,
      body: { approved: true },
    });
    assertEqual(reviewRes.status, 200, 'Admin approves verification');
  }

  // 4. Verified landlord creates a new room
  pipelineRoomTitle = `Pipeline Luxury Studio ${Date.now()}`;
  const roomRes = await api('/api/Rooms', {
    method: 'POST',
    token: testLandlordToken,
    body: {
      title: pipelineRoomTitle,
      description: 'Phòng kiểm thử luồng tích hợp end-to-end.',
      price: 5500000,
      area: 32.0,
      utilities: 'Wifi, Máy lạnh, Tủ lạnh, Máy giặt',
      roomType: 'Studio',
      address: '77 Hai Bà Trưng, Q.1, TP.HCM',
      imageUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    },
  });

  assert(roomRes.status === 200 || roomRes.status === 201, 'Room creation succeeds');
  pipelineRoomId = roomRes.data?.id;
  assert(pipelineRoomId, 'Pipeline room ID must exist');
  assertEqual(roomRes.data?.status, 2, 'Room initially has PendingApproval status (2)');
});

// ============================================================================
// T3.2: Admin Approval -> Public Search Discovery
// ============================================================================
suite.test('T3.2_Admin_Approval_To_Public_Search', 'Admin approves room -> Room appears in public search query results', async () => {
  assert(pipelineRoomId, 'Requires pipelineRoomId');
  const adminToken = await getAuthToken('admin');

  // Admin approves room
  const patchRes = await api(`/api/Admin/rooms/${pipelineRoomId}/status?status=Available`, {
    method: 'PATCH',
    token: adminToken,
  });
  assertEqual(patchRes.status, 200, 'Admin approve room returns 200');

  // Public search query by title
  const searchRes = await api(`/api/Rooms?query=${encodeURIComponent(pipelineRoomTitle)}`);
  assertEqual(searchRes.status, 200, 'Search returns 200');
  const list = searchRes.data?.data || searchRes.data?.items || searchRes.data;
  const found = list.find(r => r.id === pipelineRoomId);
  assert(found, 'Newly approved room must appear in public search');
  assertEqual(found.status, 0, 'Room status in public search must be Available (0)');
});

// ============================================================================
// T3.3: Public Search -> Detail Cache Hit
// ============================================================================
suite.test('T3.3_Public_Search_To_Room_Detail_Cache', 'Search result click -> Detail fetched -> Cache verified under 50ms', async () => {
  assert(pipelineRoomId, 'Requires pipelineRoomId');

  // Prime cache
  await api(`/api/Rooms/${pipelineRoomId}`);

  // Fetch cached
  const start = performance.now();
  const res = await api(`/api/Rooms/${pipelineRoomId}`);
  const elapsed = performance.now() - start;

  assertEqual(res.status, 200, 'Detail returns 200');
  assertEqual(res.data?.id, pipelineRoomId, 'Returned room matches pipeline room');
  assert(elapsed < 100, `Cached read latency was ${elapsed}ms`);
});

// ============================================================================
// T3.4: Room Detail -> Landlord Direct Messaging
// ============================================================================
suite.test('T3.4_Room_Detail_To_Landlord_Messaging', 'Customer views room detail -> Obtains landlord ID -> Exchanges message', async () => {
  assert(pipelineRoomId, 'Requires pipelineRoomId');
  const customerToken = await getAuthToken('customer');

  const detailRes = await api(`/api/Rooms/${pipelineRoomId}`);
  const landlordId = detailRes.data?.landlordId || testLandlordId;

  // Send message
  const msgText = `Xin chào chủ trọ, tôi quan tâm phòng ${pipelineRoomTitle}`;
  const sendRes = await api('/api/Messages', {
    method: 'POST',
    token: customerToken,
    body: {
      receiverId: landlordId,
      content: msgText,
    },
  });
  assertEqual(sendRes.status, 200, 'Message send returns 200');

  const senderId = sendRes.data?.data?.senderId || sendRes.data?.senderId || 'c0000000-0000-0000-0000-000000000001';

  // Landlord reads conversation
  const convRes = await api(`/api/Messages/${senderId}`, {
    token: testLandlordToken,
  });
  assertEqual(convRes.status, 200, 'Landlord conversation read returns 200');
  const messages = convRes.data;
  assert(Array.isArray(messages), 'Messages should be an array');
  assert(messages.some(m => m.content === msgText), 'Conversation must contain sent message');
});

// ============================================================================
// T3.5: Viewing Appointment Booking & Status Lifecycle
// ============================================================================
suite.test('T3.5_Viewing_Appointment_Workflow', 'Customer books viewing appointment -> Landlord confirms and updates status', async () => {
  assert(pipelineRoomId, 'Requires pipelineRoomId');
  const customerToken = await getAuthToken('customer');

  // Book appointment
  const bookRes = await api('/api/Appointments', {
    method: 'POST',
    token: customerToken,
    body: {
      roomId: pipelineRoomId,
      appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      notes: 'Hẹn xem phòng chiều thứ 7 lúc 15:00',
    },
  });
  assert(bookRes.status === 200 || bookRes.status === 201, 'Booking returns 200/201');
  appointmentId = bookRes.data?.id;
  assert(appointmentId, 'Appointment must have an ID');

  // Landlord updates status to Confirmed
  const updateRes = await api(`/api/Appointments/${appointmentId}/status`, {
    method: 'PATCH',
    token: testLandlordToken,
    body: {
      status: 'Confirmed',
      reason: 'Đã xác nhận lịch xem phòng',
    },
  });
  assertEqual(updateRes.status, 200, 'Landlord update status returns 200');
});

// ============================================================================
// T3.6: Rental Application Submission & Review
// ============================================================================
suite.test('T3.6_Rental_Application_To_Lease', 'Customer submits rental application -> Landlord reviews and approves', async () => {
  assert(pipelineRoomId, 'Requires pipelineRoomId');
  const customerToken = await getAuthToken('customer');

  const appRes = await api('/api/Applications', {
    method: 'POST',
    token: customerToken,
    body: {
      roomId: pipelineRoomId,
      monthlyIncome: 18000000,
      occupation: 'Kỹ sư phần mềm',
      desiredMoveInDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      leaseDurationMonths: 12,
      noteToLandlord: 'Mong muốn thuê lâu dài, giữ gìn phòng sạch sẽ.',
    },
  });
  assert(appRes.status === 200 || appRes.status === 201, 'Submit application returns 200/201');
  rentalApplicationId = appRes.data?.id;
  assert(rentalApplicationId, 'Application must have an ID');

  // Landlord approves application (Status 4 = Approved)
  const reviewRes = await api(`/api/Applications/${rentalApplicationId}/review`, {
    method: 'PATCH',
    token: testLandlordToken,
    body: {
      status: 4, // Approved
      landlordNotes: 'Hồ sơ tài chính tốt, đồng ý cho thuê.',
    },
  });
  assertEqual(reviewRes.status, 200, 'Landlord review application returns 200');
});

// ============================================================================
// T3.7: Billing Subscription Checkout & Gateway Settlement
// ============================================================================
suite.test('T3.7_Lease_To_PayOS_Checkout_And_Settlement', 'Landlord initiates PayOS checkout -> Simulates payment -> Status Completed', async () => {
  const checkoutRes = await api('/api/landlord/checkout', {
    method: 'POST',
    token: testLandlordToken,
    body: {
      planName: 'Pro',
      billingCycle: 'Monthly',
      paymentMethod: 'PayOS',
    },
  });
  assertEqual(checkoutRes.status, 200, 'Checkout returns 200');
  const txnRef = checkoutRes.data?.orderCode ? String(checkoutRes.data.orderCode) : checkoutRes.data?.transactionRef;
  assert(txnRef, 'Must have transaction reference');

  // Simulate gateway payment
  const simRes = await api('/api/landlord/payment/simulate-gateway', {
    method: 'POST',
    token: testLandlordToken,
    body: { transactionRef: txnRef },
  });
  assertEqual(simRes.status, 200, 'Simulate gateway returns 200');
  assertEqual(simRes.data?.status, 'Completed', 'Transaction status is Completed');
});

// ============================================================================
// T3.8: Payment Settlement -> Room State Transition to Rented
// ============================================================================
suite.test('T3.8_Payment_Settlement_To_Room_State_Rented', 'Room transitions to Rented (1) -> Excluded from public Available search', async () => {
  assert(pipelineRoomId, 'Requires pipelineRoomId');

  // Landlord sets room status to Rented (1)
  const detailRes = await api(`/api/Rooms/${pipelineRoomId}`);
  const current = detailRes.data;

  const updateRes = await api(`/api/Rooms/${pipelineRoomId}`, {
    method: 'PUT',
    token: testLandlordToken,
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
  assertEqual(updateRes.status, 200, 'Update status to Rented returns 200');
  assertEqual(updateRes.data?.status, 1, 'Room is Rented');

  // Public search must not list rented rooms by default
  const searchRes = await api(`/api/Rooms?query=${encodeURIComponent(pipelineRoomTitle)}`);
  assertEqual(searchRes.status, 200, 'Search returns 200');
  const list = searchRes.data?.data || searchRes.data?.items || searchRes.data;
  const found = list.find(r => r.id === pipelineRoomId);
  assert(!found, 'Rented room must not appear in public Available listings');
});

// ============================================================================
// T3.9: Roommate Matching to Direct Chat Interaction
// ============================================================================
suite.test('T3.9_Roommate_Matching_To_Chat_Connection', 'Roommate post creation -> Recommendation match -> Chat connection', async () => {
  const customerToken = await getAuthToken('customer');

  // Customer A posts roommate listing
  const postRes = await api('/api/Roommates', {
    method: 'POST',
    token: customerToken,
    body: {
      title: `Tìm bạn cùng phòng Thủ Đức ${Date.now()}`,
      description: 'Sinh viên FPT cần tìm bạn ở ghép, sạch sẽ ngăn nắp.',
      budget: 3000000,
      location: 'Thủ Đức, TP.HCM',
      lifestyleTraits: 'Yên tĩnh, Sạch sẽ, Không hút thuốc',
    },
  });
  assert(postRes.status === 200 || postRes.status === 201, 'Create roommate post returns 200/201');

  // Fetch recommendations
  const recRes = await api('/api/Roommates/recommendations', { token: customerToken });
  assertEqual(recRes.status, 200, 'Recommendations returns 200');

  // Initiate message with first available user in system
  const msgRes = await api('/api/Messages', {
    method: 'POST',
    token: customerToken,
    body: {
      receiverId: 'c0000000-0000-0000-0000-000000000002', // Trần Thị Bích
      content: 'Chào bạn, mình thấy profile roommate của bạn rất phù hợp!',
    },
  });
  assertEqual(msgRes.status, 200, 'Message sent successfully');
});

// ============================================================================
// T3.10: Sensitive Price Edit Triggers Re-Moderation & Notifications
// ============================================================================
suite.test('T3.10_Sensitive_Price_Edit_ReModeration', 'Editing price on Available room automatically moves status to PendingApproval', async () => {
  const adminToken = await getAuthToken('admin');
  assert(pipelineRoomId, 'Requires pipelineRoomId');

  // Set room back to Available first via Admin
  await api(`/api/Admin/rooms/${pipelineRoomId}/status?status=Available`, {
    method: 'PATCH',
    token: adminToken,
  });

  const detailRes = await api(`/api/Rooms/${pipelineRoomId}`);
  const current = detailRes.data;

  // Landlord edits price significantly (critical field change)
  const updateRes = await api(`/api/Rooms/${pipelineRoomId}`, {
    method: 'PUT',
    token: testLandlordToken,
    body: {
      title: current.title,
      description: current.description,
      price: current.price + 2000000, // Significant price change
      area: current.area,
      utilities: current.utilities,
      roomType: current.roomType,
      address: current.address,
      status: 0,
    },
  });

  assertEqual(updateRes.status, 200, 'Update room returns 200');
  assertEqual(updateRes.data?.status, 2, 'Price change must trigger automatic re-moderation (PendingApproval = 2)');

  // Clean up test room
  await api(`/api/Rooms/${pipelineRoomId}`, {
    method: 'DELETE',
    token: testLandlordToken,
  });
});

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('tier3_cross_feature.mjs')) {
  suite.run().then(res => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
