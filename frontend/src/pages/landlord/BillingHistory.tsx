import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function BillingHistory() {
  // ponytail: BillingHistory using Deep Navy Clay balance card and Level 3 Flat transaction table
  return (
    <div className="space-y-6 max-w-5xl mx-auto bg-[#F5F7FA]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Lịch sử nạp & Thanh toán</h1>
          <p className="text-body text-[#64748B]">Quản lý số dư tài khoản và xuất hóa đơn dịch vụ.</p>
        </div>
        <Button>Nạp tiền vào tài khoản</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card - Level 1 Deep Navy Clay */}
        <Card className="p-6 btn-clay-primary rounded-[18px] border-none flex flex-col justify-between">
          <div>
            <h3 className="text-caption font-semibold text-white/80 uppercase tracking-wider">Số dư khả dụng</h3>
            <p className="text-[36px] font-bold text-white mt-2 leading-none">1.500.000₫</p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16803C]"></span>
            <span className="text-caption text-white/90 font-medium">Tự động gia hạn 2 tin đăng</span>
          </div>
        </Card>

        {/* Upgrade Banner - Level 2 Soft Clay */}
        <Card className="p-6 md:col-span-2 rounded-[18px] bg-white shadow-clay-soft border-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-h3 text-[#0F172A]">Nâng cấp Chủ nhà Pro</h3>
            <p className="text-caption text-[#64748B] mt-1 max-w-sm">Tận hưởng 10 lượt đẩy tin ưu tiên, huy hiệu xác thực và báo cáo phân tích phễu chuyển đổi.</p>
          </div>
          <Button variant="secondary" className="whitespace-nowrap">Xem bảng giá</Button>
        </Card>
      </div>

      {/* Transaction History Table */}
      <Card className="mt-8 bg-white rounded-[18px] shadow-clay-soft overflow-hidden p-0 border-none">
        <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F5F7FA]">
          <h3 className="font-bold text-h3 text-[#0F172A]">Giao dịch gần đây</h3>
          <button className="text-caption font-semibold text-[#00153D] hover:underline">Tải hóa đơn (CSV)</button>
        </div>
        <table className="min-w-full divide-y divide-[#E2E8F0]">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Ngày giao dịch</th>
              <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Nội dung</th>
              <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Số tiền</th>
              <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3.5 text-right text-caption font-semibold text-[#64748B] uppercase tracking-wider">Hóa đơn</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E2E8F0]">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-body text-[#64748B]">28/06/2026</td>
              <td className="px-6 py-4 whitespace-nowrap text-body font-semibold text-[#0F172A]">Đẩy tin ưu tiên (Studio D3)</td>
              <td className="px-6 py-4 whitespace-nowrap text-body font-bold text-[#C62828]">- 50.000₫</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 text-caption rounded-full bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] font-semibold">Hoàn tất</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-caption font-semibold">
                <Button size="sm" variant="ghost">PDF</Button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-body text-[#64748B]">25/06/2026</td>
              <td className="px-6 py-4 whitespace-nowrap text-body font-semibold text-[#0F172A]">Nạp tiền MoMo</td>
              <td className="px-6 py-4 whitespace-nowrap text-body font-bold text-[#16803C]">+ 1.000.000₫</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 text-caption rounded-full bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] font-semibold">Hoàn tất</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-caption font-semibold">
                <Button size="sm" variant="ghost">PDF</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
