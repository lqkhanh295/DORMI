import { Outlet, Link } from 'react-router-dom';
import { LogIn, Search } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

export function GuestLayout() {
  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-line/70 bg-background/82 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-foreground">
            <span>DORMI</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted md:flex">
            <Link to="/" className="transition-colors hover:text-foreground">Phòng đang cho thuê</Link>
            <Link to="/search" className="transition-colors hover:text-foreground">Tìm phòng</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block">
              <GlassButton variant="ghost" leftIcon={<LogIn className="h-4 w-4" />}>
                Đăng nhập
              </GlassButton>
            </Link>
            <Link to="/search">
              <GlassButton variant="primary" leftIcon={<Search className="h-4 w-4" />}>
                Tìm phòng
              </GlassButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-line bg-background">
        <div className="section-shell flex flex-col gap-2 py-8 text-sm md:flex-row md:items-center md:justify-between">
          <p className="text-muted">&copy; {new Date().getFullYear()} DORMI. Nền tảng tìm phòng cho sinh viên.</p>
          <p className="text-muted">Chỉ hiển thị phòng đang cho thuê cho người chưa đăng nhập.</p>
        </div>
      </footer>
    </div>
  );
}
