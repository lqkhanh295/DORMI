import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Heart, Sparkles, X, MessageCircle } from 'lucide-react';

const MOCK_ROOMMATES = [
  {
    id: 1,
    name: 'Alex',
    age: 22,
    major: 'Sinh viên IT',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    matchScore: 95,
    budget: '3M - 5M VND',
    bio: 'Tìm bạn cùng phòng thoải mái share tiền phòng ở Quận 7. Mình hay code đêm nhưng dùng tai nghe, không ồn ào!',
    tags: ['Yên tĩnh', 'Không hút thuốc', 'Công nghệ', 'Cú đêm']
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
    tags: ['Hướng ngoại', 'Sạch sẽ', 'Thích nấu ăn', 'Dậy sớm']
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
    tags: ['Nghệ thuật', 'Yêu mèo', 'Cà phê']
  }
];

export default function RoommateMatcher() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState<false | 'left' | 'right'>(false);
  const [showLikedModal, setShowLikedModal] = useState(false); // Only for mobile
  
  const { likedRoommates, addLikedRoommate } = useStore();
  const navigate = useNavigate();

  const handleAction = (type: 'left' | 'right') => {
    if (animating || currentIndex >= MOCK_ROOMMATES.length) return;
    setAnimating(type);
    
    setTimeout(() => {
      if (type === 'right') {
        addLikedRoommate(MOCK_ROOMMATES[currentIndex]);
      }
      setCurrentIndex(prev => prev + 1);
      setAnimating(false);
    }, 300);
  };

  const navigateToChat = (targetId: number) => {
    navigate('/tenant/chat', { state: { targetUserId: `r${targetId}` } });
  };

  const profile = MOCK_ROOMMATES[currentIndex];
  const nextProfile = MOCK_ROOMMATES[currentIndex + 1];

  // Component render danh sách đã thích để dùng chung cho Mobile (Modal) và Desktop (Sidebar)
  const LikedList = () => (
    <div className="flex-1 overflow-y-auto flex flex-col p-4 space-y-3 bg-neutral-50/50">
      {likedRoommates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-2">
          <Heart size={32} className="opacity-20" />
          <p className="text-sm">Chưa có ai trong danh sách.</p>
          <p className="text-xs">Bấm ♥ để thích bạn cùng phòng phù hợp</p>
        </div>
      ) : (
        likedRoommates.map(r => (
          <div key={r.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow transition-shadow">
            <img src={r.image} className="w-12 h-12 rounded-full object-cover border border-neutral-100" alt={r.name} />
            <div className="flex-1 text-left overflow-hidden">
              <h4 className="font-bold text-neutral-900 truncate">{r.name}, {r.age}</h4>
              <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                <Sparkles size={10} /> {r.matchScore}% Match
              </p>
            </div>
            <button 
              onClick={() => navigateToChat(r.id)} 
              className="w-8 h-8 flex items-center justify-center bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors flex-shrink-0"
              title="Nhắn tin"
            >
              <MessageCircle size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      
      {/* Sidebar: Liked Roommates (Desktop Only) */}
      <div className="hidden lg:flex w-1/3 flex-col bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-5 border-b border-neutral-100 bg-white">
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Heart size={20} className="text-primary-500" fill="currentColor" />
            Đã thích ({likedRoommates.length})
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Những người bạn đã chọn ghép phòng.</p>
        </div>
        <LikedList />
      </div>

      {/* Main Area: Matcher */}
      <div className="flex-1 flex flex-col relative bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-sm lg:shadow-none border border-neutral-200 lg:border-none p-4 lg:p-0">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex lg:hidden justify-between items-center mb-4">
          <div className="text-left">
            <h2 className="text-xl font-bold text-neutral-900">Roommate Matcher</h2>
          </div>
          <button 
            onClick={() => setShowLikedModal(true)}
            className="bg-white shadow-sm border border-neutral-200 text-primary-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:bg-neutral-50 transition-colors"
          >
            <Heart size={16} fill="currentColor" className="text-primary-500" />
            {likedRoommates.length}
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block text-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-1 flex items-center justify-center gap-2">
            <Sparkles className="text-primary-500" /> AI Roommate Matcher
          </h2>
          <p className="text-neutral-500 text-sm">Hệ thống AI sẽ gợi ý những người có chung lối sống và ngân sách với bạn.</p>
        </div>

        {currentIndex >= MOCK_ROOMMATES.length ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-xl lg:shadow-sm lg:border lg:border-neutral-200 p-8">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4 text-primary-500">
              <Heart size={32} fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Đã xem hết danh sách!</h2>
            <p className="text-neutral-500 text-sm max-w-xs mx-auto">
              Bạn đã thích <span className="font-bold text-primary-600">{likedRoommates.length}</span> người. Hệ thống đang tìm kiếm thêm các ứng viên mới.
            </p>
            <button 
              onClick={() => setCurrentIndex(0)} 
              className="mt-6 px-6 py-2.5 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors mx-auto block"
            >
              Xem lại từ đầu
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
            <div className="relative w-full aspect-[3/4]">
              {/* Next Card Background */}
              {nextProfile && (
                <Card className="absolute inset-0 bg-white shadow-sm border border-neutral-200 rounded-2xl scale-95 translate-y-3 opacity-60 z-0">
                  <div className="w-full h-full bg-neutral-50 rounded-2xl" />
                </Card>
              )}

              {/* Current Active Card */}
              <Card 
                className={`absolute inset-0 bg-white shadow-card rounded-2xl overflow-hidden flex flex-col z-10 transition-all duration-300 border border-neutral-100 ${animating === 'left' ? '-translate-x-full -rotate-12 opacity-0' : animating === 'right' ? 'translate-x-full rotate-12 opacity-0' : 'translate-x-0 rotate-0 opacity-100'}`}
              >
                <div className="h-[55%] bg-neutral-200 w-full relative">
                  <img 
                    src={profile.image} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-xs font-bold text-green-600 flex items-center gap-1 shadow-sm">
                    <Sparkles size={12} className="text-green-500" /> {profile.matchScore}%
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                    <h3 className="text-xl font-bold">{profile.name}, {profile.age}</h3>
                    <p className="text-xs opacity-90 mt-0.5">{profile.major}</p>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                  <div className="mb-3">
                    <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Giới thiệu</h4>
                    <p className="text-sm text-neutral-700 leading-relaxed line-clamp-3">{profile.bio}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Ngân sách chia sẻ</h4>
                    <p className="text-sm font-medium text-primary-700 bg-primary-50 inline-block px-2.5 py-1 rounded-md border border-primary-100/50">{profile.budget}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-1.5">
                      {profile.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-neutral-100 text-[11px] rounded-md text-neutral-600 font-medium border border-neutral-200/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-6 mt-6">
              <button 
                onClick={() => handleAction('left')}
                disabled={!!animating}
                className="w-14 h-14 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-neutral-200 disabled:opacity-50"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => handleAction('right')}
                disabled={!!animating}
                className="w-14 h-14 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center text-green-500 hover:bg-green-50 hover:text-green-600 transition-all border border-neutral-200 disabled:opacity-50"
              >
                <Heart size={24} strokeWidth={2.5} fill="currentColor" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liked Modal (Mobile Only) */}
      {showLikedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 lg:hidden">
          <div className="bg-white rounded-xl w-full max-w-md h-[80vh] flex flex-col shadow-lg overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-neutral-900">Đã thích ({likedRoommates.length})</h3>
              <button onClick={() => setShowLikedModal(false)} className="text-neutral-400 hover:text-neutral-700">
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
