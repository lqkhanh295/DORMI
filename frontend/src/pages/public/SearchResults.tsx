import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, MapTrifold, ShieldCheck } from '@phosphor-icons/react';

export default function SearchResults() {
  const listings = useStore(state => state.listings);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(true);
  
  const filteredListings = listings.filter(room => 
    room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.trustScore - a.trustScore);

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden bg-canvas">
      {/* Left Panel: Search & List */}
      <div className={`flex flex-col bg-surface border-r border-border-subtle transition-all duration-300 ${showMap ? 'w-full lg:w-1/2' : 'w-full'}`}>
        
        {/* Search header container */}
        <div className="p-6 bg-canvas border-b border-border-subtle space-y-4 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="w-[44px] h-[44px] p-0 flex-shrink-0" onClick={() => navigate(-1)} aria-label="Quay lại">
              <ArrowLeft className="w-5 h-5 text-text-primary" weight="bold" />
            </Button>
            <Input 
              placeholder="Tìm kiếm khu vực, trường học, loại phòng..." 
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="primary" className="h-[44px] px-6">Tìm kiếm</Button>
            <Button variant="outline" className="w-[44px] h-[44px] p-0 flex-shrink-0" aria-label="Bộ lọc">
              <SlidersHorizontal className="w-5 h-5 text-text-primary" />
            </Button>
            <Button 
              variant="outline" 
              className={`h-[44px] px-4 flex-shrink-0 hidden lg:flex items-center gap-2 transition-colors ${showMap ? 'bg-primary-soft border-primary text-primary' : ''}`} 
              onClick={() => setShowMap(!showMap)}
            >
              <MapTrifold className="w-5 h-5" weight={showMap ? "fill" : "regular"} />
              <span className="text-body font-semibold">{showMap ? 'Ẩn bản đồ' : 'Hiện bản đồ'}</span>
            </Button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Gò Vấp', 'Tân Bình', 'Thủ Đức'].map(district => {
              const isActive = searchQuery.toLowerCase().includes(district.toLowerCase());
              return (
                <button 
                  key={district} 
                  className={`px-4 py-2 text-caption font-semibold rounded-pill border whitespace-nowrap transition-colors touch-target ${isActive ? 'bg-primary text-white border-primary' : 'bg-canvas text-text-secondary border-border-subtle hover:border-primary-soft'}`}
                  onClick={() => setSearchQuery(district)}
                >
                  {district}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Results Container */}
        <div className={`flex-1 overflow-y-auto p-6 ${!showMap ? 'max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-2 gap-6 content-start' : 'flex flex-col gap-6'}`}>
          <div className={`${!showMap ? 'xl:col-span-2' : ''}`}>
            <h2 className="text-h2 text-text-primary tracking-tight font-bold mb-1">Kết quả tìm kiếm</h2>
            <p className="text-caption text-text-muted font-medium">Tìm thấy {filteredListings.length} không gian sống phù hợp</p>
            {filteredListings.length === 0 && (
              <p className="text-text-secondary text-body text-center py-12">Không có phòng nào khớp với tìm kiếm của bạn.</p>
            )}
          </div>
          
          {filteredListings.map(room => (
            <Card 
              key={room.id} 
              onClick={() => navigate('/room/' + room.id)} 
              className="flex flex-col sm:flex-row group cursor-pointer hover:shadow-sm border border-border-subtle p-2 bg-canvas transition-shadow"
            >
              <div className="w-full sm:w-48 h-48 rounded-sm overflow-hidden bg-surface-alt relative flex-shrink-0">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  alt={room.title}
                />
                <div className="absolute top-3 left-3 bg-canvas/90 border border-border-subtle px-3 py-1 rounded-pill text-caption font-bold text-text-primary shadow-xs">
                  {room.type}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-h3 text-text-primary tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{room.title}</h3>
                  </div>
                  <p className="text-caption text-text-secondary mb-3 line-clamp-1">{room.address}</p>
                  <p className="text-h2 text-primary font-bold">{room.price.toLocaleString('vi-VN')}₫<span className="text-caption text-text-muted font-normal">/tháng</span></p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    <span className="text-caption bg-surface-alt text-text-secondary border border-border-subtle px-3 py-1.5 rounded-pill font-semibold">20m²</span>
                    <span className="text-caption bg-surface-alt text-text-secondary border border-border-subtle px-3 py-1.5 rounded-pill font-semibold">Máy lạnh</span>
                  </div>
                  <span className="bg-success-soft text-success border border-success-soft px-3 py-1.5 rounded-pill text-caption font-bold flex items-center gap-1.5">
                    <ShieldCheck  className="w-4 h-4" /> {room.trustScore} Uy tín
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>  
      
      {/* Map View */}
      {showMap && (
        <div className="hidden lg:block flex-1 bg-surface-alt relative border-l border-border-subtle">
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
      )}
    </div>
  );
}
