import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function TenantDashboard() {
  const listings = useStore(state => state.listings);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
          <p className="text-gray-500">Welcome back, here is your activity overview.</p>
        </div>
        <Button onClick={() => navigate('/search')}>Search New Rooms</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-none">
          <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide">Upcoming Viewings</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Saved Rooms</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Roommate Matches</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
        </Card>
      </div>
      
      <div className="mt-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recommended Rooms</h3>
          <button className="text-sm text-blue-600 hover:underline" onClick={() => navigate('/search')}>View all</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.slice(0, 3).map(room => (
            <Card key={room.id} onClick={() => navigate('/room/' + room.id)} className="group cursor-pointer hover:shadow-float transition-micro overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img 
                  src={room.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Room"
                />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                  {room.type}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900 line-clamp-1 flex-1">{room.title}</h4>
                </div>
                <p className="text-xs text-gray-500 mb-3">{room.address}</p>
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="font-bold text-blue-600">{room.price.toLocaleString('vi-VN')}₫<span className="text-xs text-gray-500 font-normal">/mo</span></p>
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">{room.trustScore} Trust</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
