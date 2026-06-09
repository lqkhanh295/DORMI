# DORMI - Hệ sinh thái kết nối Người Thuê và Chủ Trọ

DORMI là một nền tảng quản lý và tìm kiếm phòng trọ thông minh, tích hợp trải nghiệm xem phòng Virtual3D và tính năng ghép phòng (Roommate matching) trực tiếp trên trình duyệt.

## 🏗️ Cấu trúc dự án
Dự án được chia làm 2 phần chính:
- **`frontend`**: Ứng dụng React + TypeScript, sử dụng Vite, Tailwind CSS v4, Zustand và Three.js.
- **`backend`**: Ứng dụng .NET 10 Web API, được thiết kế theo mô hình **Clean Architecture** kết nối với PostgreSQL & PostGIS (hỗ trợ truy vấn vị trí địa lý).

---

## 🚀 Hướng dẫn cài đặt và chạy dự án (Dành cho thành viên nhóm)

### Yêu cầu hệ thống
- **Node.js** (Phiên bản >= 18.x) cho Frontend.
- **.NET 10 SDK** (Hoặc .NET 9 nếu máy bạn cấu hình lùi lại) cho Backend.
- **PostgreSQL** (Có cài đặt extension `PostGIS`).
- Git.

### Bước 1: Clone dự án
```bash
git clone <đường_dẫn_repo_của_bạn>
cd Dormi
```

### Bước 2: Thiết lập Database (Backend)
1. Hãy chắc chắn rằng bạn đã khởi động **PostgreSQL** ở máy cá nhân (chạy qua pgAdmin hoặc Docker).
2. Tạo một database rỗng hoặc để EF Core tự tạo.
3. Mở file `backend/Dormi.API/appsettings.json`, tìm chuỗi kết nối `DefaultConnection`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Database=DORMI;Username=postgres;Password=postgres"
   }
   ```
   *Lưu ý: Thay đổi `Username` và `Password` cho khớp với PostgreSQL ở máy của bạn.*

4. Mở Terminal (Command Prompt / PowerShell), trỏ vào thư mục API và chạy lệnh Migrate để tạo các bảng (Entities):
   ```bash
   cd backend/Dormi.API
   dotnet ef database update
   ```
   *Lệnh này sẽ đọc lịch sử Migration có sẵn ở tầng Infrastructure và tạo các bảng (User, Room, CustomerProfile, v.v.) vào Database.*

5. Chạy Backend:
   ```bash
   dotnet run
   ```

### Bước 3: Khởi chạy Frontend
Mở một Terminal khác và trỏ vào thư mục `frontend`:
```bash
cd frontend
npm install
npm run dev
```
Dự án frontend sẽ chạy ở địa chỉ `http://localhost:5173`.

---

## 🛠️ Công nghệ sử dụng
- **Frontend**: Vite, React, TypeScript, TailwindCSS v4, Zustand, React-Three-Fiber.
- **Backend**: .NET 10, Entity Framework Core, PostgreSQL, SignalR, JWT Auth.
- **Kiến trúc Backend**: Clean Architecture (Domain -> Application -> Infrastructure -> API).
