import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { RoomCard, type RoomItem } from './RoomCard';
import { roomsApi } from '../../services/api';

const DEFAULT_ROOMS: RoomItem[] = [
  {
    id: '1',
    title: 'Studio ban công Q10',
    price: '4.500.000đ / tháng',
    location: 'Q10',
    area: '28m²',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=600&q=80',
    verified: true
  },
  {
    id: '2',
    title: 'Phòng trọ cao cấp Q7',
    price: '3.800.000đ / tháng',
    location: 'Q7',
    area: '22m²',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80',
    verified: true
  },
  {
    id: '3',
    title: 'Căn hộ mini Tân Bình',
    price: '5.200.000đ / tháng',
    location: 'Tân Bình',
    area: '30m²',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
    verified: true
  }
];

export function FeaturedRooms() {
  const [rooms, setRooms] = useState<RoomItem[]>(DEFAULT_ROOMS);

  useEffect(() => {
    let isMounted = true;
    roomsApi.getRooms({ page: 1 })
      .then(res => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiItems: RoomItem[] = res.data.slice(0, 3).map((r: any) => ({
            id: r.id,
            title: r.title,
            price: `${Number(r.price).toLocaleString('vi-VN')}đ / tháng`,
            location: r.address,
            area: `${r.area || 25}m²`,
            image: r.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=600&q=80',
            verified: true
          }));
          setRooms(apiItems);
        }
      })
      .catch((err) => {
        console.warn('API getRooms in FeaturedRooms failed:', err);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white border-t border-[#E2E8F0]">
      <div className="container-dormi">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-h2 text-[#0F172A]">
              Phòng đang được quan tâm (API Realtime)
            </h2>
            <p className="text-body text-[#64748B]">
              Những phòng đã được xác minh và đang có nhiều lượt xem.
            </p>
          </div>
          <Link 
            to="/search" 
            className="text-body font-semibold text-[#00153D] hover:underline flex items-center gap-1 min-h-[44px]"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
    </section>
  );
}
