import { GlobalNav } from '../components/ui/GlobalNav';
import { LocalNav } from '../components/ui/LocalNav';
import { BentoCard } from '../components/ui/BentoCard';
import { AppleButton } from '../components/ui/AppleButton';
import { MapPin, MagnifyingGlass, SlidersHorizontal } from '@phosphor-icons/react';

const rentalRooms = [
  {
    id: 1,
    title: 'Studio sáng, full nội thất',
    location: 'Quận 1, TP.HCM',
    price: '5.000.000đ',
    type: 'Studio',
    badge: 'Có 3D',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Sleepbox sạch, yên tĩnh',
    location: 'Bình Thạnh, TP.HCM',
    price: '1.800.000đ',
    type: 'Ký túc xá',
    badge: 'Đã KYC',
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Phòng ban công thoáng',
    location: 'Quận 7, TP.HCM',
    price: '2.500.000đ',
    type: 'Phòng trọ',
    badge: 'Gần trường',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=900&auto=format&fit=crop',
  },
];

export function Search() {
  const filterItems = [
    { label: 'Tất cả phòng', path: '/search' },
    { label: 'Studio', path: '/search/studio' },
    { label: 'Căn hộ mini', path: '/search/apartment' },
    { label: 'Ký túc xá', path: '/search/dorm' },
  ];

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <GlobalNav />
      <LocalNav 
        title="Khám phá phòng trọ" 
        items={filterItems} 
      />
      
      <main className="apple-container pt-8 pb-24">
        {/* Search Bar */}
        <div className="mb-10 w-full">
          <div className="relative flex w-full max-w-[600px] items-center mx-auto">
            <MagnifyingGlass className="absolute left-4 h-5 w-5 text-[#86868b]" />
            <input 
              type="text" 
              placeholder="Tìm theo quận, trường học hoặc tên đường..."
              className="h-[56px] w-full rounded-full bg-white pl-12 pr-12 text-[17px] shadow-sm outline-none transition-all focus:ring-4 focus:ring-[#0071e3]/20"
            />
            <button className="absolute right-4 text-[#86868b] hover:text-[#1d1d1f]">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rentalRooms.map((room) => (
            <BentoCard key={room.id} noPadding hoverEffect className="bg-white flex flex-col h-[420px]">
              <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-[#e8e8ed]">
                <img 
                  src={room.image} 
                  alt={room.title} 
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 rounded-full bg-[rgba(255,255,255,0.9)] px-3 py-1 text-[12px] font-bold text-[#1d1d1f] shadow-sm backdrop-blur-md">
                  {room.badge}
                </div>
              </div>
              
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#86868b] mb-1">{room.type}</p>
                  <h3 className="text-[21px] font-semibold text-[#1d1d1f] leading-tight mb-2 line-clamp-2">{room.title}</h3>
                  <p className="flex items-center gap-1.5 text-[14px] text-[#6e6e73]">
                    <MapPin className="h-4 w-4" />
                    {room.location}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#d2d2d7]/50">
                  <p className="text-[24px] font-bold text-[#1d1d1f] tracking-tight">{room.price}</p>
                  <AppleButton variant="secondary" size="sm">Chi tiết</AppleButton>
                </div>
              </div>
            </BentoCard>
          ))}
        </div>
      </main>
    </div>
  );
}
