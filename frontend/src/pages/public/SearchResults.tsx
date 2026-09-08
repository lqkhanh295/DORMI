import { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Map as MapTrifold, X, Sliders as FadersHorizontal } from 'lucide-react';
import { RoomCard } from '../../components/landing/RoomCard';

export default function SearchResults() {
  const listings = useStore(state => state.listings);
  const fetchListings = useStore(state => state.fetchListings);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevant');
  const [showMap, setShowMap] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isLoading] = useState(false);

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
        label: selectedPrice,
        clear: () => setSelectedPrice(null)
      });
    }
    if (searchQuery) {
      filters.push({
        id: 'query',
        label: `"${searchQuery}"`,
        clear: () => setSearchQuery('')
      });
    }
    return filters;
  }, [selectedDistrict, selectedPrice, searchQuery]);

  // Filtered and Sorted Listings
  const filteredListings = useMemo(() => {
    let result = listings.filter(room => {
      const matchQuery = !searchQuery || 
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        room.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDistrict = !selectedDistrict || room.address.toLowerCase().includes(selectedDistrict.toLowerCase());
      return matchQuery && matchDistrict;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => b.trustScore - a.trustScore);
    }

    return result;
  }, [listings, searchQuery, selectedDistrict, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDistrict(null);
    setSelectedPrice(null);
  };

  // ponytail: SearchResults with Active Filter Pills, Sort Dropdown, Dynamic Filter CTA, Skeleton Loaders & Recovery Empty State
  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#F5F7FA]">
      {/* Left Panel: Filters & List */}
      <div className={`flex flex-col bg-[#F5F7FA] border-r border-[#E2E8F0] transition-all duration-300 ${showMap ? 'w-full lg:w-1/2' : 'w-full'}`}>
        
        {/* Top Bar: Search Input & Controls */}
        <div className="p-6 bg-white rounded-b-[18px] shadow-clay-primary space-y-4 z-10">
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="w-[44px] h-[44px] p-0 flex-shrink-0" onClick={() => navigate(-1)} aria-label="Quay lại">
              <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
            </Button>
            <Input 
              placeholder="Tìm kiếm khu vực, tên đường..." 
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="secondary" className="h-[44px] px-4 hidden sm:flex items-center gap-2" onClick={() => setShowMobileFilter(true)}>
              <SlidersHorizontal className="w-5 h-5" />
              <span>Bộ lọc</span>
            </Button>
            <Button 
              variant="secondary" 
              className={`h-[44px] px-4 flex-shrink-0 hidden lg:flex items-center gap-2 transition-colors ${showMap ? 'bg-[#00153D] text-white' : ''}`} 
              onClick={() => setShowMap(!showMap)}
            >
              <MapTrifold className="w-5 h-5" />
              <span className="text-body font-semibold">{showMap ? 'Ẩn bản đồ' : 'Hiện bản đồ'}</span>
            </Button>
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
                className="bg-white shadow-clay-soft border border-[#E2E8F0] rounded-[10px] px-3 py-1.5 text-caption font-semibold text-[#00153D] outline-none min-h-[44px]"
              >
                <option value="relevant">Phù hợp nhất</option>
                <option value="price-low">Giá thấp → cao</option>
                <option value="price-high">Giá cao → thấp</option>
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
                <RoomCard 
                  key={room.id} 
                  room={{
                    id: room.id,
                    title: room.title,
                    price: `${room.price.toLocaleString('vi-VN')}đ / tháng`,
                    location: room.address.split(',')[0],
                    area: '25m²',
                    image: room.image,
                    verified: room.trustScore > 90
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>  
      
      {/* Map View */}
      {showMap && (
        <div className="hidden lg:block flex-1 bg-[#EEF2F6] relative border-l border-[#E2E8F0]">
          <div className="absolute inset-0">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d250826.96265738801!2d106.4950553754972!3d10.814234032128713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529292e8d3dd1%3A0xf15f5aad773c112b!2zVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1709194215160!5m2!1svi!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
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
              <div className="space-y-2">
                <label className="text-caption font-semibold text-[#0F172A]">Khu vực</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Quận 1', 'Quận 3', 'Quận 7', 'Quận 10'].map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDistrict(selectedDistrict === d ? null : d)}
                      className={`py-2 rounded-[10px] text-caption font-semibold border ${selectedDistrict === d ? 'btn-clay-primary' : 'bg-[#F5F7FA] text-[#64748B] border-[#E2E8F0]'}`}
                    >
                      {d}
                    </button>
                  ))}
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
