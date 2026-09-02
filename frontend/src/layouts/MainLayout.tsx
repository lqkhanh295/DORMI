import { Outlet, useLocation } from 'react-router-dom';
import { GlobalNav } from '../components/ui/GlobalNav';
import { GlobalFooter } from '../components/ui/GlobalFooter';

export default function MainLayout() {
  const location = useLocation();
  
  // ponytail: MainLayout canvas bg #F8FAFC, padding-top 56px for navbar
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1F2937]">
      <GlobalNav />
      <main className="flex-1 pt-[56px]">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
