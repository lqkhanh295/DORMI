import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi } from '../../services/api';
import { toast } from 'sonner';
import { X, CreditCard, ShieldCheck, Check } from 'lucide-react';

export default function PricingCheckout() {
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('VNPay');
  const [verifying, setVerifying] = useState(false);
  const [initiating, setInitiating] = useState(false);

  const handleUpgrade = async (plan: string) => {
    try {
      setInitiating(true);
      const res = await landlordApi.checkout(plan);
      setCheckoutData(res);
      toast.info(`Đã khởi tạo đơn hàng gói ${plan}. Vui lòng quét mã để thanh toán.`);
    } catch (err: any) {
      toast.error(err?.message || 'Khởi tạo thanh toán thất bại.');
    } finally {
      setInitiating(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!checkoutData?.transactionRef) return;
    try {
      setVerifying(true);
      const statusRes = await landlordApi.checkPaymentStatus(checkoutData.transactionRef);
      if (statusRes.status === 'Completed') {
        toast.success('Thanh toán thành công! Gói dịch vụ của bạn đã được kích hoạt.');
        setCheckoutData(null);
        return;
      }

      const res = await landlordApi.simulateGatewayPayment(checkoutData.transactionRef);
      toast.success(res.message || 'Thanh toán thành công! Gói dịch vụ của bạn đã được kích hoạt.');
      setCheckoutData(null);
    } catch (err: any) {
      toast.error(err?.message || 'Xác nhận thanh toán chưa thành công. Vui lòng kiểm tra lại giao dịch.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 bg-[#F5F7FA]">
      <div className="text-center space-y-3">
        <h1 className="text-h2 font-bold text-[#0F172A] flex items-center justify-center gap-2">
          <ShieldCheck className="w-8 h-8 text-[#2563EB]" />
          Gói dịch vụ Chủ trọ Dormi
        </h1>
        <p className="text-body text-[#64748B] max-w-xl mx-auto">
          Tối ưu hiệu quả tiếp cận khách thuê, nhận huy hiệu xác thực và phân tích khách tiềm năng chuyên sâu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 flex flex-col justify-between space-y-6 border-none">
          <div className="space-y-4">
            <h3 className="text-h3 font-bold text-[#0F172A]">Gói Cơ Bản</h3>
            <p className="text-caption text-[#64748B]">Cho chủ trọ có 1 - 2 phòng trọ nhỏ.</p>
            <div className="pt-2">
              <span className="text-[36px] font-bold text-[#0F172A]">Miễn phí</span>
            </div>
            <ul className="space-y-2 text-caption text-[#64748B] pt-4 border-t border-[#E2E8F0]">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Đăng tối đa 2 tin phòng</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Nhận tin nhắn từ người thuê</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Xác minh giấy tờ cơ bản</span></li>
            </ul>
          </div>
          <Button variant="secondary" fullWidth disabled>Đang sử dụng</Button>
        </Card>

        <Card className="bg-white rounded-[18px] shadow-clay-primary p-8 flex flex-col justify-between space-y-6 border-2 border-[#2563EB] relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-caption font-bold px-4 py-1 rounded-full shadow-sm">
            KHUYÊN DÙNG
          </div>
          <div className="space-y-4 pt-2">
            <h3 className="text-h3 font-bold text-[#0F172A]">Gói Chuyên Nghiệp</h3>
            <p className="text-caption text-[#64748B]">Tối ưu hiển thị và phân tích lead.</p>
            <div className="pt-2">
              <span className="text-[36px] font-bold text-[#2563EB]">199.000₫</span>
              <span className="text-caption text-[#64748B]"> / năm</span>
            </div>
            <ul className="space-y-2 text-caption text-[#0F172A] font-semibold pt-4 border-t border-[#E2E8F0]">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2563EB] shrink-0" /><span>Đăng tối đa 10 tin phòng</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2563EB] shrink-0" /><span>Huy hiệu Chủ trọ xác thực uy tín</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2563EB] shrink-0" /><span>Ưu tiên hiển thị top kết quả tìm kiếm</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#2563EB] shrink-0" /><span>Báo cáo phễu chuyển đổi & khách tiềm năng</span></li>
            </ul>
          </div>
          <Button 
            variant="primary" 
            fullWidth 
            disabled={initiating}
            onClick={() => handleUpgrade('Pro')}
          >
            {initiating ? 'Đang tạo đơn...' : 'Nâng cấp gói Pro (199.000₫)'}
          </Button>
        </Card>

        <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 flex flex-col justify-between space-y-6 border-none">
          <div className="space-y-4">
            <h3 className="text-h3 font-bold text-[#0F172A]">Gói Doanh Nghiệp</h3>
            <p className="text-caption text-[#64748B]">Dành cho chuỗi căn hộ mini & KTX.</p>
            <div className="pt-2">
              <span className="text-[36px] font-bold text-[#0F172A]">499.000₫</span>
              <span className="text-caption text-[#64748B]"> / năm</span>
            </div>
            <ul className="space-y-2 text-caption text-[#64748B] pt-4 border-t border-[#E2E8F0]">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Không giới hạn số tin đăng</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Đẩy tin tự động hàng tuần</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Khám phá kho dữ liệu người tìm phòng</span></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Hỗ trợ CSKH 24/7 riêng biệt</span></li>
            </ul>
          </div>
          <Button 
            variant="secondary" 
            fullWidth 
            disabled={initiating}
            onClick={() => handleUpgrade('Enterprise')}
          >
            {initiating ? 'Đang tạo đơn...' : 'Nâng cấp Doanh nghiệp (499.000₫)'}
          </Button>
        </Card>
      </div>

      {/* Interactive Payment QR Modal */}
      {checkoutData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setCheckoutData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2563EB]" />
                Thanh toán gói {checkoutData.planName}
              </h3>
              <p className="text-xs text-slate-500">Mã giao dịch: <span className="font-mono font-bold text-slate-800">{checkoutData.transactionRef}</span></p>
            </div>

            <div className="flex justify-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <img 
                src={checkoutData.qrUrl} 
                alt="QR Code" 
                className="w-48 h-48 object-contain rounded-lg shadow-sm" 
              />
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-bold text-slate-900 text-sm">{Number(checkoutData.amount).toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nội dung chuyển khoản:</span>
                <span className="font-mono font-bold text-[#2563EB]">{checkoutData.transactionRef}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phương thức thanh toán:</label>
              <select 
                value={paymentMethod} 
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="VNPay">VNPay QR / Thẻ nội địa</option>
                <option value="MoMo">Ví điện tử MoMo</option>
                <option value="BankTransfer">Chuyển khoản Ngân hàng (VietQR)</option>
              </select>
            </div>

            {checkoutData.paymentUrl && (
              <a
                href={checkoutData.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs font-medium text-[#2563EB] hover:underline"
              >
                Mở cổng thanh toán VNPay Sandbox trực tiếp &rarr;
              </a>
            )}

            <Button 
              variant="primary" 
              fullWidth 
              disabled={verifying}
              onClick={handleVerifyPayment}
              className="py-3 font-bold"
            >
              {verifying ? 'Đang xác thực giao dịch...' : 'Xác nhận đã thanh toán'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
