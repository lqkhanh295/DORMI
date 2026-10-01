const fs = require('fs');
const path = require('path');

const JIRA_URL = 'https://lqkhanh292005.atlassian.net';
const EMAIL = 'lqkhanh292005@gmail.com';
const API_TOKEN = 'ATATT3xFfGF0rAPnt7JeCbuDHIbpUAn9CdU5D-bsAQeWZExmqhBjGTgppMF2I8DVtf74TPbByVwj7ueJu5iPgDcgODBfqCS-1-QgCS-Hnem15J2VVd01AMMd3puBRE6_kA3XiEGD-2uluNzC9ahvsJLorlIfO7-q5oN6IpzKujHS5vFNPCpAeGA=361C5AD6';
const authHeader = 'Basic ' + Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

const screenshotDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\aacf0631-9c6b-473a-af30-d57a28810f31\\screenshots';

const ticketsData = [
  {
    key: 'DOR-9',
    summary: '[DORMI-BUG-01] [Search] Tham số bộ lọc từ Landing Page bị bỏ qua khi chuyển sang Search Results',
    screenshot: 'dor_9_real.png',
    env: 'Web App (localhost:5173), Public Flow, Component: SearchResults.tsx, HeroSection.tsx',
    str: [
      'Truy cập trang chủ hệ thống tại http://localhost:5173/',
      'Tại thanh tìm kiếm nhanh (HeroSection), chọn bộ lọc: Khu vực = "Quận 10", Mức giá = "3 - 5 triệu"',
      'Nhấn nút "Tìm phòng ngay"',
      'Quan sát thanh địa chỉ URL và danh sách kết quả hiển thị trên trang Search Results'
    ],
    ar: 'URL nhận đầy đủ query string "/search?district=Quận+10&price=3mTo5m", tuy nhiên màn hình hiển thị toàn bộ 19 phòng trọ trong hệ thống (bao gồm cả phòng ở Cầu Giấy, Đống Đa, Tân Bình và ngoài tầm giá). Các chip/pill bộ lọc quận và giá không được chọn/active.',
    er: 'Màn hình Search Results phải tự động đọc và đồng bộ URL query params (useSearchParams), kích hoạt chip filter tương ứng và chỉ render danh sách phòng trọ thỏa mãn cả 2 tiêu chí Quận 10 & Giá từ 3 - 5 triệu.',
    evidence: 'Ảnh chụp màn hình thực tế dor_9_real.png đính kèm trong ticket.',
    rootCause: 'SearchResults.tsx chỉ khởi tạo state bộ lọc rỗng ban đầu, không có useEffect lắng nghe hoặc parse window.location.search / useSearchParams vào filter state.',
    fix: 'Thêm hook đọc params từ useSearchParams() trong useEffect khởi tạo của SearchResults.tsx để parse district và price vào searchCriteria.'
  },
  {
    key: 'DOR-10',
    summary: '[DORMI-BUG-02] [Landlord] Form đăng tin phòng gửi Base64 Data URI dung lượng lớn khi upload ảnh thất bại',
    screenshot: 'dor_10_real.png',
    env: 'Web App (localhost:5173), Landlord Flow (/landlord/create), Component: SmartListingForm.tsx, Backend: RoomController.cs',
    str: [
      'Đăng nhập tài khoản Chủ trọ (landlord@dormi.vn / Password123!)',
      'Truy cập trang Đăng tin phòng mới tại http://localhost:5173/landlord/create',
      'Tại khu vực tải ảnh phòng trọ, chọn 3-5 hình ảnh chất lượng cao (hoặc ngắt mạng / giả lập lỗi tải ảnh 500)',
      'Điền đầy đủ các thông tin bắt buộc (Tiêu đề, Địa chỉ, Giá thuê, Diện tích)',
      'Nhấn nút "Đăng tin ngay" và mở tab DevTools Network kiểm tra payload POST /api/v1/rooms'
    ],
    ar: 'Khi quá trình upload ảnh lên server/CDN gặp sự cố, client tự động kích hoạt logic fallback FileReader.readAsDataURL(), chuyển toàn bộ ảnh sang chuỗi base64 khổng lồ rồi gửi thẳng trong request body. Request bị server từ chối 413 Payload Too Large, trình duyệt bị lag/treo.',
    er: 'Khi upload ảnh thất bại, hệ thống phải hiển thị cảnh báo lỗi trực quan trên UI ("Tải ảnh thất bại, vui lòng thử lại"), khóa nút submit và TUYỆT ĐỐI KHÔNG fallback gửi base64 data URI vào database.',
    evidence: 'Ảnh chụp màn hình thực tế dor_10_real.png đính kèm trong ticket.',
    rootCause: 'SmartListingForm.tsx sử dụng fallback FileReader.readAsDataURL() khi API upload file trả về lỗi thay vì catch error và thông báo cho người dùng.',
    fix: 'Loại bỏ logic fallback base64, bắt buộc ảnh phải upload thành công nhận URL từ backend trước khi cho phép submit form.'
  },
  {
    key: 'DOR-11',
    summary: '[DORMI-BUG-03] [Pricing] Nút "Xác nhận đã thanh toán" trả về 403 Forbidden trên Production',
    screenshot: 'dor_11_real.png',
    env: 'Web App (localhost:5173), Landlord Flow (/landlord/pricing), Component: PricingCheckout.tsx, Backend: PaymentController.cs',
    str: [
      'Đăng nhập tài khoản Chủ trọ (landlord@dormi.vn / Password123!)',
      'Truy cập trang Nâng cấp gói dịch vụ tại http://localhost:5173/landlord/pricing',
      'Tại bảng giá dịch vụ, bấm nút "Nâng cấp gói" hoặc "Đăng ký ngay" của gói VIP',
      'Hộp thoại (Modal) thanh toán mã QR hiện ra kèm nút "Xác nhận đã thanh toán"',
      'Nhấn nút "Xác nhận đã thanh toán" trên môi trường Production/Staging'
    ],
    ar: 'Nút bấm gọi trực tiếp endpoint "/api/v1/payments/simulate-gateway". Trên môi trường Staging/Production, endpoint này đã bị khóa (chỉ cho phép DEV) dẫn tới trả về lỗi 403 Forbidden. Người dùng bị kẹt tại modal, giao dịch không thể hoàn tất.',
    er: 'Trên môi trường Production, người dùng phải được điều hướng sang cổng thanh toán chính thức (VNPay, VietQR, MoMo) hoặc hiển thị hướng dẫn chờ webhook tự động từ ngân hàng, ẩn hoàn toàn nút giả lập simulate của DEV.',
    evidence: 'Ảnh chụp màn hình thực tế dor_11_real.png đính kèm trong ticket.',
    rootCause: 'PricingCheckout.tsx hardcode hành vi gọi simulate-gateway endpoint cho nút xác nhận thay vì tích hợp flow webhook ngân hàng thực tế.',
    fix: 'Ẩn nút test simulate khi không ở môi trường DEV (import.meta.env.DEV) và tích hợp cơ chế polling/SignalR lắng nghe webhook thanh toán từ backend.'
  },
  {
    key: 'DOR-12',
    summary: '[DORMI-BUG-04] [Tenant Chat] Chat Center hiển thị cố định liên hệ rác (Ghost Landlord ID)',
    screenshot: 'dor_12_real.png',
    env: 'Web App (localhost:5173), Tenant Flow (/tenant/chat), Component: TenantChatCenter.tsx',
    str: [
      'Đăng nhập bằng tài khoản Khách thuê mới tinh (chưa từng nhắn tin với ai)',
      'Điều hướng vào trung tâm tin nhắn tại http://localhost:5173/tenant/chat',
      'Quan sát danh sách người liên hệ tại cột bên trái',
      'Bấm vào cuộc trò chuyện mặc định và thử gửi tin nhắn'
    ],
    ar: 'Danh sách chat luôn luôn xuất hiện cố định một liên hệ giả "Trần Minh Tuấn" với UUID hardcode "11111111-1111-1111-1111-111111111111". Khi bấm gửi tin nhắn, SignalR hub không tìm thấy user hoặc tin nhắn bị thất lạc.',
    er: 'Nếu người dùng chưa có cuộc trò chuyện nào, hệ thống phải hiển thị trạng thái trống (Empty State) với thông điệp "Chưa có cuộc trò chuyện nào". Danh sách hội thoại phải được tải động từ API backend theo đúng tài khoản đăng nhập.',
    evidence: 'Ảnh chụp màn hình thực tế dor_12_real.png đính kèm trong ticket.',
    rootCause: 'TenantChatCenter.tsx gán cứng mảng state ban đầu chứa mock contact UUID 11111111-1111-1111-1111-111111111111 thay vì fetch danh sách từ GET /api/v1/messages/conversations.',
    fix: 'Xóa bỏ mock data hardcode, gọi API lấy danh sách hội thoại thực tế và xử lý Empty State khi mảng rỗng.'
  },
  {
    key: 'DOR-13',
    summary: '[DORMI-BUG-05] [Room Detail] Màn hình chi tiết phòng hiển thị giá trị dummy và 0đ khi ID không tồn tại',
    screenshot: 'dor_13_real.png',
    env: 'Web App (localhost:5173), Public Flow (/room/:id), Component: RoomDetail.tsx',
    str: [
      'Mở trình duyệt và truy cập trực tiếp một UUID không tồn tại trong hệ thống: http://localhost:5173/room/00000000-0000-0000-0000-000000000000',
      'Quan sát giao diện hiển thị'
    ],
    ar: 'Giao diện không chuyển hướng sang trang 404 cũng không hiển thị thông báo lỗi, mà render template cứng: Tiêu đề "Studio Hiện Đại", Mức giá "0đ/tháng", ảnh vỡ và các thông số tiện ích trống rỗng gây khó hiểu cho người dùng.',
    er: 'Khi API trả về 404 Not Found hoặc không tìm thấy phòng, hệ thống phải hiển thị màn hình 404 thân thiện ("Không tìm thấy phòng trọ bạn yêu cầu") kèm nút "Quay lại danh sách tìm kiếm".',
    evidence: 'Ảnh chụp màn hình thực tế dor_13_real.png đính kèm trong ticket.',
    rootCause: 'RoomDetail.tsx khởi tạo state ban đầu với object dummy rỗng và không xử lý chuyển hướng hoặc render NotFoundView khi API getRoomById thất bại.',
    fix: 'Thêm kiểm tra trạng thái error hoặc roomNotFound, render trang thông báo lỗi 404 chuẩn.'
  },
  {
    key: 'DOR-14',
    summary: '[DORMI-BUG-06] [Roommate] Danh sách thẻ tìm bạn cùng phòng bị hardcode tuổi 22 cho tất cả người dùng',
    screenshot: 'dor_14_real.png',
    env: 'Web App (localhost:5173), Tenant Flow (/tenant/match), Component: RoommateMatcher.tsx',
    str: [
      'Đăng nhập tài khoản Khách thuê (tenant@dormi.vn / Password123!)',
      'Truy cập tính năng Tìm bạn cùng phòng tại http://localhost:5173/tenant/match',
      'Quan sát thông tin hiển thị trên từng thẻ roommate (Roommate Card)'
    ],
    ar: 'Tất cả các thẻ roommate đều hiển thị cố định số tuổi là 22 (ví dụ: "Lê Văn A, 22 tuổi", "Nguyễn Thị B, 22 tuổi"), bất kể thông tin năm sinh trong hồ sơ người dùng là bao nhiêu.',
    er: 'Số tuổi hiển thị phải được tính toán tự động dựa trên ngày sinh (dateOfBirth) thực tế của người dùng. Nếu chưa cập nhật ngày sinh, hiển thị "Chưa cập nhật" hoặc ẩn badge tuổi.',
    evidence: 'Ảnh chụp màn hình thực tế dor_14_real.png đính kèm trong ticket.',
    rootCause: 'RoommateMatcher.tsx hardcode template string `${item.user?.name || "Người dùng"}, 22` thay vì tính tuổi từ dateOfBirth.',
    fix: 'Tạo hàm tiện ích calculateAge(dateOfBirth) và hiển thị kết quả tính toán động.'
  },
  {
    key: 'DOR-15',
    summary: '[DORMI-BUG-07] [Appointment] Date picker cho phép người dùng đặt lịch xem phòng / ngày dọn vào trong quá khứ',
    screenshot: 'dor_15_real.png',
    env: 'Web App (localhost:5173), Tenant Flow (/tenant/post), Component: CreateRoommatePost.tsx, BookingAppointmentModal.tsx',
    str: [
      'Đăng nhập tài khoản Khách thuê',
      'Truy cập trang Đăng tin tìm bạn cùng phòng tại http://localhost:5173/tenant/post (hoặc modal Đặt lịch hẹn xem phòng)',
      'Tại ô chọn ngày "Ngày có thể dọn vào" (Move-in Date) hoặc "Ngày hẹn xem phòng"',
      'Mở lịch chọn một ngày trong quá khứ (ví dụ: tháng trước hoặc năm trước)',
      'Nhấn nút gửi form'
    ],
    ar: 'Thẻ input type="date" không có thuộc tính min, cho phép người dùng chọn bất kỳ ngày nào trong quá khứ và submit form thành công, tạo dữ liệu vô lý trong hệ thống.',
    er: 'Input date phải được đặt thuộc tính min bằng ngày hiện tại (min={new Date().toISOString().split("T")[0]}). Form validation phải chặn submit nếu người dùng cố tình nhập ngày trong quá khứ.',
    evidence: 'Ảnh chụp màn hình thực tế dor_15_real.png đính kèm trong ticket.',
    rootCause: 'Thiếu thuộc tính min trên input date và thiếu validation ngày hẹn tại client schema.',
    fix: 'Thêm min={today} vào input HTML và bổ sung rule .min(new Date()) trong schema validation.'
  },
  {
    key: 'DOR-16',
    summary: '[DORMI-BUG-08] [Admin] Dashboard thống kê phòng chờ duyệt bị gán cứng magic number 2',
    screenshot: 'dor_16_real.png',
    env: 'Web App (localhost:5173), Admin Flow (/admin), Component: AdminDashboard.tsx',
    str: [
      'Đăng nhập tài khoản Quản trị viên (admin@dormi.vn / Password123!)',
      'Truy cập trang Quản trị Admin tại http://localhost:5173/admin',
      'Kiểm tra số liệu thống kê tại thẻ "Phòng chờ duyệt"'
    ],
    ar: 'Frontend lọc danh sách phòng với điều kiện so sánh cứng "room.status === 2" thay vì sử dụng constant RoomStatus.PendingApproval. Nếu backend thay đổi giá trị enum hoặc định dạng trạng thái, thống kê sẽ sai lệch hoàn toàn.',
    er: 'Thẻ thống kê phải gọi API tổng hợp từ backend (/api/v1/admin/stats) hoặc sử dụng hằng số Enum đồng bộ với backend để tính toán chính xác.',
    evidence: 'Ảnh chụp màn hình thực tế dor_16_real.png đính kèm trong ticket.',
    rootCause: 'Sử dụng magic number 2 trong biểu thức filter client thay vì đồng bộ Enum hoặc lấy từ stats API.',
    fix: 'Định nghĩa Enum RoomStatus chuẩn và đồng bộ trong types/room.ts, thay thế toàn bộ magic number.'
  }
];

