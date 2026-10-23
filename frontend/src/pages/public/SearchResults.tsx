import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Map as MapTrifold, X, Sliders as FadersHorizontal, GraduationCap, AlertCircle } from 'lucide-react';
import { UNIVERSITIES, normalizeVietnamese, isMatchDistrict, calculateDistanceKm, getCoordinatesForAddress } from '../../utils/geoUtils';
import { RoomCard } from '../../components/landing/RoomCard';
import RoomMapView from '../../components/map/RoomMapView';
import { modalBackdropVariants, bottomSheetVariants, staggerListContainer, staggerListItem } from '../../utils/motion';

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

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMobileFilter(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetchListings().finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, [fetchListings]);

  useEffect(() => {
    const q = searchParams.get('query') || searchParams.get('q');
    const district = searchParams.get('district');
    const price = searchParams.get('price');
    const area = searchParams.get('area');

    if (q) setSearchQuery(q);
    if (district) setSelectedDistrict(district);
    if (price) setSelectedPrice(price);
    if (area) setSelectedArea(area);
  }, [searchParams]);
  
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
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Custom price filter states
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [appliedCustomPrice, setAppliedCustomPrice] = useState<{ min?: number; max?: number } | null>(null);
  const [priceValidationError, setPriceValidationError] = useState<string | null>(null);

  // University & Proximity filter states
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(2);

  // Prevent hover re-renders and jitter during active mouse wheel scrolling
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<any>(null);

  const handleListScroll = () => {
    isScrollingRef.current = true;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  };

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
    if (appliedCustomPrice) {
      const minStr = appliedCustomPrice.min ? (appliedCustomPrice.min / 1000000) + 'tr' : '0';
      const maxStr = appliedCustomPrice.max ? (appliedCustomPrice.max / 1000000) + 'tr' : '∞';
      filters.push({
        id: 'custom-price',
        label: `${minStr} - ${maxStr}`,
        clear: () => { setAppliedCustomPrice(null); setCustomMinPrice(''); setCustomMaxPrice(''); }
      });
    } else if (selectedPrice) {
      filters.push({
        id: 'price',
        label: priceLabels[selectedPrice] || selectedPrice,
        clear: () => setSelectedPrice(null)
      });
    }
    if (selectedUniversity) {
      const uni = UNIVERSITIES.find(u => u.id === selectedUniversity);
      if (uni) {
        filters.push({
          id: 'university',
          label: `${uni.shortName} (< ${selectedRadiusKm}km)`,
          clear: () => setSelectedUniversity(null)
        });
      }
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
      // Chỉ hiển thị phòng đang trống (Available) trên trang tìm kiếm
      if (room.status && room.status !== 'Available') return false;

      let matchQuery = true;
      if (searchQuery && searchQuery.trim()) {
        const normQ = normalizeVietnamese(searchQuery);
        const normTitle = normalizeVietnamese(room.title || '');
        const normAddress = normalizeVietnamese(room.address || '');
        const normDesc = normalizeVietnamese((room as any).description || '');
        const queryTokens = normQ.split(/\s+/).filter(Boolean);
        matchQuery = isMatchDistrict(searchQuery, room.address, room.title) || queryTokens.length === 0 || queryTokens.every(token => 
          normTitle.includes(token) || normAddress.includes(token) || normDesc.includes(token)
        );
      }
      const matchDistrict = !selectedDistrict || isMatchDistrict(selectedDistrict, room.address, room.title);

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

      // Custom price range
      if (appliedCustomPrice) {
        if (appliedCustomPrice.min !== undefined && room.price < appliedCustomPrice.min) matchPrice = false;
        if (appliedCustomPrice.max !== undefined && room.price > appliedCustomPrice.max) matchPrice = false;
      }

      // University & Proximity match
      let matchUniProximity = true;
      if (selectedUniversity) {
        const uni = UNIVERSITIES.find(u => u.id === selectedUniversity);
        if (uni) {
          const roomCoords: [number, number] = (room.latitude && room.longitude)
            ? [Number(room.latitude), Number(room.longitude)]
            : getCoordinatesForAddress(room.address, String(room.id));
          const dist = calculateDistanceKm(uni.coords[0], uni.coords[1], roomCoords[0], roomCoords[1]);
          matchUniProximity = dist <= selectedRadiusKm || uni.districts.some(d => normalizeVietnamese(room.address).includes(normalizeVietnamese(d)));
        }
      }

      // Utilities match
      let matchUtilities = true;
      if (selectedUtilities.length > 0) {
        const roomUtils = (room.utilities || '').toLowerCase();
        matchUtilities = selectedUtilities.every(u => roomUtils.includes(u.toLowerCase()));
      }

      return matchQuery && matchDistrict && matchUniProximity && matchPrice && matchArea && matchUtilities;
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
    } else if (sortBy === 'trust-score') {
      sorted.sort((a, b) => {
        const tA = (a as any).trustScore || (a.isVerifiedLandlord ? 90 : 70);
        const tB = (b as any).trustScore || (b.isVerifiedLandlord ? 90 : 70);
        return tB - tA;
      });
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
  }, [listings, searchQuery, selectedDistrict, selectedPrice, selectedArea, selectedUtilities, sortBy, appliedCustomPrice, selectedUniversity, selectedRadiusKm]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize));
  const currentPage = Math.min(Math.max(1, Number(searchParams.get('page') || 1)), totalPages);
  const paginatedListings = filteredListings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    navigate(`/search?${params.toString()}`);
    listContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDistrict(null);
    setSelectedPrice(null);
    setAppliedCustomPrice(null);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setPriceValidationError(null);
    setSelectedUniversity(null);
    setSelectedArea(null);
    setSelectedUtilities([]);
  };

  const handleApplyCustomPrice = () => {
    const min = customMinPrice ? Number(customMinPrice) : undefined;
    const max = customMaxPrice ? Number(customMaxPrice) : undefined;

    if (min != null && max != null && min > max) {
      setPriceValidationError('Giá tối thiểu không được lớn hơn giá tối đa.');
      return;
    }

    setPriceValidationError(null);
    setSelectedPrice(null);
    setAppliedCustomPrice({ min, max });
  };

  // ponytail: SearchResults with Active Filter Pills, Sort Dropdown, Dynamic Filter CTA, Skeleton Loaders & Recovery Empty State
  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#F8FAFC]">
      {/* Left Panel: Filters & List */}
      <div className={`flex flex-col bg-[#F8FAFC] border-r border-[#E2E8F0] transition-[width] duration-300 ease-out ${showMap ? 'w-full lg:w-1/2' : 'w-full'}`}>
        
        {/* Top Bar: Search Input & Controls */}
        <div className="p-4 lg:p-5 bg-white border-b border-slate-200/90 shadow-xs space-y-3.5 z-10">
          <div className="flex items-center gap-2.5">
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150 active:scale-95"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Input 
              placeholder="Tìm kiếm khu vực, tên đường, trường ĐH..." 
              aria-label="Tìm kiếm khu vực, tên đường, trường đại học"
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rightIcon={searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : undefined}
            />
            <button 
              type="button"
              onClick={() => setShowMobileFilter(true)}
              className="h-10 px-3.5 bg-white hover:bg-slate-50 text-[#00153D] border border-slate-200 rounded-xl flex items-center gap-2 shrink-0 text-caption font-semibold whitespace-nowrap transition-colors duration-150 active:scale-95 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#00153D]" />
              <span>Bộ lọc</span>
            </button>
            <button 
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`h-10 px-3.5 rounded-xl border hidden lg:flex items-center gap-2 shrink-0 text-caption font-semibold whitespace-nowrap transition-colors duration-150 active:scale-95 shadow-xs ${
                showMap 
                  ? 'bg-[#00153D] text-white border-[#00153D] hover:bg-[#073372]' 
                  : 'bg-white text-[#00153D] border-slate-200 hover:bg-slate-50'
              }`}
            >
              <MapTrifold className="w-4 h-4" />
              <span>{showMap ? 'Ẩn bản đồ' : 'Bản đồ'}</span>
            </button>
          </div>
          
          {/* District Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Tân Bình', 'Thủ Đức'].map(district => {
              const isActive = selectedDistrict === district;
              return (
                <button 
                  key={district} 
                  type="button"
                  className={`px-3.5 py-1.5 text-caption font-semibold rounded-full whitespace-nowrap transition-all duration-150 active:scale-95 ${
                    isActive 
                      ? 'bg-[#00153D] text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
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
              <h2 className="text-h3 font-bold text-[#0F172A]">Tìm thấy {filteredListings.length} phòng</h2>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-caption font-semibold text-slate-500">Sắp xếp:</span>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-caption font-semibold text-[#00153D] outline-none min-h-[40px] cursor-pointer hover:border-slate-300 transition-colors shadow-xs"
              >
                <option value="relevant">Phù hợp nhất</option>
                <option value="trust-score">Độ tin cậy cao nhất</option>
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
                  className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5"
                >
                  {filter.label}
                  <button onClick={filter.clear} className="text-slate-400 hover:text-rose-600 transition-colors p-0.5">
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
        <div ref={listContainerRef} className="flex-1 overflow-y-auto p-6 pt-2" onScroll={handleListScroll}>
          
          <AnimatePresence mode="wait">
            {/* Skeleton Loading State */}
            {isLoading ? (
              <motion.div 
                key="search-skeletons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white rounded-[18px] p-3 shadow-clay-soft space-y-3 border border-[#E2E8F0]">
                    <div className="aspect-[4/3] rounded-[14px] skeleton-shimmer"></div>
                    <div className="h-6 w-3/4 skeleton-shimmer rounded-md"></div>
                    <div className="h-4 w-1/2 skeleton-shimmer rounded-md"></div>
                  </div>
                ))}
              </motion.div>
            ) : filteredListings.length === 0 ? (
              /* Empty Recovery State */
              <motion.div 
                key="search-empty"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[18px] shadow-clay-soft p-8 text-center space-y-6 max-w-md mx-auto my-8 border border-[#E2E8F0]"
              >
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center text-[#64748B] mx-auto">
                  <FadersHorizontal className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-h3 font-bold text-[#0F172A]">Không tìm thấy phòng phù hợp</h3>
                  <p className="text-caption text-[#64748B]">Bạn có thể thử các gợi ý sau để mở rộng kết quả:</p>
                </div>
                <ul className="text-caption text-[#0F172A] font-semibold text-left space-y-2 bg-[#F8FAFC] p-4 rounded-[12px]">
                  <li>• Mở rộng khu vực tìm kiếm</li>
                  <li>• Tăng ngân sách thêm 500.000đ</li>
                  <li>• Bỏ bớt điều kiện lọc</li>
                </ul>
                <Button fullWidth onClick={clearAllFilters}>Xóa bộ lọc</Button>
              </motion.div>
            ) : (
              /* Room List Cards with 25ms Cohesive Stagger */
              <motion.div 
                key="search-cards"
                variants={staggerListContainer}
                initial="hidden"
                animate="visible"
                className={`grid grid-cols-1 ${!showMap ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'} gap-6`}
              >
                {paginatedListings.map(room => {
                  const isHovered = hoveredRoomId === room.id;
                  const isSelected = selectedRoomId === room.id;

                  return (
                    <motion.div 
                      key={room.id}
                      id={`room-card-${room.id}`}
                      variants={staggerListItem}
                      onMouseEnter={() => {
                        if (!isScrollingRef.current) {
                          setHoveredRoomId(room.id);
                        }
                      }}
                      onMouseLeave={() => setHoveredRoomId(prev => (prev === room.id ? null : prev))}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`cursor-pointer rounded-[18px] transition-[box-shadow] duration-150 ease-out ${
                        isSelected 
                          ? 'ring-2 ring-[#00153D] shadow-md' 
                          : isHovered 
                            ? 'ring-1.5 ring-slate-400 shadow-md' 
                            : ''
                      }`}
                    >
                      <RoomCard 
                        room={{
                          id: room.id,
                          title: room.title,
                          price: `${room.price.toLocaleString('vi-VN')}đ / tháng`,
                          location: room.address.split(',')[0],
                          area: room.area ? `${room.area}m²` : '25m²',
                          image: room.image,
                          verified: !!room.isVerifiedLandlord,
                          isBoosted: !!room.isBoosted,
                          boostType: room.boostType
                        }} 
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 pb-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Trang trước
              </button>
              <span className="text-xs font-medium text-slate-600 px-2">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Trang sau
              </button>
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
            hoveredRoomId={hoveredRoomId}
            onSelectRoom={setSelectedRoomId}
            onHoverRoom={setHoveredRoomId}
          />
        </div>
      )}

      {/* Mobile Filter Bottom Sheet with Native Apple Spring Physics */}
      {createPortal(
        <AnimatePresence>
          {showMobileFilter && (
            <motion.div 
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              onClick={() => setShowMobileFilter(false)}
              className="fixed inset-0 bg-[#0F172A]/40 z-[100] flex flex-col justify-end backdrop-blur-xs"
            >
              <motion.div 
                variants={bottomSheetVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-t-[20px] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden motion-gpu"
              >
                <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white relative">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2" />
                    <h3 className="text-h3 font-bold text-[#0F172A]">Bộ lọc tìm kiếm</h3>
                  </div>
                  <button 
                    onClick={() => setShowMobileFilter(false)} 
                    className="text-[#64748B] hover:text-[#0F172A] p-2 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="Đóng bộ lọc"
                  >
                    <X className="w-5 h-5" />
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
                          className={`py-2 px-3 rounded-[10px] text-caption font-semibold border transition-[background-color,color,border-color] duration-150 active:scale-95 ${selectedDistrict === d ? 'btn-clay-primary text-white border-[#00153D]' : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'}`}
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
                          className={`py-2 px-3 rounded-[10px] text-caption font-semibold border transition-[background-color,color,border-color] duration-150 active:scale-95 ${selectedPrice === p.id ? 'btn-clay-primary text-white border-[#00153D]' : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Tùy chỉnh khoảng giá */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-xs text-slate-500 font-medium">Hoặc nhập khoảng giá cụ thể:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Giá tối thiểu (đ)</label>
                          <input
                            type="number"
                            placeholder="2.500.000"
                            value={customMinPrice}
                            onChange={(e) => {
                              setCustomMinPrice(e.target.value);
                              setPriceValidationError(null);
                            }}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#00153D]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Giá tối đa (đ)</label>
                          <input
                            type="number"
                            placeholder="4.000.000"
                            value={customMaxPrice}
                            onChange={(e) => {
                              setCustomMaxPrice(e.target.value);
                              setPriceValidationError(null);
                            }}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#00153D]"
                          />
                        </div>
                      </div>

                      {priceValidationError && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{priceValidationError}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleApplyCustomPrice}
                        className="w-full py-2 bg-[#00153D] hover:bg-[#073372] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
                      >
                        Áp dụng khoảng giá
                      </button>
                    </div>
                  </div>

                  {/* Trường Đại học & Bán kính (PostGIS Spatial Radius) */}
                  <div className="space-y-2">
                    <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span>Trường Đại học & Bán kính quanh trường</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={selectedUniversity || ''}
                        onChange={(e) => setSelectedUniversity(e.target.value || null)}
                        className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] outline-none cursor-pointer"
                      >
                        <option value="">Tất cả trường Đại học</option>
                        {UNIVERSITIES.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>

                      <select
                        value={selectedRadiusKm}
                        onChange={(e) => setSelectedRadiusKm(Number(e.target.value))}
                        disabled={!selectedUniversity}
                        className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] outline-none cursor-pointer disabled:opacity-50"
                      >
                        <option value={2}>Bán kính dưới 2 km</option>
                        <option value={5}>Bán kính dưới 5 km</option>
                        <option value={10}>Bán kính dưới 10 km</option>
                      </select>
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
                          className={`py-2 px-3 rounded-[10px] text-caption font-semibold border transition-[background-color,color,border-color] duration-150 active:scale-95 ${selectedArea === a.id ? 'btn-clay-primary text-white border-[#00153D]' : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'}`}
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
                            className={`py-1.5 px-3 rounded-full text-caption font-semibold border transition-[background-color,color,border-color] duration-150 active:scale-95 ${isSelected ? 'bg-[#00153D] text-white border-[#00153D]' : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'}`}
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
