import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi, roomsApi } from '../../services/api';
import { toast } from 'sonner';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Flame, 
  Building2, 
  Zap
} from 'lucide-react';

export default function PricingCheckout() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'plans' | 'boosts'>('plans');
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [initiating, setInitiating] = useState(false);

  // Boost tab state
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBoostType, setSelectedBoostType] = useState<'24h' | '3days' | '7days'>('3days');
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'boost' || tabParam === 'boosts') {
      setActiveTab('boosts');
    }
    const roomParam = searchParams.get('roomId');
    if (roomParam) {
      setSelectedRoomId(roomParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'boosts') {
      setLoadingRooms(true);
      roomsApi.getRooms({ page: 1, pageSize: 50 })
        .then((res: any) => {
          const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
          setRooms(list);
          const roomParam = searchParams.get('roomId');
          if (roomParam && list.some((r: any) => r.id === roomParam)) {
            setSelectedRoomId(roomParam);
          } else if (list.length > 0 && !selectedRoomId) {
            setSelectedRoomId(list[0].id);
          }
        })
        .catch(err => console.warn('Failed to load rooms for boost:', err))
        .finally(() => setLoadingRooms(false));
    }
  }, [activeTab, searchParams]);

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

  const handleBuyBoost = async () => {
    if (!selectedRoomId) {
      toast.error('Vui lòng chọn phòng trọ muốn đẩy tin.');
      return;
    }
    try {
      setInitiating(true);
      const res = await landlordApi.boostRoom(selectedRoomId, {
        boostType: selectedBoostType,
        paymentMethod: 'VNPay'
      });
      setCheckoutData(res);
      toast.info(`Đã khởi tạo đơn hàng đẩy tin ${selectedBoostType}. Vui lòng quét mã để kích hoạt.`);
    } catch (err: any) {
      toast.error(err?.message || 'Khởi tạo đẩy tin thất bại.');
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
        toast.success('Thanh toán thành công! Dịch vụ đã được kích hoạt.');
        setCheckoutData(null);
        return;
      }

      if (import.meta.env.DEV) {
        const res = await landlordApi.simulateGatewayPayment(checkoutData.transactionRef);
        toast.success(res.message || 'Thanh toán mô phỏng (DEV) thành công! Dịch vụ đã được kích hoạt.');
        setCheckoutData(null);
      } else {
        toast.info('Hệ thống đang chờ tín hiệu thanh toán từ cổng ngân hàng. Vui lòng hoàn tất quét mã QR.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Xác nhận thanh toán chưa thành công. Vui lòng kiểm tra lại giao dịch.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 bg-[#F5F7FA] pb-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          <ShieldCheck className="w-3.5 h-3.5" /> Dịch vụ Bổ Trợ Chủ Trọ
        </div>
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
          Nâng cấp Gói Hội viên & Đẩy tin Nổi bật
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
          Tối ưu hóa phễu tiếp cận khách thuê, khẳng định uy tín với huy hiệu bảo chứng và tiếp cận hàng ngàn khách thuê tiềm năng mỗi ngày.
        </p>

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm mt-3">
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] ${
              activeTab === 'plans' 
                ? 'bg-[#00153D] text-white shadow-sm' 
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Gói Hội Viên Chủ Trọ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('boosts')}
            className={`inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] ${
              activeTab === 'boosts' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Đẩy Tin Nổi Bật (Boosts)
          </button>
        </div>
      </div>

      {/* Tab 1: Subscription Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Free Tier */}
          <Card className="bg-white rounded-2xl shadow-clay-soft p-7 flex flex-col justify-between space-y-6 border border-[#E2E8F0]">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0F172A]">Gói Miễn Phí (Free)</h3>
              <p className="text-xs text-[#64748B]">Dành cho chủ trọ cá nhân có 1 - 2 phòng trọ nhỏ.</p>
              <div className="pt-2">
                <span className="text-3xl font-black text-[#0F172A]">0₫</span>
                <span className="text-xs text-[#64748B]"> / tháng</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#64748B] pt-4 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Đăng tối đa 2 tin phòng hoạt động</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Nhận tin nhắn & hẹn xem phòng</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Tiếp nhận hồ sơ ứng tuyển cơ bản</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Ký hợp đồng thuê điện tử</span></li>
              </ul>
            </div>
            <Button variant="secondary" fullWidth disabled className="text-xs font-bold">Gói mặc định</Button>
          </Card>

          {/* Pro Tier */}
          <Card className="bg-white rounded-2xl shadow-clay-primary p-7 flex flex-col justify-between space-y-6 border-2 border-blue-600 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-sm">
              Khuyên Dùng
            </div>
            <div className="space-y-4 pt-1">
              <h3 className="text-lg font-bold text-[#0F172A]">Gói Chuyên Nghiệp (Pro)</h3>
              <p className="text-xs text-[#64748B]">Tối ưu hiển thị, vận hành chuyên nghiệp & phân tích phễu.</p>
              <div className="pt-2">
                <span className="text-3xl font-black text-blue-600">299.000₫</span>
                <span className="text-xs text-[#64748B]"> / tháng</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#0F172A] font-semibold pt-4 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Đăng tối đa 15 tin phòng hoạt động</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Huy hiệu Chủ trọ xác thực uy tín (Trust Badge)</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Báo cáo phễu chuyển đổi 6 bước CRM</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Tặng 1 lượt Đẩy tin nổi bật mỗi tháng</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Khám phá dữ liệu người tìm phòng (Discovery)</span></li>
              </ul>
            </div>
            <Button 
              variant="primary" 
              fullWidth 
              disabled={initiating}
              onClick={() => handleUpgrade('Pro')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              {initiating ? 'Đang tạo đơn...' : 'Nâng cấp Gói Pro (299.000₫)'}
            </Button>
          </Card>

          {/* Business Tier */}
          <Card className="bg-white rounded-2xl shadow-clay-soft p-7 flex flex-col justify-between space-y-6 border border-[#E2E8F0]">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0F172A]">Gói Doanh Nghiệp (Business)</h3>
              <p className="text-xs text-[#64748B]">Dành cho chuỗi căn hộ dịch vụ, KTX & đơn vị quản lý lớn.</p>
              <div className="pt-2">
                <span className="text-3xl font-black text-[#0F172A]">799.000₫</span>
                <span className="text-xs text-[#64748B]"> / tháng</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#64748B] pt-4 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Không giới hạn số lượng tin đăng</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Tặng 5 lượt Đẩy tin nổi bật mỗi tháng</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Phân quyền quản lý nhiều nhân viên (Staff)</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Hỗ trợ CSKH 24/7 & chuyên viên tư vấn riêng</span></li>
              </ul>
            </div>
            <Button 
              variant="secondary" 
              fullWidth 
              disabled={initiating}
              onClick={() => handleUpgrade('Business')}
              className="font-bold text-xs"
            >
              {initiating ? 'Đang tạo đơn...' : 'Nâng cấp Doanh nghiệp (799.000₫)'}
            </Button>
          </Card>
        </div>
      )}

      {/* Tab 2: Listing Boosts */}
      {activeTab === 'boosts' && (
        <div className="bg-white rounded-2xl shadow-clay-soft border border-[#E2E8F0] p-6 md:p-8 space-y-6">
          <div className="border-b border-[#F1F5F9] pb-4">
            <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Đẩy tin phòng lên đầu trang kết quả tìm kiếm
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              Tin đăng được gắn nhãn "Nổi bật", xếp ưu tiên lên đầu trang tìm kiếm và tăng gấp 3 - 5 lần lượt xem từ khách thuê tiềm năng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Step 1: Select Room */}
            <div className="space-y-3">
              <label className="font-bold text-xs text-[#0F172A] block">
                Bước 1: Chọn phòng trọ cần đẩy tin:
              </label>

              {loadingRooms ? (
                <div className="p-6 text-center text-xs text-[#64748B]">Đang tải danh sách phòng...</div>
              ) : rooms.length === 0 ? (
                <div className="p-6 bg-[#F8FAFC] rounded-xl text-center text-xs text-[#64748B] border border-dashed border-[#CBD5E1]">
                  Bạn chưa có phòng đăng nào. Vui lòng tạo phòng trọ trước.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {rooms.map(r => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoomId(r.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99] ${
                        selectedRoomId === r.id
                          ? 'border-amber-500 bg-amber-50/60 shadow-sm ring-1 ring-amber-500'
                          : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {r.images?.[0]?.imageUrl ? (
                          <img src={r.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 m-auto text-slate-400 mt-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-[#0F172A] truncate">{r.title}</p>
                        <p className="text-[11px] text-[#64748B] truncate">{r.address}</p>
                        <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                          {Number(r.price).toLocaleString('vi-VN')} đ/tháng
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Choose Boost Plan */}
            <div className="space-y-4">
              <label className="font-bold text-xs text-[#0F172A] block">
                Bước 2: Chọn thời hạn đẩy tin:
              </label>

              <div className="space-y-2.5">
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99] ${
                  selectedBoostType === '24h' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}>
                  <input 
                    type="radio" 
                    name="boostPlan" 
                    value="24h" 
                    checked={selectedBoostType === '24h'}
                    onChange={() => setSelectedBoostType('24h')}
                    className="mt-1 text-amber-600"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#0F172A]">Gói 24 Giờ</span>
                      <span className="font-black text-sm text-amber-700">50.000₫</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Đẩy lên top kết quả tìm kiếm trong 24 giờ tới.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99] ${
                  selectedBoostType === '3days' ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500' : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}>
                  <input 
                    type="radio" 
                    name="boostPlan" 
                    value="3days" 
                    checked={selectedBoostType === '3days'}
                    onChange={() => setSelectedBoostType('3days')}
                    className="mt-1 text-amber-600"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                        Gói 3 Ngày
                        <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">Khuyên dùng</span>
                      </span>
                      <span className="font-black text-sm text-amber-700">120.000₫</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Đẩy top 3 ngày liên tục + Gắn huy hiệu Nổi bật.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99] ${
                  selectedBoostType === '7days' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}>
                  <input 
                    type="radio" 
                    name="boostPlan" 
                    value="7days" 
                    checked={selectedBoostType === '7days'}
                    onChange={() => setSelectedBoostType('7days')}
                    className="mt-1 text-amber-600"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#0F172A]">Gói 7 Ngày (1 Tuần)</span>
                      <span className="font-black text-sm text-amber-700">250.000₫</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Ưu tiên trang chủ + Huy hiệu Nổi bật trong 7 ngày.</p>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  fullWidth
                  disabled={initiating || !selectedRoomId}
                  onClick={handleBuyBoost}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  {initiating ? (
                    'Đang khởi tạo đơn...'
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Kích hoạt Đẩy tin ngay
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment QR Modal */}
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
              <h3 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Thanh toán dịch vụ Dormi
              </h3>
              <p className="text-xs text-slate-500">
                Mã tham chiếu: <span className="font-mono font-bold text-slate-800">{checkoutData.transactionRef}</span>
              </p>
              <p className="text-sm font-black text-emerald-700">
                Số tiền: {Number(checkoutData.amount).toLocaleString('vi-VN')}₫
              </p>
            </div>

            <div className="flex justify-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <img 
                src={checkoutData.qrUrl} 
                alt="QR Code" 
                className="w-48 h-48 object-contain rounded-lg shadow-sm" 
              />
            </div>

            <div className="space-y-2 text-center text-xs">
              <Button
                variant="primary"
                fullWidth
                disabled={verifying}
                onClick={handleVerifyPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {verifying ? 'Đang kiểm tra...' : 'Xác nhận đã chuyển khoản thành công'}
              </Button>
              <p className="text-[11px] text-[#94A3B8]">
                Hệ thống tự động kích hoạt ngay sau khi tiền vào tài khoản ngân hàng.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
