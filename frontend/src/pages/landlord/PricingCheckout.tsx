import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi, roomsApi } from '../../services/api';
import { toast } from 'sonner';
import { 
  X, 
  CreditCard, 
  Check, 
  Flame, 
  Building2, 
  Zap,
  ExternalLink,
  Loader2,
  Receipt,
  Copy
} from 'lucide-react';

export default function PricingCheckout() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'plans' | 'boosts'>('plans');
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Plan state
  const [currentPlan, setCurrentPlan] = useState<'Free' | 'Pro' | 'Business'>('Free');
  const [roomsUsed, setRoomsUsed] = useState<number>(0);

  // Boost tab state
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBoostType, setSelectedBoostType] = useState<'24h' | '3days' | '7days'>('3days');
  const [loadingRooms, setLoadingRooms] = useState(false);

  const fetchPlanAnalytics = async () => {
    try {
      const res = await landlordApi.getAnalytics();
      if (res?.currentPlan) {
        const plan = res.currentPlan.toLowerCase();
        if (plan.includes('business') || plan.includes('enterprise')) {
          setCurrentPlan('Business');
        } else if (plan.includes('pro')) {
          setCurrentPlan('Pro');
        } else {
          setCurrentPlan('Free');
        }
      }
      if (typeof res?.roomsUsed === 'number') setRoomsUsed(res.roomsUsed);
    } catch (err) {
      console.warn('Failed to load plan analytics:', err);
    }
  };

  useEffect(() => {
    fetchPlanAnalytics();
  }, []);

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Đã sao chép: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCheckoutData(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpgrade = async (plan: string) => {
    try {
      setInitiating(true);
      const res = await landlordApi.checkout(plan);
      setCheckoutData(res);
      toast.info(`Đã tạo đơn hàng gói ${plan}. Vui lòng quét mã để thanh toán.`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo đơn thanh toán.');
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
        paymentMethod: 'PayOS'
      });
      setCheckoutData(res);
      toast.info(`Đã tạo đơn hàng đẩy tin ${selectedBoostType}. Vui lòng quét mã để thanh toán.`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo đơn đẩy tin.');
    } finally {
      setInitiating(false);
    }
  };

  useEffect(() => {
    if (!checkoutData?.transactionRef) return;

    const interval = setInterval(async () => {
      try {
        const statusRes = await landlordApi.checkPaymentStatus(checkoutData.transactionRef);
        if (statusRes.status === 'Completed') {
          toast.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
          setCheckoutData(null);
          await fetchPlanAnalytics();
        }
      } catch {
        // Silent polling error
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [checkoutData]);

  const handleVerifyPayment = async () => {
    if (!checkoutData?.transactionRef) return;
    try {
      setVerifying(true);
      const statusRes = await landlordApi.checkPaymentStatus(checkoutData.transactionRef);
      if (statusRes.status === 'Completed') {
        toast.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
        setCheckoutData(null);
        await fetchPlanAnalytics();
        return;
      }

      const verifyRes = await landlordApi.verifyPayment(checkoutData.transactionRef, 'PayOS');
      if (verifyRes.status === 'Completed') {
        toast.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
        setCheckoutData(null);
        await fetchPlanAnalytics();
        return;
      }

      toast.info('Hệ thống chưa nhận được tín hiệu thanh toán từ cổng ngân hàng. Nếu bạn vừa chuyển tiền, vui lòng đợi vài giây để ngân hàng xử lý.');
    } catch (err: any) {
      toast.error(err?.message || 'Chưa nhận được giao dịch thanh toán từ PayOS.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto space-y-8 bg-[#F8FAFC] pb-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">
          Nâng cấp Gói Hội viên & Đẩy tin Nổi bật
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
          Tối ưu hóa phễu tiếp cận khách thuê, khẳng định uy tín với huy hiệu bảo chứng và tiếp cận hàng ngàn khách thuê tiềm năng mỗi ngày.
        </p>

        {/* Tab switch & Billing History Link */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
          <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
                activeTab === 'plans' 
                  ? 'bg-[#00153D] text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Gói Hội Viên Chủ Trọ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('boosts')}
              className={`inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
                activeTab === 'boosts' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Đẩy Tin Nổi Bật (Boosts)
            </button>
          </div>

          <Link
            to="/landlord/billing"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-[#00153D] border border-slate-200 rounded-2xl text-xs font-bold shadow-xs transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span>Lịch sử giao dịch</span>
          </Link>
        </div>
      </div>

      {/* Tab 1: Subscription Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Free Tier */}
          <Card className={`bg-white rounded-2xl shadow-xs p-7 flex flex-col justify-between space-y-6 border ${
            currentPlan === 'Free' ? 'border-2 border-emerald-600 relative' : 'border-slate-200'
          }`}>
            {currentPlan === 'Free' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-semibold px-3 py-0.5 rounded-md shadow-xs">
                Gói đang sử dụng
              </div>
            )}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0F172A]">Gói Miễn Phí (Free)</h3>
              <p className="text-xs text-[#64748B]">Dành cho chủ trọ cá nhân có 1 - 2 phòng trọ nhỏ.</p>
              <div className="pt-2">
                <span className="text-3xl font-black text-[#0F172A]">0₫</span>
                <span className="text-xs text-[#64748B]"> / tháng</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#64748B] pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Đăng tối đa 2 tin phòng hoạt động ({roomsUsed}/2 đã dùng)</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Nhận tin nhắn & hẹn xem phòng</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Tiếp nhận hồ sơ ứng tuyển cơ bản</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Ký hợp đồng thuê điện tử</span></li>
              </ul>
            </div>
            <Button variant="secondary" fullWidth disabled className="text-xs font-bold">
              {currentPlan === 'Free' ? 'Gói hiện tại của bạn' : 'Gói mặc định'}
            </Button>
          </Card>

          {/* Pro Tier */}
          <Card className={`bg-white rounded-2xl shadow-sm p-7 flex flex-col justify-between space-y-6 border-2 relative ${
            currentPlan === 'Pro' ? 'border-emerald-600' : 'border-blue-600'
          }`}>
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-3 py-0.5 rounded-md shadow-xs ${
              currentPlan === 'Pro' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              {currentPlan === 'Pro' ? 'Gói đang sử dụng' : 'Khuyên dùng'}
            </div>
            <div className="space-y-4 pt-1">
              <h3 className="text-lg font-bold text-[#0F172A]">Gói Chuyên Nghiệp (Pro)</h3>
              <p className="text-xs text-[#64748B]">Tối ưu hiển thị, vận hành chuyên nghiệp & phân tích phễu.</p>
              <div className="pt-2">
                <span className="text-3xl font-black text-blue-600">299.000₫</span>
                <span className="text-xs text-[#64748B]"> / tháng</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#0F172A] font-semibold pt-4 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Đăng tối đa 15 tin phòng hoạt động {currentPlan === 'Pro' ? `(${roomsUsed}/15 đã dùng)` : ''}</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Huy hiệu Chủ trọ xác thực uy tín (Trust Badge)</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Báo cáo phễu chuyển đổi 6 bước CRM</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Tặng 1 lượt Đẩy tin nổi bật mỗi tháng</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 shrink-0" /><span>Khám phá dữ liệu người tìm phòng (Discovery)</span></li>
              </ul>
            </div>
            <Button 
              variant={currentPlan === 'Pro' ? 'secondary' : 'primary'}
              fullWidth 
              disabled={initiating || currentPlan === 'Pro'}
              onClick={() => handleUpgrade('Pro')}
              className={currentPlan === 'Pro' ? 'text-xs font-bold' : 'bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs'}
            >
              {currentPlan === 'Pro' ? 'Đang kích hoạt' : (initiating ? 'Đang tạo đơn...' : 'Nâng cấp Gói Pro (299.000₫)')}
            </Button>
          </Card>

          {/* Business Tier */}
          <Card className={`bg-white rounded-2xl shadow-clay-soft p-7 flex flex-col justify-between space-y-6 relative ${
            currentPlan === 'Business' ? 'border-2 border-emerald-600' : 'border border-[#E2E8F0]'
          }`}>
            {currentPlan === 'Business' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-semibold px-3 py-0.5 rounded-md shadow-xs">
                Gói đang sử dụng
              </div>
            )}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0F172A]">Gói Doanh Nghiệp (Business)</h3>
              <p className="text-xs text-[#64748B]">Dành cho chuỗi căn hộ dịch vụ, KTX & đơn vị quản lý lớn.</p>
              <div className="pt-2">
                <span className="text-3xl font-black text-[#0F172A]">799.000₫</span>
                <span className="text-xs text-[#64748B]"> / tháng</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#64748B] pt-4 border-t border-[#E2E8F0]">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Không giới hạn số lượng tin đăng {currentPlan === 'Business' ? `(Hiện có ${roomsUsed} phòng)` : ''}</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Tặng 5 lượt Đẩy tin nổi bật mỗi tháng</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Phân quyền quản lý nhiều nhân viên (Staff)</span></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>Hỗ trợ CSKH 24/7 & chuyên viên tư vấn riêng</span></li>
              </ul>
            </div>
            <Button 
              variant="secondary" 
              fullWidth 
              disabled={initiating || currentPlan === 'Business'}
              onClick={() => handleUpgrade('Business')}
              className="font-bold text-xs"
            >
              {currentPlan === 'Business' ? 'Đang kích hoạt' : (initiating ? 'Đang tạo đơn...' : 'Nâng cấp Doanh nghiệp (799.000₫)')}
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
                    'Đang tạo đơn...'
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
      {checkoutData && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-[#0F172A]/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setCheckoutData(null)}
        >
          <div 
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[min(92vh,720px)] overflow-y-auto"
          >
            <button 
              onClick={() => setCheckoutData(null)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mx-auto mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>VietQR Napas 247 Chuyển khoản tức thì</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Thanh toán dịch vụ Dormi</span>
              </h3>
              <p className="text-xs text-slate-500">
                Mã tham chiếu: <span className="font-mono font-bold text-slate-800">{checkoutData.transactionRef}</span>
              </p>
              <p className="text-base font-black text-emerald-700">
                Số tiền: {Number(checkoutData.amount).toLocaleString('vi-VN')}₫
              </p>
            </div>

            {/* QR Image Box */}
            <div className="flex flex-col items-center justify-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <img 
                src={checkoutData.qrUrl} 
                alt="VietQR Napas 247" 
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl shadow-xs bg-white p-2 border border-slate-100" 
              />
              <p className="text-[11px] text-slate-500 font-medium mt-2 text-center">
                Mở app ngân hàng (Vietcombank, MB, Techcombank...) quét mã QR để thanh toán
              </p>
            </div>

            {/* Structured Bank Transfer Details */}
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-slate-800 text-right">
                  {checkoutData.bankName || 'MBBank (Ngân hàng Quân Đội)'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Chủ tài khoản:</span>
                <span className="font-bold text-slate-800 text-right">
                  {checkoutData.accountName || 'CONG TY CO PHAN DORMI'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Số tài khoản:</span>
                <div className="inline-flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {checkoutData.accountNumber || '0901111001'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('accountNumber', checkoutData.accountNumber || '0901111001')}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copiedField === 'accountNumber' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Số tiền:</span>
                <div className="inline-flex items-center gap-1.5">
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {Number(checkoutData.amount).toLocaleString('vi-VN')}₫
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('amount', String(checkoutData.amount))}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Sao chép số tiền"
                  >
                    {copiedField === 'amount' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Nội dung chuyển khoản:</span>
                <div className="inline-flex items-center gap-1.5">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                    {checkoutData.transferMemo || `DORMI ${checkoutData.transactionRef}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('transferMemo', checkoutData.transferMemo || `DORMI ${checkoutData.transactionRef}`)}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Sao chép nội dung chuyển khoản"
                  >
                    {copiedField === 'transferMemo' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {checkoutData.paymentUrl && (
              <a
                href={checkoutData.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 cursor-pointer"
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 cursor-pointer"
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
