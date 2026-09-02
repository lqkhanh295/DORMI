import { Link } from 'react-router-dom';

export function GlobalFooter() {
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
          <div className="flex flex-wrap gap-8 text-body font-medium text-[#64748B]">
            <Link to="/search" className="hover:text-[#0F172A] transition-colors">Tìm phòng</Link>
            <Link to="/tenant/match" className="hover:text-[#0F172A] transition-colors">Ở ghép</Link>
            <Link to="/landlord" className="hover:text-[#0F172A] transition-colors">Đăng tin</Link>
            <Link to="#" className="hover:text-[#0F172A] transition-colors">Trợ giúp</Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-caption text-[#94A3B8] font-medium">
          <p>© 2026 DORMI. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-[#0F172A] transition-colors">Điều khoản</Link>
            <Link to="#" className="hover:text-[#0F172A] transition-colors">Chính sách riêng tư</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
