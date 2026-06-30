import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal } from '@phosphor-icons/react';

export default function SearchResults() {
  const listings = useStore(state => state.listings);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredListings = listings.filter(room => 
    room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.trustScore - a.trustScore);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel: Search & List */}
      <div className="w-full lg:w-1/2 flex flex-col bg-neutral-50 border-r border-gray-200">
        <div className="p-4 bg-white border-b border-gray-200 space-y-4 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="px-3 py-2 flex-shrink-0" onClick={() => navigate(-1)} aria-label="Quay lại">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
            <Input 
              placeholder="Tìm kiếm khu vực, trường học, loại phòng..." 
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button>Tìm kiếm</Button>
            <Button variant="outline" className="px-3 py-2 flex-shrink-0 bg-gray-50 hover:bg-gray-100 border-gray-200" aria-label="Bộ lọc">
              <SlidersHorizontal className="w-5 h-5 text-gray-700" />
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Gò Vấp', 'Tân Bình', 'Thủ Đức'].map(district => {
              const isActive = searchQuery.toLowerCase().includes(district.toLowerCase());
              return (
                <Button 
                  key={district} 
                  variant={isActive ? "primary" : "outline"} 
                  size="sm" 
                  className={`whitespace-nowrap ${isActive ? 'bg-primary-600 text-white hover:bg-primary-700' : 'text-gray-600 bg-white hover:bg-gray-50 hover:text-primary-600'}`}
                  onClick={() => setSearchQuery(district)}
                >
                  {district}
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm font-medium text-gray-500 mb-2">Tìm thấy {filteredListings.length} phòng</p>
          {filteredListings.length === 0 && (
            <p className="text-gray-500 text-center py-8">Không có phòng nào khớp với tìm kiếm của bạn.</p>
          )}
          {filteredListings.map(room => (
            <Card key={room.id} onClick={() => navigate('/room/' + room.id)} className="flex flex-col sm:flex-row group cursor-pointer hover:shadow-float transition-micro">
              <div className="w-full sm:w-48 h-48 bg-gray-200 relative">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover"
                  alt="Room"
                />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                  {room.type}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{room.title}</h3>
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ml-2">{room.trustScore} Uy tín</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{room.address}</p>
                  <p className="text-blue-600 font-bold text-xl">{room.price.toLocaleString('vi-VN')}₫<span className="text-sm text-gray-500 font-normal">/tháng</span></p>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">20m²</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Vệ sinh riêng</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Máy lạnh</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>  
        {/* Map View */}
        <div className="hidden md:block flex-1 bg-gray-100 relative">
          <div className="absolute inset-0">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d250826.96265738801!2d106.4950553754972!3d10.814234032128713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529292e8d3dd1%3A0xf15f5aad773c112b!2zVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1709194215160!5m2!1svi!2s" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
    </div>
  );
}
