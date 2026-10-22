import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, SlidersHorizontal, RotateCcw, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomCard, type RoomItem } from './RoomCard';
import { roomsApi } from '../../services/api';
import { staggerListContainer, staggerListItem } from '../../utils/motion';
import { UNIVERSITIES, normalizeVietnamese } from '../../utils/geoUtils';

interface FeaturedRoomsProps {
  district?: string;
  price?: string;
  query?: string;
  roomType?: string;
  verifiedOnly?: boolean;
  onResetFilters?: () => void;
}

export function FeaturedRooms({
  district,
  price,
  query,
  roomType,
  verifiedOnly = false,
  onResetFilters
}: FeaturedRoomsProps) {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Map price filter string to numeric minPrice and maxPrice
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (price === 'under3m' || price === 'Dưới 3tr') {
      maxPrice = 3000000;
    } else if (price === '3mTo5m' || price === '3-5tr') {
      minPrice = 3000000;
      maxPrice = 5000000;
    } else if (price === '5mTo8m' || price === '5-8tr') {
      minPrice = 5000000;
      maxPrice = 8000000;
    } else if (price === 'above8m' || price === 'Trên 8tr') {
      minPrice = 8000000;
    }

    // Check if query corresponds to a university
    let targetDistrict = district;
    let targetQuery = query ? query.trim() : undefined;
    if (query) {
      const normQ = normalizeVietnamese(query);
      const matchedUni = UNIVERSITIES.find(u => 
        u.aliases.some(alias => normQ.includes(alias) || alias.includes(normQ)) ||
        normalizeVietnamese(u.name).includes(normQ) ||
        normalizeVietnamese(u.shortName).includes(normQ)
      );
      if (matchedUni && !targetDistrict && matchedUni.districts.length > 0) {
        // If searching a university, filter by that university's primary district or search term
        targetDistrict = matchedUni.districts[0];
      }
    }

    const timer = setTimeout(() => {
      roomsApi.getRooms({ 
        page: 1, 
        pageSize: 12,
        district: targetDistrict || undefined,
        roomType: roomType || undefined,
        minPrice,
        maxPrice,
        query: targetQuery,
        sortBy: 'verified'
      })
        .then(res => {
          if (!isMounted) return;
          const rawList = res?.data || res?.Data || (Array.isArray(res) ? res : []);
          if (Array.isArray(rawList)) {
            let apiItems: RoomItem[] = rawList.map((r: any) => {
              const images = r.images || r.Images || [];
              const primaryImg = images.find((i: any) => (i.isPrimary ?? i.IsPrimary)) || images[0];
              const imageUrl = primaryImg?.imageUrl || primaryImg?.ImageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=600&q=80';
              const priceVal = r.price ?? r.Price ?? 0;
              const isVerified = r.isVerifiedLandlord ?? r.IsVerifiedLandlord ?? true;
              const isBoosted = Boolean(r.isBoosted ?? r.IsBoosted);
              const boostType = r.boostType ?? r.BoostType;
              const areaVal = r.area ?? r.Area ?? 25;

              return {
                id: r.id || r.Id,
                title: r.title || r.Title || 'Phòng trọ cho thuê',
                price: `${Number(priceVal).toLocaleString('vi-VN')}đ / tháng`,
                location: r.address || r.Address || 'TP. Hồ Chí Minh',
                area: `${areaVal}m²`,
                image: imageUrl,
                verified: isVerified,
                isBoosted,
                boostType
              };
            });

            if (verifiedOnly) {
              apiItems = apiItems.filter(item => item.verified);
            }

            setRooms(apiItems);
          } else {
            setRooms([]);
          }
        })
        .catch((err) => {
          console.warn('API getRooms in FeaturedRooms failed:', err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [district, price, query, roomType, verifiedOnly]);

  const hasFilterActive = Boolean(district || price || query || roomType || verifiedOnly);

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container-dormi">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Phòng trọ nổi bật</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                Phòng trọ nổi bật đang cho thuê
              </h2>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {rooms.length} phòng
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {hasFilterActive 
                ? 'Đang lọc theo tiêu chí bạn đã chọn' 
                : 'Cập nhật trực tiếp từ chủ trọ đã xác minh danh tính tại TP. Hồ Chí Minh'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {hasFilterActive && onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bỏ lọc</span>
              </button>
            )}

            <Link 
              to="/search" 
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#00153D] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
              <span>Xem trên bản đồ</span>
            </Link>
          </div>
        </div>

        {/* Live Rooms Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="bg-white rounded-[18px] border border-[#E2E8F0] shadow-clay-soft p-3 space-y-3">
                  <div className="aspect-[4/3] rounded-[14px] skeleton-shimmer"></div>
                  <div className="h-5 bg-[#EEF2F6] skeleton-shimmer rounded-md w-3/4"></div>
                  <div className="h-4 bg-[#EEF2F6] skeleton-shimmer rounded-md w-1/2"></div>
                </div>
              ))}
            </motion.div>
          ) : rooms.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center space-y-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-xs border border-slate-200">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Không tìm thấy phòng phù hợp</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hiện chưa có phòng nào khớp với khu vực hoặc mức giá bạn chọn. Thử thay đổi bộ lọc hoặc xem trên bản đồ.
                </p>
              </div>
              {hasFilterActive && onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#00153D] hover:bg-[#073372] rounded-xl transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa bộ lọc để xem tất cả</span>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="cards"
              variants={staggerListContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {rooms.map(room => (
                <motion.div key={room.id} variants={staggerListItem}>
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Expand CTA */}
        {rooms.length > 0 && (
          <div className="mt-12 text-center pt-6 border-t border-slate-100">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00153D] hover:bg-[#073372] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-md active:scale-[0.98]"
            >
              <span>Xem tất cả phòng trên bản đồ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
