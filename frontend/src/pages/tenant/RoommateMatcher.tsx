import { useState } from 'react';
import { Card } from '../../components/ui/Card';

const MOCK_ROOMMATES = [
  {
    id: 1,
    name: 'Alex',
    age: 22,
    major: 'Computer Science Major',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    matchScore: 95,
    budget: '3M - 5M VND',
    bio: 'Looking for a chill roommate to share an apartment in D7. I code late at night but use headphones!',
    tags: ['Quiet', 'Non-smoker', 'Tech', 'Night Owl']
  },
  {
    id: 2,
    name: 'Sarah',
    age: 20,
    major: 'Business Administration',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    matchScore: 88,
    budget: '4M - 6M VND',
    bio: 'Extrovert, loves cooking and keeping the common area spotless. Let us be friends!',
    tags: ['Extrovert', 'Clean', 'Cooks', 'Early Bird']
  },
  {
    id: 3,
    name: 'Minh',
    age: 24,
    major: 'Graphic Design',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    matchScore: 82,
    budget: '2M - 4M VND',
    bio: 'Very easy going. I spend most of my time at the studio or out drinking coffee.',
    tags: ['Artistic', 'Cat Lover', 'Coffee']
  }
];

export default function RoommateMatcher() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState<false | 'left' | 'right'>(false);

  const handleAction = (type: 'left' | 'right') => {
    if (animating || currentIndex >= MOCK_ROOMMATES.length) return;
    setAnimating(type);
    
    // Đợi hiệu ứng bay ra hoàn tất rồi chuyển người mới
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimating(false);
    }, 300);
  };

  if (currentIndex >= MOCK_ROOMMATES.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] max-w-md mx-auto text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
        <p className="text-gray-500">We will notify you when new potential roommates join DORMI.</p>
        <button 
          onClick={() => setCurrentIndex(0)} 
          className="mt-8 px-6 py-2 bg-blue-50 text-blue-600 rounded-full font-medium hover:bg-blue-100 transition-micro"
        >
          Review profiles again
        </button>
      </div>
    );
  }

  const profile = MOCK_ROOMMATES[currentIndex];
  const nextProfile = MOCK_ROOMMATES[currentIndex + 1];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-md mx-auto relative justify-center">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">AI Roommate Matcher</h2>
        <p className="text-gray-500">Find someone with the same lifestyle as you</p>
      </div>
      
      <div className="relative w-full aspect-[3/4]">
        {/* Next Card Background */}
        {nextProfile && (
          <Card className="absolute inset-0 bg-white shadow-card rounded-2xl scale-95 translate-y-4 opacity-70 z-0">
            <div className="w-full h-full bg-gray-100 rounded-2xl" />
          </Card>
        )}

        {/* Current Active Card */}
        <Card 
          className={`absolute inset-0 bg-white shadow-float rounded-2xl overflow-hidden flex flex-col z-10 transition-all duration-300 ${animating === 'left' ? '-translate-x-full -rotate-12 opacity-0' : animating === 'right' ? 'translate-x-full rotate-12 opacity-0' : 'translate-x-0 rotate-0 opacity-100'}`}
        >
          <div className="h-3/5 bg-gray-200 w-full relative">
            <img 
              src={profile.image} 
              alt={profile.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-green-600 flex items-center gap-1 shadow-sm">
              ✨ {profile.matchScore}% Match
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
              <h3 className="text-2xl font-bold">{profile.name}, {profile.age}</h3>
              <p className="text-sm opacity-90">{profile.major}</p>
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col overflow-y-auto">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About me</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Budget</h4>
              <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-md">{profile.budget}</p>
            </div>

            <div className="mt-auto">
              <div className="flex flex-wrap gap-2">
                {profile.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-600 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="flex justify-center gap-6 mt-8">
        <button 
          onClick={() => handleAction('left')}
          disabled={!!animating}
          className="w-16 h-16 rounded-full bg-white shadow-card flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-micro text-2xl font-bold border border-gray-100 disabled:opacity-50"
        >
          ✕
        </button>
        <button 
          onClick={() => handleAction('right')}
          disabled={!!animating}
          className="w-16 h-16 rounded-full bg-white shadow-card flex items-center justify-center text-green-500 hover:bg-green-50 hover:text-green-600 transition-micro text-3xl border border-gray-100 disabled:opacity-50"
        >
          ♥
        </button>
      </div>
    </div>
  );
}
