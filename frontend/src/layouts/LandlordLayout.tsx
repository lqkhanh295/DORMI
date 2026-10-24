import { useEffect, useRef } from 'react';
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
  Zap,
  Receipt
} from 'lucide-react';

export default function LandlordLayout() {
  const location = useLocation();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  const subNavItems = [
    { name: 'Tổng quan', path: '/landlord', icon: LayoutDashboard },
    { name: 'Phòng của tôi', path: '/landlord/rooms', icon: Home },
    { name: 'Hồ sơ thuê', path: '/landlord/applications', icon: FileText },
    { name: 'Hợp đồng thuê', path: '/landlord/leases', icon: FileCheck },
    { name: 'Lịch xem phòng', path: '/landlord/viewings', icon: Calendar },
    { name: 'Thống kê tin đăng', path: '/landlord/analytics', icon: BarChart3 },
    { name: 'Gói dịch vụ', path: '/landlord/pricing', icon: Zap },
    { name: 'Lịch sử giao dịch', path: '/landlord/billing', icon: Receipt },
  ];

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [location.pathname]);

  const isFixedViewportPage = location.pathname === '/landlord/chat';

  return (
    <div className={`${isFixedViewportPage ? 'h-[calc(100vh-56px)] mt-[56px] overflow-hidden' : 'min-h-screen pt-[56px]'} bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans`}>
      <GlobalNav />

      {/* Landlord Workspace Sub-Navigation Strip */}
      <div className="bg-white border-b border-[#E2E8F0] z-30 shadow-2xs shrink-0">
        <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={navContainerRef}
            className="flex items-center justify-start md:justify-center gap-1 sm:gap-1.5 lg:gap-2 overflow-x-auto py-2 px-1 scrollbar-none scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {subNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/landlord'
                ? location.pathname === '/landlord'
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  ref={isActive ? activeTabRef : null}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-[#64748B]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {/* Trailing spacing buffer so the last tab never touches the right edge when scrolled on mobile */}
            <div className="w-3 sm:w-6 shrink-0 md:hidden" aria-hidden="true" />
          </div>
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
