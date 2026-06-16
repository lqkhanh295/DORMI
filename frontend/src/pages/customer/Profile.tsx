import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';

export function Profile() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <GlassCard>
        <h2 className="text-xl font-bold mb-6">Thông tin cá nhân</h2>
        <div className="flex gap-8 mb-8">
          <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-white/50">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Customer" alt="avatar" />
          </div>
          <div className="flex flex-col justify-center">
            <GlassButton variant="secondary" size="sm">Đổi ảnh đại diện</GlassButton>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <GlassInput label="Họ và tên" defaultValue="Trần Văn Khách" />
          <GlassInput label="Số điện thoại" defaultValue="0901234567" />
          <GlassInput label="Email" defaultValue="khach@example.com" disabled />
          <GlassInput label="Năm sinh" defaultValue="2002" />
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-bold mb-6">Khảo sát ghép phòng (AI Matcher)</h2>
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Thói quen sinh hoạt</label>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-primary text-white text-sm">Ngủ sớm (Trước 23h)</span>
              <span className="px-3 py-1 rounded-full bg-primary text-white text-sm">Không hút thuốc</span>
              <span className="px-3 py-1 rounded-full bg-white/50 border border-white/40 text-sm cursor-pointer hover:bg-white/70">Thích nấu ăn</span>
              <span className="px-3 py-1 rounded-full bg-white/50 border border-white/40 text-sm cursor-pointer hover:bg-white/70">Nuôi thú cưng</span>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <GlassButton>Lưu thông tin</GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
