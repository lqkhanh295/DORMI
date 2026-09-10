import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminApi } from '../../services/api';
import { Users, UserCheck, Home, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    pendingRooms: 0,
    openReports: 0
  });

  const [verifications, setVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, vRes, rRes, repRes] = await Promise.all([
        adminApi.getStats().catch(() => ({ totalUsers: 0 })),
        adminApi.getPendingVerifications().catch(() => []),
        adminApi.getRoomsForModeration().catch(() => []),
        adminApi.getReports().catch(() => [])
      ]);

      const pendingRoomsList = Array.isArray(rRes) ? rRes.filter((r: any) => r.status === 2) : [];
      const openReportsList = Array.isArray(repRes) ? repRes.filter((r: any) => r.status === 'Pending') : [];

      setStats({
        totalUsers: sRes?.totalUsers || 0,
        pendingVerifications: Array.isArray(vRes) ? vRes.length : 0,
        pendingRooms: pendingRoomsList.length,
        openReports: openReportsList.length
      });

      setVerifications(Array.isArray(vRes) ? vRes : []);
      setReports(openReportsList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewVerification = async (id: string, approve: boolean) => {
    try {
      await adminApi.approveVerification(id, approve);
      toast.success(approve ? 'Đã duyệt xác minh chủ trọ!' : 'Đã từ chối xác minh.');
      loadData();
    } catch {
      toast.error('Thao tác không thành công.');
    }
  };

  const handleResolveReport = async (id: string, status: string) => {
    try {
      await adminApi.updateReportStatus(id, status);
      toast.success(status === 'Resolved' ? 'Đã xử lý báo cáo!' : 'Đã bỏ qua báo cáo.');
      loadData();
    } catch {
      toast.error('Thao tác không thành công.');
    }
  };

  return (
    <div className="space-y-8 pb-8 bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển Quản trị viên</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi hoạt động kiểm duyệt và số liệu thời gian thực của hệ thống.</p>
        </div>
      </div>

      {/* 4 Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng người dùng</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{loading ? '...' : stats.totalUsers.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Dữ liệu từ CSDL hệ thống</p>
        </Card>

        <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Chờ xác minh</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{loading ? '...' : stats.pendingVerifications}</p>
          <Link to="/admin/verify" className="text-xs font-semibold text-amber-700 hover:underline inline-flex items-center gap-1 mt-2">
            Xem danh sách <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Phòng chờ duyệt</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">{loading ? '...' : stats.pendingRooms}</p>
          <Link to="/admin/rooms" className="text-xs font-semibold text-indigo-700 hover:underline inline-flex items-center gap-1 mt-2">
            Kiểm duyệt ngay <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Báo cáo chưa xử lý</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-600">{loading ? '...' : stats.openReports}</p>
          <Link to="/admin/reports" className="text-xs font-semibold text-rose-700 hover:underline inline-flex items-center gap-1 mt-2">
            Xử lý vi phạm <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>
      </div>

      {/* Actionable Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Queue */}
        <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Báo cáo vi phạm cần xử lý
              </h2>
              <Link to="/admin/reports" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1">
                Xem tất cả ({stats.openReports}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-slate-400 py-6 text-center">Đang tải...</p>
            ) : reports.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 font-medium">Hiện không có báo cáo vi phạm nào chưa xử lý.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 4).map(r => (
                  <div key={r.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{r.roomTitle || 'Phòng trọ'}</p>
                      <p className="text-xs text-slate-500 mt-0.5"><span className="font-medium text-rose-600">Lý do:</span> {r.reason}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Bởi: {r.reporterName} · {new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button 
                        onClick={() => handleResolveReport(r.id, 'Resolved')}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
                      >
                        Xử lý
                      </button>
                      <button 
                        onClick={() => handleResolveReport(r.id, 'Dismissed')}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg transition-colors"
                      >
                        Bỏ qua
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Verifications Queue */}
        <Card className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-500" />
                Chủ trọ chờ xác minh danh tính
              </h2>
              <Link to="/admin/verify" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1">
                Xem tất cả ({stats.pendingVerifications}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-slate-400 py-6 text-center">Đang tải...</p>
            ) : verifications.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 font-medium">Không có yêu cầu xác minh nào đang chờ.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {verifications.slice(0, 4).map(v => {
                  const vId = v.landlordId || v.id;
                  return (
                    <div key={vId} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {(v.fullName || 'L').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{v.fullName}</p>
                          <p className="text-xs text-slate-500 truncate">{v.email}</p>
                          {v.phoneNumber && <p className="text-[11px] text-slate-400">SĐT: {v.phoneNumber}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button 
                          size="sm" 
                          onClick={() => handleReviewVerification(vId, true)} 
                          className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          Duyệt
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleReviewVerification(vId, false)} 
                          className="text-xs px-2.5 py-1 text-rose-600 hover:bg-rose-50"
                        >
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
