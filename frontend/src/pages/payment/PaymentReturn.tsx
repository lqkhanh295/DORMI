import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Home, 
  FileText, 
  ShieldCheck, 
  CreditCard,
  RotateCcw
} from 'lucide-react';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const statusParam = searchParams.get('status');
  const cancelParam = searchParams.get('cancel');
  const codeParam = searchParams.get('code');
  const orderCode = searchParams.get('orderCode') || searchParams.get('order_code');
  const leaseId = searchParams.get('leaseId');
  const type = searchParams.get('type') || 'deposit';
  const amountParam = searchParams.get('amount');

  const [paymentState, setPaymentState] = useState<'success' | 'cancelled' | 'pending'>('pending');

  useEffect(() => {
    if (cancelParam === 'true' || statusParam?.toUpperCase() === 'CANCELLED') {
      setPaymentState('cancelled');
    } else if (statusParam?.toUpperCase() === 'PAID' || codeParam === '00' || (orderCode && cancelParam !== 'true')) {
      setPaymentState('success');
    } else {
      setPaymentState('pending');
    }
  }, [statusParam, cancelParam, codeParam, orderCode]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 sm:p-8 space-y-6">
        {/* Status Icon & Header */}
        <div className="text-center space-y-3">
          {paymentState === 'success' && (
            <div className="inline-flex p-3 bg-emerald-50 rounded-full text-emerald-600">
              <CheckCircle2 className="w-14 h-14" />
            </div>
          )}
          {paymentState === 'cancelled' && (
            <div className="inline-flex p-3 bg-amber-50 rounded-full text-amber-600">
              <XCircle className="w-14 h-14" />
            </div>
          )}
          {paymentState === 'pending' && (
            <div className="inline-flex p-3 bg-blue-50 rounded-full text-blue-600">
              <Clock className="w-14 h-14 animate-pulse" />
            </div>
          )}

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              {paymentState === 'success' && 'Thanh toán thành công!'}
              {paymentState === 'cancelled' && 'Giao dịch đã bị huỷ'}
              {paymentState === 'pending' && 'Đang xử lý kết quả...'}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              {paymentState === 'success' && 'Giao dịch đã được xác nhận thành công.'}
              {paymentState === 'cancelled' && 'Bạn đã hủy giao dịch hoặc chưa hoàn tất chuyển khoản.'}
              {paymentState === 'pending' && 'Đang kiểm tra kết quả giao dịch từ ngân hàng.'}
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Cổng thanh toán
            </span>
            <span className="font-semibold text-[#0F172A]">PayOS VietQR</span>
          </div>

          {orderCode && (
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Mã đơn hàng</span>
              <span className="font-mono font-bold text-[#0F172A]">{orderCode}</span>
            </div>
          )}

          {amountParam && (
            <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Số tiền thanh toán</span>
              <span className="font-bold text-[#00153D] text-sm">{Number(amountParam).toLocaleString('vi-VN')} đ</span>
            </div>
          )}
          <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
            <span className="text-[#64748B]">Loại giao dịch</span>
            <span className="font-semibold text-[#0F172A]">
              {type === 'deposit' ? 'Đặt cọc giữ phòng' : 'Gói dịch vụ Dormi'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-[#64748B]">Trạng thái giao dịch</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
              paymentState === 'success' ? 'bg-emerald-100 text-emerald-800' :
              paymentState === 'cancelled' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {paymentState === 'success' && 'Thành công'}
              {paymentState === 'cancelled' && 'Đã huỷ'}
              {paymentState === 'pending' && 'Đang xử lý'}
            </span>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-[#00153D]">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-[#334155]">
            Giao dịch được bảo mật và xử lý an toàn qua cổng VietQR.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {paymentState === 'cancelled' ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Thử thanh toán lại
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (type === 'package' || type === 'subscription' || type === 'service') {
                  navigate('/landlord/billing');
                } else {
                  navigate(leaseId ? `/tenant/leases` : '/tenant/leases');
                }
              }}
              className="flex-1 py-2.5 px-4 bg-[#00153D] hover:bg-[#002266] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              {type === 'package' || type === 'subscription' || type === 'service' ? 'Xem lịch sử giao dịch' : 'Xem hợp đồng thuê phòng'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/')}
            className="py-2.5 px-4 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#CBD5E1] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
