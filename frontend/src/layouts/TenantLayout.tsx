import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';

export default function TenantLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/tenant', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Roommates', path: '/tenant/match', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Messages', path: '/tenant/chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { name: 'Profile', path: '/tenant/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex pb-16 md:pb-0 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-neutral-100">
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary-600">DORMI</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={item.icon} />
                </svg>
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between md:justify-end px-4 md:px-6 gap-4 sticky top-0 z-40 shadow-sm">
          <div className="md:hidden">
            <Link to="/" className="text-xl font-bold tracking-tight text-primary-600">DORMI</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => alert('Tính năng Đăng tin đang được cập nhật!')} variant="outline" size="sm" className="hidden md:flex border-primary-600 text-primary-600 hover:bg-primary-50">Đăng tin</Button>
            <div className="h-6 w-px bg-neutral-200 hidden md:block"></div>
            <span className="text-sm font-medium hidden md:block text-neutral-700">{currentUser?.name}</span>
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold overflow-hidden border border-neutral-200 cursor-pointer">
              {currentUser?.avatar ? <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : 'T'}
            </div>
            <button onClick={handleLogout} className="text-xs text-neutral-500 hover:text-primary-600 hover:underline font-medium">Đăng xuất</button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 w-full">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-neutral-200 z-50 flex justify-around items-center h-16 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary-600' : 'text-neutral-500 hover:text-primary-600'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={item.icon} />
              </svg>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
