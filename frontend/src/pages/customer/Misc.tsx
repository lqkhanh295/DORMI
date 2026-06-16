import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';

export function Messages() {
  return (
    <GlassCard className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
      <h2 className="text-2xl font-bold mb-2">Tin nhắn</h2>
      <p className="text-foreground/60">Tính năng đang được phát triển...</p>
    </GlassCard>
  );
}

export function SavedRooms() {
  return (
    <GlassCard className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
      <h2 className="text-2xl font-bold mb-2">Phòng đã lưu</h2>
      <p className="text-foreground/60">Danh sách các phòng bạn đã thích sẽ hiển thị ở đây.</p>
    </GlassCard>
  );
}
