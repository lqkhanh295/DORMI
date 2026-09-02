import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function LeadAnalytics() {
  // ponytail: LeadAnalytics using Level 2 Soft Clay analytics cards and Level 3 Flat tables
  return (
    <div className="space-y-6 bg-[#F5F7FA]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Phân tích hiệu quả</h1>
          <p className="text-body text-[#64748B]">Theo dõi hiệu suất của các tin đăng qua từng giai đoạn chuyển đổi.</p>
        </div>
        <select className="bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] text-[#0F172A] py-2 px-4 rounded-[12px] focus:outline-none focus:ring-1 focus:ring-[#00153D] font-semibold text-body min-h-[44px]">
          <option>Tất cả phòng</option>
          <option>Studio Quận 3</option>
          <option>Căn hộ 2PN Q7</option>
        </select>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 bg-white rounded-[18px] shadow-clay-soft border-none">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-h3 font-bold text-[#0F172A]">Lượt xem & Tương tác (30 Ngày)</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-caption font-semibold text-[#64748B]"><div className="w-3 h-3 bg-[#00153D] rounded-full"></div> Lượt xem</span>
              <span className="flex items-center gap-1.5 text-caption font-semibold text-[#64748B]"><div className="w-3 h-3 bg-[#073372] rounded-full"></div> Đã lưu</span>
            </div>
          </div>
          {/* Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-[#E2E8F0] pb-2 pl-2">
            {[40, 60, 30, 80, 50, 90, 45, 70, 35, 85].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex justify-center items-end gap-1">
                  <div className="w-full max-w-[10px] bg-[#073372] rounded-t-sm" style={{height: `${val * 0.3}%`}}></div>
                  <div className="w-full max-w-[10px] bg-[#00153D] rounded-t-sm" style={{height: `${val}%`}}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-caption text-[#64748B] mt-3 px-2">
            <span>1 Thg 5</span>
            <span>15 Thg 5</span>
            <span>30 Thg 5</span>
          </div>
        </Card>

        {/* Funnel */}
        <Card className="p-6 flex flex-col justify-between bg-white rounded-[18px] shadow-clay-soft border-none">
          <div>
            <h3 className="text-h3 font-bold text-[#0F172A] mb-6">Phễu chuyển đổi</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-caption font-semibold text-[#64748B]">Lượt xem tin đăng</span>
                  <span className="text-h3 font-bold text-[#0F172A]">1,240</span>
                </div>
                <div className="w-full h-3 bg-[#F5F7FA] rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div className="bg-[#00153D] h-full rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-caption font-semibold text-[#64748B]">Lượt thích (Lưu)</span>
                  <span className="text-h3 font-bold text-[#0F172A]">210</span>
                </div>
                <div className="w-full h-3 bg-[#F5F7FA] rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div className="bg-[#073372] h-full rounded-full" style={{width: '17%'}}></div>
                </div>
                <p className="text-[11px] text-[#64748B] mt-1 text-right font-medium">Tỷ lệ chuyển đổi 17%</p>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-caption font-semibold text-[#64748B]">Liên hệ / Chat</span>
                  <span className="text-h3 font-bold text-[#0F172A]">42</span>
                </div>
                <div className="w-full h-3 bg-[#F5F7FA] rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div className="bg-[#16803C] h-full rounded-full" style={{width: '3.3%'}}></div>
                </div>
                <p className="text-[11px] text-[#64748B] mt-1 text-right font-medium">Tỷ lệ chuyển đổi 3.3%</p>
              </div>
            </div>
          </div>
          <Button variant="secondary" className="mt-8 w-full">Xuất dữ liệu</Button>
        </Card>
      </div>
      
      <h3 className="text-h2 font-bold text-[#0F172A] mt-8 mb-4">Các phòng hiệu quả nhất</h3>
      <div className="bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
        <table className="min-w-full divide-y divide-[#E2E8F0]">
          <thead className="bg-[#F5F7FA]">
            <tr>
              <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Phòng</th>
              <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Lượt xem</th>
              <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Liên hệ</th>
              <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E2E8F0]">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 bg-[#EEF2F6] rounded-[10px] overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=100&q=80" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-4">
                    <div className="text-body font-semibold text-[#0F172A]">Studio Cao Cấp</div>
                    <div className="text-caption text-[#64748B]">Quận 3</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 inline-flex text-caption font-bold rounded-full bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7]">Còn trống</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-body text-[#0F172A] font-semibold">842</td>
              <td className="px-6 py-4 whitespace-nowrap text-body text-[#0F172A] font-semibold">28</td>
              <td className="px-6 py-4 whitespace-nowrap text-caption font-semibold">
                <Button size="sm" variant="ghost" className="text-[#00153D]">Đẩy tin</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
