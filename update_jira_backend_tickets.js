const fs = require('fs');
const path = require('path');

const JIRA_URL = 'https://lqkhanh292005.atlassian.net';
const EMAIL = 'lqkhanh292005@gmail.com';
const API_TOKEN = 'ATATT3xFfGF0rAPnt7JeCbuDHIbpUAn9CdU5D-bsAQeWZExmqhBjGTgppMF2I8DVtf74TPbByVwj7ueJu5iPgDcgODBfqCS-1-QgCS-Hnem15J2VVd01AMMd3puBRE6_kA3XiEGD-2uluNzC9ahvsJLorlIfO7-q5oN6IpzKujHS5vFNPCpAeGA=361C5AD6';
const authHeader = 'Basic ' + Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64');

const screenshotDir = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\aacf0631-9c6b-473a-af30-d57a28810f31\\screenshots';

const backendTickets = [
  {
    key: 'DOR-1',
    summary: '[DORMI-BE-01] [Auth] Password Reset Endpoint rò rỉ mã OTP/Token trực tiếp trong JSON response',
    screenshot: 'dor_1_backend.png',
    priority: 'Highest',
    env: 'Backend .NET Core API (http://localhost:5167), Controller: AuthController.cs, Service: AuthService.cs, Endpoint: POST /api/Auth/forgot-password',
    str: [
      'Khởi động backend API tại http://localhost:5167',
      'Mở Swagger UI hoặc Postman/curl, gọi endpoint POST /api/Auth/forgot-password',
      'Truyền request body JSON: {"email": "tenant@dormi.vn"}',
      'Quan sát HTTP response status và nội dung response body trả về cho client'
    ],
    ar: 'Server trả về HTTP 200 OK kèm theo trường "resetToken": "xxxxxx" trực tiếp trong JSON body. Bất kỳ ai chỉ cần biết địa chỉ email của người dùng là có thể lấy được mã reset token và đổi mật khẩu tài khoản ngay lập tức mà không cần truy cập hòm thư email.',
    er: 'API chỉ được trả về thông báo generic (vd: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư của bạn"). Mã resetToken phải được gửi ngầm qua dịch vụ Email/SMS và TUYỆT ĐỐI KHÔNG xuất hiện trong JSON response.',
    evidence: 'Ảnh chụp màn hình Swagger UI endpoint forgot-password dor_1_backend.png đính kèm trong mục Attachments.',
    rootCause: 'Trong AuthService.cs (hàm ForgotPasswordAsync), mã OTP reset token ngẫu nhiên được nhét thẳng vào payload trả về: return ServiceResult<object>.Ok(new { message = "...", resetToken = resetToken });.',
    fix: 'Loại bỏ thuộc tính resetToken khỏi payload response, chỉ giữ lại message thông báo chung và gửi token qua IEmailService.'
  },
  {
    key: 'DOR-2',
    summary: '[DORMI-BE-02] [Auth] Endpoint MFA/OTP rò rỉ mã bí mật và ghi log nhạy cảm ra Console',
    screenshot: 'dor_2_backend.png',
    priority: 'Highest',
    env: 'Backend .NET Core API, Controller: AuthController.cs, Service: AuthService.cs, Endpoint: POST /api/Auth/verify-mfa',
    str: [
      'Gửi request đăng nhập POST /api/Auth/login với tài khoản đã kích hoạt bảo vệ 2 lớp (MFA)',
      'Kiểm tra log console của ứng dụng backend và nội dung response trả về cho client'
    ],
    ar: 'Hệ thống in nguyên văn mã OTP xác thực 2 lớp ra application logs (Console/stdout) hoặc trả về cho client. Kẻ tấn công hoặc nhân sự có quyền xem log có thể đánh cắp mã OTP này để vượt qua lớp bảo vệ 2FA.',
    er: 'Mã xác thực 2FA phải được sinh và xác thực theo chuẩn bảo mật RFC 6238 (TOTP) hoặc gửi qua kênh ngoài băng bí mật; log hệ thống phải được che giấu (masking) các thông tin nhạy cảm.',
    evidence: 'Ảnh chụp màn hình Swagger UI endpoint verify-mfa dor_2_backend.png đính kèm trong mục Attachments.',
    rootCause: 'AuthService.cs in log trực tiếp mã OTP dạng plaintext mà không qua cơ chế Data Masking.',
    fix: 'Loại bỏ việc log mã OTP plaintext, chuẩn hóa xác thực 2FA TOTP trên ứng dụng Authenticator.'
  },
  {
    key: 'DOR-3',
    summary: '[DORMI-BE-03] [Security] DatabaseSeeder tự động seed tài khoản Admin với mật khẩu yếu khi khởi động',
    screenshot: 'dor_3_backend.png',
    priority: 'High',
    env: 'Backend .NET Core Data Layer, Class: DatabaseSeeder.cs, File: backend/Dormi.Infrastructure/Data/DatabaseSeeder.cs',
    str: [
      'Cấu hình ứng dụng chạy ở môi trường Production với cơ sở dữ liệu thật',
      'Khởi động service backend',
      'Truy vấn bảng Users trong cơ sở dữ liệu hoặc thử đăng nhập tài khoản admin'
    ],
    ar: 'Logic DatabaseSeeder tự động kiểm tra nếu chưa có tài khoản admin thì tự ý chèn tài khoản admin@dormi.vn với mật khẩu mặc định hardcode Password123!. Kẻ tấn công có thể lợi dụng tài khoản mặc định này để chiếm toàn quyền điều hành hệ thống.',
    er: 'DatabaseSeeder chỉ được phép chạy khi biến môi trường là Development (env.IsDevelopment()). Tuyệt đối không tự động seed tài khoản quản trị viên với mật khẩu mặc định trên Production.',
    evidence: 'Ảnh chụp màn hình Swagger UI Admin API dor_3_backend.png đính kèm trong mục Attachments.',
    rootCause: 'DatabaseSeeder.cs thiếu kiểm tra môi trường chạy (IWebHostEnvironment.IsDevelopment()) trước khi chèn tài khoản mặc định.',
    fix: 'Thêm guard clause if (!_env.IsDevelopment()) return; ở đầu hàm SeedAsync.'
  },
  {
    key: 'DOR-4',
    summary: '[DORMI-BE-04] [Payment] Callback Webhook thanh toán không xác thực chữ ký số HMAC',
    screenshot: 'dor_4_backend.png',
    priority: 'Highest',
    env: 'Backend .NET Core API, Controller: PaymentController.cs, Service: PaymentService.cs, Endpoint: POST /api/landlord/payment/verify',
    str: [
      'Sử dụng Postman/curl gửi request giả lập callback thanh toán tới /api/landlord/payment/verify',
      'Truyền các tham số giao dịch với số tiền nạp lớn và trạng thái thành công nhưng bỏ trống chữ ký vnp_SecureHash hoặc truyền chữ ký sai',
      'Kiểm tra số dư hoặc gói dịch vụ của Chủ trọ trong CSDL'
    ],
    ar: 'Backend chấp nhận payload và cập nhật trạng thái gói dịch vụ thành công mà không đối chiếu tính hợp lệ của chữ ký số HMAC-SHA512 với Secret Key của cổng thanh toán (Payment Bypass). Kẻ xấu có thể nâng cấp tài khoản VIP miễn phí.',
    er: 'Backend bắt buộc phải tính toán lại chữ ký HMAC từ toàn bộ tham số nhận được và so sánh với vnp_SecureHash. Nếu chữ ký không khớp hoặc bị thiếu, reject ngay lập tức với HTTP 400 Bad Request.',
    evidence: 'Ảnh chụp màn hình Swagger UI Payment Webhook dor_4_backend.png đính kèm trong mục Attachments.',
    rootCause: 'PaymentService.cs thiếu bước xác thực chữ ký cryptographic HMAC-SHA512 trước khi cập nhật trạng thái đơn hàng.',
    fix: 'Bổ sung hàm ValidateSignature(vnpayData, secretKey) sử dụng HMACSHA512 để kiểm tra tính toàn vẹn dữ liệu.'
  },
  {
    key: 'DOR-5',
    summary: '[DORMI-BE-05] [Payment] Endpoint Test giả lập thanh toán (Simulate Gateway) mở công khai trên Production',
    screenshot: 'dor_5_backend.png',
    priority: 'Highest',
    env: 'Backend .NET Core API, Controller: PaymentController.cs, Endpoint: POST /api/landlord/payment/simulate-gateway',
    str: [
      'Chạy backend API ở chế độ Production (ASPNETCORE_ENVIRONMENT=Production)',
      'Gửi request POST /api/landlord/payment/simulate-gateway với transactionRef của một hóa đơn đang chờ thanh toán',
      'Kiểm tra kết quả phản hồi từ API'
    ],
    ar: 'Endpoint vẫn hoạt động bình thường, trả về HTTP 200 OK và tự động đánh dấu thanh toán thành công mà người dùng không cần thanh toán qua ngân hàng.',
    er: 'Endpoint này phải bị vô hiệu hóa hoàn toàn trên môi trường Production (trả về HTTP 403 Forbidden hoặc 404 Not Found), chỉ cho phép sử dụng nội bộ khi phát triển (DEV).',
    evidence: 'Ảnh chụp màn hình Swagger UI endpoint simulate-gateway dor_5_backend.png đính kèm trong mục Attachments.',
    rootCause: 'PaymentController.cs thiếu điều kiện kiểm tra môi trường IWebHostEnvironment.IsDevelopment().',
    fix: 'Bổ sung guard clause: if (!_env.IsDevelopment()) return Forbid("Tính năng giả lập chỉ khả dụng trong môi trường Development.");'
  },
  {
    key: 'DOR-6',
    summary: '[DORMI-BE-06] [Upload] Endpoint tải ảnh lên server không yêu cầu đăng nhập [Authorize]',
    screenshot: 'dor_6_backend.png',
    priority: 'High',
    env: 'Backend .NET Core API, Controller: ImagesController.cs, Endpoint: POST /api/Images/upload',
    str: [
      'Gửi request POST multipart/form-data tải tệp ảnh lên endpoint /api/Images/upload',
      'KHÔNG đính kèm header Authorization: Bearer <token>',
      'Quan sát HTTP response status từ server'
    ],
    ar: 'Server chấp nhận request, upload file vào thư mục lưu trữ và trả về URL ảnh công khai. Kẻ tấn công ẩn danh có thể spam tải file dung lượng lớn làm đầy bộ nhớ máy chủ (Storage Exhaustion DoS).',
    er: 'Endpoint bắt buộc phải có attribute [Authorize], chỉ người dùng đã đăng nhập hợp lệ mới có quyền tải tệp lên hệ thống. Yêu cầu không có token phải bị từ chối với HTTP 401 Unauthorized.',
    evidence: 'Ảnh chụp màn hình Swagger UI endpoint upload dor_6_backend.png đính kèm trong mục Attachments.',
    rootCause: 'ImagesController.cs không được gắn attribute [Authorize] ở cấp Controller hoặc Action.',
    fix: 'Thêm attribute [Authorize] vào ImagesController để bảo vệ toàn bộ các thao tác tải lên tài nguyên.'
  },
  {
    key: 'DOR-7',
    summary: '[DORMI-BE-07] [Upload] Thiếu kiểm tra Magic Bytes cho phép tải tệp độc hại và hỗ trợ SVG gây Stored XSS',
    screenshot: 'dor_7_backend.png',
    priority: 'High',
    env: 'Backend .NET Core API, Service: UploadService.cs, Controller: ImagesController.cs',
    str: [
      'Tạo một tệp HTML hoặc script độc hại và đổi tên thành avatar.png, hoặc tải tệp SVG chứa payload <script>alert(document.cookie)</script>',
      'Gửi tệp lên endpoint upload ảnh của hệ thống',
      'Truy cập trực tiếp URL của tệp vừa được lưu trữ'
    ],
    ar: 'Backend chỉ kiểm tra phần mở rộng đuôi file (extension) và Content-Type do trình duyệt gửi lên, không kiểm tra Magic Bytes ở cấp binary, đồng thời cho phép tải lên định dạng .svg. Script độc hại được thực thi khi người dùng khác xem ảnh.',
    er: 'Backend phải đọc binary header (Magic Bytes) để xác thực đúng cấu trúc ảnh JPEG, PNG, WEBP; đồng thời loại bỏ hoàn toàn định dạng .svg khỏi danh sách tệp cho phép.',
    evidence: 'Ảnh chụp màn hình Swagger UI dor_7_backend.png đính kèm trong mục Attachments.',
    rootCause: 'UploadService.cs chỉ sử dụng Path.GetExtension(file.FileName) để kiểm tra loại file mà không kiểm tra chữ ký nhị phân (Magic Bytes).',
    fix: 'Thực hiện kiểm tra Magic Bytes trên stream tệp tin và loại bỏ .svg khỏi mảng _allowedExtensions.'
  },
  {
    key: 'DOR-8',
    summary: '[DORMI-BE-08] [Middleware] Rate Limiting Middleware có thể bị bypass bằng giả mạo IP Header X-Forwarded-For',
    screenshot: 'dor_8_backend.png',
    priority: 'Medium',
    env: 'Backend .NET Core API Middleware, File: backend/Dormi.API/Middlewares/RateLimitingMiddleware.cs',
    str: [
      'Gửi liên tiếp hơn 100 requests tới API nhạy cảm (/api/Auth/login) trong 1 phút',
      'Mỗi request đính kèm một giá trị ngẫu nhiên trong header X-Forwarded-For: 10.0.0.{i}',
      'Quan sát phản hồi từ hệ thống rate limiter'
    ],
    ar: 'Middleware tin tưởng giá trị X-Forwarded-For từ client mà không kiểm tra proxy tin cậy, coi mỗi request là từ một client khác nhau và không kích hoạt mã lỗi 429 Too Many Requests, vô hiệu hóa cơ chế chống Brute-force / DoS.',
    er: 'Middleware phải sử dụng context.Connection.RemoteIpAddress hoặc cấu hình ForwardedHeadersOptions với danh sách KnownProxies tin cậy để chống giả mạo IP.',
    evidence: 'Ảnh chụp màn hình Swagger UI dor_8_backend.png đính kèm trong mục Attachments.',
    rootCause: 'RateLimitingMiddleware.cs đọc trực tiếp chuỗi header X-Forwarded-For do client gửi lên.',
    fix: 'Sử dụng context.Connection.RemoteIpAddress làm IP định danh client hoặc cấu hình UseForwardedHeaders với danh sách IP proxy tin cậy.'
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
          { type: 'text', text: 'Ảnh chụp Swagger UI / API endpoint thực tế: ' },
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
      description: buildAdfDescription(item),
      priority: { name: item.priority }
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
    console.log(`[UPDATE SUCCESS] Updated description, summary & priority for ${item.key}`);
    return true;
  } else {
    const errText = await res.text();
    console.error(`[UPDATE FAIL] ${item.key}: ${res.status} ${errText}`);
    return false;
  }
}

async function run() {
  console.log('=== STARTING JIRA BACKEND TICKETS UPDATE (DOR-1 TO DOR-8) ===');
  for (const item of backendTickets) {
    console.log(`\nProcessing ${item.key}...`);
    await updateTicket(item);
    await uploadAttachment(item.key, item.screenshot);
  }
  console.log('\n=== ALL 8 BACKEND TICKETS UPDATED SUCCESSFULLY! ===');
}

run().catch(console.error);
