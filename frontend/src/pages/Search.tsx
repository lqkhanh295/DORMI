import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, Bath, BedDouble, Building2, Cuboid, Filter, Heart, Home, MapPin, Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';

const MOCK_ROOMS = [
  {
    id: 1,
    title: 'Studio sáng, full nội thất gần phố đi bộ',
    price: '5.000.000đ',
    location: '45 Nguyễn Hữu Cảnh, Quận 1',
    type: 'Studio',
    has3D: true,
    verified: true,
    area: '28m²',
    beds: '1 giường',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Sleepbox sạch, yên tĩnh gần HUTECH',
    price: '1.800.000đ',
    location: 'D5, Bình Thạnh',
    type: 'Ký túc xá',
    has3D: false,
    verified: true,
    area: '8m²',
    beds: '1 chỗ',
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Phòng ban công thoáng, gần Tôn Đức Thắng',
    price: '2.500.000đ',
    location: 'Nguyễn Thị Thập, Quận 7',
    type: 'Phòng trọ',
    has3D: true,
    verified: false,
    area: '22m²',
    beds: '1 giường',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Căn hộ mini có máy giặt riêng',
    price: '3.200.000đ',
    location: 'Lê Văn Việt, Thủ Đức',
    type: 'Căn hộ mini',
    has3D: true,
    verified: true,
    area: '24m²',
    beds: '1 giường',
    image: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=1000&auto=format&fit=crop',
  },
];

const filters = ['Tất cả', 'Phòng trọ', 'Căn hộ mini', 'Ký túc xá', 'Có 3D', 'Đã KYC'];

export function Search() {
  const location = useLocation();

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
      <div className="flex-1 flex flex-col lg:flex-row">
        <aside className="w-full lg:w-[460px] xl:w-[520px] h-full overflow-y-auto border-r border-line bg-surface/78 backdrop-blur-xl">
          <div className="sticky top-0 z-20 border-b border-line bg-cyan-50/92 backdrop-blur-xl p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow">Khám phá</p>
                <h1 className="text-2xl font-extrabold">Tìm phòng phù hợp</h1>
              </div>
              <GlassButton variant="secondary" className="px-3" aria-label="Bộ lọc">
                <SlidersHorizontal className="w-5 h-5" />
              </GlassButton>
            </div>

            <div className="flex gap-2">
              <GlassInput
                placeholder="Khu vực, trường, tên đường..."
                leftIcon={<SearchIcon className="w-4 h-4" />}
              />
              <GlassButton variant="secondary" className="px-3">
                <Filter className="w-5 h-5" />
              </GlassButton>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter, index) => (
                <button
                  key={filter}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                    index === 0
                      ? 'bg-primary text-white'
                      : 'bg-cyan-100/80 text-muted hover:bg-cyan-200 hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold">{MOCK_ROOMS.length} phòng phù hợp</p>
              <button className="text-sm font-semibold text-primary">Sắp xếp: Phù hợp nhất</button>
            </div>

            <div className="flex flex-col gap-4 pb-8">
              {MOCK_ROOMS.map((room) => (
                <Link
                  to={location.pathname.startsWith('/customer') ? `/customer/room/${room.id}` : `/room/${room.id}`}
                  state={{ from: location.pathname }}
                  key={room.id}
                >
                  <GlassCard noPadding tone="solid" className="group hover:border-primary/30">
                    <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
                      <div className="relative h-56 sm:h-full min-h-[180px] overflow-hidden bg-slate-100">
                        <img src={room.image} alt={room.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        {room.has3D && (
                          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-cyan-50/92 px-2.5 py-1 text-xs font-bold text-primary shadow-sm">
                            <Cuboid className="w-3.5 h-3.5" /> 3D
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-primary">{room.type}</p>
                            <h2 className="mt-1 text-lg font-extrabold leading-snug group-hover:text-primary">{room.title}</h2>
                          </div>
                          <button className="rounded-full p-2 text-muted hover:bg-rose-50 hover:text-rose-500" aria-label="Lưu phòng">
                            <Heart className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="mb-3 flex items-center gap-1.5 text-sm text-muted">
                          <MapPin className="w-4 h-4 text-rose-500" /> {room.location}
                        </p>

                        <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-muted">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-100/70 px-2.5 py-1"><Building2 className="w-3.5 h-3.5" /> {room.area}</span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-100/70 px-2.5 py-1"><BedDouble className="w-3.5 h-3.5" /> {room.beds}</span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-100/70 px-2.5 py-1"><Bath className="w-3.5 h-3.5" /> Khép kín</span>
                          {room.verified && <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700"><BadgeCheck className="w-3.5 h-3.5" /> Đã KYC</span>}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xl font-extrabold text-primary">{room.price}</p>
                            <p className="text-xs text-muted">/ tháng, chưa gồm điện nước</p>
                          </div>
                          <GlassButton size="sm">Xem chi tiết</GlassButton>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <section className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-cyan-100">
          <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/13/6491/3820.png')] bg-cover bg-center opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/20 via-primary/10 to-amber-300/15" />

          <div className="absolute left-6 top-6 z-10 flex items-center gap-3 rounded-2xl bg-surface/92 px-4 py-3 shadow-lg border border-cyan-100">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <div>
              <p className="text-sm font-bold">Bản đồ khu vực</p>
              <p className="text-xs text-muted">4 phòng quanh trung tâm TP.HCM</p>
            </div>
          </div>

          <div className="absolute left-[48%] top-[34%] z-10 rounded-full bg-primary px-3 py-2 text-sm font-extrabold text-white shadow-xl">5.0tr</div>
          <div className="absolute left-[58%] top-[52%] z-10 rounded-full bg-warm px-3 py-2 text-sm font-extrabold text-white shadow-xl">2.5tr</div>
          <div className="absolute left-[38%] top-[58%] z-10 rounded-full bg-cyan-500 px-3 py-2 text-sm font-extrabold text-white shadow-xl">1.8tr</div>

          <div className="z-10 rounded-2xl bg-surface/90 px-5 py-4 text-center shadow-xl border border-cyan-100">
            <Home className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="font-bold">Map mock</p>
            <p className="text-sm text-muted">Sẵn sàng nối API bản đồ thật</p>
          </div>
        </section>
      </div>
    </div>
  );
}
