import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { landlordApi, applicationsApi, ApplicationStatus } from '../../services/api';
import { TenantRatingModal } from '../../components/landlord/TenantRatingModal';
import { UserCheck, Plus, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandlordDashboard() {
  const [showRateModal, setShowRateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalListings: 0,
    activeListings: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalViews: 0,
    conversionRate: 0
  });

  const [pendingApplications, setPendingApplications] = useState(0);

  useEffect(() => {
    let isMounted = true;
    landlordApi.getAnalytics()
      .then(res => {
        if (!isMounted) return;
        if (res) {
          setAnalytics({
            totalListings: res.totalListings ?? 0,
            activeListings: res.activeListings ?? 0,
            totalAppointments: res.totalAppointments ?? 0,
            pendingAppointments: res.pendingAppointments ?? 0,
            totalViews: res.totalViews ?? 0,
            conversionRate: res.conversionRate ?? 0
          });
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
          const pending = res.filter(a => a.status === ApplicationStatus.Submitted || a.status === ApplicationStatus.UnderReview || a.status === ApplicationStatus.MoreInfoRequested).length;
          setPendingApplications(pending);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link to="/landlord/rooms">
          <Card className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer h-full">
            <h3 className="text-caption font-semibold text-slate-500 uppercase tracking-wider mb-2">Phòng hoạt động</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-3xl font-black text-[#00153D] leading-none">{analytics.activeListings}</p>
              )}
              <span className="text-sm font-medium text-slate-500">/ {analytics.totalListings} tổng</span>
            </div>
          </Card>
        </Link>
        
        <Link to="/landlord/applications">
          <Card className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer h-full border-l-4 border-l-indigo-600">
            <h3 className="text-caption font-semibold text-indigo-700 uppercase tracking-wider mb-2">Hồ sơ ứng tuyển</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-3xl font-black text-[#00153D] leading-none">{pendingApplications}</p>
              )}
              <span className="text-caption font-bold text-indigo-600">cần xét duyệt</span>
            </div>
          </Card>
        </Link>
        
        <Link to="/landlord/viewings">
          <Card className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer h-full border-l-4 border-l-emerald-600">
            <h3 className="text-caption font-semibold text-emerald-700 uppercase tracking-wider mb-2">Lịch hẹn xem phòng</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-3xl font-black text-[#00153D] leading-none">{analytics.totalAppointments}</p>
              )}
              <span className="text-caption font-medium text-rose-600">{analytics.pendingAppointments} chờ duyệt</span>
            </div>
          </Card>
        </Link>

        <Link to="/landlord/analytics">
          <Card className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer h-full">
            <h3 className="text-caption font-semibold text-slate-500 uppercase tracking-wider mb-2">Lượt xem tin đăng</h3>
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
            <p className="text-xs text-slate-500 mt-0.5">Tỷ lệ tương tác từ lượt xem sang lịch hẹn thực tế</p>
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
