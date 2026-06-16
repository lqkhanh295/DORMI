import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Cuboid } from 'lucide-react';

interface RoomGalleryProps {
  id: string | undefined;
  onOpen3D: () => void;
}

export function RoomGallery({ id, onOpen3D }: RoomGalleryProps) {
  return (
    <GlassCard className="!p-2 w-full h-[50vh] flex flex-col md:flex-row gap-2 relative">
      <div 
        className="flex-1 bg-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center border border-white/40 cursor-pointer group"
        onClick={onOpen3D}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50 group-hover:opacity-70 transition-opacity"></div>
        <div className="z-10 flex flex-col items-center text-primary/60 group-hover:scale-110 transition-transform">
          <Cuboid className="w-16 h-16 mb-4 animate-pulse" />
          <h3 className="font-bold text-xl text-primary">Khởi chạy Trình xem 3D</h3>
          <p className="text-sm">Click để trải nghiệm</p>
        </div>
      </div>
      <div className="w-full md:w-48 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-[120px] h-[120px] bg-slate-200 rounded-xl border border-white/40 hover:border-primary/50 cursor-pointer transition-colors">
            <img src={`https://picsum.photos/seed/room${id}${i}/200`} className="w-full h-full object-cover rounded-xl" alt="Room thumbnail" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
