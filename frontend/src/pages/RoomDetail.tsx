import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { MapPin, Phone, Wifi, Wind, Coffee, Shield, CheckCircle2, ChevronLeft, Cuboid } from 'lucide-react';

export function RoomDetail() {
  const { id } = useParams();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Nút quay lại */}
      <div>
        <Link to="/search" className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors">
          <ChevronLeft className="w-5 h-5" /> Quay lại danh sách
        </Link>
      </div>

      {/* Media Gallery / 3D Viewer Placeholder */}
      <GlassCard className="!p-2 w-full h-[50vh] flex flex-col md:flex-row gap-2 relative">
        {/* Main 3D / Image area */}
        <div className="flex-1 bg-slate-200 rounded-xl relative overflow-hidden flex items-center justify-center border border-white/40">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50"></div>
          <div className="z-10 flex flex-col items-center text-primary/60">
            <Cuboid className="w-16 h-16 mb-4 animate-pulse" />
            <h3 className="font-bold text-xl text-primary">Trình xem Virtual 3D</h3>
            <p className="text-sm">Click để xoay và khám phá căn phòng</p>
          </div>
        </div>
        {/* Thumbnails */}
        <div className="w-full md:w-48 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[120px] h-[120px] bg-slate-200 rounded-xl border border-white/40 hover:border-primary/50 cursor-pointer transition-colors">
              <img src={`https://picsum.photos/seed/room${id}${i}/200`} className="w-full h-full object-cover rounded-xl" alt="Room thumbnail" />
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Thông tin chính */}
        <div className="flex-1 flex flex-col gap-6">
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
        </div>

        {/* Cột phải: Sticky CTA & Info Chủ trọ */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 sticky top-24">
          <GlassCard className="flex flex-col gap-4">
            <h3 className="font-bold text-lg">Thông tin Chủ trọ</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white/80 overflow-hidden relative">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Landlord" alt="landlord" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h4 className="font-bold flex items-center gap-1">Nguyễn Văn Chủ <CheckCircle2 className="w-4 h-4 text-emerald-500" /></h4>
                <p className="text-sm text-foreground/60">Đã xác minh KYC</p>
              </div>
            </div>

            <div className="w-full h-px bg-white/40 my-1"></div>
            
            <div className="flex gap-2">
              <GlassButton variant="primary" className="flex-1 text-sm"><Phone className="w-4 h-4 mr-2" /> 0901.xxx.xxx</GlassButton>
              <GlassButton variant="secondary" className="flex-1 text-sm">Nhắn tin</GlassButton>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4 bg-primary/5 border-primary/20">
            <h3 className="font-bold text-lg">Hành động</h3>
            <GlassButton variant="primary" size="lg" className="w-full text-lg">Đặt lịch xem phòng</GlassButton>
            <GlassButton variant="secondary" className="w-full">Lưu phòng này</GlassButton>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
