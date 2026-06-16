import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';

export function AdminDashboard() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <GlassCard><h3 className="font-bold text-foreground/60">Người dùng</h3><p className="text-3xl font-bold">1,204</p></GlassCard>
      <GlassCard><h3 className="font-bold text-foreground/60">Phòng chờ duyệt</h3><p className="text-3xl font-bold">15</p></GlassCard>
      <GlassCard><h3 className="font-bold text-foreground/60">Báo cáo</h3><p className="text-3xl font-bold text-red-500">2</p></GlassCard>
    </div>
  );
}

export function AdminRooms() {
  return (
    <GlassCard>
      <h2 className="text-xl font-bold mb-4">Duyệt bài đăng phòng</h2>
      <p className="text-foreground/70">Danh sách các phòng chờ admin kiểm duyệt nội dung.</p>
    </GlassCard>
  );
}

export function AdminUsers() {
  return (
    <GlassCard>
      <h2 className="text-xl font-bold mb-4">Quản lý người dùng</h2>
      <p className="text-foreground/70">Danh sách khách thuê và chủ trọ.</p>
    </GlassCard>
  );
}

export function AdminReports() {
  return (
    <GlassCard>
      <h2 className="text-xl font-bold mb-4">Báo cáo gian lận</h2>
      <p className="text-foreground/70">Các báo cáo từ người dùng về chủ trọ lừa đảo, hoặc tin giả.</p>
    </GlassCard>
  );
}

export function AdminKYC() {
  return (
    <GlassCard>
      <h2 className="text-xl font-bold mb-4">Duyệt KYC (Xác thực)</h2>
      <p className="text-foreground/70">Kiểm tra thông tin giấy tờ tùy thân của chủ trọ.</p>
    </GlassCard>
  );
}
