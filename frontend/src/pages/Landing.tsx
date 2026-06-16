import { ArrowRight, BadgeCheck, BedDouble, Building2, Cuboid, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';

const rentalRooms = [
  {
    id: 1,
    title: 'Studio sáng, full nội thất gần phố đi bộ',
    location: 'Quận 1, TP.HCM',
    price: '5.000.000đ',
    area: '28m²',
    type: 'Studio',
    badge: 'Có 3D',
    verified: true,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Sleepbox sạch, yên tĩnh gần HUTECH',
    location: 'Bình Thạnh, TP.HCM',
    price: '1.800.000đ',
    area: '8m²',
    type: 'Ký túc xá',
    badge: 'Đã KYC',
    verified: true,
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Phòng ban công thoáng gần Tôn Đức Thắng',
    location: 'Quận 7, TP.HCM',
    price: '2.500.000đ',
    area: '22m²',
    type: 'Phòng trọ',
    badge: 'Gần trường',
    verified: false,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Căn hộ mini có máy giặt riêng',
    location: 'Thủ Đức, TP.HCM',
    price: '3.200.000đ',
    area: '24m²',
    type: 'Căn hộ mini',
    badge: 'Còn phòng',
    verified: true,
    image: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 5,
    title: 'Phòng mới xây, cửa sổ lớn',
    location: 'Gò Vấp, TP.HCM',
    price: '2.200.000đ',
    area: '18m²',
    type: 'Phòng trọ',
    badge: 'Mới đăng',
    verified: true,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 6,
    title: 'Studio yên tĩnh gần tuyến xe buýt',
    location: 'Quận 10, TP.HCM',
    price: '4.100.000đ',
    area: '26m²',
    type: 'Studio',
    badge: 'Có lịch xem',
    verified: false,
    image: 'https://images.unsplash.com/photo-1560448075-bb485b067938?q=80&w=1000&auto=format&fit=crop',
  },
];

const filters = ['Tất cả', 'Phòng trọ', 'Studio', 'Căn hộ mini', 'Ký túc xá', 'Có 3D', 'Đã KYC'];

export function Landing() {
  return (
    <div className="flex-1 bg-background">
      <section className="section-shell py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow">Phòng đang cho thuê</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-normal text-foreground md:text-7xl">
              Tìm phòng trọ phù hợp gần khu vực của bạn
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Người chưa đăng nhập chỉ xem được thông tin phòng đang cho thuê: hình ảnh, giá, vị trí, diện tích và trạng thái xác minh.
            </p>
          </div>

          <GlassCard tone="solid" className="bg-surface">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted">Tìm nhanh</p>
                <h2 className="text-2xl font-extrabold">Lọc phòng đang mở</h2>
              </div>
              <div className="rounded-lg border border-line p-2 text-muted">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <GlassInput placeholder="Nhập quận, trường đại học, tên đường..." leftIcon={<Search className="h-5 w-5" />} />
              <Link to="/search">
                <GlassButton size="lg" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Tìm phòng
                </GlassButton>
              </Link>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter, index) => (
                <button
                  key={filter}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    index === 0
                      ? 'bg-primary text-white'
                      : 'border border-line bg-[#f7f8f3] text-muted hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="section-shell grid gap-4 py-6 text-sm text-muted md:grid-cols-3">
          <div><strong className="text-foreground">1.200+</strong> phòng đang cho thuê</div>
          <div><strong className="text-foreground">86%</strong> bài đăng có chủ nhà xác minh</div>
          <div><strong className="text-foreground">120+</strong> phòng có xem trước 3D</div>
        </div>
      </section>

      <section className="section-shell py-12">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Danh sách phòng</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-normal md:text-4xl">Các phòng đang còn trống</h2>
          </div>
          <Link to="/search" className="inline-flex items-center gap-2 font-bold text-foreground">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rentalRooms.map((room) => (
            <Link to={`/room/${room.id}`} state={{ from: '/' }} key={room.id}>
              <GlassCard noPadding tone="solid" className="group h-full">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#eef0e8]">
                  <img src={room.image} alt={room.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-extrabold text-foreground shadow-sm">
                    {room.badge}
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{room.type}</p>
                      <h3 className="mt-1 text-lg font-extrabold leading-snug text-foreground group-hover:text-accent">{room.title}</h3>
                    </div>
                    {room.verified && (
                      <span className="rounded-lg bg-[#eef1e7] p-2 text-accent" aria-label="Đã xác minh">
                        <BadgeCheck className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <p className="mb-4 flex items-center gap-2 text-sm text-muted">
                    <MapPin className="h-4 w-4" />
                    {room.location}
                  </p>

                  <div className="mb-5 flex flex-wrap gap-2 text-xs font-semibold text-muted">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#f3f4ee] px-2.5 py-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {room.area}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#f3f4ee] px-2.5 py-1.5">
                      <BedDouble className="h-3.5 w-3.5" />
                      Khép kín
                    </span>
                    {room.badge === 'Có 3D' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#f3f4ee] px-2.5 py-1.5">
                        <Cuboid className="h-3.5 w-3.5" />
                        Xem 3D
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                    <div>
                      <p className="text-xl font-extrabold text-foreground">{room.price}</p>
                      <p className="text-xs text-muted">/ tháng</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
                      Chi tiết <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
