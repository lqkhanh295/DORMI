import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Tổng quan Chủ trọ</h1>
          <p className="text-sm text-neutral-500 mt-1">Quản lý tài sản và phân tích hiệu quả cho thuê.</p>
        </div>
        {/* <Button onClick={() => navigate('/landlord/rooms')} className="hidden shadow-sm hover:shadow transition-all whitespace-nowrap font-semibold">
          + Đăng tin mới
        </Button> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 bg-emerald-50/50 border border-emerald-100 hover:shadow-md transition-all duration-300 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100/50 rounded-full group-hover:scale-110 transition-transform"></div>
          <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 relative z-10">Phòng đang cho thuê</h3>
          <div className="flex items-end gap-2 relative z-10">
            <p className="text-4xl font-black text-neutral-800">4</p>
            <span className="text-sm font-medium text-emerald-600 mb-1">phòng</span>
          </div>
        </Card>
        
        <Card className="p-5 border border-neutral-200 hover:shadow-md transition-all duration-300 rounded-xl">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Lượt quan tâm (30 ngày)</h3>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-neutral-800">142</p>
            <span className="text-sm font-medium text-primary-600 mb-1">+12%</span>
          </div>
        </Card>
        
        <Card className="p-5 border border-neutral-200 hover:shadow-md transition-all duration-300 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-50 rounded-full group-hover:scale-110 transition-transform"></div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 relative z-10">Điểm uy tín</h3>
          <div className="flex items-end gap-2 relative z-10">
            <p className="text-4xl font-black text-amber-500">98</p>
            <span className="text-sm font-medium text-neutral-400 mb-1">/100</span>
          </div>
        </Card>
      </div>

      {/* Conversion Funnel Placeholder */}
      <Card className="p-5 md:p-6 border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-800">Phễu phân tích khách hàng</h3>
            <p className="text-xs text-neutral-500 mt-1">Hiệu quả chuyển đổi từ lượt xem đến liên hệ</p>
          </div>
          <select className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-primary-500 transition-colors">
            <option>Tất cả phòng</option>
            <option>Phòng trọ Quận 7</option>
            <option>Căn hộ mini Quận 1</option>
          </select>
        </div>
        
        <div className="space-y-5">
          <div className="group">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-neutral-600 group-hover:text-primary-600 transition-colors">Lượt xem tin</span>
              <span className="font-bold text-neutral-800">1,240</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary-200 h-full rounded-full transition-all duration-1000 ease-out" style={{width: '100%'}}></div>
            </div>
          </div>
          
          <div className="group">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-neutral-600 group-hover:text-primary-600 transition-colors">Đã lưu tin</span>
              <span className="font-bold text-neutral-800">210</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary-400 h-full rounded-full transition-all duration-1000 ease-out" style={{width: '20%'}}></div>
            </div>
          </div>
          
          <div className="group">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-neutral-600 group-hover:text-primary-600 transition-colors">Đã liên hệ</span>
              <span className="font-bold text-neutral-800">42</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary-600 h-full rounded-full transition-all duration-1000 ease-out" style={{width: '5%'}}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
