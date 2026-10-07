import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationsApi, type RentalApplicationResponse, ApplicationStatus } from '../../services/api';
import { toast } from 'sonner';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  MessageSquare, 
  Search, 
  RefreshCw 
} from 'lucide-react';
import { PageMotion } from '../../components/common/Motion';

export default function TenantApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<RentalApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.getMyApplications();
      if (Array.isArray(res)) {
        setApplications(res);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải danh sách hồ sơ thuê phòng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn rút hồ sơ thuê phòng này?')) return;
    try {
      setWithdrawingId(id);
      await applicationsApi.withdrawApplication(id);
      toast.success('Đã rút hồ sơ thuê phòng thành công.');
      fetchApplications();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể rút hồ sơ vào lúc này.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const filteredApps = applications.filter(app => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') {
      return app.status === ApplicationStatus.Submitted || 
             app.status === ApplicationStatus.UnderReview || 
             app.status === ApplicationStatus.MoreInfoRequested;
    }
    if (activeTab === 'approved') return app.status === ApplicationStatus.Approved;
    if (activeTab === 'rejected') {
      return app.status === ApplicationStatus.Rejected || 
             app.status === ApplicationStatus.Withdrawn;
    }
    return true;
  });

  const getStatusBadge = (status: number) => {
    switch (status) {
      case ApplicationStatus.Approved:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã chấp thuận
          </span>
        );
      case ApplicationStatus.UnderReview:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Chủ nhà đang xem xét
          </span>
        );
      case ApplicationStatus.MoreInfoRequested:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Cần bổ sung thông tin
          </span>
        );
      case ApplicationStatus.Rejected:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Đã từ chối
          </span>
        );
      case ApplicationStatus.Withdrawn:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Đã rút hồ sơ
          </span>
        );
      case ApplicationStatus.Submitted:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Đã nộp hồ sơ
          </span>
        );
    }
  };

  return (
    <PageMotion className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#00153D]" />
            <h1 className="text-2xl font-black text-[#00153D]">Hồ sơ thuê của tôi</h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Theo dõi tình trạng phê duyệt hồ sơ và quy trình tiến tới hợp đồng thuê phòng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchApplications}
            disabled={loading}
            className="p-2 bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F8FAFC] text-[#475569] transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00153D] hover:bg-[#002266] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            Tìm thêm phòng
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'all' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Tất cả ({applications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'pending' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Đang chờ duyệt ({applications.filter(a => a.status === ApplicationStatus.Submitted || a.status === ApplicationStatus.UnderReview || a.status === ApplicationStatus.MoreInfoRequested).length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'approved' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Đã chấp thuận ({applications.filter(a => a.status === ApplicationStatus.Approved).length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'rejected' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Đã từ chối / Hủy ({applications.filter(a => a.status === ApplicationStatus.Rejected || a.status === ApplicationStatus.Withdrawn).length})
        </button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 rounded-xl skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-28 rounded-full skeleton-shimmer" />
                  <div className="h-5 w-3/4 rounded-md skeleton-shimmer" />
                  <div className="h-4 w-1/2 rounded-md skeleton-shimmer" />
                </div>
              </div>
              <div className="h-10 w-full rounded-xl skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">Chưa có hồ sơ thuê phòng nào</h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto mt-1">
              Bạn có thể tìm kiếm phòng trọ ưng ý và gửi hồ sơ trực tiếp từ trang chi tiết phòng để chủ nhà xét duyệt.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00153D] text-white text-sm font-semibold rounded-xl hover:bg-[#002266] transition-colors"
          >
            <Search className="w-4 h-4" />
            Khám phá phòng trọ ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map(app => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 md:p-6 motion-gpu transition-[transform,box-shadow] duration-200 ease-out hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
                <div className="flex items-start gap-4">
                  {app.roomImageUrl ? (
                    <img
                      src={app.roomImageUrl}
                      alt={app.roomTitle}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#E2E8F0]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center shrink-0 border border-[#E2E8F0]">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {getStatusBadge(app.status)}
                      <span className="text-xs text-[#94A3B8]">
                        Gửi lúc: {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <Link
                      to={`/room/${app.roomId}`}
                      className="text-base font-bold text-[#0F172A] hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {app.roomTitle}
                    </Link>
                    <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">
                      {app.roomAddress}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-[#00153D]">
                      <span>Giá thuê: {Number(app.roomPrice).toLocaleString('vi-VN')}đ/tháng</span>
                      <span>Chủ nhà: {app.landlordName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between md:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/tenant/chat', {
                      state: {
                        targetUserId: app.landlordId,
                        targetUserName: app.landlordName,
                        targetUserRole: 'Landlord'
                      }
                    })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#00153D] text-xs font-semibold rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Nhắn tin chủ nhà
                  </button>
                  {(app.status === ApplicationStatus.Submitted || app.status === ApplicationStatus.UnderReview) && (
                    <button
                      type="button"
                      disabled={withdrawingId === app.id}
                      onClick={() => handleWithdraw(app.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 py-1 transition-colors disabled:opacity-50"
                    >
                      {withdrawingId === app.id ? 'Đang rút...' : 'Rút hồ sơ'}
                    </button>
                  )}
                </div>
              </div>

              {/* Applicant Details Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs bg-[#F8FAFC] rounded-xl px-4 my-3 border border-[#F1F5F9]">
                <div>
                  <span className="text-[#94A3B8] block">Nghề nghiệp:</span>
                  <span className="font-semibold text-[#0F172A]">{app.occupation}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block">Thu nhập khai báo:</span>
                  <span className="font-semibold text-[#0F172A]">{Number(app.monthlyIncome).toLocaleString('vi-VN')}đ/tháng</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block">Dự kiến dọn vào:</span>
                  <span className="font-semibold text-[#0F172A]">{new Date(app.desiredMoveInDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block">Thời hạn thuê:</span>
                  <span className="font-semibold text-[#0F172A]">{app.leaseDurationMonths} tháng</span>
                </div>
              </div>

              {/* NEXT-ACTION BANNER */}
              {app.status === ApplicationStatus.Approved && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 mt-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-emerald-950">Hồ sơ đã được phê duyệt thành công!</p>
                      <p className="text-emerald-800 mt-0.5">
                        Chủ nhà đã đồng ý cho bạn thuê phòng. Bước tiếp theo: Ký hợp đồng thuê điện tử và chuyển tiền đặt cọc.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/tenant/chat', {
                      state: {
                        targetUserId: app.landlordId,
                        targetUserName: app.landlordName,
                        targetUserRole: 'Landlord'
                      }
                    })}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm shrink-0"
                  >
                    <span>Liên hệ ký hợp đồng</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {app.status === ApplicationStatus.MoreInfoRequested && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900 mt-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Yêu cầu bổ sung thông tin từ chủ nhà</p>
                    <p className="text-amber-800">
                      {app.rejectionReason || 'Vui lòng bổ sung giấy tờ tùy thân hoặc thông tin xác minh thu nhập qua tin nhắn.'}
                    </p>
                  </div>
                </div>
              )}

              {app.status === ApplicationStatus.Rejected && app.rejectionReason && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900 mt-3">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Lý do từ chối:</p>
                    <p className="text-rose-800 mt-0.5">{app.rejectionReason}</p>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </PageMotion>
  );
}
