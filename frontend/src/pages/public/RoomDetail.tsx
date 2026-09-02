import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { Toaster, toast } from 'sonner';
import { ArrowLeft, ShieldCheck, Star } from '@phosphor-icons/react';

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

  return (
    <div className="max-w-[1400px] mx-auto px-4 pt-6 pb-28 md:py-10 space-y-8 relative bg-canvas">
      <Toaster position="top-center" richColors />
      
      {/* Editorial Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" className="flex items-center gap-2 touch-target" onClick={() => navigate(-1)}>
          <ArrowLeft weight="bold" className="w-5 h-5" /> Quay lại
        </Button>
      </div>

      {/* Image Gallery Header (Asymmetric Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[40vh] md:h-[60vh]">
        <div className="md:col-span-2 h-full bg-surface-alt rounded-bento overflow-hidden relative group cursor-pointer" onClick={() => setShowGallery(true)}>
          <img src={MOCK_PHOTOS[0]} alt="Room Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-text-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" className="bg-canvas text-text-primary border-none shadow-sm" onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}>
              Xem tất cả ảnh
            </Button>
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-6 h-full">
          <div className="flex-1 bg-surface-alt rounded-bento overflow-hidden cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={MOCK_PHOTOS[1]} alt="Room 2" className="w-full h-full object-cover transition-transform hover:scale-[1.03] duration-500" />
          </div>
          <div className="flex-1 bg-surface-alt rounded-bento overflow-hidden relative group cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={MOCK_PHOTOS[2]} alt="Room 3" className="w-full h-full object-cover transition-transform group-hover:scale-[1.03] duration-500" />
            <div className="absolute inset-0 bg-text-primary/50 flex items-center justify-center transition-colors group-hover:bg-text-primary/45">
              <span className="text-canvas font-bold text-h2">+12 Ảnh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        
        {/* Left Column: Room Details */}
        <div className="lg:col-span-8 space-y-10">
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <h1 className="text-[32px] md:text-[40px] font-bold text-text-primary leading-[1.1] tracking-tight">Studio Hiện Đại - Quận 3</h1>
              <span className="bg-success-soft text-success border border-success-soft text-caption font-bold px-3 py-1.5 rounded-pill flex items-center gap-1.5 self-start">
                <ShieldCheck  className="w-4 h-4" /> Chủ nhà đã xác thực
              </span>
            </div>
            <p className="text-body-lg text-text-secondary">123 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP.HCM</p>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-y border-border-subtle">
            <div className="bg-surface p-4 rounded-md border border-border-subtle">
              <p className="text-text-muted text-caption uppercase tracking-wider mb-1">Loại phòng</p>
              <p className="font-bold text-text-primary text-body">Studio</p>
            </div>
            <div className="bg-surface p-4 rounded-md border border-border-subtle">
              <p className="text-text-muted text-caption uppercase tracking-wider mb-1">Sức chứa</p>
              <p className="font-bold text-text-primary text-body">2 Người</p>
            </div>
            <div className="bg-surface p-4 rounded-md border border-border-subtle">
              <p className="text-text-muted text-caption uppercase tracking-wider mb-1">Diện tích</p>
              <p className="font-bold text-text-primary text-body">35 m²</p>
            </div>
            <div className="bg-surface p-4 rounded-md border border-border-subtle">
              <p className="text-text-muted text-caption uppercase tracking-wider mb-1">Phòng tắm</p>
              <p className="font-bold text-text-primary text-body">Riêng biệt</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-h2 font-bold text-text-primary tracking-tight">Mô tả chi tiết</h2>
            <p className="text-text-secondary text-body leading-relaxed max-w-[70ch]">
              Studio hiện đại với đầy đủ nội thất tọa lạc tại trung tâm Quận 3. Rất gần các trường đại học, cửa hàng tiện lợi và quán cà phê. Tòa nhà có bảo vệ 24/7, ra vào bằng vân tay, và máy giặt miễn phí trên sân ước.
            </p>
          </div>
        </div>

        {/* Right Column: Booking Sidebar */}
        <div className="lg:col-span-4 flex flex-col">
          <Card className="p-6 border border-border-subtle bg-surface lg:sticky lg:top-24 rounded-bento">
            <div className="mb-6">
              <p className="text-[32px] font-bold text-primary leading-none mb-2">5.500.000₫ <span className="text-caption text-text-secondary font-normal">/ tháng</span></p>
              <p className="text-caption text-text-muted">Cọc bảo đảm: 5.500.000₫</p>
            </div>
            
            <div className="hidden md:flex flex-col gap-3 mb-6">
              <Button variant="primary" fullWidth size="lg" onClick={handleSchedule}>Đặt lịch xem phòng</Button>
              <Button variant="secondary" fullWidth size="lg" onClick={handleChat}>Chat với Chủ nhà</Button>
            </div>

            <div className="pt-6 border-t border-border-subtle space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-alt rounded-pill flex items-center justify-center font-bold text-text-primary border border-border-subtle">L</div>
                <div>
                  <p className="font-bold text-text-primary text-body">Lê Văn B</p>
                  <div className="flex items-center gap-1.5">
                    <Star  className="w-4 h-4 text-warning" />
                    <span className="text-caption text-text-secondary font-medium">4.9 (12 đánh giá)</span>
                  </div>
                </div>
              </div>
              <div className="bg-canvas p-4 rounded-md border border-border-subtle flex items-center justify-between shadow-xs">
                <span className="text-caption text-text-secondary">Điểm tin cậy (Trust Score)</span>
                <span className="font-bold text-success text-body">98/100</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Photo Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-text-primary z-50 overflow-y-auto">
          <div className="p-6 min-h-screen flex flex-col max-w-[1400px] mx-auto">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-text-primary/95 pb-4 z-10">
              <h2 className="text-canvas text-h2 font-bold tracking-tight">Hình ảnh phòng</h2>
              <Button variant="outline" className="text-canvas border-canvas hover:bg-canvas/10 text-body" onClick={() => setShowGallery(false)}>
                ✕ Đóng
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {MOCK_PHOTOS.map((photo, i) => (
                <div key={i} className="aspect-[4/3] rounded-bento overflow-hidden bg-text-secondary/20">
                  <img src={photo} alt={`Property view ${i + 1}`} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-canvas border-t border-border-subtle p-4 z-40 flex gap-3 shadow-lg">
        <Button className="flex-1" variant="primary" size="md" onClick={handleSchedule}>Xem phòng</Button>
        <Button className="flex-1" variant="secondary" size="md" onClick={handleChat}>Nhắn tin</Button>
      </div>

      {/* Booking Date/Time Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 p-4">
          <div className="bg-canvas border border-border-subtle rounded-bento w-full max-w-md shadow-lg overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-bold text-h3 text-text-primary">Chọn lịch xem phòng</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-text-muted hover:text-text-primary font-bold px-2">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-caption font-bold text-text-secondary uppercase mb-2">Ngày xem phòng</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-border-subtle bg-surface rounded-md px-3 py-2 text-body text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[44px]"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-caption font-bold text-text-secondary uppercase mb-2">Giờ (dự kiến)</label>
                <input 
                  type="time" 
                  className="w-full border border-border-subtle bg-surface rounded-md px-3 py-2 text-body text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[44px]"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                />
              </div>
              <p className="text-caption text-text-muted text-center mt-4">
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
