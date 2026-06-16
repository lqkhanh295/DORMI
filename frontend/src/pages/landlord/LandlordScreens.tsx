import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassInput } from '../../components/ui/GlassInput';

export function LandlordDashboard() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <GlassCard><h3 className="font-bold text-foreground/60">Tổng số phòng</h3><p className="text-3xl font-bold">5</p></GlassCard>
      <GlassCard><h3 className="font-bold text-foreground/60">Lượt xem</h3><p className="text-3xl font-bold">128</p></GlassCard>
      <GlassCard><h3 className="font-bold text-foreground/60">Lịch hẹn</h3><p className="text-3xl font-bold">3</p></GlassCard>
    </div>
  );
}

export function KYC() {
  return (
    <GlassCard className="max-w-2xl mx-auto flex flex-col gap-4">
      <h2 className="text-xl font-bold">Xác thực danh tính (KYC)</h2>
      <p className="text-sm text-foreground/70">Vui lòng tải lên CMND/CCCD để xác minh quyền đăng phòng.</p>
      <div className="h-40 border-2 border-dashed border-primary/50 rounded-xl flex items-center justify-center bg-white/30 text-foreground/50">
        Kéo thả file vào đây
      </div>
      <GlassButton className="self-end mt-4">Gửi xác thực</GlassButton>
    </GlassCard>
  );
}

export function CreateRoom() {
  return (
    <GlassCard className="max-w-3xl mx-auto flex flex-col gap-4">
      <h2 className="text-xl font-bold">Tạo phòng mới (Wizard)</h2>
      <GlassInput label="Tiêu đề bài đăng" placeholder="VD: Phòng trọ ban công..." />
      <GlassInput label="Giá tiền (VNĐ)" type="number" placeholder="3000000" />
      <GlassInput label="Địa chỉ" placeholder="Số nhà, tên đường..." />
      <div className="flex justify-between mt-6">
        <GlassButton variant="secondary">Hủy</GlassButton>
        <GlassButton>Tiếp tục (1/3)</GlassButton>
      </div>
    </GlassCard>
  );
}

export function MyRooms() {
  return (
    <GlassCard>
      <h2 className="text-xl font-bold mb-4">Phòng của tôi</h2>
      <p className="text-foreground/70">Danh sách các phòng đang cho thuê sẽ hiển thị ở đây.</p>
    </GlassCard>
  );
}

export function LandlordAppointments() {
  return (
    <GlassCard>
      <h2 className="text-xl font-bold mb-4">Quản lý lịch hẹn</h2>
      <p className="text-foreground/70">Lịch xem phòng của khách hàng.</p>
    </GlassCard>
  );
}

export function LandlordMessages() {
  return (
    <GlassCard>
      <h2 className="text-xl font-bold mb-4">Tin nhắn</h2>
      <p className="text-foreground/70">Tính năng đang được phát triển.</p>
    </GlassCard>
  );
}
