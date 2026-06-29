import { Outlet } from 'react-router-dom';
import { GlobalNav } from '../../components/ui/GlobalNav';
import { LocalNav } from '../../components/ui/LocalNav';
import { BentoCard } from '../../components/ui/BentoCard';
import { AppleButton } from '../../components/ui/AppleButton';
import { User, Sparkle, ChatText, CalendarCheck, Heart } from '@phosphor-icons/react';

export function CustomerLayout() {
  const items = [
    { label: 'Tổng quan', path: '/customer/dashboard' },
    { label: 'Phòng đã lưu', path: '/customer/saved' },
    { label: 'Lịch hẹn', path: '/customer/appointments' },
    { label: 'Tin nhắn', path: '/customer/messages' },
    { label: 'AI Matcher', path: '/customer/matcher' },
    { label: 'Hồ sơ', path: '/customer/profile' },
  ];

  return (
    <div className="bg-[#f5f5f7] min-h-screen pb-24">
      <GlobalNav />
      <LocalNav title="Khách thuê" items={items} />
      <main className="apple-container pt-8">
        <Outlet />
      </main>
    </div>
  );
}

export function CustomerProfile() {
  return (
    <div className="max-w-[600px] mx-auto">
      <h1 className="text-[34px] font-bold text-[#1d1d1f] mb-8">Hồ sơ cá nhân.</h1>
      <BentoCard className="bg-white">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#d2d2d7]/50">
           <div className="w-24 h-24 rounded-full bg-[#e8e8ed] overflow-hidden shrink-0">
             <User className="w-full h-full p-4 text-[#86868b]" />
           </div>
           <div>
             <AppleButton variant="secondary" size="sm">Đổi ảnh đại diện</AppleButton>
           </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1d1d1f] ml-1">Họ và tên</label>
            <input type="text" defaultValue="Nguyễn Văn A" className="w-full h-[44px] px-4 rounded-[12px] bg-[#f5f5f7] border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 outline-none text-[15px] transition-all" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1d1d1f] ml-1">Số điện thoại</label>
            <input type="tel" defaultValue="0123456789" className="w-full h-[44px] px-4 rounded-[12px] bg-[#f5f5f7] border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 outline-none text-[15px] transition-all" />
          </div>
          <AppleButton className="mt-4 w-fit">Lưu thay đổi</AppleButton>
        </div>
      </BentoCard>
    </div>
  );
}

export function CustomerMatcher() {
  return (
    <div className="flex flex-col items-center justify-center pt-12">
       <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white mb-6">
          <Sparkle className="w-8 h-8" weight="fill" />
       </div>
       <h1 className="text-[40px] font-bold text-[#1d1d1f] mb-2">Dormi AI Matcher.</h1>
       <p className="text-[17px] text-[#6e6e73] mb-12 text-center max-w-[500px]">Thuật toán ghép nối thông minh giúp bạn tìm được người bạn cùng phòng lý tưởng nhất.</p>
       
       <BentoCard noPadding className="w-full max-w-[400px] h-[500px] bg-white relative shadow-2xl flex flex-col cursor-pointer transform transition-transform hover:scale-[1.02]">
         <div className="flex-1 bg-[#e8e8ed] relative">
            <img src="https://i.pravatar.cc/300?img=12" alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-[28px] font-bold">Hoàng Tuấn, 21</h2>
              <p className="text-[15px] font-medium opacity-90 mt-1">Sinh viên ĐH Bách Khoa</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[13px] font-medium">Sạch sẽ</span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[13px] font-medium">Ít nấu ăn</span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[13px] font-medium">Ngủ sớm</span>
              </div>
            </div>
         </div>
         <div className="h-[80px] flex items-center justify-center gap-6">
           <button className="w-12 h-12 rounded-full border-2 border-[#ff3b30] text-[#ff3b30] flex items-center justify-center hover:bg-[#ff3b30] hover:text-white transition-colors">
              ✕
           </button>
           <button className="w-12 h-12 rounded-full border-2 border-[#34c759] text-[#34c759] flex items-center justify-center hover:bg-[#34c759] hover:text-white transition-colors">
              <Heart className="w-6 h-6" weight="fill" />
           </button>
         </div>
       </BentoCard>
    </div>
  );
}

export function CustomerAppointments() {
  return (
    <div>
      <h1 className="text-[34px] font-bold text-[#1d1d1f] mb-8">Lịch hẹn của bạn.</h1>
      <BentoCard className="bg-white p-6">
        <div className="flex items-center gap-4 text-[#1d1d1f] py-4 border-b border-[#d2d2d7]/50 last:border-0">
          <div className="w-12 h-12 rounded-full bg-[#ff9500]/10 text-[#ff9500] flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" weight="fill" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold">Xem Studio Quận Bình Thạnh</h3>
            <p className="text-[14px] text-[#6e6e73]">14:00 Ngày mai - Gặp anh Trần Chủ</p>
          </div>
          <AppleButton variant="secondary" size="sm">Hủy hẹn</AppleButton>
        </div>
      </BentoCard>
    </div>
  );
}

export function CustomerSaved() {
  return (
    <div>
      <h1 className="text-[34px] font-bold text-[#1d1d1f] mb-8">Phòng đã lưu.</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BentoCard className="bg-white p-4 flex flex-col gap-3">
          <div className="w-full h-[180px] rounded-[12px] bg-[#e8e8ed] overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="room" />
            <button className="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-md rounded-full text-[#ff3b30]">
              <Heart weight="fill" />
            </button>
          </div>
          <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Studio Quận 1 siêu đẹp</h3>
          <p className="text-[15px] font-bold text-[#1d1d1f]">5.000.000đ</p>
        </BentoCard>
      </div>
    </div>
  );
}

export function CustomerMessages() {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-[#e8e8ed] flex items-center justify-center text-[#86868b] mb-6">
        <ChatText className="w-10 h-10" weight="fill" />
      </div>
      <h1 className="text-[28px] font-bold text-[#1d1d1f] mb-2">Hộp thư đến.</h1>
      <p className="text-[17px] text-[#6e6e73]">Tất cả tin nhắn trao đổi với chủ nhà sẽ hiển thị ở đây.</p>
    </div>
  );
}
