import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi } from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  Receipt, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ExternalLink, 
  Loader2, 
  Zap, 
  X,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function BillingHistory() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPendingTxn, setSelectedPendingTxn] = useState<any | null>(null);
  const [verifying, setVerifying] = useState(false);
  const pageSize = 5;

  const loadBilling = () => {
    setLoading(true);
    landlordApi.getBilling()
      .then(res => {
        if (Array.isArray(res)) setTransactions(res);
      })
      .catch(err => console.warn('Failed to load billing history:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBilling();
  }, []);

  // Escape key to close payment modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPendingTxn(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live polling when modal is open
  useEffect(() => {
    if (!selectedPendingTxn?.transactionRef) return;

    const interval = setInterval(async () => {
      try {
        const statusRes = await landlordApi.checkPaymentStatus(selectedPendingTxn.transactionRef);
        if (statusRes.status === 'Completed') {
          toast.success('Thanh toán thành công! Dịch vụ đã được kích hoạt.');
          setSelectedPendingTxn(null);
          loadBilling();
        }
      } catch {
        // Silent polling error
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedPendingTxn]);

  const handleVerifyPayment = async () => {
    if (!selectedPendingTxn?.transactionRef) return;
    try {
      setVerifying(true);
      const statusRes = await landlordApi.checkPaymentStatus(selectedPendingTxn.transactionRef);
      if (statusRes.status === 'Completed') {
        toast.success('Thanh toán thành công! Dịch vụ đã được kích hoạt.');
        setSelectedPendingTxn(null);
        loadBilling();
        return;
      }

      const verifyRes = await landlordApi.verifyPayment(selectedPendingTxn.transactionRef, 'PayOS');
      if (verifyRes.status === 'Completed') {
        toast.success('Thanh toán thành công! Dịch vụ đã được kích hoạt.');
        setSelectedPendingTxn(null);
        loadBilling();
        return;
      }

      toast.info('Chưa nhận được xác nhận thanh toán. Vui lòng thử lại sau vài giây hoặc kiểm tra biến động số dư.');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xác thực thanh toán.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!selectedPendingTxn?.transactionRef) return;
    try {
      setVerifying(true);
      await landlordApi.simulateGatewayPayment(selectedPendingTxn.transactionRef);
      toast.success('Mô phỏng thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
      setSelectedPendingTxn(null);
      loadBilling();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể mô phỏng thanh toán.');
    } finally {
      setVerifying(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const paginatedTransactions = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalSpent = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Compute dynamic QR and payment link for selected pending transaction
  const paymentUrl = selectedPendingTxn ? `https://pay.payos.vn/web/${selectedPendingTxn.transactionRef}` : '';
  const qrUrl = selectedPendingTxn ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}` : '';

  return (
    <div className="space-y-6 max-w-5xl mx-auto bg-[#F8FAFC]">
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
            <h3 className="text-xs font-medium text-white/80 mb-1">Tổng chi tiêu dịch vụ</h3>
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
          <>
          <table className="min-w-full divide-y divide-[#E2E8F0]">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Ngày giao dịch</th>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Mã tham chiếu</th>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Dịch vụ đã mua</th>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Phương thức</th>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3.5 text-left text-caption font-semibold text-[#64748B] uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3.5 text-right text-caption font-semibold text-[#64748B] uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E2E8F0]">
              {paginatedTransactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-body text-[#64748B]">
                    {new Date(t.createdAt).toLocaleDateString('vi-VN')} {new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-caption font-semibold text-[#0F172A]">
                    {t.transactionRef}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body text-[#0F172A] font-medium">
                    {t.description || t.packageTitle || 'Gói tin đăng chủ trọ'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body text-[#64748B] font-medium">
                    {t.paymentMethod || 'PayOS'}
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
                      <button
                        type="button"
                        onClick={() => setSelectedPendingTxn(t)}
                        title="Bấm để quét mã thanh toán ngay"
                        className="px-3 py-1 text-caption rounded-full bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A] hover:bg-[#FEF08A] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:scale-105"
                      >
                        <Clock className="w-3.5 h-3.5" /> Chờ thanh toán
                      </button>
                    ) : (
                      <span className="px-3 py-1 text-caption rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-semibold inline-flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Thất bại
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {t.status === 'Pending' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setSelectedPendingTxn(t)}
                        className="text-xs py-1 px-3 inline-flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Thanh toán</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, transactions.length)} trong tổng số {transactions.length} giao dịch
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                <span className="text-xs font-bold text-slate-700 px-1">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </Card>

      {/* Payment VietQR Modal for Pending Transactions */}
      {selectedPendingTxn && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedPendingTxn(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-5 shadow-2xl relative space-y-3.5 border border-slate-100 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPendingTxn(null)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 pt-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Thanh toán đơn hàng</span>
              </h3>
              <p className="text-xs text-slate-500">
                Mã tham chiếu: <span className="font-mono font-bold text-slate-800">{selectedPendingTxn.transactionRef}</span>
              </p>
              <p className="text-xs text-slate-600 font-medium">
                Dịch vụ: {selectedPendingTxn.description || selectedPendingTxn.packageTitle || 'Gói dịch vụ Dormi'}
              </p>
              <p className="text-sm font-black text-emerald-700">
                Số tiền: {Number(selectedPendingTxn.amount).toLocaleString('vi-VN')}₫
              </p>
            </div>

            <div className="flex justify-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <img 
                src={qrUrl} 
                alt="QR Code" 
                className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg shadow-xs" 
              />
            </div>

            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở cổng thanh toán PayOS (VietQR / Chuyển khoản)</span>
              </a>
            )}

            {/* Live Auto-detection Banner */}
            <div className="flex items-center justify-center gap-2 text-[11px] sm:text-[12px] font-medium text-blue-700 bg-blue-50/80 py-2 px-3 rounded-xl border border-blue-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
              <span>Đang tự động chờ tín hiệu chuyển khoản từ ngân hàng...</span>
            </div>

            <div className="space-y-2 text-center text-xs">
              <Button
                variant="primary"
                fullWidth
                disabled={verifying}
                onClick={handleVerifyPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5"
              >
                {verifying ? 'Đang kiểm tra...' : 'Xác nhận đã chuyển khoản thành công'}
              </Button>

              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={verifying}
                  className="w-full py-1 text-[11px] text-slate-500 hover:text-slate-800 underline transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3 inline mr-1 text-amber-500" />
                  <span>Mô phỏng thanh toán thành công (Dành cho Dev test)</span>
                </button>
              )}

              <p className="text-[11px] text-[#94A3B8]">
                Hệ thống tự động kích hoạt ngay sau khi tiền vào tài khoản ngân hàng.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
