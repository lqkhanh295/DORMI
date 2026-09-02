import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Heart, X, MessageCircle, Check, CheckCircle2, AlertTriangle } from 'lucide-react';

const MOCK_ROOMMATES = [
  {
    id: 1,
    name: 'Alex',
    age: 22,
    major: 'Sinh viên IT',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    matchScore: 92,
    budget: '3M - 5M VND',
    bio: 'Tìm bạn cùng phòng thoải mái share tiền phòng ở Quận 7. Mình hay code đêm nhưng dùng tai nghe, không ồn ào!',
    tags: ['Yên tĩnh', 'Không hút thuốc', 'Công nghệ', 'Cú đêm'],
    reasons: [
      { text: 'Cùng giờ ngủ (22h - 00h)', type: 'match' },
      { text: 'Cùng ngân sách (3-5M)', type: 'match' },
      { text: 'Không hút thuốc', type: 'match' },
      { text: 'Khác mức độ nuôi thú cưng', type: 'warning' }
    ]
  },
  {
    id: 2,
    name: 'Sarah',
    age: 20,
    major: 'Quản trị kinh doanh',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    matchScore: 88,
    budget: '4M - 6M VND',
    bio: 'Mình là người hướng ngoại, thích nấu ăn và giữ không gian sinh hoạt chung luôn sạch sẽ.',
    tags: ['Hướng ngoại', 'Sạch sẽ', 'Thích nấu ăn', 'Dậy sớm'],
    reasons: [
      { text: 'Cùng thói quen giữ vệ sinh', type: 'match' },
      { text: 'Cùng ngân sách', type: 'match' },
      { text: 'Khác giờ giấc sinh hoạt', type: 'warning' }
    ]
  },
  {
    id: 3,
    name: 'Minh',
    age: 24,
    major: 'Thiết kế đồ họa',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    matchScore: 82,
    budget: '2M - 4M VND',
    bio: 'Rất dễ tính. Phần lớn thời gian mình ở studio hoặc đi uống cà phê bên ngoài.',
    tags: ['Nghệ thuật', 'Yêu mèo', 'Cà phê'],
    reasons: [
      { text: 'Dễ tính, gọn gàng', type: 'match' },
      { text: 'Khác khu vực mong muốn', type: 'warning' }
    ]
  }
];

export default function RoommateMatcher() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLikedModal, setShowLikedModal] = useState(false);
  
  const { likedRoommates, addLikedRoommate } = useStore();
  const navigate = useNavigate();

  const handleAction = (type: 'left' | 'right') => {
    if (currentIndex >= MOCK_ROOMMATES.length) return;
    if (type === 'right') {
      addLikedRoommate(MOCK_ROOMMATES[currentIndex]);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const navigateToChat = (targetId: number) => {
    navigate('/tenant/chat', { state: { targetUserId: `r${targetId}` } });
  };

  const profile = MOCK_ROOMMATES[currentIndex];

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
                {r.matchScore}% Phù hợp
              </p>
            </div>
            <button 
              onClick={() => navigateToChat(r.id)} 
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

  // ponytail: RoommateMatcher with Progressive Profiling 01/03 & Match Explanation Reasons
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

      {/* Main Area: Progressive Matcher */}
      <div className="flex-1 flex flex-col relative bg-[#F5F7FA] rounded-[18px] justify-center">
        
        {/* Progressive Indicator Bar */}
        <div className="bg-white rounded-[18px] shadow-clay-soft p-4 mb-6 flex items-center justify-between">
          <span className="text-caption font-bold text-[#00153D]">Tiến trình tìm kiếm: 03 / 03</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#00153D]"></span>
            <span className="w-8 h-1.5 rounded-full bg-[#00153D]"></span>
            <span className="w-3 h-3 rounded-full bg-[#00153D]"></span>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex lg:hidden justify-between items-center mb-6">
          <h2 className="text-h2 font-bold text-[#0F172A]">Gợi ý ở ghép</h2>
          <button 
            onClick={() => setShowLikedModal(true)}
            className="bg-white border border-[#E2E8F0] text-[#00153D] px-4 py-2 rounded-full text-caption font-bold flex items-center gap-1.5 shadow-clay-soft touch-target"
          >
            <Heart size={16} className="fill-[#C62828] text-[#C62828]" />
            {likedRoommates.length}
          </button>
        </div>

        {currentIndex >= MOCK_ROOMMATES.length ? (
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
              
              {/* Photo & Match Score */}
              <div className="h-64 bg-[#EEF2F6] w-full relative">
                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/95 text-[#16803C] border border-[#DCFCE7] px-3.5 py-1.5 rounded-full text-body font-bold shadow-sm">
                  {profile.matchScore}% Phù hợp
                </div>
              </div>
              
              {/* Content & Explanatory Reasons */}
              <div className="p-6 space-y-4 bg-white">
                <div>
                  <h3 className="text-h3 font-bold text-[#0F172A]">{profile.name}, {profile.age}</h3>
                  <p className="text-caption text-[#64748B] font-semibold">{profile.major} · Ngân sách {profile.budget}</p>
                  <p className="text-body text-[#64748B] mt-2">{profile.bio}</p>
                </div>

                {/* Explanatory Reasons Breakdown */}
                <div className="bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px] space-y-2">
                  <span className="text-caption font-bold text-[#0F172A] block mb-1">Lý do tương thích:</span>
                  {profile.reasons.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-caption font-semibold">
                      {r.type === 'match' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16803C]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                      )}
                      <span className={r.type === 'match' ? 'text-[#16803C]' : 'text-[#B45309]'}>{r.text}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
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

      {/* Liked Modal (Mobile) */}
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
