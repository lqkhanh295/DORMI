import { ShieldCheck, UserCheck, Coins, Lock, Star, Headphones } from 'lucide-react';

export function VerificationSection() {
  const pillars = [
    {
      num: '01',
      title: 'Xác thực CCCD & Giấy tờ phòng',
      desc: '100% chủ trọ được đối chiếu CCCD và quyền cho thuê hợp pháp trước khi đăng tin. Loại bỏ hoàn toàn môi giới lừa đảo.',
      icon: UserCheck
    },
    {
      num: '02',
      title: 'Giá công khai không phí ẩn',
      desc: 'Mọi khoản tiền phòng, tiền cọc, giá điện, nước, internet đều niêm yết minh bạch. Tuyệt đối không phát sinh chi phí mập mờ.',
      icon: Coins
    },
    {
      num: '03',
      title: 'Đặt cọc giữ chỗ an toàn',
      desc: 'Tiền cọc được giữ an toàn trên cổng trung gian VietQR/PayOS cho đến khi khách ký nhận bàn giao phòng thực tế.',
      icon: Lock
    },
    {
      num: '04',
      title: 'Đánh giá 2 chiều khách quan',
      desc: 'Hệ thống đánh giá minh bạch giữa người thuê và chủ nhà, chuẩn hóa điểm tín nhiệm DORMI Trust Score.',
      icon: Star
    },
    {
      num: '05',
      title: 'Hỗ trợ giải quyết tranh chấp 24/7',
      desc: 'Đội ngũ pháp lý và quản trị viên DORMI đồng hành can thiệp bảo vệ quyền lợi người thuê trong suốt thời hạn hợp đồng.',
      icon: Headphones
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-t border-[#E2E8F0]">
      <div className="container-dormi">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-3 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cam kết an toàn & minh bạch</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#00153D] tracking-tight">
            5 trụ cột bảo vệ người thuê tại DORMI
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] mt-2 leading-relaxed">
            Quy trình chuẩn hóa bảo vệ quyền lợi tối đa cho sinh viên và người thuê phòng, giải quyết triệt để nỗi lo lừa đảo đặt cọc, phòng ảo và sai lệch thực tế.
          </p>
        </div>

        {/* 5 Verification Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={pillar.num}
                className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-[border-color,box-shadow,transform] duration-200 hover:border-slate-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00153D] text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">{pillar.num}</span>
                  </div>
                  <h3 className="text-sm sm:text-base text-[#0F172A] mb-2 font-bold leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {pillar.desc}
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
