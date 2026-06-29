import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function AdminLayout() {
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
      <aside className="w-64 bg-red-900 text-white hidden md:block">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">DORMI <span className="text-red-400 text-xs ml-1">ADMIN</span></Link>
        </div>
        <nav className="px-4 py-4 space-y-1">
          {[
            { name: 'Dashboard', path: '/admin' },
            { name: 'Verifications', path: '/admin/verify' },
            { name: 'Moderation', path: '/admin/content' }
          ].map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-micro ${isActive ? 'text-white bg-red-800' : 'text-red-300 hover:text-white hover:bg-red-800'}`}
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
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold overflow-hidden">
            A
          </div>
          <button onClick={handleLogout} className="text-xs text-red-600 hover:underline">Logout</button>
        </header>
        <main className="p-6">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
