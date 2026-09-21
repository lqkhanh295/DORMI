import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentsApi, favoritesApi } from '../../services/api';
import { toast } from 'sonner';
import { 
  Calendar, Heart, Search, PlusCircle, 
  MapPin, ShieldCheck, Clock, Trash2, ArrowRight,
  Home, Eye, ArrowUpDown, X
} from 'lucide-react';

const getCleanPrice = (price: any): number => {
  if (typeof price === 'number' && !isNaN(price)) return price;
  if (!price) return 0;
  const cleaned = Number(String(price).replace(/[^\d.-]/g, ''));
  return isNaN(cleaned) ? 0 : cleaned;
};

const getCleanArea = (area: any): number => {
  if (typeof area === 'number' && !isNaN(area)) return area;
  if (!area) return 0;
  const cleaned = Number(String(area).replace(/[^\d.-]/g, ''));
  return isNaN(cleaned) ? 0 : cleaned;
};

const getTimestamp = (val: any): number => {
  if (!val) return 0;
  const time = new Date(val).getTime();
  return isNaN(time) ? 0 : time;
};

export default function TenantDashboard() {
  const { listings, fetchListings, currentUser } = useStore();
  const navigate = useNavigate();

  // Tab control: 'rooms' is primary default when logging in
  const [activeTab, setActiveTab] = useState<'rooms' | 'appointments' | 'favorites'>('rooms');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingApts, setLoadingApts] = useState(true);
  const [loadingFavs, setLoadingFavs] = useState(true);

  // Filters for available rooms
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [filter3D, setFilter3D] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'area-desc' | 'area-asc' | 'verified'>('newest');
  const [visibleCount, setVisibleCount] = useState(12);

  const loadData = async () => {
    try {
      setLoadingApts(true);
      const apts = await appointmentsApi.getMyAppointments();
      if (Array.isArray(apts)) setAppointments(apts);
    } catch (err) {
      console.warn('Failed to load appointments:', err);
    } finally {
      setLoadingApts(false);
    }

    try {
      setLoadingFavs(true);
      const favs = await favoritesApi.getFavorites();
      if (Array.isArray(favs)) setFavorites(favs);
    } catch (err) {
      console.warn('Failed to load favorites:', err);
    } finally {
      setLoadingFavs(false);
    }
  };

  useEffect(() => {
    fetchListings();
    loadData();
  }, [fetchListings]);

  const isRoomFavorite = (roomId: string) => favorites.some(f => f.id === roomId);

  const handleToggleFavorite = async (roomId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isFav = isRoomFavorite(roomId);
    try {
      if (isFav) {
        await favoritesApi.removeFavorite(roomId);
        setFavorites(prev => prev.filter(f => f.id !== roomId));
        toast.success('Đã xóa khỏi danh sách yêu thích.');
      } else {
        await favoritesApi.addFavorite(roomId);
        const targetRoom = listings.find(l => l.id === roomId);
        setFavorites(prev => [...prev, targetRoom || { id: roomId }]);
        toast.success('Đã lưu vào danh sách yêu thích!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật danh sách yêu thích.');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn xem phòng này?')) return;
    try {
      await appointmentsApi.updateStatus(id, 'Cancelled');
      toast.success('Đã hủy lịch hẹn xem phòng.');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hủy lịch hẹn.');
    }
  };

  // Filtered available rooms
  const filteredRooms = useMemo(() => {
    let result = listings.filter(r => r.status === 'Available' || !r.status);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.address.toLowerCase().includes(q) ||
        (r.type && r.type.toLowerCase().includes(q))
      );
    }

    if (selectedDistrict) {
      result = result.filter(r => r.address.toLowerCase().includes(selectedDistrict.toLowerCase()));
    }

    if (selectedPrice === 'under3m') {
      result = result.filter(r => r.price < 3000000);
    } else if (selectedPrice === '3mTo5m') {
      result = result.filter(r => r.price >= 3000000 && r.price <= 5000000);
    } else if (selectedPrice === '5mTo8m') {
      result = result.filter(r => r.price >= 5000000 && r.price <= 8000000);
    } else if (selectedPrice === 'above8m') {
      result = result.filter(r => r.price > 8000000);
    }

    if (filter3D) {
      result = result.filter(r => Boolean(r.virtual3DUrl));
    }

    if (filterVerified) {
      result = result.filter(r => Boolean(r.isVerifiedLandlord));
    }

    const sorted = [...result];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => getCleanPrice(a.price) - getCleanPrice(b.price));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => getCleanPrice(b.price) - getCleanPrice(a.price));
    } else if (sortBy === 'area-asc') {
      sorted.sort((a, b) => getCleanArea(a.area) - getCleanArea(b.area));
    } else if (sortBy === 'area-desc') {
      sorted.sort((a, b) => getCleanArea(b.area) - getCleanArea(a.area));
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => (getTimestamp(a.createdAt) || 0) - (getTimestamp(b.createdAt) || 0));
    } else if (sortBy === 'verified') {
      sorted.sort((a, b) => {
        const vA = a.isVerifiedLandlord ? 1 : 0;
        const vB = b.isVerifiedLandlord ? 1 : 0;
        if (vB !== vA) return vB - vA;
        return (getTimestamp(b.createdAt) || 0) - (getTimestamp(a.createdAt) || 0);
      });
    } else {
      // Default: 'newest'
      sorted.sort((a, b) => (getTimestamp(b.createdAt) || 0) - (getTimestamp(a.createdAt) || 0));
    }

    return sorted;
  }, [listings, searchQuery, selectedDistrict, selectedPrice, filter3D, filterVerified, sortBy]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedDistrict || selectedPrice || filter3D || filterVerified
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDistrict(null);
    setSelectedPrice(null);
    setFilter3D(false);
    setFilterVerified(false);
    setSortBy('newest');
  };

  const districts = ['Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Tân Bình', 'Thủ Đức'];

  const priceOptions = [
    { label: 'Dưới 3tr', val: 'under3m' },
    { label: '3 - 5tr', val: '3mTo5m' },
    { label: '5 - 8tr', val: '5mTo8m' },
    { label: 'Trên 8tr', val: 'above8m' },
  ];

  return (
    <div className="space-y-6 pb-16 bg-[#F5F7FA]">
      {/* Top Banner & Fast Search */}
      <div className="bg-white p-6 md:p-8 rounded-[18px] shadow-clay-primary space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-h2 font-bold text-[#0F172A] tracking-tight">
              Xin chào{currentUser?.name ? `, ${currentUser.name}` : ''}!
            </h1>
            <p className="text-body text-[#64748B] mt-1">
              Khám phá danh sách phòng trọ & căn hộ cho thuê phù hợp với bạn nhất.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/search')} 
              className="flex items-center gap-1.5 min-h-[42px]"
            >
              <MapPin className="w-4 h-4 text-[#2563EB]" /> Bản đồ tìm kiếm
            </Button>
            <Link to="/tenant/post">
              <Button variant="primary" className="flex items-center gap-1.5 min-h-[42px]">
                <PlusCircle className="w-4 h-4" /> Đăng tin ở ghép
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-[#64748B]" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm phòng theo tên đường, quận huyện, trường học, tiện ích..." 
            className="w-full pl-12 pr-10 py-3 bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[14px] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white transition-all text-body text-[#0F172A] placeholder-[#94A3B8] min-h-[48px]"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-[#94A3B8] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3 Interactive Quick Tabs (Prioritizing Rooms) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E2E8F0]">
          {/* Tab 1: Available Rooms (Default Active) */}
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`p-3.5 rounded-[14px] border text-left transition-all flex items-center justify-between ${
              activeTab === 'rooms' 
                ? 'bg-blue-50/80 border-blue-500/40 shadow-clay-soft ring-1 ring-blue-500/20' 
                : 'bg-[#F5F7FA] border-[#E2E8F0] hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'rooms' ? 'bg-blue-600 text-white' : 'bg-blue-100/80 text-blue-700'
              }`}>
                <Home className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-caption font-semibold ${activeTab === 'rooms' ? 'text-blue-900' : 'text-[#64748B]'}`}>
                  Danh sách phòng hiện có
                </p>
                <p className="text-h3 font-bold text-[#0F172A]">
                  {listings.length} phòng đang thuê
                </p>
              </div>
            </div>
            {activeTab === 'rooms' && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shrink-0">
                Ưu tiên
              </span>
            )}
          </button>

          {/* Tab 2: Appointments */}
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`p-3.5 rounded-[14px] border text-left transition-all flex items-center justify-between ${
              activeTab === 'appointments' 
                ? 'bg-blue-50/80 border-blue-500/40 shadow-clay-soft ring-1 ring-blue-500/20' 
                : 'bg-[#F5F7FA] border-[#E2E8F0] hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'appointments' ? 'bg-indigo-600 text-white' : 'bg-indigo-100/80 text-indigo-700'
              }`}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-caption font-semibold ${activeTab === 'appointments' ? 'text-indigo-900' : 'text-[#64748B]'}`}>
                  Lịch hẹn xem phòng
                </p>
                <p className="text-h3 font-bold text-[#0F172A]">
                  {appointments.length} cuộc hẹn
                </p>
              </div>
            </div>
            {appointments.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                {appointments.length}
              </span>
            )}
          </button>

          {/* Tab 3: Favorites */}
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`p-3.5 rounded-[14px] border text-left transition-all flex items-center justify-between ${
              activeTab === 'favorites' 
                ? 'bg-rose-50/80 border-rose-500/40 shadow-clay-soft ring-1 ring-rose-500/20' 
                : 'bg-[#F5F7FA] border-[#E2E8F0] hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeTab === 'favorites' ? 'bg-rose-600 text-white' : 'bg-rose-100/80 text-rose-700'
              }`}>
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-caption font-semibold ${activeTab === 'favorites' ? 'text-rose-900' : 'text-[#64748B]'}`}>
                  Phòng đã lưu (Wishlist)
                </p>
                <p className="text-h3 font-bold text-[#0F172A]">
                  {favorites.length} phòng đã lưu
                </p>
              </div>
            </div>
            {favorites.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: DANH SÁCH PHÒNG HIỆN CÓ (TOP PRIORITY VIEW)             */}
      {/* ============================================================ */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="bg-white p-4 md:p-5 rounded-[18px] shadow-clay-soft border border-[#E2E8F0] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* District Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-caption font-bold text-[#64748B] shrink-0 mr-1">Khu vực:</span>
                <button
                  type="button"
                  onClick={() => setSelectedDistrict(null)}
                  className={`px-3 py-1.5 text-caption font-semibold rounded-full whitespace-nowrap transition-all ${
                    selectedDistrict === null 
                      ? 'bg-[#00153D] text-white' 
                      : 'bg-[#F5F7FA] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  Tất cả khu vực
                </button>
                {districts.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDistrict(selectedDistrict === d ? null : d)}
                    className={`px-3 py-1.5 text-caption font-semibold rounded-full whitespace-nowrap transition-all ${
                      selectedDistrict === d 
                        ? 'bg-[#00153D] text-white' 
                        : 'bg-[#F5F7FA] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                <ArrowUpDown className="w-4 h-4 text-[#64748B]" />
                <span className="text-caption font-bold text-[#64748B]">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sắp xếp danh sách phòng"
                  className="bg-[#F5F7FA] border border-[#E2E8F0] rounded-[10px] px-3 py-1.5 text-caption font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="area-desc">Diện tích: Lớn đến Nhỏ</option>
                  <option value="area-asc">Diện tích: Nhỏ đến Lớn</option>
                  <option value="verified">Ưu tiên đã xác minh</option>
                </select>
              </div>
            </div>

            {/* Price pills & Quick Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-caption font-bold text-[#64748B] mr-1">Mức giá:</span>
                <button
                  type="button"
                  onClick={() => setSelectedPrice(null)}
                  className={`px-3 py-1 text-caption font-semibold rounded-[8px] whitespace-nowrap transition-all ${
                    selectedPrice === null 
                      ? 'bg-[#00153D] text-white' 
                      : 'bg-[#F5F7FA] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  Tất cả
                </button>
                {priceOptions.map(p => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setSelectedPrice(selectedPrice === p.val ? null : p.val)}
                    className={`px-3 py-1 text-caption font-semibold rounded-[8px] whitespace-nowrap transition-all ${
                      selectedPrice === p.val 
                        ? 'bg-[#00153D] text-white' 
                        : 'bg-[#F5F7FA] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilter3D(!filter3D)}
                  className={`px-3 py-1 text-caption font-semibold rounded-[8px] border flex items-center gap-1.5 transition-all ${
                    filter3D 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:bg-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Có tour 3D
                </button>

                <button
                  type="button"
                  onClick={() => setFilterVerified(!filterVerified)}
                  className={`px-3 py-1 text-caption font-semibold rounded-[8px] border flex items-center gap-1.5 transition-all ${
                    filterVerified 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-[#F5F7FA] text-[#475569] border-[#E2E8F0] hover:bg-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Đã xác minh
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-caption font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 ml-2"
                  >
                    <X className="w-3.5 h-3.5" /> Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h2 font-bold text-[#0F172A] tracking-tight">
                Phòng trọ & Căn hộ đang sẵn sàng
              </h2>
              <p className="text-caption text-[#64748B] font-medium mt-0.5">
                Tìm thấy {filteredRooms.length} phòng phù hợp với tiêu chí của bạn
              </p>
            </div>
            <Link 
              to="/search" 
              className="text-body font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
            >
              Mở bản đồ đầy đủ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Room Listings Grid */}
          {filteredRooms.length === 0 ? (
            <Card className="p-10 text-center bg-white rounded-[18px] border border-dashed border-[#CBD5E1] space-y-4">
              <Home className="w-12 h-12 text-[#94A3B8] mx-auto" />
              <div>
                <p className="text-body font-bold text-[#0F172A]">Không tìm thấy phòng phù hợp</p>
                <p className="text-caption text-[#64748B] max-w-md mx-auto mt-1">
                  Hãy thử điều chỉnh từ khóa tìm kiếm, mở rộng khoảng giá hoặc xóa bộ lọc để xem nhiều lựa chọn hơn.
                </p>
              </div>
              <Button variant="secondary" onClick={clearAllFilters} className="mx-auto">
                Xóa tất cả bộ lọc
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredRooms.slice(0, visibleCount).map((room) => {
                const isSaved = isRoomFavorite(room.id);
                return (
                  <Card 
                    key={room.id}
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="group cursor-pointer flex flex-col h-full bg-white rounded-[18px] shadow-clay-soft p-3 transition-all duration-150 hover:-translate-y-[2px] hover:shadow-clay-primary border border-[#E2E8F0]"
                  >
                    {/* Room Image Container */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-[#EEF2F6] rounded-[14px]">
                      <img 
                        src={room.image} 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200" 
                        alt={room.title} 
                      />
                      
                      {/* Top-left Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[70%]">
                        <span className="bg-white/95 text-[#0F172A] border border-[#E2E8F0] px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                          Cho thuê
                        </span>
                        {room.isVerifiedLandlord && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Đã xác minh
                          </span>
                        )}
                        {room.virtual3DUrl && (
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs">
                            <Eye className="w-3 h-3 text-blue-600" /> Tour 3D
                          </span>
                        )}
                      </div>

                      {/* Top-right Favorite Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(room.id, e)}
                        aria-label={isSaved ? "Bỏ lưu phòng" : "Lưu phòng"}
                        className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isSaved 
                            ? 'bg-rose-50 text-rose-600 scale-105 shadow-sm' 
                            : 'bg-white/90 text-[#64748B] hover:text-rose-600 hover:bg-white shadow-xs'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Room Info Content */}
                    <div className="pt-3 px-1 pb-1 flex flex-col flex-1 justify-between gap-2.5">
                      <div>
                        {/* Price */}
                        <p className="font-bold text-h3 text-[#00153D]">
                          {room.price.toLocaleString('vi-VN')} đ<span className="text-caption font-normal text-[#64748B]">/tháng</span>
                        </p>
                        {/* Title */}
                        <h3 className="font-bold text-body text-[#0F172A] line-clamp-2 group-hover:text-[#2563EB] transition-colors mt-1 leading-snug">
                          {room.title}
                        </h3>
                        {/* Specs */}
                        <p className="text-caption text-[#64748B] mt-1 flex items-center gap-2">
                          <span>{room.area || 25} m²</span>
                          <span>•</span>
                          <span>{room.type || 'Phòng trọ'}</span>
                        </p>
                      </div>

                      {/* Address & Action */}
                      <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                        <div className="flex items-center text-caption text-[#64748B] truncate">
                          <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-[#64748B]" />
                          <span className="truncate">{room.address}</span>
                        </div>
                        <span className="text-[12px] font-bold text-[#2563EB] group-hover:underline shrink-0 flex items-center">
                          Xem <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {filteredRooms.length > visibleCount && (
            <div className="text-center pt-4">
              <Button 
                variant="secondary" 
                onClick={() => setVisibleCount(prev => prev + 12)}
                className="px-8 min-h-[44px]"
              >
                Xem thêm phòng ({filteredRooms.length - visibleCount} phòng còn lại)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: LỊCH HẸN XEM PHÒNG                                     */}
      {/* ============================================================ */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-h2 font-bold text-[#0F172A] flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#2563EB]" />
                Lịch hẹn xem phòng của tôi
              </h2>
              <p className="text-caption text-[#64748B]">Trạng thái các cuộc hẹn trực tiếp với chủ trọ</p>
            </div>
            <Button variant="ghost" onClick={() => setActiveTab('rooms')} className="text-[#2563EB]">
              Quay lại danh sách phòng
            </Button>
          </div>

          {loadingApts ? (
            <Card className="p-8 text-center text-[#64748B] bg-white rounded-[18px]">
              Đang tải danh sách lịch hẹn...
            </Card>
          ) : appointments.length === 0 ? (
            <Card className="p-8 text-center bg-white rounded-[18px] border border-dashed border-[#CBD5E1] space-y-3">
              <Clock className="w-10 h-10 text-[#94A3B8] mx-auto" />
              <p className="text-body font-semibold text-[#0F172A]">Bạn chưa có lịch hẹn xem phòng nào</p>
              <p className="text-caption text-[#64748B] max-w-md mx-auto">
                Khi tìm thấy căn phòng ưng ý, hãy nhấn nút "Đặt lịch xem phòng" để hẹn gặp trực tiếp chủ nhà.
              </p>
              <Button variant="secondary" onClick={() => setActiveTab('rooms')} className="mt-2">
                Khám phá phòng ngay
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appointments.map(apt => {
                const dateStr = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleString('vi-VN', {
                  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                }) : 'Chưa định ngày';

                const isPending = apt.status === 'Pending';
                const isConfirmed = apt.status === 'Confirmed';
                const isCancelled = apt.status === 'Cancelled';

                return (
                  <Card key={apt.id} className="p-5 bg-white rounded-[18px] shadow-clay-soft border border-[#E2E8F0] flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/room/${apt.roomId}`} className="font-bold text-body text-[#0F172A] hover:text-[#2563EB] line-clamp-1 transition-colors">
                          {apt.roomTitle || 'Phòng trọ'}
                        </Link>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                          isConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          isPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {isConfirmed ? 'Đã xác nhận' : isPending ? 'Chờ xác nhận' : isCancelled ? 'Đã hủy' : 'Hoàn tất'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-caption text-[#64748B]">
                        <div className="flex items-center gap-1.5 text-[#0F172A] font-semibold">
                          <Clock className="w-4 h-4 text-[#2563EB]" />
                          <span>Thời gian: {dateStr}</span>
                        </div>
                        {apt.roomAddress && (
                          <div className="flex items-start gap-1.5 truncate">
                            <MapPin className="w-4 h-4 shrink-0 text-[#64748B] mt-0.5" />
                            <span className="truncate">{apt.roomAddress}</span>
                          </div>
                        )}
                        {apt.notes && (
                          <p className="text-[11px] bg-[#F5F7FA] p-2 rounded-[8px] text-[#475569] italic">
                            Ghi chú: {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                      <Link to={`/room/${apt.roomId}`}>
                        <Button size="sm" variant="ghost" className="text-xs text-[#2563EB]">
                          Xem phòng
                        </Button>
                      </Link>

                      {(isPending || isConfirmed) && (
                        <button 
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                        >
                          Hủy hẹn
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: DANH SÁCH PHÒNG ĐÃ LƯU (WISHLIST)                      */}
      {/* ============================================================ */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-h2 font-bold text-[#0F172A] flex items-center gap-2">
                <Heart className="w-6 h-6 text-[#E11D48]" />
                Phòng đã lưu (Wishlist)
              </h2>
              <p className="text-caption text-[#64748B]">Các căn phòng bạn đã lưu lại để cân nhắc</p>
            </div>
            <Button variant="ghost" onClick={() => setActiveTab('rooms')} className="text-[#2563EB]">
              Tìm thêm phòng
            </Button>
          </div>

          {loadingFavs ? (
            <Card className="p-8 text-center text-[#64748B] bg-white rounded-[18px]">
              Đang tải danh sách phòng đã lưu...
            </Card>
          ) : favorites.length === 0 ? (
            <Card className="p-8 text-center bg-white rounded-[18px] border border-dashed border-[#CBD5E1] space-y-3">
              <Heart className="w-10 h-10 text-[#CBD5E1] mx-auto" />
              <p className="text-body font-semibold text-[#0F172A]">Chưa có phòng nào trong danh sách yêu thích</p>
              <p className="text-caption text-[#64748B]">
                Nhấn vào biểu tượng trái tim ở bất kỳ tin đăng nào để lưu lại xem sau.
              </p>
              <Button variant="secondary" onClick={() => setActiveTab('rooms')} className="mt-2">
                Khám phá phòng ngay
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {favorites.map(room => {
                const imgUrl = room.images?.[0]?.imageUrl || room.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";
                return (
                  <Card 
                    key={room.id}
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="group cursor-pointer flex flex-col h-full bg-white rounded-[18px] shadow-clay-soft p-3 transition-all duration-150 hover:-translate-y-[2px] border border-[#E2E8F0]"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-[#EEF2F6] rounded-[14px]">
                      <img 
                        src={imgUrl} 
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200" 
                        alt={room.title} 
                      />
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(room.id, e)}
                        title="Bỏ lưu"
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-3 px-1 pb-1 flex flex-col flex-1 justify-between gap-2">
                      <div>
                        <p className="font-bold text-body text-[#00153D]">
                          {Number(room.price || 0).toLocaleString('vi-VN')} đ<span className="text-caption font-normal text-[#64748B]">/tháng</span>
                        </p>
                        <h4 className="font-bold text-caption text-[#0F172A] line-clamp-2 group-hover:text-[#2563EB] transition-colors mt-1">
                          {room.title}
                        </h4>
                      </div>

                      <div className="flex items-center text-caption text-[#64748B] truncate border-t border-[#E2E8F0] pt-2">
                        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-[#64748B]" />
                        <span className="truncate">{room.address || room.district}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
