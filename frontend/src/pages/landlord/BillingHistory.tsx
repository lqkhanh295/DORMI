import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi } from '../../services/api';
import { Link } from 'react-router-dom';
import { Receipt, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BillingHistory() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    landlordApi.getBilling()
      .then(res => {
        if (Array.isArray(res)) setTransactions(res);
      })
      .catch(err => console.warn('Failed to load billing history:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto bg-[#F5F7FA]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A] flex items-center gap-2">
            <Receipt className="w-8 h-8 text-[#2563EB]" />
            Lịch sử giao dịch & Hóa đơn
          </h1>
          <p className="text-body text-[#64748B]">Theo dõi toàn bộ các giao dịch gói dịch vụ và thanh toán trên hệ thống.</p>
        </div>
        <Link to="/landlord/pricing">
          <Button variant="primary">Nâng cấp gói dịch vụ</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spent Card */}
        <Card className="p-6 bg-[#0F172A] rounded-[18px] border-none text-white flex flex-col justify-between shadow-clay-soft">
          <div>
            <h3 className="text-caption font-semibold text-white/70 uppercase tracking-wider">Tổng chi tiêu dịch vụ</h3>
            <p className="text-[36px] font-bold text-white mt-2 leading-none">
              {totalSpent.toLocaleString('vi-VN')}₫
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span className="text-caption text-white/90 font-medium">
              {transactions.filter(t => t.status === 'Completed').length} giao dịch thành công
            </span>
          </div>
        </Card>

        {/* Pro Status Banner */}
        <Card className="p-6 md:col-span-2 rounded-[18px] bg-white shadow-clay-soft border-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-h3 text-[#0F172A]">Chủ trọ Xác thực & Gói Pro</h3>
            <p className="text-caption text-[#64748B] mt-1 max-w-sm">
              Tận hưởng ưu tiên hiển thị tin đăng, huy hiệu xác thực danh tính và xem chi tiết khách tiềm năng.
            </p>
          </div>
          <Link to="/landlord/pricing">
            <Button variant="secondary" className="whitespace-nowrap">Bảng giá dịch vụ</Button>
          </Link>
        </Card>
      </div>

      {/* Transaction History Table */}
      <Card className="mt-8 bg-white rounded-[18px] shadow-clay-soft overflow-hidden p-0 border-none">
        <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <h3 className="font-bold text-h3 text-[#0F172A]">Giao dịch phát sinh</h3>
          <span className="text-caption text-[#64748B] font-medium">{transactions.length} giao dịch ghi nhận</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Đang tải lịch sử giao dịch...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-[#64748B]">
            Chưa có giao dịch nào phát sinh. Hãy đăng ký gói dịch vụ để nâng cao hiệu quả tin đăng!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-[#E2E8F0]">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Ngày giao dịch</th>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Mã tham chiếu</th>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Phương thức</th>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E2E8F0]">
              {transactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-body text-[#64748B]">
                    {new Date(t.createdAt).toLocaleDateString('vi-VN')} {new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-caption font-semibold text-[#0F172A]">
                    {t.transactionRef}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body text-[#0F172A] font-medium">
                    {t.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body font-bold text-[#0F172A]">
                    {Number(t.amount).toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t.status === 'Completed' ? (
                      <span className="px-3 py-1 text-caption rounded-full bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                      </span>
                    ) : t.status === 'Pending' ? (
                      <span className="px-3 py-1 text-caption rounded-full bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A] font-semibold inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Chờ thanh toán
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-caption rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-semibold inline-flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Thất bại
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
