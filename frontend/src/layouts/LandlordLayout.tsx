import { Outlet, Link, useLocation } from 'react-router-dom';
import { GlobalNav } from '../components/ui/GlobalNav';
import { GlobalFooter } from '../components/ui/GlobalFooter';
import { 
  LayoutDashboard, 
  Home, 
  FileText, 
  FileCheck, 
  Calendar, 
  BarChart3, 
  MessageCircle,
  Zap,
  Settings
} from 'lucide-react';

export default function LandlordLayout() {
  const location = useLocation();

  const subNavItems = [
    { name: 'Tổng quan', path: '/landlord', icon: LayoutDashboard },
    { name: 'Phòng của tôi', path: '/landlord/rooms', icon: Home },
    { name: 'Hồ sơ thuê', path: '/landlord/applications', icon: FileText },
    { name: 'Hợp đồng thuê', path: '/landlord/leases', icon: FileCheck },
    { name: 'Lịch xem phòng', path: '/landlord/viewings', icon: Calendar },
    { name: 'Thống kê tin đăng', path: '/landlord/analytics', icon: BarChart3 },
    { name: 'Gói dịch vụ', path: '/landlord/pricing', icon: Zap },
    { name: 'Tin nhắn', path: '/landlord/chat', icon: MessageCircle },
    { name: 'Cài đặt', path: '/landlord/settings', icon: Settings },
  ];

  const isFixedViewportPage = location.pathname === '/landlord/chat';

  return (
    <div className={`${isFixedViewportPage ? 'h-[calc(100vh-56px)] mt-[56px] overflow-hidden' : 'min-h-screen pt-[56px]'} bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans`}>
      <GlobalNav />

      {/* Landlord Workspace Sub-Navigation Strip */}
      <div className="bg-white border-b border-[#E2E8F0] z-30 shadow-2xs shrink-0">
        <div className="container-dormi flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/landlord'
              ? location.pathname === '/landlord'
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-[#64748B]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <main className={`flex-1 w-full max-w-7xl 2xl:max-w-[1536px] mx-auto min-h-0 ${
        isFixedViewportPage
          ? 'p-2 sm:p-3 mb-0 flex flex-col overflow-hidden' 
          : 'p-4 md:p-6 lg:p-8 mb-12 md:mb-4'
      }`}>
        <div key={location.pathname} className={`page-transition ${
          isFixedViewportPage ? 'flex-1 flex flex-col min-h-0 overflow-hidden' : ''
        }`}>
          <Outlet />
        </div>
      </main>

      {!isFixedViewportPage && <GlobalFooter />}
    </div>
  );
}
