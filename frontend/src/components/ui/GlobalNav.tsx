import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Plus, 
  Users, 
  ArrowLeft, 
  LogIn, 
  LogOut,
  Search,
  ChevronDown,
  LayoutDashboard,
  FileText,
  FileCheck,
  Calendar,
  MessageCircle,
  User,
  Home,
  Receipt,
  Building2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { NotificationBell } from '../common/NotificationBell';

export function GlobalNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);

  const isTopLevelPage = 
    location.pathname === '/' || 
    location.pathname === '/search' || 
    location.pathname === '/tenant' || 
    location.pathname === '/landlord' || 
    location.pathname === '/admin' || 
    location.pathname === '/tenant/match';

  const isLinkActive = (path: string) => {
    if (path === '/tenant') {
      return location.pathname.startsWith('/tenant') && location.pathname !== '/tenant/match';
    }
    if (path === '/landlord') {
      return location.pathname.startsWith('/landlord') && location.pathname !== '/landlord/rooms';
    }
    if (path === '/search') {
      return location.pathname === '/search';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = currentUser?.role === 'Tenant'
    ? [
        { name: 'Tìm phòng', path: '/search', icon: Search },
        { name: 'Ở ghép', path: '/tenant/match', icon: Users },
        { name: 'Phòng của tôi', path: '/tenant', icon: Home },
      ]
    : currentUser?.role === 'Landlord'
      ? [
          { name: 'Tìm phòng', path: '/search', icon: Search },
          { name: 'Phòng của tôi', path: '/landlord/rooms', icon: Home },
          { name: 'Quản lý trọ', path: '/landlord', icon: LayoutDashboard },
        ]
      : currentUser?.role === 'Admin'
        ? [
            { name: 'Bảng điều khiển', path: '/admin', icon: LayoutDashboard },
            { name: 'Khu vực Chủ trọ', path: '/landlord/rooms', icon: Building2 },
            { name: 'Khu vực Khách thuê', path: '/tenant', icon: User },
            { name: 'Tìm phòng', path: '/search', icon: Search },
            { name: 'Lịch sử giao dịch', path: '/admin/transactions', icon: Receipt },
          ]
        : [
            { name: 'Tìm phòng', path: '/search', icon: Search },
            { name: 'Ở ghép', path: '/tenant/match', icon: Users },
          ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-[56px] bg-white border-b border-[#E2E8F0]">
      <div className="container-dormi h-full flex items-center justify-between">
        
        {/* Left: Logo & Back Button */}
        <div className="flex items-center gap-3 shrink-0">
          {!isTopLevelPage && (
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="text-[#64748B] hover:text-[#0F172A] transition-colors p-1.5 rounded-lg hover:bg-slate-100" 
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link 
            to="/" 
            className="text-[22px] font-black tracking-wider text-[#00153D] flex items-center select-none gap-2"
          >
            <img src="/logo.png" alt="DORMI" className="w-8 h-8 rounded-lg object-cover shadow-xs shrink-0" />
            <span className="flex items-center">
              DORMI<span className="text-[#F2A900] ml-0.5">.</span>
            </span>
            {currentUser?.role === 'Landlord' && (
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded-md ml-1 tracking-normal">
                Chủ trọ
              </span>
            )}
            {currentUser?.role === 'Admin' && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md ml-1 tracking-normal">
                Admin
              </span>
            )}
          </Link>
        </div>

        {/* Center Desktop Navigation - Clean, Airy & Spacious */}
        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#00153D] text-white font-bold shadow-xs'
                    : 'text-[#64748B] hover:text-[#00153D] hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-white' : 'text-[#64748B]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          
          {/* Quick Post Button */}
          <Link 
            to={currentUser?.role === 'Tenant' ? '/tenant/post' : '/landlord/listing/new'} 
            className="bg-[#00153D] hover:bg-[#073372] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            title={currentUser?.role === 'Tenant' ? 'Đăng tin ghép' : 'Đăng tin phòng'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{currentUser?.role === 'Tenant' ? 'Đăng tin ghép' : 'Đăng tin phòng'}</span>
          </Link>

          {!currentUser ? (
            <Link 
              to="/auth" 
              className="border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 relative pl-2 border-l border-[#E2E8F0]" ref={dropdownRef}>
              <Link
                to={currentUser.role === 'Tenant' ? '/tenant/chat' : '/landlord/chat'}
                className="p-1.5 text-[#64748B] hover:text-[#00153D] hover:bg-slate-100 rounded-lg transition-colors relative"
                title="Tin nhắn"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
              <NotificationBell />

              {/* User Dropdown Trigger Pill */}
              <button 
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border transition-all duration-150 ${
                  dropdownOpen 
                    ? 'border-[#00153D] ring-2 ring-[#00153D]/10 bg-slate-50' 
                    : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50'
                }`}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E2E8F0] shrink-0">
                  <img 
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <span className="text-xs font-bold text-[#0F172A] max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Polished Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-clay-primary border border-[#E2E8F0] p-2 z-[60] overflow-hidden"
                  >
                    {/* User Info Header */}
                    <div className="px-3 py-2 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9] mb-1">
                      <p className="text-xs font-bold text-[#00153D] truncate">{currentUser.name}</p>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {currentUser.role === 'Tenant' ? 'Khách thuê' : currentUser.role === 'Landlord' ? 'Chủ trọ' : 'Quản trị viên'}
                      </span>
                    </div>

                    {/* Menu links based on Role */}
                    <div className="py-1 space-y-0.5 text-xs font-semibold text-[#334155]">
                      {currentUser.role === 'Tenant' && (
                        <>
                          <Link
                            to="/tenant"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <Home className="w-4 h-4 text-slate-500" />
                            <span>Tổng quan</span>
                          </Link>
                          <Link
                            to="/tenant/applications"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span>Hồ sơ thuê phòng</span>
                          </Link>
                          <Link
                            to="/tenant/leases"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <FileCheck className="w-4 h-4 text-slate-500" />
                            <span>Hợp đồng thuê</span>
                          </Link>
                          <Link
                            to="/tenant/viewings"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span>Lịch xem phòng</span>
                          </Link>
                          <Link
                            to="/tenant/chat"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <MessageCircle className="w-4 h-4 text-slate-500" />
                            <span>Tin nhắn</span>
                          </Link>
                        </>
                      )}

                      {currentUser.role === 'Landlord' && (
                        <>
                          <Link
                            to="/landlord"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" />
                            <span>Tổng quan</span>
                          </Link>
                          <Link
                            to="/landlord/rooms"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span>Quản lý phòng trọ</span>
                          </Link>
                          <Link
                            to="/landlord/leases"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <FileCheck className="w-4 h-4 text-slate-500" />
                            <span>Hợp đồng thuê</span>
                          </Link>
                          <Link
                            to="/landlord/billing"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <Receipt className="w-4 h-4 text-slate-500" />
                            <span>Lịch sử giao dịch</span>
                          </Link>
                        </>
                      )}

                      {currentUser.role === 'Admin' && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" />
                            <span>Bảng điều khiển Admin</span>
                          </Link>
                          <Link
                            to="/admin/transactions"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <Receipt className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-emerald-700">Lịch sử giao dịch</span>
                          </Link>
                          <Link
                            to="/admin/rooms"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <Home className="w-4 h-4 text-slate-500" />
                            <span>Duyệt tin đăng phòng</span>
                          </Link>
                          <Link
                            to="/admin/users"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#00153D] transition-colors"
                          >
                            <Users className="w-4 h-4 text-slate-500" />
                            <span>Quản lý người dùng</span>
                          </Link>
                          
                          <div className="my-1.5 border-t border-slate-100" />
                          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Truy cập toàn bộ chức năng
                          </p>
                          <Link
                            to="/landlord/rooms"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50 hover:text-amber-800 transition-colors"
                          >
                            <Building2 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Quản lý phòng trọ (Chủ trọ)</span>
                          </Link>
                          <Link
                            to="/landlord/leases"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-amber-50 hover:text-amber-800 transition-colors"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Hợp đồng thuê (Chủ trọ)</span>
                          </Link>
                          <Link
                            to="/tenant"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-800 transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>Không gian Khách thuê</span>
                          </Link>
                        </>
                      )}

                      <div className="my-1 border-t border-[#E2E8F0]" />

                      <Link
                        to={currentUser.role === 'Tenant' ? '/tenant/profile' : '/landlord/settings'}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#64748B]" />
                        <span>Hồ sơ & Cài đặt</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <button 
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#0F172A] p-2 rounded-lg hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-white border-b border-[#E2E8F0] p-4 flex flex-col gap-3 shadow-md overflow-hidden motion-gpu"
          >
            <Link 
              to="/search" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#0F172A] py-2 border-b border-[#F1F5F9] flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#64748B]" />
              <span>Tìm phòng</span>
            </Link>

            <Link 
              to="/tenant/match" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#0F172A] py-2 border-b border-[#F1F5F9] flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-[#64748B]" />
              <span>Ở ghép</span>
            </Link>

            {currentUser?.role === 'Tenant' && (
              <>
                <Link 
                  to="/tenant" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-[#00153D] py-2 border-b border-[#F1F5F9] flex items-center gap-2"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>Phòng của tôi</span>
                </Link>
                <Link 
                  to="/tenant/applications" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#0F172A] py-2 border-b border-[#F1F5F9] flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Hồ sơ thuê phòng</span>
                </Link>
                <Link 
                  to="/tenant/leases" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#0F172A] py-2 border-b border-[#F1F5F9] flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4 text-slate-500" />
                  <span>Hợp đồng thuê</span>
                </Link>
              </>
            )}

            <Link 
              to={currentUser?.role === 'Tenant' ? '/tenant/post' : '/landlord/listing/new'} 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-[#00153D] py-2 border-b border-[#F1F5F9] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{currentUser?.role === 'Tenant' ? 'Đăng tin ở ghép' : 'Đăng phòng trọ'}</span>
            </Link>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-sm font-bold text-rose-600 py-2 flex items-center gap-2 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    {/* Mobile Bottom Floating Dock for Logged-In Users */}
    {currentUser && (
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-xl rounded-full px-3 py-1 flex items-center gap-2 max-w-[95vw]">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.name}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                active 
                  ? 'bg-[#00153D] text-white font-bold' 
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Icon className="w-4 h-4" />
            </Link>
          );
        })}
        <Link
          to={currentUser.role === 'Tenant' ? '/tenant/chat' : '/landlord/chat'}
          title="Tin nhắn"
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
            location.pathname.includes('/chat')
              ? 'bg-[#00153D] text-white font-bold'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
        </Link>
      </div>
    )}
  </>
  );
}
