import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, 
  UserCheck, 
  Home, 
  Users, 
  AlertTriangle, 
  Receipt,
  Menu,
  X
} from 'lucide-react';
import { GlobalFooter } from '../components/ui/GlobalFooter';

export default function AdminLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const coreAdminItems = [
    { name: 'Tổng quan hệ thống', path: '/admin', icon: LayoutDashboard },
    { name: 'Duyệt tin đăng phòng', path: '/admin/rooms', icon: Home },
    { name: 'Xác minh chủ trọ', path: '/admin/verify', icon: UserCheck },
    { name: 'Quản lý người dùng', path: '/admin/users', icon: Users },
    { name: 'Lịch sử giao dịch', path: '/admin/transactions', icon: Receipt },
    { name: 'Báo cáo vi phạm', path: '/admin/reports', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#0F172A]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#00153D] text-white hidden md:flex md:flex-col border-r border-slate-800 sticky top-0 h-screen shrink-0 overflow-y-auto z-30">
        <div className="p-6 shrink-0 border-b border-white/10">
          <Link to="/" className="text-xl font-black tracking-wider text-white select-none inline-flex items-center gap-2">
            <img src="/logo.png" alt="DORMI" className="w-7 h-7 rounded-lg object-cover shadow-xs shrink-0" />
            <span>DORMI<span className="text-[#F2A900] ml-0.5">.</span></span>
            <span className="text-[11px] font-bold text-slate-300 bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-md ml-1 tracking-normal">
              ADMIN
            </span>
          </Link>
        </div>
        <nav className="px-3 py-4 space-y-4 flex-1">
          {/* Core admin group */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Quản trị hệ thống
            </p>
            {coreAdminItems.map(item => {
              const isActive = item.path === '/admin' 
                ? location.pathname === '/admin' 
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ease-out active:scale-[0.98] min-h-[38px] flex items-center gap-2.5 ${
                    isActive 
                      ? 'text-white bg-white/15 font-bold border border-white/20 shadow-xs' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F2A900]' : 'text-slate-400'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[56px] bg-white border-b border-slate-200 shadow-2xs flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <button 
              type="button" 
              onClick={() => setMobileOpen(true)} 
              className="md:hidden p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg touch-target"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <Link to="/admin" className="md:hidden flex items-center gap-1.5 font-bold text-xs text-[#00153D]">
              <img src="/logo.png" alt="DORMI" className="w-5 h-5 rounded object-cover shadow-2xs" />
              <span>DORMI ADMIN</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-800">{currentUser?.name || 'Quản trị viên'}</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#00153D] font-bold overflow-hidden border border-slate-200 text-xs">
              A
            </div>
            <button onClick={handleLogout} className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold min-h-[44px] px-2">Đăng xuất</button>
          </div>
        </header>

        {/* Mobile Slide-out Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-72 max-w-[80vw] bg-[#00153D] text-white h-full flex flex-col shadow-2xl z-10 overflow-y-auto">
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <Link to="/" onClick={() => setMobileOpen(false)} className="text-lg font-black tracking-wider text-white inline-flex items-center gap-2">
                  <img src="/logo.png" alt="DORMI" className="w-6 h-6 rounded-lg object-cover shadow-xs" />
                  <span>DORMI<span className="text-[#F2A900]">.</span></span>
                  <span className="text-[10px] font-bold text-slate-300 bg-white/10 border border-white/20 px-1 py-0.5 rounded ml-1">ADMIN</span>
                </Link>
                <button 
                  type="button" 
                  onClick={() => setMobileOpen(false)} 
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-3 space-y-4 flex-1">
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Quản trị hệ thống
                  </p>
                  {coreAdminItems.map(item => {
                    const isActive = item.path === '/admin' 
                      ? location.pathname === '/admin' 
                      : location.pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.name}
                        to={item.path} 
                        onClick={() => setMobileOpen(false)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                          isActive 
                            ? 'text-white bg-white/15 font-bold border border-white/20 shadow-xs' 
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F2A900]' : 'text-slate-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        )}

        <main className="p-4 sm:p-6 flex-1">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
        <GlobalFooter />
      </div>
    </div>
  );
}
