import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';

export default function MainLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900" onClick={closeMenu}>
            DORMI.
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/search" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-micro">Find Rooms</Link>
            <Link to="/tenant/match" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-micro">Roommates</Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg absolute w-full">
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              <Link to="/search" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Find Rooms</Link>
              <Link to="/tenant/match" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md" onClick={closeMenu}>Roommates</Link>
              
              <div className="border-t border-gray-100 pt-4 mt-2">
                {currentUser ? (
                  <div className="flex flex-col space-y-2">
                    <Link to={currentUser.role === 'Tenant' ? '/tenant' : (currentUser.role === 'Landlord' ? '/landlord' : '/admin')} className="block px-3 py-2 text-base font-medium text-blue-600" onClick={closeMenu}>
                      Dashboard ({currentUser.name})
                    </Link>
                    <button onClick={handleLogout} className="text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 w-full">Log out</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 px-3">
                    <Link to="/auth" onClick={closeMenu}><Button variant="outline" fullWidth>Log in</Button></Link>
                    <Link to="/auth" onClick={closeMenu}><Button variant="primary" fullWidth>Sign up</Button></Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
