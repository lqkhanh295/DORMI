import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, MagnifyingGlass } from '@phosphor-icons/react';

export default function TenantDashboard() {
  const listings = useStore(state => state.listings);
  const navigate = useNavigate();

  // ponytail: TenantDashboard using Functional Clay (Level 1 Primary Clay Search, Level 2 Soft Clay Cards)
  return (
    <div className="space-y-10 pb-12 bg-[#F5F7FA]">
      
      {/* Search Header - Level 1 Primary Clay */}
      <div className="bg-white p-6 md:p-8 rounded-[18px] shadow-clay-primary">
        <h1 className="text-h2 font-bold text-[#0F172A] tracking-tight mb-6">Tìm kiếm không gian sống của bạn</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative flex items-center">
            <MagnifyingGlass className="absolute left-4 w-5 h-5 text-[#64748B]" />
            <input 
              type="text" 
              placeholder="Nhập địa điểm, quận huyện, tên đường..." 
              className="w-full pl-12 pr-4 py-3 bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white transition-all text-body text-[#0F172A] placeholder-[#94A3B8] min-h-[44px]"
            />
          </div>
          <select className="px-4 py-3 bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white transition-all min-w-[160px] text-[#64748B] font-semibold text-body min-h-[44px]">
            <option>Mức giá</option>
            <option>Dưới 2 triệu</option>
            <option>2 - 3 triệu</option>
            <option>3 - 5 triệu</option>
          </select>
          <Button onClick={() => navigate('/search')} variant="primary" className="px-8 min-h-[44px]">
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Featured Rooms - Level 2 Soft Clay Cards */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-h2 font-bold text-[#0F172A] tracking-tight">Không gian nổi bật</h2>
            <p className="text-caption text-[#64748B] font-medium mt-1">Được đề xuất dựa trên lượt tìm kiếm của bạn</p>
          </div>
          <button className="text-body font-semibold text-[#00153D] hover:underline transition-colors touch-target" onClick={() => navigate('/search')}>Xem tất cả</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.slice(0, 4).map((room) => (
            <Card 
              key={room.id} 
              onClick={() => navigate('/room/' + room.id)} 
              className="group cursor-pointer flex flex-col h-full bg-white rounded-[18px] shadow-clay-soft p-3 transition-all duration-150 hover:-translate-y-[2px]"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-[#EEF2F6] rounded-[14px]">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  alt={room.title}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white border border-[#E2E8F0] text-[#0F172A] px-3 py-1 rounded-full text-caption font-bold shadow-sm">Cho thuê</span>
                  {room.trustScore > 90 && (
                    <span className="bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] px-3 py-1 rounded-full text-caption font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Xác thực
                    </span>
                  )}
                </div>
              </div>
              
              <div className="pt-4 px-2 pb-2 flex flex-col flex-1">
                <h4 className="font-bold text-body text-[#0F172A] line-clamp-2 mb-3 group-hover:text-[#00153D] transition-colors leading-snug">
                  {room.title}
                </h4>
                
                <div className="flex items-center justify-between mb-4 mt-auto">
                  <span className="font-bold text-[#00153D] text-body">
                    {room.price.toLocaleString('vi-VN')} đ<span className="text-caption font-normal text-[#64748B]">/tháng</span>
                  </span>
                  <span className="text-caption font-semibold bg-[#F5F7FA] px-2.5 py-1 rounded-full text-[#64748B] border border-[#E2E8F0]">
                    25 m²
                  </span>
                </div>
                
                <div className="flex items-center text-caption text-[#64748B] mb-1 truncate border-t border-[#E2E8F0] pt-3">
                  <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-[#64748B]" weight="bold" />
                  {room.address}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Latest Listings */}
      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-h2 font-bold text-[#0F172A] tracking-tight">Tin mới đăng</h2>
            <p className="text-caption text-[#64748B] font-medium mt-1">Cập nhật liên tục mỗi giờ</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.slice(0, 4).map(room => (
            <Card 
              key={`new-${room.id}`} 
              onClick={() => navigate('/room/' + room.id)} 
              className="group cursor-pointer flex flex-col h-full bg-white rounded-[18px] shadow-clay-soft p-3 transition-all duration-150 hover:-translate-y-[2px]"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-[#EEF2F6] rounded-[14px]">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  alt={room.title}
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white border border-[#E2E8F0] text-[#0F172A] px-3 py-1 rounded-full text-caption font-bold shadow-sm">Cho thuê</span>
                </div>
              </div>
              
              <div className="pt-4 px-2 pb-2 flex flex-col flex-1">
                <h4 className="font-bold text-body text-[#0F172A] line-clamp-2 mb-3 group-hover:text-[#00153D] transition-colors leading-snug">
                  {room.title}
                </h4>
                
                <div className="flex items-center justify-between mb-4 mt-auto">
                  <span className="font-bold text-[#00153D] text-body">
                    {room.price.toLocaleString('vi-VN')} đ<span className="text-caption font-normal text-[#64748B]">/tháng</span>
                  </span>
                  <span className="text-caption font-semibold bg-[#F5F7FA] px-2.5 py-1 rounded-full text-[#64748B] border border-[#E2E8F0]">
                    20 m²
                  </span>
                </div>
                
                <div className="flex items-center text-caption text-[#64748B] mb-1 truncate border-t border-[#E2E8F0] pt-3">
                  <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-[#64748B]" weight="bold" />
                  {room.address}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
