import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationsApi, type RentalApplicationResponse, ApplicationStatus } from '../../services/api';
import { toast } from 'sonner';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  RefreshCw, 
  X, 
  Paperclip, 
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motion';
import { PageMotion } from '../../components/common/Motion';

export default function LandlordApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<RentalApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Review modal state
  const [reviewingApp, setReviewingApp] = useState<RentalApplicationResponse | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approve' | 'Reject' | 'MoreInfo'>('Approve');
  const [reviewReason, setReviewReason] = useState('');
  const [landlordNotes, setLandlordNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.getLandlordApplications();
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

  const handleOpenReview = (app: RentalApplicationResponse, action: 'Approve' | 'Reject' | 'MoreInfo') => {
    setReviewingApp(app);
    setReviewAction(action);
    setReviewReason('');
    setLandlordNotes('');
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp) return;

    let targetStatus: number = ApplicationStatus.Approved;
    if (reviewAction === 'Reject') targetStatus = ApplicationStatus.Rejected;
    if (reviewAction === 'MoreInfo') targetStatus = ApplicationStatus.MoreInfoRequested;

    try {
      setSubmittingReview(true);
      await applicationsApi.reviewApplication(
        reviewingApp.id,
        targetStatus,
        reviewReason.trim() || undefined,
        landlordNotes.trim() || undefined
      );

      toast.success(
        reviewAction === 'Approve' 
          ? 'Đã phê duyệt hồ sơ thuê phòng! Bạn có thể bắt đầu tạo hợp đồng.'
          : reviewAction === 'Reject'
          ? 'Đã từ chối hồ sơ.'
          : 'Đã gửi yêu cầu bổ sung thông tin tới khách thuê.'
      );

      setReviewingApp(null);
      fetchApplications();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xử lý hồ sơ.');
    } finally {
      setSubmittingReview(false);
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
            Đã duyệt
          </span>
        );
      case ApplicationStatus.UnderReview:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Đang xem xét
          </span>
        );
      case ApplicationStatus.MoreInfoRequested:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Chờ bổ sung thông tin
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
            Khách đã rút hồ sơ
          </span>
        );
      case ApplicationStatus.Submitted:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Hồ sơ mới
          </span>
        );
    }
  };

  return (
    <PageMotion className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#00153D]" />
            <h1 className="text-2xl font-black text-[#00153D]">Hồ sơ khách nộp thuê phòng</h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Thẩm định hồ sơ lý lịch, thu nhập và phê duyệt khách thuê để tiến hành tạo hợp đồng
          </p>
        </div>
        <button
          type="button"
          onClick={fetchApplications}
          disabled={loading}
          className="p-2 bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F8FAFC] text-[#475569] transition-colors self-start sm:self-auto"
          title="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'pending' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Cần duyệt ({applications.filter(a => a.status === ApplicationStatus.Submitted || a.status === ApplicationStatus.UnderReview || a.status === ApplicationStatus.MoreInfoRequested).length})
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
          Đã duyệt ({applications.filter(a => a.status === ApplicationStatus.Approved).length})
        </button>
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
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'rejected' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Đã từ chối ({applications.filter(a => a.status === ApplicationStatus.Rejected || a.status === ApplicationStatus.Withdrawn).length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-14 h-14 rounded-full skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 rounded-full skeleton-shimmer" />
                  <div className="h-5 w-2/3 rounded-md skeleton-shimmer" />
                  <div className="h-4 w-1/3 rounded-md skeleton-shimmer" />
                </div>
              </div>
              <div className="h-12 w-full rounded-xl skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Chưa có hồ sơ nào trong mục này</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            Khi khách thuê gửi hồ sơ ứng tuyển vào các phòng trọ của bạn, thông tin chi tiết sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredApps.map(app => {
            const isPending = app.status === ApplicationStatus.Submitted || 
                              app.status === ApplicationStatus.UnderReview || 
                              app.status === ApplicationStatus.MoreInfoRequested;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 md:p-6 motion-gpu transition-[transform,box-shadow] duration-200 ease-out hover:shadow-md hover:-translate-y-0.5 space-y-4"
              >
                {/* Top Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#00153D] text-white flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden">
                      {app.tenantAvatar ? (
                        <img src={app.tenantAvatar} alt={app.tenantName} className="w-full h-full object-cover" />
                      ) : (
                        (app.tenantName || 'T')[0]
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-base text-[#0F172A]">{app.tenantName}</span>
                        {app.isTenantVerified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Đã xác minh CCCD
                          </span>
                        )}
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Email: {app.tenantEmail} {app.tenantPhone ? `• SĐT: ${app.tenantPhone}` : ''}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        Nộp hồ sơ lúc: {new Date(app.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Target Room Badge */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs md:max-w-xs w-full">
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Phòng ứng tuyển:</span>
                    <Link to={`/room/${app.roomId}`} className="font-bold text-[#00153D] hover:underline line-clamp-1">
                      {app.roomTitle}
                    </Link>
                    <span className="text-[#16803C] font-bold block mt-0.5">
                      {Number(app.roomPrice).toLocaleString('vi-VN')}đ/tháng
                    </span>
                  </div>
                </div>

                {/* Qualification details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] rounded-xl p-4 border border-[#F1F5F9] text-xs">
                  <div>
                    <span className="text-[#94A3B8] block font-medium">Nghề nghiệp:</span>
                    <span className="font-semibold text-[#0F172A]">{app.occupation}</span>
                    {app.employerName && <span className="text-[11px] text-[#64748B] block">({app.employerName})</span>}
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block font-medium">Thu nhập khai báo:</span>
                    <span className="font-semibold text-emerald-700 text-sm">
                      {Number(app.monthlyIncome).toLocaleString('vi-VN')}đ/tháng
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block font-medium">Số người ở:</span>
                    <span className="font-semibold text-[#0F172A]">{app.occupantsCount} người</span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block font-medium">Ngày dọn vào dự kiến:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {new Date(app.desiredMoveInDate).toLocaleDateString('vi-VN')} ({app.leaseDurationMonths} tháng)
                    </span>
                  </div>
                </div>

                {/* Note from applicant */}
                {app.noteToLandlord && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-[#0F172A]">
                    <span className="font-semibold text-blue-900 block mb-0.5">Lời nhắn từ khách thuê:</span>
                    <p className="text-[#334155]">{app.noteToLandlord}</p>
                  </div>
                )}

                {/* Documents */}
                {app.documents && app.documents.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold text-[#64748B] uppercase">Tài liệu đính kèm:</span>
                    <div className="flex flex-wrap gap-2">
                      {app.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-lg text-xs font-medium text-[#00153D] transition-colors"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{doc.documentType} ({idx + 1})</span>
                          <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => navigate('/landlord/chat', {
                      state: {
                        targetUserId: app.tenantId,
                        targetUserName: app.tenantName,
                        targetUserRole: 'Tenant',
                        targetRoomTitle: app.roomTitle
                      }
                    })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#00153D] text-xs font-semibold rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Nhắn tin trao đổi
                  </button>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenReview(app, 'MoreInfo')}
                        className="px-3.5 py-1.5 border border-[#CBD5E1] text-[#475569] text-xs font-semibold rounded-lg hover:bg-[#F8FAFC] transition-colors"
                      >
                        Yêu cầu thêm tin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenReview(app, 'Reject')}
                        className="px-3.5 py-1.5 text-rose-600 hover:text-rose-800 text-xs font-semibold transition-colors"
                      >
                        Từ chối
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenReview(app, 'Approve')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Phê duyệt hồ sơ
                      </button>
                    </div>
                  )}

                  {app.status === ApplicationStatus.Approved && (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã duyệt hồ sơ</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/landlord/leases', { state: { prefillApp: app } })}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00153D] hover:bg-[#002266] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Tạo hợp đồng thuê ngay
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Review Confirmation Modal */}
      <AnimatePresence>
        {reviewingApp && (
          <motion.div
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4"
          >
            <motion.div
              variants={modalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-2xl shadow-clay-primary max-w-md w-full p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                <h3 className="font-bold text-base text-[#0F172A]">
                  {reviewAction === 'Approve' && 'Phê duyệt hồ sơ thuê'}
                  {reviewAction === 'Reject' && 'Từ chối hồ sơ thuê'}
                  {reviewAction === 'MoreInfo' && 'Yêu cầu bổ sung thông tin'}
                </h3>
                <button onClick={() => setReviewingApp(null)} className="text-[#94A3B8] hover:text-[#0F172A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#64748B]">
                Khách thuê: <span className="font-bold text-[#0F172A]">{reviewingApp.tenantName}</span> ứng tuyển cho phòng <span className="font-bold text-[#0F172A]">{reviewingApp.roomTitle}</span>.
              </p>

              <form onSubmit={handleConfirmReview} className="space-y-4 text-xs">
                {reviewAction !== 'Approve' && (
                  <div>
                    <label className="block font-semibold text-[#475569] uppercase mb-1">
                      {reviewAction === 'Reject' ? 'Lý do từ chối' : 'Thông tin cần bổ sung'} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder={
                        reviewAction === 'Reject'
                          ? 'VD: Phòng đã kín lịch hoặc tiêu chuẩn thu nhập chưa phù hợp...'
                          : 'VD: Vui lòng gửi ảnh chụp thẻ sinh viên hoặc bảng lương 3 tháng gần nhất...'
                      }
                      value={reviewReason}
                      onChange={e => setReviewReason(e.target.value)}
                      className="w-full p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm outline-none resize-none"
                    />
                  </div>
                )}

                {reviewAction === 'Approve' && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                    <p className="font-bold">Xác nhận phê duyệt khách thuê này?</p>
                    <p className="text-[11px] text-emerald-800">
                      Khách thuê sẽ nhận được thông báo chấp thuận. Bạn có thể tiến hành thảo luận điều khoản và ký hợp đồng thuê trên hệ thống.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#475569] uppercase mb-1">Ghi chú nội bộ (chỉ bạn thấy)</label>
                  <input
                    type="text"
                    placeholder="Ghi chú riêng về khách..."
                    value={landlordNotes}
                    onChange={e => setLandlordNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setReviewingApp(null)}
                    className="px-4 py-2 border border-[#CBD5E1] text-[#475569] font-semibold rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className={`px-5 py-2 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                      reviewAction === 'Approve' 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : reviewAction === 'Reject'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {submittingReview ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </PageMotion>
  );
}
