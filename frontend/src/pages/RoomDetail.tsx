import { Suspense, lazy, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, CalendarPlus, ChevronLeft, Heart, MessageCircle, Phone } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { RoomGallery } from '../components/room/RoomGallery';
import { RoomInfo } from '../components/room/RoomInfo';
import { useStore } from '../store/useStore';

const ThreeDViewer = lazy(() => import('../components/3d/ThreeDViewer'));

export function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [show3D, setShow3D] = useState(false);
  const { toggleSaveRoom, savedRooms } = useStore();
  const isSaved = savedRooms.includes(Number(id));
  const from = (location.state as { from?: string } | null)?.from;
  const fallbackPath = location.pathname.startsWith('/customer') ? '/customer/search' : '/';

  const handleBack = () => {
    navigate(from || fallbackPath);
  };

  const handleChat = () => {
    navigate('/customer/messages', {
      state: { autoMessage: `Chào bạn, tôi đang quan tâm đến căn phòng (ID: ${id}) này. Mình có thể trao đổi thêm không?` },
    });
  };

  return (
    <div className="section-shell flex flex-col gap-6 py-8">
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-5 w-5" /> Quay lại trang trước
        </button>
      </div>

      <RoomGallery id={id} onOpen3D={() => setShow3D(true)} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1">
          <RoomInfo id={id} />
        </div>

        <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-24 lg:w-[360px]">
          <GlassCard tone="solid" className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-semibold text-muted">Giá thuê</p>
              <p className="text-3xl font-extrabold text-primary">5.000.000đ</p>
              <p className="text-sm text-muted">/ tháng, còn thương lượng nhẹ</p>
            </div>

            <GlassButton size="lg" className="w-full" leftIcon={<CalendarPlus className="h-5 w-5" />}>
              Đặt lịch xem phòng
            </GlassButton>
            <div className="grid grid-cols-2 gap-2">
              <GlassButton variant="secondary" onClick={handleChat} leftIcon={<MessageCircle className="h-4 w-4" />}>
                Nhắn tin
              </GlassButton>
              <GlassButton
                variant={isSaved ? 'primary' : 'secondary'}
                onClick={() => toggleSaveRoom(Number(id))}
                leftIcon={<Heart className="h-4 w-4" />}
              >
                {isSaved ? 'Đã lưu' : 'Lưu'}
              </GlassButton>
            </div>
          </GlassCard>

          <GlassCard tone="solid" className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-line bg-slate-100">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Landlord" alt="Chủ phòng" className="h-full w-full object-cover" />
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div>
                <h3 className="flex items-center gap-1 font-bold">
                  Nguyễn Văn Chủ <BadgeCheck className="h-4 w-4 text-emerald-500" />
                </h3>
                <p className="text-sm text-muted">Chủ phòng đã xác minh KYC</p>
              </div>
            </div>

            <div className="rounded-lg bg-[#f7f8f3] p-4 text-sm leading-6 text-muted">
              Phản hồi trung bình trong 15 phút. Có thể xem phòng trực tiếp sau 17:00 các ngày trong tuần.
            </div>

            <GlassButton variant="secondary" className="w-full" leftIcon={<Phone className="h-4 w-4" />}>
              0901.xxx.xxx
            </GlassButton>
          </GlassCard>
        </aside>
      </div>

      {show3D && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="animate-pulse text-xl text-white">Đang tải không gian 3D...</div>
            </div>
          }
        >
          <ThreeDViewer onClose={() => setShow3D(false)} />
        </Suspense>
      )}
    </div>
  );
}
