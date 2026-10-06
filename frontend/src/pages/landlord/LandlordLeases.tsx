import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { leasesApi, type LeaseContractResponse, type CreateLeasePayload } from '../../services/api';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  MessageSquare, 
  X, 
  Eye, 
  Ban, 
  ExternalLink, 
  Paperclip, 
  RefreshCw,
  UserCheck,
  Wrench
} from 'lucide-react';
import PostRentalModal from '../../components/transaction/PostRentalModal';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motion';

export default function LandlordLeases() {
  const location = useLocation();
  const navigate = useNavigate();

  const [leases, setLeases] = useState<LeaseContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'ended'>('all');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingLease, setViewingLease] = useState<LeaseContractResponse | null>(null);
  const [managingRental, setManagingRental] = useState<LeaseContractResponse | null>(null);
  const [terminatingLease, setTerminatingLease] = useState<LeaseContractResponse | null>(null);
  const [terminateReason, setTerminateReason] = useState('');
  const [isSubmittingTerminate, setIsSubmittingTerminate] = useState(false);

  // Create form state
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createForm, setCreateForm] = useState<{
    rentalApplicationId?: string;
    roomId: string;
    roomTitle: string;
    tenantId: string;
    tenantName: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    deposit: number;
    utilitiesDescription: string;
    termsAndConditions: string;
    paymentCycleMonths: number;
    contractDocumentUrl: string;
  }>({
    rentalApplicationId: undefined,
    roomId: '',
    roomTitle: '',
    tenantId: '',
    tenantName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyRent: 0,
    deposit: 0,
    utilitiesDescription: 'Điện: 3.500đ/kWh, Nước: 100.000đ/người/tháng, Internet: Miễn phí',
    termsAndConditions: '1. Thanh toán tiền phòng đúng hạn vào ngày 05 hàng tháng.\n2. Giữ gìn an ninh trật tự chung, không tụ tập quá 23h.\n3. Giữ gìn vệ sinh và thiết bị trong phòng bàn giao.',
    paymentCycleMonths: 1,
    contractDocumentUrl: ''
  });

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const res = await leasesApi.getMyLeases();
      if (Array.isArray(res)) {
        setLeases(res);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải danh sách hợp đồng thuê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  // Handle prefill from location state (e.g. from Approved Application)
  useEffect(() => {
    const prefillApp = location.state?.prefillApp;
    if (prefillApp) {
      const start = prefillApp.desiredMoveInDate 
        ? new Date(prefillApp.desiredMoveInDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      const durationMonths = prefillApp.leaseDurationMonths || 12;
      const endDateObj = new Date(start);
      endDateObj.setMonth(endDateObj.getMonth() + durationMonths);
      const end = endDateObj.toISOString().split('T')[0];

      setCreateForm(prev => ({
        ...prev,
        rentalApplicationId: prefillApp.id,
        roomId: prefillApp.roomId,
        roomTitle: prefillApp.roomTitle || '',
        tenantId: prefillApp.tenantId,
        tenantName: prefillApp.tenantName || '',
        startDate: start,
        endDate: end,
        monthlyRent: prefillApp.roomPrice || 0,
        deposit: prefillApp.roomPrice || 0
      }));
      setIsCreateOpen(true);
    }
  }, [location.state]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.roomId || !createForm.tenantId) {
      toast.error('Vui lòng cung cấp mã phòng và mã khách thuê.');
      return;
    }
    if (new Date(createForm.endDate) <= new Date(createForm.startDate)) {
      toast.error('Ngày kết thúc hợp đồng phải sau ngày bắt đầu.');
      return;
    }

    try {
      setIsSubmittingCreate(true);
      const payload: CreateLeasePayload = {
        rentalApplicationId: createForm.rentalApplicationId,
        roomId: createForm.roomId,
        tenantId: createForm.tenantId,
        startDate: new Date(createForm.startDate).toISOString(),
        endDate: new Date(createForm.endDate).toISOString(),
        monthlyRent: Number(createForm.monthlyRent),
        deposit: Number(createForm.deposit),
        utilitiesDescription: createForm.utilitiesDescription,
        termsAndConditions: createForm.termsAndConditions,
        paymentCycleMonths: Number(createForm.paymentCycleMonths) || 1,
        contractDocumentUrl: createForm.contractDocumentUrl || undefined
      };

      await leasesApi.createLease(payload);
      toast.success('Khởi tạo hợp đồng thuê thành công! Đã gửi thông báo cho khách thuê ký nhận.');
      setIsCreateOpen(false);
      fetchLeases();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo hợp đồng vào lúc này.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleTerminateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminatingLease) return;
    if (!terminateReason.trim()) {
      toast.error('Vui lòng nhập lý do chấm dứt hợp đồng.');
      return;
    }

    try {
      setIsSubmittingTerminate(true);
      await leasesApi.terminateLease(terminatingLease.id, {
        reason: terminateReason.trim()
      });
      toast.success('Đã chấm dứt hợp đồng thuê thành công. Phòng đã sẵn sàng đón khách mới.');
      setTerminatingLease(null);
      setTerminateReason('');
      fetchLeases();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể chấm dứt hợp đồng vào lúc này.');
    } finally {
      setIsSubmittingTerminate(false);
    }
  };

  const filteredLeases = leases.filter(l => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return l.status === 'Active';
    if (activeTab === 'pending') return l.status === 'PendingSignature' || l.status === 'Draft';
    if (activeTab === 'ended') return l.status === 'Terminated' || l.status === 'Expired';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đang thuê (Hiệu lực)
          </span>
        );
      case 'PendingSignature':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ khách ký
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Bản nháp
          </span>
        );
      case 'Terminated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Đã chấm dứt
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Đã hết hạn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Operating System
            </span>
            <span className="text-xs text-[#64748B]">Quản lý hợp đồng & dòng tiền thuê</span>
          </div>
          <h1 className="text-2xl font-black text-[#00153D] tracking-tight">Hợp đồng thuê phòng (Leases)</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Theo dõi tình trạng ký kết, thời hạn hợp đồng, lịch thanh toán và kích hoạt trạng thái phòng tự động.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchLeases}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#00153D] rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={() => {
              setCreateForm({
                rentalApplicationId: undefined,
                roomId: '',
                roomTitle: '',
                tenantId: '',
                tenantName: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                monthlyRent: 0,
                deposit: 0,
                utilitiesDescription: 'Điện: 3.500đ/kWh, Nước: 100.000đ/người/tháng, Internet: Miễn phí',
                termsAndConditions: '1. Thanh toán tiền phòng đúng hạn vào ngày 05 hàng tháng.\n2. Giữ gìn an ninh trật tự chung, không tụ tập quá 23h.\n3. Giữ gìn vệ sinh và thiết bị trong phòng bàn giao.',
                paymentCycleMonths: 1,
                contractDocumentUrl: ''
              });
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00153D] hover:bg-[#002266] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo hợp đồng mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'all' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Tất cả ({leases.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'active' 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Đang thuê ({leases.filter(l => l.status === 'Active').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'pending' 
              ? 'bg-amber-500 text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Chờ khách ký ({leases.filter(l => l.status === 'PendingSignature' || l.status === 'Draft').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ended')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'ended' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Đã kết thúc ({leases.filter(l => l.status === 'Terminated' || l.status === 'Expired').length})
        </button>
      </div>

      {/* Leases List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#64748B] space-y-3">
          <div className="w-8 h-8 border-3 border-[#00153D]/20 border-t-[#00153D] rounded-full animate-spin" />
          <p className="text-sm">Đang tải danh sách hợp đồng...</p>
        </div>
      ) : filteredLeases.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">Chưa có hợp đồng nào</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            Bạn có thể tạo hợp đồng mới trực tiếp hoặc duyệt hồ sơ ứng tuyển từ mục "Hồ sơ ứng tuyển" để tự động điền thông tin khách thuê.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredLeases.map(lease => {
            return (
              <div 
                key={lease.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 md:p-6 transition-all hover:shadow-md space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {lease.roomImageUrl ? (
                        <img src={lease.roomImageUrl} alt={lease.roomTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Building2 className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-base md:text-lg text-[#0F172A]">
                        {lease.roomTitle}
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">{lease.roomAddress}</p>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="font-bold text-[#00153D] flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          Khách thuê: {lease.tenantName}
                        </span>
                        {lease.tenantPhone && (
                          <span className="text-[#64748B]">• SĐT: {lease.tenantPhone}</span>
                        )}
                        <span className="text-[#94A3B8]">• {lease.tenantEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                    {getStatusBadge(lease.status)}
                    <span className="text-[11px] text-[#94A3B8]">
                      Khởi tạo: {formatDate(lease.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Contract Highlights */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]/60 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Giá thuê tháng:</span>
                    <span className="font-bold text-sm text-[#00153D]">
                      {lease.monthlyRent.toLocaleString('vi-VN')} đ/tháng
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Tiền đặt cọc:</span>
                    <span className="font-bold text-sm text-[#00153D]">
                      {lease.deposit.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Thời hạn hợp đồng:</span>
                    <span className="font-medium text-[#0F172A]">
                      {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Tình trạng ký kết:</span>
                    <span className={`font-semibold ${lease.tenantSigned ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {lease.tenantSigned ? 'Khách đã ký điện tử' : 'Đang chờ khách ký'}
                    </span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingLease(lease)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#00153D] text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Xem chi tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/landlord/chat', {
                        state: {
                          targetUserId: lease.tenantId,
                          targetUserName: lease.tenantName,
                          targetUserRole: 'Tenant',
                          targetRoomTitle: lease.roomTitle
                        }
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#00153D] text-xs font-semibold rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Nhắn tin khách
                    </button>
                  </div>

                  {lease.status === 'Active' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setManagingRental(lease)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        <Wrench className="w-3.5 h-3.5 text-blue-600" />
                        Vận hành sau thuê (Hóa đơn, Sự cố, Hoàn cọc)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTerminatingLease(lease);
                          setTerminateReason('');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Chấm dứt hợp đồng
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create Lease Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            key="create-lease-modal"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsCreateOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4 my-8 motion-gpu"
            >
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00153D]" />
                <h3 className="font-bold text-base text-[#0F172A]">Tạo hợp đồng thuê mới</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {createForm.rentalApplicationId && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dữ liệu được tự động điền từ Hồ sơ ứng tuyển đã duyệt!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0F172A] block">Mã phòng (Room ID): *</label>
                  <input
                    type="text"
                    required
                    value={createForm.roomId}
                    onChange={(e) => setCreateForm({ ...createForm, roomId: e.target.value })}
                    placeholder="Nhập GUID của phòng trọ"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600"
                  />
                  {createForm.roomTitle && (
                    <p className="text-[11px] text-blue-600 font-medium">Tên phòng: {createForm.roomTitle}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0F172A] block">Mã khách thuê (Tenant ID): *</label>
                  <input
                    type="text"
                    required
                    value={createForm.tenantId}
                    onChange={(e) => setCreateForm({ ...createForm, tenantId: e.target.value })}
                    placeholder="Nhập GUID của khách thuê"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600"
                  />
                  {createForm.tenantName && (
                    <p className="text-[11px] text-blue-600 font-medium">Khách thuê: {createForm.tenantName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0F172A] block">Ngày bắt đầu thuê: *</label>
                  <input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#0F172A] block">Ngày kết thúc hợp đồng: *</label>
                  <input
                    type="date"
                    required
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0F172A] block">Giá thuê tháng (VNĐ): *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={createForm.monthlyRent}
                    onChange={(e) => setCreateForm({ ...createForm, monthlyRent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600 font-bold text-[#00153D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0F172A] block">Tiền cọc (VNĐ): *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={createForm.deposit}
                    onChange={(e) => setCreateForm({ ...createForm, deposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600 font-bold text-[#00153D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0F172A] block">Chu kỳ thanh toán (tháng):</label>
                  <select
                    value={createForm.paymentCycleMonths}
                    onChange={(e) => setCreateForm({ ...createForm, paymentCycleMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600"
                  >
                    <option value={1}>1 tháng / lần</option>
                    <option value={3}>3 tháng / lần</option>
                    <option value={6}>6 tháng / lần</option>
                    <option value={12}>12 tháng / lần</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0F172A] block">Chi phí dịch vụ (Điện, nước, internet...):</label>
                <input
                  type="text"
                  value={createForm.utilitiesDescription}
                  onChange={(e) => setCreateForm({ ...createForm, utilitiesDescription: e.target.value })}
                  placeholder="Ví dụ: Điện 3.500đ/số, Nước 100k/người"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0F172A] block">Điều khoản & Quy định hợp đồng:</label>
                <textarea
                  rows={4}
                  value={createForm.termsAndConditions}
                  onChange={(e) => setCreateForm({ ...createForm, termsAndConditions: e.target.value })}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0F172A] block">Đường dẫn tệp hợp đồng PDF (tùy chọn):</label>
                <input
                  type="url"
                  value={createForm.contractDocumentUrl}
                  onChange={(e) => setCreateForm({ ...createForm, contractDocumentUrl: e.target.value })}
                  placeholder="https://example.com/contract.pdf"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmittingCreate}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#475569] font-semibold rounded-xl hover:bg-[#F8FAFC]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2 bg-[#00153D] hover:bg-[#002266] text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  {isSubmittingCreate ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      Khởi tạo hợp đồng
                    </>
                  )}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminate Modal */}
      <AnimatePresence>
        {terminatingLease && (
          <motion.div
            key="terminate-lease-modal"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setTerminatingLease(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4"
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 motion-gpu"
            >
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-[#0F172A]">Chấm dứt hợp đồng thuê</h3>
              </div>
              <button 
                onClick={() => setTerminatingLease(null)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Bạn đang yêu cầu chấm dứt hợp đồng cho phòng <span className="font-bold text-[#0F172A]">{terminatingLease.roomTitle}</span> của khách thuê <span className="font-bold text-[#0F172A]">{terminatingLease.tenantName}</span>. Phòng sẽ tự động chuyển về trạng thái Sẵn sàng đón khách mới.
            </p>

            <form onSubmit={handleTerminateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#0F172A] block">Lý do chấm dứt: *</label>
                <textarea
                  rows={3}
                  required
                  value={terminateReason}
                  onChange={(e) => setTerminateReason(e.target.value)}
                  placeholder="Ví dụ: Khách thanh lý hợp đồng trước hạn theo thỏa thuận / Đã hoàn tất hoàn trả cọc."
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setTerminatingLease(null)}
                  disabled={isSubmittingTerminate}
                  className="px-4 py-2 border border-[#CBD5E1] text-[#475569] font-semibold rounded-xl hover:bg-[#F8FAFC]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTerminate}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  {isSubmittingTerminate ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận chấm dứt'
                  )}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viewing Details Modal */}
      <AnimatePresence>
        {viewingLease && (
          <motion.div
            key="view-lease-modal"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setViewingLease(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4 my-8 motion-gpu"
            >
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-[#0F172A]">Chi tiết hợp đồng #{viewingLease.id.slice(0, 8)}</h3>
              </div>
              <button 
                onClick={() => setViewingLease(null)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#475569] max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="text-[11px] text-[#64748B] block">Trạng thái hợp đồng</span>
                  <div className="mt-1">{getStatusBadge(viewingLease.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#64748B] block">Ngày tạo</span>
                  <span className="font-semibold text-[#0F172A]">{formatDate(viewingLease.createdAt)}</span>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-[#0F172A] block mb-1">Bên A: Bên Cho Thuê (Chủ nhà)</span>
                  <p><span className="text-[#64748B]">Họ tên:</span> {viewingLease.landlordName}</p>
                  <p><span className="text-[#64748B]">Email:</span> {viewingLease.landlordEmail}</p>
                  <p><span className="text-[#64748B]">Số điện thoại:</span> {viewingLease.landlordPhone || 'Chưa cung cấp'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-[#0F172A] block mb-1">Bên B: Bên Thuê (Khách thuê)</span>
                  <p><span className="text-[#64748B]">Họ tên:</span> {viewingLease.tenantName}</p>
                  <p><span className="text-[#64748B]">Email:</span> {viewingLease.tenantEmail}</p>
                  <p><span className="text-[#64748B]">Số điện thoại:</span> {viewingLease.tenantPhone || 'Chưa cung cấp'}</p>
                  <p className="mt-1 text-[11px] font-medium">
                    {viewingLease.tenantSigned ? (
                      <span className="text-emerald-700">Đã ký: {viewingLease.tenantSignatureData} ({formatDate(viewingLease.tenantSignedAt || '')})</span>
                    ) : (
                      <span className="text-amber-700">Chưa ký</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Room & Terms */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <span className="font-bold text-[#0F172A] block">Thông tin phòng & Chi phí:</span>
                <p><span className="text-[#64748B]">Phòng thuê:</span> {viewingLease.roomTitle}</p>
                <p><span className="text-[#64748B]">Địa chỉ:</span> {viewingLease.roomAddress}</p>
                <p><span className="text-[#64748B]">Tiền thuê:</span> <span className="font-bold text-emerald-700">{viewingLease.monthlyRent.toLocaleString('vi-VN')} đ/tháng</span></p>
                <p><span className="text-[#64748B]">Tiền cọc:</span> {viewingLease.deposit.toLocaleString('vi-VN')} đ</p>
                <p><span className="text-[#64748B]">Chu kỳ thanh toán:</span> {viewingLease.paymentCycleMonths} tháng / lần</p>
                <p><span className="text-[#64748B]">Thời gian thuê:</span> {formatDate(viewingLease.startDate)} - {formatDate(viewingLease.endDate)}</p>
                {viewingLease.utilitiesDescription && (
                  <p><span className="text-[#64748B]">Chi phí dịch vụ:</span> {viewingLease.utilitiesDescription}</p>
                )}
              </div>

              {viewingLease.termsAndConditions && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-[#0F172A] block mb-1">Điều khoản & Quy định:</span>
                  <p className="whitespace-pre-line text-[#64748B]">{viewingLease.termsAndConditions}</p>
                </div>
              )}

              {viewingLease.terminatedAt && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                  <span className="font-bold block mb-1">Thông tin chấm dứt:</span>
                  <p>Thời điểm: {formatDate(viewingLease.terminatedAt)}</p>
                  <p>Lý do: {viewingLease.terminationReason}</p>
                </div>
              )}

              {/* Documents */}
              {viewingLease.documents && viewingLease.documents.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-[#0F172A] block">Tài liệu đính kèm:</span>
                  <div className="space-y-1.5">
                    {viewingLease.documents.map((doc, idx) => (
                      <a
                        key={doc.id || idx}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 bg-white border border-[#CBD5E1] rounded-xl hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-[#0F172A]">{doc.title || doc.documentType}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setViewingLease(null)}
                className="px-4 py-2 bg-[#00153D] text-white font-semibold rounded-xl text-xs hover:bg-[#002266]"
              >
                Đóng
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Rental Management Modal */}
      <AnimatePresence>
        {managingRental && (
          <PostRentalModal
            lease={managingRental}
            isLandlord={true}
            onClose={() => setManagingRental(null)}
            onRefresh={fetchLeases}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
