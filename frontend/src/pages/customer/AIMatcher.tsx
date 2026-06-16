import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { Heart, X, Sparkles } from 'lucide-react';

const MOCK_PROFILES = [
  { id: 1, name: 'Minh Tuấn', match: 98, age: 21, traits: ['Ngủ sớm', 'Gọn gàng', 'Thích nấu ăn'], bio: 'Mình học Bách Khoa, đang tìm 1 bạn nam ở ghép khu vực Quận 10. Mình khá im lặng và thường học bài muộn.' },
  { id: 2, name: 'Hoàng Anh', match: 85, age: 20, traits: ['Sinh viên', 'Không hút thuốc', 'Nuôi mèo'], bio: 'Tìm người ở ghép yêu động vật. Phòng mình đã có sẵn tủ lạnh và máy giặt.' },
];

export function AIMatcher() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = () => {
    if (currentIndex < MOCK_PROFILES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(-1); // Hết dữ liệu
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-120px)]">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Roommate Matcher
        </h1>
        <p className="text-foreground/70">Tìm người bạn cùng phòng lý tưởng dựa trên thuật toán AI</p>
      </div>

      {currentIndex >= 0 ? (
        <div className="w-full max-w-sm relative">
          <GlassCard className="!p-0 overflow-hidden flex flex-col shadow-lg border border-white/60">
            <div className="h-64 bg-slate-200 relative">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${MOCK_PROFILES[currentIndex].name}`} alt="avatar" className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-primary font-bold shadow-sm">
                {MOCK_PROFILES[currentIndex].match}% Match
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-1">{MOCK_PROFILES[currentIndex].name}, {MOCK_PROFILES[currentIndex].age}</h2>
              
              <div className="flex flex-wrap gap-2 mb-4 mt-3">
                {MOCK_PROFILES[currentIndex].traits.map((trait, i) => (
                  <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                    {trait}
                  </span>
                ))}
              </div>
              
              <p className="text-foreground/80 text-sm mb-6">
                "{MOCK_PROFILES[currentIndex].bio}"
              </p>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={handleSwipe}
                  className="w-14 h-14 rounded-full bg-white/80 shadow-md border border-white flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:scale-105 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <button 
                  onClick={handleSwipe}
                  className="w-14 h-14 rounded-full bg-primary shadow-md border border-primary-hover flex items-center justify-center text-white hover:bg-primary-hover hover:scale-105 transition-all"
                >
                  <Heart className="w-6 h-6" />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : (
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-primary/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">Đã xem hết gợi ý</h2>
          <p className="text-foreground/70 mb-6">Hãy quay lại sau để xem thêm những người bạn mới nhé.</p>
          <GlassButton onClick={() => setCurrentIndex(0)}>Xem lại từ đầu</GlassButton>
        </div>
      )}
    </div>
  );
}
