import { Link } from 'react-router-dom';

export function GlobalFooter() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] pt-12 pb-8 text-[#0F172A]">
      <div className="container-dormi">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#E2E8F0]">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="text-[22px] font-black tracking-wider text-[#00153D] inline-flex items-center">
              DORMI<span className="text-[#F2A900] ml-0.5">.</span>
            </Link>
            <p className="text-body text-[#64748B] max-w-sm">
              Nền tảng tìm kiếm phòng trọ và kết nối bạn ở ghép thông minh, minh bạch tại TP. Hồ Chí Minh.
            </p>
            <div className="text-caption text-[#64748B] space-y-1 pt-1">
              <p>Hotline: <a href="tel:0909123456" className="text-[#00153D] font-medium hover:underline">0909 123 456</a> (08:00 - 21:00)</p>
              <p>Email: <a href="mailto:hotro@dormi.space" className="text-[#00153D] font-medium hover:underline">hotro@dormi.space</a></p>
              <p>Địa chỉ: Khu Công nghệ cao, TP. Thủ Đức, TP.HCM</p>
            </div>
          </div>

          {/* Người thuê */}
          <div>
            <h4 className="text-caption font-bold text-[#00153D] uppercase tracking-wider mb-3">
              Người thuê
            </h4>
            <ul className="space-y-2 text-caption text-[#64748B] font-medium">
              <li>
                <Link to="/search" className="hover:text-[#00153D] transition-colors">
                  Tìm phòng trọ
                </Link>
              </li>
              <li>
                <Link to="/search?roomType=Studio" className="hover:text-[#00153D] transition-colors">
                  Căn hộ Studio
                </Link>
              </li>
              <li>
                <Link to="/tenant/match" className="hover:text-[#00153D] transition-colors">
                  Tìm người ở ghép
                </Link>
              </li>
              <li>
                <Link to="/tenant" className="hover:text-[#00153D] transition-colors">
                  Bảng điều khiển cá nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Chủ trọ */}
          <div>
            <h4 className="text-caption font-bold text-[#00153D] uppercase tracking-wider mb-3">
              Chủ trọ
            </h4>
            <ul className="space-y-2 text-caption text-[#64748B] font-medium">
              <li>
                <Link to="/landlord/create" className="hover:text-[#00153D] transition-colors">
                  Đăng tin cho thuê
                </Link>
              </li>
              <li>
                <Link to="/landlord/rooms" className="hover:text-[#00153D] transition-colors">
                  Quản lý phòng trọ
                </Link>
              </li>
              <li>
                <Link to="/landlord/verification" className="hover:text-[#00153D] transition-colors">
                  Xác minh danh tính
                </Link>
              </li>
              <li>
                <Link to="/landlord/pricing" className="hover:text-[#00153D] transition-colors">
                  Gói dịch vụ đăng tin
                </Link>
              </li>
            </ul>
          </div>

          {/* Khu vực */}
          <div>
            <h4 className="text-caption font-bold text-[#00153D] uppercase tracking-wider mb-3">
              Khu vực TP.HCM
            </h4>
            <ul className="space-y-2 text-caption text-[#64748B] font-medium">
              <li>
                <Link to="/search?query=Quận+1" className="hover:text-[#00153D] transition-colors">
                  Quận 1 & Quận 3
                </Link>
              </li>
              <li>
                <Link to="/search?query=Bình+Thạnh" className="hover:text-[#00153D] transition-colors">
                  Bình Thạnh & Phú Nhuận
                </Link>
              </li>
              <li>
                <Link to="/search?query=Thủ+Đức" className="hover:text-[#00153D] transition-colors">
                  TP. Thủ Đức & Làng ĐH
                </Link>
              </li>
              <li>
                <Link to="/search?query=Gò+Vấp" className="hover:text-[#00153D] transition-colors">
                  Gò Vấp & Tân Bình
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & legal links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-caption text-[#64748B]">
          <p>© 2026 DORMI. Nền tảng kết nối phòng trọ & người ở ghép.</p>
          <div className="flex items-center gap-6">
            <Link to="/tenant/settings" className="hover:text-[#00153D] transition-colors">
              Điều khoản dịch vụ
            </Link>
            <Link to="/tenant/settings" className="hover:text-[#00153D] transition-colors">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
