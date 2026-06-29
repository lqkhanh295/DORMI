import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';

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
            <Button variant="outline" className="px-3 py-2 flex-shrink-0" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
            <Input 
              placeholder="Search location, university, type..." 
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button>Search</Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button variant="outline" size="sm" className="whitespace-nowrap">Price Range</Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">Room Type</Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">Verified Landlord</Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">AI Match Score</Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm font-medium text-gray-500 mb-2">{filteredListings.length} rooms found</p>
          {filteredListings.length === 0 && (
            <p className="text-gray-500 text-center py-8">No rooms match your search.</p>
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
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ml-2">{room.trustScore} Trust</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{room.address}</p>
                  <p className="text-blue-600 font-bold text-xl">{room.price.toLocaleString('vi-VN')}₫<span className="text-sm text-gray-500 font-normal">/mo</span></p>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">20m²</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Private Bath</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Air Con</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>  
        {/* Map View */}
        <div className="hidden md:block flex-1 bg-gray-100 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Fake Map Background */}
            <div className="w-full h-full bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=10.7769,106.7009&zoom=14&size=1000x1000&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x7c7c7c&style=feature:landscape|element:all|color:0xf2f2f2')] bg-cover bg-center opacity-50"></div>
            
            {/* Fake Map Pins */}
            <div className="absolute top-1/3 left-1/3 bg-white px-3 py-1.5 rounded-full shadow-card font-bold text-sm text-gray-900 hover:bg-blue-600 hover:text-white transition-micro cursor-pointer -translate-x-1/2 -translate-y-1/2 transform scale-110">
              5.5M
            </div>
            <div className="absolute top-1/2 left-2/3 bg-white px-3 py-1.5 rounded-full shadow-card font-bold text-sm text-gray-900 hover:bg-blue-600 hover:text-white transition-micro cursor-pointer -translate-x-1/2 -translate-y-1/2">
              4.2M
            </div>
            <div className="absolute top-2/3 left-1/2 bg-white px-3 py-1.5 rounded-full shadow-card font-bold text-sm text-gray-900 hover:bg-blue-600 hover:text-white transition-micro cursor-pointer -translate-x-1/2 -translate-y-1/2">
              7.0M
            </div>
          </div>
        </div>
    </div>
  );
}
