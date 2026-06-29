import { GlobalNav } from '../components/ui/GlobalNav';
import { LocalNav } from '../components/ui/LocalNav';
import { BentoCard } from '../components/ui/BentoCard';
import { AppleButton } from '../components/ui/AppleButton';
import { Heart, Clock, ChatText, ShieldCheck, Sparkle, MapPin, Star, CaretRight } from '@phosphor-icons/react';
import { Toaster, toast } from 'sonner';
import { Link } from 'react-router-dom';

export function UnifiedDashboard() {
  const localNavItems = [
    { label: 'Tổng quan', path: '/dashboard' },
    { label: 'Phòng đã lưu', path: '/dashboard/saved' },
    { label: 'Lịch hẹn', path: '/dashboard/appointments' },
    { label: 'Tin nhắn', path: '/dashboard/messages' },
  ];

  return (
    <div className="bg-background min-h-screen pb-24">
      <GlobalNav />
      <LocalNav 
        title="Bảng điều khiển" 
        items={localNavItems} 
        actionLabel="Đăng phòng mới" 
        onAction={() => toast.success('Đăng phòng mới thành công! Chuyển hướng...')} 
      />
      <Toaster position="top-center" richColors />
      
      <main className="apple-container pt-12">
        <div className="mb-12 animate-fade-in-up">
          <h1 className="typography-headline text-foreground mb-4">Xin chào, Nguyễn Văn A.</h1>
          <p className="typography-subhead text-neutral-500">Đây là những gì đang diễn ra với phòng của bạn.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6 animate-fade-in-up delay-100">
          <Link to="/dashboard/saved" className="block focus:outline-none focus:ring-4 focus:ring-primary/20 rounded-[24px]">
            <BentoCard className="bg-white flex flex-col justify-between h-[200px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-neutral-200 hoverEffect">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff3b30]/10 text-[#ff3b30]">
                  <Heart className="w-6 h-6" weight="fill" />
                </div>
                <h3 className="text-[17px] font-semibold text-foreground">Phòng đã lưu</h3>
              </div>
              <div>
                <p className="text-[48px] font-bold text-foreground tracking-tight">12</p>
              </div>
            </BentoCard>
          </Link>

          <Link to="/dashboard/appointments" className="block focus:outline-none focus:ring-4 focus:ring-primary/20 rounded-[24px]">
            <BentoCard className="bg-white flex flex-col justify-between h-[200px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-neutral-200 hoverEffect">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="w-6 h-6" weight="fill" />
                </div>
                <h3 className="text-[17px] font-semibold text-foreground">Lịch hẹn tới</h3>
              </div>
              <div>
                <p className="text-[48px] font-bold text-foreground tracking-tight">2</p>
              </div>
            </BentoCard>
          </Link>

          <Link to="/dashboard/messages" className="block focus:outline-none focus:ring-4 focus:ring-primary/20 rounded-[24px]">
            <BentoCard className="bg-white flex flex-col justify-between h-[200px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-neutral-200 hoverEffect">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34c759]/10 text-[#34c759]">
                  <ChatText className="w-6 h-6" weight="fill" />
                </div>
                <h3 className="text-[17px] font-semibold text-foreground">Tin nhắn mới</h3>
              </div>
              <div>
                <p className="text-[48px] font-bold text-foreground tracking-tight">5</p>
              </div>
            </BentoCard>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-12 animate-fade-in-up delay-200">
          <BentoCard className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-neutral-200 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[21px] font-semibold text-foreground">Lịch xem phòng</h3>
              <AppleButton variant="ghost" size="sm">Xem tất cả</AppleButton>
            </div>

            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center pb-4 border-b border-neutral-200 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[17px] font-semibold text-foreground">Studio Quận 1</p>
                    <p className="text-[14px] text-neutral-500 mt-1">Hôm nay, 14:00 - Cùng với Trần B</p>
                  </div>
                  <AppleButton variant="secondary" size="sm">Quản lý</AppleButton>
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-neutral-200 flex flex-col gap-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="w-6 h-6" weight="fill" />
              </div>
              <div>
                <h3 className="text-[21px] font-semibold text-foreground">Xác thực tài khoản</h3>
                <p className="text-[14px] text-neutral-500">Bảo vệ cộng đồng Dormi</p>
              </div>
            </div>
            <p className="text-[17px] text-foreground leading-relaxed">
              Bạn chưa xác minh danh tính. Xác minh CMND/CCCD để mở khóa tính năng đăng bài và tăng độ uy tín với cộng đồng.
            </p>
            <AppleButton className="w-fit">Bắt đầu xác thực</AppleButton>
          </BentoCard>
        </div>

        {/* Section Gợi ý phòng trọ */}
        <div className="animate-fade-in-up delay-300">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-[21px] font-semibold text-foreground flex items-center gap-2">
                <Sparkle weight="fill" className="text-yellow-500" /> Gợi ý dành riêng cho bạn
              </h2>
              <p className="text-sm text-neutral-500 mt-1">Dựa trên khu vực và ngân sách bạn quan tâm</p>
            </div>
            <AppleButton variant="ghost" size="sm">Xem thêm <CaretRight className="w-4 h-4 inline-block ml-1" /></AppleButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Link to={`/room/${i}`} key={i} className="group block focus:outline-none focus:ring-4 focus:ring-primary/20 rounded-2xl">
                <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-[4/3] bg-neutral-200 relative overflow-hidden">
                    <img 
                      src={
                        i === 1 ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80" : 
                        i === 2 ? "https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=600&q=80" :
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"
                      } 
                      alt="Room" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-neutral-900 shadow-sm">
                      Quận {i === 1 ? '3' : i === 2 ? '1' : 'Bình Thạnh'}
                    </div>
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors shadow-sm">
                      <Heart className="w-4 h-4" weight="bold" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-foreground text-[15px] truncate pr-2">
                        {i === 1 ? 'Studio Cao Cấp Đầy Đủ Tiện Nghi' : i === 2 ? 'Căn Hộ Mini Ban Công Thoáng' : 'Phòng Trọ Rộng Rãi Giá Rẻ'}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
                        <Star weight="fill" className="text-yellow-500 w-3 h-3" /> 4.9
                      </div>
                    </div>
                    <p className="text-[13px] text-neutral-500 mb-3 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> 
                      {i === 1 ? 'Võ Thị Sáu, Q3' : i === 2 ? 'Đa Kao, Q1' : 'Phường 25, Bình Thạnh'}
                    </p>
                    <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                      <p className="font-bold text-primary text-[17px]">
                        {i === 1 ? '5.5tr' : i === 2 ? '6.2tr' : '3.8tr'} 
                        <span className="text-[11px] font-normal text-neutral-500 ml-0.5">/tháng</span>
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-1 rounded-md">Trống 1 phòng</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
