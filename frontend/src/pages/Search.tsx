import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { Search as SearchIcon, Filter, MapPin, Cuboid, Home } from 'lucide-react';

const MOCK_ROOMS = [
  { id: 1, title: 'Phòng trọ ban công thoáng mát', price: '2.500.000', location: 'Quận 7, TP.HCM', type: 'Phòng trọ', has3D: true },
  { id: 2, title: 'Ký túc xá cao cấp Sleepbox', price: '1.800.000', location: 'Bình Thạnh, TP.HCM', type: 'Ký túc xá', has3D: false },
  { id: 3, title: 'Căn hộ Studio đầy đủ nội thất', price: '5.000.000', location: 'Quận 1, TP.HCM', type: 'Studio', has3D: true },
  { id: 4, title: 'Phòng khép kín gần ĐH Tôn Đức Thắng', price: '3.000.000', location: 'Quận 7, TP.HCM', type: 'Phòng trọ', has3D: true },
];

export function Search() {
  const location = useLocation();

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Side: Room List */}
        <div className="w-full md:w-1/2 lg:w-2/5 h-full overflow-y-auto p-4 flex flex-col gap-4 border-r border-white/20 bg-white/20 backdrop-blur-sm">
          
          <GlassCard className="sticky top-0 z-10 !p-4 mb-2 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <GlassInput 
                  placeholder="Tìm theo khu vực, tên đường..." 
                  leftIcon={<SearchIcon className="w-4 h-4" />}
                />
              </div>
              <GlassButton variant="secondary" className="px-3">
                <Filter className="w-5 h-5" />
              </GlassButton>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="px-3 py-1 rounded-full bg-primary text-white text-sm whitespace-nowrap">Tất cả</span>
              <span className="px-3 py-1 rounded-full bg-white/50 border border-white/40 text-foreground text-sm whitespace-nowrap cursor-pointer hover:bg-white/70">Phòng trọ</span>
              <span className="px-3 py-1 rounded-full bg-white/50 border border-white/40 text-foreground text-sm whitespace-nowrap cursor-pointer hover:bg-white/70">Căn hộ mini</span>
              <span className="px-3 py-1 rounded-full bg-white/50 border border-white/40 text-foreground text-sm whitespace-nowrap cursor-pointer hover:bg-white/70">Ký túc xá</span>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-4 pb-8">
            <h2 className="font-bold text-lg px-2">Kết quả tìm kiếm ({MOCK_ROOMS.length})</h2>
            
            {MOCK_ROOMS.map(room => (
              <Link to={location.pathname.startsWith('/customer') ? `/customer/room/${room.id}` : `/room/${room.id}`} key={room.id}>
                <GlassCard className="!p-0 flex flex-col group cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="h-48 bg-slate-200 relative overflow-hidden">
                    {/* Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-300">
                      <Home className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    
                    {room.has3D && (
                      <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-primary flex items-center gap-1">
                        <Cuboid className="w-3 h-3" /> Virtual 3D
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-bold text-foreground shadow-sm">
                      {room.price}đ / tháng
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-primary font-medium mb-1">{room.type}</div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{room.title}</h3>
                    <div className="flex items-center text-foreground/60 text-sm">
                      <MapPin className="w-4 h-4 mr-1" /> {room.location}
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>

        </div>

        {/* Right Side: Map */}
        <div className="hidden md:flex flex-1 bg-slate-100 relative items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/13/6491/3820.png')] bg-cover bg-center opacity-50"></div>
          
          {/* Map Overlay Glassmorphism */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
             <GlassCard className="pointer-events-auto !p-3 rounded-full flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
               <span className="text-sm font-medium">Bản đồ trực tiếp</span>
             </GlassCard>
          </div>
          
          <div className="z-10 text-slate-500 font-medium">Map View (Mock)</div>
        </div>

      </div>
    </div>
  );
}
