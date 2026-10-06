import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomCard, type RoomItem } from './RoomCard';
import { roomsApi } from '../../services/api';
import { staggerListContainer, staggerListItem } from '../../utils/motion';

export function FeaturedRooms() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    roomsApi.getRooms({ page: 1, pageSize: 6 })
      .then(res => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiItems: RoomItem[] = res.data.map((r: any) => ({
            id: r.id,
            title: r.title,
            price: `${Number(r.price).toLocaleString('vi-VN')}đ / tháng`,
            location: r.address,
            area: `${r.area || 25}m²`,
            image: r.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=600&q=80',
            verified: r.isVerifiedLandlord ?? true,
            isBoosted: !!r.isBoosted,
            boostType: r.boostType
          }));
          setRooms(apiItems);
        }
      })
      .catch((err) => {
        console.warn('API getRooms in FeaturedRooms failed:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white border-t border-[#E2E8F0]">
      <div className="container-dormi">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-h2 text-[#0F172A]">
              Phòng đang được quan tâm
            </h2>
            <p className="text-body text-[#64748B]">
              Những phòng đã được xác minh và đang có nhiều lượt xem trên hệ thống.
            </p>
          </div>
          <Link 
            to="/search" 
            className="text-body font-semibold text-[#00153D] hover:underline flex items-center gap-1 min-h-[44px] transition-colors"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-[18px] border border-[#E2E8F0] shadow-clay-soft p-3 space-y-3">
                  <div className="aspect-[4/3] rounded-[14px] skeleton-shimmer"></div>
                  <div className="h-6 bg-[#EEF2F6] skeleton-shimmer rounded-md w-3/4"></div>
                  <div className="h-4 bg-[#EEF2F6] skeleton-shimmer rounded-md w-1/2"></div>
                </div>
              ))}
            </motion.div>
          ) : rooms.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center text-[#64748B] bg-[#F8FAFC] rounded-[18px] border border-dashed border-[#CBD5E1]"
            >
              Chưa có phòng nổi bật nào.
            </motion.div>
          ) : (
            <motion.div 
              key="cards"
              variants={staggerListContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {rooms.map(room => (
                <motion.div key={room.id} variants={staggerListItem}>
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
