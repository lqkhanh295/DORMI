import { Coffee, DoorOpen, MapPin, SealCheck, ShieldCheck, Sparkle, WifiHigh, Wind } from '@phosphor-icons/react';
import { GlassCard } from '../ui/GlassCard';

interface RoomInfoProps {
  id: string | undefined;
}

const amenities = [
  { icon: <WifiHigh className="h-5 w-5 text-blue-500" />, label: 'Wifi riêng' },
  { icon: <Wind className="h-5 w-5 text-cyan-500" />, label: 'Điều hòa' },
  { icon: <Coffee className="h-5 w-5 text-amber-500" />, label: 'Nội thất cơ bản' },
  { icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, label: 'An ninh 24/7' },
  { icon: <DoorOpen className="h-5 w-5 text-violet-500" />, label: 'Giờ giấc tự do' },
  { icon: <Sparkle className="h-5 w-5 text-primary" />, label: 'Có xem 3D' },
];

export function RoomInfo({ id }: RoomInfoProps) {
  return (
    <GlassCard tone="solid" className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
            <SealCheck className="h-4 w-4" /> Phòng đã xác minh
          </div>
          <h1 className="text-3xl font-extrabold tracking-normal text-foreground">
            Căn hộ Studio đầy đủ nội thất (ID: {id})
          </h1>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <MapPin className="h-5 w-5 text-rose-500" />
            45 Nguyễn Hữu Cảnh, Quận 1, TP.HCM
          </p>
        </div>

        <div className="rounded-lg bg-[#f7f8f3] px-5 py-4 text-left md:text-right">
          <div className="text-3xl font-extrabold text-primary">5.000.000đ</div>
          <div className="text-sm text-muted">/ tháng, chưa gồm điện nước</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-y border-line py-5 sm:grid-cols-4">
        <div>
          <p className="text-sm text-muted">Diện tích</p>
          <p className="font-bold">28m²</p>
        </div>
        <div>
          <p className="text-sm text-muted">Đặt cọc</p>
          <p className="font-bold">1 tháng</p>
        </div>
        <div>
          <p className="text-sm text-muted">Sức chứa</p>
          <p className="font-bold">1-2 người</p>
        </div>
        <div>
          <p className="text-sm text-muted">Trạng thái</p>
          <p className="font-bold text-emerald-600">Còn phòng</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-bold">Tiện ích</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {amenities.map((amenity) => (
            <div key={amenity.label} className="flex items-center gap-2 rounded-lg bg-[#f7f8f3] px-3 py-3 text-sm font-semibold text-foreground">
              {amenity.icon}
              {amenity.label}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-bold">Mô tả chi tiết</h3>
        <p className="leading-8 text-muted">
          Phòng mới xây, thiết kế theo chuẩn studio hiện đại với tông màu sáng, cửa sổ lớn và khu bếp gọn. Khu vực an ninh,
          không ngập nước, gần tuyến xe buýt và các tiện ích hằng ngày. Phù hợp cho sinh viên hoặc người đi làm muốn một
          không gian riêng tư, sạch và dễ di chuyển.
        </p>
      </div>
    </GlassCard>
  );
}
