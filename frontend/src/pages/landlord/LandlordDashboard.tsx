import { Card } from '../../components/ui/Card';

export default function LandlordDashboard() {
  return (
    <div className="space-y-8 pb-12 bg-canvas animate-fade-in">
      
      {/* Header */}
      <div className="bg-surface p-6 md:p-8 rounded-bento border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-text-primary tracking-tight leading-[1.1]">Tổng quan Chủ trọ</h1>
          <p className="text-body text-text-secondary mt-1">Quản lý tài sản và phân tích hiệu quả cho thuê.</p>
        </div>
      </div>

      {/* Stats Bento Grid (Vibrant Flat Pastel Fills) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 (Mint) */}
        <Card className="p-6 bg-mint border-none hover:shadow-xs transition-shadow rounded-bento relative overflow-hidden group">
          <h3 className="text-caption font-bold text-text-primary uppercase tracking-wider mb-3">Phòng đang cho thuê</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-[48px] font-bold text-text-primary leading-none">4</p>
            <span className="text-body font-semibold text-text-secondary">phòng hoạt động</span>
          </div>
        </Card>
        
        {/* Card 2 (Lilac) */}
        <Card className="p-6 bg-lilac border-none hover:shadow-xs transition-shadow rounded-bento">
          <h3 className="text-caption font-bold text-text-primary uppercase tracking-wider mb-3">Lượt quan tâm (30 ngày)</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-[48px] font-bold text-text-primary leading-none">142</p>
            <span className="text-caption font-bold text-primary-dark">+12% tháng này</span>
          </div>
        </Card>
        
        {/* Card 3 (Peach) */}
        <Card className="p-6 bg-peach border-none hover:shadow-xs transition-shadow rounded-bento relative overflow-hidden group">
          <h3 className="text-caption font-bold text-text-primary uppercase tracking-wider mb-3">Điểm uy tín chủ trọ</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-[48px] font-bold text-text-primary leading-none">98</p>
            <span className="text-caption font-semibold text-text-secondary">/100 tuyệt hảo</span>
          </div>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="p-6 md:p-8 border border-border-subtle rounded-bento bg-surface hover:shadow-xs transition-shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-border-subtle pb-5">
          <div>
            <h3 className="text-h2 font-bold text-text-primary tracking-tight">Phễu phân tích khách hàng</h3>
            <p className="text-caption text-text-muted mt-1">Hiệu quả chuyển đổi từ lượt xem đến liên hệ</p>
          </div>
          <select className="px-4 py-2 bg-canvas border border-border-subtle rounded-md text-body text-text-secondary font-semibold focus:outline-none focus:border-primary transition-colors min-h-[44px]">
            <option>Tất cả phòng</option>
            <option>Phòng trọ Quận 7</option>
            <option>Căn hộ mini Quận 1</option>
          </select>
        </div>
        
        <div className="space-y-6">
          <div className="group">
            <div className="flex justify-between text-body font-semibold mb-2">
              <span className="text-text-secondary group-hover:text-primary transition-colors">Lượt xem tin</span>
              <span className="text-text-primary font-bold">1,240</span>
            </div>
            <div className="w-full bg-canvas rounded-pill h-3 overflow-hidden border border-border-subtle">
              <div className="bg-primary-soft h-full rounded-pill transition-all duration-1000 ease-out" style={{width: '100%'}}></div>
            </div>
          </div>
          
          <div className="group">
            <div className="flex justify-between text-body font-semibold mb-2">
              <span className="text-text-secondary group-hover:text-primary transition-colors">Đã lưu tin</span>
              <span className="text-text-primary font-bold">210</span>
            </div>
            <div className="w-full bg-canvas rounded-pill h-3 overflow-hidden border border-border-subtle">
              <div className="bg-lilac h-full rounded-pill transition-all duration-1000 ease-out" style={{width: '20%'}}></div>
            </div>
          </div>
          
          <div className="group">
            <div className="flex justify-between text-body font-semibold mb-2">
              <span className="text-text-secondary group-hover:text-primary transition-colors">Đã liên hệ</span>
              <span className="text-text-primary font-bold">42</span>
            </div>
            <div className="w-full bg-canvas rounded-pill h-3 overflow-hidden border border-border-subtle">
              <div className="bg-mint h-full rounded-pill transition-all duration-1000 ease-out" style={{width: '5%'}}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
