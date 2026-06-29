import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, User, List } from '@phosphor-icons/react';

export function GlobalNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

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
        <div className="hidden sm:flex h-full items-center gap-6 text-[12px] font-medium text-[#f5f5f7]">
          <Link to="/search" className="hover:opacity-70 transition-opacity tracking-wide">Phòng trọ</Link>
          <Link to="/search" className="hover:opacity-70 transition-opacity tracking-wide">Studio</Link>
          <Link to="/search" className="hover:opacity-70 transition-opacity tracking-wide">Căn hộ</Link>
          <Link to="/search" className="hover:opacity-70 transition-opacity tracking-wide">Ký túc xá</Link>
          <Link to="/customer/matcher" className="hover:opacity-70 transition-opacity tracking-wide">Ghép phòng AI</Link>
        </div>

        {/* Search & Login */}
        <div className="flex h-[44px] items-center gap-4 text-[#f5f5f7]">
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white/10 rounded-full px-3 py-1 border border-white/20 focus-within:border-white/50 transition-colors">
            <MagnifyingGlass className="h-[14px] w-[14px] text-white/70" />
            <input 
              type="text" 
              placeholder="Tìm khu vực..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-[12px] text-white placeholder-white/50 focus:outline-none ml-2 w-[120px]"
            />
          </form>
          <Link to="/login" className="flex h-full items-center justify-center gap-2 hover:opacity-70 transition-opacity">
            <User className="h-[15px] w-[15px]" />
            <span className="hidden sm:inline text-[12px] font-medium">Đăng nhập</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
