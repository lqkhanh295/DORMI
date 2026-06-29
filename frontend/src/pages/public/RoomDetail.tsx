import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';

export default function RoomDetail() {
  const navigate = useNavigate();
  const { currentUser } = useStore();
  const [showGallery, setShowGallery] = useState(false);

  const MOCK_PHOTOS = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
  ];

  const handleChat = () => {
    if (!currentUser) {
      navigate('/auth'); // Redirect to login if not authenticated
    } else {
      navigate('/tenant/chat'); // Go to chat
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative">
      {/* Image Gallery Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-64 md:h-96">
        <div className="md:col-span-2 h-full bg-gray-200 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => setShowGallery(true)}>
          <img src={MOCK_PHOTOS[0]} alt="Room Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-micro">
            <Button className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur" onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}>
              View All Photos
            </Button>
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-4 h-full">
          <div className="flex-1 bg-gray-200 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={MOCK_PHOTOS[1]} alt="Room 2" className="w-full h-full object-cover transition-transform hover:scale-105" />
          </div>
          <div className="flex-1 bg-gray-200 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={MOCK_PHOTOS[2]} alt="Room 3" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-micro hover:bg-black/40">
              <span className="text-white font-bold text-lg">+12 Photos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Modern Studio - District 3</h1>
              <div className="flex flex-col items-end">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  ✓ Verified Landlord
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-lg">123 Nguyen Dinh Chieu, Vo Thi Sau Ward, District 3, HCMC</p>
          </div>

          <div className="flex gap-6 py-6 border-y border-gray-200">
            <div><p className="text-gray-500 text-sm">Room Type</p><p className="font-semibold text-gray-900">Studio</p></div>
            <div><p className="text-gray-500 text-sm">Capacity</p><p className="font-semibold text-gray-900">2 People</p></div>
            <div><p className="text-gray-500 text-sm">Area</p><p className="font-semibold text-gray-900">35 m²</p></div>
            <div><p className="text-gray-500 text-sm">Bathroom</p><p className="font-semibold text-gray-900">Private</p></div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              Fully furnished modern studio located in the heart of District 3. Very close to universities, convenience stores, and coffee shops. The building has a 24/7 security guard, fingerprint access, and a free rooftop washing machine.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="p-6 md:sticky md:top-24">
            <div className="mb-6">
              <p className="text-3xl font-bold text-blue-600">5.500.000₫ <span className="text-base text-gray-500 font-normal">/ month</span></p>
              <p className="text-sm text-gray-500 mt-2">Deposit: 5.500.000₫</p>
            </div>
            
            <div className="hidden md:flex flex-col space-y-4 mb-6">
              <Button fullWidth size="lg">Schedule Viewing</Button>
              <Button fullWidth variant="outline" size="lg" onClick={handleChat}>Chat with Landlord</Button>
            </div>

            <div className="pt-6 md:border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">L</div>
                <div>
                  <p className="font-bold text-gray-900">Le Van B</p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-sm">★ 4.9 (12 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-600">Trust Score</span>
                <span className="font-bold text-green-600">98/100</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="p-6 min-h-screen flex flex-col">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-black/90 pb-4 z-10">
              <h2 className="text-white text-2xl font-bold">Property Photos</h2>
              <Button variant="outline" className="text-white border-white hover:bg-white/20" onClick={() => setShowGallery(false)}>
                ✕ Close
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
              {MOCK_PHOTOS.map((photo, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-800">
                  <img src={photo} alt={`Property view ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Mobile Fixed Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40 flex gap-2">
        <Button className="flex-1" size="lg">Schedule</Button>
        <Button className="flex-1" variant="outline" size="lg" onClick={handleChat}>Chat</Button>
      </div>
    </div>
  );
}
