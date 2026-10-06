import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../../services/api';
import RentalApplicationModal from '../../components/transaction/RentalApplicationModal';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Building2, 
  MessageSquare, 
  RotateCcw, 
  FileText, 
  RefreshCw, 
  CalendarClock,
  X 
} from 'lucide-react';

export default function TenantViewings() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Reschedule state
  const [reschedulingItem, setReschedulingItem] = useState<any | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [savingReschedule, setSavingReschedule] = useState(false);

  // Application modal state (Next action when viewing completed)
  const [selectedRoomForApply, setSelectedRoomForApply] = useState<any | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentsApi.getMyAppointments();
      if (Array.isArray(res)) {
        setAppointments(res);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải danh sách lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn xem phòng này?')) return;
    try {
      await appointmentsApi.updateStatus(id, 'Cancelled', 'Khách hủy lịch hẹn');
      toast.success('Đã hủy lịch hẹn xem phòng.');
      fetchAppointments();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hủy lịch hẹn.');
    }
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingItem || !newDate) return;

    try {
      setSavingReschedule(true);
      const targetIso = `${newDate}T${newTime}:00Z`;
      await appointmentsApi.rescheduleAppointment(reschedulingItem.id, targetIso, rescheduleReason.trim() || undefined);
      toast.success('Đã gửi yêu cầu đổi lịch xem phòng thành công!');
      setReschedulingItem(null);
      setRescheduleReason('');
      fetchAppointments();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đổi lịch xem phòng.');
    } finally {
      setSavingReschedule(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const s = app.status;
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return s === 'Confirmed' || s === 'Pending' || s === 'Requested' || s === 'Rescheduled';
    }
    if (activeTab === 'completed') return s === 'Completed';
    if (activeTab === 'cancelled') return s === 'Cancelled' || s === 'Rejected' || s === 'NoShow';
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
            Đã xem phòng
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Đã hủy
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Chủ nhà từ chối
          </span>
        );
      case 'NoShow':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Vắng mặt
          </span>
        );
      case 'Requested':
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ chủ nhà xác nhận
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#00153D]" />
            <h1 className="text-2xl font-black text-[#00153D]">Lịch hẹn xem phòng</h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Quản lý và cập nhật thời gian hẹn gặp trực tiếp tại phòng trọ
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'upcoming' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Sắp tới ({appointments.filter(a => ['Confirmed', 'Pending', 'Requested', 'Rescheduled'].includes(a.status)).length})
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
          Đã xem phòng ({appointments.filter(a => a.status === 'Completed').length})
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
        <button
          type="button"
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'cancelled' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Đã hủy / Từ chối ({appointments.filter(a => ['Cancelled', 'Rejected', 'NoShow'].includes(a.status)).length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#64748B] space-y-3">
          <div className="w-8 h-8 border-3 border-[#00153D]/20 border-t-[#00153D] rounded-full animate-spin" />
          <p className="text-sm">Đang tải lịch hẹn xem phòng...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">Chưa có lịch hẹn xem phòng nào</h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto mt-1">
              Khi bạn đặt lịch xem phòng trọ, thời gian và hướng dẫn đến điểm hẹn sẽ xuất hiện tại đây.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00153D] text-white text-sm font-semibold rounded-xl hover:bg-[#002266] transition-colors"
          >
            Tìm phòng trọ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(app => {
            const isUpcoming = ['Confirmed', 'Pending', 'Requested', 'Rescheduled'].includes(app.status);
            const isCompleted = app.status === 'Completed';

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 md:p-6 transition-all hover:shadow-md"
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
                      </div>
                      <Link
                        to={`/room/${app.roomId}`}
                        className="text-base font-bold text-[#0F172A] hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {app.roomTitle}
                      </Link>
                      <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                        {app.roomAddress}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-[#00153D]">
                        <span>Chủ nhà: {app.landlordName || 'Chủ trọ'}</span>
                        {app.roomPrice && (
                          <span>Giá: {Number(app.roomPrice).toLocaleString('vi-VN')}đ/tháng</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2">
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

                    {isUpcoming && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReschedulingItem(app);
                            const d = new Date(app.appointmentDate);
                            setNewDate(d.toISOString().split('T')[0]);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#CBD5E1] text-[#475569] text-xs font-semibold rounded-lg hover:bg-[#F8FAFC] transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Đổi lịch
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(app.id)}
                          className="px-3 py-1.5 text-rose-600 hover:text-rose-800 text-xs font-semibold transition-colors"
                        >
                          Hủy lịch
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Highlight Box */}
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9] my-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#00153D] font-bold">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Thời gian hẹn: {new Date(app.appointmentDate).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })}</span>
                  </div>
                  {app.notes && (
                    <span className="text-[#64748B]">
                      Ghi chú: <span className="font-medium text-[#0F172A]">{app.notes}</span>
                    </span>
                  )}
                </div>

                {/* NEXT ACTION: Viewing Completed -> Submit Application Prompt */}
                {isCompleted && (
                  <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950 mt-2">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">Bạn đã xem phòng này!</p>
                        <p className="text-indigo-800 mt-0.5">
                          Nếu bạn ưng ý với không gian thực tế, hãy nộp hồ sơ thuê ngay để chủ nhà giữ phòng và tạo hợp đồng.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRoomForApply({
                        id: app.roomId,
                        title: app.roomTitle,
                        price: app.roomPrice || 0,
                        landlordName: app.landlordName
                      })}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00153D] hover:bg-[#002266] text-white font-bold rounded-xl transition-colors whitespace-nowrap shadow-sm shrink-0"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Nộp hồ sơ thuê ngay</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-clay-primary max-w-md w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-indigo-600" />
                Đổi lịch xem phòng
              </h3>
              <button onClick={() => setReschedulingItem(null)} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#475569] uppercase mb-1">Chọn ngày hẹn mới</label>
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

              <div>
                <label className="block font-semibold text-[#475569] uppercase mb-1">Lý do dời lịch (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="VD: Bận việc đột xuất vào giờ cũ..."
                  value={rescheduleReason}
                  onChange={e => setRescheduleReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setReschedulingItem(null)}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#475569] font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingReschedule}
                  className="px-5 py-2 bg-[#00153D] text-white font-semibold rounded-xl hover:bg-[#002266] disabled:opacity-50"
                >
                  {savingReschedule ? 'Đang cập nhật...' : 'Xác nhận dời lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rental Application Modal (opened from Completed viewing) */}
      {selectedRoomForApply && (
        <RentalApplicationModal
          isOpen={true}
          onClose={() => setSelectedRoomForApply(null)}
          roomId={selectedRoomForApply.id}
          roomTitle={selectedRoomForApply.title}
          roomPrice={selectedRoomForApply.price}
          landlordName={selectedRoomForApply.landlordName || 'Chủ trọ'}
          onSuccess={() => {
            setSelectedRoomForApply(null);
            navigate('/tenant/applications');
          }}
        />
      )}

    </div>
  );
}
