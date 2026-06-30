import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlass, List, Bell, Plus, Users, CaretDown, ArrowLeft, SignIn, SignOut, SlidersHorizontal } from '@phosphor-icons/react';
import { useStore } from '../../store/useStore';

export function GlobalNav() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [quickSearch, setQuickSearch] = useState({ district: '', price: '', area: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);

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
              {currentUser?.role !== 'Tenant' && (
                <>
                  <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                  <Link to="/landlord" className="flex items-center gap-1.5 bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <Plus className="w-4 h-4" />
                    Đăng tin ngay
                  </Link>
                </>
              )}
            </div>

            {/* Notification & Avatar */}
            <div className="flex items-center gap-4 border-l border-white/10 pl-4 sm:pl-6">
              {!currentUser ? (
                <Link to="/auth" className="flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full">
                  <SignIn className="w-4 h-4" />
                  Đăng nhập
                </Link>
              ) : (
                <>
                  <button className="relative text-white/80 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#1d1d1f] rounded-full"></span>
                  </button>
                  
                  <div className="relative group">
                    <Link to={currentUser.role === 'Landlord' ? '/landlord' : currentUser.role === 'Admin' ? '/admin' : '/tenant'} title={`Đến trang Quản lý (${currentUser.role === 'Tenant' ? 'Người thuê' : currentUser.role === 'Landlord' ? 'Chủ nhà' : 'Quản trị viên'})`} className="flex items-center gap-2 cursor-pointer">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover:border-white/50 transition-colors">
                        <img src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <CaretDown className="w-3 h-3 text-white/50 group-hover:text-white transition-colors hidden sm:block" />
                    </Link>
                    
                    {/* Dropdown Menu on hover */}
                    <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[160px] flex flex-col">
                        <div className="px-3 py-2 border-b border-gray-50 mb-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {currentUser.role === 'Tenant' ? 'Người thuê' : currentUser.role === 'Landlord' ? 'Chủ nhà' : 'Quản trị viên'}
                          </p>
                        </div>
                        <button 
                          onClick={() => logout()}
                          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-left"
                        >
                          <SignOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Khu vực phổ biến</label>
                <div className="flex flex-wrap gap-2">
                  {['Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Gò Vấp', 'Làng Đại Học'].map(district => (
                    <button 
                      key={district}
                      type="button"
                      onClick={() => setQuickSearch({...quickSearch, district})}
                      className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${quickSearch.district === district ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-500'}`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button type="button" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                  <SlidersHorizontal className="w-4 h-4" />
                  Bộ lọc nâng cao
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowSearchModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                    Huỷ
                  </button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                    Tìm kiếm ngay
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
