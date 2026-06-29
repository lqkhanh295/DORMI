import { Outlet } from 'react-router-dom';
import { GlobalNav } from '../components/ui/GlobalNav';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <GlobalNav />
      <main className="flex-1 pt-[60px]">
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
