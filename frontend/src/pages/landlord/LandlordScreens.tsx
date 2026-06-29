import { Outlet } from 'react-router-dom';
import { GlobalNav } from '../../components/ui/GlobalNav';
import { LocalNav } from '../../components/ui/LocalNav';
import { BentoCard } from '../../components/ui/BentoCard';
import { AppleButton } from '../../components/ui/AppleButton';
import { ShieldCheck, House, Plus, Image as ImageIcon, CalendarBlank as Calendar, ChatText } from '@phosphor-icons/react';

export function LandlordLayout() {
  const items = [
    { label: 'Tổng quan', path: '/landlord/dashboard' },
    { label: 'Phòng của tôi', path: '/landlord/rooms' },
    { label: 'Đăng phòng', path: '/landlord/create-room' },
    { label: 'Lịch hẹn', path: '/landlord/appointments' },
    { label: 'Tin nhắn', path: '/landlord/messages' },
    { label: 'KYC', path: '/landlord/kyc' },
  ];

  return (
    <div className="bg-[#f5f5f7] min-h-screen pb-24">
      <GlobalNav />
      <LocalNav title="Chủ nhà" items={items} />
      <main className="apple-container pt-8">
        <Outlet />
      </main>
    </div>
  );
}

export function LandlordDashboard() {
  return (
    <div>
      <div className="mb-12">
        <h1 className="typography-headline text-[#1d1d1f] mb-4">Chào anh Chủ Nhà.</h1>
        <p className="typography-subhead text-[#6e6e73]">Hệ thống đã sẵn sàng hoạt động.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <BentoCard className="bg-white p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0071E3]/10 mb-4">
             <House className="w-6 h-6 text-[#0071E3]" weight="fill" />
          </div>
          <p className="text-[15px] font-medium text-[#6e6e73]">Tổng số phòng</p>
          <p className="text-[40px] font-bold text-[#1d1d1f]">5</p>
        </BentoCard>
        <BentoCard className="bg-white p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34c759]/10 mb-4">
             <ChatText className="w-6 h-6 text-[#34c759]" weight="fill" />
          </div>
          <p className="text-[15px] font-medium text-[#6e6e73]">Lượt xem tuần này</p>
          <p className="text-[40px] font-bold text-[#1d1d1f]">128</p>
        </BentoCard>
        <BentoCard className="bg-white p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff9500]/10 mb-4">
             <Calendar className="w-6 h-6 text-[#ff9500]" weight="fill" />
          </div>
          <p className="text-[15px] font-medium text-[#6e6e73]">Lịch hẹn cần duyệt</p>
          <p className="text-[40px] font-bold text-[#1d1d1f]">3</p>
        </BentoCard>
      </div>
    </div>
  );
}

export function LandlordKYC() {
  return (
    <div className="max-w-[600px] mx-auto">
      <h1 className="text-[34px] font-bold text-[#1d1d1f] mb-8">Xác thực danh tính.</h1>
      <BentoCard className="bg-white text-center flex flex-col items-center">
        <ShieldCheck className="w-16 h-16 text-[#34c759] mb-4" weight="fill" />
        <h2 className="text-[21px] font-bold text-[#1d1d1f] mb-2">Tăng độ uy tín</h2>
        <p className="text-[15px] text-[#6e6e73] mb-8">Tải lên CMND/CCCD để mở khóa tính năng đăng bài không giới hạn.</p>
        
        <div className="w-full h-[200px] rounded-[16px] border-2 border-dashed border-[#0071e3]/30 bg-[#f5f5f7] flex flex-col items-center justify-center cursor-pointer hover:bg-[#e8e8ed] transition-colors">
          <ImageIcon className="w-8 h-8 text-[#0071e3] mb-2" />
          <p className="font-semibold text-[#1d1d1f]">Nhấn để tải lên mặt trước</p>
          <p className="text-[13px] text-[#86868b]">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
        </div>
        
        <AppleButton className="mt-8" fullWidth>Gửi xác thực</AppleButton>
      </BentoCard>
    </div>
  );
}

