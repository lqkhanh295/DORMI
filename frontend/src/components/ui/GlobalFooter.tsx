import { Link } from 'react-router-dom';

export function GlobalFooter() {
  // ponytail: Clean flat footer with real routes and Gold accent dot
  return (
    <footer className="bg-white border-t border-[#E2E8F0] py-16">
      <div className="container-dormi">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-[#E2E8F0] pb-12 mb-8">
          <div>
            <Link to="/" className="text-[24px] font-black tracking-wider text-[#00153D] flex items-center mb-2">
              DORMI<span className="text-[#F2A900] ml-0.5">.</span>
            </Link>
            <p className="text-body text-[#64748B] max-w-md">
              Tìm phòng dễ hơn. Ở cùng phù hợp hơn.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 text-body font-semibold text-[#64748B]">
            <Link to="/search" className="hover:text-[#00153D] transition-colors">Tìm phòng</Link>
            <Link to="/tenant/match" className="hover:text-[#00153D] transition-colors">Ở ghép</Link>
            <Link to="/landlord" className="hover:text-[#00153D] transition-colors">Đăng tin</Link>
            <Link to="/tenant/settings" className="hover:text-[#00153D] transition-colors">Trợ giúp</Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-caption text-[#64748B] font-medium">
          <p>© 2026 DORMI. Nền tảng kết nối phòng trọ & người ở ghép.</p>
          <div className="flex gap-6">
            <Link to="/tenant/settings" className="hover:text-[#0F172A] transition-colors">Điều khoản dịch vụ</Link>
            <Link to="/tenant/settings" className="hover:text-[#0F172A] transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
