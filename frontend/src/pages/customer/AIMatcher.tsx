import { useState } from 'react';
import { Heart, Sparkle as Sparkles, X } from '@phosphor-icons/react';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassCard } from '../../components/ui/GlassCard';

const MOCK_PROFILES = [
  {
    id: 1,
    name: 'Minh Tuấn',
    match: 98,
    age: 21,
    traits: ['Ngủ sớm', 'Gọn gàng', 'Thích nấu ăn'],
    bio: 'Mình học Bách Khoa, đang tìm một bạn nam ở ghép khu Quận 10. Mình khá yên tĩnh và tôn trọng không gian riêng.',
  },
  {
    id: 2,
    name: 'Hoàng Anh',
    match: 85,
    age: 20,
    traits: ['Sinh viên', 'Không hút thuốc', 'Yêu động vật'],
    bio: 'Tìm người ở ghép sạch sẽ, dễ trao đổi lịch sinh hoạt. Phòng đã có sẵn tủ lạnh và máy giặt.',
  },
];

export function AIMatcher() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const profile = currentIndex >= 0 ? MOCK_PROFILES[currentIndex] : null;

  const handleSwipe = () => {
    setCurrentIndex((value) => (value < MOCK_PROFILES.length - 1 ? value + 1 : -1));
  };

  return (
    <div className="flex min-h-[calc(100vh-180px)] flex-col items-center justify-center">
      <div className="mb-6 max-w-xl text-center">
        <p className="eyebrow mb-2">AI Matcher</p>
        <h1 className="flex items-center justify-center gap-2 text-3xl font-extrabold">
          <Sparkles className="w-7 h-7 text-primary" />
          Tìm bạn cùng phòng hợp gu
        </h1>
        <p className="mt-2 text-muted">Dựa trên thói quen sinh hoạt, ngân sách, khu vực và mức độ riêng tư bạn mong muốn.</p>
      </div>

      {profile ? (
        <GlassCard noPadding tone="solid" className="w-full max-w-sm overflow-hidden">
          <div className="relative h-72 bg-slate-100">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt={profile.name} className="h-full w-full object-cover" />
            <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-primary shadow-sm">
              {profile.match}% Match
            </div>
          </div>

          <div className="p-6">
            <h2 className="mb-1 text-2xl font-extrabold">{profile.name}, {profile.age}</h2>
            <div className="my-4 flex flex-wrap gap-2">
              {profile.traits.map((trait) => (
                <span key={trait} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {trait}
                </span>
              ))}
            </div>
            <p className="mb-6 text-sm leading-7 text-muted">{profile.bio}</p>

            <div className="flex justify-center gap-4">
              <button onClick={handleSwipe} className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white text-rose-500 shadow-sm transition hover:bg-rose-50" aria-label="Bỏ qua">
                <X className="w-6 h-6" />
              </button>
              <button onClick={handleSwipe} className="flex h-14 w-14 items-center justify-center rounded-full border border-primary bg-primary text-white shadow-sm transition hover:bg-primary-hover" aria-label="Thích">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard tone="solid" className="max-w-md text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h2 className="mb-2 text-xl font-extrabold">Đã xem hết gợi ý</h2>
          <p className="mb-6 text-muted">Quay lại sau để xem thêm những hồ sơ mới phù hợp với bạn.</p>
          <GlassButton onClick={() => setCurrentIndex(0)}>Xem lại từ đầu</GlassButton>
        </GlassCard>
      )}
    </div>
  );
}
