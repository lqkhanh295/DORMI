import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../../services/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Building2, 
  MessageSquare, 
  RotateCcw, 
  RefreshCw, 
  CalendarClock, 
  X, 
  Check 
} from 'lucide-react';

export default function LandlordViewings() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'all'>('pending');

  // Reschedule / Action modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'reschedule' | 'reject' | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [actionReason, setActionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentsApi.getMyAppointments();
      if (Array.isArray(res)) {
        setAppointments(res);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải danh sách lịch hẹn xem phòng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, reason?: string) => {
    try {
      await appointmentsApi.updateStatus(id, status, reason);
      toast.success(
        status === 'Confirmed' ? 'Đã xác nhận lịch hẹn xem phòng!' :
        status === 'Completed' ? 'Đã đánh dấu buổi xem phòng hoàn tất!' :
        status === 'NoShow' ? 'Đã đánh dấu khách vắng mặt!' :
        'Đã cập nhật trạng thái lịch hẹn.'
      );
      fetchAppointments();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật trạng thái lịch hẹn.');
    }
  };

  const handleConfirmModalAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setSubmittingAction(true);
      if (actionType === 'reschedule') {
        const targetIso = `${newDate}T${newTime}:00Z`;
        await appointmentsApi.rescheduleAppointment(selectedApp.id, targetIso, actionReason.trim() || undefined);
        toast.success('Đã đề xuất dời lịch xem phòng thành công!');
      } else if (actionType === 'reject') {
        await appointmentsApi.updateStatus(selectedApp.id, 'Rejected', actionReason.trim() || undefined);
        toast.success('Đã từ chối lịch hẹn xem phòng.');
      }
      setSelectedApp(null);
      setActionType(null);
      setActionReason('');
      fetchAppointments();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xử lý thao tác.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const s = app.status;
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') {
      return s === 'Pending' || s === 'Requested';
    }
    if (activeTab === 'confirmed') {
      return s === 'Confirmed' || s === 'Rescheduled';
    }
    if (activeTab === 'completed') {
      return s === 'Completed';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Đã xác nhận
          </span>
        );
      case 'Rescheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <CalendarClock className="w-3.5 h-3.5 text-purple-600" />
            Đã đổi lịch
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            Đã hoàn tất
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Khách đã hủy
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Đã từ chối
          </span>
        );
      case 'NoShow':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Khách vắng mặt
          </span>
        );
      case 'Requested':
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ bạn xác nhận
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#00153D]" />
            <h1 className="text-2xl font-black text-[#00153D]">Lịch xem phòng của khách</h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Theo dõi, xác nhận và điều phối các cuộc hẹn xem phòng trực tiếp với khách thuê
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAppointments}
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
          Chờ xác nhận ({appointments.filter(a => a.status === 'Pending' || a.status === 'Requested').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('confirmed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'confirmed' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Đã xác nhận / Đổi lịch ({appointments.filter(a => a.status === 'Confirmed' || a.status === 'Rescheduled').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'completed' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Đã xem xong ({appointments.filter(a => a.status === 'Completed').length})
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
          Tất cả ({appointments.length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#64748B] space-y-3">
          <div className="w-8 h-8 border-3 border-[#00153D]/20 border-t-[#00153D] rounded-full animate-spin" />
          <p className="text-sm">Đang tải lịch hẹn xem phòng...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Chưa có lịch hẹn nào</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            Khi khách hàng đặt hẹn xem các phòng trọ của bạn, lịch hẹn sẽ được tổng hợp tại đây để bạn tiện sắp xếp tiếp đón.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(app => {
            const isPending = app.status === 'Pending' || app.status === 'Requested';
            const isConfirmed = app.status === 'Confirmed' || app.status === 'Rescheduled';

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 md:p-6 transition-all hover:shadow-md space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#00153D] text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                      {app.customerAvatar ? (
                        <img src={app.customerAvatar} alt={app.customerName} className="w-full h-full object-cover" />
                      ) : (
                        (app.customerName || 'K')[0]
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-base text-[#0F172A]">{app.customerName}</span>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-xs text-[#64748B]">
                        {app.customerPhone ? `SĐT: ${app.customerPhone}` : 'Khách thuê DORMI'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-[#00153D]">
                        <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <Link to={`/room/${app.roomId}`} className="hover:underline">
                          {app.roomTitle}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/landlord/chat', {
                        state: {
                          targetUserId: app.customerId,
                          targetUserName: app.customerName,
                          targetUserRole: 'Tenant',
                          targetRoomTitle: app.roomTitle
                        }
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#00153D] text-xs font-semibold rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Nhắn tin
                    </button>
                  </div>
                </div>

                {/* Appointment time highlight */}
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#00153D] font-bold">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Lịch hẹn: {new Date(app.appointmentDate).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })}</span>
                  </div>
                  {app.notes && (
                    <span className="text-[#64748B]">
                      Ghi chú: <span className="font-medium text-[#0F172A]">{app.notes}</span>
                    </span>
                  )}
                </div>

                {/* Landlord Action bar */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setActionType('reject');
                        }}
                        className="px-3.5 py-1.5 text-rose-600 hover:text-rose-800 text-xs font-semibold transition-colors"
                      >
                        Từ chối
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setActionType('reschedule');
                          const d = new Date(app.appointmentDate);
                          setNewDate(d.toISOString().split('T')[0]);
                        }}
                        className="px-3.5 py-1.5 border border-[#CBD5E1] text-[#475569] text-xs font-semibold rounded-lg hover:bg-[#F8FAFC] transition-colors inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Đề xuất giờ khác
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, 'Confirmed')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Xác nhận lịch
                      </button>
                    </>
                  )}

                  {isConfirmed && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, 'NoShow')}
                        className="px-3.5 py-1.5 text-amber-600 hover:text-amber-800 text-xs font-semibold transition-colors"
                      >
                        Khách không đến (No-show)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setActionType('reschedule');
                          const d = new Date(app.appointmentDate);
                          setNewDate(d.toISOString().split('T')[0]);
                        }}
                        className="px-3.5 py-1.5 border border-[#CBD5E1] text-[#475569] text-xs font-semibold rounded-lg hover:bg-[#F8FAFC] transition-colors inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Dời lịch hẹn
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(app.id, 'Completed')}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Đã xem phòng xong
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal (Reschedule / Reject) */}
      {selectedApp && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-clay-primary max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-base text-[#0F172A]">
                {actionType === 'reschedule' ? 'Đề xuất đổi lịch xem phòng' : 'Từ chối lịch hẹn xem phòng'}
              </h3>
              <button 
                onClick={() => { setSelectedApp(null); setActionType(null); }} 
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmModalAction} className="space-y-4 text-xs">
              {actionType === 'reschedule' && (
                <>
                  <div>
                    <label className="block font-semibold text-[#475569] uppercase mb-1">Ngày hẹn mới</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#475569] uppercase mb-1">Khung giờ mới</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['09:00', '10:30', '14:00', '16:00', '18:00'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewTime(t)}
                          className={`py-2 rounded-lg font-semibold border ${newTime === t ? 'bg-[#00153D] text-white border-[#00153D]' : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0]'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-[#475569] uppercase mb-1">
                  {actionType === 'reschedule' ? 'Lý do đổi lịch (gửi tới khách)' : 'Lý do từ chối'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm..."
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  className="w-full p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => { setSelectedApp(null); setActionType(null); }}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#475569] font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`px-5 py-2 text-white font-semibold rounded-xl disabled:opacity-50 ${
                    actionType === 'reschedule' ? 'bg-[#00153D] hover:bg-[#002266]' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submittingAction ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
