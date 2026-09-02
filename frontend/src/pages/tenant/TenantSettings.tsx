import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function TenantSettings() {
  const [matchNotify, setMatchNotify] = useState(true);
  const [chatNotify, setChatNotify] = useState(true);
  const [promoNotify, setPromoNotify] = useState(false);

  // ponytail: TenantSettings using Level 2 Soft Clay container and Deep Navy Clay toggles
  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-[#F5F7FA]">
      <div>
        <h1 className="text-h2 font-bold text-[#0F172A]">Cài đặt tài khoản</h1>
        <p className="text-body text-[#64748B]">Quản lý thông báo, bảo mật và quyền riêng tư.</p>
      </div>

      <Card className="bg-white rounded-[18px] shadow-clay-soft overflow-hidden p-0 border-none">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Settings Sidebar */}
          <div className="bg-[#F5F7FA] border-r border-[#E2E8F0] p-4 space-y-2">
            <button className="w-full text-left px-4 py-2.5 btn-clay-primary text-caption font-semibold rounded-[12px]">Cài đặt thông báo</button>
            <button className="w-full text-left px-4 py-2.5 text-caption font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-white rounded-[12px] transition-colors">Bảo mật & Mật khẩu</button>
            <button className="w-full text-left px-4 py-2.5 text-caption font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-white rounded-[12px] transition-colors">Quyền riêng tư</button>
            <button className="w-full text-left px-4 py-2.5 text-caption font-semibold text-[#C62828] hover:bg-[#FEF2F2] rounded-[12px] transition-colors mt-8">Vùng nguy hiểm</button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3 p-6 md:p-8 space-y-6 bg-white">
            <h2 className="text-h3 font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3">Thông báo Email</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-body font-semibold text-[#0F172A]">Gợi ý ở ghép phù hợp mới</h4>
                  <p className="text-caption text-[#64748B]">Nhận email khi hệ thống tìm thấy người ở ghép phù hợp &gt;85%.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setMatchNotify(!matchNotify)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${matchNotify ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${matchNotify ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-body font-semibold text-[#0F172A]">Tin nhắn mới</h4>
                  <p className="text-caption text-[#64748B]">Gửi email thông báo khi có tin nhắn mới mà bạn đang ngoại tuyến.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setChatNotify(!chatNotify)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${chatNotify ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${chatNotify ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-body font-semibold text-[#0F172A]">Khuyến mãi & Tin tức</h4>
                  <p className="text-caption text-[#64748B]">Nhận ưu đãi phòng trọ từ các chủ nhà đã xác minh.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setPromoNotify(!promoNotify)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${promoNotify ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${promoNotify ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            </div>

            <h2 className="text-h3 font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 mt-8">Thông báo Đẩy</h2>
            <div className="bg-[#F5F7FA] shadow-clay-soft border border-[#E2E8F0] p-4 rounded-[12px] flex items-center justify-between">
              <div>
                <p className="text-body font-semibold text-[#0F172A]">Bật thông báo đẩy trên trình duyệt</p>
                <p className="text-caption text-[#64748B]">Cập nhật tin nhắn và lịch xem phòng ngay lập tức.</p>
              </div>
              <Button size="sm">Bật ngay</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
