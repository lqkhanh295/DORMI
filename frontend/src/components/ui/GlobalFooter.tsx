import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  Check, 
  Building2, 
  Users, 
  Search
} from 'lucide-react';

export function GlobalFooter() {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <footer className="bg-[#00153D] text-white border-t border-[#0A2558] overflow-hidden">
      {/* 1. TOP NEWSLETTER & HIGHLIGHT BANNER */}
      <div className="border-b border-white/10 py-10 bg-[#00102E]">
        <div className="container-dormi">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F2A900]" />
                <span>Nhận thông báo phòng trọ mới & người ở ghép phù hợp</span>
              </h3>
              <p className="text-slate-400 text-sm mt-1.5">
                Cập nhật danh sách phòng mới xác minh gần trường đại học và bạn cùng phòng tương thích mỗi tuần.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cảm ơn bạn! Đã đăng ký nhận bản tin phòng trọ DORMI thành công.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Nhập email của bạn..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2A900] focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#F2A900] text-[#00153D] font-bold text-sm hover:bg-[#e09c00] active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Đăng ký</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION & CONTENT COLUMNS */}
      <div className="container-dormi py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Trust Column (spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <Link to="/" className="text-[26px] font-black tracking-wider text-white inline-flex items-center">
                DORMI<span className="text-[#F2A900] ml-0.5">.</span>
              </Link>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed max-w-sm">
                Nền tảng công nghệ tìm phòng trọ thông minh và kết nối bạn cùng phòng tương thích phong cách sống hàng đầu tại TP. Hồ Chí Minh.
              </p>
            </div>

            {/* Trust highlights */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#F2A900] shrink-0" />
                <span>100% Chủ trọ xác minh danh tính và giấy tờ pháp lý</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#F2A900] shrink-0" />
                <span>Kiểm duyệt chất lượng hình ảnh & thông tin thực tế</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Users className="w-4 h-4 text-[#F2A900] shrink-0" />
                <span>Thuật toán kết nối bạn cùng phòng theo độ tương thích</span>
              </div>
            </div>

            {/* Direct Contact info */}
            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Hotline hỗ trợ: <a href="tel:0909123456" className="text-white hover:text-[#F2A900] transition-colors font-medium">0909 123 456</a> (08:00 - 21:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Email: <a href="mailto:hotro@dormi.space" className="text-white hover:text-[#F2A900] transition-colors font-medium">hotro@dormi.space</a></span>
              </div>
            </div>
          </div>

          {/* Column 2: Khách thuê & Sinh viên */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Dành cho người thuê</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              <li>
                <Link to="/search" className="hover:text-[#F2A900] transition-colors inline-block">
                  Tìm kiếm phòng trọ
                </Link>
              </li>
              <li>
                <Link to="/search?roomType=Studio" className="hover:text-[#F2A900] transition-colors inline-block">
                  Căn hộ Studio & Mini
                </Link>
              </li>
              <li>
                <Link to="/search?query=Đại+học" className="hover:text-[#F2A900] transition-colors inline-block">
                  Phòng gần trường Đại học
                </Link>
              </li>
              <li>
                <Link to="/tenant/match" className="hover:text-[#F2A900] transition-colors inline-flex items-center gap-1">
                  <span>Tìm người ở ghép</span>
                  <span className="text-[10px] bg-[#F2A900]/20 text-[#F2A900] font-bold px-1.5 py-0.5 rounded">Hot</span>
                </Link>
              </li>
              <li>
                <Link to="/tenant" className="hover:text-[#F2A900] transition-colors inline-block">
                  Bảng điều khiển cá nhân
                </Link>
              </li>
              <li>
                <Link to="/tenant/chat" className="hover:text-[#F2A900] transition-colors inline-block">
                  Trò chuyện & Hẹn xem phòng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Dành cho Chủ trọ */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Dành cho chủ trọ</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              <li>
                <Link to="/landlord/create" className="hover:text-[#F2A900] transition-colors inline-block">
                  Đăng tin phòng trọ mới
                </Link>
              </li>
              <li>
                <Link to="/landlord/rooms" className="hover:text-[#F2A900] transition-colors inline-block">
                  Quản lý danh sách phòng
                </Link>
              </li>
              <li>
                <Link to="/landlord/leads" className="hover:text-[#F2A900] transition-colors inline-block">
                  Phân tích khách tiềm năng
                </Link>
              </li>
              <li>
                <Link to="/landlord/verification" className="hover:text-[#F2A900] transition-colors inline-block">
                  Xác minh danh tính chủ trọ
                </Link>
              </li>
              <li>
                <Link to="/landlord/pricing" className="hover:text-[#F2A900] transition-colors inline-block">
                  Bảng giá gói tin đăng VIP
                </Link>
              </li>
              <li>
                <Link to="/landlord" className="hover:text-[#F2A900] transition-colors inline-block">
                  Bảng điều khiển chủ nhà
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Khu vực phổ biến */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>Khu vực tại TP.HCM</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300 font-medium">
              <li>
                <Link to="/search?query=Quận+1" className="hover:text-[#F2A900] transition-colors inline-block">
                  Phòng trọ Quận 1 & Quận 3
                </Link>
              </li>
              <li>
                <Link to="/search?query=Bình+Thạnh" className="hover:text-[#F2A900] transition-colors inline-block">
                  Phòng trọ Bình Thạnh
                </Link>
              </li>
              <li>
                <Link to="/search?query=Thủ+Đức" className="hover:text-[#F2A900] transition-colors inline-block">
                  TP. Thủ Đức & Làng ĐH
                </Link>
              </li>
              <li>
                <Link to="/search?query=Quận+10" className="hover:text-[#F2A900] transition-colors inline-block">
                  Phòng trọ Quận 10 & Quận 5
                </Link>
              </li>
              <li>
                <Link to="/search?query=Gò+Vấp" className="hover:text-[#F2A900] transition-colors inline-block">
                  Phòng trọ Gò Vấp & Tân Bình
                </Link>
              </li>
              <li>
                <Link to="/search?query=Quận+7" className="hover:text-[#F2A900] transition-colors inline-block">
                  Phòng trọ Quận 7 & Nam Sài Gòn
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM LEGAL & STATUS BAR */}
      <div className="border-t border-white/10 py-6 bg-[#00102E]">
        <div className="container-dormi">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2">
              <p>© 2026 DORMI Platform. Dự án Khởi nghiệp EXE101.</p>
              <div className="flex items-center gap-4 text-slate-400">
                <Link to="/tenant/settings" className="hover:text-white transition-colors">
                  Điều khoản dịch vụ
                </Link>
                <span>•</span>
                <Link to="/tenant/settings" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </Link>
                <span>•</span>
                <Link to="/tenant/settings" className="hover:text-white transition-colors">
                  Quy chế hoạt động
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Hệ thống trực tuyến 99.9%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