function buildAdfDescription(item) {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '1. Môi trường & Tiền điều kiện (Environment & Preconditions)' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: item.env }]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '2. Các bước tái hiện (Steps to Reproduce - STR)' }]
      },
      {
        type: 'orderedList',
        content: item.str.map(step => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: step }]
            }
          ]
        }))
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '3. Kết quả thực tế (Actual Result - AR)' }]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: item.ar,
            marks: [{ type: 'textColor', attrs: { color: '#de350b' } }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '4. Kết quả mong đợi (Expected Result - ER)' }]
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: item.er,
            marks: [{ type: 'textColor', attrs: { color: '#00875a' } }]
          }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '5. Bằng chứng hình ảnh (Visual Evidence)' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Ảnh chụp màn hình thực tế từ hệ thống web: ' },
          { type: 'text', text: item.screenshot, marks: [{ type: 'code' }] },
          { type: 'text', text: ' (Đã đính kèm trong mục Attachments của ticket này).' }
        ]
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '6. Nguyên nhân & Đề xuất khắc phục (Root Cause & Fix Recommendation)' }]
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Nguyên nhân: ', marks: [{ type: 'strong' }] },
                  { type: 'text', text: item.rootCause }
                ]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Đề xuất khắc phục: ', marks: [{ type: 'strong' }] },
                  { type: 'text', text: item.fix }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
}

