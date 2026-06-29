import { Outlet } from 'react-router-dom';
import { GlobalNav } from '../../components/ui/GlobalNav';
import { LocalNav } from '../../components/ui/LocalNav';
import { BentoCard } from '../../components/ui/BentoCard';
import { AppleButton } from '../../components/ui/AppleButton';
import { Users, ShieldCheck, Warning, FileText, CheckCircle, XCircle } from '@phosphor-icons/react';

export function AdminLayout() {
  const items = [
    { label: 'Tổng quan', path: '/admin/dashboard' },
    { label: 'Duyệt phòng', path: '/admin/rooms' },
    { label: 'Duyệt KYC', path: '/admin/kyc' },
    { label: 'Người dùng', path: '/admin/users' },
    { label: 'Báo cáo', path: '/admin/reports' },
  ];

  return (
    <div className="bg-[#f5f5f7] min-h-screen pb-24">
      <GlobalNav />
      <LocalNav title="Quản trị viên" items={items} />
      <main className="apple-container pt-8">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <div>
      <div className="mb-12">
        <h1 className="typography-headline text-[#1d1d1f] mb-4">Hệ thống.</h1>
        <p className="typography-subhead text-[#6e6e73]">Tất cả hoạt động trong tầm kiểm soát.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <BentoCard className="bg-white p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0071E3]/10 mb-4">
             <Users className="w-6 h-6 text-[#0071E3]" weight="fill" />
          </div>
          <p className="text-[15px] font-medium text-[#6e6e73]">Tổng Người dùng</p>
          <p className="text-[40px] font-bold text-[#1d1d1f]">1,204</p>
        </BentoCard>
        <BentoCard className="bg-white p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff9500]/10 mb-4">
             <ShieldCheck className="w-6 h-6 text-[#ff9500]" weight="fill" />
          </div>
          <p className="text-[15px] font-medium text-[#6e6e73]">Phòng chờ duyệt</p>
          <p className="text-[40px] font-bold text-[#1d1d1f]">15</p>
        </BentoCard>
        <BentoCard className="bg-white p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff3b30]/10 mb-4">
             <Warning className="w-6 h-6 text-[#ff3b30]" weight="fill" />
          </div>
          <p className="text-[15px] font-medium text-[#6e6e73]">Báo cáo mở</p>
          <p className="text-[40px] font-bold text-[#1d1d1f]">2</p>
        </BentoCard>
      </div>
    </div>
  );
}

export function AdminRooms() {
  const reviewItems = [
    { title: 'Studio Nguyễn Hữu Cảnh', owner: 'Nguyễn Văn Chủ', status: 'Chờ duyệt', risk: 'Thấp' },
    { title: 'Phòng ban công Quận 7', owner: 'Lê Minh Hoa', status: 'Cần kiểm tra', risk: 'Trung bình' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[34px] font-bold text-[#1d1d1f]">Kiểm duyệt phòng.</h1>
        <AppleButton variant="secondary" size="sm">Lọc mức độ ưu tiên</AppleButton>
      </div>
      
      <div className="flex flex-col gap-4">
        {reviewItems.map((item, idx) => (
          <BentoCard key={idx} noPadding className="bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[17px] font-semibold text-[#1d1d1f]">{item.title}</p>
              <p className="text-[14px] text-[#6e6e73] mt-1">Người đăng: <span className="font-medium text-[#1d1d1f]">{item.owner}</span></p>
            </div>
            <div className="flex items-center gap-6">
              <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#ff9500]/10 text-[#ff9500]">{item.status}</span>
              <span className="text-[14px] text-[#6e6e73]">Rủi ro: <span className="font-medium">{item.risk}</span></span>
              <div className="flex items-center gap-2">
                 <button className="w-10 h-10 rounded-full border border-[#d2d2d7] flex items-center justify-center text-[#ff3b30] hover:bg-[#ff3b30] hover:border-[#ff3b30] hover:text-white transition-colors">
                    <XCircle className="w-6 h-6" weight="fill" />
                 </button>
                 <button className="w-10 h-10 rounded-full border border-[#d2d2d7] flex items-center justify-center text-[#34c759] hover:bg-[#34c759] hover:border-[#34c759] hover:text-white transition-colors">
                    <CheckCircle className="w-6 h-6" weight="fill" />
                 </button>
              </div>
            </div>
          </BentoCard>
        ))}
      </div>
    </div>
  );
}

export function AdminKYC() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
           <FileText className="w-6 h-6" weight="fill" />
        </div>
        <h1 className="text-[34px] font-bold text-[#1d1d1f]">Duyệt hồ sơ KYC.</h1>
      </div>
      <p className="text-[17px] text-[#6e6e73]">Kiểm tra giấy tờ tùy thân của chủ phòng trước khi cho phép đăng bài công khai.</p>
    </div>
  );
}

export function AdminUsers() {
  return (
    <div>
      <h1 className="text-[34px] font-bold text-[#1d1d1f] mb-8">Quản lý người dùng.</h1>
      <BentoCard className="bg-white">
        <p className="text-[17px] text-[#6e6e73]">Danh sách khách thuê và chủ phòng hiển thị theo trạng thái xác minh, hoạt động và báo cáo.</p>
      </BentoCard>
    </div>
  );
}

export function AdminReports() {
  return (
    <div>
      <h1 className="text-[34px] font-bold text-[#1d1d1f] mb-8">Báo cáo vi phạm.</h1>
      <BentoCard className="bg-white">
        <p className="text-[17px] text-[#6e6e73]">Theo dõi báo cáo từ người dùng về tin giả, chủ phòng lừa đảo hoặc nội dung không phù hợp.</p>
      </BentoCard>
    </div>
  );
}
