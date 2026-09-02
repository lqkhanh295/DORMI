import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { FloatingNav, type NavItem } from '../components/shared/FloatingNav';
import { LayoutDashboard, Users, MessageCircle, User } from 'lucide-react';

export default function TenantLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems: NavItem[] = [
    { name: 'Tổng quan', path: '/tenant', icon: <LayoutDashboard size={20} strokeWidth={2} /> },
    { name: 'Bạn cùng phòng', path: '/tenant/match', icon: <Users size={20} strokeWidth={2} /> },
    { name: 'Tin nhắn', path: '/tenant/chat', icon: <MessageCircle size={20} strokeWidth={2} /> },
    { name: 'Hồ sơ', path: '/tenant/profile', icon: <User size={20} strokeWidth={2} /> }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans">
      <FloatingNav items={navItems} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-[56px] bg-white shadow-[0_10px_20px_-10px_rgba(99,102,241,0.10),inset_0_-4px_0_0_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-40">
          <div>
            <Link to="/" className="text-xl font-black tracking-widest text-[#1F2937]">
              DORMI<span className="text-[#6366F1]">.</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold hidden md:block text-[#4B5563]">{currentUser?.name}</span>
            <Link to="/tenant/profile">
              <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#1F2937] font-bold overflow-hidden border-2 border-[#6366F1]/20 cursor-pointer shadow-sm hover:border-[#6366F1] transition-colors">
                {currentUser?.avatar ? <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : 'T'}
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto mt-4 md:mt-10 mb-20 md:mb-0">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
