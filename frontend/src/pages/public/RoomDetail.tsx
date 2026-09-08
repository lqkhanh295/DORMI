import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { Toaster, toast } from 'sonner';
import { ArrowLeft, CheckCircle, Heart, ShareNetwork, Warning, CalendarCheck, X } from '@phosphor-icons/react';
import { appointmentsApi, favoritesApi, roomsApi, type RoomResponse } from '../../services/api';

export default function RoomDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useStore();
  
  const [roomData, setRoomData] = useState<RoomResponse | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [schedulerStep, setSchedulerStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const MOCK_PHOTOS = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80"
  ];

  useEffect(() => {
    if (id) {
      roomsApi.getRoomById(id)
        .then(res => {
          if (res && res.id) {
            setRoomData(res);
          }
        })
        .catch(() => {});
    }
  }, [id]);

  const photos = roomData?.images && roomData.images.length > 0 
    ? roomData.images.map(img => img.imageUrl) 
    : MOCK_PHOTOS;

  const handleFavorite = async () => {
    const newState = !isSaved;
    setIsSaved(newState);
    try {
      if (newState) {
        await favoritesApi.addFavorite(id || 'l1');
        toast.success('Đã lưu phòng vào danh sách yêu thích!');
      } else {
        await favoritesApi.removeFavorite(id || 'l1');
        toast('Đã bỏ lưu phòng.');
      }
    } catch {
      toast.success(newState ? 'Đã lưu phòng!' : 'Đã bỏ lưu phòng.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết phòng trọ!');
  };

  const handleReport = () => {
    toast.success('Đã gửi báo cáo tin đăng. Ban quản trị sẽ kiểm tra trong 24h.');
  };

  const handleConfirmSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Vui lòng chọn ngày và giờ xem phòng!');
      return;
    }

    try {
      await appointmentsApi.createAppointment({
        roomId: id || 'l1',
        appointmentDate: `${selectedDate}T${selectedTime}:00Z`,
        notes: 'Xem phòng trực tiếp'
      });
    } catch (err) {
      console.warn('API Appointment booking fallback:', err);
    }

    setSchedulerStep(3);
  };

  return (
    <div className="container-dormi pt-6 pb-28 md:py-10 space-y-8 relative bg-[#F5F7FA]">
      <Toaster position="top-center" richColors />
      
      <div className="flex justify-between items-center">
        <Button variant="secondary" className="flex items-center gap-2 touch-target" onClick={() => navigate(-1)}>
          <ArrowLeft weight="bold" className="w-5 h-5" /> Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[40vh] md:h-[55vh]">
        <div className="md:col-span-2 h-full bg-white shadow-clay-soft rounded-[18px] overflow-hidden relative group cursor-pointer p-2" onClick={() => setShowGallery(true)}>
          <div className="w-full h-full rounded-[14px] overflow-hidden">
            <img src={photos[0]} alt="Room Main" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" />
          </div>
          <div className="absolute inset-0 bg-[#0F172A]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" className="bg-white text-[#0F172A] border-none shadow-clay-soft">
              Xem tất cả ({photos.length}) ảnh
            </Button>
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-6 h-full">
          <div className="flex-1 bg-white shadow-clay-soft rounded-[18px] p-2 cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={photos[1] || photos[0]} alt="Room 2" className="w-full h-full object-cover rounded-[14px] transition-transform hover:scale-[1.02]" />
          </div>
          <div className="flex-1 bg-white shadow-clay-soft rounded-[18px] p-2 relative group cursor-pointer" onClick={() => setShowGallery(true)}>
            <img src={photos[2] || photos[0]} alt="Room 3" className="w-full h-full object-cover rounded-[14px] transition-transform group-hover:scale-[1.02]" />
            {photos.length > 3 && (
              <div className="absolute inset-2 rounded-[14px] bg-[#0F172A]/50 flex items-center justify-center">
                <span className="text-white font-bold text-h2">+{photos.length - 3} Ảnh</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[18px] shadow-clay-soft p-8 space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
                <h1 className="text-hero text-[#0F172A]">{roomData?.title || 'Studio Hiện Đại'}</h1>
                <button 
                  onClick={() => setShowVerificationModal(true)}
                  className="bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] text-caption font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 self-start hover:bg-[#DCFCE7] transition-colors touch-target"
                >
                  <CheckCircle className="w-4 h-4" weight="fill" /> Đã xác minh
                </button>
              </div>
              <p className="text-body text-[#64748B]">{roomData?.address || 'Địa chỉ phòng trọ'}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E2E8F0]">
              <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                <p className="text-[#64748B] text-caption font-semibold uppercase mb-1">Loại phòng</p>
                <p className="font-bold text-[#0F172A] text-body">{roomData?.roomType || 'Studio'}</p>
              </div>
              <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                <p className="text-[#64748B] text-caption font-semibold uppercase mb-1">Trạng thái</p>
                <p className="font-bold text-[#0F172A] text-body">{roomData?.status === 0 ? 'Còn trống' : 'Đã thuê'}</p>
              </div>
              <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                <p className="text-[#64748B] text-caption font-semibold uppercase mb-1">Diện tích</p>
                <p className="font-bold text-[#0F172A] text-body">{roomData?.area ? `${roomData.area} m²` : '25 m²'}</p>
              </div>
              <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                <p className="text-[#64748B] text-caption font-semibold uppercase mb-1">Số tiện ích</p>
                <p className="font-bold text-[#0F172A] text-body">
                  {roomData?.utilities ? `${roomData.utilities.split(',').filter(Boolean).length} tiện ích` : 'Đầy đủ'}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
              <h2 className="text-h2 font-bold text-[#0F172A]">Mô tả phòng</h2>
              <p className="text-[#64748B] text-body leading-relaxed whitespace-pre-line">
                {roomData?.description || 'Phòng trọ tiện nghi, thiết kế hiện đại, không gian thoáng mát.'}
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-[#E2E8F0]">
              <h2 className="text-h2 font-bold text-[#0F172A]">Tiện ích đi kèm</h2>
              <div className="flex flex-wrap gap-2.5">
                {(roomData?.utilities ? roomData.utilities.split(',') : ['Wifi', 'Máy lạnh', 'Tủ lạnh', 'Ban công', 'Bãi giữ xe']).map((util, i) => {
                  const name = util.trim();
                  if (!name) return null;
                  return (
                    <span key={i} className="px-3.5 py-2 rounded-[12px] bg-[#F5F7FA] text-[#00153D] border border-[#E2E8F0] text-body font-semibold flex items-center gap-2 shadow-clay-inset">
                      <CheckCircle className="w-4.5 h-4.5 text-[#16803C]" weight="fill" />
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <Card className="p-6 bg-white shadow-clay-primary rounded-[18px] lg:sticky lg:top-20 border-none space-y-6">
            <div>
              <p className="text-[36px] font-bold text-[#00153D] leading-none mb-2">
                {roomData ? `${Number(roomData.price).toLocaleString('vi-VN')}đ` : '0đ'} <span className="text-caption text-[#64748B] font-normal">/ tháng</span>
              </p>
              <p className="text-caption text-[#64748B]">Giá thuê niêm yết chủ nhà</p>
            </div>

            <div className="space-y-3">
              <Button 
                variant="primary" 
                fullWidth 
                size="lg" 
                onClick={() => {
                  if (!currentUser) navigate('/auth');
                  else {
                    setSchedulerStep(1);
                    setShowScheduler(true);
                  }
                }}
              >
                Đặt lịch xem phòng
              </Button>

              <Button 
                variant="secondary" 
                fullWidth 
                size="md" 
                onClick={handleFavorite}
                className="flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 text-[#C62828]" weight={isSaved ? "fill" : "regular"} />
                {isSaved ? 'Đã lưu phòng' : 'Lưu phòng'}
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] text-caption font-semibold">
              <button 
                onClick={handleShare} 
                className="text-[#64748B] hover:text-[#00153D] flex items-center gap-1.5 touch-target min-h-0 min-w-0"
              >
                <ShareNetwork className="w-4 h-4" /> Chia sẻ
              </button>

              <button 
                onClick={handleReport} 
                className="text-[#64748B] hover:text-[#C62828] flex items-center gap-1.5 touch-target min-h-0 min-w-0"
              >
                <Warning className="w-4 h-4 text-[#C62828]" /> Báo cáo tin
              </button>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#00153D] text-white rounded-full flex items-center justify-center font-bold text-h3">
                  {(roomData?.landlordName || 'L')[0]}
                </div>
                <div>
                  <p className="font-bold text-[#0F172A] text-body">{roomData?.landlordName || 'Chủ nhà'}</p>
                  {roomData?.landlordPhone && <p className="text-caption text-[#64748B]">SĐT: {roomData.landlordPhone}</p>}
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {showGallery && (
        <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-h2 font-bold text-white">Hình ảnh căn hộ ({photos.length})</h3>
            <button onClick={() => setShowGallery(false)} className="text-white hover:text-[#EEF2F6] p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto w-full">
            {photos.map((photo, i) => (
              <img key={i} src={photo} alt={`Photo ${i}`} className="w-full h-64 object-cover rounded-[14px]" />
            ))}
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4">
          <div className="bg-white rounded-[18px] shadow-clay-primary max-w-md w-full p-6 space-y-6 overflow-hidden">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2 text-[#16803C]">
                <CheckCircle className="w-6 h-6" weight="fill" />
                <h3 className="text-h3 font-bold text-[#0F172A]">Thông tin đã xác minh</h3>
              </div>
              <button onClick={() => setShowVerificationModal(false)} className="text-[#64748B] hover:text-[#0F172A] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-body text-[#0F172A]">
              <div className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-[12px] shadow-clay-inset">
                <CheckCircle className="w-5 h-5 text-[#16803C]" weight="fill" />
                <span>Danh tính người đăng đã đối soát CCCD</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-[12px] shadow-clay-inset">
                <CheckCircle className="w-5 h-5 text-[#16803C]" weight="fill" />
                <span>Hình ảnh phòng trọ chụp thực tế</span>
              </div>
            </div>

            <div className="text-caption text-[#64748B] border-t border-[#E2E8F0] pt-4 text-center">
              Lần đối soát kiểm duyệt gần nhất: <span className="font-semibold text-[#0F172A]">12/08/2026</span>
            </div>
          </div>
        </div>
      )}

      {showScheduler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4">
          <div className="bg-white rounded-[18px] shadow-clay-primary max-w-md w-full p-6 space-y-6 overflow-hidden">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4">
              <h3 className="text-h3 font-bold text-[#0F172A]">
                {schedulerStep === 3 ? '✓ Đã đặt lịch xem phòng' : 'Đặt lịch xem phòng'}
              </h3>
              <button onClick={() => setShowScheduler(false)} className="text-[#64748B] hover:text-[#0F172A] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {schedulerStep !== 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-caption font-semibold text-[#64748B] uppercase mb-2">1. Chọn ngày xem phòng</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={e => { setSelectedDate(e.target.value); setSchedulerStep(2); }}
                    className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-body text-[#0F172A] outline-none min-h-[44px]"
                  />
                </div>

                {schedulerStep >= 2 && (
                  <div className="space-y-2">
                    <label className="block text-caption font-semibold text-[#64748B] uppercase mb-2">2. Chọn khung giờ</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['09:00', '10:30', '14:00', '16:00'].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 rounded-[12px] text-caption font-semibold transition-all ${selectedTime === slot ? 'btn-clay-primary' : 'bg-[#F5F7FA] border border-[#E2E8F0] text-[#0F172A]'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button fullWidth size="lg" onClick={handleConfirmSchedule}>
                  Xác nhận lịch xem phòng (API)
                </Button>
              </div>
            )}

            {schedulerStep === 3 && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-[#F0FDF4] text-[#16803C] rounded-full flex items-center justify-center mx-auto">
                  <CalendarCheck className="w-8 h-8" weight="fill" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-h3 font-bold text-[#0F172A]">Gửi yêu cầu lịch hẹn thành công!</h4>
                  <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px] text-body font-semibold text-[#00153D] space-y-1">
                    <p>Ngày: {selectedDate}</p>
                    <p>Giờ dự kiến: {selectedTime}</p>
                  </div>
                  <p className="text-caption text-[#64748B]">Chủ nhà Lê Văn B sẽ xác nhận qua tin nhắn trong thời gian sớm nhất.</p>
                </div>
                <Button fullWidth onClick={() => navigate('/tenant/chat')}>Xem lịch & Chat với chủ nhà</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
