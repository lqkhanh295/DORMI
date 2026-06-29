import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function LandlordLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/landlord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Properties', path: '/landlord/rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Analytics', path: '/landlord/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Messages', path: '/landlord/chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex pb-16 md:pb-0">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-gray-900 text-white hidden md:block">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">DORMI <span className="text-blue-400 text-xs ml-1">LANDLORD</span></Link>
        </div>
        <nav className="px-4 py-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-micro ${isActive ? 'text-white bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between md:justify-end px-4 md:px-6 gap-4 sticky top-0 z-40">
          <div className="md:hidden">
            <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">DORMI.</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden md:block">{currentUser?.name}</span>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold overflow-hidden">
              {currentUser?.avatar ? <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : 'L'}
            </div>
            <button onClick={handleLogout} className="text-xs text-red-600 hover:underline">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 safe-area-pb">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
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
