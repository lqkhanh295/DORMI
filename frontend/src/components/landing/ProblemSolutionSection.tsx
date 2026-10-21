import { AlertTriangle, CheckCircle2, ShieldCheck, MapPin, Users, FileSignature } from 'lucide-react';

export function ProblemSolutionSection() {
  const problems = [
    {
      icon: AlertTriangle,
      title: 'Tin ảo, ảnh mạng sai lệch',
      desc: 'Hình ảnh phòng trọ trên mạng thường bị góc rộng phóng đại hoặc lấy ảnh dự án khác, khiến người thuê mất nhiều công sức đi xem thực tế nhưng thất vọng.'
    },
    {
      icon: AlertTriangle,
      title: 'Nguy cơ lừa cọc & cò mồi',
      desc: 'Tình trạng trung gian không chính chủ yêu cầu chuyển cọc giữ chỗ rồi biến mất, không có văn bản hay pháp lý bảo vệ người thuê.'
    },
    {
      icon: AlertTriangle,
      title: 'Khó tìm bạn cùng phòng hợp gu',
      desc: 'Tìm bạn ở ghép qua bài đăng tự do trên mạng xã hội thường dẫn đến xung đột về giờ giấc sinh hoạt, tài chính và thói quen vệ sinh.'
    },
    {
      icon: AlertTriangle,
      title: 'Hợp đồng & thanh toán mập mờ',
      desc: 'Hợp đồng viết tay sơ sài, phát sinh phụ phí ẩn (điện nước chênh lệch), khó khăn trong việc hoàn cọc khi chấm dứt hợp đồng.'
    }
  ];

  const solutions = [
    {
      icon: CheckCircle2,
      badge: 'Xác thực 3 lớp',
      title: 'Kiểm duyệt CCCD & thực địa',
      desc: 'Admin kiểm tra đối chiếu CCCD chủ trọ và quyền cho thuê. 100% tin đăng phải qua kiểm duyệt trước khi hiển thị công khai.'
    },
    {
      icon: MapPin,
      badge: 'Bản đồ số',
      title: 'Bản đồ số PostGIS & Tra cứu thực tế',
      desc: 'Khách thuê có thể định vị chính xác vị trí phòng trọ, đo khoảng cách đến trường học/nơi làm việc và xem tiện ích lân cận qua bản đồ số.'
    },
    {
      icon: Users,
      badge: 'Thuật toán kết nối',
      title: 'Roommate Matcher tương thích',
      desc: 'Hệ thống tính toán chỉ số tương đồng lối sống, ngân sách và thói quen sinh hoạt để gợi ý người ở ghép phù hợp nhất.'
    },
    {
      icon: FileSignature,
      badge: 'Giao dịch an toàn',
      title: 'Hợp đồng điện tử & Cọc VietQR PayOS',
      desc: 'Tạo hợp đồng số minh bạch điều khoản, thanh toán cọc trực tuyến qua VietQR PayOS có mã đối soát tự động, bảo vệ quyền lợi cả hai bên.'
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-slate-50/70 border-t border-slate-200">
      <div className="container-dormi">
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#00153D] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Vấn đề & Giải pháp toàn diện</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#00153D] tracking-tight">
            Giải quyết triệt để rủi ro khi tìm thuê phòng trọ
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            DORMI ra đời nhằm chuyển đổi quy trình thuê trọ truyền thống đầy rủi ro thành một trải nghiệm an toàn, minh bạch và hoàn toàn trực tuyến.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Cột Vấn đề */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-rose-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-rose-100">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">4 Rủi ro khi thuê trọ truyền thống</h3>
                  <p className="text-xs text-slate-500">Thực trạng phổ biến sinh viên & người đi làm thường gặp</p>
                </div>
              </div>

              <div className="space-y-5">
                {problems.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3.5">
                      <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{p.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-rose-50 text-xs text-rose-600 font-medium">
              Dẫn đến mất tiền, tốn thời gian di chuyển và bất an kéo dài khi sinh hoạt.
            </div>
          </div>

          {/* Cột Giải pháp */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blue-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-blue-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">4 Giải pháp công nghệ từ DORMI</h3>
                  <p className="text-xs text-slate-500">Chuẩn hóa an toàn và tối ưu trải nghiệm người dùng</p>
                </div>
              </div>

              <div className="space-y-5">
                {solutions.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{s.title}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                            {s.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-blue-50 text-xs text-blue-700 font-medium">
              Đảm bảo 100% phòng thật, người thật và giao dịch được mã hóa an toàn.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
