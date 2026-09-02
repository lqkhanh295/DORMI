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

  // ponytail: Navbar height 56px, clay level 1 shadow, 44px touch targets
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[9990] h-[56px] bg-white shadow-[0_10px_20px_-10px_rgba(99,102,241,0.10),inset_0_-4px_0_0_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.9)] border-b border-[#E5E7EB] transition-all duration-300">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
          
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-4">
            {location.pathname !== '/' && (
              <button onClick={() => navigate(-1)} className="text-[#4B5563] hover:text-[#1F2937] transition-colors touch-target flex items-center justify-center" title="Quay lại">
                <ArrowLeft className="w-5 h-5" weight="bold" />
              </button>
            )}
            <button className="text-[#4B5563] hover:text-[#1F2937] sm:hidden touch-target flex items-center justify-center">
              <List className="h-6 w-6" />
            </button>
            <Link to="/" className="text-[22px] font-black tracking-widest text-[#1F2937] hover:opacity-80 transition-opacity">
              DORMI<span className="text-[#6366F1]">.</span>
            </Link>
          </div>

          {/* Centered Search Bar */}
          <div className="hidden md:flex flex-1 max-w-[400px] mx-8">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="flex items-center w-full bg-[#F3F4F6] hover:bg-white border border-[#D1D5DB] focus:border-[#6366F1] rounded-full px-4 py-2 transition-all duration-200 text-[#6B7280] text-sm group touch-target"
            >
              <MagnifyingGlass className="h-4 w-4 mr-2 group-hover:text-[#6366F1] transition-colors" />
              <span className="flex-1 text-left">Tìm quận, giá, diện tích...</span>
            </button>
          </div>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden lg:flex items-center gap-3 text-sm font-medium">
              <Link to="/tenant/match" className="flex items-center gap-1.5 text-[#4B5563] hover:text-[#6366F1] transition-colors touch-target py-2">
                <Users className="w-4 h-4" />
                Tìm bạn ở ghép
              </Link>
              {currentUser?.role !== 'Tenant' && (
                <>
                  <div className="w-[1px] h-4 bg-[#E5E7EB] mx-1"></div>
                  <Link to="/landlord" className="flex items-center gap-1.5 bg-[#EEF2FF] text-[#4F46E5] font-semibold border border-[#6366F1]/20 px-4 py-2 rounded-full hover:bg-[#6366F1] hover:text-white transition-all shadow-sm touch-target">
                    <Plus className="w-4 h-4" />
                    Đăng tin ngay
                  </Link>
                </>
              )}
            </div>

            {/* Notification & Avatar */}
            <div className="flex items-center gap-4 border-l border-[#E5E7EB] pl-4 sm:pl-6">
              {!currentUser ? (
                <Link to="/auth" className="btn-clay-primary flex items-center gap-2 text-sm font-medium">
                  <SignIn className="w-4 h-4" />
                  Đăng nhập
                </Link>
              ) : (
                <>
                  <button className="relative text-[#4B5563] hover:text-[#1F2937] transition-colors touch-target flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FEE2E2] border-2 border-white rounded-full"></span>
                  </button>
                  
                  <div className="relative group">
                    <Link to={currentUser.role === 'Landlord' ? '/landlord' : currentUser.role === 'Admin' ? '/admin' : '/tenant'} title={`Đến trang Quản lý (${currentUser.role === 'Tenant' ? 'Người thuê' : currentUser.role === 'Landlord' ? 'Chủ nhà' : 'Quản trị viên'})`} className="flex items-center gap-2 cursor-pointer touch-target">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E5E7EB] group-hover:border-[#6366F1] transition-colors">
                        <img src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <CaretDown className="w-3 h-3 text-[#6B7280] group-hover:text-[#1F2937] transition-colors hidden sm:block" />
                    </Link>
                    
                    {/* Dropdown Menu on hover */}
                    <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white rounded-[16px] shadow-[0_10px_20px_-10px_rgba(99,102,241,0.15)] border border-[#E5E7EB] p-2 min-w-[160px] flex flex-col">
                        <div className="px-3 py-2 border-b border-[#F3F4F6] mb-1">
                          <p className="text-sm font-bold text-[#1F2937] truncate">{currentUser.name}</p>
                          <p className="text-xs text-[#6B7280] truncate">
                            {currentUser.role === 'Tenant' ? 'Người thuê' : currentUser.role === 'Landlord' ? 'Chủ nhà' : 'Quản trị viên'}
                          </p>
                        </div>
                        <button 
                          onClick={() => logout()}
                          className="flex items-center gap-2 text-sm font-medium text-[#991B1B] hover:bg-[#FEE2E2] px-3 py-2 rounded-[12px] transition-colors text-left"
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

      {/* Quick Search Modal (Functional Clay Spec: Max-width 480px, Level 3 clay shadow, 32px radius) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowSearchModal(false)}>
          <div className="bg-white w-full max-w-[480px] rounded-[32px] p-6 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.20),inset_0_-8px_0_0_rgba(0,0,0,0.05),inset_0_3px_6px_rgba(255,255,255,0.8)] overflow-hidden border border-[#E5E7EB]" onClick={e => e.stopPropagation()}>
            <div className="pb-4 border-b border-[#E5E7EB] flex items-center gap-3">
              <MagnifyingGlass className="w-5 h-5 text-[#6B7280]" />
              <input 
                type="text" 
                placeholder="Nhập tên đường, quận, trường..." 
                autoFocus
                className="flex-1 text-lg outline-none bg-transparent placeholder-[#9CA3AF] text-[#1F2937]"
              />
              <button onClick={() => setShowSearchModal(false)} className="text-[#6B7280] hover:text-[#1F2937] text-xs font-semibold bg-[#F3F4F6] px-2.5 py-1 rounded-full">
                ESC
              </button>
            </div>
            
            <form onSubmit={handleQuickSearch} className="pt-6">
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Khu vực phổ biến</label>
                <div className="flex flex-wrap gap-2">
                  {['Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Gò Vấp', 'Làng Đại Học'].map(district => (
                    <button 
                      key={district}
                      type="button"
                      onClick={() => setQuickSearch({...quickSearch, district})}
                      className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors min-h-[44px] ${quickSearch.district === district ? 'bg-[#6366F1] text-white border-[#6366F1]' : 'bg-[#F3F4F6] text-[#4B5563] border-transparent hover:bg-white hover:border-[#D1D5DB]'}`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <button type="button" className="text-sm text-[#6366F1] font-semibold hover:underline flex items-center gap-1 min-h-[44px]">
                  <SlidersHorizontal className="w-4 h-4" />
                  Bộ lọc nâng cao
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowSearchModal(false)} className="px-4 py-2 text-sm font-medium text-[#4B5563] hover:text-[#1F2937] min-h-[44px]">
                    Huỷ
                  </button>
                  <button type="submit" className="btn-clay-primary text-sm font-medium">
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
