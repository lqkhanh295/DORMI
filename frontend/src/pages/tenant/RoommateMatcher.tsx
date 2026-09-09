import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useStore, type RoommateProfile } from '../../store/useStore';
import { Heart, X, MessageCircle, Check, CheckCircle2 } from 'lucide-react';
import { roommatesApi } from '../../services/api';

export default function RoommateMatcher() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLikedModal, setShowLikedModal] = useState(false);
  const [roommates, setRoommates] = useState<RoommateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const { likedRoommates, addLikedRoommate } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    roommatesApi.getRecommendations()
      .then(res => {
        if (!isMounted) return;
        if (Array.isArray(res) && res.length > 0) {
          const apiRoommates: RoommateProfile[] = res.map((r: any, idx: number) => ({
            id: idx + 1,
            customerId: r.customerId,
            name: r.customerName || 'Người ở ghép',
            age: 22,
            major: r.title || 'Sinh viên',
            image: r.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            matchScore: r.matchScore != null ? Math.round(r.matchScore) : null,
            budget: `${Number(r.budget || 3000000).toLocaleString('vi-VN')}đ`,
            bio: r.description || 'Tìm bạn cùng phòng giữ vệ sinh tốt và thân thiện.',
            tags: (r.lifestyleTraits || 'Yên tĩnh, Sạch sẽ').split(',').map((t: string) => t.trim())
          }));
          setRoommates(apiRoommates);
        }
      })
      .catch((err) => {
        console.warn('API getRecommendations failed:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handleAction = (type: 'left' | 'right') => {
    if (currentIndex >= roommates.length) return;
    if (type === 'right') {
      addLikedRoommate(roommates[currentIndex]);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const navigateToChat = (targetProfile: RoommateProfile) => {
    navigate('/tenant/chat', { 
      state: { 
        targetUserId: targetProfile.customerId || `r${targetProfile.id}`,
        targetUserName: targetProfile.name,
        targetUserRole: 'Roommate'
      } 
    });
  };

  const profile = roommates[currentIndex];

  const LikedList = () => (
    <div className="flex-1 overflow-y-auto flex flex-col p-5 space-y-4 bg-white">
      {likedRoommates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-[#64748B] space-y-3">
          <Heart size={32} className="text-[#CBD5E1]" />
          <p className="text-body font-bold text-[#0F172A]">Chưa có ai trong danh sách</p>
          <p className="text-caption text-[#64748B] text-center max-w-[20ch]">Bấm thích để lưu hồ sơ phù hợp</p>
        </div>
      ) : (
        likedRoommates.map(r => (
          <div key={r.id} className="flex items-center gap-4 p-4 bg-[#F5F7FA] rounded-[12px] border border-[#E2E8F0] shadow-clay-inset">
            <img src={r.image} className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]" alt={r.name} />
            <div className="flex-1 text-left overflow-hidden">
              <h4 className="text-body font-bold text-[#0F172A] truncate">{r.name}, {r.age}</h4>
              <p className="text-caption font-bold text-[#16803C]">
                {r.matchScore != null ? `${r.matchScore}% Phù hợp` : 'Chưa đủ dữ liệu'}
              </p>
            </div>
            <button 
              onClick={() => navigateToChat(r)} 
              className="w-10 h-10 flex items-center justify-center bg-[#00153D] text-white rounded-[10px] hover:bg-[#073372] transition-colors flex-shrink-0 touch-target"
              title="Nhắn tin"
            >
              <MessageCircle size={18} />
            </button>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto min-h-[calc(100vh-80px)] overflow-hidden bg-[#F5F7FA] p-4 md:p-6">
      
      {/* Sidebar: Liked Roommates */}
      <div className="hidden lg:flex w-1/3 flex-col bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
        <div className="p-6 border-b border-[#E2E8F0] bg-white">
          <h2 className="text-h3 font-bold text-[#0F172A] flex items-center gap-2">
            <Heart size={20} className="text-[#C62828] fill-[#C62828]" />
            Đã thích ({likedRoommates.length})
          </h2>
          <p className="text-caption text-[#64748B] mt-1">Hồ sơ người ở ghép bạn đã lưu.</p>
        </div>
        <LikedList />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative bg-[#F5F7FA] rounded-[18px] justify-center">
        
        <div className="bg-white rounded-[18px] shadow-clay-soft p-4 mb-6 flex items-center justify-between">
          <span className="text-caption font-bold text-[#00153D]">Gợi ý người ở ghép (AI Engine API)</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#00153D]"></span>
            <span className="w-8 h-1.5 rounded-full bg-[#00153D]"></span>
            <span className="w-3 h-3 rounded-full bg-[#00153D]"></span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-[#64748B]">
            <div className="w-8 h-8 border-4 border-[#00153D] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p>Đang tải danh sách người ở ghép từ Backend API...</p>
          </div>
        ) : currentIndex >= roommates.length || !profile ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-[18px] shadow-clay-soft p-8 max-w-md mx-auto w-full space-y-4">
            <div className="w-16 h-16 bg-[#F0FDF4] text-[#16803C] rounded-full flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>
            <h2 className="text-h2 font-bold text-[#0F172A]">Đã xem hết gợi ý!</h2>
            <p className="text-[#64748B] text-body max-w-xs mx-auto">
              Bạn đã lưu <span className="font-bold text-[#00153D]">{likedRoommates.length}</span> hồ sơ phù hợp.
            </p>
            <Button onClick={() => setCurrentIndex(0)} variant="secondary" className="px-6">
              Xem lại từ đầu
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center w-full mx-auto">
            <div className="bg-white rounded-[18px] shadow-clay-primary w-full max-w-lg overflow-hidden flex flex-col">
              
              <div className="h-64 bg-[#EEF2F6] w-full relative">
                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/95 text-[#16803C] border border-[#DCFCE7] px-3.5 py-1.5 rounded-full text-body font-bold shadow-sm">
                  {profile.matchScore != null ? `${profile.matchScore}% Phù hợp (AI)` : 'Chưa đủ dữ liệu'}
                </div>
              </div>
              
              <div className="p-6 space-y-4 bg-white">
                <div>
                  <h3 className="text-h3 font-bold text-[#0F172A]">{profile.name}, {profile.age}</h3>
                  <p className="text-caption text-[#64748B] font-semibold">{profile.major} · Ngân sách {profile.budget}</p>
                  <p className="text-body text-[#64748B] mt-2">{profile.bio}</p>
                </div>

                <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px] space-y-2">
                  <span className="text-caption font-bold text-[#0F172A] block mb-1">Lý do tương thích:</span>
                  <div className="flex items-center gap-2 text-caption font-semibold text-[#16803C]">
                    <CheckCircle2 className="w-4 h-4 text-[#16803C]" />
                    <span>Cùng thói quen sinh hoạt và ngân sách</span>
                  </div>
                </div>

                <div className="flex justify-center gap-6 pt-2">
                  <button 
                    onClick={() => handleAction('left')}
                    className="w-14 h-14 rounded-full bg-[#FEF2F2] text-[#C62828] hover:bg-[#C62828] hover:text-white flex items-center justify-center transition-all border border-[#FECACA] shadow-clay-soft touch-target"
                    title="Bỏ qua"
                  >
                    <X size={24} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => handleAction('right')}
                    className="w-14 h-14 rounded-full bg-[#F0FDF4] text-[#16803C] hover:bg-[#16803C] hover:text-white flex items-center justify-center transition-all border border-[#DCFCE7] shadow-clay-soft touch-target"
                    title="Yêu thích"
                  >
                    <Heart size={24} strokeWidth={2.5} className="fill-current" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {showLikedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4 lg:hidden">
          <div className="bg-white rounded-[18px] shadow-clay-primary w-full max-w-md h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
              <h3 className="font-bold text-h3 text-[#0F172A]">Đã thích ({likedRoommates.length})</h3>
              <button onClick={() => setShowLikedModal(false)} className="text-[#64748B] hover:text-[#0F172A] p-2">
                <X size={24} />
              </button>
            </div>
            <LikedList />
          </div>
        </div>
      )}
    </div>
  );
}
