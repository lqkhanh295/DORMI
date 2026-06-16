import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ClipboardCheck, PlusSquare, FolderOpen, Calendar, MessageSquare, LogOut } from 'lucide-react';

export function LandlordLayout() {
  const location = useLocation();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/landlord/dashboard' },
    { icon: <ClipboardCheck className="w-5 h-5" />, label: 'KYC', path: '/landlord/kyc' },
    { icon: <PlusSquare className="w-5 h-5" />, label: 'Tạo phòng', path: '/landlord/create-room' },
    { icon: <FolderOpen className="w-5 h-5" />, label: 'Phòng của tôi', path: '/landlord/rooms' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Lịch hẹn', path: '/landlord/appointments' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Tin nhắn', path: '/landlord/messages' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Home className="w-6 h-6" />
            <span>DORMI Landlord</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/50' 
                      : 'text-foreground/70 hover:bg-white/50 hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50/50 transition-all duration-200">
            <LogOut className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 font-bold">
            L
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 flex flex-col min-h-screen relative z-0">
        <div className="h-14 sticky top-16 z-30 bg-white/40 backdrop-blur-md border-b border-white/20 flex items-center px-8">
          <h2 className="text-lg font-bold text-foreground">
            {navItems.find(i => location.pathname.includes(i.path))?.label || 'Dashboard'}
          </h2>
        </div>
        
        <div className="p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
