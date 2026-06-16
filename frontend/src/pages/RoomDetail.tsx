import React, { useState, Suspense, lazy } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Phone, CheckCircle2, ChevronLeft } from 'lucide-react';
import { RoomInfo } from '../components/room/RoomInfo';
import { RoomGallery } from '../components/room/RoomGallery';
import { useStore } from '../store/useStore';

// Lazy load the 3D Viewer
const ThreeDViewer = lazy(() => import('../components/3d/ThreeDViewer'));

export function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show3D, setShow3D] = useState(false);
  
  const { toggleSaveRoom, savedRooms } = useStore();
  const isSaved = savedRooms.includes(Number(id));

  // Handle Contextual Chat
  const handleChat = () => {
    // In a real app, we'd initiate a conversation or pass context via state
    navigate('/customer/messages', { 
      state: { autoMessage: `Chào bạn, tôi đang quan tâm đến căn hộ (ID: ${id}) này...` } 
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Back button */}
      <div>
        <Link to="/search" className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors">
          <ChevronLeft className="w-5 h-5" /> Quay lại
        </Link>
      </div>

      {/* Presentational: Gallery */}
      <RoomGallery id={id} onOpen3D={() => setShow3D(true)} />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Presentational: Room Info */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          <RoomInfo id={id} />
        </div>

        {/* Right Column: CTA & Landlord */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-24">
          <GlassCard className="flex flex-col gap-4">
            <h3 className="font-bold text-lg">Thông tin Chủ trọ</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white/80 overflow-hidden relative">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Landlord" alt="landlord" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h4 className="font-bold flex items-center gap-1">Nguyễn Văn Chủ <CheckCircle2 className="w-4 h-4 text-emerald-500" /></h4>
                <p className="text-sm text-foreground/60">Đã xác minh KYC</p>
              </div>
            </div>

            <div className="w-full h-px bg-white/40 my-1"></div>
            
            <div className="flex gap-2">
              <GlassButton variant="primary" className="flex-1 text-sm"><Phone className="w-4 h-4 mr-2" /> 0901.xxx.xxx</GlassButton>
              <GlassButton variant="secondary" className="flex-1 text-sm" onClick={handleChat}>Nhắn tin</GlassButton>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4 bg-primary/5 border-primary/20">
            <h3 className="font-bold text-lg">Hành động</h3>
            <GlassButton variant="primary" size="lg" className="w-full text-lg">Đặt lịch xem phòng</GlassButton>
            <GlassButton 
              variant={isSaved ? "primary" : "secondary"} 
              className="w-full transition-colors"
              onClick={() => toggleSaveRoom(Number(id))}
            >
              {isSaved ? 'Đã lưu phòng' : 'Lưu phòng này'}
            </GlassButton>
          </GlassCard>
        </div>
      </div>

      {/* Lazy Loaded 3D Modal overlay */}
      {show3D && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-white text-xl animate-pulse">Đang tải không gian 3D...</div>
          </div>
        }>
          <ThreeDViewer onClose={() => setShow3D(false)} />
        </Suspense>
      )}
    </div>
  );
}
