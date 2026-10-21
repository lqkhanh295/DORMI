import { Compass, Box, Users2, MessageSquare, CreditCard, LayoutDashboard } from 'lucide-react';

export function KeyFeaturesSection() {
  const features = [
    {
      icon: Compass,
      title: 'Tìm kiếm không gian địa lý PostGIS',
      desc: 'Tra cứu phòng trọ theo bán kính trường đại học, khu công nghệ cao hoặc quận huyện với thuật toán không gian PostGIS chuẩn xác đến từng mét.'
    },
    {
      icon: Box,
      title: 'Tham quan thực tế ảo 3D (Three.js)',
      desc: 'Xem chi tiết kết cấu căn phòng qua mô hình 3D tương tác trực tiếp trong trình duyệt, đánh giá không gian mà không cần di chuyển.'
    },
    {
      icon: Users2,
      title: 'Thuật toán Roommate Matcher',
      desc: 'So khớp độ tương thích giữa các ứng viên tìm phòng dựa trên ngân sách, thói quen sinh hoạt, tính cách và sở thích cá nhân.'
    },
    {
      icon: MessageSquare,
      title: 'Nhắn tin & Đặt lịch xem phòng Real-time',
      desc: 'Trò chuyện trực tiếp giữa khách thuê và chủ trọ qua SignalR, gửi đề xuất lịch hẹn và nhận thông báo tức thời không độ trễ.'
    },
    {
      icon: CreditCard,
      title: 'Thanh toán cọc trực tuyến VietQR PayOS',
      desc: 'Tự động tạo mã QR thanh toán đặt cọc ngân hàng với chữ ký số HMAC-SHA256, tự động gạch nợ và cập nhật trạng thái phòng cho thuê.'
    },
    {
      icon: LayoutDashboard,
      title: 'Cổng quản trị phân quyền 3 cấp độ',
      desc: 'Giao diện chuyên biệt cho Người thuê (Tenant), Chủ trọ (Landlord) và Quản trị viên (Admin) với đầy đủ công cụ kiểm duyệt và báo cáo.'
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-white border-t border-slate-200">
      <div className="container-dormi">
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <span>Tính năng cốt lõi</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#00153D] tracking-tight">
            Nền tảng công nghệ toàn diện cho thuê trọ hiện đại
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            Kết hợp sức mạnh kiến trúc Clean Architecture .NET 10, Supabase PostgreSQL và React 19 để mang đến trải nghiệm mượt mà, tin cậy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#00153D] text-[#F2A900] flex items-center justify-center mb-4 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
