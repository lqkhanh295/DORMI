import { useState, useEffect } from 'react';
import { GlobalNav } from '../components/ui/GlobalNav';
import { LocalNav } from '../components/ui/LocalNav';
import { BentoCard } from '../components/ui/BentoCard';
import { AppleButton } from '../components/ui/AppleButton';
import { MapPin, MagnifyingGlass, SlidersHorizontal, X, MagnifyingGlassMinus } from '@phosphor-icons/react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState(rentalRooms);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (searchQuery.trim().toLowerCase() === 'empty') {
        setResults([]);
      } else {
        setResults(
          rentalRooms.filter(r => 
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.location.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
      setIsLoading(false);
    }, 1500); // Fake delay for skeleton
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filterItems = [
    { label: 'Tất cả phòng', path: '/search' },
    { label: 'Studio', path: '/search/studio' },
    { label: 'Căn hộ mini', path: '/search/apartment' },
    { label: 'Ký túc xá', path: '/search/dorm' },
  ];

  return (
    <div className="bg-background min-h-screen">
      <GlobalNav />
      <LocalNav 
        title="Khám phá phòng trọ" 
        items={filterItems} 
      />
      
      <main className="apple-container pt-8 pb-24">
        {/* Search Bar */}
        <div className="mb-10 w-full">
          <div className="relative flex w-full max-w-[600px] items-center mx-auto">
            <label htmlFor="searchInput" className="sr-only">Tìm kiếm</label>
            <MagnifyingGlass className="absolute left-4 h-5 w-5 text-neutral-500" />
            <input 
              id="searchInput"
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo quận, trường học hoặc tên đường..."
              className="h-[56px] w-full rounded-full bg-white pl-12 pr-24 text-[17px] shadow-sm outline-none transition-all focus:ring-4 focus:ring-primary/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                aria-label="Xóa tìm kiếm"
                className="absolute right-12 text-neutral-500 hover:text-foreground p-1 transition-colors"
              >
                <X className="h-5 w-5" weight="bold" />
              </button>
            )}
            <button aria-label="Bộ lọc tìm kiếm" className="absolute right-4 text-neutral-500 hover:text-foreground transition-colors">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Loading State / Skeleton UI */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <BentoCard key={i} noPadding className="bg-white flex flex-col h-[420px] animate-pulse">
                <div className="relative h-[220px] w-full bg-neutral-200"></div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="h-3 w-16 bg-neutral-200 rounded-full mb-3"></div>
                    <div className="h-6 w-full bg-neutral-200 rounded-lg mb-2"></div>
                    <div className="h-4 w-2/3 bg-neutral-200 rounded-lg"></div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100">
                    <div className="h-8 w-1/3 bg-neutral-200 rounded-lg"></div>
                    <div className="h-8 w-24 bg-neutral-200 rounded-full"></div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        ) : results.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
              <MagnifyingGlassMinus className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Không tìm thấy phòng trọ nào</h3>
            <p className="text-neutral-500 max-w-md">Rất tiếc, không có kết quả nào phù hợp với tìm kiếm của bạn. Vui lòng thử lại bằng từ khóa khác.</p>
            <AppleButton className="mt-6" onClick={() => setSearchQuery('')}>Xóa tìm kiếm</AppleButton>
          </div>
        ) : (
          /* Results Grid */
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((room) => (
                <BentoCard key={room.id} noPadding hoverEffect className="bg-white flex flex-col h-[420px]">
                  <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-neutral-100">
                    <img 
                      src={room.image} 
                      alt={room.title} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-[rgba(255,255,255,0.9)] px-3 py-1 text-[12px] font-bold text-foreground shadow-sm backdrop-blur-md">
                      {room.badge}
                    </div>
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[12px] font-bold uppercase tracking-widest text-neutral-500">{room.type}</p>
                        <p className="text-[10px] text-neutral-400 font-medium italic">(Update lần cuối: 26.06.2026)</p>
                      </div>
                      <h3 className="text-[21px] font-semibold text-foreground leading-tight mb-2 line-clamp-2">{room.title}</h3>
                      <p className="flex items-center gap-1.5 text-[14px] text-neutral-500">
                        <MapPin className="h-4 w-4" />
                        {room.location}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-200">
                      <p className="text-[24px] font-bold text-foreground tracking-tight">{room.price}</p>
                      <AppleButton variant="secondary" size="sm">Chi tiết</AppleButton>
                    </div>
                  </div>
                </BentoCard>
              ))}
            </div>
            
            {/* Pagination / Load More */}
            <div className="mt-12 flex justify-center">
              <AppleButton variant="outline" size="lg">Tải thêm kết quả</AppleButton>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
