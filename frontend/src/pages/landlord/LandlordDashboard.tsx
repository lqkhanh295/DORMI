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
    <div className="space-y-8 pb-12 bg-[#F5F7FA]">
      <div className="bg-white p-6 md:p-8 rounded-[18px] shadow-clay-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[#0F172A] tracking-tight leading-[1.1]">Tổng quan Chủ trọ</h1>
          <p className="text-body text-[#64748B] mt-1">Hệ điều hành cho thuê: Quản lý khách, hợp đồng lưu trú và phê duyệt hồ sơ thuê.</p>
        </div>
        <div className="flex items-center gap-3">
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
            <UserCheck className="w-4 h-4 text-[#2563EB]" /> Đánh giá khách thuê
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/landlord/rooms">
          <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:scale-[1.01] hover:shadow-clay-primary active:scale-[0.99] transition-[transform,box-shadow] duration-200 ease-out cursor-pointer h-full motion-gpu">
            <h3 className="text-caption font-semibold text-[#64748B] uppercase tracking-wider mb-3">Phòng hoạt động</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-[40px] font-bold text-[#00153D] leading-none">{analytics.activeListings}</p>
              )}
              <span className="text-body font-medium text-[#64748B]">/ {analytics.totalListings} tổng</span>
            </div>
          </Card>
        </Link>
        
        <Link to="/landlord/applications">
          <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:scale-[1.01] hover:shadow-clay-primary active:scale-[0.99] transition-[transform,box-shadow] duration-200 ease-out cursor-pointer h-full border-l-4 border-l-indigo-600 motion-gpu">
            <h3 className="text-caption font-semibold text-indigo-700 uppercase tracking-wider mb-3">Hồ sơ ứng tuyển</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-[40px] font-bold text-[#00153D] leading-none">{pendingApplications}</p>
              )}
              <span className="text-caption font-bold text-indigo-600">cần xét duyệt</span>
            </div>
          </Card>
        </Link>
        
        <Link to="/landlord/viewings">
          <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:scale-[1.01] hover:shadow-clay-primary active:scale-[0.99] transition-[transform,box-shadow] duration-200 ease-out cursor-pointer h-full border-l-4 border-l-emerald-600 motion-gpu">
            <h3 className="text-caption font-semibold text-emerald-700 uppercase tracking-wider mb-3">Lịch hẹn xem phòng</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-[40px] font-bold text-[#00153D] leading-none">{analytics.totalAppointments}</p>
              )}
              <span className="text-caption font-medium text-[#C62828]">{analytics.pendingAppointments} chờ duyệt</span>
            </div>
          </Card>
        </Link>

        <Link to="/landlord/analytics">
          <Card className="p-6 bg-white rounded-[18px] shadow-clay-soft hover:scale-[1.01] hover:shadow-clay-primary active:scale-[0.99] transition-[transform,box-shadow] duration-200 ease-out cursor-pointer h-full motion-gpu">
            <h3 className="text-caption font-semibold text-[#64748B] uppercase tracking-wider mb-3">Lượt xem tin đăng</h3>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-10 w-16 skeleton-shimmer rounded-lg" />
              ) : (
                <p className="text-[40px] font-bold text-[#00153D] leading-none">{analytics.totalViews}</p>
              )}
              <span className="text-caption font-bold text-[#16803C]">Phễu quan tâm</span>
            </div>
          </Card>
        </Link>
      </div>

      <Card className="p-6 md:p-8 rounded-[18px] bg-white shadow-clay-soft hover:shadow-clay-primary transition-[box-shadow] duration-200 ease-out">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#E2E8F0] pb-5">
          <div>
            <h3 className="text-h2 font-bold text-[#0F172A] tracking-tight">Phễu phân tích chuyển đổi API</h3>
            <p className="text-[#64748B] mt-1">Hiệu quả chuyển đổi thực tế</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-body font-semibold mb-2">
              <span className="text-[#64748B]">Tổng lượt xem</span>
              <span className="text-[#0F172A] font-bold">{analytics.totalViews}</span>
            </div>
            <div className="w-full bg-[#F5F7FA] rounded-full h-3 overflow-hidden border border-[#E2E8F0]">
              <div className="bg-[#00153D] h-full rounded-full transition-all duration-500" style={{width: '100%'}}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-body font-semibold mb-2">
              <span className="text-[#64748B]">Yêu cầu xem phòng</span>
              <span className="text-[#0F172A] font-bold">{analytics.totalAppointments}</span>
            </div>
            <div className="w-full bg-[#F5F7FA] rounded-full h-3 overflow-hidden border border-[#E2E8F0]">
              <div className="bg-[#16803C] h-full rounded-full transition-all duration-500" style={{width: `${Math.min(100, analytics.conversionRate * 5)}%`}}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
