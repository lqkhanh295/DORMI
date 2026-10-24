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
  Flame,
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

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const paginatedTransactions = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalSpent = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Compute dynamic VietQR standard link for selected pending transaction
  const bankBin = '970422'; // MBBank
  const defaultAccNumber = '0901111001';
  const defaultAccName = 'CONG TY CO PHAN DORMI';
  const transferMemo = selectedPendingTxn ? `DORMI ${selectedPendingTxn.transactionRef}` : '';
  const paymentUrl = selectedPendingTxn ? `https://pay.payos.vn/web/${selectedPendingTxn.transactionRef}` : '';
  const qrUrl = selectedPendingTxn 
    ? `https://img.vietqr.io/image/${bankBin}-${defaultAccNumber}-compact2.png?amount=${Math.round(Number(selectedPendingTxn.amount || 0))}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(defaultAccName)}`
    : '';

  const renderServiceBadge = (desc?: string) => {
    const text = desc || '';
    if (text.includes('Gói Pro') || text.includes('Pro')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Zap className="w-3 h-3 text-blue-600" />
          <span>Gói Pro</span>
        </span>
      );
    }
    if (text.includes('Doanh Nghiệp') || text.includes('Business') || text.includes('Enterprise')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Zap className="w-3 h-3 text-purple-600" />
          <span>Gói Doanh Nghiệp</span>
        </span>
      );
    }
    if (text.includes('Đẩy tin') || text.includes('Boost')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Flame className="w-3 h-3 text-amber-600" />
          <span>Đẩy Tin Nổi Bật</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Receipt className="w-3 h-3 text-slate-500" />
        <span>Dịch Vụ Trọ</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-6xl 2xl:max-w-7xl mx-auto bg-[#F8FAFC]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <Receipt className="w-7 h-7 text-[#2563EB]" />
            <span>Lịch sử giao dịch & Hóa đơn</span>
          </h1>
          <p className="text-sm text-[#64748B]">Theo dõi toàn bộ các giao dịch gói dịch vụ và thanh toán trên hệ thống.</p>
        </div>
        <Link to="/landlord/pricing">
          <Button variant="primary">Nâng cấp gói dịch vụ</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spent Card */}
        <div className="p-6 bg-slate-900 rounded-[18px] text-white flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Tổng chi tiêu dịch vụ</h3>
            <p className="text-3xl font-black text-white mt-2 leading-none">
              {totalSpent.toLocaleString('vi-VN')}₫
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs text-slate-200 font-medium">
              {transactions.filter(t => t.status === 'Completed').length} giao dịch thành công
            </span>
          </div>
        </div>

        {/* Pro Status Banner */}
        <Card className="p-6 md:col-span-2 rounded-[18px] bg-white shadow-xs border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">Chủ trọ Xác thực & Gói Pro</h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm">
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
            {/* Mobile View: Cards (< 768px) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedTransactions.map((t: any) => (
                <div key={t.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded">
                      {t.transactionRef}
                    </span>
                    {t.status === 'Completed' ? (
                      <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Thành công
                      </span>
                    ) : t.status === 'Pending' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPendingTxn(t)}
                        className="px-2.5 py-0.5 text-xs rounded-full bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A] font-semibold inline-flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" /> Chờ thanh toán
                      </button>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-semibold inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Thất bại
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {renderServiceBadge(t.description)}
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {t.paymentMethod || 'PayOS'}
                    </span>
                  </div>

                  <div className="text-xs text-[#0F172A] font-medium">
                    {t.description || t.packageTitle || 'Gói tin đăng chủ trọ'}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-[11px] text-[#64748B]">
                      {new Date(t.createdAt).toLocaleDateString('vi-VN')} {new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-base font-black text-[#0F172A]">
                      {Number(t.amount).toLocaleString('vi-VN')}₫
                    </div>
                  </div>

                  {t.status === 'Pending' && (
                    <Button
                      size="sm"
                      variant="primary"
                      fullWidth
                      onClick={() => setSelectedPendingTxn(t)}
                      className="text-xs py-1.5 inline-flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Quét mã thanh toán ngay</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View: Full Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Ngày giao dịch</th>
                    <th className="py-3.5 px-3">Mã tham chiếu</th>
                    <th className="py-3.5 px-4">Dịch vụ đã mua</th>
                    <th className="py-3.5 px-3">Cổng TT</th>
                    <th className="py-3.5 px-3">Số tiền</th>
                    <th className="py-3.5 px-3">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginatedTransactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString('vi-VN')} {new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {t.transactionRef}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {renderServiceBadge(t.description)}
                          <span className="text-slate-700 font-medium">{t.description || t.packageTitle || 'Gói tin đăng chủ trọ'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap font-medium">
                        {t.paymentMethod || 'PayOS'}
                      </td>
                      <td className="py-3.5 px-3 font-black text-slate-900 whitespace-nowrap text-sm">
                        {Number(t.amount).toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {t.status === 'Completed' ? (
                          <span className="px-2.5 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                          </span>
                        ) : t.status === 'Pending' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPendingTxn(t)}
                            title="Bấm để quét mã thanh toán ngay"
                            className="px-2.5 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:scale-105"
                          >
                            <Clock className="w-3.5 h-3.5" /> Chờ thanh toán
                          </button>
                        ) : (
                          <span className="px-2.5 py-0.5 text-xs rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold inline-flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Thất bại
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
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
            </div>

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
