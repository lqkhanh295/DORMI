import { Outlet, Link, useLocation } from 'react-router-dom';
import { GlobalNav } from '../components/ui/GlobalNav';
import { 
  LayoutDashboard, 
  Home, 
  FileText, 
  FileCheck, 
  Calendar, 
  BarChart3, 
  MessageCircle 
} from 'lucide-react';

export default function LandlordLayout() {
  const location = useLocation();

  const subNavItems = [
    { name: 'Tổng quan', path: '/landlord', icon: LayoutDashboard },
    { name: 'Phòng của tôi', path: '/landlord/rooms', icon: Home },
    { name: 'Hồ sơ thuê', path: '/landlord/applications', icon: FileText },
    { name: 'Hợp đồng', path: '/landlord/leases', icon: FileCheck },
    { name: 'Lịch hẹn xem', path: '/landlord/viewings', icon: Calendar },
    { name: 'Phân tích', path: '/landlord/analytics', icon: BarChart3 },
    { name: 'Tin nhắn', path: '/landlord/chat', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans pt-[56px]">
      <GlobalNav />

      {/* Landlord Workspace Sub-Navigation Strip */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-[56px] z-30 shadow-2xs">
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

      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl 2xl:max-w-[1536px] mx-auto mb-20 md:mb-8">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
