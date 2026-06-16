import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { MapPin, Wifi, Wind, Coffee, Shield } from 'lucide-react';

interface RoomInfoProps {
  id: string | undefined;
}

export function RoomInfo({ id }: RoomInfoProps) {
  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="text-sm text-primary font-medium mb-1 border border-primary/20 bg-primary/10 inline-block px-2 py-0.5 rounded-full">Phòng trọ cao cấp</div>
          <h1 className="text-3xl font-bold text-foreground">Căn hộ Studio đầy đủ nội thất (ID: {id})</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-primary">5.000.000đ</div>
          <div className="text-sm text-foreground/60">/ tháng</div>
        </div>
      </div>

      <div className="flex items-center text-foreground/70 gap-2 font-medium">
        <MapPin className="w-5 h-5 text-rose-500" />
        <span>45 Nguyễn Hữu Cảnh, Quận 1, TP.HCM</span>
      </div>

      <div className="w-full h-px bg-white/40 my-2"></div>

      <div>
        <h3 className="font-bold text-lg mb-2">Tiện ích</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-foreground/80"><Wifi className="w-5 h-5 text-blue-500" /> Free Wifi</div>
          <div className="flex items-center gap-2 text-foreground/80"><Wind className="w-5 h-5 text-cyan-500" /> Điều hòa</div>
          <div className="flex items-center gap-2 text-foreground/80"><Coffee className="w-5 h-5 text-amber-500" /> Nội thất cơ bản</div>
          <div className="flex items-center gap-2 text-foreground/80"><Shield className="w-5 h-5 text-emerald-500" /> An ninh 24/7</div>
        </div>
      </div>

      <div className="w-full h-px bg-white/40 my-2"></div>

      <div>
        <h3 className="font-bold text-lg mb-2">Mô tả chi tiết</h3>
        <p className="text-foreground/80 leading-relaxed text-justify">
          Phòng trọ mới xây, thiết kế theo chuẩn studio hiện đại với tông màu trắng xám sáng sủa. 
          Có cửa sổ lớn đón nắng tự nhiên. Điện nước tính theo giá nhà nước. Rất phù hợp cho sinh viên hoặc người đi làm. 
          Khu vực an ninh, không ngập nước, gần bến xe buýt và các tiện ích công cộng.
        </p>
      </div>
    </GlassCard>
  );
}
