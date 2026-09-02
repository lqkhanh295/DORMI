import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, MagnifyingGlass } from '@phosphor-icons/react';

export default function TenantDashboard() {
  const listings = useStore(state => state.listings);
  const navigate = useNavigate();

  return (
    <div className="space-y-10 pb-12 bg-canvas">
      
      {/* Search & Filter Header (Asymmetric Layout) */}
      <div className="bg-surface p-6 md:p-8 rounded-bento border border-border-subtle">
        <h1 className="text-h2 font-bold text-text-primary tracking-tight mb-6">Tìm kiếm không gian sống của bạn</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative flex items-center">
            <MagnifyingGlass className="absolute left-4 w-5 h-5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Nhập địa điểm, quận huyện, tên đường..." 
              className="w-full pl-12 pr-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors bg-canvas text-body text-text-primary placeholder-text-muted min-h-[44px]"
            />
          </div>
          <select className="px-4 py-3 border border-border-subtle rounded-md bg-canvas hover:border-primary-soft focus:outline-none focus:ring-1 focus:ring-primary transition-all min-w-[160px] text-text-secondary font-semibold text-body min-h-[44px]">
            <option>Mức giá</option>
            <option>Dưới 2 triệu</option>
            <option>2 - 3 triệu</option>
            <option>3 - 5 triệu</option>
          </select>
          <Button onClick={() => navigate('/search')} variant="primary" className="px-8 h-[44px]">
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Tin nổi bật / Recommended (Masonry/Asymmetric Staggered Feel) */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-h2 font-bold text-text-primary tracking-tight">Không gian nổi bật</h2>
            <p className="text-caption text-text-muted font-medium mt-1">Được đề xuất dựa trên lượt tìm kiếm của bạn</p>
          </div>
          <button className="text-body font-bold text-primary hover:text-primary-dark transition-colors touch-target" onClick={() => navigate('/search')}>Xem tất cả</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.slice(0, 4).map((room) => (
            <Card 
              key={room.id} 
              onClick={() => navigate('/room/' + room.id)} 
              className={`group cursor-pointer flex flex-col h-full hover:shadow-sm transition-shadow rounded-md border-border-subtle p-2 bg-canvas`}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-surface-alt rounded-sm">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  alt={room.title}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-canvas border border-border-subtle text-text-primary px-3 py-1 rounded-pill text-caption font-bold shadow-xs">Cho thuê</span>
                  {room.trustScore > 90 && (
                    <span className="bg-success-soft text-success border border-success-soft px-3 py-1 rounded-pill text-caption font-bold flex items-center gap-1 shadow-xs">
                      <ShieldCheck  className="w-4 h-4" /> Xác thực
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-bold text-body text-text-primary line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug">
                  {room.title}
                </h4>
                
                <div className="flex items-center justify-between mb-4 mt-auto">
                  <span className="font-bold text-primary text-body-lg">
                    {room.price.toLocaleString('vi-VN')} đ<span className="text-caption font-normal text-text-muted">/tháng</span>
                  </span>
                  <span className="text-caption font-semibold bg-surface-alt px-2.5 py-1 rounded-pill text-text-secondary border border-border-subtle">
                    25 m²
                  </span>
                </div>
                
                <div className="flex items-center text-caption text-text-secondary mb-3 truncate border-t border-border-subtle pt-3">
                  <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-text-muted" weight="bold" />
                  {room.address}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tin mới nhất */}
      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-h2 font-bold text-text-primary tracking-tight">Tin mới đăng</h2>
            <p className="text-caption text-text-muted font-medium mt-1">Cập nhật liên tục mỗi giờ</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.slice(0, 4).map(room => (
            <Card 
              key={`new-${room.id}`} 
              onClick={() => navigate('/room/' + room.id)} 
              className="group cursor-pointer flex flex-col h-full hover:shadow-sm transition-shadow rounded-md border-border-subtle p-2 bg-canvas"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-surface-alt rounded-sm">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  alt={room.title}
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-canvas border border-border-subtle text-text-primary px-3 py-1 rounded-pill text-caption font-bold shadow-xs">Cho thuê</span>
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-bold text-body text-text-primary line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug">
                  {room.title}
                </h4>
                
                <div className="flex items-center justify-between mb-4 mt-auto">
                  <span className="font-bold text-primary text-body-lg">
                    {room.price.toLocaleString('vi-VN')} đ<span className="text-caption font-normal text-text-muted">/tháng</span>
                  </span>
                  <span className="text-caption font-semibold bg-surface-alt px-2.5 py-1 rounded-pill text-text-secondary border border-border-subtle">
                    20 m²
                  </span>
                </div>
                
                <div className="flex items-center text-caption text-text-secondary mb-1 truncate border-t border-border-subtle pt-3">
                  <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-text-muted" weight="bold" />
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
