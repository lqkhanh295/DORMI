import { GlobalNav } from '../components/ui/GlobalNav';
import { LocalNav } from '../components/ui/LocalNav';
import { BentoCard } from '../components/ui/BentoCard';
import { AppleButton } from '../components/ui/AppleButton';
import { Heart, Clock, ChatText, ShieldCheck } from '@phosphor-icons/react';

export function UnifiedDashboard() {
  const localNavItems = [
    { label: 'Tổng quan', path: '/dashboard' },
    { label: 'Phòng đã lưu', path: '/dashboard/saved' },
    { label: 'Lịch hẹn', path: '/dashboard/appointments' },
    { label: 'Tin nhắn', path: '/dashboard/messages' },
  ];

  return (
    <div className="bg-[#f5f5f7] min-h-screen pb-24">
      <GlobalNav />
      <LocalNav 
        title="Bảng điều khiển" 
        items={localNavItems} 
        actionLabel="Đăng phòng mới" 
        onAction={() => alert('Đăng phòng mới')} 
      />
      
      <main className="apple-container pt-12">
        <div className="mb-12">
          <h1 className="typography-headline text-[#1d1d1f] mb-4">Xin chào, Nguyễn Văn A.</h1>
          <p className="typography-subhead text-[#6e6e73]">Đây là những gì đang diễn ra với phòng của bạn.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <BentoCard className="bg-white flex flex-col justify-between h-[200px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#d2d2d7]/50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff3b30]/10 text-[#ff3b30]">
                <Heart className="w-6 h-6" weight="fill" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Phòng đã lưu</h3>
            </div>
            <div>
              <p className="text-[48px] font-bold text-[#1d1d1f] tracking-tight">12</p>
            </div>
          </BentoCard>

          <BentoCard className="bg-white flex flex-col justify-between h-[200px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#d2d2d7]/50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                <Clock className="w-6 h-6" weight="fill" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Lịch hẹn tới</h3>
            </div>
            <div>
              <p className="text-[48px] font-bold text-[#1d1d1f] tracking-tight">2</p>
            </div>
          </BentoCard>

          <BentoCard className="bg-white flex flex-col justify-between h-[200px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#d2d2d7]/50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34c759]/10 text-[#34c759]">
                <ChatText className="w-6 h-6" weight="fill" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Tin nhắn mới</h3>
            </div>
            <div>
              <p className="text-[48px] font-bold text-[#1d1d1f] tracking-tight">5</p>
            </div>
          </BentoCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BentoCard className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#d2d2d7]/50 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[21px] font-semibold text-[#1d1d1f]">Lịch xem phòng</h3>
              <AppleButton variant="ghost" size="sm">Xem tất cả</AppleButton>
            </div>

            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center pb-4 border-b border-[#d2d2d7] last:border-0 last:pb-0">
                  <div>
                    <p className="text-[17px] font-semibold text-[#1d1d1f]">Studio Quận 1</p>
                    <p className="text-[14px] text-[#6e6e73] mt-1">Hôm nay, 14:00 - Cùng với Trần B</p>
                  </div>
                  <AppleButton variant="secondary" size="sm">Quản lý</AppleButton>
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-[#d2d2d7]/50 flex flex-col gap-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                <ShieldCheck className="w-6 h-6" weight="fill" />
              </div>
              <div>
                <h3 className="text-[21px] font-semibold text-[#1d1d1f]">Xác thực tài khoản</h3>
                <p className="text-[14px] text-[#6e6e73]">Bảo vệ cộng đồng Dormi</p>
              </div>
            </div>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed">
              Bạn chưa xác minh danh tính. Xác minh CMND/CCCD để mở khóa tính năng đăng bài và tăng độ uy tín với cộng đồng.
            </p>
            <AppleButton className="w-fit">Bắt đầu xác thực</AppleButton>
          </BentoCard>
        </div>
      </main>
    </div>
  );
}
