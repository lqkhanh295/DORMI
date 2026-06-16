import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Shield, Users, AlertTriangle, FileCheck, LogOut } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Shield className="w-5 h-5" />, label: 'Duyệt phòng', path: '/admin/rooms' },
    { icon: <Users className="w-5 h-5" />, label: 'Người dùng', path: '/admin/users' },
    { icon: <AlertTriangle className="w-5 h-5" />, label: 'Báo cáo', path: '/admin/reports' },
    { icon: <FileCheck className="w-5 h-5" />, label: 'Duyệt KYC', path: '/admin/kyc' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 fixed h-full z-40 bg-white/60 backdrop-blur-xl border-r border-white/40 shadow-sm flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/20">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Shield className="w-6 h-6" />
            <span>DORMI Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/50' 
                    : 'text-foreground/70 hover:bg-white/50 hover:text-foreground'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50/50 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-64 flex flex-col min-h-screen relative z-0">
        <header className="h-16 sticky top-0 z-30 bg-white/40 backdrop-blur-md border-b border-white/20 flex items-center px-8 justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {navItems.find(i => location.pathname.includes(i.path))?.label || 'Admin Control'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 font-bold">
              A
            </div>
          </div>
        </header>
        
        <div className="p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
