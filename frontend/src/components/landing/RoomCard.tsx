import { Link } from 'react-router-dom';

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
  return (
    <Link 
      to={`/room/${room.id}`}
      className="bg-white rounded-[18px] shadow-clay-soft p-3 overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-[2px] group"
    >
      <div className="aspect-[4/3] w-full rounded-[14px] overflow-hidden bg-[#EEF2F6]">
        <img 
          src={room.image} 
          alt={room.title} 
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>

      <div className="pt-4 px-2 pb-2 flex flex-col gap-2 flex-1 justify-between">
        <div className="space-y-1">
          <h3 className="text-body font-semibold text-[#0F172A] line-clamp-1 group-hover:text-[#00153D] transition-colors">
            {room.title}
          </h3>
          <p className="text-body font-bold text-[#00153D]">
            {room.price}
          </p>
          <p className="text-caption text-[#64748B]">
            {room.location} · {room.area}
          </p>
        </div>

        {room.verified && (
          <div className="pt-2 flex items-center gap-1.5 text-caption font-semibold text-[#16803C]">
            <span className="w-2 h-2 rounded-full bg-[#16803C]"></span> Đã xác minh
          </div>
        )}
      </div>
    </Link>
  );
}
