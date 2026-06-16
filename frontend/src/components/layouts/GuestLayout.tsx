import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

export function GuestLayout() {
  return (
    <div className="min-h-screen flex flex-col relative z-0">
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/50 border-b border-white/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-2xl">
            <Home className="w-6 h-6" />
            <span>DORMI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-foreground/80 font-medium">
            <Link to="/search" className="hover:text-primary transition-colors">Tìm phòng</Link>
            <Link to="/about" className="hover:text-primary transition-colors">Về chúng tôi</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Liên hệ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <GlassButton variant="ghost">Đăng nhập</GlassButton>
            </Link>
            <Link to="/register">
              <GlassButton variant="primary">Đăng ký</GlassButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-white/30 backdrop-blur-md border-t border-white/20 mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} DORMI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
