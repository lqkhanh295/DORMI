import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { favoritesApi } from '../../services/api';
import { useStore } from '../../store/useStore';

export interface RoomItem {
  id: string;
  title: string;
  price: string;
  location: string;
  area: string;
  image: string;
  verified?: boolean;
  isBoosted?: boolean;
  boostType?: string;
}

export function RoomCard({ 
  room, 
  initialSaved = false, 
  onToggleSaved 
}: { 
  room: RoomItem; 
  initialSaved?: boolean; 
  onToggleSaved?: (isSaved: boolean) => void;
}) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPulsing, setIsPulsing] = useState(false);
  const { currentUser } = useStore();

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để lưu phòng vào danh sách yêu thích!');
      return;
    }

    const nextState = !isSaved;
    setIsSaved(nextState);
    if (nextState) {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 240);
    }
    if (onToggleSaved) onToggleSaved(nextState);

    try {
      if (nextState) {
        await favoritesApi.addFavorite(room.id);
        toast.success('Đã lưu phòng vào danh sách yêu thích!');
      } else {
        await favoritesApi.removeFavorite(room.id);
        toast('Đã bỏ lưu phòng.');
      }
    } catch (err: any) {
      setIsSaved(!nextState);
      if (onToggleSaved) onToggleSaved(!nextState);
      toast.error(err?.message || 'Không thể cập nhật danh sách yêu thích.');
    }
  };

  const [imgSrc, setImgSrc] = useState(room.image);
  const fallbackImage = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';

  useEffect(() => {
    setImgSrc(room.image || fallbackImage);
  }, [room.image]);

  // ponytail: Apple-grade tactile room card with fallback image handling
  return (
    <Link 
      to={`/room/${room.id}`}
      className="bg-white rounded-[18px] border border-slate-200/90 shadow-xs hover:shadow-md p-3 overflow-hidden flex flex-col transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] active:scale-[0.99] group motion-gpu"
    >
      <div className="aspect-[4/3] w-full rounded-[14px] overflow-hidden bg-slate-100 relative">
        <img 
          src={imgSrc} 
          alt={room.title} 
          loading="lazy"
          onError={() => setImgSrc(fallbackImage)}
          className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
        
        {/* Verification Signal */}
        {room.verified && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-emerald-800 border border-emerald-200/90 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs select-none">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã xác minh</span>
          </div>
        )}

        {/* Tactile Favorite Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isSaved ? "Bỏ lưu phòng" : "Lưu phòng"}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 ${
            isPulsing ? 'favorite-heart-pulse' : ''
          } ${
            isSaved 
              ? 'bg-rose-50 text-rose-600 shadow-xs' 
              : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white shadow-xs'
          }`}
        >
          <Heart className={`w-4 h-4 transition-colors duration-150 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="pt-3.5 px-1.5 pb-1 flex flex-col gap-1.5 flex-1 justify-between">
        <div className="space-y-1">
          {/* Price First Hierarchy */}
          <p className="text-h3 font-bold text-[#00153D]">
            {room.price}
          </p>
          <h3 className="text-body font-semibold text-slate-800 line-clamp-1 group-hover:text-[#00153D] transition-colors duration-150 leading-snug">
            {room.title}
          </h3>
          <p className="text-caption text-slate-500 font-medium">
            {room.location} · {room.area}
          </p>
        </div>
      </div>
    </Link>
  );
}
