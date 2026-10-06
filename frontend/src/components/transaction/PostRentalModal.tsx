import { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Wrench, 
  CreditCard, 
  Star, 
  ShieldCheck, 
  Plus, 
  Check, 
  RefreshCw,
  Home
} from 'lucide-react';
import { 
  postRentalApi, 
  type LeaseContractResponse, 
  type RentalPaymentScheduleResponse, 
  type MaintenanceRequestResponse, 
  type PostRentalSummaryResponse 
} from '../../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motion';

interface PostRentalModalProps {
  lease: LeaseContractResponse;
  isLandlord: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function PostRentalModal({ lease, isLandlord, onClose, onRefresh }: PostRentalModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'maintenance' | 'renewal-moveout'>('overview');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PostRentalSummaryResponse | null>(null);
  const [payments, setPayments] = useState<RentalPaymentScheduleResponse[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRequestResponse[]>([]);

  // Sub-modal / Action form states
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    type: 'Utilities',
    title: 'Tiền điện nước tháng này',
    amount: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    landlordNotes: ''
  });

  const [payingSchedule, setPayingSchedule] = useState<RentalPaymentScheduleResponse | null>(null);
  const [paymentRefCode, setPaymentRefCode] = useState('');

  const [isAddingMaintenance, setIsAddingMaintenance] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    title: '',
    description: '',
    category: 'Electricity',
    priority: 'Medium'
  });

  const [actioningTicket, setActioningTicket] = useState<MaintenanceRequestResponse | null>(null);
  const [technicianName, setTechnicianName] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [repairCost, setRepairCost] = useState(0);

  const [confirmingTicket, setConfirmingTicket] = useState<MaintenanceRequestResponse | null>(null);
  const [tenantRating, setTenantRating] = useState(5);
  const [tenantFeedback, setTenantFeedback] = useState('');

  const [renewalDate, setRenewalDate] = useState(
    new Date(new Date(lease.endDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [renewalNotes, setRenewalNotes] = useState('Đề xuất gia hạn hợp đồng thêm 12 tháng.');

  const [moveOutDate, setMoveOutDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [moveOutReason, setMoveOutReason] = useState('Chuyển công tác / Hết hạn hợp đồng');

  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionNotes, setInspectionNotes] = useState('Phòng sạch sẽ, bàn giao đầy đủ thiết bị và chìa khóa.');
  const [deductionsAmount, setDeductionsAmount] = useState(0);
  const [deductionReason, setDeductionReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, payRes, mainRes] = await Promise.all([
        postRentalApi.getSummary(lease.id).catch(() => null),
        postRentalApi.getPayments(lease.id).catch(() => []),
        postRentalApi.getMaintenance({ leaseId: lease.id, isLandlord }).catch(() => [])
      ]);

      if (sumRes) setSummary(sumRes);
      if (Array.isArray(payRes)) setPayments(payRes);
      if (Array.isArray(mainRes)) setMaintenanceList(mainRes);
    } catch (err: any) {
      toast.error('Không thể tải thông tin vận hành hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lease.id]);

  // Handlers
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.title.trim()) {
      toast.error('Vui lòng nhập tên khoản thanh toán.');
      return;
    }
    if (newPayment.amount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ.');
      return;
    }

    try {
      await postRentalApi.createPayment(lease.id, {
        type: newPayment.type,
        title: newPayment.title.trim(),
        amount: Number(newPayment.amount),
        dueDate: new Date(newPayment.dueDate).toISOString(),
        landlordNotes: newPayment.landlordNotes
      });
      toast.success('Đã tạo hóa đơn thanh toán mới thành công!');
      setIsAddingPayment(false);
      setNewPayment({
        type: 'Utilities',
        title: 'Tiền điện nước tháng này',
        amount: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        landlordNotes: ''
      });
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo hóa đơn.');
    }
  };

  const handleRecordPayment = async (scheduleId: string) => {
    try {
      await postRentalApi.recordPayment(scheduleId, {
        paymentMethod: 'BankTransfer',
        paymentReference: paymentRefCode.trim() || 'Chuyển khoản ngân hàng',
        markAsPaid: true
      });
      toast.success('Đã ghi nhận thanh toán thành công!');
      setPayingSchedule(null);
      setPaymentRefCode('');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật thanh toán.');
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintenance.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề sự cố.');
      return;
    }
    if (!newMaintenance.description.trim()) {
      toast.error('Vui lòng mô tả chi tiết sự cố cần sửa chữa.');
      return;
    }

    try {
      await postRentalApi.createMaintenance({
        leaseContractId: lease.id,
        title: newMaintenance.title.trim(),
        description: newMaintenance.description.trim(),
        category: newMaintenance.category,
        priority: newMaintenance.priority
      });
      toast.success('Đã gửi yêu cầu sửa chữa đến chủ nhà thành công!');
      setIsAddingMaintenance(false);
      setNewMaintenance({
        title: '',
        description: '',
        category: 'Electricity',
        priority: 'Medium'
      });
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi yêu cầu.');
    }
  };

  const handleUpdateMaintenanceStatus = async (status: string) => {
    if (!actioningTicket) return;
    try {
      await postRentalApi.updateMaintenanceStatus(actioningTicket.id, {
        status,
        assignedTo: technicianName.trim() || undefined,
        resolutionNotes: resolutionNotes.trim() || undefined,
        actualCost: repairCost > 0 ? repairCost : undefined
      });
      toast.success(`Đã cập nhật trạng thái sự cố sang "${status}".`);
      setActioningTicket(null);
      setTechnicianName('');
      setResolutionNotes('');
      setRepairCost(0);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật sự cố.');
    }
  };

  const handleConfirmMaintenance = async () => {
    if (!confirmingTicket) return;
    try {
      await postRentalApi.confirmMaintenance(confirmingTicket.id, {
        tenantFeedback: tenantFeedback.trim(),
        tenantRating
      });
      toast.success('Cảm ơn bạn đã xác nhận và đánh giá kết quả sửa chữa!');
      setConfirmingTicket(null);
      setTenantFeedback('');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể xác nhận hoàn tất.');
    }
  };

  const handleRequestRenewal = async () => {
    try {
      await postRentalApi.requestRenewal(lease.id, {
        proposedEndDate: new Date(renewalDate).toISOString(),
        notes: renewalNotes.trim()
      });
      toast.success('Đã gửi đề xuất gia hạn hợp đồng thuê thành công!');
      loadData();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi yêu cầu gia hạn.');
    }
  };

  const handleRespondRenewal = async (accepted: boolean) => {
    try {
      await postRentalApi.respondRenewal(lease.id, { accepted });
      toast.success(accepted ? 'Đã chấp thuận gia hạn hợp đồng thuê!' : 'Đã từ chối gia hạn hợp đồng.');
      loadData();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể phản hồi yêu cầu.');
    }
  };

  const handleRequestMoveOut = async () => {
    try {
      await postRentalApi.requestMoveOut(lease.id, {
        proposedMoveOutDate: new Date(moveOutDate).toISOString(),
        reason: moveOutReason.trim()
      });
      toast.success('Đã gửi thông báo kế hoạch trả phòng đến đối tác.');
      loadData();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi thông báo trả phòng.');
    }
  };

  const handleCompleteMoveOutInspection = async () => {
    try {
      await postRentalApi.completeMoveOutInspection(lease.id, {
        inspectionNotes: inspectionNotes.trim(),
        deductionsAmount: Number(deductionsAmount) || 0,
        deductionReason: deductionReason.trim() || undefined,
        confirmCheckout: true
      });
      toast.success('Đã hoàn tất biên bản kiểm tra, quyết toán cọc và thanh lý hợp đồng thuê!');
      setIsInspecting(false);
      loadData();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hoàn tất thanh lý.');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('vi-VN');
  };

  const getPriorityBadge = (p: string) => {
    switch (p.toLowerCase()) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">Khẩn cấp</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Ưu tiên cao</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">Bình thường</span>;
    }
  };

  const getMaintenanceStatusBadge = (s: string) => {
    switch (s.toUpperCase()) {
      case 'OPEN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Mới gửi</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Đã giao thợ</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Đang xử lý</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã sửa xong</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Đã đóng</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{s}</span>;
    }
  };

  const calculatedSettlement = Math.max(0, lease.deposit - (Number(deductionsAmount) || 0));

  return (
    <motion.div
      variants={modalBackdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto"
    >
      <motion.div
        variants={modalContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl md:rounded-3xl shadow-clay-primary border border-[#E2E8F0] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden motion-gpu"
      >
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-[#0F172A]">
                  Vận hành & Hậu thuê: {lease.roomTitle}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${lease.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'}`}>
                  {lease.status === 'Active' ? 'Đang hiệu lực' : lease.status}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isLandlord ? `Khách thuê: ${lease.tenantName}` : `Chủ trọ: ${lease.landlordName}`} • {lease.roomAddress}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E2E8F0] px-4 md:px-6 bg-[#F8FAFC] gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#00153D] text-[#00153D]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Tổng quan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-[#00153D] text-[#00153D]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Kỳ thanh toán (Rail A)
            {summary && summary.pendingPaymentsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                {summary.pendingPaymentsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'border-[#00153D] text-[#00153D]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Báo hỏng & Sửa chữa
            {summary && summary.activeMaintenanceCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center">
                {summary.activeMaintenanceCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('renewal-moveout')}
            className={`py-3 px-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'renewal-moveout'
                ? 'border-[#00153D] text-[#00153D]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Gia hạn & Trả phòng
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-[#64748B]">Đang tải dữ liệu vận hành phòng...</div>
          ) : (
            <>
              {/* TAB 1: TỔNG QUAN */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-700">Giá thuê định kỳ</p>
                      <p className="text-lg font-bold text-blue-900 mt-1">
                        {lease.monthlyRent.toLocaleString('vi-VN')} đ
                      </p>
                      <p className="text-[11px] text-blue-600 mt-0.5">Chu kỳ: {lease.paymentCycleMonths} tháng / lần</p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-700">Tiền đặt cọc an toàn</p>
                      <p className="text-lg font-bold text-emerald-900 mt-1">
                        {lease.deposit.toLocaleString('vi-VN')} đ
                      </p>
                      <p className="text-[11px] text-emerald-600 mt-0.5">Được bảo vệ theo hợp đồng</p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-700">Kỳ thanh toán tới</p>
                      <p className="text-lg font-bold text-amber-900 mt-1">
                        {summary?.nextPaymentAmount ? `${summary.nextPaymentAmount.toLocaleString('vi-VN')} đ` : 'Đã đủ kỳ'}
                      </p>
                      <p className="text-[11px] text-amber-600 mt-0.5">
                        Hạn: {summary?.nextPaymentDueDate ? formatDate(summary.nextPaymentDueDate) : 'Không có khoản nợ'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                      <p className="text-xs font-semibold text-purple-700">Sự cố đang xử lý</p>
                      <p className="text-lg font-bold text-purple-900 mt-1">
                        {summary?.activeMaintenanceCount ?? 0} sự cố
                      </p>
                      <p className="text-[11px] text-purple-600 mt-0.5">Thời gian xử lý cam kết 24-48h</p>
                    </div>
                  </div>

                  {/* Next Step Action Guide */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-bold text-sm md:text-base">Quy trình vận hành hợp đồng thuê DORMI</h3>
                    </div>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      DORMI tách biệt hoàn toàn tiền thanh toán phòng giữa khách & chủ nhà (Rail A) và phí dịch vụ nền tảng (Rail B). 
                      Mọi biên bản kiểm tra sự cố, phân công thợ và quyết toán trả phòng đều được lưu vết minh bạch.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('payments')}
                        className="px-3.5 py-1.5 bg-white text-[#00153D] hover:bg-blue-50 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Xem lịch thanh toán
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('maintenance')}
                        className="px-3.5 py-1.5 bg-blue-800/80 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        {isLandlord ? 'Quản lý sự cố' : 'Báo sự cố thiết bị'}
                      </button>
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] space-y-3">
                    <h4 className="font-bold text-sm text-[#0F172A]">Thông tin thời hạn & Tiện ích hợp đồng</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#64748B]">Ngày bắt đầu hợp đồng:</span>
                        <span className="font-semibold text-[#0F172A] ml-2">{formatDate(lease.startDate)}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B]">Ngày kết thúc hợp đồng:</span>
                        <span className="font-semibold text-[#0F172A] ml-2">{formatDate(lease.endDate)}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[#64748B]">Quy định điện nước & dịch vụ:</span>
                        <p className="font-medium text-[#0F172A] mt-1 p-2.5 bg-white rounded-lg border border-[#E2E8F0]">
                          {lease.utilitiesDescription || 'Chưa ghi chú'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: KỲ THANH TOÁN (RAIL A) */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm md:text-base text-[#0F172A]">
                        Lịch trình hóa đơn thanh toán (Rail A: Khách → Chủ trọ)
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Bao gồm tiền cọc, tiền thuê phòng hàng tháng và hóa đơn điện nước phát sinh.
                      </p>
                    </div>
                    {isLandlord && (
                      <button
                        type="button"
                        onClick={() => setIsAddingPayment(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00153D] hover:bg-[#002266] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tạo hóa đơn điện nước / dịch vụ
                      </button>
                    )}
                  </div>

                  {/* Payment Schedule List */}
                  {payments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
                      Chưa có hóa đơn nào được tạo cho hợp đồng này.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payments.map(sch => {
                        const isPaid = sch.status === 'Paid';
                        return (
                          <div 
                            key={sch.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                              isPaid ? 'bg-white border-[#E2E8F0]' : 'bg-amber-50/50 border-amber-200'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  sch.type === 'Deposit' ? 'bg-purple-100 text-purple-800' :
                                  sch.type === 'Utilities' ? 'bg-cyan-100 text-cyan-800' :
                                  sch.type === 'MoveOutSettlement' ? 'bg-indigo-100 text-indigo-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {sch.type === 'Deposit' ? 'Đặt cọc' : sch.type === 'Utilities' ? 'Điện nước' : sch.type === 'MoveOutSettlement' ? 'Quyết toán' : 'Tiền thuê'}
                                </span>
                                <h4 className="font-bold text-sm text-[#0F172A]">{sch.title}</h4>
                                {isPaid ? (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Đã thanh toán
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Chưa thanh toán
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#64748B]">
                                Hạn thanh toán: <span className="font-semibold text-[#0F172A]">{formatDate(sch.dueDate)}</span>
                                {sch.paidAt && ` • Đã trả lúc: ${formatDate(sch.paidAt)}`}
                              </p>
                              {sch.landlordNotes && (
                                <p className="text-xs text-[#475569] italic">Ghi chú: {sch.landlordNotes}</p>
                              )}
                              {sch.paymentReference && (
                                <p className="text-xs text-[#64748B]">Mã giao dịch / đối soát: {sch.paymentReference}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-xs text-[#64748B] block">Số tiền</span>
                                <span className="text-base font-bold text-[#00153D]">
                                  {sch.amount.toLocaleString('vi-VN')} đ
                                </span>
                              </div>

                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => setPayingSchedule(sch)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                                >
                                  {isLandlord ? 'Xác nhận đã nhận' : 'Xác nhận đã trả'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Modal Record Payment */}
                  {payingSchedule && (
                    <div className="fixed inset-0 z-50 bg-[#0F172A]/40 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-clay-primary space-y-4">
                        <h4 className="font-bold text-base text-[#0F172A]">
                          Xác nhận thanh toán: {payingSchedule.title}
                        </h4>
                        <p className="text-xs text-[#64748B]">
                          Số tiền: <span className="font-bold text-sm text-[#00153D]">{payingSchedule.amount.toLocaleString('vi-VN')} đ</span>
                        </p>
                        <div>
                          <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                            Mã ủy nhiệm chi / Chuyển khoản hoặc ghi chú đối soát
                          </label>
                          <input
                            type="text"
                            placeholder="VD: MBBANK12345678 hoặc Tiền mặt"
                            value={paymentRefCode}
                            onChange={(e) => setPaymentRefCode(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setPayingSchedule(null)}
                            className="px-3 py-1.5 text-xs text-[#64748B] hover:bg-slate-100 rounded-lg"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRecordPayment(payingSchedule.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                          >
                            Lưu xác nhận thanh toán
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Add Payment Schedule */}
                  {isAddingPayment && (
                    <div className="fixed inset-0 z-50 bg-[#0F172A]/40 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-clay-primary space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                          <h4 className="font-bold text-base text-[#0F172A]">Tạo hóa đơn dịch vụ mới</h4>
                          <button onClick={() => setIsAddingPayment(false)} className="text-[#64748B]">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <form onSubmit={handleCreatePayment} className="space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Loại khoản phí</label>
                            <select
                              value={newPayment.type}
                              onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                            >
                              <option value="Utilities">Điện nước / Dịch vụ</option>
                              <option value="Rent">Tiền thuê bổ sung</option>
                              <option value="LateFee">Phí quá hạn</option>
                              <option value="Deposit">Tiền cọc bổ sung</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Tiêu đề hóa đơn</label>
                            <input
                              type="text"
                              value={newPayment.title}
                              onChange={(e) => setNewPayment({ ...newPayment, title: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Số tiền (VNĐ)</label>
                            <input
                              type="number"
                              value={newPayment.amount}
                              onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Hạn thanh toán</label>
                            <input
                              type="date"
                              value={newPayment.dueDate}
                              onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Ghi chú chi tiết</label>
                            <input
                              type="text"
                              placeholder="VD: Chỉ số điện cũ 120, mới 190 (70 số x 3.5k)..."
                              value={newPayment.landlordNotes}
                              onChange={(e) => setNewPayment({ ...newPayment, landlordNotes: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsAddingPayment(false)}
                              className="px-3 py-1.5 text-xs text-[#64748B] hover:bg-slate-100 rounded-lg"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-[#00153D] hover:bg-[#002266] text-white font-bold text-xs rounded-lg"
                            >
                              Phát hành hóa đơn
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BÁO HỎNG & SỬA CHỮA (MAINTENANCE TICKETING) */}
              {activeTab === 'maintenance' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm md:text-base text-[#0F172A]">
                        Hệ thống phiếu hỗ trợ sự cố & Sửa chữa thiết bị
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Quy trình: Mới gửi → Giao thợ → Đang xử lý → Đã sửa xong → Khách nghiệm thu.
                      </p>
                    </div>
                    {!isLandlord && (
                      <button
                        type="button"
                        onClick={() => setIsAddingMaintenance(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Gửi phiếu báo sự cố mới
                      </button>
                    )}
                  </div>

                  {maintenanceList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
                      Phòng chưa có báo cáo sự cố nào. Trang thiết bị hoạt động tốt!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {maintenanceList.map(item => (
                        <div 
                          key={item.id}
                          className="p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-slate-300 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getMaintenanceStatusBadge(item.status)}
                                {getPriorityBadge(item.priority)}
                                <span className="text-xs font-semibold text-[#64748B]">Phân loại: {item.category}</span>
                              </div>
                              <h4 className="font-bold text-sm text-[#0F172A]">{item.title}</h4>
                              <p className="text-xs text-[#475569] leading-relaxed">{item.description}</p>
                            </div>

                            <span className="text-[11px] text-[#94A3B8] shrink-0">
                              Ngày gửi: {formatDate(item.createdAt)}
                            </span>
                          </div>

                          {/* Detail status progress */}
                          {(item.assignedTo || item.resolutionNotes || item.actualCost) && (
                            <div className="p-3 bg-[#F8FAFC] rounded-xl text-xs space-y-1 border border-[#F1F5F9]">
                              {item.assignedTo && (
                                <p className="text-[#0F172A]">
                                  <span className="font-semibold text-[#64748B]">Thợ phụ trách:</span> {item.assignedTo}
                                </p>
                              )}
                              {item.resolutionNotes && (
                                <p className="text-[#0F172A]">
                                  <span className="font-semibold text-[#64748B]">Nội dung xử lý:</span> {item.resolutionNotes}
                                </p>
                              )}
                              {item.actualCost && (
                                <p className="text-[#0F172A]">
                                  <span className="font-semibold text-[#64748B]">Chi phí thực tế:</span> {item.actualCost.toLocaleString('vi-VN')} đ
                                </p>
                              )}
                            </div>
                          )}

                          {/* Feedback section if completed */}
                          {item.tenantConfirmed && (
                            <div className="p-3 bg-emerald-50 rounded-xl text-xs border border-emerald-200 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-emerald-900 block">Khách thuê đã nghiệm thu & đánh giá:</span>
                                <p className="text-emerald-800 italic mt-0.5">"{item.tenantFeedback || 'Rất hài lòng'}"</p>
                              </div>
                              <div className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="w-4 h-4 fill-amber-400" />
                                {item.tenantRating} / 5
                              </div>
                            </div>
                          )}

                          {/* Action controls */}
                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#F1F5F9]">
                            {/* Landlord Actions */}
                            {isLandlord && item.status !== 'CLOSED' && (
                              <div className="flex items-center gap-2">
                                {item.status === 'OPEN' && (
                                  <button
                                    type="button"
                                    onClick={() => setActioningTicket(item)}
                                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg"
                                  >
                                    Phân công thợ
                                  </button>
                                )}
                                {item.status === 'ASSIGNED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateMaintenanceStatus('IN_PROGRESS')}
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg"
                                  >
                                    Bắt đầu sửa chữa
                                  </button>
                                )}
                                {item.status === 'IN_PROGRESS' && (
                                  <button
                                    type="button"
                                    onClick={() => setActioningTicket(item)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                                  >
                                    Hoàn thành sửa chữa
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Tenant Confirmation Action */}
                            {!isLandlord && item.status === 'RESOLVED' && (
                              <button
                                type="button"
                                onClick={() => setConfirmingTicket(item)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
                              >
                                Nghiệm thu & Đóng sự cố
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Modal Add Maintenance */}
                  {isAddingMaintenance && (
                    <div className="fixed inset-0 z-50 bg-[#0F172A]/40 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-clay-primary space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                          <h4 className="font-bold text-base text-[#0F172A]">Gửi phiếu báo sự cố phòng</h4>
                          <button onClick={() => setIsAddingMaintenance(false)} className="text-[#64748B]">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <form onSubmit={handleCreateMaintenance} className="space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Loại sự cố</label>
                            <select
                              value={newMaintenance.category}
                              onChange={(e) => setNewMaintenance({ ...newMaintenance, category: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                            >
                              <option value="Electricity">Điện (Đèn, ổ cắm, aptomat)</option>
                              <option value="Plumbing">Nước (Vòi, bồn cầu, thoát sàn)</option>
                              <option value="AirConditioner">Máy lạnh / Điều hòa</option>
                              <option value="Appliance">Tủ lạnh / Máy giặt / Gia dụng</option>
                              <option value="Structural">Cửa, khóa, tường, thấm dột</option>
                              <option value="Other">Khác</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Mức độ ưu tiên</label>
                            <select
                              value={newMaintenance.priority}
                              onChange={(e) => setNewMaintenance({ ...newMaintenance, priority: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                            >
                              <option value="Low">Thấp (Có thể chờ vài ngày)</option>
                              <option value="Medium">Bình thường (1 - 2 ngày)</option>
                              <option value="High">Ưu tiên cao (Trong ngày)</option>
                              <option value="Urgent">Khẩn cấp (Nguy cơ ngập, chập điện)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Tiêu đề sự cố</label>
                            <input
                              type="text"
                              placeholder="VD: Máy lạnh kêu to và rò rỉ nước"
                              value={newMaintenance.title}
                              onChange={(e) => setNewMaintenance({ ...newMaintenance, title: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Mô tả cụ thể</label>
                            <textarea
                              rows={3}
                              placeholder="Mô tả hiện tượng, vị trí và thời điểm phát sinh..."
                              value={newMaintenance.description}
                              onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsAddingMaintenance(false)}
                              className="px-3 py-1.5 text-xs text-[#64748B] hover:bg-slate-100 rounded-lg"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg"
                            >
                              Gửi phiếu báo
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Modal Action Ticket for Landlord */}
                  {actioningTicket && (
                    <div className="fixed inset-0 z-50 bg-[#0F172A]/40 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-clay-primary space-y-4">
                        <h4 className="font-bold text-base text-[#0F172A]">
                          Xử lý sự cố: {actioningTicket.title}
                        </h4>
                        {actioningTicket.status === 'OPEN' ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                                Tên thợ / Đơn vị kỹ thuật phụ trách
                              </label>
                              <input
                                type="text"
                                placeholder="VD: Thợ điện lạnh Nam (0912xxx)"
                                value={technicianName}
                                onChange={(e) => setTechnicianName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setActioningTicket(null)} className="px-3 py-1.5 text-xs text-[#64748B]">Hủy</button>
                              <button
                                onClick={() => handleUpdateMaintenanceStatus('ASSIGNED')}
                                className="px-4 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-lg"
                              >
                                Xác nhận phân công
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                                Ghi chú kết quả sửa chữa
                              </label>
                              <textarea
                                rows={2}
                                placeholder="VD: Đã thay ống xả nước và bơm ga đầy đủ..."
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                                Chi phí sửa chữa (VNĐ)
                              </label>
                              <input
                                type="number"
                                value={repairCost}
                                onChange={(e) => setRepairCost(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setActioningTicket(null)} className="px-3 py-1.5 text-xs text-[#64748B]">Hủy</button>
                              <button
                                onClick={() => handleUpdateMaintenanceStatus('RESOLVED')}
                                className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg"
                              >
                                Đánh dấu đã sửa xong
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Modal Confirm Ticket for Tenant */}
                  {confirmingTicket && (
                    <div className="fixed inset-0 z-50 bg-[#0F172A]/40 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-clay-primary space-y-4">
                        <h4 className="font-bold text-base text-[#0F172A]">
                          Nghiệm thu sự cố: {confirmingTicket.title}
                        </h4>
                        <div>
                          <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                            Mức độ hài lòng (1 - 5 sao)
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setTenantRating(st)}
                                className={`p-1.5 rounded-lg border ${tenantRating >= st ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-slate-50 text-slate-400'}`}
                              >
                                <Star className={`w-5 h-5 ${tenantRating >= st ? 'fill-amber-400' : ''}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                            Nhận xét về chất lượng sửa chữa
                          </label>
                          <textarea
                            rows={2}
                            placeholder="VD: Thợ đến đúng giờ, xử lý nhanh và sạch sẽ..."
                            value={tenantFeedback}
                            onChange={(e) => setTenantFeedback(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setConfirmingTicket(null)} className="px-3 py-1.5 text-xs text-[#64748B]">Hủy</button>
                          <button
                            onClick={handleConfirmMaintenance}
                            className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg"
                          >
                            Xác nhận hoàn tất
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: GIA HẠN & TRẢ PHÒNG (RENEWAL & MOVE-OUT) */}
              {activeTab === 'renewal-moveout' && (
                <div className="space-y-6">
                  {/* Part 1: Lease Renewal */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-sm md:text-base text-[#0F172A]">Gia hạn hợp đồng thuê</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        lease.renewalStatus === 'Requested' ? 'bg-amber-100 text-amber-800' :
                        lease.renewalStatus === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        Trạng thái: {lease.renewalStatus || 'Chưa đề xuất'}
                      </span>
                    </div>

                    {lease.renewalStatus === 'Requested' ? (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                        <p className="text-xs text-amber-900">
                          Đã có đề xuất gia hạn hợp đồng đến ngày:{' '}
                          <span className="font-bold">{formatDate(lease.renewalProposedEndDate || '')}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRespondRenewal(true)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
                          >
                            Chấp thuận gia hạn
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRespondRenewal(false)}
                            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg"
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-[#64748B]">
                          Hợp đồng hiện tại kết thúc vào: <span className="font-bold text-[#0F172A]">{formatDate(lease.endDate)}</span>. 
                          Bạn có thể đề xuất ngày kết thúc mới để tiếp tục thuê.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Ngày kết thúc mới</label>
                            <input
                              type="date"
                              value={renewalDate}
                              onChange={(e) => setRenewalDate(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Ghi chú đề xuất</label>
                            <input
                              type="text"
                              value={renewalNotes}
                              onChange={(e) => setRenewalNotes(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRequestRenewal}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Gửi đề xuất gia hạn
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Part 2: Move-out Checkout & Deposit Settlement */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-rose-600" />
                        <h4 className="font-bold text-sm md:text-base text-[#0F172A]">
                          Thủ tục trả phòng & Quyết toán cọc an toàn
                        </h4>
                      </div>
                      {lease.moveOutRequestedAt && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          Đã báo trả: {formatDate(lease.moveOutDate || '')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Khi kết thúc kỳ thuê, hai bên thực hiện biên bản kiểm tra phòng. 
                      Sau khi khấu trừ các chi phí hợp lý (nếu có), số tiền cọc còn lại sẽ được hoàn tất quyết toán và phòng sẽ tự động mở lại trạng thái Còn trống để đón khách mới.
                    </p>

                    {/* Move-out request notification or input */}
                    {!lease.moveOutRequestedAt ? (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <h5 className="font-bold text-xs text-[#0F172A]">Thông báo kế hoạch trả phòng trước</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Ngày dự kiến trả phòng</label>
                            <input
                              type="date"
                              value={moveOutDate}
                              onChange={(e) => setMoveOutDate(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#0F172A] block mb-1">Lý do trả phòng</label>
                            <input
                              type="text"
                              value={moveOutReason}
                              onChange={(e) => setMoveOutReason(e.target.value)}
                              className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRequestMoveOut}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Gửi thông báo trả phòng
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                        <p className="font-bold">Đã tiếp nhận thông báo trả phòng</p>
                        <p>Ngày trả phòng dự kiến: {formatDate(lease.moveOutDate || '')} • Lý do: {lease.moveOutReason}</p>
                      </div>
                    )}

                    {/* Landlord Inspection & Deposit Checkout */}
                    {isLandlord && lease.status === 'Active' && (
                      <div className="pt-2">
                        {!isInspecting ? (
                          <button
                            type="button"
                            onClick={() => setIsInspecting(true)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Lập biên bản bàn giao & Quyết toán hoàn cọc
                          </button>
                        ) : (
                          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-4">
                            <h5 className="font-bold text-xs text-rose-900">
                              Biên bản kiểm tra phòng & Quyết toán hoàn tiền cọc
                            </h5>
                            <div>
                              <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                                Kết quả kiểm tra hiện trạng bàn giao
                              </label>
                              <textarea
                                rows={2}
                                value={inspectionNotes}
                                onChange={(e) => setInspectionNotes(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                                  Khấu trừ hư hại / dịch vụ tồn đọng (VNĐ)
                                </label>
                                <input
                                  type="number"
                                  value={deductionsAmount}
                                  onChange={(e) => setDeductionsAmount(Number(e.target.value))}
                                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                                  Lý do khấu trừ (nếu có)
                                </label>
                                <input
                                  type="text"
                                  placeholder="VD: Phí giặt rèm, sơn lại 1 mảng tường..."
                                  value={deductionReason}
                                  onChange={(e) => setDeductionReason(e.target.value)}
                                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                                />
                              </div>
                            </div>

                            {/* Settlement Summary Calculation */}
                            <div className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[#64748B] block">Tiền cọc ban đầu: {lease.deposit.toLocaleString('vi-VN')} đ</span>
                                <span className="text-rose-600 block">Khấu trừ: -{Number(deductionsAmount || 0).toLocaleString('vi-VN')} đ</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[#64748B] text-[11px] block">Số tiền cọc thực hoàn trả</span>
                                <span className="text-base font-bold text-emerald-600">
                                  {calculatedSettlement.toLocaleString('vi-VN')} đ
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsInspecting(false)}
                                className="px-3 py-1.5 text-xs text-[#64748B]"
                              >
                                Đóng
                              </button>
                              <button
                                type="button"
                                onClick={handleCompleteMoveOutInspection}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
                              >
                                Xác nhận hoàn cọc & Chấm dứt hợp đồng
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] flex justify-end bg-[#F8FAFC] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}
