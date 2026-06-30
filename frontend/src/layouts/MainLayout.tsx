import { Outlet, useLocation } from 'react-router-dom';
import { GlobalNav } from '../components/ui/GlobalNav';
import { GlobalFooter } from '../components/ui/GlobalFooter';

export default function MainLayout() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <GlobalNav />
      <main className="flex-1 pt-[60px]">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
