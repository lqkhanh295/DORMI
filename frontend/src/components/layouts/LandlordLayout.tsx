import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, ClipboardCheck, FolderOpen, Home, LogOut, MessageSquare, PlusSquare } from 'lucide-react';

export function LandlordLayout() {
  const location = useLocation();

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Tổng quan', path: '/landlord/dashboard' },
    { icon: <ClipboardCheck className="h-5 w-5" />, label: 'Xác minh KYC', path: '/landlord/kyc' },
    { icon: <PlusSquare className="h-5 w-5" />, label: 'Tạo phòng', path: '/landlord/create-room' },
    { icon: <FolderOpen className="h-5 w-5" />, label: 'Phòng của tôi', path: '/landlord/rooms' },
    { icon: <Calendar className="h-5 w-5" />, label: 'Lịch hẹn', path: '/landlord/appointments' },
    { icon: <MessageSquare className="h-5 w-5" />, label: 'Tin nhắn', path: '/landlord/messages' },
  ];

  const currentTitle = navItems.find((item) => location.pathname.includes(item.path))?.label || 'Tổng quan';

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-line bg-surface/92 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2 text-2xl font-extrabold text-foreground">
          <Home className="h-6 w-6" />
          <span>DORMI</span>
        </Link>

        <div className="mb-5 rounded-lg border border-line bg-[#f7f8f3] p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Vai trò</p>
          <p className="mt-1 text-lg font-extrabold">Chủ phòng</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_10px_24px_rgba(17,24,39,0.12)]'
                    : 'text-muted hover:bg-[#f0f2ea] hover:text-foreground'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 border-t border-line pt-4">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-red-500 hover:bg-red-50">
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-line bg-surface/92 px-4 py-3 backdrop-blur-xl lg:ml-72 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Chủ phòng</p>
            <h1 className="text-xl font-extrabold text-foreground">{currentTitle}</h1>
          </div>
          <Link to="/" className="rounded-lg border border-line p-2 text-red-500 lg:hidden" aria-label="Đăng xuất">
            <LogOut className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="min-h-screen p-4 sm:p-6 lg:ml-72 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
