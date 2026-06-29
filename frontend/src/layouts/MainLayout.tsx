import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';

export default function MainLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
            DORMI.
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link to="/search" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-micro">Find Rooms</Link>
            <Link to="/tenant/match" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-micro">Roommates</Link>
          </nav>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to={currentUser.role === 'Tenant' ? '/tenant' : (currentUser.role === 'Landlord' ? '/landlord' : '/admin')} className="text-sm font-medium text-gray-900">
                  {currentUser.name}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
              </>
            ) : (
              <>
                <Link to="/auth"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link to="/auth"><Button variant="primary" size="sm">Sign up</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© 2026 Dormi Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
