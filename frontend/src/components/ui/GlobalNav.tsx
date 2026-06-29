import { Link } from 'react-router-dom';
import { MagnifyingGlass, User, List } from '@phosphor-icons/react';

export function GlobalNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] h-[44px] bg-[rgba(29,29,31,0.72)] backdrop-blur-[20px] saturate-[180%] transition-all duration-300">
      <div className="mx-auto flex h-full max-w-[980px] items-center justify-between px-4 sm:px-6">
        {/* Mobile menu button */}
        <button className="flex h-[44px] items-center justify-center text-white/80 hover:text-white sm:hidden">
          <List className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex h-[44px] items-center justify-center px-2 text-[17px] font-semibold tracking-wide text-[#f5f5f7] hover:opacity-80 transition-opacity">
          DORMI
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex h-full items-center gap-8 text-[12px] font-medium text-[#f5f5f7]">
          <Link to="/search" className="hover:opacity-70 transition-opacity tracking-wide">Phòng trọ</Link>
          <Link to="/search" className="hover:opacity-70 transition-opacity tracking-wide">Studio</Link>
          <Link to="/search" className="hover:opacity-70 transition-opacity tracking-wide">Căn hộ</Link>
          <Link to="/search" className="hover:opacity-70 transition-opacity tracking-wide">Ký túc xá</Link>
          <Link to="/search" className="hover:opacity-70 transition-opacity tracking-wide">AI Matcher</Link>
        </div>

        {/* Icons */}
        <div className="flex h-[44px] items-center gap-4 text-[#f5f5f7]">
          <button className="flex h-full items-center justify-center hover:opacity-70 transition-opacity">
            <MagnifyingGlass className="h-[15px] w-[15px]" />
          </button>
          <Link to="/login" className="flex h-full items-center justify-center gap-2 hover:opacity-70 transition-opacity">
            <User className="h-[15px] w-[15px]" />
            <span className="hidden sm:inline text-[12px] font-medium">Đăng nhập</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
