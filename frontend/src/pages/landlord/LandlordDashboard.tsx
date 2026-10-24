import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi, applicationsApi, ApplicationStatus } from '../../services/api';
import { TenantRatingModal } from '../../components/landlord/TenantRatingModal';
import { UserCheck, Plus, FileCheck, Package, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandlordDashboard() {
  const [showRateModal, setShowRateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalListings: 0,
    activeListings: 0,
    rentedListings: 0,
    occupancyRate: 0,
    estimatedRevenue: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    pendingApplications: 0,
    totalApplications: 0,
    totalViews: 0,
    conversionRate: 0,
    currentPlan: 'Free',
    maxRoomLimit: 2,
    roomsUsed: 0
  });

  useEffect(() => {
    let isMounted = true;
    landlordApi.getAnalytics()
      .then(res => {
        if (!isMounted) return;
        if (res) {
          setAnalytics(prev => ({
            ...prev,
            totalListings: res.totalListings ?? 0,
            activeListings: res.activeListings ?? 0,
            rentedListings: res.rentedListings ?? 0,
            occupancyRate: res.occupancyRate ?? 0,
            estimatedRevenue: res.estimatedRevenue ?? 0,
            totalAppointments: res.totalAppointments ?? 0,
            pendingAppointments: res.pendingAppointments ?? 0,
            pendingApplications: res.pendingApplications ?? 0,
            totalApplications: res.totalApplications ?? 0,
            totalViews: res.totalViews ?? 0,
            conversionRate: res.conversionRate ?? 0,
            currentPlan: res.currentPlan ?? 'Free',
            maxRoomLimit: res.maxRoomLimit ?? 2,
            roomsUsed: res.roomsUsed ?? 0
          }));
        }
      })
      .catch((err) => {
        console.warn('landlordApi.getAnalytics failed:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    applicationsApi.getLandlordApplications()
      .then(res => {
        if (!isMounted) return;
        if (Array.isArray(res)) {
          const pending = res.filter(a => {
            const num = Number(a.status);
            return num === ApplicationStatus.Submitted || 
                   num === ApplicationStatus.UnderReview || 
                   num === ApplicationStatus.MoreInfoRequested ||
                   (a.status as any) === 'Submitted' || 
                   (a.status as any) === 'UnderReview' || 
                   (a.status as any) === 'MoreInfoRequested';
          }).length;
          setAnalytics(prev => ({ ...prev, pendingApplications: pending }));
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const planDisplayName = 
    analytics.currentPlan === 'Business' || analytics.currentPlan === 'Enterprise'
      ? 'Gói Doanh Nghiệp (Không giới hạn tin)'
      : analytics.currentPlan === 'Pro'
      ? 'Gói Pro (Dành cho chủ trọ chuyên nghiệp)'
      : 'Gói Miễn Phí (Dành cho chủ trọ cá nhân)';

  const quotaPercent = Math.min(100, Math.round((analytics.roomsUsed / Math.max(1, analytics.maxRoomLimit)) * 100));
  const remainingQuota = Math.max(0, analytics.maxRoomLimit - analytics.roomsUsed);
  const isQuotaFull = analytics.roomsUsed >= analytics.maxRoomLimit;

  return (
    <div className="space-y-8 pb-12 bg-[#F8FAFC]">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#00153D] tracking-tight">Tổng quan Quản lý Trọ</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý tin đăng, hợp đồng điện tử và phê duyệt hồ sơ người thuê phòng.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/landlord/leases">
            <Button variant="secondary" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" /> Hợp đồng thuê
            </Button>
          </Link>
          <Button 
            onClick={() => setShowRateModal(true)} 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-blue-600" /> Đánh giá khách thuê
          </Button>
          <Link to="/landlord/listing/new">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Đăng phòng mới
            </Button>
          </Link>
        </div>
      </div>

      <TenantRatingModal 
        isOpen={showRateModal} 
        onClose={() => setShowRateModal(false)} 
      />

      {/* Quota Progress Bar & Financial KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quota Progress */}
        <Card className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Hạn mức tin đăng gói hiện tại</span>
              </h3>
              <p className="text-xs text-slate-500">{planDisplayName}</p>
            </div>
            <div className="text-xs font-bold text-[#00153D] flex items-center gap-1.5">
              <span>Đã dùng: </span>
              <span className="text-blue-600 font-black">{analytics.roomsUsed}</span>
              <span className="text-slate-400"> / {analytics.maxRoomLimit} tin đăng</span>
              {isQuotaFull && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Hết hạn mức
                </span>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${isQuotaFull ? 'bg-amber-500' : 'bg-blue-600'}`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
            <span>Còn lại: {remainingQuota} lượt đăng phòng</span>
            <Link to="/landlord/pricing" className="text-blue-600 font-bold hover:underline">
              Nâng cấp gói thêm lượt đăng & tin VIP →
            </Link>
          </div>
        </Card>

        {/* Financial KPI */}
        <Card className="p-6 bg-gradient-to-br from-[#00153D] to-[#073372] text-white rounded-2xl border-none shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Doanh thu ước tính</span>
              <DollarSign className="w-4 h-4 text-[#F2A900]" />
            </div>
            <p className="text-2xl font-black text-white mt-2">
              {analytics.estimatedRevenue.toLocaleString('vi-VN')}₫
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Tỷ lệ lấp đầy: {analytics.occupancyRate}% {analytics.activeListings > 0 ? `(Còn ${analytics.activeListings} phòng trống)` : '(Đã kín phòng)'}
            </p>
          </div>
          <p className="text-[10px] text-slate-300 pt-3 border-t border-white/10 mt-3">
            Dựa trên các hợp đồng thuê phòng đang có hiệu lực trong CSDL
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link to="/landlord/rooms">
          <Card className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer h-full">
            <h3 className="text-xs font-medium text-slate-500 mb-2">Phòng đang cho thuê</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-3xl font-black text-[#00153D] leading-none">{analytics.rentedListings}</p>
              )}
              <span className="text-sm font-medium text-slate-500">/ {analytics.totalListings} tổng</span>
              {analytics.activeListings > 0 ? (
                <span className="text-caption font-semibold text-emerald-600">({analytics.activeListings} trống)</span>
              ) : (
                <span className="text-caption font-semibold text-blue-600">(Kín 100%)</span>
              )}
            </div>
          </Card>
        </Link>
        
        <Link to="/landlord/applications">
          <Card className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer h-full">
            <h3 className="text-xs font-medium text-slate-500 mb-2">Hồ sơ ứng tuyển</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-3xl font-black text-[#00153D] leading-none">{analytics.pendingApplications}</p>
              )}
              <span className={`text-caption font-bold ${analytics.pendingApplications > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                {analytics.pendingApplications > 0 ? 'cần xét duyệt' : '0 chờ duyệt'}
              </span>
            </div>
          </Card>
        </Link>
        
        <Link to="/landlord/viewings">
          <Card className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer h-full">
            <h3 className="text-xs font-medium text-slate-500 mb-2">Lịch hẹn xem phòng</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-3xl font-black text-[#00153D] leading-none">{analytics.totalAppointments}</p>
              )}
              <span className={`text-caption font-medium ${analytics.pendingAppointments > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                {analytics.pendingAppointments > 0 ? `${analytics.pendingAppointments} chờ duyệt` : '0 chờ duyệt'}
              </span>
            </div>
          </Card>
        </Link>

        <Link to="/landlord/analytics">
          <Card className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer h-full">
            <h3 className="text-xs font-medium text-slate-500 mb-2">Lượt xem tin đăng</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-3xl font-black text-[#00153D] leading-none">{analytics.totalViews}</p>
              )}
              <span className="text-caption font-bold text-emerald-700">Phễu quan tâm</span>
            </div>
          </Card>
        </Link>
      </div>

      <Card className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">Hiệu quả chuyển đổi người thuê</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tỷ lệ từ lượt xem chuyển thành lịch xem phòng thực tế</p>
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm font-semibold mb-1.5">
              <span className="text-slate-600">Tổng lượt xem tin</span>
              <span className="text-[#0F172A] font-bold">{analytics.totalViews} lượt</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-[#00153D] h-full rounded-full transition-[width] duration-500 ease-out" style={{width: '100%'}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-semibold mb-1.5">
              <span className="text-slate-600">Yêu cầu xem phòng thực tế</span>
              <span className="text-[#0F172A] font-bold">{analytics.totalAppointments} cuộc hẹn</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-[width] duration-500 ease-out" style={{width: `${Math.min(100, analytics.conversionRate * 5)}%`}}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