export function CreateRoom() {
  return (
    <div className="max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[34px] font-bold text-[#1d1d1f]">Tạo phòng mới.</h1>
        <span className="text-[15px] font-semibold text-[#86868b] uppercase tracking-widest">Bước 1/3</span>
      </div>
      
      <BentoCard className="bg-white">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1d1d1f] ml-1">Tiêu đề bài đăng</label>
            <input type="text" placeholder="VD: Phòng trọ ban công sáng sủa..." className="w-full h-[56px] px-4 rounded-[12px] bg-[#f5f5f7] border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 outline-none text-[17px] transition-all" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-1.5">
               <label className="text-[13px] font-semibold text-[#1d1d1f] ml-1">Giá cho thuê (VNĐ)</label>
               <input type="number" placeholder="3000000" className="w-full h-[56px] px-4 rounded-[12px] bg-[#f5f5f7] border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 outline-none text-[17px] transition-all" />
             </div>
             <div className="flex flex-col gap-1.5">
               <label className="text-[13px] font-semibold text-[#1d1d1f] ml-1">Diện tích (m²)</label>
               <input type="number" placeholder="25" className="w-full h-[56px] px-4 rounded-[12px] bg-[#f5f5f7] border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 outline-none text-[17px] transition-all" />
             </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#1d1d1f] ml-1">Địa chỉ</label>
            <input type="text" placeholder="Nhập địa chỉ đầy đủ..." className="w-full h-[56px] px-4 rounded-[12px] bg-[#f5f5f7] border border-transparent focus:border-[#0071E3] focus:bg-white focus:ring-4 focus:ring-[#0071E3]/20 outline-none text-[17px] transition-all" />
          </div>
          
          <div className="flex justify-end pt-6 border-t border-[#d2d2d7]/50 mt-4">
             <AppleButton size="lg" leftIcon={<Plus className="w-4 h-4" />}>Lưu & Tiếp tục</AppleButton>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

export function MyRooms() {
  const rooms = [
    { title: 'Studio Nguyễn Hữu Cảnh', status: 'Đang hiển thị', views: 128, price: '5.000.000đ' },
    { title: 'Phòng ban công Quận 7', status: 'Chờ duyệt', views: 42, price: '2.500.000đ' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[34px] font-bold text-[#1d1d1f]">Phòng của tôi.</h1>
        <AppleButton size="sm">Đăng bài mới</AppleButton>
      </div>
      
      <BentoCard className="bg-white p-0 overflow-hidden">
        {rooms.map((room, idx) => (
          <div key={idx} className="p-6 border-b border-[#d2d2d7]/50 last:border-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <p className="text-[17px] font-semibold text-[#1d1d1f]">{room.title}</p>
                <p className="text-[15px] text-[#6e6e73] mt-1">{room.price}/tháng</p>
             </div>
             <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[12px] font-semibold ${room.status === 'Đang hiển thị' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#ff9500]/10 text-[#ff9500]'}`}>
                  {room.status}
                </span>
                <span className="text-[15px] text-[#6e6e73] min-w-[100px] text-right">{room.views} lượt xem</span>
                <AppleButton variant="secondary" size="sm">Chỉnh sửa</AppleButton>
             </div>
          </div>
        ))}
      </BentoCard>
    </div>
  );
}

export function LandlordAppointments() {
  return (
    <div>
      <h1 className="text-[34px] font-bold text-[#1d1d1f] mb-8">Lịch hẹn xem phòng.</h1>
      <BentoCard className="bg-white p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Khách: Trần Văn B</h3>
            <p className="text-[15px] text-[#0071e3] font-medium mt-1">Studio Nguyễn Hữu Cảnh</p>
            <p className="text-[14px] text-[#6e6e73] mt-2">Hôm nay, 17:30</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <AppleButton variant="secondary" size="sm" className="flex-1 md:flex-none">Từ chối</AppleButton>
            <AppleButton size="sm" className="flex-1 md:flex-none">Chấp nhận</AppleButton>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}

export function LandlordMessages() {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-[#e8e8ed] flex items-center justify-center text-[#86868b] mb-6">
        <ChatText className="w-10 h-10" weight="fill" />
      </div>
      <h1 className="text-[28px] font-bold text-[#1d1d1f] mb-2">Chưa có tin nhắn nào.</h1>
      <p className="text-[17px] text-[#6e6e73]">Danh sách hội thoại sẽ hiển thị ở đây khi có khách liên hệ.</p>
    </div>
  );
}
