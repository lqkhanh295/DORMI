import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Heart } from '@phosphor-icons/react';
import { toast } from 'sonner';

export interface RoomItem {
  id: string;
  title: string;
  price: string;
  location: string;
  area: string;
  image: string;
  verified?: boolean;
}

export function RoomCard({ room }: { room: RoomItem }) {
  const [isSaved, setIsSaved] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !isSaved;
    setIsSaved(newState);
    if (newState) {
      toast.success('Đã lưu phòng vào danh sách yêu thích!');
    } else {
      toast('Đã bỏ lưu phòng.');
    }
  };

  // ponytail: RoomCard with independent favorite toggle (no page nav trigger) and clear price hierarchy
  return (
    <Link 
      to={`/room/${room.id}`}
      className="bg-white rounded-[18px] shadow-clay-soft p-3 overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-[2px] hover:shadow-clay-primary group"
    >
      <div className="aspect-[4/3] w-full rounded-[14px] overflow-hidden bg-[#EEF2F6] relative">
        <img 
          src={room.image} 
          alt={room.title} 
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
        
        {/* Verification Signal */}
        {room.verified && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#16803C] border border-[#DCFCE7] text-caption font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <CheckCircle className="w-4 h-4" weight="fill" /> Đã xác minh
          </div>
        )}

        {/* Independent Favorite Button (♡ -> ♥ with 180ms scale pulse, stopPropagation) */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isSaved ? "Bỏ lưu phòng" : "Lưu phòng"}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-180 ${
            isSaved 
              ? 'bg-[#FEF2F2] text-[#C62828] scale-110 shadow-sm' 
              : 'bg-white/90 text-[#64748B] hover:text-[#C62828] hover:bg-white shadow-xs'
          }`}
        >
          <Heart className="w-5 h-5" weight={isSaved ? "fill" : "regular"} />
        </button>
      </div>

      <div className="pt-4 px-2 pb-2 flex flex-col gap-2 flex-1 justify-between">
        <div className="space-y-1.5">
          {/* Price First Hierarchy */}
          <p className="text-h3 font-bold text-[#00153D]">
            {room.price}
          </p>
          <h3 className="text-body font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#00153D] transition-colors leading-snug">
            {room.title}
          </h3>
          <p className="text-caption text-[#64748B] font-medium">
            {room.location} · {room.area}
          </p>
        </div>
      </div>
    </Link>
  );
}
