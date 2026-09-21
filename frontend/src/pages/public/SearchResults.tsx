import { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Map as MapTrifold, X, Sliders as FadersHorizontal } from 'lucide-react';
import { RoomCard } from '../../components/landing/RoomCard';
import RoomMapView from '../../components/map/RoomMapView';

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

export default function SearchResults() {
  const listings = useStore(state => state.listings);
  const fetchListings = useStore(state => state.fetchListings);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetchListings().finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, [fetchListings]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedUtilities, setSelectedUtilities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevant');
  const [showMap, setShowMap] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const priceLabels: Record<string, string> = {
    under3m: 'Dưới 3 triệu',
    '3mTo5m': '3 - 5 triệu',
    '5mTo8m': '5 - 8 triệu',
    above8m: 'Trên 8 triệu'
  };

  const areaLabels: Record<string, string> = {
    under20: 'Dưới 20 m²',
    '20to30': '20 - 30 m²',
    '30to45': '30 - 45 m²',
    above45: 'Trên 45 m²'
  };

  // Active filters list
  const activeFilters = useMemo(() => {
    const filters: { id: string; label: string; clear: () => void }[] = [];
    if (selectedDistrict) {
      filters.push({
        id: 'district',
        label: selectedDistrict,
        clear: () => setSelectedDistrict(null)
      });
    }
    if (selectedPrice) {
      filters.push({
        id: 'price',
        label: priceLabels[selectedPrice] || selectedPrice,
        clear: () => setSelectedPrice(null)
      });
    }
    if (selectedArea) {
      filters.push({
        id: 'area',
        label: areaLabels[selectedArea] || selectedArea,
        clear: () => setSelectedArea(null)
      });
    }
    selectedUtilities.forEach(util => {
      filters.push({
        id: `util-${util}`,
        label: util,
        clear: () => setSelectedUtilities(prev => prev.filter(u => u !== util))
      });
    });
    if (searchQuery) {
      filters.push({
        id: 'query',
        label: `"${searchQuery}"`,
        clear: () => setSearchQuery('')
      });
    }
    return filters;
  }, [selectedDistrict, selectedPrice, selectedArea, selectedUtilities, searchQuery]);

  // Filtered and Sorted Listings
  const filteredListings = useMemo(() => {
    let result = listings.filter(room => {
      const matchQuery = !searchQuery || 
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        room.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDistrict = !selectedDistrict || room.address.toLowerCase().includes(selectedDistrict.toLowerCase());

      // Price range
      let matchPrice = true;
      if (selectedPrice === 'under3m') matchPrice = room.price < 3000000;
      else if (selectedPrice === '3mTo5m') matchPrice = room.price >= 3000000 && room.price <= 5000000;
      else if (selectedPrice === '5mTo8m') matchPrice = room.price >= 5000000 && room.price <= 8000000;
      else if (selectedPrice === 'above8m') matchPrice = room.price > 8000000;

      // Area range
      let matchArea = true;
      const roomArea = room.area || 25;
      if (selectedArea === 'under20') matchArea = roomArea < 20;
      else if (selectedArea === '20to30') matchArea = roomArea >= 20 && roomArea <= 30;
      else if (selectedArea === '30to45') matchArea = roomArea >= 30 && roomArea <= 45;
      else if (selectedArea === 'above45') matchArea = roomArea > 45;

      // Utilities match
      let matchUtilities = true;
      if (selectedUtilities.length > 0) {
        const roomUtils = (room.utilities || '').toLowerCase();
        matchUtilities = selectedUtilities.every(u => roomUtils.includes(u.toLowerCase()));
      }

      return matchQuery && matchDistrict && matchPrice && matchArea && matchUtilities;
    });

    const sorted = [...result];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => getCleanPrice(a.price) - getCleanPrice(b.price));
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => getCleanPrice(b.price) - getCleanPrice(a.price));
    } else if (sortBy === 'area-asc') {
      sorted.sort((a, b) => getCleanArea(a.area) - getCleanArea(b.area));
    } else if (sortBy === 'area-desc') {
      sorted.sort((a, b) => getCleanArea(b.area) - getCleanArea(a.area));
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => (getTimestamp(b.createdAt) || 0) - (getTimestamp(a.createdAt) || 0));
    } else { // 'relevant'
      sorted.sort((a, b) => {
        const vA = a.isVerifiedLandlord ? 1 : 0;
        const vB = b.isVerifiedLandlord ? 1 : 0;
        if (vB !== vA) return vB - vA;
        return (getTimestamp(b.createdAt) || 0) - (getTimestamp(a.createdAt) || 0);
      });
    }

    return sorted;
  }, [listings, searchQuery, selectedDistrict, selectedPrice, selectedArea, selectedUtilities, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDistrict(null);
    setSelectedPrice(null);
    setSelectedArea(null);
    setSelectedUtilities([]);
  };

  // ponytail: SearchResults with Active Filter Pills, Sort Dropdown, Dynamic Filter CTA, Skeleton Loaders & Recovery Empty State
  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#F5F7FA]">
      {/* Left Panel: Filters & List */}
      <div className={`flex flex-col bg-[#F5F7FA] border-r border-[#E2E8F0] transition-all duration-300 ${showMap ? 'w-full lg:w-1/2' : 'w-full'}`}>
        
        {/* Top Bar: Search Input & Controls */}
        <div className="p-6 bg-white rounded-b-[18px] shadow-clay-primary space-y-4 z-10">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="w-11 h-11 bg-white hover:bg-[#F5F7FA] text-[#0F172A] border border-[#E2E8F0] rounded-[12px] shadow-clay-soft flex items-center justify-center shrink-0 transition-all touch-target active:scale-95"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
            </button>
            <Input 
              placeholder="Tìm kiếm khu vực, tên đường..." 
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="button"
              onClick={() => setShowMobileFilter(true)}
              className="h-11 px-4 bg-white hover:bg-[#F5F7FA] text-[#0F172A] border border-[#E2E8F0] rounded-[12px] shadow-clay-soft flex items-center gap-2 shrink-0 text-caption font-semibold whitespace-nowrap transition-all touch-target active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#00153D]" />
              <span>Bộ lọc</span>
            </button>
            <button 
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`h-11 px-4 rounded-[12px] shadow-clay-soft border hidden lg:flex items-center gap-2 shrink-0 text-caption font-semibold whitespace-nowrap transition-all touch-target active:scale-95 ${
                showMap 
                  ? 'bg-[#00153D] text-white border-[#00153D] hover:bg-[#0A2558]' 
                  : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#F5F7FA]'
              }`}
            >
              <MapTrifold className="w-4 h-4" />
              <span>{showMap ? 'Ẩn bản đồ' : 'Hiện bản đồ'}</span>
            </button>
          </div>
          
          {/* District Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Tân Bình'].map(district => {
              const isActive = selectedDistrict === district;
              return (
                <button 
                  key={district} 
                  type="button"
                  className={`px-4 py-2 text-caption font-semibold rounded-[12px] whitespace-nowrap transition-all touch-target ${isActive ? 'btn-clay-primary' : 'bg-[#F5F7FA] shadow-clay-soft text-[#64748B] hover:text-[#0F172A]'}`}
                  onClick={() => setSelectedDistrict(isActive ? null : district)}
                >
                  {district}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header: Count, Active Filter Tags & Sort */}
        <div className="px-6 pt-6 pb-2 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-h3 font-bold text-[#0F172A]">{filteredListings.length} phòng được tìm thấy</h2>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-caption font-semibold text-[#64748B]">Sắp xếp:</span>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white shadow-clay-soft border border-[#E2E8F0] rounded-[10px] px-3 py-1.5 text-caption font-semibold text-[#00153D] outline-none min-h-[44px] cursor-pointer"
              >
                <option value="relevant">Phù hợp nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-low">Giá: Thấp → Cao</option>
                <option value="price-high">Giá: Cao → Thấp</option>
                <option value="area-desc">Diện tích: Lớn → Nhỏ</option>
                <option value="area-asc">Diện tích: Nhỏ → Lớn</option>
              </select>
            </div>
          </div>

          {/* Active Filter Bar (Show user what filters are active with X clear buttons) */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0]">
              <span className="text-caption text-[#64748B] font-medium">Đang lọc:</span>
              {activeFilters.map(filter => (
                <span 
                  key={filter.id}
                  className="bg-white border border-[#E2E8F0] shadow-clay-soft px-3 py-1 rounded-full text-caption font-semibold text-[#00153D] flex items-center gap-1.5"
                >
                  {filter.label}
                  <button onClick={filter.clear} className="hover:text-[#C62828] touch-target min-h-0 min-w-0 p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <button 
                onClick={clearAllFilters}
                className="text-caption font-semibold text-[#C62828] hover:underline ml-2"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
        
        {/* Results Grid Container */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          
          {/* Skeleton Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 4].map(n => (
                <div key={n} className="bg-white rounded-[18px] p-3 shadow-clay-soft space-y-3">
                  <div className="aspect-[4/3] rounded-[14px] skeleton-shimmer"></div>
                  <div className="h-6 w-3/4 skeleton-shimmer rounded-md"></div>
                  <div className="h-4 w-1/2 skeleton-shimmer rounded-md"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty Recovery State */}
          {!isLoading && filteredListings.length === 0 && (
            <div className="bg-white rounded-[18px] shadow-clay-soft p-8 text-center space-y-6 max-w-md mx-auto my-8">
              <div className="w-16 h-16 bg-[#F5F7FA] rounded-full flex items-center justify-center text-[#64748B] mx-auto">
                <FadersHorizontal className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-h3 font-bold text-[#0F172A]">Không tìm thấy phòng phù hợp</h3>
                <p className="text-caption text-[#64748B]">Bạn có thể thử các gợi ý sau để mở rộng kết quả:</p>
              </div>
              <ul className="text-caption text-[#0F172A] font-semibold text-left space-y-2 bg-[#F5F7FA] p-4 rounded-[12px]">
                <li>• Mở rộng khu vực tìm kiếm</li>
                <li>• Tăng ngân sách thêm 500.000đ</li>
                <li>• Bỏ bớt một bộ lọc quá hẹp</li>
              </ul>
              <Button fullWidth onClick={clearAllFilters}>Mở rộng tìm kiếm</Button>
            </div>
          )}

          {/* Room List Cards */}
          {!isLoading && filteredListings.length > 0 && (
            <div className={`grid grid-cols-1 ${!showMap ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'} gap-6`}>
              {filteredListings.map(room => (
                <div 
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`cursor-pointer transition-all rounded-[18px] ${selectedRoomId === room.id ? 'ring-3 ring-[#00153D] shadow-clay-primary' : ''}`}
                >
                  <RoomCard 
                    room={{
                      id: room.id,
                      title: room.title,
                      price: `${room.price.toLocaleString('vi-VN')}đ / tháng`,
                      location: room.address.split(',')[0],
                      area: '25m²',
                      image: room.image,
                      verified: !!room.isVerifiedLandlord
                    }} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>  
      
      {/* Interactive Map View with User Geolocation & Room Markers */}
      {showMap && (
        <div className="hidden lg:block flex-1 h-full relative border-l border-[#E2E8F0]">
          <RoomMapView 
            rooms={filteredListings} 
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
        </div>
      )}

      {/* Mobile Filter Bottom Sheet */}
      {showMobileFilter && (
        <div className="fixed inset-0 bg-[#0F172A]/40 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-[18px] shadow-clay-primary max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
              <h3 className="text-h3 font-bold text-[#0F172A]">Bộ lọc tìm kiếm</h3>
              <button onClick={() => setShowMobileFilter(false)} className="text-[#64748B] hover:text-[#0F172A] p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Khu vực */}
              <div className="space-y-2">
                <label className="text-caption font-semibold text-[#0F172A]">Khu vực</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Tân Bình', 'Thủ Đức'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDistrict(selectedDistrict === d ? null : d)}
                      className={`py-2 px-3 rounded-[10px] text-caption font-semibold border transition-all ${selectedDistrict === d ? 'btn-clay-primary' : 'bg-[#F5F7FA] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khoảng giá */}
              <div className="space-y-2">
                <label className="text-caption font-semibold text-[#0F172A]">Khoảng giá thuê</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'under3m', label: 'Dưới 3 triệu' },
                    { id: '3mTo5m', label: '3 - 5 triệu' },
                    { id: '5mTo8m', label: '5 - 8 triệu' },
                    { id: 'above8m', label: 'Trên 8 triệu' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPrice(selectedPrice === p.id ? null : p.id)}
                      className={`py-2 px-3 rounded-[10px] text-caption font-semibold border transition-all ${selectedPrice === p.id ? 'btn-clay-primary' : 'bg-[#F5F7FA] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khoảng diện tích */}
              <div className="space-y-2">
                <label className="text-caption font-semibold text-[#0F172A]">Diện tích căn phòng</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'under20', label: 'Dưới 20 m²' },
                    { id: '20to30', label: '20 - 30 m²' },
                    { id: '30to45', label: '30 - 45 m²' },
                    { id: 'above45', label: 'Trên 45 m²' }
                  ].map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedArea(selectedArea === a.id ? null : a.id)}
                      className={`py-2 px-3 rounded-[10px] text-caption font-semibold border transition-all ${selectedArea === a.id ? 'btn-clay-primary' : 'bg-[#F5F7FA] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiện ích */}
              <div className="space-y-2">
                <label className="text-caption font-semibold text-[#0F172A]">Tiện ích mong muốn (Chọn nhiều)</label>
                <div className="flex flex-wrap gap-2">
                  {['Wifi', 'Máy lạnh', 'Tủ lạnh', 'Máy giặt', 'Ban công', 'Bếp riêng', 'Thang máy', 'Giờ giấc tự do', 'Bãi giữ xe'].map(util => {
                    const isSelected = selectedUtilities.includes(util);
                    return (
                      <button
                        key={util}
                        type="button"
                        onClick={() => {
                          setSelectedUtilities(prev => 
                            isSelected ? prev.filter(u => u !== util) : [...prev, util]
                          );
                        }}
                        className={`py-1.5 px-3 rounded-full text-caption font-semibold border transition-all ${isSelected ? 'bg-[#00153D] text-white border-[#00153D]' : 'bg-[#F5F7FA] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'}`}
                      >
                        {util}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dynamic Filter CTA Footers */}
            <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between gap-3">
              <button onClick={clearAllFilters} className="text-caption font-semibold text-[#64748B] hover:underline px-4">
                Xóa tất cả
              </button>
              <Button onClick={() => setShowMobileFilter(false)} className="flex-1">
                Xem {filteredListings.length} phòng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
