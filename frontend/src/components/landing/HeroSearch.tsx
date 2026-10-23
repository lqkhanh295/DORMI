import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Coins, ShieldCheck, Map, X, Home, GraduationCap, Users, UserPlus, Award } from 'lucide-react';

interface HeroSearchProps {
  district: string;
  onDistrictChange: (d: string) => void;
  price: string;
  onPriceChange: (p: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  roomType?: string;
  onRoomTypeChange?: (t: string) => void;
  verifiedOnly?: boolean;
  onVerifiedOnlyChange?: (v: boolean) => void;
  onResetFilters?: () => void;
}

export function HeroSearch({
  district,
  onDistrictChange,
  price,
  onPriceChange,
  query,
  onQueryChange,
  roomType = '',
  onRoomTypeChange,
  verifiedOnly = false,
  onVerifiedOnlyChange,
  onResetFilters
}: HeroSearchProps) {
  const navigate = useNavigate();

  const handleOpenMap = () => {
    const params = new URLSearchParams();
    if (district) params.set('district', district);
    if (price) params.set('price', price);
    if (query) params.set('query', query);
    if (roomType) params.set('roomType', roomType);
    navigate(`/search?${params.toString()}`);
  };

  const hasActiveFilters = Boolean(district || price || query || roomType || verifiedOnly);

  const quickDistricts = ['Bình Thạnh', 'Quận 7', 'Thủ Đức', 'Quận 10', 'Tân Bình'];
  const quickUniversities = [
    { label: 'ĐH FPT', query: 'Đại học FPT' },
    { label: 'ĐHQG TP.HCM', query: 'ĐHQG TP.HCM' },
    { label: 'ĐH Bách Khoa', query: 'Đại học Bách Khoa' },
    { label: 'ĐH Kinh Tế (UEH)', query: 'UEH' },
    { label: 'ĐH SPKT', query: 'ĐH Sư Phạm Kỹ Thuật' }
  ];

  return (
    <section className="pt-6 pb-4 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="container-dormi space-y-4">
        
        {/* Hero Introduction & Top Call-To-Action (Modern Top Banner) */}
        <div className="bg-gradient-to-br from-white via-blue-50/40 to-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-900 text-xs font-bold border border-blue-200">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Dự án Nền tảng Lưu trú Sinh viên TP.HCM</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#00153D] tracking-tight leading-tight">
                Tìm Phòng Trọ & Bạn Cùng Phòng Thông Minh
              </h1>
              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                <strong>DORMI là dự án website hỗ trợ tìm phòng trọ và tìm bạn cùng phòng tại khu vực TP.HCM</strong> — tích hợp xác thực 3 lớp chống phòng ảo, bảo vệ tiền đặt cọc minh bạch và thuật toán ghép bạn ở ghép theo thói quen sinh hoạt.
              </p>
            </div>

            {/* Quick Actions & Group Jump */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenMap}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#00153D] bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
              >
                <Map className="w-4 h-4 text-blue-700" />
                <span>Xem trên bản đồ</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
              >
                <Award className="w-4 h-4 text-blue-700" />
                <span>Thông tin nhóm dự án</span>
              </button>
            </div>
          </div>

          {/* Call-to-Action Buttons on Top */}
          <div className="pt-3 border-t border-slate-200/70 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00153D] hover:bg-[#073372] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <Search className="w-4 h-4 text-[#F2A900]" />
              <span>Dùng thử tìm phòng</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/tenant/match')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F2A900] hover:bg-[#d99700] text-[#00153D] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              <Users className="w-4 h-4 text-[#00153D]" />
              <span>Tìm bạn ở ghép</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth?tab=register')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-[#0F172A] border border-slate-300 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-2xs active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Đăng ký tài khoản</span>
            </button>
          </div>
        </div>

        {/* Compact Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2 sm:p-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            
            {/* Search Keyword Input (4 cols) */}
            <div className="sm:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                aria-label="Tìm kiếm phòng theo khu vực, trường đại học, địa chỉ"
                placeholder="Tìm theo tên đường, trường ĐH, địa chỉ..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-transparent focus:border-[#00153D] rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 outline-none transition-all h-[42px]"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Xóa từ khóa tìm kiếm"
                  onClick={() => onQueryChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* District Select (2 cols) */}
            <div className="sm:col-span-2 relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                aria-label="Chọn khu vực, quận huyện"
                value={district}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-transparent focus:border-[#00153D] rounded-xl pl-8 pr-5 py-2 text-xs sm:text-sm text-[#0F172A] outline-none transition-all h-[42px] cursor-pointer appearance-none"
              >
                <option value="">Tất cả khu vực</option>
                <option value="Bình Thạnh">Bình Thạnh</option>
                <option value="Quận 7">Quận 7</option>
                <option value="Thủ Đức">TP. Thủ Đức</option>
                <option value="Quận 10">Quận 10</option>
                <option value="Quận 1">Quận 1</option>
                <option value="Quận 3">Quận 3</option>
                <option value="Tân Bình">Tân Bình</option>
                <option value="Gò Vấp">Gò Vấp</option>
                <option value="Phú Nhuận">Phú Nhuận</option>
              </select>
            </div>

            {/* Room Type Select (2 cols) */}
            <div className="sm:col-span-2 relative">
              <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                aria-label="Chọn loại phòng"
                value={roomType}
                onChange={(e) => onRoomTypeChange?.(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-transparent focus:border-[#00153D] rounded-xl pl-8 pr-5 py-2 text-xs sm:text-sm text-[#0F172A] outline-none transition-all h-[42px] cursor-pointer appearance-none"
              >
                <option value="">Tất cả loại phòng</option>
                <option value="Phòng đơn">Phòng đơn</option>
                <option value="Phòng ở ghép">Phòng ở ghép</option>
                <option value="Studio">Căn hộ / Studio</option>
                <option value="Nguyên căn">Nhà nguyên căn</option>
              </select>
            </div>

            {/* Price Select (2 cols) */}
            <div className="sm:col-span-2 relative">
              <Coins className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                aria-label="Chọn khoảng giá thuê phòng"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-transparent focus:border-[#00153D] rounded-xl pl-8 pr-5 py-2 text-xs sm:text-sm text-[#0F172A] outline-none transition-all h-[42px] cursor-pointer appearance-none"
              >
                <option value="">Tất cả giá</option>
                <option value="under3m">Dưới 3 triệu</option>
                <option value="3mTo5m">3 - 5 triệu</option>
                <option value="5mTo8m">5 - 8 triệu</option>
                <option value="above8m">Trên 8 triệu</option>
              </select>
            </div>

            {/* Quick Action Button (2 cols) */}
            <div className="sm:col-span-2">
              <button
                type="button"
                aria-label="Tìm kiếm phòng trọ"
                onClick={handleOpenMap}
                className="w-full h-[42px] bg-[#00153D] hover:bg-[#073372] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Tìm kiếm</span>
              </button>
            </div>

          </div>
        </div>

        {/* Quick Filter Pill Chips - Areas & Universities */}
        <div className="space-y-2 py-1 text-xs">
          {/* District Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-semibold shrink-0 mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Khu vực:
            </span>
            
            <button
              type="button"
              onClick={() => onDistrictChange('')}
              className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                !district 
                  ? 'bg-[#00153D] text-white shadow-2xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả khu vực
            </button>

            {quickDistricts.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDistrictChange(district === d ? '' : d)}
                className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                  district === d 
                    ? 'bg-[#00153D] text-white shadow-2xs' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {d}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onPriceChange(price === 'under3m' ? '' : 'under3m')}
              className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                price === 'under3m' 
                  ? 'bg-[#00153D] text-white shadow-2xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Dưới 3 triệu
            </button>

            <button
              type="button"
              onClick={() => onPriceChange(price === '3mTo5m' ? '' : '3mTo5m')}
              className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                price === '3mTo5m' 
                  ? 'bg-[#00153D] text-white shadow-2xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              3 - 5 triệu
            </button>

            {onVerifiedOnlyChange && (
              <button
                type="button"
                onClick={() => onVerifiedOnlyChange(!verifiedOnly)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
                  verifiedOnly 
                    ? 'bg-emerald-700 text-white shadow-2xs' 
                    : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Chủ trọ đã xác minh</span>
              </button>
            )}

            {hasActiveFilters && onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shrink-0 ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>

          {/* University Quick Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-semibold shrink-0 mr-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Trường ĐH:
            </span>
            {quickUniversities.map((u) => {
              const isSelected = query.toLowerCase() === u.query.toLowerCase() || query.toLowerCase() === u.label.toLowerCase();
              return (
                <button
                  key={u.label}
                  type="button"
                  onClick={() => onQueryChange(isSelected ? '' : u.query)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-2xs font-bold'
                      : 'bg-blue-50/70 hover:bg-blue-100/80 text-blue-800 border border-blue-200/60'
                  }`}
                >
                  <GraduationCap className="w-3 h-3 text-blue-600" />
                  <span>{u.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
