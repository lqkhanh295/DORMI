import { Link } from 'react-router-dom';
import { FacebookLogo, TwitterLogo, InstagramLogo, LinkedinLogo, PaperPlaneRight } from '@phosphor-icons/react';

export function GlobalFooter() {
  return (
    <footer className="bg-white border-t border-border-subtle pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Dormi
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-sm">
              Nền tảng tìm kiếm phòng trọ và người ở ghép thông minh hàng đầu. Kết nối cộng đồng, nâng tầm cuộc sống sinh viên với giải pháp công nghệ AI đột phá.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-pill bg-surface flex items-center justify-center text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors shadow-sm border border-border-subtle hover:border-blue-100 hover:-translate-y-1">
                <FacebookLogo  className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-pill bg-surface flex items-center justify-center text-text-secondary hover:bg-pink-50 hover:text-pink-600 transition-colors shadow-sm border border-border-subtle hover:border-pink-100 hover:-translate-y-1">
                <InstagramLogo  className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-pill bg-surface flex items-center justify-center text-text-secondary hover:bg-primary-soft hover:text-blue-400 transition-colors shadow-sm border border-border-subtle hover:border-blue-100 hover:-translate-y-1">
                <TwitterLogo  className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-pill bg-surface flex items-center justify-center text-text-secondary hover:bg-primary-soft hover:text-primary-dark transition-colors shadow-sm border border-border-subtle hover:border-blue-100 hover:-translate-y-1">
                <LinkedinLogo  className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-text-primary mb-6">Sản phẩm</h3>
            <ul className="space-y-4">
              <li><Link to="/search" className="text-text-secondary hover:text-primary text-sm transition-colors font-medium">Tìm phòng trọ</Link></li>
              <li><Link to="/tenant/match" className="text-text-secondary hover:text-primary text-sm transition-colors font-medium">Tìm người ở ghép</Link></li>
              <li><Link to="#" className="text-text-secondary hover:text-primary text-sm transition-colors font-medium">Dành cho chủ nhà</Link></li>
              <li><Link to="#" className="text-text-secondary hover:text-primary text-sm transition-colors font-medium">Bảng giá</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-text-primary mb-6">Hỗ trợ</h3>
            <ul className="space-y-4">
              <li><Link to="#" className="text-text-secondary hover:text-primary text-sm transition-colors font-medium">Trung tâm trợ giúp</Link></li>
              <li><Link to="#" className="text-text-secondary hover:text-primary text-sm transition-colors font-medium">Hướng dẫn an toàn</Link></li>
              <li><Link to="#" className="text-text-secondary hover:text-primary text-sm transition-colors font-medium">Báo cáo vi phạm</Link></li>
              <li><Link to="#" className="text-text-secondary hover:text-primary text-sm transition-colors font-medium">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-text-primary mb-6">Đăng ký nhận tin</h3>
            <p className="text-text-secondary text-sm mb-4">Nhận thông tin phòng mới và cẩm nang sống sớm nhất.</p>
            <form className="relative group">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="w-full pl-4 pr-12 py-3 bg-surface border border-border-subtle rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
              <button 
                type="button" 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center justify-center transition-colors shadow-sm group-hover:shadow-md"
              >
                <PaperPlaneRight  />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted font-medium">
            © {new Date().getFullYear()} Dormi Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-sm text-text-muted hover:text-text-primary font-medium transition-colors">Chính sách bảo mật</Link>
            <Link to="#" className="text-sm text-text-muted hover:text-text-primary font-medium transition-colors">Điều khoản dịch vụ</Link>
            <Link to="#" className="text-sm text-text-muted hover:text-text-primary font-medium transition-colors">Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
