import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function AdminDashboard() {
  const [verifications, setVerifications] = useState([
    { id: 1, name: 'Nguyễn Văn A', doc: 'CCCD & Giấy phép kinh doanh' },
    { id: 2, name: 'Trần Thị B', doc: 'Chỉ có CCCD' },
    { id: 3, name: 'Lê Ngọc C', doc: 'Giấy phép kinh doanh' }
  ]);

  const handleReview = (id: number) => {
    setVerifications(verifications.filter(v => v.id !== id));
  };

  // ponytail: AdminDashboard using Functional Clay (Level 2 Soft Clay containers, Level 3 Flat tables)
  return (
    <div className="space-y-6 pb-6 bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-white p-6 rounded-[18px] shadow-clay-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Tổng quan Hệ thống</h1>
          <p className="text-sm text-[#64748B] mt-1">Số liệu tổng quan và hàng đợi kiểm duyệt nền tảng.</p>
        </div>
      </div>

      {/* Stats Cards - Level 2 Soft Clay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:-translate-y-[2px] transition-all">
          <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Tổng người dùng</h3>
          <p className="text-3xl font-bold text-[#00153D] mt-1">12,450</p>
          <span className="text-xs text-[#16803C] font-semibold bg-[#F0FDF4] border border-[#DCFCE7] px-2.5 py-0.5 rounded-full inline-block mt-2">+12% tháng này</span>
        </Card>
        
        <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:-translate-y-[2px] transition-all">
          <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Tin đăng hoạt động</h3>
          <p className="text-3xl font-bold text-[#00153D] mt-1">3,210</p>
          <span className="text-xs text-[#16803C] font-semibold bg-[#F0FDF4] border border-[#DCFCE7] px-2.5 py-0.5 rounded-full inline-block mt-2">+5% tháng này</span>
        </Card>
        
        <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:-translate-y-[2px] transition-all">
          <h3 className="text-xs font-semibold text-[#C62828] uppercase tracking-wider mb-2">Chờ xác thực</h3>
          <p className="text-3xl font-bold text-[#C62828] mt-1">{verifications.length}</p>
          <span className="text-xs text-[#C62828] font-semibold bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-0.5 rounded-full inline-block mt-2">Cần xử lý ngay</span>
        </Card>
      </div>

      {/* Verification Queue List */}
      <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft">
        <div className="flex justify-between items-center mb-5 border-b border-[#E2E8F0] pb-4">
          <h3 className="text-lg font-bold text-[#0F172A]">Hàng đợi xác thực</h3>
          <button className="text-sm font-semibold text-[#00153D] hover:underline">Xem tất cả</button>
        </div>
        
        <div className="space-y-3">
          {verifications.length === 0 && (
            <p className="text-sm text-[#64748B] py-6 text-center bg-[#F5F7FA] rounded-[12px] border border-dashed border-[#E2E8F0]">Không có yêu cầu xác thực mới.</p>
          )}
          {verifications.map(v => (
            <div key={v.id} className="flex items-center justify-between p-4 bg-[#F5F7FA] border border-[#E2E8F0] rounded-[12px]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-[#00153D] text-white rounded-full flex items-center justify-center font-bold">
                  {v.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0F172A]">{v.name}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{v.doc}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleReview(v.id)} className="text-xs px-4">Duyệt hồ sơ</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
