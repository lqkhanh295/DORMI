import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { adminApi } from '../../services/api';
import { AlertTriangle, CheckCircle2, XCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RoomReportItem {
  id: string;
  roomId: string;
  roomTitle: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: string; // Pending, Resolved, Dismissed
  createdAt: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<RoomReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Resolved' | 'Dismissed'>('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'Resolved' | 'Dismissed') => {
    try {
      await adminApi.updateReportStatus(id, status);
      toast.success(status === 'Resolved' ? 'Đã đánh dấu xử lý vi phạm thành công!' : 'Đã bỏ qua báo cáo.');
      fetchReports();
    } catch {
      toast.error('Thao tác không thành công.');
    }
  };

  const filteredReports = statusFilter === 'all'
    ? reports
    : reports.filter(r => r.status === statusFilter);

  const pendingCount = reports.filter(r => r.status === 'Pending').length;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã xử lý
          </span>
        );
      case 'Dismissed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" /> Đã bỏ qua
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3.5 h-3.5" /> Chờ xử lý
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-8 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo vi phạm</h1>
          <p className="text-sm text-slate-500 mt-1">Tiếp nhận và xử lý phản ánh từ người dùng về tin đăng hoặc chủ trọ.</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              {pendingCount} báo cáo chờ xử lý
            </span>
          )}
          <button
            onClick={fetchReports}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
        {[
          { label: 'Tất cả', value: 'all', count: reports.length },
          { label: 'Chờ xử lý', value: 'Pending', count: pendingCount },
          { label: 'Đã xử lý', value: 'Resolved', count: reports.filter(r => r.status === 'Resolved').length },
          { label: 'Đã bỏ qua', value: 'Dismissed', count: reports.filter(r => r.status === 'Dismissed').length },
        ].map(tab => (
          <button
            key={tab.label}
            onClick={() => setStatusFilter(tab.value as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              statusFilter === tab.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
              statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Đang tải danh sách báo cáo...</p>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-base font-semibold text-slate-700">Không có báo cáo nào</p>
            <p className="text-xs text-slate-400 mt-1">Tất cả báo cáo vi phạm trong danh mục này đã được giải quyết.</p>
          </Card>
        ) : (
          filteredReports.map(r => (
            <Card key={r.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link 
                      to={`/room/${r.roomId}`}
                      target="_blank"
                      className="font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                    >
                      {r.roomTitle || 'Phòng trọ'}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    {renderStatusBadge(r.status)}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm space-y-1">
                    <p className="text-slate-800">
                      <span className="font-semibold text-rose-600">Lý do: </span>
                      {r.reason}
                    </p>
                    {r.details && (
                      <p className="text-slate-600 text-xs">
                        <span className="font-medium text-slate-700">Chi tiết: </span>
                        {r.details}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    Báo cáo bởi: <span className="font-medium text-slate-600">{r.reporterName}</span> ({r.reporterEmail}) · {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                {r.status === 'Pending' && (
                  <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'Resolved')}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                    >
                      Xử lý vi phạm
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'Dismissed')}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Bỏ qua báo cáo
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
