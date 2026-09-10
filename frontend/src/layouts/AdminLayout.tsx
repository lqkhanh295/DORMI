import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LayoutDashboard, UserCheck, Home, Users, AlertTriangle } from 'lucide-react';

export default function AdminLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { name: 'Xác minh chủ phòng', path: '/admin/verify', icon: UserCheck },
    { name: 'Kiểm duyệt phòng', path: '/admin/rooms', icon: Home },
    { name: 'Người dùng', path: '/admin/users', icon: Users },
    { name: 'Báo cáo vi phạm', path: '/admin/reports', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#1F2937]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1F2937] text-white hidden md:block border-r border-[#374151]">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">DORMI <span className="text-[#6366F1] text-xs ml-1 font-bold">ADMIN</span></Link>
        </div>
        <nav className="px-4 py-4 space-y-2">
          {navItems.map(item => {
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all min-h-[44px] flex items-center gap-3 ${isActive ? 'text-white bg-[#6366F1] shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)]' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-[56px] bg-white border-b border-[#E5E7EB] shadow-[0_10px_20px_-10px_rgba(99,102,241,0.08)] flex items-center justify-end px-6 gap-4">
          <span className="text-sm font-semibold text-[#1F2937]">{currentUser?.name}</span>
          <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] font-bold overflow-hidden border border-[#6366F1]/20">
            A
          </div>
          <button onClick={handleLogout} className="text-xs text-[#991B1B] hover:underline font-semibold min-h-[44px] px-2">Đăng xuất</button>
        </header>
        <main className="p-6">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
