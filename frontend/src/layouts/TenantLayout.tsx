import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function TenantLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">DORMI.</Link>
        </div>
        <nav className="px-4 py-4 space-y-1">
          {[
            { name: 'Dashboard', path: '/tenant' },
            { name: 'Roommates', path: '/tenant/match' },
            { name: 'Messages', path: '/tenant/chat' },
            { name: 'Profile', path: '/tenant/profile' }
          ].map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-micro ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4">
          <span className="text-sm font-medium">{currentUser?.name}</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden">
            {currentUser?.avatar ? <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : 'T'}
          </div>
          <button onClick={handleLogout} className="text-xs text-red-600 hover:underline">Logout</button>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
