import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { trustSafetyApi, adminApi, type ModerationReport, type AuditLogItem } from '../../services/api';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  ShieldAlert, 
  FileText, 
  History, 
  Eye, 
  ShieldCheck, 
  UserX, 
  AlertOctagon, 
  Info,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<'moderation' | 'audit'>('moderation');
  
  // Moderation state
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Resolved' | 'Dismissed'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'Critical' | 'High' | 'Medium' | 'Low'>('all');
  
  // Resolve modal state
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [modalAction, setModalAction] = useState<string>('RoomHidden');
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  // Audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const data = await trustSafetyApi.getModerationQueue({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        riskLevel: riskFilter !== 'all' ? riskFilter : undefined
      });
      setReports(Array.isArray(data) ? data : []);
    } catch {
      // Fallback to legacy reports if endpoint error
      try {
        const legacy = await adminApi.getReports();
        if (Array.isArray(legacy)) {
          setReports(legacy.map(r => ({
            ...r,
            riskLevel: 'Medium',
            roomAddress: '',
            landlordId: '',
            landlordName: 'Chủ nhà'
          })));
        }
      } catch {
        setReports([]);
      }
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const data = await trustSafetyApi.getAuditLogs(100);
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch {
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'moderation') {
      fetchReports();
    } else {
      fetchAuditLogs();
    }
  }, [activeTab, statusFilter, riskFilter]);

  const handleOpenResolveModal = (report: ModerationReport, defaultAction: string) => {
    setSelectedReport(report);
    setModalAction(defaultAction);
    setModeratorNotes('');
  };

  const handleConfirmResolve = async () => {
    if (!selectedReport) return;
    try {
      setResolving(true);
      const isDismiss = modalAction === 'Dismissed';
      await trustSafetyApi.resolveReport(selectedReport.id, {
        status: isDismiss ? 'Dismissed' : 'Resolved',
        actionTaken: modalAction,
        moderatorNotes: moderatorNotes.trim() || 'Đã kiểm duyệt theo quy trình Trust & Safety'
      });
      toast.success('Đã cập nhật trạng thái kiểm duyệt thành công!');
      setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xử lý vi phạm.');
    } finally {
      setResolving(false);
    }
  };

  const pendingCount = reports.filter(r => r.status === 'Pending').length;

  const renderRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Nghiêm trọng (Critical)
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" /> Rủi ro cao (High)
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Trung bình (Medium)
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-500" /> Thấp (Low)
          </span>
        );
    }
  };

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
            <Clock className="w-3.5 h-3.5" /> Chờ kiểm duyệt
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-8 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-indigo-600" />
            Trung tâm Giám sát An toàn & Báo cáo Vi phạm
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hàng đợi kiểm duyệt rủi ro (Moderation Queue) và truy vết kiểm toán toàn diện (Audit Logs).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              {pendingCount} báo cáo chờ xử lý
            </span>
          )}
          <button
            onClick={() => {
              if (activeTab === 'moderation') fetchReports();
              else fetchAuditLogs();
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'moderation'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Hàng đợi kiểm duyệt ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Nhật ký kiểm toán (Audit Logs)</span>
        </button>
      </div>

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          {/* Filters row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            {/* Status Filter */}
            <div className="flex gap-1">
              {[
                { label: 'Tất cả', value: 'all' },
                { label: 'Chờ xử lý', value: 'Pending' },
                { label: 'Đã xử lý', value: 'Resolved' },
                { label: 'Đã bỏ qua', value: 'Dismissed' }
              ].map(st => (
                <button
                  key={st.value}
                  onClick={() => setStatusFilter(st.value as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    statusFilter === st.value
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Mức độ rủi ro:</span>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value as any)}
                className="px-3 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium"
              >
                <option value="all">Tất cả mức độ</option>
                <option value="Critical">Critical (Nghiêm trọng)</option>
                <option value="High">High (Rủi ro cao)</option>
                <option value="Medium">Medium (Trung bình)</option>
                <option value="Low">Low (Thấp)</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          {loadingReports ? (
            <Card className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Đang tải danh sách hàng đợi kiểm duyệt...</p>
            </Card>
          ) : reports.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
              <p className="text-base font-semibold text-slate-700">Hàng đợi kiểm duyệt sạch sẽ</p>
              <p className="text-xs text-slate-400 mt-1">Không có phản ánh hoặc vi phạm nào trong bộ lọc này.</p>
            </Card>
          ) : (
            reports.map(r => (
              <Card key={r.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/room/${r.roomId}`}
                        target="_blank"
                        className="font-bold text-slate-900 text-base hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                      >
                        {r.roomTitle || 'Phòng trọ'}
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                      {renderRiskBadge(r.riskLevel || 'Medium')}
                      {renderStatusBadge(r.status)}
                    </div>

                    {r.roomAddress && (
                      <p className="text-xs text-slate-500">
                        Địa chỉ phòng: <span className="text-slate-700 font-medium">{r.roomAddress}</span> · Chủ nhà: <span className="text-slate-700 font-medium">{r.landlordName || 'Chủ trọ'}</span>
                      </p>
                    )}

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-sm space-y-1.5">
                      <p className="text-slate-800">
                        <span className="font-semibold text-rose-600">Lý do phản ánh: </span>
                        {r.reason}
                      </p>
                      {r.details && (
                        <p className="text-slate-600 text-xs">
                          <span className="font-medium text-slate-700">Chi tiết mô tả: </span>
                          {r.details}
                        </p>
                      )}
                    </div>

                    {/* Evidence thumbnails if present */}
                    {r.evidenceUrls && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500">Bằng chứng người dùng đính kèm:</p>
                        <div className="flex flex-wrap gap-2">
                          {r.evidenceUrls.split(',').filter(Boolean).map((url, idx) => (
                            <a key={idx} href={url.trim()} target="_blank" rel="noopener noreferrer" className="relative group">
                              <img src={url.trim()} alt="Evidence" className="w-16 h-16 object-cover rounded-lg border border-slate-200 hover:border-indigo-500" />
                              <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resolved notes if resolved */}
                    {r.status !== 'Pending' && r.actionTaken && (
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-0.5">
                        <p><strong>Hành động đã thực hiện:</strong> {r.actionTaken}</p>
                        {r.moderatorNotes && <p><strong>Ghi chú kiểm duyệt:</strong> {r.moderatorNotes}</p>}
                        {r.resolvedAt && <p className="text-[11px] text-emerald-700">Xử lý lúc: {new Date(r.resolvedAt).toLocaleString('vi-VN')}</p>}
                      </div>
                    )}

                    <p className="text-xs text-slate-400">
                      Báo cáo bởi: <span className="font-medium text-slate-600">{r.reporterName}</span> ({r.reporterEmail}) · {new Date(r.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Actions for Pending reports */}
                  {r.status === 'Pending' && (
                    <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 self-start">
                      <Button
                        size="sm"
                        onClick={() => handleOpenResolveModal(r, 'RoomHidden')}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3.5 py-1.5 flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ẩn tin vi phạm
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenResolveModal(r, 'WarningIssued')}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Cảnh cáo chủ trọ
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenResolveModal(r, 'LandlordBanned')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-600" /> Khóa tài khoản
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenResolveModal(r, 'Dismissed')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5 text-slate-500" /> Bỏ qua báo cáo
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <Card className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Nhật ký hoạt động Quản trị & Kiểm duyệt</h3>
              </div>
              <span className="text-xs text-slate-500">{auditLogs.length} sự kiện gần nhất</span>
            </div>

            {loadingAudit ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm">Đang tải nhật ký kiểm toán...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Chưa có bản ghi kiểm toán nào trong hệ thống.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Người thực hiện</th>
                      <th className="py-3 px-4">Hành động</th>
                      <th className="py-3 px-4">Đối tượng</th>
                      <th className="py-3 px-4">Chi tiết thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {log.actorEmail}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            log.action.includes('Hide') || log.action.includes('Reject') || log.action.includes('Ban')
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : log.action.includes('Approve') || log.action.includes('Resolve')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                            {log.entityType} #{log.entityId ? log.entityId.substring(0, 8) : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-md">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* RESOLVE ACTION MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Xử lý báo cáo vi phạm</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="text-slate-500">Tin đăng bị phản ánh:</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedReport.roomTitle}</p>
                <p className="text-slate-600 mt-0.5">Lý do: <span className="text-rose-600 font-medium">{selectedReport.reason}</span></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Chọn hành động xử lý:</label>
                <select
                  value={modalAction}
                  onChange={e => setModalAction(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="RoomHidden">Ẩn tin đăng khỏi danh sách tìm kiếm (RoomHidden)</option>
                  <option value="WarningIssued">Gửi cảnh cáo vi phạm đến chủ trọ (WarningIssued)</option>
                  <option value="LandlordBanned">Khóa vĩnh viễn tài khoản chủ trọ (LandlordBanned)</option>
                  <option value="Dismissed">Bác bỏ báo cáo / Tin hợp lệ (Dismissed)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Ghi chú của kiểm duyệt viên (Lưu vết Audit Log):</label>
                <textarea
                  rows={3}
                  value={moderatorNotes}
                  onChange={e => setModeratorNotes(e.target.value)}
                  placeholder="Ghi rõ lý do xử lý, điều khoản vi phạm hoặc lý do bác bỏ..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                disabled={resolving}
                onClick={() => setSelectedReport(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                disabled={resolving}
                onClick={handleConfirmResolve}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                {resolving ? 'Đang thực hiện...' : 'Xác nhận xử lý & Ghi log'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
