import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { leasesApi, type LeaseContractResponse } from '../../services/api';
import { toast } from 'sonner';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  MessageSquare, 
  ShieldCheck, 
  X, 
  PenTool, 
  Wrench, 
  Eye, 
  FileCheck,
  Paperclip,
  ExternalLink,
  RefreshCw,
  FileDown,
  RotateCcw
} from 'lucide-react';
import PostRentalModal from '../../components/transaction/PostRentalModal';
import PrintContractModal from '../../components/transaction/PrintContractModal';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motion';

export default function TenantLeases() {
  const navigate = useNavigate();
  const [leases, setLeases] = useState<LeaseContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'ended'>('all');

  // Modal states
  const [signingLease, setSigningLease] = useState<LeaseContractResponse | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmittingSign, setIsSubmittingSign] = useState(false);

  // Canvas drawing state
  const [signMethod, setSignMethod] = useState<'draw' | 'type'>('draw');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [viewingLease, setViewingLease] = useState<LeaseContractResponse | null>(null);
  const [managingRental, setManagingRental] = useState<LeaseContractResponse | null>(null);
  const [printingLease, setPrintingLease] = useState<LeaseContractResponse | null>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (signingLease) setSigningLease(null);
        if (viewingLease) setViewingLease(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [signingLease, viewingLease]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#00153D';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleOpenSign = (lease: LeaseContractResponse) => {
    setSigningLease(lease);
    setSignatureName(lease.tenantName || '');
    setAgreedTerms(false);
    setHasDrawn(false);
    setSignMethod('draw');
    setTimeout(() => {
      clearCanvas();
    }, 60);
  };

  const handleSignConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingLease) return;
    if (!agreedTerms) {
      toast.error('Vui lòng đồng ý với các điều khoản của hợp đồng.');
      return;
    }

    let finalSignature = '';
    if (signMethod === 'draw') {
      if (!hasDrawn || !canvasRef.current) {
        toast.error('Vui lòng vẽ chữ ký của bạn trên bảng vẽ.');
        return;
      }
      finalSignature = canvasRef.current.toDataURL('image/png');
    } else {
      if (!signatureName.trim()) {
        toast.error('Vui lòng nhập đầy đủ họ và tên của bạn để xác nhận.');
        return;
      }
      finalSignature = signatureName.trim();
    }

    try {
      setIsSubmittingSign(true);
      await leasesApi.signLease(signingLease.id, {
        signatureData: finalSignature,
        agreedToTerms: true
      });
      toast.success('Đã ký hợp đồng thành công! Hợp đồng đã có hiệu lực.');
      setSigningLease(null);
      fetchLeases();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể hoàn tất ký hợp đồng vào lúc này.');
    } finally {
      setIsSubmittingSign(false);
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đang hiệu lực
          </span>
        );
      case 'PendingSignature':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Chờ bạn ký nhận
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Bản nháp
          </span>
        );
      case 'Terminated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Đã chấm dứt
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Đã hết hạn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#00153D] tracking-tight">Hợp đồng thuê phòng của tôi</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Quản lý hợp đồng thuê phòng, ký hợp đồng online và xem lịch sử thanh toán.
          </p>
        </div>

        <button
          onClick={fetchLeases}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#00153D] rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
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
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'pending' 
              ? 'bg-amber-500 text-white shadow-sm' 
              : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Cần ký điện tử ({leases.filter(l => l.status === 'PendingSignature' || l.status === 'Draft').length})
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
          Đang hiệu lực ({leases.filter(l => l.status === 'Active').length})
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
          <h3 className="text-lg font-bold text-[#0F172A]">Chưa có hợp đồng nào trong mục này</h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            Sau khi hồ sơ được chấp thuận, chủ trọ sẽ tạo hợp đồng để bạn xem và ký tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredLeases.map(lease => {
            const isNeedSign = lease.status === 'PendingSignature' && !lease.tenantSigned;

            return (
              <div 
                key={lease.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 md:p-6 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md space-y-5"
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
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base md:text-lg text-[#0F172A] hover:text-blue-600 cursor-pointer">
                          {lease.roomTitle}
                        </h2>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">{lease.roomAddress}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#475569]">
                        <span className="font-medium">Chủ nhà: {lease.landlordName}</span>
                        {lease.landlordPhone && (
                          <span className="text-[#94A3B8]">• SĐT: {lease.landlordPhone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                    {getStatusBadge(lease.status)}
                    <span className="text-[11px] text-[#94A3B8]">
                      Khởi tạo ngày: {formatDate(lease.createdAt)}
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
                    <span className="text-[#64748B] block">Chu kỳ thanh toán:</span>
                    <span className="font-medium text-[#0F172A]">
                      {lease.paymentCycleMonths} tháng / lần
                    </span>
                  </div>
                </div>

                {/* Important Notice for Pending Signature */}
                {isNeedSign && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900">
                      <p className="font-bold">Hợp đồng đang chờ bạn ký điện tử</p>
                      <p className="mt-0.5 text-amber-800">
                        Vui lòng kiểm tra kỹ các điều khoản và bấm nút "Ký hợp đồng điện tử" để kích hoạt hợp đồng thuê phòng chính thức.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
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
                      onClick={() => setPrintingLease(lease)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold rounded-lg transition-colors"
                      title="Xuất file PDF hoặc in hợp đồng"
                    >
                      <FileDown className="w-3.5 h-3.5 text-blue-700" />
                      Xuất PDF / In
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/tenant/chat', {
                        state: {
                          targetUserId: lease.landlordId,
                          targetUserName: lease.landlordName,
                          targetUserRole: 'Landlord'
                        }
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#00153D] text-xs font-semibold rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Nhắn tin chủ trọ
                    </button>
                  </div>

                  {isNeedSign ? (
                    <button
                      type="button"
                      onClick={() => handleOpenSign(lease)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] shadow-sm hover:shadow"
                    >
                      <PenTool className="w-4 h-4" />
                      Ký hợp đồng điện tử ngay
                    </button>
                  ) : lease.status === 'Active' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setManagingRental(lease)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        <Wrench className="w-3.5 h-3.5 text-blue-600" />
                        Quản lý thuê phòng (Hóa đơn, Báo sự cố, Trả phòng)
                      </button>
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Hợp đồng bảo vệ quyền lợi
                      </div>
                    </div>
                  ) : null}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Signing Modal */}
      {createPortal(
        <AnimatePresence>
          {signingLease && (
            <motion.div
              key="signing-lease-modal"
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSigningLease(null)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-xs p-4 overflow-y-auto"
            >
              <motion.div
                variants={modalContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="signing-lease-title"
                className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col max-h-[min(90vh,680px)] overflow-hidden border border-[#E2E8F0] motion-gpu my-auto"
              >
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0] bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <h3 id="signing-lease-title" className="font-bold text-base text-[#00153D]">Ký kết hợp đồng thuê phòng</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSigningLease(null)}
                    className="p-1 rounded-lg text-[#94A3B8] hover:text-[#00153D] hover:bg-[#F1F5F9] transition-colors"
                    aria-label="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSignConfirm} className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs text-[#475569]">
                    <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                      <p><span className="font-semibold text-[#00153D]">Phòng thuê:</span> {signingLease.roomTitle}</p>
                      <p><span className="font-semibold text-[#00153D]">Địa chỉ:</span> {signingLease.roomAddress}</p>
                      <p><span className="font-semibold text-[#00153D]">Bên cho thuê (Chủ trọ):</span> {signingLease.landlordName}</p>
                      <p><span className="font-semibold text-[#00153D]">Giá thuê hàng tháng:</span> <span className="font-bold text-emerald-700">{signingLease.monthlyRent.toLocaleString('vi-VN')} đ/tháng</span></p>
                      <p><span className="font-semibold text-[#00153D]">Tiền đặt cọc:</span> {signingLease.deposit.toLocaleString('vi-VN')} đ</p>
                      <p><span className="font-semibold text-[#00153D]">Thời hạn thuê:</span> {formatDate(signingLease.startDate)} đến {formatDate(signingLease.endDate)}</p>
                    </div>

                    {signingLease.termsAndConditions && (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="font-bold text-[#00153D] mb-1.5">Điều khoản & Quy định của chủ trọ:</p>
                        <p className="whitespace-pre-line text-[#64748B] max-h-36 overflow-y-auto pr-1">{signingLease.termsAndConditions}</p>
                      </div>
                    )}

                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#00153D] block text-xs">
                          Chữ ký điện tử của bạn:
                        </label>
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setSignMethod('draw')}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                              signMethod === 'draw' ? 'bg-white text-[#00153D] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            Vẽ chữ ký tay
                          </button>
                          <button
                            type="button"
                            onClick={() => setSignMethod('type')}
                            className={`px-2.5 py-1 rounded-md transition-colors ${
                              signMethod === 'type' ? 'bg-white text-[#00153D] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            Nhập họ tên
                          </button>
                        </div>
                      </div>

                      {signMethod === 'draw' ? (
                        <div className="space-y-1.5">
                          <div className="relative border border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner">
                            <canvas
                              ref={canvasRef}
                              width={500}
                              height={140}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="w-full h-32 touch-none cursor-crosshair bg-white"
                            />
                            {!hasDrawn && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                                Dùng chuột hoặc ngón tay vẽ chữ ký vào đây
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={clearCanvas}
                              className="absolute top-2 right-2 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors"
                              title="Xóa vẽ lại"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Vẽ lại</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-[#64748B]">
                            Nét vẽ chữ ký sẽ được nhúng niêm phong vào hợp đồng PDF kèm mã băm SHA-256 bảo đảm tính pháp lý.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            placeholder="Ví dụ: NGUYỄN VĂN AN"
                            className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl font-semibold text-sm focus:outline-none focus:border-[#00153D] focus:ring-1 focus:ring-[#00153D]"
                          />
                          <p className="text-[11px] text-[#64748B]">
                            Bằng việc nhập họ tên và xác nhận, chữ ký điện tử của bạn sẽ được lưu vết kèm mốc thời gian và địa chỉ IP.
                          </p>
                        </div>
                      )}
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="w-4 h-4 rounded text-[#00153D] mt-0.5"
                      />
                      <span className="text-[11px] text-[#475569]">
                        Tôi xác nhận đã đọc, hiểu rõ quyền và nghĩa vụ và đồng ý tuân thủ toàn bộ các điều khoản trong hợp đồng thuê phòng trên nền tảng DORMI.
                      </span>
                    </label>
                  </div>

                  <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSigningLease(null)}
                      disabled={isSubmittingSign}
                      className="px-4 py-2 border border-[#CBD5E1] text-[#475569] font-semibold text-xs rounded-xl hover:bg-white transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingSign || !agreedTerms}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] flex items-center gap-2"
                    >
                      {isSubmittingSign ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang ký...
                        </>
                      ) : (
                        <>
                          <PenTool className="w-3.5 h-3.5" />
                          Xác nhận ký kết
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Viewing Details Modal */}
      {createPortal(
        <AnimatePresence>
          {viewingLease && (
            <motion.div
              key="view-lease-modal"
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setViewingLease(null)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-xs p-4 overflow-y-auto"
            >
              <motion.div
                variants={modalContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="viewing-lease-title"
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[min(90vh,720px)] overflow-hidden border border-[#E2E8F0] motion-gpu my-auto"
              >
                <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0] bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#073372]" />
                    <h3 id="viewing-lease-title" className="font-bold text-base text-[#00153D]">Chi tiết hợp đồng #{viewingLease.id.slice(0, 8)}</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setViewingLease(null)}
                    className="p-1 rounded-lg text-[#94A3B8] hover:text-[#00153D] hover:bg-[#F1F5F9] transition-colors"
                    aria-label="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs text-[#475569]">
                  <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <div>
                      <span className="text-[11px] text-[#64748B] block">Trạng thái hợp đồng</span>
                      <div className="mt-1">{getStatusBadge(viewingLease.status)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#64748B] block">Ngày tạo</span>
                      <span className="font-semibold text-[#00153D]">{formatDate(viewingLease.createdAt)}</span>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-[#00153D] block mb-1">Bên A: Bên Cho Thuê (Chủ nhà)</span>
                      <p><span className="text-[#64748B]">Họ tên:</span> {viewingLease.landlordName}</p>
                      <p><span className="text-[#64748B]">Email:</span> {viewingLease.landlordEmail}</p>
                      <p><span className="text-[#64748B]">Số điện thoại:</span> {viewingLease.landlordPhone || 'Chưa cung cấp'}</p>
                      <p className="mt-1.5 text-[11px] text-emerald-700 font-medium">
                        {viewingLease.landlordSigned ? `Chủ nhà đã ký (${formatDate(viewingLease.landlordSignedAt || '')})` : 'Chưa ký'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-[#00153D] block mb-1">Bên B: Bên Thuê (Khách thuê)</span>
                      <p><span className="text-[#64748B]">Họ tên:</span> {viewingLease.tenantName}</p>
                      <p><span className="text-[#64748B]">Email:</span> {viewingLease.tenantEmail}</p>
                      <p><span className="text-[#64748B]">Số điện thoại:</span> {viewingLease.tenantPhone || 'Chưa cung cấp'}</p>
                      <p className="mt-1.5 text-[11px] font-medium">
                        {viewingLease.tenantSigned ? (
                          <span className="text-emerald-700">Đã ký điện tử: {viewingLease.tenantSignatureData} ({formatDate(viewingLease.tenantSignedAt || '')})</span>
                        ) : (
                          <span className="text-amber-700">Chưa ký</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Room & Terms */}
                  <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                    <span className="font-bold text-[#00153D] block">Thông tin phòng & Chi phí:</span>
                    <p><span className="text-[#64748B]">Phòng thuê:</span> {viewingLease.roomTitle}</p>
                    <p><span className="text-[#64748B]">Địa chỉ:</span> {viewingLease.roomAddress}</p>
                    <p><span className="text-[#64748B]">Tiền thuê:</span> <span className="font-bold text-emerald-700">{viewingLease.monthlyRent.toLocaleString('vi-VN')} đ/tháng</span></p>
                    <p><span className="text-[#64748B]">Tiền cọc:</span> {viewingLease.deposit.toLocaleString('vi-VN')} đ</p>
                    <p><span className="text-[#64748B]">Chu kỳ thanh toán:</span> {viewingLease.paymentCycleMonths} tháng / lần</p>
                    <p><span className="text-[#64748B]">Thời gian thuê:</span> {formatDate(viewingLease.startDate)} - {formatDate(viewingLease.endDate)}</p>
                    {viewingLease.utilitiesDescription && (
                      <p><span className="text-[#64748B]">Chi phí dịch vụ (Điện, nước, internet):</span> {viewingLease.utilitiesDescription}</p>
                    )}
                  </div>

                  {viewingLease.termsAndConditions && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-[#00153D] block mb-1">Điều khoản & Nội quy:</span>
                      <p className="whitespace-pre-line text-[#64748B]">{viewingLease.termsAndConditions}</p>
                    </div>
                  )}

                  {/* Documents */}
                  {viewingLease.documents && viewingLease.documents.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-[#00153D] block">Tài liệu & Tệp hợp đồng đính kèm:</span>
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
                              <Paperclip className="w-4 h-4 text-[#073372]" />
                              <span className="font-medium text-[#00153D]">{doc.title || doc.documentType}</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const l = viewingLease;
                      setViewingLease(null);
                      setPrintingLease(l);
                    }}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-[#00153D] border border-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <FileDown className="w-4 h-4 text-[#00153D]" />
                    <span>Xuất file PDF / In hợp đồng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingLease(null)}
                    className="px-5 py-2 bg-[#00153D] text-white font-semibold rounded-xl text-xs hover:bg-[#073372] transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Post-Rental Lifecycle Management Modal */}
      <AnimatePresence>
        {managingRental && (
          <PostRentalModal
            lease={managingRental}
            isLandlord={false}
            onClose={() => setManagingRental(null)}
            onRefresh={fetchLeases}
          />
        )}
      </AnimatePresence>

      {/* Printable Contract Modal */}
      {printingLease && (
        <PrintContractModal
          lease={printingLease}
          onClose={() => setPrintingLease(null)}
        />
      )}

    </div>
  );
}
