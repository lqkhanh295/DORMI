import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { adminApi, type PaymentTransactionResponse } from '../../services/api';
import { 
  Receipt, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CreditCard, 
  TrendingUp, 
  RefreshCw,
  Wallet
} from 'lucide-react';
import { PageMotion } from '../../components/common/Motion';
import { toast } from 'sonner';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<PaymentTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải lịch sử giao dịch.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = 
        (t.transactionRef?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.userFullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchMethod = methodFilter === 'ALL' || t.paymentMethod === methodFilter;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [transactions, searchTerm, statusFilter, methodFilter]);

  const metrics = useMemo(() => {
    const completed = transactions.filter(t => t.status === 'Completed');
    const pending = transactions.filter(t => t.status === 'Pending');
    const totalRev = completed.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const avgAmount = completed.length > 0 ? Math.round(totalRev / completed.length) : 0;

    return {
      totalRevenue: totalRev,
      completedCount: completed.length,
      pendingCount: pending.length,
      avgAmount
    };
  }, [transactions]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Thành công</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ thanh toán</span>
          </span>
        );
      case 'Failed':
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Thất bại</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  const renderMethodBadge = (method: string) => {
    let colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
    if (method === 'PayOS') colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (method === 'MoMo') colorClass = 'bg-pink-50 text-pink-700 border-pink-200';
    if (method === 'VNPay') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${colorClass}`}>
        <CreditCard className="w-3 h-3" />
        <span>{method || 'Cổng TT'}</span>
      </span>
    );
  };

  return (
    <PageMotion className="space-y-6 pb-8 bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quản trị Tài chính & Giao dịch</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch sử Giao dịch Toàn hệ thống</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi dữ liệu thanh toán gói dịch vụ, nâng cấp tin VIP và giao dịch cọc trực tuyến.
          </p>
        </div>
        
        <Button 
          variant="secondary" 
          onClick={fetchTransactions} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng doanh thu thực</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {metrics.totalRevenue.toLocaleString('vi-VN')} đ
          </p>
          <p className="text-xs text-slate-400 mt-1">Đã quyết toán thành công</p>
        </Card>

        <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giao dịch thành công</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {metrics.completedCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">Giao dịch hoàn tất</p>
        </Card>

        <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang chờ xử lý</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">
            {metrics.pendingCount}
          </p>
          <p className="text-xs text-slate-400 mt-1">Đang chờ thanh toán</p>
        </Card>

        <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá trị trung bình</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {metrics.avgAmount.toLocaleString('vi-VN')} đ
          </p>
          <p className="text-xs text-slate-400 mt-1">Mỗi giao dịch thành công</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input 
              placeholder="Tìm theo mã giao dịch, email khách hàng, mô tả..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-600"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Completed">Thành công (Completed)</option>
              <option value="Pending">Chờ thanh toán (Pending)</option>
              <option value="Failed">Thất bại (Failed)</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-blue-600"
            >
              <option value="ALL">Tất cả cổng</option>
              <option value="PayOS">PayOS (VietQR)</option>
              <option value="VNPay">VNPay</option>
              <option value="MoMo">MoMo</option>
              <option value="BankTransfer">Chuyển khoản</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#00153D]" />
            <span>Danh sách giao dịch</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredTransactions.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>Đang tải danh sách giao dịch...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-slate-800">Không tìm thấy giao dịch nào</p>
            <p className="text-xs text-slate-500 mt-1">
              Chưa có giao dịch thanh toán nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Mã giao dịch</th>
                  <th className="py-3 px-4">Người thanh toán</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Cổng thanh toán</th>
                  <th className="py-3 px-4">Nội dung</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Thời gian tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {tx.transactionRef || tx.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{tx.userFullName || 'Chưa đặt tên'}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{tx.userEmail || tx.userId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      {Number(tx.amount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-4">
                      {renderMethodBadge(tx.paymentMethod)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={tx.description}>
                      {tx.description || 'Thanh toán dịch vụ'}
                    </td>
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(tx.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(tx.createdAt).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageMotion>
  );
}
