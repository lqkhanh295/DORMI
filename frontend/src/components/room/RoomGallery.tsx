import { Cuboid, Image } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { GlassCard } from '../ui/GlassCard';

interface RoomGalleryProps {
  id: string | undefined;
  onOpen3D: () => void;
}

const images = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop',
];

export function RoomGallery({ id, onOpen3D }: RoomGalleryProps) {
  return (
    <GlassCard noPadding tone="solid" className="w-full overflow-hidden">
      <div className="grid gap-2 p-2 md:grid-cols-[1.6fr_0.9fr]">
        <button
          type="button"
          className="group relative min-h-[360px] overflow-hidden rounded-xl bg-slate-100 text-left"
          onClick={onOpen3D}
        >
          <img src={images[0]} alt={`Phòng ${id}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="text-white">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/18 px-3 py-1 text-xs font-bold backdrop-blur-md">
                <Cuboid className="w-4 h-4" /> Có trải nghiệm 3D
              </div>
              <h2 className="text-2xl font-extrabold">Xem trước không gian phòng</h2>
              <p className="mt-1 text-sm text-white/78">Chạm để mở trình xem 3D mô phỏng.</p>
            </div>
            <GlassButton className="bg-white text-slate-950 hover:bg-slate-100 border-white" leftIcon={<Cuboid className="w-4 h-4" />}>
              Mở 3D
            </GlassButton>
          </div>
        </button>

        <div className="grid grid-cols-3 gap-2 md:grid-cols-2">
          {images.slice(1).map((image, index) => (
            <button key={image} type="button" className="relative min-h-[116px] overflow-hidden rounded-xl bg-slate-100">
              <img src={image} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" alt={`Ảnh phòng ${index + 2}`} />
            </button>
          ))}
          <button type="button" className="relative min-h-[116px] overflow-hidden rounded-xl bg-slate-950 text-white">
            <img src={images[0]} className="absolute inset-0 h-full w-full object-cover opacity-35" alt="" />
            <span className="relative z-10 flex h-full flex-col items-center justify-center gap-2 text-sm font-bold">
              <Image className="w-5 h-5" /> Xem tất cả ảnh
            </span>
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
