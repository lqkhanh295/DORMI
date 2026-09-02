import { Card } from '../../components/ui/Card';

export default function LandlordDashboard() {
  // ponytail: LandlordDashboard using Functional Clay (Level 2 Soft Clay cards, Deep Navy + Gold metrics)
  return (
    <div className="space-y-8 pb-12 bg-[#F5F7FA]">
      
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-[18px] shadow-clay-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight leading-[1.1]">Tổng quan Chủ trọ</h1>
          <p className="text-body text-[#64748B] mt-1">Quản lý tài sản và phân tích hiệu quả cho thuê.</p>
        </div>
      </div>

      {/* Stats Grid - Level 2 Soft Clay Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:-translate-y-[2px] transition-all">
          <h3 className="text-caption font-semibold text-[#64748B] uppercase tracking-wider mb-3">Phòng đang cho thuê</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-[48px] font-bold text-[#00153D] leading-none">4</p>
            <span className="text-body font-medium text-[#64748B]">phòng hoạt động</span>
          </div>
        </Card>
        
        {/* Card 2 */}
        <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:-translate-y-[2px] transition-all">
          <h3 className="text-caption font-semibold text-[#64748B] uppercase tracking-wider mb-3">Lượt quan tâm (30 ngày)</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-[48px] font-bold text-[#00153D] leading-none">142</p>
            <span className="text-caption font-bold text-[#16803C]">+12% tháng này</span>
          </div>
        </Card>
        
        {/* Card 3 */}
        <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:-translate-y-[2px] transition-all">
          <h3 className="text-caption font-semibold text-[#64748B] uppercase tracking-wider mb-3">Điểm uy tín chủ trọ</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-[48px] font-bold text-[#00153D] leading-none">98</p>
            <span className="text-caption font-medium text-[#64748B]">/100 tuyệt hảo</span>
          </div>
        </Card>
      </div>

      {/* Conversion Funnel Card */}
      <Card className="p-6 md:p-8 rounded-[18px] bg-white shadow-clay-soft hover:-translate-y-[2px] transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#E2E8F0] pb-5">
          <div>
            <h3 className="text-h2 font-bold text-[#0F172A] tracking-tight">Phễu phân tích khách hàng</h3>
            <p className="text-caption text-[#64748B] mt-1">Hiệu quả chuyển đổi từ lượt xem đến liên hệ</p>
          </div>
          <select className="px-4 py-2 bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] text-body text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#00153D] transition-colors min-h-[44px]">
            <option>Tất cả phòng</option>
            <option>Phòng trọ Quận 7</option>
            <option>Căn hộ mini Quận 1</option>
          </select>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-body font-semibold mb-2">
              <span className="text-[#64748B]">Lượt xem tin</span>
              <span className="text-[#0F172A] font-bold">1,240</span>
            </div>
            <div className="w-full bg-[#F5F7FA] rounded-full h-3 overflow-hidden border border-[#E2E8F0]">
              <div className="bg-[#00153D] h-full rounded-full transition-all duration-500" style={{width: '100%'}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-body font-semibold mb-2">
              <span className="text-[#64748B]">Đã lưu tin</span>
              <span className="text-[#0F172A] font-bold">210</span>
            </div>
            <div className="w-full bg-[#F5F7FA] rounded-full h-3 overflow-hidden border border-[#E2E8F0]">
              <div className="bg-[#073372] h-full rounded-full transition-all duration-500" style={{width: '20%'}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-body font-semibold mb-2">
              <span className="text-[#64748B]">Đã liên hệ</span>
              <span className="text-[#0F172A] font-bold">42</span>
            </div>
            <div className="w-full bg-[#F5F7FA] rounded-full h-3 overflow-hidden border border-[#E2E8F0]">
              <div className="bg-[#16803C] h-full rounded-full transition-all duration-500" style={{width: '5%'}}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
