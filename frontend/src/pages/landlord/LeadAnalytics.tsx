import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi } from '../../services/api';
import { toast } from 'sonner';
import { 
  Eye, 
  Heart, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  FileCheck, 
  BarChart3, 
  Flame, 
  TrendingUp, 
  X, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LeadAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Boost modal state
  const [boostingRoom, setBoostingRoom] = useState<any | null>(null);
  const [selectedBoostType, setSelectedBoostType] = useState<'24h' | '3days' | '7days'>('3days');
  const [boostCheckout, setBoostCheckout] = useState<any | null>(null);
  const [isSubmittingBoost, setIsSubmittingBoost] = useState(false);
  const [isVerifyingBoost, setIsVerifyingBoost] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await landlordApi.getLeadAnalytics();
      if (res) setAnalytics(res);
    } catch (err) {
      console.warn('Failed to load lead analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalViews = analytics?.totalViews ?? 0;
  const totalSaves = analytics?.totalSaves ?? 0;
  const totalViewings = analytics?.totalViewings ?? analytics?.totalContacts ?? 0;
  const totalApplications = analytics?.totalApplications ?? 0;
  const totalApproved = analytics?.totalApproved ?? 0;
  const totalLeases = analytics?.totalLeases ?? 0;

  const viewToLeadRate = analytics?.viewToLeadRate ?? analytics?.saveRate ?? 0;
  const leadToViewingRate = analytics?.leadToViewingRate ?? 0;
  const viewingToAppRate = analytics?.viewingToAppRate ?? 0;
  const appToApproveRate = analytics?.appToApproveRate ?? 0;
  const approveToLeaseRate = analytics?.approveToLeaseRate ?? 0;
  const overallConversionRate = analytics?.overallConversionRate ?? 0;

  const dailyViews = analytics?.dailyViews ?? analytics?.dailyMetrics ?? [];
  const roomStats = analytics?.roomStats ?? analytics?.topRooms ?? [];
  const maxDayViews = Math.max(...dailyViews.map((d: any) => d.views || 0), 1);

  const handleOpenBoost = (room: any) => {
    setBoostingRoom(room);
    setSelectedBoostType('3days');
    setBoostCheckout(null);
  };

  const handleInitiateBoost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boostingRoom) return;
    try {
      setIsSubmittingBoost(true);
      const res = await landlordApi.boostRoom(boostingRoom.roomId, {
        boostType: selectedBoostType,
        paymentMethod: 'VNPay'
      });
      setBoostCheckout(res);
      toast.info(`Đã khởi tạo đơn hàng đẩy tin ${selectedBoostType}. Vui lòng thanh toán để kích hoạt.`);
    } catch (err: any) {
      toast.error(err?.message || 'Khởi tạo đẩy tin thất bại.');
    } finally {
      setIsSubmittingBoost(false);
    }
  };

  const handleVerifyBoost = async () => {
    if (!boostCheckout?.transactionRef) return;
    try {
      setIsVerifyingBoost(true);
      if (import.meta.env.DEV) {
        const res = await landlordApi.simulateGatewayPayment(boostCheckout.transactionRef);
        toast.success(res.message || 'Thanh toán đẩy tin mô phỏng thành công!');
        setBoostingRoom(null);
        setBoostCheckout(null);
        fetchAnalytics();
      } else {
        const statusRes = await landlordApi.checkPaymentStatus(boostCheckout.transactionRef);
        if (statusRes.status === 'Completed') {
          toast.success('Thanh toán thành công! Tin đăng của bạn đã được ưu tiên hiển thị.');
          setBoostingRoom(null);
          setBoostCheckout(null);
          fetchAnalytics();
        } else {
          toast.info('Hệ thống đang chờ đối tác thanh toán ghi nhận. Vui lòng thử lại sau giây lát.');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Chưa thể xác nhận thanh toán vào lúc này.');
    } finally {
      setIsVerifyingBoost(false);
    }
  };

  return (
    <div className="space-y-6 bg-[#F5F7FA] pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
              Landlord CRM
            </span>
            <span className="text-xs text-[#64748B]">Hệ điều hành vận hành & dòng chuyển đổi</span>
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#2563EB]" />
            Phân tích chuyển đổi & Khách tiềm năng (Operating Funnel)
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Theo dõi chi tiết luồng chuyển đổi từ Lượt xem tin đến Ký kết hợp đồng lưu trú thực tế.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#00153D] rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới dữ liệu
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#64748B] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#00153D]/20 border-t-[#00153D] rounded-full animate-spin" />
          <p className="text-sm">Đang tính toán phễu dữ liệu thực tế...</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <Card className="p-4 bg-white rounded-2xl shadow-clay-soft border-none">
              <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-blue-600" /> Lượt xem
              </span>
              <p className="text-2xl font-black text-[#0F172A] mt-2">{totalViews.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-[#94A3B8]">Toàn bộ phòng</span>
            </Card>

            <Card className="p-4 bg-white rounded-2xl shadow-clay-soft border-none">
              <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1 uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Quan tâm
              </span>
              <p className="text-2xl font-black text-[#0F172A] mt-2">{totalSaves.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-emerald-600 font-semibold">{viewToLeadRate}% từ xem</span>
            </Card>

            <Card className="p-4 bg-white rounded-2xl shadow-clay-soft border-none">
              <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Xem phòng
              </span>
              <p className="text-2xl font-black text-[#0F172A] mt-2">{totalViewings.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-indigo-600 font-semibold">{leadToViewingRate}% từ quan tâm</span>
            </Card>

            <Card className="p-4 bg-white rounded-2xl shadow-clay-soft border-none">
              <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-amber-600" /> Hồ sơ nộp
              </span>
              <p className="text-2xl font-black text-[#0F172A] mt-2">{totalApplications.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-amber-600 font-semibold">{viewingToAppRate}% từ xem phòng</span>
            </Card>

            <Card className="p-4 bg-white rounded-2xl shadow-clay-soft border-none">
              <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã duyệt
              </span>
              <p className="text-2xl font-black text-[#0F172A] mt-2">{totalApproved.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-emerald-600 font-semibold">{appToApproveRate}% hồ sơ đạt</span>
            </Card>

            <Card className="p-4 bg-white rounded-2xl shadow-clay-soft border-none bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 uppercase tracking-wider">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Hợp đồng
              </span>
              <p className="text-2xl font-black text-emerald-700 mt-2">{totalLeases.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-emerald-700 font-bold">{overallConversionRate}% tổng phễu</span>
            </Card>
          </div>

          {/* Main Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 30-Day Trend */}
            <Card className="p-6 lg:col-span-2 bg-white rounded-2xl shadow-clay-soft border-none space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">Xu hướng Lượt xem & Khách lưu (30 Ngày)</h3>
                  <p className="text-xs text-[#64748B]">Theo dõi biến động nhu cầu thuê phòng theo chu kỳ thời gian.</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" /> Lượt xem
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-500">
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> Đã lưu
                  </span>
                </div>
              </div>

              {dailyViews.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-[#64748B] text-xs">
                  Chưa có đủ dữ liệu biến động trong 30 ngày qua.
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  <div className="h-60 flex items-end justify-between gap-2 border-b border-l border-[#E2E8F0] pb-2 pl-2">
                    {dailyViews.map((item: any, i: number) => {
                      const viewHeight = Math.min(100, Math.max(8, (item.views / maxDayViews) * 100));
                      const saveHeight = Math.min(100, Math.max(4, (item.saves / maxDayViews) * 100));
                      return (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1 group relative">
                          <div className="w-full flex justify-center items-end gap-1 h-full">
                            <div 
                              className="w-full max-w-[8px] bg-[#E11D48] rounded-t-sm" 
                              style={{ height: `${saveHeight}%` }}
                              title={`Lưu: ${item.saves}`}
                            />
                            <div 
                              className="w-full max-w-[8px] bg-[#2563EB] rounded-t-sm" 
                              style={{ height: `${viewHeight}%` }}
                              title={`Xem: ${item.views}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[11px] text-[#64748B] px-1">
                    <span>{dailyViews[0]?.date || 'Bắt đầu'}</span>
                    <span>{dailyViews[Math.floor(dailyViews.length / 2)]?.date || 'Giữa kỳ'}</span>
                    <span>{dailyViews[dailyViews.length - 1]?.date || 'Hôm nay'}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* 6-Stage Operating Funnel Card */}
            <Card className="p-6 flex flex-col justify-between bg-white rounded-2xl shadow-clay-soft border-none space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                  <h3 className="font-bold text-base text-[#0F172A]">Phễu chuyển đổi 6 bước</h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    Chốt: {overallConversionRate}%
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-2 mb-4">
                  Phản ánh tỷ lệ rơi rụng thực tế từ lượt ghé thăm đến hợp đồng thuê có hiệu lực.
                </p>

                <div className="space-y-3.5 text-xs">
                  {/* Step 1: Views */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#475569] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-600" /> 1. Lượt xem tin
                      </span>
                      <span className="font-bold text-[#0F172A]">{totalViews.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full w-full" />
                    </div>
                  </div>

                  {/* Step 2: Leads / Saves */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#475569] flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500" /> 2. Khách quan tâm (Lưu tin)
                      </span>
                      <span className="font-bold text-[#0F172A]">
                        {totalSaves.toLocaleString('vi-VN')} <span className="text-[11px] text-[#94A3B8]">({viewToLeadRate}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(viewToLeadRate, 4))}%` }}
                      />
                    </div>
                  </div>

                  {/* Step 3: Viewings */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#475569] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" /> 3. Lịch hẹn xem phòng
                      </span>
                      <span className="font-bold text-[#0F172A]">
                        {totalViewings.toLocaleString('vi-VN')} <span className="text-[11px] text-[#94A3B8]">({leadToViewingRate}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(leadToViewingRate, 4))}%` }}
                      />
                    </div>
                  </div>

                  {/* Step 4: Applications */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#475569] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600" /> 4. Nộp hồ sơ ứng tuyển
                      </span>
                      <span className="font-bold text-[#0F172A]">
                        {totalApplications.toLocaleString('vi-VN')} <span className="text-[11px] text-[#94A3B8]">({viewingToAppRate}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(viewingToAppRate, 4))}%` }}
                      />
                    </div>
                  </div>

                  {/* Step 5: Approved */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#475569] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 5. Hồ sơ được chấp thuận
                      </span>
                      <span className="font-bold text-[#0F172A]">
                        {totalApproved.toLocaleString('vi-VN')} <span className="text-[11px] text-[#94A3B8]">({appToApproveRate}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(appToApproveRate, 4))}%` }}
                      />
                    </div>
                  </div>

                  {/* Step 6: Leases */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" /> 6. Ký kết hợp đồng lưu trú
                      </span>
                      <span className="font-black text-emerald-700">
                        {totalLeases.toLocaleString('vi-VN')} <span className="text-[11px] text-emerald-600">({approveToLeaseRate}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden border border-emerald-200">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, Math.max(approveToLeaseRate, 5))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
                <span>Tổng số phòng quản lý:</span>
                <span className="font-bold text-[#0F172A]">{roomStats.length} phòng</span>
              </div>
            </Card>
          </div>

          {/* Room Performance Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#0F172A]">Hiệu quả chuyển đổi theo từng phòng</h3>
                <p className="text-xs text-[#64748B]">Đánh giá hiệu suất tiếp cận khách và đẩy tin nổi bật cho phòng trống.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
              {roomStats.length === 0 ? (
                <div className="p-10 text-center text-[#64748B] text-xs">
                  Bạn chưa có phòng đăng nào. Hãy đăng phòng mới để bắt đầu đón khách!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#E2E8F0] text-xs">
                    <thead className="bg-[#F8FAFC]">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-bold text-[#64748B] uppercase tracking-wider">Phòng trọ</th>
                        <th className="px-4 py-3.5 text-left font-bold text-[#64748B] uppercase tracking-wider">Giá thuê</th>
                        <th className="px-3 py-3.5 text-center font-bold text-[#64748B] uppercase tracking-wider">Xem</th>
                        <th className="px-3 py-3.5 text-center font-bold text-[#64748B] uppercase tracking-wider">Lưu</th>
                        <th className="px-3 py-3.5 text-center font-bold text-[#64748B] uppercase tracking-wider">Hẹn xem</th>
                        <th className="px-3 py-3.5 text-center font-bold text-[#64748B] uppercase tracking-wider">Hồ sơ</th>
                        <th className="px-3 py-3.5 text-center font-bold text-[#64748B] uppercase tracking-wider">Hợp đồng</th>
                        <th className="px-4 py-3.5 text-center font-bold text-[#64748B] uppercase tracking-wider">Trạng thái tin</th>
                        <th className="px-5 py-3.5 text-right font-bold text-[#64748B] uppercase tracking-wider">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#E2E8F0]">
                      {roomStats.map((room: any) => (
                        <tr key={room.roomId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                <img 
                                  src={room.imageUrl || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=100&q=80"} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="max-w-[200px]">
                                <div className="font-bold text-[#0F172A] truncate">{room.title}</div>
                                <div className="text-[11px] text-[#64748B] truncate">{room.address}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap font-bold text-[#0F172A]">
                            {Number(room.price).toLocaleString('vi-VN')} đ/tháng
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center font-semibold text-[#0F172A]">
                            {room.views}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center font-semibold text-rose-600">
                            {room.saves}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center font-semibold text-indigo-600">
                            {room.viewings ?? room.contacts}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center font-semibold text-amber-600">
                            {room.applications ?? 0}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center font-bold text-emerald-600">
                            {room.leases ?? 0}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            {room.isBoosted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                <Flame className="w-3.5 h-3.5 text-amber-600" />
                                Nổi bật ({room.boostType})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                                Tiêu chuẩn
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenBoost(room)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-lg transition-colors text-xs"
                            >
                              <Flame className="w-3.5 h-3.5 text-amber-600" />
                              Đẩy tin
                            </button>
                            <Link to={`/room/${room.roomId}`}>
                              <Button size="sm" variant="ghost" className="text-[#2563EB] text-xs">Xem tin</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Boost Modal */}
      {boostingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-[#0F172A]">Đẩy tin nổi bật (Listing Boost)</h3>
              </div>
              <button 
                onClick={() => {
                  setBoostingRoom(null);
                  setBoostCheckout(null);
                }}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Phòng: <span className="font-bold text-[#0F172A]">{boostingRoom.title}</span>
            </p>

            {!boostCheckout ? (
              <form onSubmit={handleInitiateBoost} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-[#0F172A] block">Chọn gói đẩy tin phù hợp:</label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedBoostType === '24h' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}>
                    <input 
                      type="radio" 
                      name="boostType" 
                      value="24h" 
                      checked={selectedBoostType === '24h'}
                      onChange={() => setSelectedBoostType('24h')}
                      className="mt-1 text-amber-600"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#0F172A]">Đẩy tin 24 Giờ</span>
                        <span className="font-black text-amber-700">50.000₫</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Ưu tiên đẩy lên đầu trang tìm kiếm trong 24h.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedBoostType === '3days' ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500' : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}>
                    <input 
                      type="radio" 
                      name="boostType" 
                      value="3days" 
                      checked={selectedBoostType === '3days'}
                      onChange={() => setSelectedBoostType('3days')}
                      className="mt-1 text-amber-600"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                          Đẩy tin 3 Ngày
                          <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">Phổ biến</span>
                        </span>
                        <span className="font-black text-amber-700">120.000₫</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Huy hiệu Nổi bật + Ưu tiên hiển thị top 3 ngày liên tục.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedBoostType === '7days' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}>
                    <input 
                      type="radio" 
                      name="boostType" 
                      value="7days" 
                      checked={selectedBoostType === '7days'}
                      onChange={() => setSelectedBoostType('7days')}
                      className="mt-1 text-amber-600"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#0F172A]">Đẩy tin 7 Ngày</span>
                        <span className="font-black text-amber-700">250.000₫</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Xuất hiện mục đề xuất trang chủ + Đẩy top 7 ngày.</p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setBoostingRoom(null)}
                    disabled={isSubmittingBoost}
                    className="px-4 py-2 border border-[#CBD5E1] text-[#475569] font-semibold rounded-xl hover:bg-[#F8FAFC]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBoost}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    {isSubmittingBoost ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang tạo đơn...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Thanh toán & Kích hoạt
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs text-center">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <p className="font-bold">Mã giao dịch: {boostCheckout.transactionRef}</p>
                  <p className="text-[11px] mt-0.5">Số tiền: {Number(boostCheckout.amount).toLocaleString('vi-VN')}₫</p>
                </div>

                <div className="flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <img 
                    src={boostCheckout.qrUrl} 
                    alt="Mã thanh toán QR" 
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={isVerifyingBoost}
                    onClick={handleVerifyBoost}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    {isVerifyingBoost ? 'Đang kiểm tra...' : 'Xác nhận đã thanh toán (Hoàn tất)'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setBoostCheckout(null)}
                    className="text-[11px] text-[#64748B] hover:text-[#0F172A] py-1"
                  >
                    Chọn lại gói khác
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
