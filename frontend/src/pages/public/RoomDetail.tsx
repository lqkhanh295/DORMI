import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { Toaster, toast } from 'sonner';
import { ArrowLeft } from '@phosphor-icons/react';

export default function RoomDetail() {
  const navigate = useNavigate();
  const { currentUser } = useStore();
  const [showGallery, setShowGallery] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

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

  const handleSchedule = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!bookingDate || !bookingTime) {
      toast.error('Vui lòng chọn đầy đủ ngày và giờ xem phòng!');
      return;
    }
    
    toast.success('Gửi yêu cầu thành công!', {
      description: `Chủ nhà sẽ liên hệ lại với bạn để xác nhận lịch xem phòng lúc ${bookingTime} ngày ${bookingDate}.`
    });
    
    setShowBookingModal(false);
    setBookingDate('');
    setBookingTime('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-28 md:py-8 space-y-6 md:space-y-8 relative">
      <Toaster position="top-center" richColors />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Premium Modern Studio - District 3</h1>
              <div className="flex self-start sm:self-auto">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  ✓ Verified Landlord
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-base md:text-lg mt-2 sm:mt-0">123 Nguyen Dinh Chieu, Vo Thi Sau Ward, District 3, HCMC</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-200">
            <div><p className="text-gray-500 text-xs md:text-sm">Room Type</p><p className="font-semibold text-gray-900 text-sm md:text-base">Studio</p></div>
            <div><p className="text-gray-500 text-xs md:text-sm">Capacity</p><p className="font-semibold text-gray-900 text-sm md:text-base">2 People</p></div>
            <div><p className="text-gray-500 text-xs md:text-sm">Area</p><p className="font-semibold text-gray-900 text-sm md:text-base">35 m²</p></div>
            <div><p className="text-gray-500 text-xs md:text-sm">Bathroom</p><p className="font-semibold text-gray-900 text-sm md:text-base">Private</p></div>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Description</h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Fully furnished modern studio located in the heart of District 3. Very close to universities, convenience stores, and coffee shops. The building has a 24/7 security guard, fingerprint access, and a free rooftop washing machine.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col">
          <Button variant="outline" className="mb-4 self-start flex items-center gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft weight="bold" className="w-4 h-4 md:w-5 md:h-5" /> Quay lại
          </Button>
          <Card className="p-5 md:p-6 md:sticky md:top-24">
            <div className="mb-6">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">5.500.000₫ <span className="text-sm md:text-base text-gray-500 font-normal">/ month</span></p>
              <p className="text-xs md:text-sm text-gray-500 mt-2">Deposit: 5.500.000₫</p>
            </div>
            
            <div className="hidden md:flex flex-col space-y-4 mb-6">
              <Button fullWidth size="lg" onClick={handleSchedule}>Schedule Viewing</Button>
              <Button fullWidth variant="outline" size="lg" onClick={handleChat}>Chat with Landlord</Button>
            </div>

            <div className="pt-5 md:pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">L</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm md:text-base">Le Van B</p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-xs md:text-sm">★ 4.9 (12 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-600">Trust Score</span>
                <span className="font-bold text-green-600 text-sm md:text-base">98/100</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="p-4 md:p-6 min-h-screen flex flex-col">
            <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-black/90 pb-4 z-10">
              <h2 className="text-white text-xl md:text-2xl font-bold">Property Photos</h2>
              <Button variant="outline" className="text-white border-white hover:bg-white/20 text-sm md:text-base" onClick={() => setShowGallery(false)}>
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
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-3 sm:p-4 z-40 flex gap-2 sm:gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <Button className="flex-1 text-sm py-2.5" size="lg" onClick={handleSchedule}>Xem phòng</Button>
        <Button className="flex-1 text-sm py-2.5" variant="outline" size="lg" onClick={handleChat}>Nhắn tin</Button>
      </div>

      {/* Booking Date/Time Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="font-bold text-base md:text-lg text-neutral-900">Chọn lịch xem phòng</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-neutral-400 hover:text-neutral-700 font-bold px-2">
                ✕
              </button>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Ngày xem phòng</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Giờ (dự kiến)</label>
                <input 
                  type="time" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                />
              </div>
              <p className="text-xs md:text-sm text-gray-500 text-center mt-4">
                Chủ nhà sẽ nhận được yêu cầu và liên hệ lại với bạn để chốt lịch.
              </p>
              <Button fullWidth size="lg" className="mt-4" onClick={confirmBooking}>Gửi yêu cầu đặt lịch</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
