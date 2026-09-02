import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Heart, Sparkles, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showLikedModal, setShowLikedModal] = useState(false);
  
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

  const LikedList = () => (
    <div className="flex-1 overflow-y-auto flex flex-col p-5 space-y-4 bg-surface">
      {likedRoommates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-3">
          <Heart size={32} className="text-text-muted/40" />
          <p className="text-body font-medium">Chưa có ai trong danh sách</p>
          <p className="text-caption text-text-muted text-center max-w-[20ch]">Bấm nút thích để chọn bạn cùng phòng phù hợp</p>
        </div>
      ) : (
        likedRoommates.map(r => (
          <div key={r.id} className="flex items-center gap-4 p-4 bg-canvas rounded-md border border-border-subtle shadow-xs hover:shadow-sm transition-shadow">
            <img src={r.image} className="w-12 h-12 rounded-pill object-cover border border-border-subtle" alt={r.name} />
            <div className="flex-1 text-left overflow-hidden">
              <h4 className="text-body font-bold text-text-primary truncate">{r.name}, {r.age}</h4>
              <p className="text-caption font-semibold text-success flex items-center gap-1">
                <Sparkles size={12} className="fill-success" /> {r.matchScore}% Match
              </p>
            </div>
            <button 
              onClick={() => navigateToChat(r.id)} 
              className="w-10 h-10 flex items-center justify-center bg-primary-soft text-primary rounded-pill hover:bg-primary hover:text-white transition-colors flex-shrink-0 touch-target"
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
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto h-[calc(100vh-90px)] lg:h-[calc(100vh-80px)] overflow-hidden bg-canvas p-4 md:p-6">
      
      {/* Sidebar: Liked Roommates (Desktop Only) */}
      <div className="hidden lg:flex w-1/3 flex-col bg-surface rounded-bento border border-border-subtle overflow-hidden">
        <div className="p-6 border-b border-border-subtle bg-canvas">
          <h2 className="text-h3 font-bold text-text-primary flex items-center gap-2">
            <Heart size={20} className="text-primary fill-primary" />
            Đã thích ({likedRoommates.length})
          </h2>
          <p className="text-caption text-text-secondary mt-1">Những người bạn đã chọn ghép phòng.</p>
        </div>
        <LikedList />
      </div>

      {/* Main Area: Matcher */}
      <div className="flex-1 flex flex-col relative bg-canvas lg:bg-transparent rounded-bento border border-border-subtle lg:border-none p-6 lg:p-0 justify-center">
        
        {/* Mobile Header */}
        <div className="flex lg:hidden justify-between items-center mb-6">
          <h2 className="text-h2 font-bold text-text-primary">Gợi ý ở ghép</h2>
          <button 
            onClick={() => setShowLikedModal(true)}
            className="bg-surface shadow-xs border border-border-subtle text-primary px-4 py-2 rounded-pill text-caption font-bold flex items-center gap-1.5 hover:bg-surface-alt transition-colors touch-target"
          >
            <Heart size={16} className="fill-primary text-primary" />
            {likedRoommates.length}
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block text-center mb-6">
          <h2 className="text-display font-bold text-text-primary tracking-tight mb-2">
            AI Roommate Matcher
          </h2>
          <p className="text-text-secondary text-body max-w-lg mx-auto">Tìm người ở ghép hoàn hảo dựa trên sự tương thích phong cách sống và ngân sách.</p>
        </div>

        {currentIndex >= MOCK_ROOMMATES.length ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-surface rounded-bento border border-border-subtle p-8 max-w-md mx-auto w-full">
            <div className="w-16 h-16 bg-primary-soft rounded-pill flex items-center justify-center mb-4 text-primary">
              <Heart size={32} className="fill-primary" />
            </div>
            <h2 className="text-h2 font-bold text-text-primary mb-2">Xem xong gợi ý!</h2>
            <p className="text-text-secondary text-body max-w-xs mx-auto mb-6">
              Bạn đã chọn thích <span className="font-bold text-primary">{likedRoommates.length}</span> người. Hệ thống đang liên tục quét các thành viên mới.
            </p>
            <Button 
              onClick={() => setCurrentIndex(0)} 
              variant="secondary"
              className="px-6"
            >
              Xem lại từ đầu
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center w-full mx-auto min-h-0">
            <div className="relative h-[60vh] min-h-[400px] max-h-[520px] aspect-[3/4] shrink-0">
              
              {/* Stack Background indicator */}
              {nextProfile && (
                <div className="absolute inset-0 bg-surface border border-border-subtle rounded-bento scale-95 translate-y-4 opacity-50 z-0"></div>
              )}

              {/* Current Card */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={profile.id}
                  className={`absolute inset-0 bg-canvas shadow-xs rounded-bento overflow-hidden flex flex-col z-10 border border-border-subtle transition-all duration-300 ${animating === 'left' ? '-translate-x-full -rotate-12 opacity-0' : animating === 'right' ? 'translate-x-full rotate-12 opacity-0' : 'translate-x-0 rotate-0 opacity-100'}`}
                >
                  {/* Photo Block (Un-darkened, clear photo) */}
                  <div className="h-[50%] bg-surface-alt w-full relative">
                    <img 
                      src={profile.image} 
                      alt={profile.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-canvas/95 border border-border-subtle px-3 py-1.5 rounded-pill text-caption font-bold text-success flex items-center gap-1 shadow-xs">
                      <Sparkles size={14} className="fill-success text-success" /> {profile.matchScore}% Match
                    </div>
                  </div>
                  
                  {/* Content block below photo (Anti-gradient text overlay slop) */}
                  <div className="p-6 flex-1 flex flex-col justify-between bg-canvas">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-h2 font-bold text-text-primary">{profile.name}, {profile.age}</h3>
                        <span className="text-caption text-text-muted font-medium">{profile.major}</span>
                      </div>
                      <p className="text-body text-text-secondary leading-relaxed line-clamp-3 mb-4">{profile.bio}</p>
                    </div>

                    <div className="space-y-4">
                      {/* Budget Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-caption text-text-muted font-bold uppercase tracking-wider">Ngân sách trọ</span>
                        <span className="text-caption font-bold text-primary bg-primary-soft border border-primary-soft px-3 py-1 rounded-pill">{profile.budget}</span>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
                        {profile.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 bg-surface-alt text-caption rounded-pill text-text-secondary font-semibold border border-border-subtle">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Control buttons */}
            <div className="flex justify-center gap-4 mt-6 shrink-0 pb-2">
              <button 
                onClick={() => handleAction('left')}
                disabled={!!animating}
                className="w-14 h-14 rounded-pill bg-error-soft text-error hover:bg-error hover:text-white flex items-center justify-center transition-all border border-error-soft hover:border-error disabled:opacity-50 touch-target shadow-xs"
                title="Bỏ qua"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => handleAction('right')}
                disabled={!!animating}
                className="w-14 h-14 rounded-pill bg-success-soft text-success hover:bg-success hover:text-white flex items-center justify-center transition-all border border-success-soft hover:border-success disabled:opacity-50 touch-target shadow-xs"
                title="Yêu thích"
              >
                <Heart size={24} strokeWidth={2.5} className="fill-current" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liked Modal (Mobile) */}
      {showLikedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/45 p-4 lg:hidden">
          <div className="bg-canvas border border-border-subtle rounded-bento w-full max-w-md h-[80vh] flex flex-col shadow-lg overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-canvas">
              <h3 className="font-bold text-h3 text-text-primary">Đã thích ({likedRoommates.length})</h3>
              <button onClick={() => setShowLikedModal(false)} className="text-text-muted hover:text-text-primary touch-target flex items-center justify-center">
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
