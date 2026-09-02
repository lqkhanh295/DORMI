import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { RoomCard, type RoomItem } from './RoomCard';

const DEMO_ROOMS: RoomItem[] = [
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
    title: 'Room Q7',
    price: '3.800.000đ / tháng',
    location: 'Q7',
    area: '22m²',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80',
    verified: true
  },
  {
    id: '3',
    title: 'Studio TB',
    price: '5.200.000đ / tháng',
    location: 'TB',
    area: '30m²',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
    verified: true
  },
  {
    id: '4',
    title: 'Căn hộ mini Phú Nhuận',
    price: '6.000.000đ / tháng',
    location: 'Phú Nhuận',
    area: '35m²',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    verified: true
  }
];

export function FeaturedRooms() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-[#E2E8F0]">
      <div className="container-dormi">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2">
            <h2 className="text-h2 text-[#0F172A]">
              Phòng đang được quan tâm
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

        {/* 4-column Grid (Desktop 3/3/3/3, Mobile 1 col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMO_ROOMS.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

      </div>
    </section>
  );
}
