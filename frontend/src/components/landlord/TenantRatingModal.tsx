import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
import { tenantReviewsApi, getLeaseDurationText } from '../../services/api';
import { toast } from 'sonner';
import { Star, X, UserCheck, AlertCircle } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motion';

interface TenantRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLeaseId?: string;
  onSuccess?: () => void;
}

export function TenantRatingModal({
  isOpen,
  onClose,
  initialLeaseId,
  onSuccess
}: TenantRatingModalProps) {
  const [leases, setLeases] = useState<any[]>([]);
  const [loadingLeases, setLoadingLeases] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>(initialLeaseId || '');
  const [rating, setRating] = useState<number>(5);
  const [punctualityScore, setPunctualityScore] = useState<number>(5);
  const [cleanlinessScore, setCleanlinessScore] = useState<number>(5);
  const [respectScore, setRespectScore] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    setLoadingLeases(true);
    tenantReviewsApi.getMyLeases()
      .then(res => {
        if (Array.isArray(res)) {
          setLeases(res);
          if (res.length > 0 && !selectedLeaseId) {
            setSelectedLeaseId(initialLeaseId || res[0].id);
          }
        }
      })
      .catch(err => {
        console.warn('Failed to load leases for rating:', err);
      })
      .finally(() => {
        setLoadingLeases(false);
      });

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, initialLeaseId, onClose]);

  const currentLease = leases.find(l => l.id === selectedLeaseId) || leases[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLease) {
      toast.error('Vui lòng chọn hợp đồng thuê của khách cần đánh giá.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét chi tiết về khách thuê.');
      return;
    }

    try {
      setSubmitting(true);
      await tenantReviewsApi.rateTenant({
        tenantId: currentLease.tenantId,
        leaseContractId: currentLease.id,
        leaseId: currentLease.id,
        rating,
        punctualityScore,
        cleanlinessScore,
        respectScore,
        comment: comment.trim(),
        isAnonymous
      });

      toast.success('Đã gửi đánh giá khách thuê!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi đánh giá. Có thể bạn đã đánh giá hợp đồng này rồi.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tenant-rating-backdrop"
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs overflow-y-auto"
        >
          <motion.div
            key="tenant-rating-content"
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tenant-rating-title"
            className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] max-w-lg w-full p-6 space-y-6 overflow-hidden max-h-[90vh] flex flex-col motion-gpu my-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
              <div>
                <h3 id="tenant-rating-title" className="text-base font-bold text-[#00153D] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#073372]" />
                  Đánh giá uy tín khách thuê
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Góp phần xây dựng cộng đồng thuê trọ minh bạch và an toàn.
                </p>
              </div>
              <button 
                type="button" 
                onClick={onClose} 
                className="text-[#94A3B8] hover:text-[#00153D] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto flex-1 pr-1">
              {loadingLeases ? (
                <div className="py-8 text-center text-xs text-[#64748B]">Đang tải danh sách hợp đồng thuê...</div>
              ) : leases.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Chưa có hợp đồng thuê phòng</p>
                    <p className="mt-1">
                      Chỉ có thể đánh giá người thuê khi hai bên đã có hợp đồng thuê phòng (LeaseContract) được ký kết trên hệ thống DORMI.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Lease Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#00153D] block">
                      Chọn khách thuê / Hợp đồng
                    </label>
                    <select
                      value={selectedLeaseId}
                      onChange={e => setSelectedLeaseId(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#00153D] focus:outline-none focus:border-[#00153D] focus:ring-1 focus:ring-[#00153D]"
                    >
                      {leases.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.tenantName} - {l.roomTitle} ({getLeaseDurationText(l.startDate, l.endDate)}: {new Date(l.startDate).toLocaleDateString('vi-VN')} - {new Date(l.endDate).toLocaleDateString('vi-VN')})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Overall Rating (Stars) */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-semibold text-[#0F172A] block">
                      Đánh giá tổng quan ({rating}/5 sao)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-105 active:scale-95 transition-transform duration-150"
                        >
                          <Star 
                            className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

              {/* Detailed Metrics */}
              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <p className="text-caption font-bold text-[#0F172A]">Điểm thành phần (1 - 5 sao)</p>
                
                {/* Punctuality */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-caption text-[#475569] font-medium">Đúng hạn trả tiền phòng / quy tắc hẹn:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPunctualityScore(v)}
                        className="p-1 hover:scale-110 active:scale-95 transition-transform"
                        title={`${v} sao`}
                      >
                        <Star className={`w-5 h-5 ${v <= punctualityScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cleanliness */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-caption text-[#475569] font-medium">Giữ gìn vệ sinh không gian sống:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCleanlinessScore(v)}
                        className="p-1 hover:scale-110 active:scale-95 transition-transform"
                        title={`${v} sao`}
                      >
                        <Star className={`w-5 h-5 ${v <= cleanlinessScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Respectfulness */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-caption text-[#475569] font-medium">Tôn trọng nội quy & hàng xóm:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRespectScore(v)}
                        className="p-1 hover:scale-110 active:scale-95 transition-transform"
                        title={`${v} sao`}
                      >
                        <Star className={`w-5 h-5 ${v <= respectScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                <label className="text-xs font-semibold text-[#00153D] block">
                  Nhận xét khách quan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Ví dụ: Khách đóng tiền phòng rất đúng hẹn, giữ gìn phòng sạch sẽ và hòa đồng với mọi người..."
                  className="w-full bg-white border border-[#CBD5E1] rounded-xl p-3 text-xs text-[#00153D] placeholder-[#94A3B8] focus:outline-none focus:border-[#00153D] focus:ring-1 focus:ring-[#00153D] resize-none"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                />
                <label htmlFor="anonCheck" className="text-caption text-[#64748B] cursor-pointer">
                  Đánh giá ẩn danh (Ẩn tên chủ trọ để bảo vệ quyền riêng tư)
                </label>
              </div>
            </>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button type="button" variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            {leases.length > 0 && (
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            )}
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
