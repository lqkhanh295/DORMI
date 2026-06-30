import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function AdminDashboard() {
  const [verifications, setVerifications] = useState([
    { id: 1, name: 'Nguyễn Văn A', doc: 'CCCD & Giấy phép kinh doanh' },
    { id: 2, name: 'Trần Thị B', doc: 'Chỉ có CCCD' },
    { id: 3, name: 'Lê Ngọc C', doc: 'Giấy phép kinh doanh' }
  ]);

  const [reports, setReports] = useState([
    { id: 1, title: 'Tin nghi ngờ #1001', reason: 'AI phát hiện 98% khớp với ảnh lừa đảo' },
    { id: 2, title: 'Tin nghi ngờ #1002', reason: 'Nhiều người dùng báo cáo địa chỉ giả' }
  ]);

  const handleReview = (id: number) => {
    setVerifications(verifications.filter(v => v.id !== id));
  };

  const handleReportAction = (id: number) => {
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Tổng quan Hệ thống</h1>
          <p className="text-sm text-neutral-500 mt-1">Số liệu tổng quan và hàng đợi kiểm duyệt nền tảng.</p>
        </div>
        <Button variant="outline" className="shadow-sm hover:shadow transition-all whitespace-nowrap">
          <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Xuất báo cáo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border border-neutral-200 hover:shadow-md transition-all duration-300 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 relative z-10">Tổng người dùng</h3>
          <p className="text-3xl font-black text-neutral-800 relative z-10 mt-1">12,450</p>
          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded inline-block mt-2 relative z-10">+12% tháng này</span>
        </Card>
        
        <Card className="p-5 border border-neutral-200 hover:shadow-md transition-all duration-300 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 relative z-10">Tin đăng hoạt động</h3>
          <p className="text-3xl font-black text-neutral-800 relative z-10 mt-1">3,210</p>
          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded inline-block mt-2 relative z-10">+5% tháng này</span>
        </Card>
        
        <Card className="p-5 bg-rose-50/50 border border-rose-100 hover:shadow-md transition-all duration-300 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-100/50 rounded-full group-hover:scale-110 transition-transform"></div>
          <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 relative z-10">Chờ xác thực</h3>
          <p className="text-3xl font-black text-rose-700 relative z-10 mt-1">{84 - (3 - verifications.length)}</p>
          <span className="text-xs text-rose-600 font-medium mt-2 block relative z-10">Cần xử lý ngay</span>
        </Card>
        
        <Card className="p-5 bg-amber-50/50 border border-amber-100 hover:shadow-md transition-all duration-300 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-100/50 rounded-full group-hover:scale-110 transition-transform"></div>
          <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 relative z-10">Báo cáo vi phạm</h3>
          <p className="text-3xl font-black text-amber-800 relative z-10 mt-1">{10 + reports.length}</p>
          <span className="text-xs text-amber-600 font-medium mt-2 block relative z-10">Nghi ngờ lừa đảo</span>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <Card className="p-5 md:p-6 border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-5 border-b border-neutral-100 pb-3">
            <h3 className="text-lg font-bold text-neutral-800">Hàng đợi xác thực</h3>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors">Xem tất cả</button>
          </div>
          
          <div className="space-y-3">
            {verifications.length === 0 && <p className="text-sm text-neutral-500 py-4 text-center bg-neutral-50 rounded-lg border border-dashed border-neutral-200">Không có yêu cầu xác thực mới.</p>}
            {verifications.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3.5 bg-white border border-neutral-100 rounded-lg hover:border-neutral-200 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold group-hover:scale-105 transition-transform">
                    {v.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-neutral-800">{v.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{v.doc}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleReview(v.id)} className="text-xs px-3 shadow-sm hover:shadow">Duyệt hồ sơ</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6 border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-5 border-b border-neutral-100 pb-3">
            <h3 className="text-lg font-bold text-neutral-800">Tin bị AI gắn cờ</h3>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors">Xem tất cả</button>
          </div>
          
          <div className="space-y-3">
            {reports.length === 0 && <p className="text-sm text-neutral-500 py-4 text-center bg-neutral-50 rounded-lg border border-dashed border-neutral-200">Không có nội dung vi phạm.</p>}
            {reports.map(r => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-rose-50/30 border border-rose-100 rounded-lg hover:bg-rose-50/50 transition-colors gap-3">
                <div>
                  <p className="font-semibold text-sm text-rose-900">{r.title}</p>
                  <p className="text-xs text-rose-600 mt-0.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    {r.reason}
                  </p>
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                  <Button variant="outline" size="sm" className="text-xs border-neutral-200 text-neutral-600 hover:bg-neutral-50" onClick={() => handleReportAction(r.id)}>Bỏ qua</Button>
                  <Button size="sm" className="text-xs bg-rose-600 hover:bg-rose-700 shadow-sm" onClick={() => handleReportAction(r.id)}>Gỡ bài</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