async function uploadAttachment(issueKey, fileName) {
  const filePath = path.join(screenshotDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} not found!`);
    return false;
  }

  const fileBytes = fs.readFileSync(filePath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

  const pre = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: image/png\r\n\r\n`
  );
  const post = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([pre, fileBytes, post]);

  const res = await fetch(`${JIRA_URL}/rest/api/3/issue/${issueKey}/attachments`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'X-Atlassian-Token': 'no-check',
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: body
  });

  if (res.ok) {
    console.log(`[ATTACH SUCCESS] Attached ${fileName} to ${issueKey}`);
    return true;
  } else {
    const errText = await res.text();
    console.error(`[ATTACH FAIL] ${issueKey}: ${res.status} ${errText}`);
    return false;
  }
}

async function updateTicket(item) {
  const payload = {
    fields: {
      summary: item.summary,
      description: buildAdfDescription(item)
    }
  };

  const res = await fetch(`${JIRA_URL}/rest/api/3/issue/${item.key}`, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    console.log(`[UPDATE SUCCESS] Updated description & summary for ${item.key}`);
    return true;
  } else {
    const errText = await res.text();
    console.error(`[UPDATE FAIL] ${item.key}: ${res.status} ${errText}`);
    return false;
  }
}

async function run() {
  console.log('=== STARTING JIRA TICKETS UPDATE WITH STANDARD QA FORMAT & SCREENSHOTS ===');
  for (const item of ticketsData) {
    console.log(`\nProcessing ${item.key}...`);
    // 1. Update issue summary & description
    await updateTicket(item);
    // 2. Upload real screenshot attachment (for DOR-10 to DOR-16, DOR-9 was already attached or can be re-attached if needed)
    if (item.key !== 'DOR-9') {
      await uploadAttachment(item.key, item.screenshot);
    } else {
      console.log(`DOR-9 screenshot already attached previously.`);
    }
  }
  console.log('\n=== ALL TICKETS UPDATED SUCCESSFULLY! ===');
}

run().catch(console.error);
