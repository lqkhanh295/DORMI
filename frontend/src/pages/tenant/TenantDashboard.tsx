import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function TenantDashboard() {
  const listings = useStore(state => state.listings);
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-6">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-neutral-200 shadow-sm">
        <h1 className="text-xl font-bold text-neutral-800 mb-4">Tìm kiếm không gian sống của bạn</h1>
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Nhập địa điểm, quận huyện, tên đường..." 
            className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-neutral-50 hover:bg-white text-sm"
          />
          <select className="px-4 py-2.5 border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all min-w-[140px] text-neutral-600 font-medium text-sm">
            <option>Mức giá</option>
            <option>Dưới 2 triệu</option>
            <option>2 - 3 triệu</option>
            <option>3 - 5 triệu</option>
          </select>
          <Button onClick={() => navigate('/search')} className="px-6 py-2.5 rounded-lg font-bold uppercase text-[13px] tracking-wide shadow-sm hover:shadow transition-all">
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Tin nổi bật / Recommended */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-neutral-800 uppercase">Tin nổi bật</h2>
          <button className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors" onClick={() => navigate('/search')}>Xem tất cả {'>'}</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {listings.slice(0, 4).map(room => (
            <Card 
              key={room.id} 
              onClick={() => navigate('/room/' + room.id)} 
              className="group cursor-pointer flex flex-col h-full hover:shadow-md transition-all duration-300 rounded-lg border-neutral-200"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={room.title}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="primary" text="Cho thuê" className="shadow-sm" />
                  {room.trustScore > 90 && <Badge variant="success" text="Đã xác thực" className="shadow-sm" />}
                </div>
              </div>
              
              <div className="p-3.5 flex flex-col flex-1">
                <h4 className="font-semibold text-[15px] text-neutral-800 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors leading-snug">
                  {room.title}
                </h4>
                
                <div className="flex items-center justify-between mb-2 mt-auto">
                  <span className="font-bold text-primary-600 text-base">
                    {room.price.toLocaleString('vi-VN')} đ<span className="text-xs font-normal text-neutral-400">/tháng</span>
                  </span>
                  <span className="text-xs font-medium bg-neutral-50 px-1.5 py-0.5 rounded text-neutral-600 border border-neutral-100">
                    25 m²
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-neutral-500 mb-3 truncate">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {room.address}
                </div>
                
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400 font-medium">
                  <span>Hôm nay</span>
                  <button className="text-neutral-400 hover:text-primary-600 transition-colors p-1 hover:bg-primary-50 rounded-full" title="Lưu tin">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tin mới nhất */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-neutral-800 uppercase">Tin mới nhất</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {listings.slice(0, 4).map(room => (
            <Card 
              key={`new-${room.id}`} 
              onClick={() => navigate('/room/' + room.id)} 
              className="group cursor-pointer flex flex-col h-full hover:shadow-md transition-all duration-300 rounded-lg border-neutral-200"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={room.title}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="secondary" text="Cho thuê" className="shadow-sm" />
                </div>
              </div>
              
              <div className="p-3.5 flex flex-col flex-1">
                <h4 className="font-semibold text-[15px] text-neutral-800 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors leading-snug">
                  {room.title}
                </h4>
                
                <div className="flex items-center justify-between mb-2 mt-auto">
                  <span className="font-bold text-primary-600 text-base">
                    {room.price.toLocaleString('vi-VN')} đ<span className="text-xs font-normal text-neutral-400">/tháng</span>
                  </span>
                  <span className="text-xs font-medium bg-neutral-50 px-1.5 py-0.5 rounded text-neutral-600 border border-neutral-100">
                    20 m²
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-neutral-500 mb-1 truncate">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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
