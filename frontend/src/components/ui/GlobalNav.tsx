import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlass, List, Bell, Plus, Users, CaretDown, ArrowLeft } from '@phosphor-icons/react';

export function GlobalNav() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [quickSearch, setQuickSearch] = useState({ district: '', price: '', area: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchModal(false);
    navigate(`/search?district=${quickSearch.district}&price=${quickSearch.price}`);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[9990] h-[60px] bg-[rgba(29,29,31,0.85)] backdrop-blur-[20px] saturate-[180%] border-b border-white/10 transition-all duration-300">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
          
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            {location.pathname !== '/' && (
              <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white transition-colors" title="Quay lại">
                <ArrowLeft className="w-5 h-5" weight="bold" />
              </button>
            )}
            <button className="text-white/80 hover:text-white sm:hidden">
              <List className="h-6 w-6" />
            </button>
            <Link to="/" className="text-[22px] font-black tracking-widest text-white hover:opacity-80 transition-opacity">
              DORMI<span className="text-blue-500">.</span>
            </Link>
          </div>

          {/* Centered Search Bar */}
          <div className="hidden md:flex flex-1 max-w-[400px] mx-8">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="flex items-center w-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-full px-4 py-2 transition-all duration-200 text-white/60 text-sm group"
            >
              <MagnifyingGlass className="h-4 w-4 mr-2 group-hover:text-white transition-colors" />
              <span className="flex-1 text-left">Tìm quận, giá, diện tích...</span>
            </button>
          </div>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden lg:flex items-center gap-3 text-sm font-medium">
              <Link to="/tenant/match" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
                <Users className="w-4 h-4" />
                Tìm bạn ở ghép
              </Link>
              <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
              <Link to="/landlord" className="flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Plus className="w-4 h-4" />
                Đăng tin ngay
              </Link>
            </div>

            {/* Notification & Avatar */}
            <div className="flex items-center gap-4 border-l border-white/10 pl-4 sm:pl-6">
              <button className="relative text-white/80 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#1d1d1f] rounded-full"></span>
              </button>
              
              <Link to="/tenant" title="Đến trang Quản lý Người thuê (Tenant)" className="flex items-center gap-2 group cursor-pointer">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover:border-white/50 transition-colors">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <CaretDown className="w-3 h-3 text-white/50 group-hover:text-white transition-colors hidden sm:block" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 animate-fade-in" onClick={() => setShowSearchModal(false)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <MagnifyingGlass className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Nhập tên đường, quận, trường đại học..." 
                autoFocus
                className="flex-1 text-lg outline-none bg-transparent placeholder-gray-400 text-gray-900"
              />
              <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                ESC
              </button>
            </div>
            
            <form onSubmit={handleQuickSearch} className="p-6 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Khu vực</label>
                  <select 
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={quickSearch.district}
                    onChange={e => setQuickSearch({...quickSearch, district: e.target.value})}
                  >
                    <option value="">Tất cả các quận</option>
                    <option value="D1">Quận 1</option>
                    <option value="D3">Quận 3</option>
                    <option value="D7">Quận 7</option>
                    <option value="BinhThanh">Bình Thạnh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mức giá</label>
                  <select 
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={quickSearch.price}
                    onChange={e => setQuickSearch({...quickSearch, price: e.target.value})}
                  >
                    <option value="">Mọi mức giá</option>
                    <option value="under3">Dưới 3 triệu</option>
                    <option value="3to5">3 - 5 triệu</option>
                    <option value="over5">Trên 5 triệu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Loại phòng</label>
                  <select 
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={quickSearch.area}
                    onChange={e => setQuickSearch({...quickSearch, area: e.target.value})}
                  >
                    <option value="">Tất cả</option>
                    <option value="studio">Studio</option>
                    <option value="ktx">Ký túc xá</option>
                    <option value="apartment">Căn hộ</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowSearchModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Huỷ
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                  Tìm kiếm ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
