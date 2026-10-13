import { Outlet, Link, useLocation } from 'react-router-dom';
import { GlobalNav } from '../components/ui/GlobalNav';
import { GlobalFooter } from '../components/ui/GlobalFooter';
import { 
  Home, 
  FileText, 
  FileCheck, 
  Calendar, 
  MessageCircle, 
  Users 
} from 'lucide-react';

export default function TenantLayout() {
  const location = useLocation();

  const subNavItems = [
    { name: 'Tổng quan', path: '/tenant', icon: Home },
    { name: 'Hồ sơ thuê', path: '/tenant/applications', icon: FileText },
    { name: 'Hợp đồng điện tử', path: '/tenant/leases', icon: FileCheck },
    { name: 'Lịch hẹn xem', path: '/tenant/viewings', icon: Calendar },
    { name: 'Tin nhắn', path: '/tenant/chat', icon: MessageCircle },
    { name: 'Ở ghép', path: '/tenant/match', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans pt-[56px]">
      <GlobalNav />

      {/* Tenant Workspace Sub-Navigation Strip */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-[56px] z-30 shadow-2xs">
        <div className="container-dormi flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/tenant'
              ? location.pathname === '/tenant'
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

      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl 2xl:max-w-[1536px] mx-auto mb-12 md:mb-4">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
