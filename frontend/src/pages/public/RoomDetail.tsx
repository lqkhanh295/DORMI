import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { Toaster, toast } from 'sonner';
import { ArrowLeft, Star, Check } from '@phosphor-icons/react';

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
      navigate('/auth');
    } else {
      navigate('/tenant/chat');
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

  // ponytail: RoomDetail page with Level 1 Primary Clay booking sidebar and Level 2 Soft Clay details
  return (
    <div className="container-dormi pt-6 pb-28 md:py-10 space-y-8 relative bg-[#F5F7FA]">
      <Toaster position="top-center" richColors />
      
      {/* Back Button */}
      <div className="flex justify-between items-center">
        <Button variant="secondary" className="flex items-center gap-2 touch-target" onClick={() => navigate(-1)}>
          <ArrowLeft weight="bold" className="w-5 h-5" /> Quay lại
        </Button>
      </div>

      {/* Image Gallery Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[40vh] md:h-[60vh]">
        <div className="md:col-span-2 h-full bg-white shadow-clay-soft rounded-[18px] overflow-hidden relative group cursor-pointer p-2" onClick={() => setShowGallery(true)}>
          <div className="w-full h-full rounded-[14px] overflow-hidden">
            <img src={MOCK_PHOTOS[0]} alt="Room Main" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" />
          </div>
          <div className="absolute inset-0 bg-[#0F172A]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" className="bg-white text-[#0F172A] border-none shadow-clay-soft" onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}>
              Xem tất cả ảnh
            </Button>
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-6 h-full">
          <div className="flex-1 bg-white shadow-clay-soft rounded-[18px] p-2 cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={MOCK_PHOTOS[1]} alt="Room 2" className="w-full h-full object-cover rounded-[14px] transition-transform hover:scale-[1.02]" />
          </div>
          <div className="flex-1 bg-white shadow-clay-soft rounded-[18px] p-2 relative group cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={MOCK_PHOTOS[2]} alt="Room 3" className="w-full h-full object-cover rounded-[14px] transition-transform group-hover:scale-[1.02]" />
            <div className="absolute inset-2 rounded-[14px] bg-[#0F172A]/50 flex items-center justify-center">
              <span className="text-white font-bold text-h2">+12 Ảnh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        
        {/* Left Column: Room Details */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white rounded-[18px] shadow-clay-soft p-6 md:p-8 space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <h1 className="text-hero text-[#0F172A]">Studio Hiện Đại - Quận 3</h1>
                <span className="bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] text-caption font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 self-start">
                  <Check className="w-4 h-4" weight="bold" /> Đã xác minh
                </span>
              </div>
              <p className="text-body text-[#64748B]">123 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP.HCM</p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E2E8F0]">
              <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                <p className="text-[#64748B] text-caption font-semibold uppercase tracking-wider mb-1">Loại phòng</p>
                <p className="font-bold text-[#0F172A] text-body">Studio</p>
              </div>
              <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                <p className="text-[#64748B] text-caption font-semibold uppercase tracking-wider mb-1">Sức chứa</p>
                <p className="font-bold text-[#0F172A] text-body">2 Người</p>
              </div>
              <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                <p className="text-[#64748B] text-caption font-semibold uppercase tracking-wider mb-1">Diện tích</p>
                <p className="font-bold text-[#0F172A] text-body">35 m²</p>
              </div>
              <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                <p className="text-[#64748B] text-caption font-semibold uppercase tracking-wider mb-1">Phòng tắm</p>
                <p className="font-bold text-[#0F172A] text-body">Riêng biệt</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-h2 font-bold text-[#0F172A]">Mô tả chi tiết</h2>
              <p className="text-[#64748B] text-body leading-relaxed max-w-[70ch]">
                Studio hiện đại với đầy đủ nội thất tọa lạc tại trung tâm Quận 3. Rất gần các trường đại học, cửa hàng tiện lợi và quán cà phê. Tòa nhà có bảo vệ 24/7, ra vào bằng vân tay, và máy giặt miễn phí trên sân thượng.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Sidebar (Level 1 Primary Clay) */}
        <div className="lg:col-span-4 flex flex-col">
          <Card className="p-6 bg-white shadow-clay-primary rounded-[18px] lg:sticky lg:top-24 border-none">
            <div className="mb-6">
              <p className="text-[32px] font-bold text-[#00153D] leading-none mb-2">5.500.000₫ <span className="text-caption text-[#64748B] font-normal">/ tháng</span></p>
              <p className="text-caption text-[#64748B]">Cọc bảo đảm: 5.500.000₫</p>
            </div>
            
            <div className="hidden md:flex flex-col gap-3 mb-6">
              <Button variant="primary" fullWidth size="lg" onClick={handleSchedule}>Đặt lịch xem phòng</Button>
              <Button variant="secondary" fullWidth size="lg" onClick={handleChat}>Chat với Chủ nhà</Button>
            </div>

            <div className="pt-6 border-t border-[#E2E8F0] space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00153D] text-white rounded-full flex items-center justify-center font-bold">L</div>
                <div>
                  <p className="font-bold text-[#0F172A] text-body">Lê Văn B</p>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#F2A900]" weight="fill" />
                    <span className="text-caption text-[#64748B] font-medium">4.9 (12 đánh giá)</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px] flex items-center justify-between">
                <span className="text-caption text-[#64748B]">Điểm tin cậy</span>
                <span className="font-bold text-[#16803C] text-body">98/100</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Photo Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-[#0F172A] z-50 overflow-y-auto">
          <div className="p-6 min-h-screen flex flex-col container-dormi">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#0F172A]/95 pb-4 z-10">
              <h2 className="text-white text-h2 font-bold tracking-tight">Hình ảnh phòng</h2>
              <Button variant="outline" className="text-white border-white hover:bg-white/10 text-body" onClick={() => setShowGallery(false)}>
                ✕ Đóng
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {MOCK_PHOTOS.map((photo, i) => (
                <div key={i} className="aspect-[4/3] rounded-[18px] overflow-hidden bg-[#64748B]/20">
                  <img src={photo} alt={`Property view ${i + 1}`} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[#E2E8F0] p-4 z-40 flex gap-3 shadow-lg">
        <Button className="flex-1" variant="primary" size="md" onClick={handleSchedule}>Xem phòng</Button>
        <Button className="flex-1" variant="secondary" size="md" onClick={handleChat}>Nhắn tin</Button>
      </div>

      {/* Booking Date/Time Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4">
          <div className="bg-white border-none shadow-clay-primary rounded-[18px] w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
              <h3 className="font-bold text-h3 text-[#0F172A]">Chọn lịch xem phòng</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-[#64748B] hover:text-[#0F172A] font-bold px-2">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-caption font-semibold text-[#64748B] uppercase mb-2">Ngày xem phòng</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] outline-none focus:bg-white focus:border-[#00153D] min-h-[44px]"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-caption font-semibold text-[#64748B] uppercase mb-2">Giờ (dự kiến)</label>
                <input 
                  type="time" 
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] outline-none focus:bg-white focus:border-[#00153D] min-h-[44px]"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                />
              </div>
              <p className="text-caption text-[#64748B] text-center mt-4">
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
