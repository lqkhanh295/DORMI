import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Plus, Users, ArrowLeft, LogIn, LogOut } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function GlobalNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[56px] bg-white border-b border-[#E2E8F0]">
      <div className="container-dormi h-full flex items-center justify-between">
        
        {/* Left: Logo & Back Button */}
        <div className="flex items-center gap-4">
          {location.pathname !== '/' && (
            <button 
              onClick={() => navigate(-1)} 
              className="text-[#64748B] hover:text-[#0F172A] transition-colors touch-target flex items-center justify-center" 
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="text-[22px] font-black tracking-wider text-[#00153D] flex items-center">
            DORMI<span className="text-[#F2A900] ml-0.5">.</span>
          </Link>
        </div>

        {/* Center / Right Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-body font-medium">
          <Link 
            to="/search" 
            className={`transition-colors py-2 ${location.pathname === '/search' ? 'text-[#00153D] font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            Tìm phòng
          </Link>
          <Link 
            to="/tenant/match" 
            className={`transition-colors py-2 flex items-center gap-1.5 ${location.pathname.startsWith('/tenant/match') ? 'text-[#00153D] font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'}`}
          >
            <Users className="w-4 h-4" />
            Ở ghép
          </Link>
        </div>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser?.role !== 'Tenant' && (
            <Link 
              to="/landlord" 
              className="bg-[#00153D] text-white hover:bg-[#073372] text-body font-semibold px-4 py-2 rounded-[10px] transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              Đăng tin
            </Link>
          )}

          {!currentUser ? (
            <Link 
              to="/auth" 
              className="border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] text-body font-semibold px-4 py-2 rounded-[10px] transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </Link>
          ) : (
            <div className="flex items-center gap-3 border-l border-[#E2E8F0] pl-4">
              <Link 
                to={currentUser.role === 'Landlord' ? '/landlord' : currentUser.role === 'Admin' ? '/admin' : '/tenant'} 
                className="flex items-center gap-2 touch-target"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E2E8F0]">
                  <img src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-caption font-semibold text-[#0F172A]">{currentUser.name}</span>
              </Link>
              <button 
                onClick={() => logout()} 
                className="text-caption font-medium text-[#C62828] hover:underline p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#0F172A] touch-target flex items-center justify-center p-2"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E8F0] p-4 flex flex-col gap-4 animate-fade-in shadow-md">
          <Link 
            to="/search" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-body font-medium text-[#0F172A] py-2 border-b border-[#F1F5F9]"
          >
            Tìm phòng
          </Link>
          <Link 
            to="/tenant/match" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-body font-medium text-[#0F172A] py-2 border-b border-[#F1F5F9] flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Ở ghép
          </Link>
          {!currentUser ? (
            <Link 
              to="/auth" 
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#00153D] text-white text-center text-body font-semibold py-2.5 rounded-[10px]"
            >
              Đăng nhập
            </Link>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-caption text-[#64748B]">Đăng nhập bởi {currentUser.name}</span>
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-body font-semibold text-[#C62828] text-left py-2"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
